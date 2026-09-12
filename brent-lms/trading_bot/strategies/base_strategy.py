"""
Éclat Institute - Abstract Base Class for Quantitative Trading Strategies
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
import pandas as pd


@dataclass
class TradeSignal:
    action: str  # "BUY", "SELL", or "HOLD"
    entry_price: float
    stop_loss_price: float
    take_profit_price: float
    stop_loss_pips: float
    reason: str


class BaseStrategy(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def generate_signal(self, df: pd.DataFrame, current_spread_pips: float = 1.0) -> TradeSignal:
        pass
