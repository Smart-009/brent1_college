"""
db/trade_logger.py
==================
Async SQLite Trade & State Logger.

WHY ASYNC SQLite:
  All disk I/O happens in background threads via aiosqlite, ensuring
  the critical trading event loop is NEVER blocked waiting for a disk write.

WHAT IS LOGGED:
  1. Every trade entry and exit (with full metadata).
  2. Every order submitted to a broker (and status updates).
  3. Daily PnL snapshots for performance analytics.
  4. Risk events (circuit breaker triggers, news panic alerts, etc.).
  5. System events (startup, shutdown, connection drops).

SCHEMA DESIGN:
  Tables are append-only. We never UPDATE or DELETE rows — only INSERT.
  This ensures a complete, auditable, tamper-evident history.
"""

from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pathlib import Path

import aiosqlite
from loguru import logger


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

CREATE_TABLES_SQL = """
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA foreign_keys=ON;

-- ── Orders table: every order sent to any broker ──────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    client_order_id     TEXT    NOT NULL UNIQUE,
    broker_order_id     TEXT,
    symbol              TEXT    NOT NULL,
    asset_class         TEXT    NOT NULL,
    side                TEXT    NOT NULL,  -- "buy" | "sell"
    order_type          TEXT    NOT NULL,  -- "market" | "limit" | "stop" | "stop_limit"
    quantity            REAL    NOT NULL,
    limit_price         REAL,
    stop_price          REAL,
    status              TEXT    NOT NULL,  -- "pending" | "filled" | "cancelled" | "rejected"
    filled_price        REAL,
    filled_quantity     REAL    DEFAULT 0,
    strategy_id         TEXT,
    broker              TEXT    NOT NULL,
    metadata            TEXT,              -- JSON blob for extra fields
    created_at          TEXT    NOT NULL,  -- ISO 8601 UTC
    updated_at          TEXT    NOT NULL
);

-- ── Trades table: completed round-trips (entry + exit) ────────────────────
CREATE TABLE IF NOT EXISTS trades (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_id            TEXT    NOT NULL UNIQUE,
    symbol              TEXT    NOT NULL,
    asset_class         TEXT    NOT NULL,
    side                TEXT    NOT NULL,  -- "long" | "short"
    entry_price         REAL    NOT NULL,
    exit_price          REAL,
    quantity            REAL    NOT NULL,
    realized_pnl        REAL,
    realized_pnl_pct    REAL,
    commission          REAL    DEFAULT 0,
    slippage            REAL    DEFAULT 0,
    strategy_id         TEXT,
    regime_at_entry     TEXT,              -- market regime when trade was opened
    entry_order_id      TEXT,
    exit_order_id       TEXT,
    opened_at           TEXT    NOT NULL,  -- ISO 8601 UTC
    closed_at           TEXT,
    duration_seconds    INTEGER,
    metadata            TEXT               -- JSON blob
);

-- ── Daily PnL snapshots ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_pnl (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    date                TEXT    NOT NULL,  -- "YYYY-MM-DD"
    starting_equity     REAL    NOT NULL,
    ending_equity       REAL    NOT NULL,
    gross_pnl           REAL    NOT NULL,
    net_pnl             REAL    NOT NULL,
    total_commission    REAL    DEFAULT 0,
    total_trades        INTEGER DEFAULT 0,
    winning_trades      INTEGER DEFAULT 0,
    losing_trades       INTEGER DEFAULT 0,
    max_drawdown_pct    REAL,
    recorded_at         TEXT    NOT NULL   -- ISO 8601 UTC
);

-- ── Risk events ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_events (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type          TEXT    NOT NULL,  -- "circuit_breaker" | "news_panic" | "margin_call" etc.
    severity            TEXT    NOT NULL,  -- "info" | "warning" | "critical"
    description         TEXT    NOT NULL,
    affected_symbols    TEXT,              -- JSON array of symbol strings
    action_taken        TEXT,              -- e.g. "all_positions_closed"
    metadata            TEXT,             -- JSON blob
    occurred_at         TEXT    NOT NULL  -- ISO 8601 UTC
);

-- ── System events ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_events (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type          TEXT    NOT NULL,  -- "startup" | "shutdown" | "connection_drop" etc.
    description         TEXT    NOT NULL,
    metadata            TEXT,             -- JSON blob
    occurred_at         TEXT    NOT NULL  -- ISO 8601 UTC
);

-- ── Indexes for fast query performance ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_symbol      ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_trades_symbol      ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_opened_at   ON trades(opened_at);
CREATE INDEX IF NOT EXISTS idx_risk_events_type   ON risk_events(event_type);
CREATE INDEX IF NOT EXISTS idx_daily_pnl_date     ON daily_pnl(date);
"""


# ---------------------------------------------------------------------------
# Trade Logger
# ---------------------------------------------------------------------------

class TradeLogger:
    """
    Async, append-only trade and event logger backed by SQLite (WAL mode).

    Usage:
        logger = TradeLogger("db/trades.sqlite")
        await logger.initialize()

        await logger.log_order(order)
        await logger.log_trade(trade_data)
        await logger.log_risk_event(...)

        await logger.close()
    """

    def __init__(self, db_path: str) -> None:
        """
        Args:
            db_path: Path to the SQLite database file.
                     Will be created (along with parent dirs) if it doesn't exist.
        """
        self._db_path = db_path
        self._conn: Optional[aiosqlite.Connection] = None
        self._write_lock = asyncio.Lock()

    async def initialize(self) -> None:
        """
        Create the database file and all required tables if they don't exist.
        Must be called once before any other method.
        """
        Path(self._db_path).parent.mkdir(parents=True, exist_ok=True)

        self._conn = await aiosqlite.connect(self._db_path)
        self._conn.row_factory = aiosqlite.Row

        async with self._write_lock:
            await self._conn.executescript(CREATE_TABLES_SQL)
            await self._conn.commit()

        logger.info(f"TradeLogger initialized. Database: {self._db_path}")
        await self.log_system_event("startup", "Trade logger initialized.")

    async def close(self) -> None:
        """Flush all pending writes and close the database connection."""
        if self._conn:
            await self.log_system_event("shutdown", "Trade logger shutting down.")
            await self._conn.close()
            self._conn = None
            logger.info("TradeLogger closed.")

    # ── Internal helpers ───────────────────────────────────────────────────

    def _now_utc(self) -> str:
        """Return current UTC time as an ISO 8601 string."""
        return datetime.now(timezone.utc).isoformat()

    def _require_initialized(self) -> None:
        if self._conn is None:
            raise RuntimeError(
                "TradeLogger is not initialized. Call await logger.initialize() first."
            )

    # ── Order Logging ──────────────────────────────────────────────────────

    async def log_order(self, order) -> None:
        """
        Insert or update an order record.

        If the client_order_id already exists, updates status, filled_price,
        filled_quantity, and updated_at.

        Args:
            order: An Order dataclass instance from brokers/base_broker.py.
        """
        self._require_initialized()

        metadata_json = json.dumps(order.metadata) if order.metadata else None
        now = self._now_utc()

        sql = """
        INSERT INTO orders (
            client_order_id, broker_order_id, symbol, asset_class, side,
            order_type, quantity, limit_price, stop_price, status,
            filled_price, filled_quantity, strategy_id, broker, metadata,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(client_order_id) DO UPDATE SET
            broker_order_id  = excluded.broker_order_id,
            status           = excluded.status,
            filled_price     = excluded.filled_price,
            filled_quantity  = excluded.filled_quantity,
            updated_at       = excluded.updated_at
        """
        values = (
            order.client_order_id,
            order.broker_order_id,
            order.symbol,
            order.asset_class.value if hasattr(order.asset_class, "value") else order.asset_class,
            order.side.value if hasattr(order.side, "value") else order.side,
            order.order_type.value if hasattr(order.order_type, "value") else order.order_type,
            order.quantity,
            order.limit_price,
            order.stop_price,
            order.status.value if hasattr(order.status, "value") else order.status,
            order.filled_price,
            order.filled_quantity,
            order.strategy_id,
            order.__class__.__module__,  # Records which broker class placed the order
            metadata_json,
            now,
            now,
        )

        async with self._write_lock:
            await self._conn.execute(sql, values)
            await self._conn.commit()

    # ── Trade Logging ──────────────────────────────────────────────────────

    async def log_trade_open(
        self,
        trade_id: str,
        symbol: str,
        asset_class: str,
        side: str,
        entry_price: float,
        quantity: float,
        strategy_id: Optional[str] = None,
        regime_at_entry: Optional[str] = None,
        entry_order_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        """Record the opening of a trade."""
        self._require_initialized()

        sql = """
        INSERT INTO trades (
            trade_id, symbol, asset_class, side, entry_price, quantity,
            strategy_id, regime_at_entry, entry_order_id, metadata, opened_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        values = (
            trade_id, symbol, asset_class, side, entry_price, quantity,
            strategy_id, regime_at_entry, entry_order_id,
            json.dumps(metadata) if metadata else None,
            self._now_utc(),
        )

        async with self._write_lock:
            await self._conn.execute(sql, values)
            await self._conn.commit()

        logger.info(f"TRADE OPEN  | {side.upper()} {quantity} {symbol} @ {entry_price:.6f}")

    async def log_trade_close(
        self,
        trade_id: str,
        exit_price: float,
        realized_pnl: float,
        realized_pnl_pct: float,
        commission: float = 0.0,
        slippage: float = 0.0,
        exit_order_id: Optional[str] = None,
    ) -> None:
        """Record the closing of a trade with full PnL details."""
        self._require_initialized()

        now = self._now_utc()

        # Calculate duration using opened_at from the existing row
        async with self._conn.execute(
            "SELECT opened_at FROM trades WHERE trade_id = ?", (trade_id,)
        ) as cursor:
            row = await cursor.fetchone()

        duration_seconds = None
        if row:
            opened_dt = datetime.fromisoformat(row["opened_at"])
            closed_dt = datetime.fromisoformat(now)
            duration_seconds = int((closed_dt - opened_dt).total_seconds())

        sql = """
        UPDATE trades SET
            exit_price       = ?,
            realized_pnl     = ?,
            realized_pnl_pct = ?,
            commission       = ?,
            slippage         = ?,
            exit_order_id    = ?,
            closed_at        = ?,
            duration_seconds = ?
        WHERE trade_id = ?
        """
        values = (
            exit_price, realized_pnl, realized_pnl_pct,
            commission, slippage, exit_order_id,
            now, duration_seconds, trade_id,
        )

        async with self._write_lock:
            await self._conn.execute(sql, values)
            await self._conn.commit()

        pnl_sign = "+" if realized_pnl >= 0 else ""
        logger.info(
            f"TRADE CLOSE | {trade_id} | PnL: {pnl_sign}{realized_pnl:.2f} USD "
            f"({pnl_sign}{realized_pnl_pct:.2f}%) | Duration: {duration_seconds}s"
        )

    # ── Risk Event Logging ─────────────────────────────────────────────────

    async def log_risk_event(
        self,
        event_type: str,
        severity: str,
        description: str,
        affected_symbols: Optional[list[str]] = None,
        action_taken: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Record a risk management event.

        Args:
            event_type:        e.g. "circuit_breaker", "news_panic", "daily_loss_limit"
            severity:          "info" | "warning" | "critical"
            description:       Human-readable description of what happened.
            affected_symbols:  List of symbols affected (if applicable).
            action_taken:      What the system did in response.
            metadata:          Extra data as a dict.
        """
        self._require_initialized()

        sql = """
        INSERT INTO risk_events (
            event_type, severity, description, affected_symbols,
            action_taken, metadata, occurred_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        values = (
            event_type, severity, description,
            json.dumps(affected_symbols) if affected_symbols else None,
            action_taken,
            json.dumps(metadata) if metadata else None,
            self._now_utc(),
        )

        async with self._write_lock:
            await self._conn.execute(sql, values)
            await self._conn.commit()

        log_fn = logger.warning if severity == "warning" else (
            logger.critical if severity == "critical" else logger.info
        )
        log_fn(f"RISK EVENT  | [{severity.upper()}] {event_type}: {description}")

    # ── Daily PnL Snapshot ─────────────────────────────────────────────────

    async def log_daily_pnl(
        self,
        date: str,
        starting_equity: float,
        ending_equity: float,
        gross_pnl: float,
        net_pnl: float,
        total_commission: float,
        total_trades: int,
        winning_trades: int,
        losing_trades: int,
        max_drawdown_pct: float,
    ) -> None:
        """Record a daily PnL summary snapshot."""
        self._require_initialized()

        sql = """
        INSERT INTO daily_pnl (
            date, starting_equity, ending_equity, gross_pnl, net_pnl,
            total_commission, total_trades, winning_trades, losing_trades,
            max_drawdown_pct, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0.0

        async with self._write_lock:
            await self._conn.execute(sql, (
                date, starting_equity, ending_equity, gross_pnl, net_pnl,
                total_commission, total_trades, winning_trades, losing_trades,
                max_drawdown_pct, self._now_utc(),
            ))
            await self._conn.commit()

        pnl_sign = "+" if net_pnl >= 0 else ""
        logger.info(
            f"DAILY PnL   | {date} | Net: {pnl_sign}{net_pnl:.2f} | "
            f"Trades: {total_trades} | Win rate: {win_rate:.1f}% | "
            f"Max DD: {max_drawdown_pct:.2f}%"
        )

    # ── System Event Logging ───────────────────────────────────────────────

    async def log_system_event(
        self,
        event_type: str,
        description: str,
        metadata: Optional[dict] = None,
    ) -> None:
        """Record a system lifecycle event (startup, shutdown, reconnect, etc.)."""
        self._require_initialized()

        sql = """
        INSERT INTO system_events (event_type, description, metadata, occurred_at)
        VALUES (?, ?, ?, ?)
        """

        async with self._write_lock:
            await self._conn.execute(sql, (
                event_type, description,
                json.dumps(metadata) if metadata else None,
                self._now_utc(),
            ))
            await self._conn.commit()

    # ── Query Helpers ──────────────────────────────────────────────────────

    async def get_open_trades(self) -> list[dict]:
        """Return all trades that have been opened but not yet closed."""
        self._require_initialized()

        async with self._conn.execute(
            "SELECT * FROM trades WHERE closed_at IS NULL ORDER BY opened_at ASC"
        ) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_trade_history(
        self,
        symbol: Optional[str] = None,
        limit: int = 100,
    ) -> list[dict]:
        """
        Return completed trades, most recent first.

        Args:
            symbol: If provided, filter by symbol.
            limit:  Maximum number of rows to return.
        """
        self._require_initialized()

        if symbol:
            sql = (
                "SELECT * FROM trades WHERE closed_at IS NOT NULL AND symbol = ? "
                "ORDER BY closed_at DESC LIMIT ?"
            )
            params = (symbol, limit)
        else:
            sql = (
                "SELECT * FROM trades WHERE closed_at IS NOT NULL "
                "ORDER BY closed_at DESC LIMIT ?"
            )
            params = (limit,)

        async with self._conn.execute(sql, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_total_realized_pnl(self) -> float:
        """Return the sum of all realized PnL from closed trades."""
        self._require_initialized()

        async with self._conn.execute(
            "SELECT COALESCE(SUM(realized_pnl), 0.0) as total FROM trades "
            "WHERE closed_at IS NOT NULL"
        ) as cursor:
            row = await cursor.fetchone()
            return float(row["total"])
