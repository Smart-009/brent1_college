"""
Éclat Institute - Exponential Moving Average (EMA) Trend-Following Strategy
Uses Fast EMA (e.g. 9) crossing Slow EMA (e.g. 21) with Average True Range (ATR) dynamic stop-loss.
"""

import pandas as pd
import numpy as np
from .base_strategy import BaseStrategy, TradeSignal


class EMACrossoverStrategy(BaseStrategy):
    def __init__(self, fast_period: int = 9, slow_period: int = 21, atr_period: int = 14, rr_ratio: float = 2.0):
        super().__init__("EMA_Crossover")
        self.fast_period = fast_period
        self.slow_period = slow_period
        self.atr_period = atr_period
        self.rr_ratio = rr_ratio

    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df['fast_ema'] = df['close'].ewm(span=self.fast_period, adjust=False).mean()
        df['slow_ema'] = df['close'].ewm(span=self.slow_period, adjust=False).mean()

        # Average True Range (ATR)
        high_low = df['high'] - df['low']
        high_close = (df['high'] - df['close'].shift()).abs()
        low_close = (df['low'] - df['close'].shift()).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        df['atr'] = tr.rolling(window=self.atr_period).mean()

        return df

    def generate_signal(self, df: pd.DataFrame, current_spread_pips: float = 1.0) -> TradeSignal:
        if len(df) < self.slow_period + 5:
            return TradeSignal("HOLD", 0.0, 0.0, 0.0, 0.0, "Insufficient data bars")

        df = self.calculate_indicators(df)
        curr = df.iloc[-1]
        prev = df.iloc[-2]

        current_price = curr['close']
        atr_val = curr['atr'] if not np.isnan(curr['atr']) else 0.0015
        pip_unit = 0.0001 if current_price < 500 else 0.01

        # Golden Cross (Bullish)
        if prev['fast_ema'] <= prev['slow_ema'] and curr['fast_ema'] > curr['slow_ema']:
            sl_distance = max(atr_val * 1.5, 15 * pip_unit)
            sl_price = current_price - sl_distance
            tp_price = current_price + (sl_distance * self.rr_ratio)
            sl_pips = sl_distance / pip_unit

            return TradeSignal(
                action="BUY",
                entry_price=current_price,
                stop_loss_price=round(sl_price, 5),
                take_profit_price=round(tp_price, 5),
                stop_loss_pips=round(sl_pips, 1),
                reason=f"Bullish EMA {self.fast_period} crossed above EMA {self.slow_period} (ATR: {atr_val:.5f})"
            )

        # Death Cross (Bearish)
        if prev['fast_ema'] >= prev['slow_ema'] and curr['fast_ema'] < curr['slow_ema']:
            sl_distance = max(atr_val * 1.5, 15 * pip_unit)
            sl_price = current_price + sl_distance
            tp_price = current_price - (sl_distance * self.rr_ratio)
            sl_pips = sl_distance / pip_unit

            return TradeSignal(
                action="SELL",
                entry_price=current_price,
                stop_loss_price=round(sl_price, 5),
                take_profit_price=round(tp_price, 5),
                stop_loss_pips=round(sl_pips, 1),
                reason=f"Bearish EMA {self.fast_period} crossed below EMA {self.slow_period} (ATR: {atr_val:.5f})"
            )

        return TradeSignal("HOLD", current_price, 0.0, 0.0, 0.0, "No crossover confluence detected")
