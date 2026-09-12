"""
Éclat Institute - RSI Mean-Reversion Strategy
Exploits oversold (< 30) and overbought (> 70) market extremes with higher-timeframe trend alignment.
"""

import pandas as pd
import numpy as np
from .base_strategy import BaseStrategy, TradeSignal


class RSIMeanReversionStrategy(BaseStrategy):
    def __init__(self, rsi_period: int = 14, oversold_threshold: float = 30.0, overbought_threshold: float = 70.0, rr_ratio: float = 2.0):
        super().__init__("RSI_Mean_Reversion")
        self.rsi_period = rsi_period
        self.oversold_threshold = oversold_threshold
        self.overbought_threshold = overbought_threshold
        self.rr_ratio = rr_ratio

    def calculate_rsi(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.rsi_period).mean()

        rs = gain / (loss + 1e-9)
        df['rsi'] = 100 - (100 / (1 + rs))
        df['trend_ma'] = df['close'].rolling(window=50).mean()
        return df

    def generate_signal(self, df: pd.DataFrame, current_spread_pips: float = 1.0) -> TradeSignal:
        if len(df) < self.rsi_period + 10:
            return TradeSignal("HOLD", 0.0, 0.0, 0.0, 0.0, "Insufficient bars for RSI")

        df = self.calculate_rsi(df)
        curr = df.iloc[-1]
        prev = df.iloc[-2]

        current_price = curr['close']
        pip_unit = 0.0001 if current_price < 500 else 0.01

        # RSI crossing back up above Oversold
        if prev['rsi'] <= self.oversold_threshold and curr['rsi'] > self.oversold_threshold:
            sl_pips = 20.0
            sl_price = current_price - (sl_pips * pip_unit)
            tp_price = current_price + (sl_pips * self.rr_ratio * pip_unit)
            return TradeSignal(
                action="BUY",
                entry_price=current_price,
                stop_loss_price=round(sl_price, 5),
                take_profit_price=round(tp_price, 5),
                stop_loss_pips=sl_pips,
                reason=f"RSI recovered above oversold zone ({prev['rsi']:.1f} -> {curr['rsi']:.1f})"
            )

        # RSI crossing back down below Overbought
        if prev['rsi'] >= self.overbought_threshold and curr['rsi'] < self.overbought_threshold:
            sl_pips = 20.0
            sl_price = current_price + (sl_pips * pip_unit)
            tp_price = current_price - (sl_pips * self.rr_ratio * pip_unit)
            return TradeSignal(
                action="SELL",
                entry_price=current_price,
                stop_loss_price=round(sl_price, 5),
                take_profit_price=round(tp_price, 5),
                stop_loss_pips=sl_pips,
                reason=f"RSI fell below overbought zone ({prev['rsi']:.1f} -> {curr['rsi']:.1f})"
            )

        return TradeSignal("HOLD", current_price, 0.0, 0.0, 0.0, f"RSI Neutral at {curr['rsi']:.1f}")
