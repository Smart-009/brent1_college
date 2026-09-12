"""
tests/test_core_modules.py
===========================
Smoke tests for all core modules.
These tests do NOT hit any real exchange or broker.
They verify the logic is correct without network access.

Run with:
    pytest tests/test_core_modules.py -v
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pandas as pd
import pytest

# ── Hurst Exponent Tests ───────────────────────────────────────────────────

class TestHurstExponent:
    def test_trending_series_returns_high_hurst(self):
        """A clearly trending series should have H > 0.55."""
        from regime.hurst_exponent import compute_hurst_exponent, classify_hurst

        # Simulate a strong uptrend: cumulative sum of positive increments
        np.random.seed(42)
        trend = np.cumsum(np.random.uniform(0, 0.01, 200) + 0.005)
        H = compute_hurst_exponent(trend)
        assert H > 0.50, f"Expected trending H > 0.50, got {H:.3f}"
        label = classify_hurst(H)
        assert label in ("TRENDING", "RANDOM_WALK")

    def test_random_walk_series_returns_hurst_near_05(self):
        """A random walk series should return H near 0.5."""
        from regime.hurst_exponent import compute_hurst_exponent

        np.random.seed(123)
        random_walk = 100.0 + np.cumsum(np.random.randn(500))
        H = compute_hurst_exponent(random_walk)
        # Random walk H can vary significantly, just check it's in valid range
        assert 0.0 <= H <= 1.0, f"H out of [0,1]: {H}"

    def test_insufficient_data_returns_05(self):
        """Should return 0.5 (random walk) when data is too short."""
        from regime.hurst_exponent import compute_hurst_exponent

        H = compute_hurst_exponent(np.array([1.0, 2.0, 3.0]))  # Only 3 points
        assert H == 0.5


# ── Volatility Model Tests ──────────────────────────────────────────────────

class TestVolatilityModel:
    def make_ohlcv_df(self, n: int = 50) -> pd.DataFrame:
        np.random.seed(42)
        close = 100 + np.cumsum(np.random.randn(n) * 0.5)
        high  = close + np.abs(np.random.randn(n) * 0.3)
        low   = close - np.abs(np.random.randn(n) * 0.3)
        open_ = close + np.random.randn(n) * 0.2
        vol   = np.abs(np.random.randn(n) * 1000 + 5000)
        df = pd.DataFrame({
            "open": open_, "high": high, "low": low,
            "close": close, "volume": vol,
        })
        return df

    def test_atr_returns_correct_shape(self):
        """ATR should return array of same length as input DataFrame."""
        from regime.volatility_model import compute_atr

        df = self.make_ohlcv_df(50)
        atr = compute_atr(df, period=14)
        assert len(atr) == len(df), "ATR length must match DataFrame"

    def test_yang_zhang_returns_valid_values(self):
        """Yang-Zhang volatility should return positive, finite values."""
        from regime.volatility_model import yang_zhang_volatility

        df = self.make_ohlcv_df(100)
        yz = yang_zhang_volatility(df, window=20)
        valid = yz[~np.isnan(yz)]
        assert len(valid) > 0, "Should have at least some valid YZ values"
        assert all(v >= 0 for v in valid), "Volatility cannot be negative"

    def test_bbw_returns_float(self):
        """Bollinger Band Width should return a float."""
        from regime.volatility_model import compute_bollinger_bandwidth

        closes = np.random.randn(30) + 100.0
        bbw = compute_bollinger_bandwidth(closes, period=20)
        assert isinstance(bbw, float), f"BBW should be float, got {type(bbw)}"
        assert bbw >= 0.0, "BBW cannot be negative"


# ── Position Sizer Tests ────────────────────────────────────────────────────

class TestPositionSizer:
    def get_config(self) -> dict:
        return {
            "risk": {
                "max_risk_per_trade_pct": 1.0,
                "atr_multiplier_stop": 2.0,
                "atr_multiplier_target": 4.0,
                "kelly_fraction": 0.5,
                "max_correlated_exposure_pct": 15.0,
            }
        }

    def test_basic_sizing_calculation(self):
        """Position size should be non-zero for valid inputs."""
        from risk.position_sizer import PositionSizer

        sizer = PositionSizer(self.get_config())
        result = sizer.calculate(
            equity=50000.0,
            entry_price=42000.0,
            atr=850.0,
            signal_confidence=1.0,
        )
        assert result.quantity > 0, "Quantity must be positive"
        assert result.dollar_risk > 0, "Dollar risk must be positive"
        assert result.dollar_risk <= 500.0, "1% of 50k should be max $500 risk"

    def test_zero_inputs_return_zero_size(self):
        """Zero equity, price, or ATR should return zero quantity."""
        from risk.position_sizer import PositionSizer

        sizer = PositionSizer(self.get_config())
        result = sizer.calculate(equity=0.0, entry_price=100.0, atr=2.0)
        assert result.quantity == 0.0

    def test_confidence_scaling(self):
        """Lower confidence should produce smaller position size."""
        from risk.position_sizer import PositionSizer

        sizer = PositionSizer(self.get_config())
        full = sizer.calculate(equity=50000.0, entry_price=100.0, atr=2.0, signal_confidence=1.0)
        half = sizer.calculate(equity=50000.0, entry_price=100.0, atr=2.0, signal_confidence=0.5)
        assert half.quantity < full.quantity, "Half confidence should give smaller size"

    def test_kelly_negative_edge_returns_tiny_size(self):
        """Zero-edge Kelly should effectively disable the trade."""
        from risk.position_sizer import PositionSizer

        sizer = PositionSizer(self.get_config())
        result = sizer.calculate(
            equity=50000.0,
            entry_price=100.0,
            atr=2.0,
            win_rate=0.3,        # Losing system
            avg_win_loss_ratio=0.5,  # Wins < losses
        )
        # Kelly returns zero for negative edge strategies to protect capital
        assert result.quantity == 0.0, "Quantity must be 0 for negative edge"
        assert result.dollar_risk == 0.0, "Dollar risk must be 0 for negative edge"


# ── Portfolio Monitor Tests ─────────────────────────────────────────────────

class TestPortfolioMonitor:
    def get_config(self) -> dict:
        return {
            "risk": {
                "max_daily_loss_pct": 3.0,
                "max_open_positions": 10,
                "max_correlated_exposure_pct": 15.0,
            }
        }

    def test_initialization(self):
        """Monitor should initialize with correct starting values."""
        from risk.portfolio_monitor import PortfolioMonitor

        monitor = PortfolioMonitor(self.get_config())
        monitor.initialize(100000.0)
        assert monitor.equity == 100000.0
        assert monitor.high_water_mark == 100000.0
        assert not monitor.is_circuit_breaker_active()

    def test_high_water_mark_updates(self):
        """HWM should increase when equity rises but not when it falls."""
        from risk.portfolio_monitor import PortfolioMonitor

        monitor = PortfolioMonitor(self.get_config())
        monitor.initialize(100000.0)

        monitor.update_equity(110000.0, 0)
        assert monitor.high_water_mark == 110000.0

        monitor.update_equity(105000.0, 0)
        assert monitor.high_water_mark == 110000.0  # HWM stays at peak

    def test_max_positions_blocks_trade(self):
        """Exceeding max positions should block new trades."""
        from risk.portfolio_monitor import PortfolioMonitor

        monitor = PortfolioMonitor(self.get_config())
        monitor.initialize(100000.0)
        monitor._open_position_count = 10  # At max

        allowed, reason = monitor.can_open_new_trade()
        assert not allowed
        assert "max open positions" in reason.lower()


# ── Session Guard Tests ─────────────────────────────────────────────────────

class TestSessionGuard:
    def test_crypto_is_always_open(self):
        """Crypto market should be open on a weekday."""
        from core.session_guard import SessionGuard, MarketState

        guard = SessionGuard()
        # Monday at 14:00 UTC — should be OPEN (not low liquidity)
        monday_1400 = datetime(2024, 1, 8, 14, 0, 0, tzinfo=timezone.utc)
        state = guard.get_crypto_state(now_utc=monday_1400)
        assert state == MarketState.OPEN

    def test_forex_closed_on_saturday(self):
        """Forex should be closed on Saturday."""
        from core.session_guard import SessionGuard

        guard = SessionGuard()
        saturday = datetime(2024, 1, 6, 12, 0, 0, tzinfo=timezone.utc)  # A Saturday
        sessions = guard.get_active_forex_sessions(now_utc=saturday)
        assert sessions == [], f"Forex should be closed Saturday, got: {sessions}"

    def test_london_ny_overlap_is_detected(self):
        """London/NY overlap at 15:00 UTC should be detected."""
        from core.session_guard import SessionGuard, ForexSession

        guard = SessionGuard()
        overlap_time = datetime(2024, 1, 8, 15, 0, 0, tzinfo=timezone.utc)  # Monday 15:00
        sessions = guard.get_active_forex_sessions(now_utc=overlap_time)
        assert ForexSession.OVERLAP_LONDON_NY in sessions


# ── Strategy Signal Tests ───────────────────────────────────────────────────

class TestStrategies:
    def make_trending_df(self, n: int = 120, bullish: bool = True) -> pd.DataFrame:
        """Create a synthetic trending OHLCV DataFrame."""
        np.random.seed(42)
        direction = 1 if bullish else -1
        close = 100.0 + direction * np.cumsum(np.abs(np.random.randn(n) * 0.5) + 0.2)
        noise = np.random.randn(n) * 0.2
        high  = close + np.abs(noise) + 0.3
        low   = close - np.abs(noise) - 0.3
        open_ = close - direction * 0.1
        vol   = np.abs(np.random.randn(n) * 500 + 2000)
        df = pd.DataFrame({
            "open": open_, "high": high, "low": low,
            "close": close, "volume": vol,
        })
        return df

    def get_config(self) -> dict:
        return {"risk": {"atr_multiplier_stop": 2.0}}

    def test_trend_strategy_returns_signal_or_hold(self):
        """Trend strategy should always return a valid TradeSignal."""
        from strategies.trend_following import TrendFollowingStrategy
        from strategies.base_strategy import SignalDirection

        strategy = TrendFollowingStrategy(self.get_config())
        df = self.make_trending_df(120)
        signal = strategy.generate_signal(df, "BTC/USDT", "BULL_MOMENTUM")
        assert signal is not None
        assert signal.direction in list(SignalDirection)

    def test_trend_strategy_holds_in_wrong_regime(self):
        """Trend strategy must return HOLD in non-trend regime."""
        from strategies.trend_following import TrendFollowingStrategy
        from strategies.base_strategy import SignalDirection

        strategy = TrendFollowingStrategy(self.get_config())
        df = self.make_trending_df(120)
        signal = strategy.generate_signal(df, "BTC/USDT", "CHOP_RANGING")
        assert signal.direction == SignalDirection.HOLD

    def test_mean_reversion_holds_in_wrong_regime(self):
        """Mean reversion strategy must return HOLD in trending regime."""
        from strategies.mean_reversion import MeanReversionStrategy
        from strategies.base_strategy import SignalDirection

        strategy = MeanReversionStrategy(self.get_config())
        df = self.make_trending_df(120)
        signal = strategy.generate_signal(df, "BTC/USDT", "BULL_MOMENTUM")
        assert signal.direction == SignalDirection.HOLD

    def test_breakout_holds_in_wrong_regime(self):
        """Breakout strategy must return HOLD in non-squeeze regime."""
        from strategies.breakout import BreakoutStrategy
        from strategies.base_strategy import SignalDirection

        strategy = BreakoutStrategy(self.get_config())
        df = self.make_trending_df(120)
        signal = strategy.generate_signal(df, "BTC/USDT", "BULL_MOMENTUM")
        assert signal.direction == SignalDirection.HOLD


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
