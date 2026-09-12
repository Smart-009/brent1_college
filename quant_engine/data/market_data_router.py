"""
data/market_data_router.py
===========================
Unified Market Data Router — the single entry point for all data access.

The rest of the trading system (regime engine, strategies, risk manager)
NEVER imports a specific broker or feed directly. They call the router,
which dispatches to the correct underlying source based on asset class.

This means:
  - Swapping Alpaca for IBKR for stocks requires changing ONE line in config.
  - Adding a new exchange requires adding ONE entry to this router.
  - Backtesting and live trading use the same interface — the router
    swaps in the historical loader instead of live feeds during backtest mode.

RESPONSIBILITIES:
  1. Initialize and manage all broker connections.
  2. Start and stop all WebSocket feeds.
  3. Provide unified get_ohlcv(), get_ticker(), get_orderbook() methods.
  4. Maintain the shared OHLCVRingBuffer and TickRingBuffer for each symbol.
"""

from __future__ import annotations

import os
from typing import Optional

import yaml
from dotenv import load_dotenv
from loguru import logger

from brokers.alpaca_broker import AlpacaBroker
from brokers.base_broker import OHLCV, AccountBalance, AssetClass, BaseBroker, Tick
from brokers.ccxt_broker import CCXTBroker
from brokers.mt5_broker import MT5Broker
from data.ring_buffer import OHLCVRingBuffer, TickRingBuffer
from data.websocket_feeds import AlpacaWebSocketFeed, CCXTWebSocketFeed

# Load environment variables from .env file
load_dotenv()


class MarketDataRouter:
    """
    Central dispatcher for all market data access across all asset classes.

    Usage:
        router = MarketDataRouter("config/config.yaml")
        await router.initialize()

        bars = await router.get_ohlcv("BTC/USDT", "15m", limit=200)
        tick = await router.get_ticker("AAPL")

        await router.shutdown()
    """

    def __init__(self, config_path: str = "config/config.yaml") -> None:
        with open(config_path, "r") as f:
            self._cfg = yaml.safe_load(f)

        self._mode: str = self._cfg["trading"]["mode"]  # "paper" | "live"

        # Broker instances — initialized on startup
        self._brokers: dict[str, BaseBroker] = {}

        # Ring buffers — one per (symbol, timeframe) combination
        self._ohlcv_buffers: dict[str, OHLCVRingBuffer] = {}
        self._tick_buffers: dict[str, TickRingBuffer] = {}

        # Active WebSocket feed tasks
        self._feeds: list = []

    # ── Lifecycle ──────────────────────────────────────────────────────────

    async def initialize(self) -> None:
        """Connect all enabled brokers and start all WebSocket feeds."""
        logger.info(f"[DataRouter] Initializing in {self._mode.upper()} mode...")

        await self._initialize_crypto()
        await self._initialize_stocks_us()
        await self._initialize_forex()

        logger.info("[DataRouter] All brokers connected. Starting WebSocket feeds...")
        await self._start_feeds()
        logger.info("[DataRouter] Ready.")

    async def shutdown(self) -> None:
        """Stop all feeds and disconnect all brokers cleanly."""
        logger.info("[DataRouter] Shutting down...")

        # Stop all WebSocket feeds
        for feed in self._feeds:
            await feed.stop()
        self._feeds.clear()

        # Disconnect all brokers
        for name, broker in self._brokers.items():
            try:
                await broker.disconnect()
            except Exception as e:
                logger.error(f"[DataRouter] Error disconnecting {name}: {e}")

        self._brokers.clear()
        logger.info("[DataRouter] Shutdown complete.")

    # ── Data Access (Unified API) ──────────────────────────────────────────

    async def get_ohlcv(
        self,
        symbol: str,
        timeframe: str,
        limit: int = 500,
        asset_class: Optional[str] = None,
    ) -> list[OHLCV]:
        """
        Fetch historical OHLCV bars for any symbol.

        First checks if the ring buffer has enough data.
        Falls back to a broker REST call if buffer is insufficiently populated.

        Args:
            symbol:      Trading symbol (e.g. "BTC/USDT", "AAPL", "EURUSD").
            timeframe:   Candle size string ("1m", "15m", "1h", "4h", "1d").
            limit:       Number of bars to return.
            asset_class: Optional hint ("crypto", "stock", "forex").

        Returns:
            List of OHLCV bars, oldest first.
        """
        buf_key = f"{symbol}:{timeframe}"
        if buf_key in self._ohlcv_buffers:
            buf = self._ohlcv_buffers[buf_key]
            if buf.size >= limit:
                df = buf.to_dataframe()
                # Convert DataFrame rows back to OHLCV objects
                result = []
                for idx, row in df.tail(limit).iterrows():
                    result.append(OHLCV(
                        symbol=symbol,
                        timeframe=timeframe,
                        open=float(row["open"]),
                        high=float(row["high"]),
                        low=float(row["low"]),
                        close=float(row["close"]),
                        volume=float(row["volume"]),
                        timestamp=idx.to_pydatetime(),
                    ))
                return result

        # Buffer not ready or insufficient — fetch from broker REST
        broker = self._get_broker_for_symbol(symbol, asset_class)
        if broker is None:
            raise RuntimeError(
                f"[DataRouter] No broker available for symbol {symbol!r}. "
                "Check config.yaml markets settings."
            )
        bars = await broker.get_ohlcv(symbol, timeframe, limit=limit)

        # Populate ring buffer with fetched data
        if buf_key not in self._ohlcv_buffers:
            self._ohlcv_buffers[buf_key] = OHLCVRingBuffer(symbol, timeframe, capacity=max(limit, 500))
        self._ohlcv_buffers[buf_key].push_many(bars)

        return bars

    async def get_ticker(self, symbol: str, asset_class: Optional[str] = None) -> Tick:
        """
        Fetch the latest bid/ask/last price for a symbol.
        Checks the tick ring buffer first, falls back to broker REST call.
        """
        tick_key = symbol
        if tick_key in self._tick_buffers:
            buf = self._tick_buffers[tick_key]
            latest = buf.get_latest_spread()
            if latest is not None:
                # Reconstruct a Tick from the buffer's raw array is complex;
                # for simplicity, fall through to broker for latest tick always
                pass

        broker = self._get_broker_for_symbol(symbol, asset_class)
        if broker is None:
            raise RuntimeError(f"[DataRouter] No broker for symbol {symbol!r}")
        return await broker.get_ticker(symbol)

    async def get_orderbook(self, symbol: str, depth: int = 20) -> dict:
        """Fetch the current order book for a symbol."""
        broker = self._get_broker_for_symbol(symbol)
        if broker is None:
            raise RuntimeError(f"[DataRouter] No broker for symbol {symbol!r}")
        return await broker.get_orderbook(symbol, depth=depth)

    def get_ohlcv_buffer(self, symbol: str, timeframe: str) -> Optional[OHLCVRingBuffer]:
        """Return the live OHLCV ring buffer for a symbol/timeframe pair."""
        return self._ohlcv_buffers.get(f"{symbol}:{timeframe}")

    def get_tick_buffer(self, symbol: str) -> Optional[TickRingBuffer]:
        """Return the live tick ring buffer for a symbol."""
        return self._tick_buffers.get(symbol)

    def get_broker(self, name: str) -> Optional[BaseBroker]:
        """Return a specific broker by name (e.g. 'crypto', 'stocks_us', 'forex')."""
        return self._brokers.get(name)

    # ── Private: Initialization ────────────────────────────────────────────

    async def _initialize_crypto(self) -> None:
        cfg = self._cfg.get("markets", {}).get("crypto", {})
        if not cfg.get("enabled", False):
            logger.info("[DataRouter] Crypto market disabled in config.")
            return

        cred_key = cfg.get("exchange", "binance")
        cred = self._cfg.get("credentials", {}).get(cred_key, {})

        broker = CCXTBroker({
            "exchange":      cfg.get("exchange", "binance"),
            "api_key_env":   cred.get("api_key_env", "BINANCE_API_KEY"),
            "api_secret_env": cred.get("api_secret_env", "BINANCE_API_SECRET"),
            "testnet":       cred.get("testnet", True),
        })
        await broker.connect()
        self._brokers["crypto"] = broker

        # Pre-load historical data into ring buffers for all crypto symbols
        symbols = cfg.get("symbols", [])
        timeframes = cfg.get("timeframes", ["15m"])
        for symbol in symbols:
            for tf in timeframes:
                key = f"{symbol}:{tf}"
                self._ohlcv_buffers[key] = OHLCVRingBuffer(symbol, tf, capacity=500)
                bars = await broker.get_ohlcv(symbol, tf, limit=500)
                self._ohlcv_buffers[key].push_many(bars)
            self._tick_buffers[symbol] = TickRingBuffer(symbol, capacity=10_000)
        logger.info(f"[DataRouter] Crypto: {len(symbols)} symbols pre-loaded.")

    async def _initialize_stocks_us(self) -> None:
        cfg = self._cfg.get("markets", {}).get("stocks_us", {})
        if not cfg.get("enabled", False):
            logger.info("[DataRouter] US Stocks market disabled in config.")
            return

        cred = self._cfg.get("credentials", {}).get("alpaca", {})
        broker = AlpacaBroker({
            "api_key_env":    cred.get("api_key_env", "ALPACA_API_KEY"),
            "api_secret_env": cred.get("api_secret_env", "ALPACA_API_SECRET"),
            "paper":          cred.get("paper", True),
        })
        try:
            await broker.connect()
            self._brokers["stocks_us"] = broker

            symbols = cfg.get("symbols", [])
            timeframes = cfg.get("timeframes", ["15m", "1d"])
            for symbol in symbols:
                for tf in timeframes:
                    key = f"{symbol}:{tf}"
                    self._ohlcv_buffers[key] = OHLCVRingBuffer(symbol, tf, capacity=500)
                    try:
                        bars = await broker.get_ohlcv(symbol, tf, limit=500)
                        self._ohlcv_buffers[key].push_many(bars)
                    except Exception as e:
                        logger.warning(f"[DataRouter] Could not pre-load {symbol} {tf}: {e}")
                self._tick_buffers[symbol] = TickRingBuffer(symbol, capacity=10_000)
            logger.info(f"[DataRouter] US Stocks: {len(symbols)} symbols pre-loaded.")
        except Exception as e:
            logger.warning(
                f"[DataRouter] US Stocks broker (Alpaca) failed to connect: {e}. "
                "US Stocks trading will be disabled for this session."
            )

    async def _initialize_forex(self) -> None:
        cfg = self._cfg.get("markets", {}).get("forex", {})
        if not cfg.get("enabled", False):
            logger.info("[DataRouter] Forex market disabled in config.")
            return

        cred = self._cfg.get("credentials", {}).get("mt5", {})
        broker = MT5Broker({
            "login_env":    cred.get("login_env", "MT5_LOGIN"),
            "password_env": cred.get("password_env", "MT5_PASSWORD"),
            "server_env":   cred.get("server_env", "MT5_SERVER"),
        })
        try:
            await broker.connect()
            self._brokers["forex"] = broker

            symbols = cfg.get("symbols", [])
            timeframes = cfg.get("timeframes", ["15m", "4h"])
            for symbol in symbols:
                for tf in timeframes:
                    key = f"{symbol}:{tf}"
                    self._ohlcv_buffers[key] = OHLCVRingBuffer(symbol, tf, capacity=500)
                    try:
                        bars = await broker.get_ohlcv(symbol, tf, limit=500)
                        self._ohlcv_buffers[key].push_many(bars)
                    except Exception as e:
                        logger.warning(f"[DataRouter] Could not pre-load {symbol} {tf}: {e}")
                self._tick_buffers[symbol] = TickRingBuffer(symbol, capacity=10_000)
            logger.info(f"[DataRouter] Forex: {len(symbols)} symbols pre-loaded.")
        except Exception as e:
            logger.warning(
                f"[DataRouter] Forex broker (MT5) failed to connect: {e}. "
                "Forex trading will be disabled for this session."
            )

    async def _start_feeds(self) -> None:
        """Start WebSocket feeds for all enabled and connected brokers."""
        crypto_broker = self._brokers.get("crypto")
        if crypto_broker:
            cfg = self._cfg["markets"]["crypto"]
            cred_key = cfg.get("exchange", "binance")
            cred = self._cfg["credentials"].get(cred_key, {})
            api_key = os.environ.get(cred.get("api_key_env", ""), "")
            api_secret = os.environ.get(cred.get("api_secret_env", ""), "")
            primary_tf = cfg.get("primary_timeframe", "15m")

            for symbol in cfg.get("symbols", []):
                ohlcv_buf = self._ohlcv_buffers.get(f"{symbol}:{primary_tf}")
                tick_buf = self._tick_buffers.get(symbol)
                if ohlcv_buf is not None and tick_buf is not None:
                    feed = CCXTWebSocketFeed(
                        symbol=symbol,
                        exchange_id=cfg.get("exchange", "binance"),
                        timeframe=primary_tf,
                        ohlcv_buffer=ohlcv_buf,
                        tick_buffer=tick_buf,
                        api_key=api_key,
                        api_secret=api_secret,
                        testnet=cred.get("testnet", True),
                    )
                    await feed.start()
                    self._feeds.append(feed)

        stocks_broker = self._brokers.get("stocks_us")
        if stocks_broker:
            cfg = self._cfg["markets"]["stocks_us"]
            cred = self._cfg["credentials"].get("alpaca", {})
            api_key = os.environ.get(cred.get("api_key_env", ""), "")
            api_secret = os.environ.get(cred.get("api_secret_env", ""), "")

            for symbol in cfg.get("symbols", []):
                ohlcv_buf = self._ohlcv_buffers.get(f"{symbol}:1m")
                tick_buf = self._tick_buffers.get(symbol)
                if ohlcv_buf is not None and tick_buf is not None:
                    feed = AlpacaWebSocketFeed(
                        symbol=symbol,
                        ohlcv_buffer=ohlcv_buf,
                        tick_buffer=tick_buf,
                        api_key=api_key,
                        api_secret=api_secret,
                        paper=cred.get("paper", True),
                    )
                    await feed.start()
                    self._feeds.append(feed)

        logger.info(f"[DataRouter] {len(self._feeds)} WebSocket feeds started.")

    # ── Private: Symbol-to-Broker Routing ─────────────────────────────────

    def _get_broker_for_symbol(
        self,
        symbol: str,
        asset_class_hint: Optional[str] = None,
    ) -> Optional[BaseBroker]:
        """
        Determine which broker to use for a given symbol.
        Uses asset_class_hint if provided, otherwise infers from symbol format.
        """
        if asset_class_hint:
            return self._brokers.get(asset_class_hint)

        # Infer from symbol format
        if "/" in symbol:
            # e.g. "BTC/USDT" → crypto
            return self._brokers.get("crypto")
        elif len(symbol) == 6 and symbol.isupper():
            # e.g. "EURUSD", "XAUUSD" → forex
            return self._brokers.get("forex")
        else:
            # e.g. "AAPL", "SPY" → US stock
            return self._brokers.get("stocks_us")
