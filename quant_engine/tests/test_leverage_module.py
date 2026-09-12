"""
tests/test_leverage_module.py
=============================
Unit tests for the LeverageManager and leverage-aware risk pipeline.

Tests cover:
  1. Default disabled state returns 1x leverage and passes spot trades.
  2. Per-asset-class leverage parsing and max-cap enforcement.
  3. Liquidation price calculations for long and short positions.
  4. Pre-trade liquidation buffer gate (blocks dangerous trades).
  5. Margin requirement calculations.
  6. Margin health monitor triggers warning at threshold.
  7. PositionSizer handles leverage parameter correctly.
  8. RiskManager integrates Check 10 liquidation gate.
"""

from datetime import datetime, timezone
import pytest

from risk.leverage_manager import LeverageManager, MAINTENANCE_MARGIN_RATE
from risk.position_sizer import PositionSizer
from risk.risk_manager import RiskManager
from strategies.base_strategy import SignalDirection, TradeSignal
from regime.regime_engine import RegimeResult, RegimeState


@pytest.fixture
def base_config():
    return {
        "risk": {
            "max_risk_per_trade_pct": 1.0,
            "atr_multiplier_stop": 2.0,
            "atr_multiplier_target": 4.0,
            "max_correlated_exposure_pct": 15.0,
            "kelly_fraction": 0.5,
        },
        "leverage": {
            "enabled": True,
            "crypto": 5,
            "forex": 3,
            "stocks": 1,
            "max_crypto": 20,
            "max_forex": 10,
            "max_stocks": 4,
            "margin_health_min_pct": 20.0,
            "liquidation_buffer_atr": 1.5,
        },
        "events": {
            "pre_event_blackout_minutes": 15,
        },
    }


class TestLeverageManager:
    def test_disabled_by_default(self):
        cfg = {"leverage": {"enabled": False}}
        lm = LeverageManager(cfg)
        assert lm.enabled is False
        assert lm.get_leverage("crypto") == 1
        assert lm.get_leverage("forex") == 1

        decision = lm.check_trade(
            symbol="BTC/USDT",
            direction="long",
            entry_price=60000.0,
            quantity=0.01,
            atr=1000.0,
            asset_class="crypto",
        )
        assert decision.approved is True
        assert decision.effective_leverage == 1

    def test_per_asset_leverage_and_capping(self, base_config):
        # Override with leverage exceeding max
        base_config["leverage"]["crypto"] = 50  # Max is 20
        lm = LeverageManager(base_config)
        assert lm.get_leverage("crypto") == 20
        assert lm.get_leverage("forex") == 3
        assert lm.get_leverage("stocks_us") == 1

    def test_liquidation_price_calculations(self, base_config):
        lm = LeverageManager(base_config)
        entry = 50000.0
        leverage = 10

        # Long: liq < entry
        liq_long = lm.calculate_liquidation_price("long", entry, leverage)
        assert liq_long < entry
        # Theoretical 10x long ~ entry * (1 - 0.1 + 0.005) = 50000 * 0.905 = 45250
        assert pytest.approx(liq_long, rel=1e-3) == 45250.0

        # Short: liq > entry
        liq_short = lm.calculate_liquidation_price("short", entry, leverage)
        assert liq_short > entry
        # Theoretical 10x short ~ entry * (1 + 0.1 - 0.005) = 50000 * 1.095 = 54750
        assert pytest.approx(liq_short, rel=1e-3) == 54750.0

    def test_liquidation_buffer_gate_blocks_excessive_risk(self, base_config):
        base_config["leverage"]["crypto"] = 20
        lm = LeverageManager(base_config)
        # Long entry 50,000, 20x leverage -> liq ~ 47,750 (dist = 2,250)
        # If ATR is 2,000, 1.5 * ATR = 3,000 required buffer -> should BLOCK
        decision = lm.check_trade(
            symbol="BTC/USDT",
            direction="long",
            entry_price=50000.0,
            quantity=0.1,
            atr=2000.0,
            asset_class="crypto",
        )
        assert decision.approved is False
        assert "Liquidation price" in decision.reason

    def test_liquidation_buffer_gate_approves_safe_distance(self, base_config):
        lm = LeverageManager(base_config)
        # Entry 50,000, 5x leverage -> liq ~ 40,250 (dist = 9,750)
        # If ATR is 1,000, 1.5 * ATR = 1,500 required buffer -> should APPROVE
        decision = lm.check_trade(
            symbol="BTC/USDT",
            direction="long",
            entry_price=50000.0,
            quantity=0.1,
            atr=1000.0,
            asset_class="crypto",
        )
        assert decision.approved is True
        assert decision.effective_leverage == 5

    def test_margin_health_warning(self, base_config):
        lm = LeverageManager(base_config)
        # Margin health threshold is 20% free (80% used)
        # Case 1: 50% used -> healthy
        h1 = lm.check_margin_health(used_margin=500.0, total_margin=1000.0)
        assert h1.is_healthy is True
        assert h1.warning == ""

        # Case 2: 85% used -> warning triggered
        h2 = lm.check_margin_health(used_margin=850.0, total_margin=1000.0)
        assert h2.is_healthy is False
        assert "Margin at 85.0% utilisation" in h2.warning


class TestLeveragePositionSizing:
    def test_sizer_with_leverage(self, base_config):
        sizer = PositionSizer(base_config)
        equity = 10000.0
        entry = 100.0
        atr = 2.0

        # With 1x leverage
        res_1x = sizer.calculate(
            equity=equity,
            entry_price=entry,
            atr=atr,
            direction="long",
            leverage=1,
        )

        # With 5x leverage
        res_5x = sizer.calculate(
            equity=equity,
            entry_price=entry,
            atr=atr,
            direction="long",
            leverage=5,
        )

        # Base risk in USD should remain constrained to 1% ($100)
        assert res_1x.dollar_risk <= 100.01
        assert res_5x.dollar_risk <= 100.01
        assert res_5x.quantity > 0
