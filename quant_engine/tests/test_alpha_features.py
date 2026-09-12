"""
tests/test_alpha_features.py
============================
Unit tests for the Alpha Expansion Package:
  1. Trailing Stop & Partial Exit (OrderManager)
  2. MarketScanner (Relative Strength & Currency Strength Meter)
  3. PerformanceTracker (Rolling Win Rate & Dynamic Kelly)
"""

from datetime import datetime, timezone
import pytest
import pandas as pd
import numpy as np
import aiosqlite

from execution.order_manager import ManagedPosition, OrderManager
from strategies.market_scanner import MarketScanner
from risk.performance_tracker import PerformanceTracker


# ── Fixtures ──────────────────────────────────────────────────────────────

@pytest.fixture
def alpha_config():
    return {
        "trading": {"mode": "paper"},
        "risk": {
            "synthetic_stops": True,
            "use_breakeven_on_half_target": True,
        },
        "alpha_engine": {
            "trailing_stop": {
                "enabled": True,
                "scale_out_pct": 0.5,
                "tp1_atr_mult": 2.0,
                "breakeven_atr_buffer": 0.2,
                "trail_atr_mult": 2.5,
            },
            "scanner": {
                "enabled": True,
                "top_n_candidates": 3,
                "lookback_bars": 10,
            },
            "feedback": {
                "enabled": True,
                "rolling_trades": 30,
                "min_trades_for_feedback": 3,
            },
        },
    }


# ── Test Suite: MarketScanner ──────────────────────────────────────────────

class TestMarketScanner:
    def test_relative_strength_ranking(self, alpha_config):
        scanner = MarketScanner(alpha_config)

        # Create 3 synthetic symbols:
        # Sym A: Flat/sideways
        # Sym B: Strong Bull breakout (+10%)
        # Sym C: Moderate rise (+2%)
        dates = pd.date_range("2025-01-01", periods=15, freq="15min")
        
        df_a = pd.DataFrame({
            "close": [100.0] * 15,
            "high": [101.0] * 15,
            "low": [99.0] * 15,
        }, index=dates)

        df_b = pd.DataFrame({
            "close": np.linspace(100.0, 110.0, 15),
            "high": np.linspace(100.5, 110.5, 15),
            "low": np.linspace(99.5, 109.5, 15),
        }, index=dates)

        df_c = pd.DataFrame({
            "close": np.linspace(100.0, 102.0, 15),
            "high": np.linspace(100.5, 102.5, 15),
            "low": np.linspace(99.5, 101.5, 15),
        }, index=dates)

        data_map = {"SYM_A": df_a, "SYM_B": df_b, "SYM_C": df_c}
        ranked = scanner.rank_symbols(data_map, asset_class="crypto")

        # Sym B has highest momentum/efficiency, should be ranked #1
        assert ranked[0] == "SYM_B"
        assert len(ranked) == 3

    def test_currency_strength_meter(self, alpha_config):
        scanner = MarketScanner(alpha_config)
        dates = pd.date_range("2025-01-01", periods=15, freq="15min")

        # EURUSD rising -> EUR strong, USD weak
        df_eurusd = pd.DataFrame({
            "close": np.linspace(1.0500, 1.0700, 15),
            "high": np.linspace(1.0550, 1.0750, 15),
            "low": np.linspace(1.0450, 1.0650, 15),
        }, index=dates)

        # GBPUSD rising even faster -> GBP very strong, USD weak
        df_gbpusd = pd.DataFrame({
            "close": np.linspace(1.2500, 1.3000, 15),
            "high": np.linspace(1.2550, 1.3050, 15),
            "low": np.linspace(1.2450, 1.2950, 15),
        }, index=dates)

        data_map = {"EURUSD": df_eurusd, "GBPUSD": df_gbpusd}
        csm = scanner.calculate_currency_strength(data_map)

        assert csm["USD"] < 0  # USD dropped against both
        assert csm["GBP"] > csm["EUR"]  # GBP surged more than EUR


# ── Test Suite: PerformanceTracker ─────────────────────────────────────────

class TestPerformanceTracker:
    @pytest.mark.asyncio
    async def test_rolling_metrics_calculation(self, tmp_path, alpha_config):
        db_file = tmp_path / "test_trades.sqlite"
        
        # Setup test database with mock closed trades
        async with aiosqlite.connect(str(db_file)) as db:
            await db.execute("""
                CREATE TABLE trades (
                    id INTEGER PRIMARY KEY,
                    strategy_id TEXT,
                    realized_pnl REAL,
                    closed_at TEXT
                )
            """)
            # Insert 4 wins ($100 each) and 1 loss (-$50) for 'trend_following'
            for i in range(4):
                await db.execute(
                    "INSERT INTO trades (strategy_id, realized_pnl, closed_at) VALUES (?, ?, ?)",
                    ("trend_following", 100.0, f"2025-01-0{i+1} 10:00:00")
                )
            await db.execute(
                "INSERT INTO trades (strategy_id, realized_pnl, closed_at) VALUES (?, ?, ?)",
                ("trend_following", -50.0, "2025-01-05 10:00:00")
            )
            await db.commit()

        tracker = PerformanceTracker(alpha_config, db_path=str(db_file))
        await tracker.refresh_metrics()

        win_rate, win_loss_ratio = tracker.get_strategy_feedback("trend_following")
        assert win_rate is not None
        assert win_rate == 0.8  # 4 wins out of 5 = 80%
        assert win_loss_ratio == 2.0  # $100 / $50 = 2.0


# ── Test Suite: Trailing Stops & Partial Exit ──────────────────────────────

class TestTrailingStopLogic:
    def test_managed_position_trailing_attributes(self):
        pos = ManagedPosition(
            trade_id="T001",
            symbol="BTC/USDT",
            asset_class="crypto",
            direction="long",
            quantity=1.0,
            entry_price=60000.0,
            stop_loss=58000.0,
            take_profit=66000.0,
            broker_order_id="B001",
            strategy_id="trend_following",
            opened_at=datetime.now(timezone.utc),
            regime_at_entry="BULL_MOMENTUM",
            atr=1000.0,
            initial_quantity=1.0,
            highest_price=60000.0,
        )
        assert pos.trailing_active is False
        assert pos.partial_exited is False
        assert pos.atr == 1000.0


# ── Test Suite: 2-Way Telegram Remote Commands ─────────────────────────────

from monitoring.telegram_alerts import TelegramAlerter
from unittest.mock import AsyncMock, MagicMock

class TestTelegramCommands:
    @pytest.mark.asyncio
    async def test_telegram_pause_and_resume_commands(self):
        config = {
            "bot_token_env": "TELEGRAM_BOT_TOKEN",
            "chat_id_env": "TELEGRAM_CHAT_ID",
            "commands_enabled": True,
        }
        alerter = TelegramAlerter(config)
        alerter.send_message = AsyncMock(return_value=True)

        mock_engine = MagicMock()
        mock_engine._trading_paused = False
        alerter.register_engine(mock_engine)

        # Test /pause command
        await alerter._handle_command("/pause")
        assert mock_engine._trading_paused is True
        alerter.send_message.assert_called()

        # Test /resume command
        await alerter._handle_command("/resume")
        assert mock_engine._trading_paused is False
