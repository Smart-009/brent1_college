"""
strategies/breakout.py
=======================
Volatility Breakout Strategy.

CORE LOGIC:
  Used in two contexts:
  1. SQUEEZE context: Price has been coiling inside narrow Bollinger Bands
     (low BBW). When the BBW expands sharply, a breakout is beginning.
  2. HIGH_VOL_CHAOS: Reduced size breakout ride of a major move already underway.

  This strategy does NOT predict direction before the move — it REACTS
  to actual price breaking out of the consolidation range, then joins
  the momentum.

ENTRY CONDITIONS — LONG BREAKOUT:
  1. Regime is SQUEEZE or HIGH_VOL_CHAOS.
  2. Previous N bars (lookback) formed a consolidation range:
     - Donchian Channel width / current price < squeeze_pct threshold.
  3. Current bar closes ABOVE the upper Donchian Channel (breakout confirmation).
  4. Volume on the breakout bar is > 1.5× the 20-bar average (momentum validation).
  5. RSI(14) > 55 (momentum is accelerating upward, not yet overbought).

ENTRY CONDITIONS — SHORT BREAKOUT (mirror):
  3. Close BELOW the lower Donchian Channel.
  5. RSI < 45.

STOP LOSS:
  Placed inside the consolidation range — at the breakout candle's
  lower wick (for longs) or upper wick (for shorts) + 0.5× ATR buffer.
  This stops out quickly if the breakout is false (fake-out back inside the range).

TAKE PROFIT:
  Projected from the breakout level by the height of the consolidation range
  (the "measured move" projection), targeting 2× risk minimum.
"""

from __future__ import annotations

from typing import Optional

import numpy as np
import pandas as pd
import pandas_ta as ta  # type: ignore

from strategies.base_strategy import BaseStrategy, SignalDirection, TradeSignal
from regime.volatility_model import compute_atr, compute_bollinger_bandwidth


class BreakoutStrategy(BaseStrategy):
    """
    Volatility squeeze breakout strategy.

    Compatible regimes: SQUEEZE, HIGH_VOL_CHAOS
    Target timeframe:   15-minute primary
    """

    COMPATIBLE_REGIMES = ["SQUEEZE", "HIGH_VOL_CHAOS"]

    def __init__(self, config: dict) -> None:
        super().__init__(config)
        self._donchian_period:  int   = 20   # Donchian channel lookback
        self._squeeze_pct:      float = 0.03 # Channel width/price < 3% = squeeze
        self._volume_mult:      float = 1.5  # Required volume multiple on breakout
        self._rsi_long_min:     float = 55.0 # RSI must be above for long breakout
        self._rsi_short_max:    float = 45.0 # RSI must be below for short breakout
        self._atr_period:       int   = 14
        self._atr_stop_mult:    float = 0.5
        self._rr_target:        float = 2.0

    def get_regime_compatibility(self) -> list[str]:
        return self.COMPATIBLE_REGIMES

    def generate_signal(
        self,
        df: pd.DataFrame,
        symbol: str,
        regime_state: str,
        df_htf: Optional[pd.DataFrame] = None,
    ) -> TradeSignal:
        """Generate a volatility breakout entry signal."""
        no_signal = TradeSignal(
            symbol=symbol,
            direction=SignalDirection.HOLD,
            strategy_id=self.strategy_id,
            regime_context=regime_state,
        )

        if regime_state not in self.COMPATIBLE_REGIMES:
            return no_signal

        if not self._require_min_bars(df, self._donchian_period + 10):
            return no_signal

        close  = df["close"]
        high   = df["high"]
        low    = df["low"]
        volume = df["volume"]

        # ── Donchian Channel (N-bar high/low = consolidation boundaries) ─
        donchian_high = high.iloc[-(self._donchian_period + 1):-1].max()  # Exclude current bar
        donchian_low  = low.iloc[-(self._donchian_period + 1):-1].min()   # Exclude current bar

        current_close  = float(close.iloc[-1])
        current_high   = float(high.iloc[-1])
        current_low    = float(low.iloc[-1])
        current_vol    = float(volume.iloc[-1])
        avg_vol        = float(volume.iloc[-20:].mean())

        channel_width  = donchian_high - donchian_low
        channel_width_pct = channel_width / donchian_high if donchian_high > 0 else 1.0

        # ── Verify consolidation (squeeze) condition ───────────────────────
        # Only valid breakouts come from a tight prior consolidation
        if channel_width_pct > self._squeeze_pct * 2:
            # Range was too wide — not a genuine squeeze breakout
            return no_signal

        # ── Indicators ────────────────────────────────────────────────────
        rsi = ta.rsi(close, length=14)
        atr_values = compute_atr(df, period=self._atr_period)

        current_rsi = self._latest(rsi) if rsi is not None else 50.0
        current_atr = float(atr_values[-1]) if not np.isnan(atr_values[-1]) else 0.0
        if current_atr == 0:
            return no_signal

        # ── Volume on breakout bar ────────────────────────────────────────
        strong_volume = current_vol >= avg_vol * self._volume_mult

        # ── Long Breakout: Close breaks above the N-bar high ──────────────
        if (
            current_close > donchian_high and
            current_rsi >= self._rsi_long_min and
            strong_volume
        ):
            # Stop: inside the range — at current bar's low minus ATR buffer
            stop_loss   = current_low - (current_atr * self._atr_stop_mult)
            risk        = current_close - stop_loss
            if risk <= 0:
                return no_signal

            # Measured move: channel height projected from breakout
            measured_move = channel_width
            take_profit = current_close + max(measured_move, risk * self._rr_target)
            rr = (take_profit - current_close) / risk

            return TradeSignal(
                symbol=symbol,
                direction=SignalDirection.LONG,
                strategy_id=self.strategy_id,
                entry_price=current_close,
                stop_loss=round(stop_loss, 8),
                take_profit=round(take_profit, 8),
                risk_reward=round(rr, 2),
                confidence=0.7 + (0.3 * min(current_vol / avg_vol / 2, 1.0)),
                timeframe="15m",
                regime_context=regime_state,
                notes=(
                    f"Breakout LONG above {donchian_high:.4f} | "
                    f"Range={channel_width_pct:.2%} | Vol={current_vol/avg_vol:.1f}×avg"
                ),
            )

        # ── Short Breakout: Close breaks below the N-bar low ──────────────
        if (
            current_close < donchian_low and
            current_rsi <= self._rsi_short_max and
            strong_volume
        ):
            stop_loss   = current_high + (current_atr * self._atr_stop_mult)
            risk        = stop_loss - current_close
            if risk <= 0:
                return no_signal

            measured_move = channel_width
            take_profit   = current_close - max(measured_move, risk * self._rr_target)
            rr = (current_close - take_profit) / risk

            return TradeSignal(
                symbol=symbol,
                direction=SignalDirection.SHORT,
                strategy_id=self.strategy_id,
                entry_price=current_close,
                stop_loss=round(stop_loss, 8),
                take_profit=round(take_profit, 8),
                risk_reward=round(rr, 2),
                confidence=0.7 + (0.3 * min(current_vol / avg_vol / 2, 1.0)),
                timeframe="15m",
                regime_context=regime_state,
                notes=(
                    f"Breakout SHORT below {donchian_low:.4f} | "
                    f"Range={channel_width_pct:.2%} | Vol={current_vol/avg_vol:.1f}×avg"
                ),
            )

        return no_signal
