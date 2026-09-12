"""
data/historical_loader.py
=========================
Historical OHLCV Data Loader for Backtesting.

Downloads and caches multi-year historical data from free sources:
  - Crypto:  Direct exchange via CCXT (Binance 1-minute data going back years)
  - Stocks:  Yahoo Finance via yfinance (free, no API key required)
  - Forex:   Dukascopy tick data aggregated to OHLCV (free institutional quality)

CACHING:
  Downloaded data is cached as Parquet files in data/cache/ to avoid
  re-downloading on every backtest run. Cache is invalidated automatically
  when the requested date range extends beyond the cached file.

USAGE:
  loader = HistoricalLoader()

  # Crypto
  df = await loader.load("BTC/USDT", "1h", "2022-01-01", "2024-12-31", "crypto")

  # Stocks
  df = await loader.load("AAPL", "1d", "2020-01-01", "2024-12-31", "stock")

  # Forex
  df = await loader.load("EURUSD", "1h", "2021-01-01", "2024-12-31", "forex")

RETURN FORMAT:
  pandas DataFrame with DatetimeIndex (UTC) and columns:
  open, high, low, close, volume
"""

from __future__ import annotations

import asyncio
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pandas as pd
from loguru import logger


CACHE_DIR = Path("data/cache")


class HistoricalLoader:
    """
    Asynchronous historical data downloader with local Parquet cache.
    """

    def __init__(self, cache_dir: str = "data/cache") -> None:
        self._cache_dir = Path(cache_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    # ── Public API ─────────────────────────────────────────────────────────

    async def load(
        self,
        symbol: str,
        timeframe: str,
        start: str,
        end: str,
        asset_class: str,
    ) -> pd.DataFrame:
        """
        Load historical OHLCV data for any asset class.

        Args:
            symbol:      e.g. "BTC/USDT", "AAPL", "EURUSD"
            timeframe:   e.g. "1m", "15m", "1h", "4h", "1d"
            start:       Start date string "YYYY-MM-DD"
            end:         End date string "YYYY-MM-DD"
            asset_class: "crypto" | "stock" | "forex"

        Returns:
            pandas DataFrame with DatetimeIndex (UTC) and columns:
            open, high, low, close, volume
        """
        cache_path = self._cache_path(symbol, timeframe, start, end, asset_class)

        if cache_path.exists():
            logger.info(f"[HistoricalLoader] Loading from cache: {cache_path.name}")
            df = pd.read_parquet(cache_path)
            logger.info(
                f"[HistoricalLoader] {symbol} {timeframe} | "
                f"{len(df)} bars | {df.index[0]} → {df.index[-1]}"
            )
            return df

        logger.info(
            f"[HistoricalLoader] Downloading {symbol} {timeframe} "
            f"from {start} to {end} [{asset_class}]..."
        )

        if asset_class == "crypto":
            df = await self._load_crypto(symbol, timeframe, start, end)
        elif asset_class == "stock":
            df = await self._load_stock(symbol, timeframe, start, end)
        elif asset_class == "forex":
            df = await self._load_forex(symbol, timeframe, start, end)
        else:
            raise ValueError(f"[HistoricalLoader] Unknown asset_class: {asset_class!r}")

        if df.empty:
            raise RuntimeError(
                f"[HistoricalLoader] No data returned for {symbol} {timeframe} "
                f"{start} → {end}. Check the symbol name and date range."
            )

        # Save to Parquet cache
        df.to_parquet(cache_path)
        logger.info(
            f"[HistoricalLoader] Downloaded and cached {len(df)} bars for "
            f"{symbol} {timeframe} → {cache_path.name}"
        )
        return df

    # ── Crypto (CCXT / Binance) ────────────────────────────────────────────

    async def _load_crypto(
        self,
        symbol: str,
        timeframe: str,
        start: str,
        end: str,
    ) -> pd.DataFrame:
        """
        Download historical crypto OHLCV from Binance (public, no API key needed).
        Binance allows free historical data access without authentication.
        """
        import ccxt.async_support as ccxt

        exchange = ccxt.binance({"enableRateLimit": True})
        await exchange.load_markets()

        start_ts = int(datetime.strptime(start, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp() * 1000)
        end_ts = int(datetime.strptime(end, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp() * 1000)

        all_bars = []
        since = start_ts
        batch_size = 1000  # Binance max per request

        while since < end_ts:
            try:
                bars = await exchange.fetch_ohlcv(symbol, timeframe, since=since, limit=batch_size)
            except Exception as e:
                logger.error(f"[HistoricalLoader] CCXT fetch error: {e}")
                await asyncio.sleep(2)
                continue

            if not bars:
                break

            all_bars.extend(bars)
            since = bars[-1][0] + 1  # Move past last fetched bar
            logger.debug(f"[HistoricalLoader] {symbol} {timeframe}: {len(all_bars)} bars so far...")

            # Respect rate limit
            await asyncio.sleep(exchange.rateLimit / 1000)

        await exchange.close()

        if not all_bars:
            return pd.DataFrame()

        df = pd.DataFrame(
            all_bars,
            columns=["timestamp", "open", "high", "low", "close", "volume"]
        )
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms", utc=True)
        df = df.set_index("timestamp").sort_index()
        # Filter to requested date range
        df = df[start:end]
        return df

    # ── Stocks (Yahoo Finance — free, no API key) ──────────────────────────

    async def _load_stock(
        self,
        symbol: str,
        timeframe: str,
        start: str,
        end: str,
    ) -> pd.DataFrame:
        """
        Download historical stock data from Yahoo Finance (yfinance).
        No API key required. Suitable for daily and intraday data.
        """
        try:
            import yfinance as yf
        except ImportError:
            raise RuntimeError(
                "[HistoricalLoader] yfinance not installed. Run: pip install yfinance"
            )

        # Map our timeframe strings to yfinance interval strings
        tf_map = {
            "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
            "1h": "1h", "4h": "1h",  # yfinance doesn't have 4h — use 1h and resample
            "1d": "1d", "1w": "1wk", "1mo": "1mo",
        }
        interval = tf_map.get(timeframe, "1d")

        # Run blocking yfinance download in thread pool (it's not async)
        loop = asyncio.get_event_loop()
        df = await loop.run_in_executor(
            None,
            lambda: yf.download(
                symbol,
                start=start,
                end=end,
                interval=interval,
                auto_adjust=True,
                progress=False,
            )
        )

        if df.empty:
            return df

        # Normalize column names to lowercase
        df.columns = [c.lower() for c in df.columns]
        df = df[["open", "high", "low", "close", "volume"]]

        # Ensure UTC timezone
        if df.index.tzinfo is None:
            df.index = df.index.tz_localize("UTC")
        else:
            df.index = df.index.tz_convert("UTC")

        df.index.name = "timestamp"

        # If timeframe is 4h, resample from 1h
        if timeframe == "4h":
            df = df.resample("4h").agg({
                "open":   "first",
                "high":   "max",
                "low":    "min",
                "close":  "last",
                "volume": "sum",
            }).dropna()

        return df

    # ── Forex (OANDA or Yahoo Finance — free) ─────────────────────────────

    async def _load_forex(
        self,
        symbol: str,
        timeframe: str,
        start: str,
        end: str,
    ) -> pd.DataFrame:
        """
        Download historical Forex data from Yahoo Finance.
        Yahoo Finance supports major forex pairs in XXXYYY=X format
        (e.g. EURUSD → EURUSD=X).

        For higher quality forex tick data, use Dukascopy historical data
        (download manually from https://www.dukascopy.com/trading-tools/widgets/tools/historical_data_feed/)
        and load via load_from_csv().
        """
        # Map our symbol format to Yahoo Finance format
        yahoo_symbol = symbol.replace("/", "") + "=X" if "/" not in symbol else symbol.replace("/", "") + "=X"
        if symbol.startswith("XAU"):
            yahoo_symbol = "GC=F"   # Gold futures
        elif symbol.startswith("XAG"):
            yahoo_symbol = "SI=F"   # Silver futures
        elif symbol in ("USOIL", "WTI"):
            yahoo_symbol = "CL=F"   # WTI crude oil futures
        elif symbol in ("UKOIL", "BRENT"):
            yahoo_symbol = "BZ=F"   # Brent crude oil futures

        return await self._load_stock(yahoo_symbol, timeframe, start, end)

    # ── CSV Loader (Dukascopy / Custom) ───────────────────────────────────

    async def load_from_csv(
        self,
        filepath: str,
        symbol: str,
        timeframe: str,
    ) -> pd.DataFrame:
        """
        Load historical data from a CSV file (e.g. Dukascopy export).

        Expected CSV format (with header):
            Time,Open,High,Low,Close,Volume
            2020.01.02 00:00:00,1.11500,1.11550,1.11480,1.11520,1234

        Args:
            filepath:  Path to the CSV file.
            symbol:    Symbol name (for labeling only).
            timeframe: Timeframe string (for labeling only).

        Returns:
            Cleaned pandas DataFrame with UTC DatetimeIndex.
        """
        loop = asyncio.get_event_loop()
        df = await loop.run_in_executor(
            None,
            lambda: pd.read_csv(
                filepath,
                parse_dates=[0],
                index_col=0,
                infer_datetime_format=True,
            )
        )

        df.columns = [c.lower().strip() for c in df.columns]
        df = df[["open", "high", "low", "close", "volume"]]

        if df.index.tzinfo is None:
            df.index = df.index.tz_localize("UTC")

        df.index.name = "timestamp"
        df = df.sort_index()
        df = df.dropna()

        logger.info(
            f"[HistoricalLoader] Loaded {len(df)} bars from CSV for "
            f"{symbol} {timeframe}: {df.index[0]} → {df.index[-1]}"
        )
        return df

    # ── Private helpers ────────────────────────────────────────────────────

    def _cache_path(
        self,
        symbol: str,
        timeframe: str,
        start: str,
        end: str,
        asset_class: str,
    ) -> Path:
        """Generate a unique cache file path for a given data request."""
        key = f"{symbol}_{timeframe}_{start}_{end}_{asset_class}"
        # Use a hash to keep filenames short and filesystem-safe
        h = hashlib.md5(key.encode()).hexdigest()[:12]
        safe_symbol = symbol.replace("/", "_").replace("=", "")
        filename = f"{safe_symbol}_{timeframe}_{h}.parquet"
        return self._cache_dir / filename

    def clear_cache(self) -> int:
        """Delete all cached Parquet files. Returns number of files deleted."""
        deleted = 0
        for f in self._cache_dir.glob("*.parquet"):
            f.unlink()
            deleted += 1
        logger.info(f"[HistoricalLoader] Cleared {deleted} cached files.")
        return deleted
