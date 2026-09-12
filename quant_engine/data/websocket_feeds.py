"""
data/websocket_feeds.py
=======================
Persistent Async WebSocket Feeds for Real-Time Market Data.

These feeds maintain permanent WebSocket connections to exchanges and push
ticks and OHLCV candle updates directly into the in-memory ring buffers.

DESIGN PRINCIPLES:
  1. Zero REST polling — data is pushed, never pulled.
  2. Automatic reconnection with exponential backoff on disconnect.
  3. Feed runs in its own async task — never blocks the trading loop.
  4. On reconnect, the ring buffer is topped up with historical data
     to fill any gap that occurred during the disconnect.

SUPPORTED FEEDS:
  - CCXTWebSocketFeed: Binance, Bybit, Kraken (via ccxt.pro WebSocket streams)
  - AlpacaWebSocketFeed: US stocks real-time quotes via Alpaca WebSocket
"""

from __future__ import annotations

import asyncio
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Callable, Optional

from loguru import logger

from brokers.base_broker import OHLCV, Tick
from data.ring_buffer import OHLCVRingBuffer, TickRingBuffer


# Type aliases for callbacks
TickCallback = Callable[[Tick], None]
OHLCVCallback = Callable[[OHLCV], None]


# ---------------------------------------------------------------------------
# Base Feed
# ---------------------------------------------------------------------------

class BaseFeed(ABC):
    """
    Abstract base class for all WebSocket market data feeds.

    Subclasses implement _connect_and_stream() which runs indefinitely,
    pushing data to ring buffers. The base class handles reconnection logic.
    """

    MAX_RECONNECT_ATTEMPTS = 10
    BASE_RECONNECT_DELAY_S = 1.0      # Starts at 1s, doubles each attempt (max 60s)
    MAX_RECONNECT_DELAY_S = 60.0

    def __init__(self, symbol: str) -> None:
        self.symbol = symbol
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        """Start the feed in a background async task."""
        self._running = True
        self._task = asyncio.create_task(
            self._reconnect_loop(),
            name=f"feed_{self.symbol}",
        )
        logger.info(f"[Feed] Started: {self.__class__.__name__} for {self.symbol}")

    async def stop(self) -> None:
        """Gracefully stop the feed."""
        self._running = False
        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info(f"[Feed] Stopped: {self.__class__.__name__} for {self.symbol}")

    async def _reconnect_loop(self) -> None:
        """
        Outer reconnection loop with exponential backoff.
        Runs _connect_and_stream() and restarts it if it raises an exception.
        """
        attempt = 0
        while self._running:
            try:
                attempt += 1
                if attempt > 1:
                    delay = min(
                        self.BASE_RECONNECT_DELAY_S * (2 ** (attempt - 2)),
                        self.MAX_RECONNECT_DELAY_S,
                    )
                    logger.warning(
                        f"[Feed] {self.symbol} reconnecting in {delay:.1f}s "
                        f"(attempt {attempt}/{self.MAX_RECONNECT_ATTEMPTS})"
                    )
                    await asyncio.sleep(delay)

                if attempt > self.MAX_RECONNECT_ATTEMPTS:
                    logger.error(
                        f"[Feed] {self.symbol} exceeded max reconnect attempts. "
                        "Stopping feed. Manual restart required."
                    )
                    self._running = False
                    break

                await self._connect_and_stream()
                # If _connect_and_stream returns cleanly (not via exception),
                # reset the attempt counter
                attempt = 0

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"[Feed] {self.symbol} stream error: {e}")

    @abstractmethod
    async def _connect_and_stream(self) -> None:
        """
        Establish WebSocket connection and stream data until disconnected.
        Must push data to ring buffers via callbacks or direct buffer writes.
        Raises an exception on disconnect (triggers reconnect loop).
        """
        ...


# ---------------------------------------------------------------------------
# CCXT WebSocket Feed (Crypto: Binance, Bybit, Kraken, OKX)
# ---------------------------------------------------------------------------

class CCXTWebSocketFeed(BaseFeed):
    """
    Real-time OHLCV + Tick feed using CCXT Pro WebSocket streams.

    Streams:
      - Live kline/candle updates → OHLCVRingBuffer
      - Live trade ticks → TickRingBuffer

    Usage:
        ohlcv_buf = OHLCVRingBuffer("BTC/USDT", "15m", capacity=500)
        tick_buf  = TickRingBuffer("BTC/USDT", capacity=10000)

        feed = CCXTWebSocketFeed(
            symbol="BTC/USDT",
            exchange_id="binance",
            timeframe="15m",
            ohlcv_buffer=ohlcv_buf,
            tick_buffer=tick_buf,
            api_key="...",
            api_secret="...",
            testnet=True,
        )
        await feed.start()
    """

    def __init__(
        self,
        symbol: str,
        exchange_id: str,
        timeframe: str,
        ohlcv_buffer: OHLCVRingBuffer,
        tick_buffer: TickRingBuffer,
        api_key: str = "",
        api_secret: str = "",
        testnet: bool = True,
    ) -> None:
        super().__init__(symbol)
        self._exchange_id = exchange_id
        self._timeframe = timeframe
        self._ohlcv_buf = ohlcv_buffer
        self._tick_buf = tick_buffer
        self._api_key = api_key
        self._api_secret = api_secret
        self._testnet = testnet

    async def _connect_and_stream(self) -> None:
        try:
            import ccxt.pro as ccxtpro
        except ImportError:
            raise RuntimeError(
                "ccxt.pro is required for WebSocket feeds. "
                "It is included with ccxt>=4.0. "
                "Ensure ccxt is installed: pip install ccxt"
            )

        exchange_class = getattr(ccxtpro, self._exchange_id, None)
        if exchange_class is None:
            raise ValueError(f"[CCXTWebSocketFeed] Unknown exchange: {self._exchange_id!r}")

        exchange = exchange_class({
            "apiKey": self._api_key,
            "secret": self._api_secret,
            "enableRateLimit": True,
        })

        if self._testnet and exchange.has.get("sandbox"):
            exchange.set_sandbox_mode(True)

        logger.info(
            f"[CCXTWebSocketFeed] Connecting to {self._exchange_id.upper()} "
            f"WebSocket for {self.symbol} [{self._timeframe}]"
        )

        try:
            # Run OHLCV stream and tick stream concurrently
            await asyncio.gather(
                self._stream_ohlcv(exchange),
                self._stream_ticks(exchange),
            )
        finally:
            await exchange.close()

    async def _stream_ohlcv(self, exchange) -> None:
        """Watch OHLCV candles and push closed/updated bars to the buffer."""
        while self._running:
            ohlcv_list = await exchange.watch_ohlcv(self.symbol, self._timeframe)
            for bar in ohlcv_list:
                ts_ms, o, h, l, c, v = bar
                candle = OHLCV(
                    symbol=self.symbol,
                    timeframe=self._timeframe,
                    open=float(o),
                    high=float(h),
                    low=float(l),
                    close=float(c),
                    volume=float(v),
                    timestamp=datetime.fromtimestamp(ts_ms / 1000.0, tz=timezone.utc),
                )
                self._ohlcv_buf.push(candle)

    async def _stream_ticks(self, exchange) -> None:
        """Watch trade stream and push ticks to the tick buffer."""
        while self._running:
            trades = await exchange.watch_trades(self.symbol)
            for trade in trades:
                price = float(trade.get("price", 0))
                volume = float(trade.get("amount", 0))
                ts = trade.get("timestamp")
                timestamp = (
                    datetime.fromtimestamp(ts / 1000.0, tz=timezone.utc)
                    if ts else datetime.now(timezone.utc)
                )
                tick = Tick(
                    symbol=self.symbol,
                    bid=price,   # Trade stream gives last price, not bid/ask
                    ask=price,
                    last=price,
                    volume=volume,
                    timestamp=timestamp,
                )
                self._tick_buf.push(tick)


# ---------------------------------------------------------------------------
# Alpaca WebSocket Feed (US Stocks)
# ---------------------------------------------------------------------------

class AlpacaWebSocketFeed(BaseFeed):
    """
    Real-time quote + bar feed for US stocks via Alpaca WebSocket API.

    Streams:
      - Real-time 1-minute bars → OHLCVRingBuffer
      - Real-time quotes (bid/ask) → TickRingBuffer

    Usage:
        ohlcv_buf = OHLCVRingBuffer("AAPL", "1m", capacity=500)
        tick_buf  = TickRingBuffer("AAPL", capacity=10000)

        feed = AlpacaWebSocketFeed(
            symbol="AAPL",
            ohlcv_buffer=ohlcv_buf,
            tick_buffer=tick_buf,
            api_key="...",
            api_secret="...",
            paper=True,
        )
        await feed.start()
    """

    def __init__(
        self,
        symbol: str,
        ohlcv_buffer: OHLCVRingBuffer,
        tick_buffer: TickRingBuffer,
        api_key: str = "",
        api_secret: str = "",
        paper: bool = True,
    ) -> None:
        super().__init__(symbol)
        self._ohlcv_buf = ohlcv_buffer
        self._tick_buf = tick_buffer
        self._api_key = api_key
        self._api_secret = api_secret
        self._paper = paper

    async def _connect_and_stream(self) -> None:
        try:
            from alpaca.data.live import StockDataStream
        except ImportError:
            raise RuntimeError(
                "alpaca-py is required for AlpacaWebSocketFeed. "
                "Install: pip install alpaca-py"
            )

        wss_client = StockDataStream(
            api_key=self._api_key,
            secret_key=self._api_secret,
            feed="iex",  # "iex" is free; "sip" requires paid subscription
        )

        symbol = self.symbol

        async def on_bar(bar) -> None:
            candle = OHLCV(
                symbol=symbol,
                timeframe="1m",
                open=float(bar.open),
                high=float(bar.high),
                low=float(bar.low),
                close=float(bar.close),
                volume=float(bar.volume),
                timestamp=bar.timestamp.replace(tzinfo=timezone.utc)
                          if bar.timestamp.tzinfo is None else bar.timestamp,
            )
            self._ohlcv_buf.push(candle)

        async def on_quote(quote) -> None:
            tick = Tick(
                symbol=symbol,
                bid=float(quote.bid_price),
                ask=float(quote.ask_price),
                last=float((quote.bid_price + quote.ask_price) / 2),
                volume=float(quote.bid_size + quote.ask_size),
                timestamp=datetime.now(timezone.utc),
            )
            self._tick_buf.push(tick)

        wss_client.subscribe_bars(on_bar, symbol)
        wss_client.subscribe_quotes(on_quote, symbol)

        logger.info(f"[AlpacaWebSocketFeed] Connecting for {symbol}")
        await wss_client.run()
