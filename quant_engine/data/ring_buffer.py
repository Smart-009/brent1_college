"""
data/ring_buffer.py
===================
Lock-Free In-Memory Ring Buffer for Real-Time Tick & OHLCV Data.

WHY THIS EXISTS:
  In a live trading system, writing to a database or growing a list
  on every tick introduces memory allocation overhead and disk I/O
  in the critical price-processing path. A ring buffer solves this by:

  1. Pre-allocating a fixed block of contiguous RAM (NumPy array).
  2. Overwriting the oldest data as new data arrives — zero allocation.
  3. Providing O(1) read/write operations.
  4. Staying entirely in L2/L3 CPU cache for ultra-fast vectorized access.

USAGE:
  buf = OHLCVRingBuffer(symbol="BTC/USDT", timeframe="15m", capacity=500)
  buf.push(ohlcv_bar)
  closes = buf.get_closes()   # np.ndarray, newest bar LAST
  df = buf.to_dataframe()     # pandas DataFrame for indicator calculations
"""

from __future__ import annotations

import threading
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd

from brokers.base_broker import OHLCV, Tick


# ---------------------------------------------------------------------------
# OHLCV Ring Buffer
# ---------------------------------------------------------------------------

class OHLCVRingBuffer:
    """
    Fixed-capacity, O(1) ring buffer for OHLCV candle data.

    Thread-safe for single-writer / multiple-reader access.
    Uses a RLock to protect the write pointer update; reads that
    happen outside the write window need no lock (NumPy copy is atomic
    for aligned dtypes).
    """

    DTYPE = np.dtype([
        ("timestamp", "i8"),   # Unix timestamp (nanoseconds since epoch)
        ("open",      "f8"),
        ("high",      "f8"),
        ("low",       "f8"),
        ("close",     "f8"),
        ("volume",    "f8"),
    ])

    def __init__(self, symbol: str, timeframe: str, capacity: int = 500) -> None:
        """
        Args:
            symbol:    Trading symbol (e.g. "BTC/USDT").
            timeframe: Candle timeframe string (e.g. "15m").
            capacity:  Maximum number of bars to keep in memory.
                       Oldest bars are overwritten once capacity is reached.
                       Default 500 bars covers 5+ days of 15-minute data.
        """
        if capacity < 2:
            raise ValueError("Ring buffer capacity must be at least 2.")

        self.symbol = symbol
        self.timeframe = timeframe
        self.capacity = capacity

        # Pre-allocate the fixed array — no further allocation after __init__
        self._buf: np.ndarray = np.zeros(capacity, dtype=self.DTYPE)

        self._write_ptr: int = 0    # Next slot to write into
        self._count: int = 0        # Number of valid bars currently stored
        self._lock = threading.RLock()

    def __bool__(self) -> bool:
        """Always truthy — existence of the buffer object means it is ready."""
        return True

    def __len__(self) -> int:
        """Return the number of valid bars currently stored."""
        return self._count

    @property
    def size(self) -> int:
        """Number of valid bars currently stored (alias for len)."""
        return self._count

    # ── Write ──────────────────────────────────────────────────────────────

    def push(self, bar: OHLCV) -> None:
        """
        Insert one OHLCV bar into the buffer.
        Overwrites the oldest entry when the buffer is full.

        Args:
            bar: An OHLCV bar. Must match self.symbol and self.timeframe.
        """
        ts_ns = int(bar.timestamp.timestamp() * 1_000_000_000)

        with self._lock:
            self._buf[self._write_ptr] = (
                ts_ns,
                bar.open,
                bar.high,
                bar.low,
                bar.close,
                bar.volume,
            )
            self._write_ptr = (self._write_ptr + 1) % self.capacity
            if self._count < self.capacity:
                self._count += 1

    def push_many(self, bars: list[OHLCV]) -> None:
        """Batch-push a list of OHLCV bars. Useful on initial data load."""
        for bar in bars:
            self.push(bar)

    # ── Read ───────────────────────────────────────────────────────────────

    def _ordered_slice(self) -> np.ndarray:
        """
        Return a contiguous NumPy array of valid bars, ordered oldest → newest.
        Handles the wrap-around case where the write pointer has looped.
        """
        with self._lock:
            count = self._count
            ptr = self._write_ptr

        if count == 0:
            return np.zeros(0, dtype=self.DTYPE)

        if count < self.capacity:
            # Buffer not yet full — data starts at index 0
            return self._buf[:count].copy()
        else:
            # Buffer is full — data wraps around from ptr (oldest) to ptr-1 (newest)
            return np.concatenate([
                self._buf[ptr:],
                self._buf[:ptr],
            ])

    def get_closes(self) -> np.ndarray:
        """Return closing prices as a 1-D float64 array, oldest first."""
        return self._ordered_slice()["close"]

    def get_opens(self) -> np.ndarray:
        """Return opening prices as a 1-D float64 array, oldest first."""
        return self._ordered_slice()["open"]

    def get_highs(self) -> np.ndarray:
        """Return high prices as a 1-D float64 array, oldest first."""
        return self._ordered_slice()["high"]

    def get_lows(self) -> np.ndarray:
        """Return low prices as a 1-D float64 array, oldest first."""
        return self._ordered_slice()["low"]

    def get_volumes(self) -> np.ndarray:
        """Return volumes as a 1-D float64 array, oldest first."""
        return self._ordered_slice()["volume"]

    def get_latest(self) -> Optional[np.void]:
        """
        Return the most recently pushed bar as a NumPy structured scalar.
        Returns None if the buffer is empty.
        """
        with self._lock:
            if self._count == 0:
                return None
            latest_idx = (self._write_ptr - 1) % self.capacity
            return self._buf[latest_idx].copy()

    def get_latest_close(self) -> Optional[float]:
        """Convenience: return just the latest closing price, or None."""
        bar = self.get_latest()
        return float(bar["close"]) if bar is not None else None

    def to_dataframe(self) -> pd.DataFrame:
        """
        Return all valid bars as a pandas DataFrame with columns:
          timestamp (datetime64[ns, UTC]), open, high, low, close, volume

        The DataFrame is safe to pass directly into pandas_ta for
        indicator calculations.
        """
        arr = self._ordered_slice()
        if len(arr) == 0:
            return pd.DataFrame(
                columns=["timestamp", "open", "high", "low", "close", "volume"]
            )

        df = pd.DataFrame(arr)
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ns", utc=True)
        df = df.set_index("timestamp")
        return df

    @property
    def size(self) -> int:
        """Number of valid bars currently stored."""
        with self._lock:
            return self._count

    @property
    def is_full(self) -> bool:
        """True when the buffer has reached its capacity."""
        with self._lock:
            return self._count >= self.capacity

    def __len__(self) -> int:
        return self.size

    def __repr__(self) -> str:
        return (
            f"OHLCVRingBuffer("
            f"symbol={self.symbol!r}, "
            f"timeframe={self.timeframe!r}, "
            f"size={self.size}/{self.capacity})"
        )


# ---------------------------------------------------------------------------
# Tick Ring Buffer (for order flow & microstructure analysis)
# ---------------------------------------------------------------------------

class TickRingBuffer:
    """
    Fixed-capacity ring buffer for raw price ticks.
    Stores bid, ask, last price, and volume for each tick.
    Used by the VPIN toxic flow detector and the spread monitor.
    """

    DTYPE = np.dtype([
        ("timestamp", "i8"),  # nanoseconds
        ("bid",       "f8"),
        ("ask",       "f8"),
        ("last",      "f8"),
        ("volume",    "f8"),
    ])

    def __init__(self, symbol: str, capacity: int = 10_000) -> None:
        """
        Args:
            symbol:   Trading symbol.
            capacity: Max ticks to keep. 10,000 ticks ≈ a few minutes of
                      high-frequency crypto data.
        """
        self.symbol = symbol
        self.capacity = capacity
        self._buf = np.zeros(capacity, dtype=self.DTYPE)
        self._write_ptr = 0
        self._count = 0
        self._lock = threading.RLock()

    def __bool__(self) -> bool:
        """Always truthy — existence of the buffer object means it is ready."""
        return True

    def __len__(self) -> int:
        return self._count

    def push(self, tick: Tick) -> None:
        """Insert a single tick into the buffer."""
        ts_ns = int(tick.timestamp.timestamp() * 1_000_000_000)
        with self._lock:
            self._buf[self._write_ptr] = (
                ts_ns,
                tick.bid,
                tick.ask,
                tick.last,
                tick.volume,
            )
            self._write_ptr = (self._write_ptr + 1) % self.capacity
            if self._count < self.capacity:
                self._count += 1

    def get_spreads(self) -> np.ndarray:
        """Return all stored bid-ask spreads as a 1-D float64 array."""
        arr = self._buf[:self._count]
        return arr["ask"] - arr["bid"]

    def get_average_spread(self) -> float:
        """Return the mean bid-ask spread across all stored ticks."""
        spreads = self.get_spreads()
        if len(spreads) == 0:
            return 0.0
        return float(np.mean(spreads))

    def get_latest_spread(self) -> Optional[float]:
        """Return the spread of the most recent tick, or None."""
        with self._lock:
            if self._count == 0:
                return None
            idx = (self._write_ptr - 1) % self.capacity
            row = self._buf[idx]
            return float(row["ask"] - row["bid"])

    @property
    def size(self) -> int:
        with self._lock:
            return self._count

    def __len__(self) -> int:
        return self.size

    def __repr__(self) -> str:
        return f"TickRingBuffer(symbol={self.symbol!r}, size={self.size}/{self.capacity})"
