"""
regime/regime_engine.py
========================
Market Regime Classification Engine.

WHAT THIS DOES:
  Synthesizes multiple independent statistical signals into a single,
  actionable market regime label that tells the strategy engine:
  - WHAT kind of market we are in right now
  - WHICH strategy has edge in this environment
  - HOW MUCH capital to risk (volatility-adjusted allocation multiplier)

THE 4-STATE REGIME MODEL:
  ┌─────────────────────┬──────────────────────────┬─────────────────────┐
  │ Regime State        │ Conditions               │ Strategy Active     │
  ├─────────────────────┼──────────────────────────┼─────────────────────┤
  │ BULL_MOMENTUM       │ H>0.55, ADX>25, EMA↑     │ Trend Pullback Buys │
  │ BEAR_MOMENTUM       │ H>0.55, ADX>25, EMA↓     │ Breakdown Shorts    │
  │ CHOP_RANGING        │ H<0.45, ADX<20           │ Mean Reversion      │
  │ HIGH_VOL_CHAOS      │ Vol z-score > 2.0        │ Cash / Min size     │
  └─────────────────────┴──────────────────────────┴─────────────────────┘

SIGNAL INPUTS (computed on each new closed bar):
  1. Hurst Exponent (H) — time series memory/persistence
  2. ADX — trend strength (regardless of direction)
  3. EMA alignment (fast vs slow) — directional bias
  4. Yang-Zhang Volatility — absolute and relative to historical norm
  5. Bollinger Band Width — squeeze detection (pre-breakout coiling)

MULTI-TIMEFRAME HIERARCHY:
  The regime is computed on the HIGH TIMEFRAME (4H/Daily) first.
  The primary trading timeframe (15m/1H) signals are only accepted
  if they agree with the higher timeframe directional bias.
  This eliminates counter-trend trades during strong macro moves.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

import numpy as np
import pandas as pd
import pandas_ta as ta  # type: ignore

from regime.hurst_exponent import compute_hurst_exponent, classify_hurst
from regime.volatility_model import (
    yang_zhang_volatility,
    classify_volatility_state,
    compute_atr,
    compute_bollinger_bandwidth,
)


# ---------------------------------------------------------------------------
# Regime State Enum
# ---------------------------------------------------------------------------

class RegimeState(str, Enum):
    BULL_MOMENTUM  = "BULL_MOMENTUM"    # Strong uptrend → trend following longs
    BEAR_MOMENTUM  = "BEAR_MOMENTUM"    # Strong downtrend → trend following shorts
    CHOP_RANGING   = "CHOP_RANGING"     # Sideways → mean reversion
    HIGH_VOL_CHAOS = "HIGH_VOL_CHAOS"   # Extreme volatility → minimal exposure
    SQUEEZE        = "SQUEEZE"          # Low BBW coiling → breakout imminent
    UNKNOWN        = "UNKNOWN"          # Insufficient data


# ---------------------------------------------------------------------------
# Regime Result
# ---------------------------------------------------------------------------

@dataclass
class RegimeResult:
    """
    Full regime analysis result for a symbol at a point in time.
    """
    state: RegimeState
    hurst: float
    hurst_label: str       # "TRENDING" | "MEAN_REVERTING" | "RANDOM_WALK"
    adx: float
    volatility: float      # Annualized Yang-Zhang volatility %
    volatility_state: str  # "HIGH_VOL" | "NORMAL_VOL" | "LOW_VOL_SQUEEZE"
    bbw: float             # Bollinger Band Width
    ema_fast: float        # Current fast EMA value
    ema_slow: float        # Current slow EMA value
    ema_aligned_bull: bool # True if fast EMA > slow EMA (bullish)
    capital_multiplier: float  # Risk capital allocation multiplier (0 to 1)
    allowed_strategies: list[str]  # Strategy names valid for this regime
    timestamp: datetime

    def is_tradeable(self) -> bool:
        """Returns False if the regime is too dangerous to trade."""
        return self.state not in (RegimeState.HIGH_VOL_CHAOS, RegimeState.UNKNOWN)


# ---------------------------------------------------------------------------
# Regime Engine
# ---------------------------------------------------------------------------

class RegimeEngine:
    """
    Computes the market regime for any symbol given its OHLCV DataFrame.

    Usage:
        engine = RegimeEngine(config)

        # After each new bar closes:
        df = data_router.get_ohlcv_buffer("BTC/USDT", "4h").to_dataframe()
        result = engine.compute(df, symbol="BTC/USDT")

        print(result.state)               # RegimeState.BULL_MOMENTUM
        print(result.capital_multiplier)  # 1.0
        print(result.allowed_strategies)  # ["trend_following"]
    """

    def __init__(self, config: dict) -> None:
        regime_cfg = config.get("regime", {})

        self._hurst_lookback:  int   = regime_cfg.get("hurst_lookback", 100)
        self._trending_thresh: float = regime_cfg.get("hurst_trending_threshold", 0.55)
        self._reverting_thresh: float = regime_cfg.get("hurst_reverting_threshold", 0.45)
        self._vol_lookback:    int   = regime_cfg.get("volatility_lookback", 20)

        # EMA periods for directional bias
        self._ema_fast_period: int = 21
        self._ema_slow_period: int = 55

        # ADX thresholds
        self._adx_trending_threshold: float = 25.0
        self._adx_ranging_threshold:  float = 20.0

        # Volatility z-score thresholds
        self._high_vol_z: float = 2.0
        self._squeeze_z:  float = -1.0

        # Cache: last computed result per symbol
        self._cache: dict[str, RegimeResult] = {}

    def compute(
        self,
        df: pd.DataFrame,
        symbol: str,
        trading_periods: int = 252,
    ) -> RegimeResult:
        """
        Compute the current market regime from an OHLCV DataFrame.

        Args:
            df:              pandas DataFrame with columns:
                             open, high, low, close, volume.
                             Index must be DatetimeIndex (UTC), oldest first.
            symbol:          Symbol name (for caching/logging).
            trading_periods: Bars per year for volatility annualization
                             (252 stocks, 365 crypto, 260 forex).

        Returns:
            RegimeResult with full state breakdown.
        """
        min_bars = max(self._hurst_lookback, self._ema_slow_period + 10, 60)
        if len(df) < min_bars:
            return RegimeResult(
                state=RegimeState.UNKNOWN,
                hurst=0.5, hurst_label="RANDOM_WALK",
                adx=0.0, volatility=0.0, volatility_state="NORMAL_VOL",
                bbw=0.0, ema_fast=0.0, ema_slow=0.0,
                ema_aligned_bull=False, capital_multiplier=0.0,
                allowed_strategies=[],
                timestamp=datetime.now(timezone.utc),
            )

        closes = df["close"].to_numpy()

        # ── Signal 1: Hurst Exponent ─────────────────────────────────────
        lookback_closes = closes[-self._hurst_lookback:]
        H = compute_hurst_exponent(lookback_closes)
        hurst_label = classify_hurst(H, self._trending_thresh, self._reverting_thresh)

        # ── Signal 2: ADX (Trend Strength) ───────────────────────────────
        adx_df = ta.adx(df["high"], df["low"], df["close"], length=14)
        adx_val = 0.0
        if adx_df is not None and not adx_df.empty:
            adx_col = [c for c in adx_df.columns if "ADX_" in c]
            if adx_col:
                adx_val = float(adx_df[adx_col[0]].iloc[-1] or 0.0)

        # ── Signal 3: EMA Alignment (Directional Bias) ───────────────────
        ema_fast = float(
            ta.ema(df["close"], length=self._ema_fast_period).iloc[-1] or 0.0
        )
        ema_slow = float(
            ta.ema(df["close"], length=self._ema_slow_period).iloc[-1] or 0.0
        )
        ema_bullish = ema_fast > ema_slow

        # ── Signal 4: Yang-Zhang Volatility ──────────────────────────────
        yz_vol_array = yang_zhang_volatility(
            df, window=self._vol_lookback, trading_periods=trading_periods
        )
        # Remove NaN values
        yz_valid = yz_vol_array[~np.isnan(yz_vol_array)]
        current_vol = float(yz_valid[-1]) if len(yz_valid) > 0 else 0.0
        vol_mean = float(np.mean(yz_valid[-50:])) if len(yz_valid) >= 10 else current_vol
        vol_std  = float(np.std(yz_valid[-50:], ddof=1)) if len(yz_valid) >= 10 else 1.0
        vol_state = classify_volatility_state(
            current_vol, vol_mean, vol_std, self._high_vol_z, self._squeeze_z
        )

        # ── Signal 5: Bollinger Band Width (Squeeze Detection) ───────────
        bbw = compute_bollinger_bandwidth(closes, period=20, num_std=2.0)

        # ── Regime Classification Logic ───────────────────────────────────
        state, capital_mult, strategies = self._classify(
            hurst_label=hurst_label,
            adx=adx_val,
            ema_bullish=ema_bullish,
            vol_state=vol_state,
            bbw=bbw,
        )

        result = RegimeResult(
            state=state,
            hurst=H,
            hurst_label=hurst_label,
            adx=adx_val,
            volatility=current_vol,
            volatility_state=vol_state,
            bbw=bbw,
            ema_fast=ema_fast,
            ema_slow=ema_slow,
            ema_aligned_bull=ema_bullish,
            capital_multiplier=capital_mult,
            allowed_strategies=strategies,
            timestamp=datetime.now(timezone.utc),
        )

        self._cache[symbol] = result
        return result

    def get_cached(self, symbol: str) -> Optional[RegimeResult]:
        """Return the last computed regime for a symbol without recomputing."""
        return self._cache.get(symbol)

    def is_strategy_valid(
        self,
        strategy_type: str,
        regime: RegimeResult,
    ) -> bool:
        """
        Check if a given strategy type is valid for the current regime.

        Args:
            strategy_type: e.g. "trend_following", "mean_reversion", "breakout"
            regime:        The current RegimeResult.

        Returns:
            True if the strategy has statistical edge in this regime.
        """
        return strategy_type in regime.allowed_strategies

    # ── Private: Classification Logic ─────────────────────────────────────

    def _classify(
        self,
        hurst_label: str,
        adx: float,
        ema_bullish: bool,
        vol_state: str,
        bbw: float,
    ) -> tuple[RegimeState, float, list[str]]:
        """
        Combine all signals into a single regime classification.

        Returns:
            Tuple of (RegimeState, capital_multiplier, allowed_strategy_names)
        """
        # RULE 1: High volatility chaos → minimal exposure regardless of other signals
        if vol_state == "HIGH_VOL":
            return RegimeState.HIGH_VOL_CHAOS, 0.25, ["breakout"]

        # RULE 2: Squeeze condition → pre-breakout coiling
        # BBW below 0.03 (3%) indicates extreme compression
        if vol_state == "LOW_VOL_SQUEEZE" or bbw < 0.03:
            return RegimeState.SQUEEZE, 0.5, ["breakout"]

        # RULE 3: Strong trend (Hurst says trending + ADX confirms + EMA aligned)
        if hurst_label == "TRENDING" and adx >= self._adx_trending_threshold:
            if ema_bullish:
                return RegimeState.BULL_MOMENTUM, 1.0, ["trend_following"]
            else:
                return RegimeState.BEAR_MOMENTUM, 1.0, ["trend_following"]

        # RULE 4: Mean-reverting / choppy conditions
        if hurst_label == "MEAN_REVERTING" and adx < self._adx_ranging_threshold:
            return RegimeState.CHOP_RANGING, 0.6, ["mean_reversion"]

        # RULE 5: Mixed signals — reduce size and allow conservative strategies
        if hurst_label == "TRENDING" and adx < self._adx_trending_threshold:
            # Hurst says trend but ADX doesn't confirm yet — wait for confirmation
            if ema_bullish:
                return RegimeState.BULL_MOMENTUM, 0.5, ["trend_following"]
            else:
                return RegimeState.BEAR_MOMENTUM, 0.5, ["trend_following"]

        # DEFAULT: Random walk / no clear edge
        return RegimeState.CHOP_RANGING, 0.3, ["mean_reversion"]
