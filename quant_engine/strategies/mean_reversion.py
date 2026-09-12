"""
strategies/mean_reversion.py
=============================
Bollinger Band / Keltner Channel Mean-Reversion Strategy.

CORE LOGIC:
  In a ranging, low-ADX, mean-reverting market (CHOP_RANGING regime),
  prices oscillate between statistical boundaries. They cannot maintain
  extreme deviations for long before snapping back to the mean.

  This strategy exploits the "rubber band" effect:
  - Buy when price touches or pierces the LOWER Bollinger Band
    AND the Keltner Channel lower boundary (double confirmation)
  - Sell when price touches or pierces the UPPER Bollinger Band
    AND the Keltner Channel upper boundary

WHY DUAL BANDS (BOLLINGER + KELTNER)?
  When the Bollinger Bands are INSIDE the Keltner Channels → SQUEEZE.
  When the Bollinger Bands are OUTSIDE the Keltner Channels → EXPANSION.
  
  We ONLY take mean-reversion trades when we are NOT in a squeeze
  (BBs inside KCs), because mean reversion fails catastrophically when
  a squeeze resolves into a strong breakout.

ENTRY CONDITIONS — LONG:
  1. Regime is CHOP_RANGING (low ADX, Hurst < 0.45)
  2. Bollinger Bands are outside Keltner Channels (no squeeze)
  3. RSI(14) < 30 (oversold) — price is statistically stretched
  4. Close crosses BELOW the lower Bollinger Band (entry trigger)
  5. Next bar: Close moves back ABOVE the lower Bollinger Band (confirmation)

ENTRY CONDITIONS — SHORT (mirror):
  1-3. Same as above.
  4. Close crosses ABOVE the upper Bollinger Band.
  5. Next bar: Close moves back BELOW the upper Bollinger Band.

STOP LOSS:
  1.5× ATR(14) beyond the entry bar's extreme (low for longs, high for shorts).

TAKE PROFIT:
  Middle Bollinger Band (the 20-period SMA) — mean reversion target.
"""

from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
import pandas_ta as ta  # type: ignore

from strategies.base_strategy import BaseStrategy, SignalDirection, TradeSignal
from regime.volatility_model import compute_atr


class MeanReversionStrategy(BaseStrategy):
    """
    Bollinger/Keltner dual-band mean-reversion strategy.

    Compatible regimes: CHOP_RANGING
    Target timeframe:   15-minute primary
    """

    COMPATIBLE_REGIMES = ["CHOP_RANGING"]

    def __init__(self, config: dict) -> None:
        super().__init__(config)
        self._bb_period:     int   = 20
        self._bb_std:        float = 2.0
        self._kc_period:     int   = 20
        self._kc_mult:       float = 1.5
        self._rsi_period:    int   = 14
        self._rsi_oversold:  float = 30.0
        self._rsi_overbought: float = 70.0
        self._atr_period:    int   = 14
        self._atr_stop_mult: float = 1.5

    def get_regime_compatibility(self) -> list[str]:
        return self.COMPATIBLE_REGIMES

    def generate_signal(
        self,
        df: pd.DataFrame,
        symbol: str,
        regime_state: str,
        df_htf: Optional[pd.DataFrame] = None,
    ) -> TradeSignal:
        """Generate a mean-reversion entry signal at Bollinger Band extremes."""
        no_signal = TradeSignal(
            symbol=symbol,
            direction=SignalDirection.HOLD,
            strategy_id=self.strategy_id,
            regime_context=regime_state,
        )

        if regime_state not in self.COMPATIBLE_REGIMES:
            return no_signal

        if not self._require_min_bars(df, 60):
            return no_signal

        close = df["close"]
        high  = df["high"]
        low   = df["low"]

        # ── Bollinger Bands ───────────────────────────────────────────────
        bb = ta.bbands(close, length=self._bb_period, std=self._bb_std)
        if bb is None or bb.empty:
            return no_signal

        bb_lower_col  = [c for c in bb.columns if "BBL_" in c]
        bb_middle_col = [c for c in bb.columns if "BBM_" in c]
        bb_upper_col  = [c for c in bb.columns if "BBU_" in c]
        bb_width_col  = [c for c in bb.columns if "BBB_" in c]

        if not all([bb_lower_col, bb_middle_col, bb_upper_col]):
            return no_signal

        bb_lower  = bb[bb_lower_col[0]]
        bb_middle = bb[bb_middle_col[0]]
        bb_upper  = bb[bb_upper_col[0]]

        # ── Keltner Channels ──────────────────────────────────────────────
        kc = ta.kc(high, low, close, length=self._kc_period, scalar=self._kc_mult)
        if kc is None or kc.empty:
            return no_signal

        kc_lower_col = [c for c in kc.columns if "KCL" in c]
        kc_upper_col = [c for c in kc.columns if "KCU" in c]
        if not kc_lower_col or not kc_upper_col:
            return no_signal

        kc_lower = kc[kc_lower_col[0]]
        kc_upper = kc[kc_upper_col[0]]

        # ── Squeeze Detection — NO mean-reversion trades in squeeze ───────
        # Squeeze: BB lower > KC lower (BBs are inside KCs)
        bb_lower_now = self._latest(bb_lower)
        bb_upper_now = self._latest(bb_upper)
        kc_lower_now = self._latest(kc_lower)
        kc_upper_now = self._latest(kc_upper)

        in_squeeze = (bb_lower_now > kc_lower_now) and (bb_upper_now < kc_upper_now)
        if in_squeeze:
            return no_signal  # DO NOT take MR trades in a squeeze — breakout risk

        # ── RSI ───────────────────────────────────────────────────────────
        rsi = ta.rsi(close, length=self._rsi_period)
        if rsi is None:
            return no_signal

        current_rsi   = self._latest(rsi)
        current_close = float(close.iloc[-1])
        prev_close    = float(close.iloc[-2])
        bb_lower_prev = self._prev(bb_lower)
        bb_upper_prev = self._prev(bb_upper)
        bb_mid_now    = self._latest(bb_middle)

        # ── ATR for stop placement ────────────────────────────────────────
        atr_values = compute_atr(df, period=self._atr_period)
        current_atr = float(atr_values[-1]) if not np.isnan(atr_values[-1]) else 0.0
        if current_atr == 0:
            return no_signal

        # ── Long Entry: Price reverting from lower BB ─────────────────────
        # Previous bar closed BELOW lower BB (extreme stretch)
        # Current bar closed ABOVE lower BB (reversal confirmation)
        long_trigger = (
            prev_close < bb_lower_prev and      # Previous: below lower BB
            current_close > bb_lower_now and    # Current: recovered above lower BB
            current_rsi < self._rsi_oversold    # RSI confirms oversold
        )

        if long_trigger:
            stop_loss   = float(low.iloc[-1]) - (current_atr * self._atr_stop_mult)
            take_profit = bb_mid_now            # Target: revert to middle band
            risk        = current_close - stop_loss
            if risk <= 0 or take_profit <= current_close:
                return no_signal

            rr = (take_profit - current_close) / risk
            if rr < 1.0:  # Require at least 1:1 RRR for mean reversion
                return no_signal

            return TradeSignal(
                symbol=symbol,
                direction=SignalDirection.LONG,
                strategy_id=self.strategy_id,
                entry_price=current_close,
                stop_loss=round(stop_loss, 8),
                take_profit=round(take_profit, 8),
                risk_reward=round(rr, 2),
                confidence=self._compute_confidence(current_rsi, True),
                timeframe="15m",
                regime_context=regime_state,
                notes=(
                    f"Mean reversion LONG | RSI={current_rsi:.1f} | "
                    f"BB lower={bb_lower_now:.4f} | Target=BB mid={bb_mid_now:.4f}"
                ),
            )

        # ── Short Entry: Price reverting from upper BB ────────────────────
        short_trigger = (
            prev_close > bb_upper_prev and      # Previous: above upper BB
            current_close < bb_upper_now and    # Current: pulled back below upper BB
            current_rsi > self._rsi_overbought  # RSI confirms overbought
        )

        if short_trigger:
            stop_loss   = float(high.iloc[-1]) + (current_atr * self._atr_stop_mult)
            take_profit = bb_mid_now
            risk        = stop_loss - current_close
            if risk <= 0 or take_profit >= current_close:
                return no_signal

            rr = (current_close - take_profit) / risk
            if rr < 1.0:
                return no_signal

            return TradeSignal(
                symbol=symbol,
                direction=SignalDirection.SHORT,
                strategy_id=self.strategy_id,
                entry_price=current_close,
                stop_loss=round(stop_loss, 8),
                take_profit=round(take_profit, 8),
                risk_reward=round(rr, 2),
                confidence=self._compute_confidence(current_rsi, False),
                timeframe="15m",
                regime_context=regime_state,
                notes=(
                    f"Mean reversion SHORT | RSI={current_rsi:.1f} | "
                    f"BB upper={bb_upper_now:.4f} | Target=BB mid={bb_mid_now:.4f}"
                ),
            )

        return no_signal

    def _compute_confidence(self, rsi: float, is_long: bool) -> float:
        """Score 0–1 based on RSI depth into the extreme zone."""
        if is_long:
            if rsi <= 20:
                return 1.0
            if rsi <= 25:
                return 0.8
            if rsi <= 30:
                return 0.6
            return 0.4
        else:
            if rsi >= 80:
                return 1.0
            if rsi >= 75:
                return 0.8
            if rsi >= 70:
                return 0.6
            return 0.4
