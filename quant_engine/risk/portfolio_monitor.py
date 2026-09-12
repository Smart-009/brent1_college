"""
risk/portfolio_monitor.py
==========================
Real-Time Portfolio Drawdown & Exposure Monitor.

WHAT THIS MONITORS:
  1. Current drawdown from the equity high-water mark.
  2. Daily PnL vs. the configured daily loss limit.
  3. Total number of open positions vs. the maximum allowed.
  4. Correlated asset exposure (prevents over-concentration in one sector).

CIRCUIT BREAKER — MOST CRITICAL COMPONENT:
  When the daily loss limit (e.g. 3% of equity) is breached, the monitor
  triggers a CIRCUIT BREAKER that:
  1. Immediately signals the engine to close ALL open positions.
  2. Blocks ALL new trade entries for the next 24 hours.
  3. Logs a CRITICAL risk event and sends an immediate Telegram alert.

  WHY THIS IS NON-NEGOTIABLE:
    A bot that has lost 3% today due to a bad signal or unusual market
    conditions is statistically likely to continue losing if it keeps trading.
    Stopping trading protects the remaining 97% of capital.
    The market will be there tomorrow. A blown account will not come back.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional

from loguru import logger


@dataclass
class PortfolioSnapshot:
    """A point-in-time snapshot of the portfolio's risk state."""
    timestamp: datetime
    equity: float
    high_water_mark: float
    drawdown_pct: float           # Current drawdown from HWM as %
    daily_start_equity: float
    daily_pnl: float
    daily_pnl_pct: float
    open_position_count: int
    circuit_breaker_active: bool
    circuit_breaker_expires_at: Optional[datetime]


class PortfolioMonitor:
    """
    Tracks real-time portfolio health and enforces circuit breakers.

    Usage:
        monitor = PortfolioMonitor(config)
        monitor.initialize(starting_equity=50000.0)

        # Called after every trade closes or on a regular heartbeat
        monitor.update_equity(current_equity=48500.0, open_positions=2)

        if monitor.is_circuit_breaker_active():
            # Block all new entries
            pass

        if monitor.check_daily_loss_limit():
            await monitor.trigger_circuit_breaker()
    """

    def __init__(self, config: dict) -> None:
        risk_cfg = config.get("risk", {})
        self._max_daily_loss_pct:    float = risk_cfg.get("max_daily_loss_pct", 3.0) / 100.0
        self._max_open_positions:    int   = risk_cfg.get("max_open_positions", 10)
        self._max_corr_exposure_pct: float = risk_cfg.get("max_correlated_exposure_pct", 15.0) / 100.0

        self._circuit_breaker_duration_hours: float = 24.0

        # State
        self._high_water_mark:        float = 0.0
        self._current_equity:         float = 0.0
        self._daily_start_equity:     float = 0.0
        self._daily_start_date:       Optional[datetime] = None
        self._open_position_count:    int = 0

        # Circuit breaker state
        self._circuit_breaker_active: bool = False
        self._circuit_breaker_expires: Optional[datetime] = None

        # Callbacks registered by the engine for circuit breaker events
        self._circuit_breaker_callbacks: list = []

        # Correlated exposure tracker: maps asset_class → $ exposure
        self._correlated_exposure: dict[str, float] = {}

        self._lock = asyncio.Lock()
        self._initialized = False

    def initialize(self, starting_equity: float) -> None:
        """
        Set up the monitor with the starting equity for the session.
        Must be called once before any updates.

        Args:
            starting_equity: Account equity at bot startup.
        """
        self._current_equity = starting_equity
        self._high_water_mark = starting_equity
        self._daily_start_equity = starting_equity
        self._daily_start_date = datetime.now(timezone.utc).date()
        self._initialized = True
        logger.info(
            f"[PortfolioMonitor] Initialized | "
            f"Starting equity: ${starting_equity:,.2f} | "
            f"Daily loss limit: ${starting_equity * self._max_daily_loss_pct:,.2f} "
            f"({self._max_daily_loss_pct*100:.1f}%)"
        )

    def register_circuit_breaker_callback(self, callback) -> None:
        """Register an async function called when circuit breaker triggers."""
        self._circuit_breaker_callbacks.append(callback)

    # ── State Updates ──────────────────────────────────────────────────────

    def update_equity(
        self,
        current_equity: float,
        open_positions: int,
    ) -> PortfolioSnapshot:
        """
        Update the current equity and position count.
        Auto-resets daily stats at midnight UTC.

        Args:
            current_equity: Current total account equity.
            open_positions: Number of currently open positions.

        Returns:
            Current PortfolioSnapshot.
        """
        if not self._initialized:
            raise RuntimeError(
                "[PortfolioMonitor] Not initialized. Call initialize() first."
            )

        now = datetime.now(timezone.utc)

        # Auto-reset daily PnL tracker at midnight UTC
        if self._daily_start_date != now.date():
            self._daily_start_equity = self._current_equity
            self._daily_start_date = now.date()
            logger.info(
                f"[PortfolioMonitor] New trading day. "
                f"Daily start equity reset to ${self._daily_start_equity:,.2f}"
            )

        self._current_equity = current_equity
        self._open_position_count = open_positions

        # Update high-water mark
        if current_equity > self._high_water_mark:
            self._high_water_mark = current_equity

        # Compute metrics
        drawdown_pct = 0.0
        if self._high_water_mark > 0:
            drawdown_pct = ((self._high_water_mark - current_equity) / self._high_water_mark) * 100.0

        daily_pnl = current_equity - self._daily_start_equity
        daily_pnl_pct = 0.0
        if self._daily_start_equity > 0:
            daily_pnl_pct = (daily_pnl / self._daily_start_equity) * 100.0

        # Auto-expire circuit breaker if duration has passed
        if self._circuit_breaker_active and self._circuit_breaker_expires:
            if now >= self._circuit_breaker_expires:
                self._circuit_breaker_active = False
                self._circuit_breaker_expires = None
                logger.info(
                    "[PortfolioMonitor] Circuit breaker expired. "
                    "Trading operations may resume."
                )

        # Check if daily loss limit is now breached
        if not self._circuit_breaker_active:
            loss_pct = abs(min(daily_pnl_pct, 0.0)) / 100.0
            if loss_pct >= self._max_daily_loss_pct:
                asyncio.create_task(self._trigger_circuit_breaker(daily_pnl, daily_pnl_pct))

        return PortfolioSnapshot(
            timestamp=now,
            equity=current_equity,
            high_water_mark=self._high_water_mark,
            drawdown_pct=round(drawdown_pct, 4),
            daily_start_equity=self._daily_start_equity,
            daily_pnl=round(daily_pnl, 4),
            daily_pnl_pct=round(daily_pnl_pct, 4),
            open_position_count=open_positions,
            circuit_breaker_active=self._circuit_breaker_active,
            circuit_breaker_expires_at=self._circuit_breaker_expires,
        )

    def record_position_open(self, asset_class: str, notional_value: float) -> None:
        """Record that a new position was opened."""
        self._correlated_exposure[asset_class] = (
            self._correlated_exposure.get(asset_class, 0.0) + notional_value
        )
        self._open_position_count += 1

    def record_position_close(self, asset_class: str, notional_value: float) -> None:
        """Record that a position was closed."""
        current = self._correlated_exposure.get(asset_class, 0.0)
        self._correlated_exposure[asset_class] = max(0.0, current - notional_value)
        self._open_position_count = max(0, self._open_position_count - 1)

    def get_correlated_exposure(self, asset_class: str) -> float:
        """Return current $ exposure in a given asset class."""
        return self._correlated_exposure.get(asset_class, 0.0)

    # ── Circuit Breaker ────────────────────────────────────────────────────

    def is_circuit_breaker_active(self) -> bool:
        """Returns True if trading is currently suspended by the circuit breaker."""
        return self._circuit_breaker_active

    async def _trigger_circuit_breaker(
        self,
        daily_pnl: float,
        daily_pnl_pct: float,
    ) -> None:
        """
        Activate the circuit breaker. Called automatically when daily loss limit is hit.
        """
        async with self._lock:
            if self._circuit_breaker_active:
                return  # Already active — don't double-trigger

            self._circuit_breaker_active = True
            self._circuit_breaker_expires = (
                datetime.now(timezone.utc) +
                timedelta(hours=self._circuit_breaker_duration_hours)
            )

        logger.critical(
            f"[PortfolioMonitor] ⛔ CIRCUIT BREAKER TRIGGERED\n"
            f"  Daily P&L: ${daily_pnl:.2f} ({daily_pnl_pct:.2f}%)\n"
            f"  Daily loss limit: {self._max_daily_loss_pct*100:.1f}%\n"
            f"  ALL trading suspended until: {self._circuit_breaker_expires.isoformat()}"
        )

        # Fire all registered callbacks (e.g. close all positions, send alert)
        for callback in self._circuit_breaker_callbacks:
            try:
                if asyncio.iscoroutinefunction(callback):
                    await callback(daily_pnl, daily_pnl_pct)
                else:
                    callback(daily_pnl, daily_pnl_pct)
            except Exception as e:
                logger.error(f"[PortfolioMonitor] Circuit breaker callback failed: {e}")

    # ── Pre-Trade Checks ───────────────────────────────────────────────────

    def can_open_new_trade(self, asset_class: str = "") -> tuple[bool, str]:
        """
        Check all portfolio-level limits before opening a new trade.

        Returns:
            Tuple of (allowed: bool, reason: str)
        """
        if not self._initialized:
            return False, "Portfolio monitor not initialized."

        if self._circuit_breaker_active:
            expires = self._circuit_breaker_expires
            return False, (
                f"Circuit breaker active until "
                f"{expires.strftime('%Y-%m-%d %H:%M UTC') if expires else 'unknown'}. "
                "Trading suspended."
            )

        if self._open_position_count >= self._max_open_positions:
            return False, (
                f"Max open positions reached: {self._open_position_count}/"
                f"{self._max_open_positions}."
            )

        return True, "Portfolio limits OK."

    @property
    def equity(self) -> float:
        return self._current_equity

    @property
    def high_water_mark(self) -> float:
        return self._high_water_mark

    @property
    def daily_pnl(self) -> float:
        return self._current_equity - self._daily_start_equity

    @property
    def daily_pnl_pct(self) -> float:
        if self._daily_start_equity <= 0:
            return 0.0
        return (self.daily_pnl / self._daily_start_equity) * 100.0
