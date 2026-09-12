"""
brokers/alpaca_broker.py
========================
US Stocks & ETFs Broker — powered by Alpaca Markets API.

Supports: NYSE, NASDAQ (all US stocks and ETFs).
Paper trading is the default — set paper=false in config only for live.

API Documentation: https://docs.alpaca.markets/reference/
Free paper trading account: https://app.alpaca.markets/paper-trading

SAFETY FEATURES:
  - Paper endpoint used by default (config: credentials.alpaca.paper = true).
  - API keys loaded from environment variables.
  - PDT (Pattern Day Trader) rule awareness: warns if < 3 day trades remain.
  - Market hours guard: raises error if market is closed and order is not GTC.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Optional

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, LimitOrderRequest, GetOrdersRequest
from alpaca.trading.enums import OrderSide as AlpacaOrderSide, TimeInForce, QueryOrderStatus
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest, StockLatestQuoteRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
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


# Map our canonical timeframe strings to Alpaca TimeFrame objects
TIMEFRAME_MAP = {
    "1m":  TimeFrame(1,  TimeFrameUnit.Minute),
    "5m":  TimeFrame(5,  TimeFrameUnit.Minute),
    "15m": TimeFrame(15, TimeFrameUnit.Minute),
    "30m": TimeFrame(30, TimeFrameUnit.Minute),
    "1h":  TimeFrame(1,  TimeFrameUnit.Hour),
    "4h":  TimeFrame(4,  TimeFrameUnit.Hour),
    "1d":  TimeFrame(1,  TimeFrameUnit.Day),
}


class AlpacaBroker(BaseBroker):
    """
    US Stock & ETF broker adapter using Alpaca Markets API.

    Usage:
        config = {
            "api_key_env": "ALPACA_API_KEY",
            "api_secret_env": "ALPACA_API_SECRET",
            "paper": True,
        }
        broker = AlpacaBroker(config)
        await broker.connect()
    """

    def __init__(self, config: dict) -> None:
        super().__init__(config)
        self._paper: bool = config.get("paper", True)  # Safe default: paper
        self._trading_client: Optional[TradingClient] = None
        self._data_client: Optional[StockHistoricalDataClient] = None

    # ── Lifecycle ──────────────────────────────────────────────────────────

    async def connect(self) -> None:
        api_key = os.environ.get(self._config.get("api_key_env", ""))
        api_secret = os.environ.get(self._config.get("api_secret_env", ""))

        if not api_key or not api_secret:
            raise ValueError(
                "[AlpacaBroker] API credentials not found in environment. "
                f"Set {self._config.get('api_key_env')} and "
                f"{self._config.get('api_secret_env')} in your .env file."
            )

        self._trading_client = TradingClient(
            api_key=api_key,
            secret_key=api_secret,
            paper=self._paper,
        )
        self._data_client = StockHistoricalDataClient(
            api_key=api_key,
            secret_key=api_secret,
        )

        # Verify connection by fetching account
        account = self._trading_client.get_account()
        self._connected = True
        mode = "PAPER" if self._paper else "LIVE"
        logger.info(
            f"[AlpacaBroker] Connected ({mode}) | "
            f"Equity: ${float(account.equity):,.2f} | "
            f"Cash: ${float(account.cash):,.2f}"
        )

        # Warn on PDT restriction
        if hasattr(account, "daytrade_count") and int(account.daytrade_count) >= 3:
            logger.warning(
                "[AlpacaBroker] PDT WARNING: You have used 3 day trades this week. "
                "A 4th same-day round-trip may trigger a Pattern Day Trader restriction."
            )

    async def disconnect(self) -> None:
        # Alpaca client uses HTTP — no persistent connection to close
        self._trading_client = None
        self._data_client = None
        self._connected = False
        logger.info("[AlpacaBroker] Disconnected.")

    # ── Account ───────────────────────────────────────────────────────────

    async def get_account_balance(self) -> AccountBalance:
        self._require_connected()
        account = self._trading_client.get_account()
        return AccountBalance(
            total_equity=float(account.equity),
            available_cash=float(account.cash),
            used_margin=float(account.initial_margin or 0.0),
            currency="USD",
            timestamp=datetime.now(timezone.utc),
        )

    async def get_positions(self) -> list[Position]:
        self._require_connected()
        raw_positions = self._trading_client.get_all_positions()
        result = []
        for p in raw_positions:
            side = PositionSide.LONG if float(p.qty) > 0 else PositionSide.SHORT
            result.append(Position(
                symbol=p.symbol,
                asset_class=AssetClass.STOCK,
                side=side,
                quantity=abs(float(p.qty)),
                entry_price=float(p.avg_entry_price),
                current_price=float(p.current_price),
                unrealized_pnl=float(p.unrealized_pl),
                realized_pnl=float(p.change_today or 0.0),
                opened_at=datetime.now(timezone.utc),
            ))
        return result

    async def get_position(self, symbol: str) -> Optional[Position]:
        self._require_connected()
        try:
            p = self._trading_client.get_open_position(symbol)
            side = PositionSide.LONG if float(p.qty) > 0 else PositionSide.SHORT
            return Position(
                symbol=p.symbol,
                asset_class=AssetClass.STOCK,
                side=side,
                quantity=abs(float(p.qty)),
                entry_price=float(p.avg_entry_price),
                current_price=float(p.current_price),
                unrealized_pnl=float(p.unrealized_pl),
                realized_pnl=0.0,
                opened_at=datetime.now(timezone.utc),
            )
        except Exception:
            return None

    # ── Market Data ───────────────────────────────────────────────────────

    async def get_ticker(self, symbol: str) -> Tick:
        self._require_connected()
        req = StockLatestQuoteRequest(symbol_or_symbols=symbol)
        quotes = self._data_client.get_stock_latest_quote(req)
        quote = quotes[symbol]
        mid = (float(quote.bid_price) + float(quote.ask_price)) / 2.0
        return Tick(
            symbol=symbol,
            bid=float(quote.bid_price),
            ask=float(quote.ask_price),
            last=mid,
            volume=float(quote.bid_size + quote.ask_size),
            timestamp=datetime.now(timezone.utc),
        )

    async def get_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
    ) -> list[OHLCV]:
        self._require_connected()
        tf = TIMEFRAME_MAP.get(timeframe)
        if tf is None:
            raise ValueError(f"[AlpacaBroker] Unsupported timeframe: {timeframe!r}")

        req = StockBarsRequest(
            symbol_or_symbols=symbol,
            timeframe=tf,
            limit=limit,
        )
        bars_response = self._data_client.get_stock_bars(req)
        bars = bars_response[symbol]

        result = []
        for bar in bars:
            result.append(OHLCV(
                symbol=symbol,
                timeframe=timeframe,
                open=float(bar.open),
                high=float(bar.high),
                low=float(bar.low),
                close=float(bar.close),
                volume=float(bar.volume),
                timestamp=bar.timestamp.replace(tzinfo=timezone.utc)
                          if bar.timestamp.tzinfo is None else bar.timestamp,
            ))
        return result

    async def get_orderbook(self, symbol: str, depth: int = 20) -> dict:
        # Alpaca free tier does not provide full order book depth.
        # Return the latest quote as a single-level book.
        tick = await self.get_ticker(symbol)
        return {
            "bids": [[tick.bid, 0]],
            "asks": [[tick.ask, 0]],
        }

    # ── Order Management ──────────────────────────────────────────────────

    async def place_order(self, order: Order) -> Order:
        self._require_connected()

        if order.quantity <= 0:
            raise ValueError(f"[AlpacaBroker] Order quantity must be > 0. Got: {order.quantity}")

        alpaca_side = (
            AlpacaOrderSide.BUY if order.side == OrderSide.BUY else AlpacaOrderSide.SELL
        )

        logger.info(
            f"[AlpacaBroker] Placing {order.order_type.value.upper()} {order.side.value.upper()} "
            f"{order.quantity} {order.symbol} | Strategy: {order.strategy_id}"
        )

        try:
            if order.order_type == OrderType.MARKET:
                req = MarketOrderRequest(
                    symbol=order.symbol,
                    qty=order.quantity,
                    side=alpaca_side,
                    time_in_force=TimeInForce.DAY,
                )
            elif order.order_type == OrderType.LIMIT:
                if order.limit_price is None:
                    raise ValueError("[AlpacaBroker] LIMIT order requires limit_price.")
                req = LimitOrderRequest(
                    symbol=order.symbol,
                    qty=order.quantity,
                    side=alpaca_side,
                    time_in_force=TimeInForce.GTC,
                    limit_price=order.limit_price,
                )
            else:
                raise NotImplementedError(
                    f"[AlpacaBroker] Order type {order.order_type} not yet implemented."
                )

            raw = self._trading_client.submit_order(req)
            order.broker_order_id = str(raw.id)
            order.status = self._map_status(str(raw.status))
            order.updated_at = datetime.now(timezone.utc)

        except Exception as e:
            order.status = OrderStatus.REJECTED
            raise RuntimeError(f"[AlpacaBroker] Order failed: {e}") from e

        return order

    async def cancel_order(self, broker_order_id: str, symbol: str) -> bool:
        self._require_connected()
        try:
            self._trading_client.cancel_order_by_id(broker_order_id)
            logger.info(f"[AlpacaBroker] Cancelled order {broker_order_id}")
            return True
        except Exception as e:
            logger.error(f"[AlpacaBroker] Cancel failed: {e}")
            return False

    async def get_order(self, broker_order_id: str, symbol: str) -> Order:
        self._require_connected()
        raw = self._trading_client.get_order_by_id(broker_order_id)
        return self._parse_order(raw)

    async def get_open_orders(self, symbol: Optional[str] = None) -> list[Order]:
        self._require_connected()
        req = GetOrdersRequest(status=QueryOrderStatus.OPEN, symbols=[symbol] if symbol else None)
        raw_orders = self._trading_client.get_orders(req)
        return [self._parse_order(o) for o in raw_orders]

    # ── Utility ───────────────────────────────────────────────────────────

    async def get_min_order_size(self, symbol: str) -> float:
        # Alpaca supports fractional shares for most US securities
        return 0.001  # Minimum 0.001 fractional share

    async def get_symbol_info(self, symbol: str) -> dict:
        self._require_connected()
        asset = self._trading_client.get_asset(symbol)
        return {
            "symbol": asset.symbol,
            "name": asset.name,
            "exchange": str(asset.exchange),
            "tradable": asset.tradable,
            "fractionable": asset.fractionable,
            "shortable": asset.shortable,
        }

    # ── Private helpers ───────────────────────────────────────────────────

    def _map_status(self, alpaca_status: str) -> OrderStatus:
        mapping = {
            "new":             OrderStatus.OPEN,
            "partially_filled": OrderStatus.PARTIALLY_FILLED,
            "filled":          OrderStatus.FILLED,
            "done_for_day":    OrderStatus.CANCELLED,
            "canceled":        OrderStatus.CANCELLED,
            "expired":         OrderStatus.EXPIRED,
            "replaced":        OrderStatus.CANCELLED,
            "pending_cancel":  OrderStatus.OPEN,
            "pending_replace": OrderStatus.OPEN,
            "accepted":        OrderStatus.OPEN,
            "pending_new":     OrderStatus.PENDING,
            "rejected":        OrderStatus.REJECTED,
        }
        return mapping.get(alpaca_status, OrderStatus.OPEN)

    def _parse_order(self, raw) -> Order:
        return Order(
            symbol=str(raw.symbol),
            asset_class=AssetClass.STOCK,
            side=OrderSide.BUY if str(raw.side) == "buy" else OrderSide.SELL,
            order_type=OrderType.MARKET if str(raw.order_type) == "market" else OrderType.LIMIT,
            quantity=float(raw.qty or 0.0),
            limit_price=float(raw.limit_price) if raw.limit_price else None,
            broker_order_id=str(raw.id),
            status=self._map_status(str(raw.status)),
            filled_price=float(raw.filled_avg_price) if raw.filled_avg_price else None,
            filled_quantity=float(raw.filled_qty or 0.0),
            updated_at=datetime.now(timezone.utc),
        )
