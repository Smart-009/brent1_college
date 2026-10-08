"""
tests/test_intermarket_lead_lag.py
==================================
Unit tests for the Intermarket Lead-Lag & Liquidity Sweep Strategy.
"""

import numpy as np
import pandas as pd
import pytest

from strategies.base_strategy import SignalDirection
from strategies.intermarket_lead_lag import IntermarketLeadLagStrategy


def make_synthetic_ohlcv(n: int = 50, base_price: float = 1.08000) -> pd.DataFrame:
    dates = pd.date_range("2026-01-01", periods=n, freq="15min")
    closes = [base_price + (i * 0.0001) for i in range(n)]
    highs = [c + 0.0004 for c in closes]
    lows = [c - 0.0004 for c in closes]
    opens = [c - 0.0001 for c in closes]
    volumes = [1000 + (i * 10) for i in range(n)]

    return pd.DataFrame(
        {"open": opens, "high": highs, "low": lows, "close": closes, "volume": volumes},
        index=dates,
    )


def test_lead_lag_impulse_detection():
    strategy = IntermarketLeadLagStrategy()
    df = make_synthetic_ohlcv(50)

    # Lead-lag calculation
    pair_state = strategy.analyze_lead_lag("EURUSD", df)
    assert pair_state.lead_symbol == "DXY"
    assert pair_state.lag_symbol == "EURUSD"
    assert -1.0 <= pair_state.correlation <= 1.0
    assert pair_state.estimated_latency_window_sec > 0


def test_liquidity_pools_detection():
    strategy = IntermarketLeadLagStrategy()
    df = make_synthetic_ohlcv(60)

    pools = strategy.detect_liquidity_pools(df, "EURUSD")
    assert isinstance(pools, list)


def test_liquidity_sweep_turtle_soup_short():
    strategy = IntermarketLeadLagStrategy()
    df = make_synthetic_ohlcv(60)

    # Inject a turtle soup liquidity sweep on the last bar:
    # High spikes way above prior highs, but closes back inside range with a huge upper wick
    highest_prior = df["high"].iloc[:-2].max()
    df.iloc[-1, df.columns.get_loc("high")] = highest_prior + 0.0020  # Massive piercing
    df.iloc[-1, df.columns.get_loc("open")] = highest_prior - 0.0005
    df.iloc[-1, df.columns.get_loc("close")] = highest_prior - 0.0008  # Rejected close back inside

    signal = strategy.generate_signal(df, "EURUSD")
    assert signal.direction == SignalDirection.SHORT
    assert signal.strategy_id == "institutional_liquidity_sweep"
    assert signal.confidence >= 0.85
    assert signal.stop_loss > signal.entry_price
    assert signal.take_profit < signal.entry_price
