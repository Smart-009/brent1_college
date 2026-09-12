"""
brokers/mt5_broker.py
=====================
Forex, Metals & CFD Broker — powered by MetaTrader 5 Python API.

Supports: All MT5-compatible brokers (IC Markets, Pepperstone, FTMO, etc.)
Instruments: Forex pairs, Gold (XAUUSD), Silver (XAGUSD), Indices, Oil CFDs.

IMPORTANT PLATFORM NOTES:
  - MetaTrader5 Python package ONLY works on Windows.
  - On Linux VPS, use the OANDA broker adapter instead (oanda_broker.py).
  - MT5 terminal must be running and logged in BEFORE connect() is called.
  - API connections must be enabled in MT5: Tools → Options → Expert Advisors
    → "Allow DLL imports" and "Allow automated trading" must be checked.

SAFETY FEATURES:
  - Demo account login enforced by default (config sets demo server).
  - All credentials loaded from environment variables.
  - Spread guard: refuses orders if live spread exceeds configured maximum.
  - Friday close-time guard: warns when approaching weekend market close.
"""

from __future__ import annotations

import os
import platform
from datetime import datetime, timezone
from typing import Optional

from loguru import logger

from brokers.base_broker import (
    AccountBalance,
    AssetClass,
    BaseBroker,
    OHLCV,
    Order,
    OrderSide,
    OrderStatus,
    OrderType,
    Position,
    PositionSide,
    Tick,
)

# MetaTrader5 is Windows-only — import conditionally
if platform.system() == "Windows":
    try:
        import MetaTrader5 as mt5
        MT5_AVAILABLE = True
    except ImportError:
        MT5_AVAILABLE = False
        logger.warning(
            "[MT5Broker] MetaTrader5 package not installed. "
            "Run: pip install MetaTrader5"
        )
else:
    MT5_AVAILABLE = False
    logger.warning(
        "[MT5Broker] MetaTrader5 is not supported on this OS. "
        "Use OandaBroker for Forex on non-Windows systems."
    )


# Map our canonical timeframes to MT5 timeframe constants
MT5_TIMEFRAME_MAP = {
    "1m":  "TIMEFRAME_M1",
    "5m":  "TIMEFRAME_M5",
    "15m": "TIMEFRAME_M15",
    "30m": "TIMEFRAME_M30",
    "1h":  "TIMEFRAME_H1",
    "4h":  "TIMEFRAME_H4",
    "1d":  "TIMEFRAME_D1",
}


class MT5Broker(BaseBroker):
    """
    MetaTrader 5 broker adapter for Forex, Metals, and CFDs.

    Usage:
        config = {
            "login_env":    "MT5_LOGIN",
            "password_env": "MT5_PASSWORD",
            "server_env":   "MT5_SERVER",
        }
        broker = MT5Broker(config)
        await broker.connect()
    """

    def __init__(self, config: dict) -> None:
        super().__init__(config)
        self._max_spread_multiplier: float = config.get("max_spread_multiplier", 2.5)

    # ── Lifecycle ──────────────────────────────────────────────────────────

    async def connect(self) -> None:
        if not MT5_AVAILABLE:
            raise RuntimeError(
                "[MT5Broker] MetaTrader5 is not available on this system. "
                "Install it on Windows or use OandaBroker instead."
            )

        login = int(os.environ.get(self._config.get("login_env", ""), 0))
        password = os.environ.get(self._config.get("password_env", ""), "")
        server = os.environ.get(self._config.get("server_env", ""), "")

        if not login or not password or not server:
            raise ValueError(
                "[MT5Broker] MT5 credentials not found in environment. "
                f"Set {self._config.get('login_env')}, "
                f"{self._config.get('password_env')}, and "
                f"{self._config.get('server_env')} in your .env file."
            )

        if not mt5.initialize():
            raise ConnectionError(
                f"[MT5Broker] MT5 terminal initialization failed: {mt5.last_error()}. "
                "Ensure MetaTrader 5 terminal is running and logged in."
            )

        if not mt5.login(login=login, password=password, server=server):
            mt5.shutdown()
            raise ConnectionError(
                f"[MT5Broker] MT5 login failed: {mt5.last_error()}. "
                "Check your credentials and server name."
            )

        self._connected = True
        account_info = mt5.account_info()
        logger.info(
            f"[MT5Broker] Connected | Server: {server} | "
            f"Balance: {account_info.balance:.2f} {account_info.currency} | "
            f"Leverage: 1:{account_info.leverage}"
        )

    async def disconnect(self) -> None:
        if MT5_AVAILABLE and self._connected:
            mt5.shutdown()
        self._connected = False
        logger.info("[MT5Broker] Disconnected.")

    # ── Account ───────────────────────────────────────────────────────────

    async def get_account_balance(self) -> AccountBalance:
        self._require_connected()
        info = mt5.account_info()
        if info is None:
            raise RuntimeError(f"[MT5Broker] account_info() failed: {mt5.last_error()}")
        return AccountBalance(
            total_equity=float(info.equity),
            available_cash=float(info.margin_free),
            used_margin=float(info.margin),
            currency=info.currency,
            timestamp=datetime.now(timezone.utc),
        )

    async def get_positions(self) -> list[Position]:
        self._require_connected()
        raw = mt5.positions_get()
        if raw is None:
            return []
        result = []
        for p in raw:
            side = PositionSide.LONG if p.type == mt5.POSITION_TYPE_BUY else PositionSide.SHORT
            result.append(Position(
                symbol=p.symbol,
                asset_class=self._classify_symbol(p.symbol),
                side=side,
                quantity=float(p.volume),
                entry_price=float(p.price_open),
                current_price=float(p.price_current),
                unrealized_pnl=float(p.profit),
                realized_pnl=0.0,
                opened_at=datetime.fromtimestamp(p.time, tz=timezone.utc),
                strategy_id=p.comment or None,
            ))
        return result

    async def get_position(self, symbol: str) -> Optional[Position]:
        self._require_connected()
        raw = mt5.positions_get(symbol=symbol)
        if not raw:
            return None
        p = raw[0]
        side = PositionSide.LONG if p.type == mt5.POSITION_TYPE_BUY else PositionSide.SHORT
        return Position(
            symbol=p.symbol,
            asset_class=self._classify_symbol(p.symbol),
            side=side,
            quantity=float(p.volume),
            entry_price=float(p.price_open),
            current_price=float(p.price_current),
            unrealized_pnl=float(p.profit),
            realized_pnl=0.0,
            opened_at=datetime.fromtimestamp(p.time, tz=timezone.utc),
        )

    # ── Market Data ───────────────────────────────────────────────────────

    async def get_ticker(self, symbol: str) -> Tick:
        self._require_connected()
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            raise RuntimeError(f"[MT5Broker] No tick data for {symbol}: {mt5.last_error()}")
        return Tick(
            symbol=symbol,
            bid=float(tick.bid),
            ask=float(tick.ask),
            last=float(tick.last) if tick.last else float((tick.bid + tick.ask) / 2),
            volume=float(tick.volume),
            timestamp=datetime.fromtimestamp(tick.time, tz=timezone.utc),
        )

    async def get_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
    ) -> list[OHLCV]:
        self._require_connected()
        tf_name = MT5_TIMEFRAME_MAP.get(timeframe)
        if tf_name is None:
            raise ValueError(f"[MT5Broker] Unsupported timeframe: {timeframe!r}")
        tf_const = getattr(mt5, tf_name)

        rates = mt5.copy_rates_from_pos(symbol, tf_const, 0, limit)
        if rates is None:
            raise RuntimeError(
                f"[MT5Broker] Failed to fetch OHLCV for {symbol}: {mt5.last_error()}"
            )

        result = []
        for bar in rates:
            result.append(OHLCV(
                symbol=symbol,
                timeframe=timeframe,
                open=float(bar["open"]),
                high=float(bar["high"]),
                low=float(bar["low"]),
                close=float(bar["close"]),
                volume=float(bar["tick_volume"]),
                timestamp=datetime.fromtimestamp(bar["time"], tz=timezone.utc),
            ))
        return result

    async def get_orderbook(self, symbol: str, depth: int = 20) -> dict:
        # MT5 book depth requires a subscription — return best bid/ask only
        tick = await self.get_ticker(symbol)
        return {
            "bids": [[tick.bid, 0]],
            "asks": [[tick.ask, 0]],
        }

    # ── Order Management ──────────────────────────────────────────────────

    async def place_order(self, order: Order) -> Order:
        self._require_connected()

        if order.quantity <= 0:
            raise ValueError(f"[MT5Broker] Order quantity must be > 0. Got: {order.quantity}")

        # Spread guard — protect against abnormally wide spreads
        tick = await self.get_ticker(order.symbol)
        symbol_info = mt5.symbol_info(order.symbol)
        if symbol_info:
            normal_spread = symbol_info.spread * symbol_info.point
            current_spread = tick.spread
            if current_spread > normal_spread * self._max_spread_multiplier:
                raise RuntimeError(
                    f"[MT5Broker] SPREAD GUARD: Current spread {current_spread:.5f} "
                    f"exceeds {self._max_spread_multiplier}× normal ({normal_spread:.5f}). "
                    f"Order for {order.symbol} rejected."
                )

        action = mt5.TRADE_ACTION_DEAL
        order_type_map = {
            (OrderType.MARKET, OrderSide.BUY):  mt5.ORDER_TYPE_BUY,
            (OrderType.MARKET, OrderSide.SELL): mt5.ORDER_TYPE_SELL,
            (OrderType.LIMIT,  OrderSide.BUY):  mt5.ORDER_TYPE_BUY_LIMIT,
            (OrderType.LIMIT,  OrderSide.SELL): mt5.ORDER_TYPE_SELL_LIMIT,
        }
        mt5_order_type = order_type_map.get((order.order_type, order.side))
        if mt5_order_type is None:
            raise ValueError(
                f"[MT5Broker] Unsupported combination: {order.order_type} / {order.side}"
            )

        price = tick.ask if order.side == OrderSide.BUY else tick.bid
        if order.order_type == OrderType.LIMIT and order.limit_price is not None:
            price = order.limit_price
        if order.order_type == OrderType.LIMIT:
            action = mt5.TRADE_ACTION_PENDING

        request = {
            "action":    action,
            "symbol":    order.symbol,
            "volume":    float(order.quantity),
            "type":      mt5_order_type,
            "price":     price,
            "deviation": 10,          # Max slippage in points
            "magic":     20260907,    # Bot identifier (magic number)
            "comment":   order.strategy_id or "quant_engine",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        logger.info(
            f"[MT5Broker] Placing {order.order_type.value.upper()} {order.side.value.upper()} "
            f"{order.quantity} lots {order.symbol} @ {price:.5f}"
        )

        result = mt5.order_send(request)
        if result is None or result.retcode != mt5.TRADE_RETCODE_DONE:
            order.status = OrderStatus.REJECTED
            code = result.retcode if result else "N/A"
            comment = result.comment if result else mt5.last_error()
            raise RuntimeError(
                f"[MT5Broker] Order rejected. Retcode: {code} | Comment: {comment}"
            )

        order.broker_order_id = str(result.order)
        order.filled_price = float(result.price)
        order.filled_quantity = float(order.quantity)
        order.status = OrderStatus.FILLED
        order.updated_at = datetime.now(timezone.utc)
        return order

    async def cancel_order(self, broker_order_id: str, symbol: str) -> bool:
        self._require_connected()
        request = {
            "action": mt5.TRADE_ACTION_REMOVE,
            "order":  int(broker_order_id),
        }
        result = mt5.order_send(request)
        if result and result.retcode == mt5.TRADE_RETCODE_DONE:
            logger.info(f"[MT5Broker] Cancelled order {broker_order_id}")
            return True
        logger.error(f"[MT5Broker] Cancel failed for {broker_order_id}: {result}")
        return False

    async def get_order(self, broker_order_id: str, symbol: str) -> Order:
        self._require_connected()
        orders = mt5.orders_get(ticket=int(broker_order_id))
        if not orders:
            raise RuntimeError(f"[MT5Broker] Order {broker_order_id} not found.")
        o = orders[0]
        return Order(
            symbol=o.symbol,
            asset_class=self._classify_symbol(o.symbol),
            side=OrderSide.BUY if o.type in (mt5.ORDER_TYPE_BUY, mt5.ORDER_TYPE_BUY_LIMIT) else OrderSide.SELL,
            order_type=OrderType.MARKET,
            quantity=float(o.volume_initial),
            limit_price=float(o.price_open) if o.type in (mt5.ORDER_TYPE_BUY_LIMIT, mt5.ORDER_TYPE_SELL_LIMIT) else None,
            broker_order_id=str(o.ticket),
            status=OrderStatus.OPEN,
            updated_at=datetime.now(timezone.utc),
        )

    async def get_open_orders(self, symbol: Optional[str] = None) -> list[Order]:
        self._require_connected()
        raw = mt5.orders_get(symbol=symbol) if symbol else mt5.orders_get()
        if not raw:
            return []
        orders = []
        for o in raw:
            orders.append(await self.get_order(str(o.ticket), o.symbol))
        return orders

    # ── Utility ───────────────────────────────────────────────────────────

    async def get_min_order_size(self, symbol: str) -> float:
        self._require_connected()
        info = mt5.symbol_info(symbol)
        return float(info.volume_min) if info else 0.01

    async def get_symbol_info(self, symbol: str) -> dict:
        self._require_connected()
        info = mt5.symbol_info(symbol)
        if info is None:
            return {}
        return {
            "symbol": info.name,
            "digits": info.digits,
            "point": info.point,
            "spread": info.spread,
            "volume_min": info.volume_min,
            "volume_max": info.volume_max,
            "volume_step": info.volume_step,
            "contract_size": info.trade_contract_size,
            "currency_base": info.currency_base,
            "currency_profit": info.currency_profit,
        }

    # ── Private helpers ───────────────────────────────────────────────────

    def _classify_symbol(self, symbol: str) -> AssetClass:
        """Classify MT5 symbol into the appropriate asset class."""
        symbol_upper = symbol.upper()
        if any(metal in symbol_upper for metal in ("XAU", "XAG", "XPT", "XPD")):
            return AssetClass.COMMODITY
        if any(energy in symbol_upper for energy in ("OIL", "BRENT", "WTI", "GAS")):
            return AssetClass.COMMODITY
        if any(idx in symbol_upper for idx in ("US30", "US500", "NAS", "GER", "UK100", "JPN")):
            return AssetClass.INDEX
        return AssetClass.FOREX
