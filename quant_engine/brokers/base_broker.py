"""
brokers/base_broker.py
======================
Abstract Base Broker Interface.

Every broker implementation (Alpaca, CCXT, MT5, IBKR) MUST subclass
BaseBroker and implement ALL abstract methods.

This guarantees that the rest of the system (risk manager, order manager,
paper trader) can call a single unified API regardless of which broker
or exchange is being used underneath.

Design principle: The trading engine NEVER talks directly to a broker
library. It always goes through this interface. This means swapping a
broker requires only adding a new subclass — zero changes to the core.
"""

from __future__ import annotations

import abc
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class AssetClass(str, Enum):
    CRYPTO = "crypto"
    STOCK = "stock"
    FOREX = "forex"
    COMMODITY = "commodity"
    INDEX = "index"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class OrderStatus(str, Enum):
    PENDING = "pending"
    OPEN = "open"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
    EXPIRED = "expired"


class PositionSide(str, Enum):
    LONG = "long"
    SHORT = "short"
    FLAT = "flat"


# ---------------------------------------------------------------------------
# Data Structures (immutable value objects)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Tick:
    """A single real-time price tick from the exchange."""
    symbol: str
    bid: float
    ask: float
    last: float
    volume: float
    timestamp: datetime

    @property
    def mid(self) -> float:
        return (self.bid + self.ask) / 2.0

    @property
    def spread(self) -> float:
        return self.ask - self.bid


@dataclass(frozen=True)
class OHLCV:
    """One price candle bar."""
    symbol: str
    timeframe: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    timestamp: datetime


@dataclass
class Order:
    """Represents an order sent to the broker."""
    symbol: str
    asset_class: AssetClass
    side: OrderSide
    order_type: OrderType
    quantity: float
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    client_order_id: Optional[str] = None
    broker_order_id: Optional[str] = None
    status: OrderStatus = OrderStatus.PENDING
    filled_price: Optional[float] = None
    filled_quantity: float = 0.0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    strategy_id: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def is_terminal(self) -> bool:
        """Returns True if the order is in a final, non-changeable state."""
        return self.status in (
            OrderStatus.FILLED,
            OrderStatus.CANCELLED,
            OrderStatus.REJECTED,
            OrderStatus.EXPIRED,
        )


@dataclass
class Position:
    """Represents a currently open position."""
    symbol: str
    asset_class: AssetClass
    side: PositionSide
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    realized_pnl: float
    opened_at: datetime
    strategy_id: Optional[str] = None

    @property
    def pnl_pct(self) -> float:
        """Unrealized PnL as a percentage of entry cost."""
        cost = self.entry_price * self.quantity
        if cost == 0:
            return 0.0
        return (self.unrealized_pnl / cost) * 100.0


@dataclass
class AccountBalance:
    """Snapshot of the account's financial state."""
    total_equity: float           # Total account value (cash + open positions)
    available_cash: float         # Free cash available to open new positions
    used_margin: float            # Margin tied up in open positions
    currency: str                 # Base currency (e.g. "USD")
    timestamp: datetime


# ---------------------------------------------------------------------------
# Abstract Base Broker
# ---------------------------------------------------------------------------

class BaseBroker(abc.ABC):
    """
    Abstract broker interface. ALL broker implementations MUST extend this
    class and implement every abstract method below.

    Usage example:
        class BinanceBroker(BaseBroker):
            async def connect(self): ...
            async def get_account_balance(self): ...
            ...
    """

    def __init__(self, config: dict) -> None:
        """
        Args:
            config: The broker's section from config.yaml (already loaded dict).
        """
        self._config = config
        self._connected: bool = False

    # ── Lifecycle ──────────────────────────────────────────────────────────

    @abc.abstractmethod
    async def connect(self) -> None:
        """
        Establish connection to the broker/exchange.
        Must set self._connected = True on success.
        Must raise ConnectionError on failure.
        """
        ...

    @abc.abstractmethod
    async def disconnect(self) -> None:
        """
        Cleanly disconnect from the broker/exchange.
        Must set self._connected = False.
        """
        ...

    @property
    def is_connected(self) -> bool:
        return self._connected

    # ── Account ───────────────────────────────────────────────────────────

    @abc.abstractmethod
    async def get_account_balance(self) -> AccountBalance:
        """
        Fetch current account balance, equity and available margin.

        Returns:
            AccountBalance snapshot.

        Raises:
            ConnectionError: If broker is not connected.
            RuntimeError: If the API call fails.
        """
        ...

    @abc.abstractmethod
    async def get_positions(self) -> list[Position]:
        """
        Fetch all currently open positions.

        Returns:
            List of Position objects. Empty list if no open positions.
        """
        ...

    @abc.abstractmethod
    async def get_position(self, symbol: str) -> Optional[Position]:
        """
        Fetch the open position for a specific symbol.

        Args:
            symbol: The trading symbol (e.g. "BTC/USDT", "AAPL", "EURUSD")

        Returns:
            Position if open, None if flat.
        """
        ...

    # ── Market Data ───────────────────────────────────────────────────────

    @abc.abstractmethod
    async def get_ticker(self, symbol: str) -> Tick:
        """
        Fetch the latest bid/ask/last price for a symbol.

        Args:
            symbol: Trading symbol.

        Returns:
            Tick with current bid, ask, last price, and volume.
        """
        ...

    @abc.abstractmethod
    async def get_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
    ) -> list[OHLCV]:
        """
        Fetch historical OHLCV candles.

        Args:
            symbol: Trading symbol.
            timeframe: Candle size string — "1m", "5m", "15m", "1h", "4h", "1d".
            limit: Number of candles to fetch (most recent N bars).

        Returns:
            List of OHLCV objects ordered oldest → newest.
        """
        ...

    @abc.abstractmethod
    async def get_orderbook(
        self,
        symbol: str,
        depth: int = 20,
    ) -> dict:
        """
        Fetch the current Level 2 order book.

        Args:
            symbol: Trading symbol.
            depth: Number of bid/ask levels to return.

        Returns:
            Dict with keys "bids" and "asks", each a list of [price, size].
        """
        ...

    # ── Order Management ──────────────────────────────────────────────────

    @abc.abstractmethod
    async def place_order(self, order: Order) -> Order:
        """
        Submit an order to the broker.

        SAFETY RULE: This method must validate that:
        - quantity > 0
        - For LIMIT orders: limit_price is provided
        - For STOP orders: stop_price is provided
        - Broker is connected

        Args:
            order: Fully populated Order object.

        Returns:
            Updated Order with broker_order_id and status set.

        Raises:
            ValueError: If order parameters are invalid.
            ConnectionError: If broker is not connected.
            RuntimeError: If the broker rejects the order.
        """
        ...

    @abc.abstractmethod
    async def cancel_order(self, broker_order_id: str, symbol: str) -> bool:
        """
        Cancel a pending or open order.

        Args:
            broker_order_id: The broker-assigned order ID.
            symbol: The trading symbol of the order.

        Returns:
            True if successfully cancelled, False if already filled/expired.
        """
        ...

    @abc.abstractmethod
    async def get_order(self, broker_order_id: str, symbol: str) -> Order:
        """
        Fetch the current state of a submitted order.

        Args:
            broker_order_id: The broker-assigned order ID.
            symbol: The trading symbol.

        Returns:
            Updated Order object with current status and fill details.
        """
        ...

    @abc.abstractmethod
    async def get_open_orders(self, symbol: Optional[str] = None) -> list[Order]:
        """
        Fetch all open/pending orders.

        Args:
            symbol: If provided, filter orders for this symbol only.

        Returns:
            List of open Order objects.
        """
        ...

    # ── Utility ───────────────────────────────────────────────────────────

    @abc.abstractmethod
    async def get_min_order_size(self, symbol: str) -> float:
        """
        Return the minimum order size (in base currency units) for a symbol.
        Used by the position sizer to avoid submitting sub-minimum orders.
        """
        ...

    @abc.abstractmethod
    async def get_symbol_info(self, symbol: str) -> dict:
        """
        Return symbol metadata: tick size, lot size, contract size,
        margin requirements, asset class.
        """
        ...

    def _require_connected(self) -> None:
        """Helper: raise ConnectionError if not connected."""
        if not self._connected:
            raise ConnectionError(
                f"{self.__class__.__name__} is not connected. "
                "Call await broker.connect() first."
            )
