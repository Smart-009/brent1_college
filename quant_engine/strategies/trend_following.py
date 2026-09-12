"""
strategies/trend_following.py
==============================
Trend-Following Pullback Strategy.

CORE LOGIC:
  In a confirmed trending regime (BULL_MOMENTUM / BEAR_MOMENTUM), prices
  do not move in straight lines. They advance → pull back → continue.

  This strategy buys the PULLBACK during an UPTREND and sells the
  BOUNCE during a DOWNTREND. This gives a better entry price than
  chasing breakouts, and higher-probability setups.

ENTRY CONDITIONS — LONG (BULL_MOMENTUM regime only):
  1. Higher Timeframe (4H/1D): Price is above the 55 EMA (bullish bias confirmed).
  2. Primary Timeframe (15m):  RSI(14) pulled back below 50 (but not oversold < 35).
  3. Primary Timeframe (15m):  Price is above the 21 EMA (still in uptrend structure).
  4. Primary Timeframe (15m):  Stochastic %K crosses above %D from below 30 (momentum turn).
  5. Primary Timeframe (15m):  Volume on this bar > 20-bar average volume (confirmation).

ENTRY CONDITIONS — SHORT (BEAR_MOMENTUM regime only):
  Mirror of the above (RSI above 50 but not overbought, Stoch cross from above 70, etc.)

STOP LOSS:
  Placed at the most recent structural swing low (for longs) or swing high (for shorts),
  plus 0.5× ATR(14) buffer beyond the structure. This is a SYNTHETIC stop (never placed
  on the exchange order book) — stored in the bot's private memory only.

TAKE PROFIT:
  Set at 2× the risk distance from entry (Risk:Reward ≥ 2:1).
  Optional: partial exit at 1:1 RR (50% of position) to lock in profits.
"""

from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
import pandas_ta as ta  # type: ignore

from strategies.base_strategy import BaseStrategy, SignalDirection, TradeSignal
from regime.volatility_model import compute_atr


class TrendFollowingStrategy(BaseStrategy):
    """
    Trend pullback / momentum continuation strategy.

    Compatible regimes: BULL_MOMENTUM, BEAR_MOMENTUM
    Target timeframe:   15-minute primary, 4H higher timeframe filter
    """

    COMPATIBLE_REGIMES = ["BULL_MOMENTUM", "BEAR_MOMENTUM"]

    def __init__(self, config: dict) -> None:
        super().__init__(config)
        self._rsi_period: int   = 14
        self._rsi_long_max: float  = 50.0   # RSI must be below this for pullback long
        self._rsi_long_min: float  = 35.0   # RSI must be above this (not oversold)
        self._rsi_short_min: float = 50.0   # RSI must be above this for pullback short
        self._rsi_short_max: float = 65.0   # RSI must be below this (not overbought)
        self._ema_fast:   int  = 21
        self._ema_slow:   int  = 55
        self._stoch_k:    int  = 14
        self._stoch_d:    int  = 3
        self._stoch_smooth: int = 3
        self._volume_mult: float = 1.2     # Require volume > N × average
        self._atr_period:  int  = 14
        self._atr_stop_mult: float = 0.5   # Extra buffer beyond swing point
        self._rr_target:   float = 2.0     # Take-profit risk:reward ratio
        self._swing_lookback: int = 10     # Bars to look back for swing points

    def get_regime_compatibility(self) -> list[str]:
        return self.COMPATIBLE_REGIMES

    def generate_signal(
        self,
        df: pd.DataFrame,
        symbol: str,
        regime_state: str,
        df_htf: Optional[pd.DataFrame] = None,
    ) -> TradeSignal:
        """Generate a trend pullback entry signal."""
        no_signal = TradeSignal(
            symbol=symbol,
            direction=SignalDirection.HOLD,
            strategy_id=self.strategy_id,
            regime_context=regime_state,
        )

        # ── Regime gate ───────────────────────────────────────────────────
        if regime_state not in self.COMPATIBLE_REGIMES:
            return no_signal

        if not self._require_min_bars(df, 80):
            return no_signal

        is_bull = regime_state == "BULL_MOMENTUM"

        # ── Higher Timeframe Bias ─────────────────────────────────────────
        if df_htf is not None and len(df_htf) >= self._ema_slow:
            ema_slow_htf = ta.ema(df_htf["close"], length=self._ema_slow)
            if ema_slow_htf is not None and not ema_slow_htf.empty:
                htf_close = float(df_htf["close"].iloc[-1])
                htf_ema_slow = float(ema_slow_htf.iloc[-1])
                # Long: current price must be above HTF slow EMA
                if is_bull and htf_close < htf_ema_slow:
                    return no_signal
                # Short: current price must be below HTF slow EMA
                if not is_bull and htf_close > htf_ema_slow:
                    return no_signal

        # ── Primary Timeframe Indicators ──────────────────────────────────
        close  = df["close"]
        high   = df["high"]
        low    = df["low"]
        volume = df["volume"]

        rsi = ta.rsi(close, length=self._rsi_period)
        ema_fast = ta.ema(close, length=self._ema_fast)
        ema_slow = ta.ema(close, length=self._ema_slow)
        stoch = ta.stoch(
            high, low, close,
            k=self._stoch_k, d=self._stoch_d, smooth_k=self._stoch_smooth
        )
        atr_values = compute_atr(df, period=self._atr_period)

        if rsi is None or ema_fast is None or ema_slow is None or stoch is None:
            return no_signal

        # Get current bar values
        current_rsi     = self._latest(rsi)
        current_close   = float(close.iloc[-1])
        current_ema_fast = self._latest(ema_fast)
        current_ema_slow = self._latest(ema_slow)
        current_vol     = float(volume.iloc[-1])
        avg_vol         = float(volume.iloc[-20:].mean())
        current_atr     = float(atr_values[-1]) if not np.isnan(atr_values[-1]) else 0.0

        stoch_k_col = [c for c in stoch.columns if "STOCHk" in c]
        stoch_d_col = [c for c in stoch.columns if "STOCHd" in c]
        if not stoch_k_col or not stoch_d_col:
            return no_signal

        stoch_k_now  = self._latest(stoch[stoch_k_col[0]])
        stoch_k_prev = self._prev(stoch[stoch_k_col[0]])
        stoch_d_now  = self._latest(stoch[stoch_d_col[0]])
        stoch_d_prev = self._prev(stoch[stoch_d_col[0]])

        # ── Long Entry Conditions ─────────────────────────────────────────
        if is_bull:
            condition_price_in_trend = current_close > current_ema_fast > current_ema_slow
            condition_rsi_pullback   = self._rsi_long_min < current_rsi < self._rsi_long_max
            condition_stoch_cross_up = (
                stoch_k_now > stoch_d_now and     # K crossed above D
                stoch_k_prev <= stoch_d_prev and  # ... from below
                stoch_k_now < 50.0                # ... in lower half (pullback zone)
            )
            condition_volume_confirm = current_vol > avg_vol * self._volume_mult

            if not all([
                condition_price_in_trend,
                condition_rsi_pullback,
                condition_stoch_cross_up,
                condition_volume_confirm,
            ]):
                return no_signal

            # Stop: below the most recent swing low - ATR buffer
            swing_low = float(low.iloc[-self._swing_lookback:].min())
            stop_loss = swing_low - (current_atr * self._atr_stop_mult)
            risk = current_close - stop_loss
            if risk <= 0:
                return no_signal
            take_profit = current_close + (risk * self._rr_target)

            return TradeSignal(
                symbol=symbol,
                direction=SignalDirection.LONG,
                strategy_id=self.strategy_id,
                entry_price=current_close,
                stop_loss=round(stop_loss, 8),
                take_profit=round(take_profit, 8),
                risk_reward=self._rr_target,
                confidence=self._compute_confidence(
                    current_rsi, stoch_k_now, current_vol, avg_vol, is_bull
                ),
                timeframe="15m",
                regime_context=regime_state,
                notes=(
                    f"Trend pullback long | RSI={current_rsi:.1f} | "
                    f"Stoch K={stoch_k_now:.1f} | EMA21>{current_ema_fast:.2f}"
                ),
            )

        # ── Short Entry Conditions ────────────────────────────────────────
        else:
            condition_price_in_trend = current_close < current_ema_fast < current_ema_slow
            condition_rsi_bounce     = self._rsi_short_min < current_rsi < self._rsi_short_max
            condition_stoch_cross_dn = (
                stoch_k_now < stoch_d_now and     # K crossed below D
                stoch_k_prev >= stoch_d_prev and  # ... from above
                stoch_k_now > 50.0                # ... in upper half (bounce zone)
            )
            condition_volume_confirm = current_vol > avg_vol * self._volume_mult

            if not all([
                condition_price_in_trend,
                condition_rsi_bounce,
                condition_stoch_cross_dn,
                condition_volume_confirm,
            ]):
                return no_signal

            # Stop: above the most recent swing high + ATR buffer
            swing_high = float(high.iloc[-self._swing_lookback:].max())
            stop_loss  = swing_high + (current_atr * self._atr_stop_mult)
            risk = stop_loss - current_close
            if risk <= 0:
                return no_signal
            take_profit = current_close - (risk * self._rr_target)

            return TradeSignal(
                symbol=symbol,
                direction=SignalDirection.SHORT,
                strategy_id=self.strategy_id,
                entry_price=current_close,
                stop_loss=round(stop_loss, 8),
                take_profit=round(take_profit, 8),
                risk_reward=self._rr_target,
                confidence=self._compute_confidence(
                    current_rsi, stoch_k_now, current_vol, avg_vol, is_bull
                ),
                timeframe="15m",
                regime_context=regime_state,
                notes=(
                    f"Trend pullback short | RSI={current_rsi:.1f} | "
                    f"Stoch K={stoch_k_now:.1f} | EMA21<{current_ema_fast:.2f}"
                ),
            )

    def _compute_confidence(
        self,
        rsi: float,
        stoch_k: float,
        volume: float,
        avg_volume: float,
        is_bull: bool,
    ) -> float:
        """
        Compute a 0–1 confidence score for this signal based on indicator alignment.
        Higher confidence signals receive proportionally more capital allocation.
        """
        score = 0.0

        # RSI confluence score
        if is_bull:
            if 38 <= rsi <= 48:  # Ideal pullback zone
                score += 0.35
            elif 35 <= rsi < 50:
                score += 0.20
        else:
            if 52 <= rsi <= 62:  # Ideal bounce zone
                score += 0.35
            elif 50 < rsi <= 65:
                score += 0.20

        # Stochastic zone score
        if is_bull and stoch_k < 30:   # Oversold — strong reversal zone
            score += 0.35
        elif is_bull and stoch_k < 40:
            score += 0.20
        elif not is_bull and stoch_k > 70:
            score += 0.35
        elif not is_bull and stoch_k > 60:
            score += 0.20

        # Volume confirmation score
        vol_ratio = volume / avg_volume if avg_volume > 0 else 1.0
        if vol_ratio >= 1.5:
            score += 0.30
        elif vol_ratio >= 1.2:
            score += 0.15

        return min(score, 1.0)
