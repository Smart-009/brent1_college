"""
regime/hurst_exponent.py
========================
Hurst Exponent Calculator — Core Market Regime Indicator.

THE HURST EXPONENT EXPLAINED:
  The Hurst Exponent (H) measures the long-term memory and persistence
  of a time series. In financial markets it tells us:

    H > 0.55  →  PERSISTENT / TRENDING
                  Price has memory: up moves follow up moves.
                  → Trend-following strategies have positive expected value.

    H < 0.45  →  ANTI-PERSISTENT / MEAN-REVERTING
                  Price tends to reverse: up moves are followed by down moves.
                  → Mean-reversion strategies have positive expected value.

    H ≈ 0.50  →  RANDOM WALK
                  No memory. Prices follow a Brownian motion.
                  → No statistical edge. Stay flat or wait.

METHODOLOGY:
  We use the Rescaled Range (R/S) analysis method, which is the original
  Hurst methodology and the most robust for financial time series of
  the length we work with (100–500 bars).

  The R/S method:
    1. Divide the time series into sub-series of increasing length τ.
    2. For each τ, compute the rescaled range: R(τ) / S(τ)
       where R = range (max - min of cumulative deviations from mean)
       and S = standard deviation of returns.
    3. Regress log(R/S) on log(τ).
    4. The slope of the regression line = Hurst Exponent H.

REFERENCE:
  Hurst, H.E. (1951). "Long-Term Storage Capacity of Reservoirs."
  Transactions of the American Society of Civil Engineers.
"""

from __future__ import annotations

import numpy as np


def compute_hurst_exponent(
    prices: np.ndarray,
    min_chunk: int = 10,
    max_chunk: Optional[int] = None,
    num_chunks: int = 20,
) -> float:
    """
    Compute the Hurst Exponent via Rescaled Range (R/S) analysis.

    Args:
        prices:     1-D numpy array of closing prices. Must have at least
                    2 × min_chunk elements for a meaningful result.
        min_chunk:  Minimum sub-series length to include in regression.
        max_chunk:  Maximum sub-series length (defaults to len(prices) // 2).
        num_chunks: Number of log-spaced chunk sizes to evaluate.

    Returns:
        Hurst Exponent H as a float in the range [0, 1].
        Returns 0.5 (random walk) on failure / insufficient data.
    """
    n = len(prices)
    if n < 2 * min_chunk:
        return 0.5  # Insufficient data — default to random walk

    if max_chunk is None:
        max_chunk = n // 2

    # Ensure prices are strictly positive (handles synthetic data / test cases)
    if np.any(prices <= 0):
        prices = prices - np.min(prices) + 1.0

    # Compute log returns (more stationary than raw prices)
    log_returns = np.log(prices[1:] / prices[:-1])

    # Generate log-spaced chunk sizes from min_chunk to max_chunk
    chunk_sizes = np.unique(
        np.logspace(
            np.log10(min_chunk),
            np.log10(max_chunk),
            num=num_chunks,
            dtype=int,
        )
    )
    chunk_sizes = chunk_sizes[chunk_sizes >= min_chunk]

    rs_values = []
    valid_sizes = []

    for chunk_size in chunk_sizes:
        rs_list = []
        # Split returns into non-overlapping sub-series of length chunk_size
        num_chunks_possible = len(log_returns) // chunk_size

        if num_chunks_possible < 1:
            continue

        for i in range(num_chunks_possible):
            sub = log_returns[i * chunk_size: (i + 1) * chunk_size]
            if len(sub) < 2:
                continue

            # Mean-centre the sub-series
            mean_sub = np.mean(sub)
            deviation = np.cumsum(sub - mean_sub)

            # Range R = max cumulative deviation - min cumulative deviation
            R = deviation.max() - deviation.min()

            # Standard deviation S of the sub-series
            S = np.std(sub, ddof=1)

            if S == 0.0:
                continue

            rs_list.append(R / S)

        if rs_list:
            rs_values.append(np.mean(rs_list))
            valid_sizes.append(chunk_size)

    if len(valid_sizes) < 2:
        return 0.5  # Not enough data points for regression

    # Fit log(R/S) = H × log(τ) + const via ordinary least squares
    log_sizes = np.log(valid_sizes)
    log_rs    = np.log(rs_values)

    # np.polyfit(x, y, deg=1) returns [slope, intercept]
    try:
        slope, _ = np.polyfit(log_sizes, log_rs, 1)
    except (np.linalg.LinAlgError, ValueError):
        return 0.5

    # Clamp to [0, 1] to handle numerical edge cases
    H = float(np.clip(slope, 0.0, 1.0))
    return H


def classify_hurst(
    H: float,
    trending_threshold: float = 0.55,
    reverting_threshold: float = 0.45,
) -> str:
    """
    Classify the Hurst Exponent into a regime label.

    Args:
        H:                    Hurst Exponent value.
        trending_threshold:   H above this → "TRENDING"
        reverting_threshold:  H below this → "MEAN_REVERTING"

    Returns:
        One of: "TRENDING", "MEAN_REVERTING", "RANDOM_WALK"
    """
    if H >= trending_threshold:
        return "TRENDING"
    if H <= reverting_threshold:
        return "MEAN_REVERTING"
    return "RANDOM_WALK"


# Type annotation fix for Optional
from typing import Optional  # noqa: E402 (placed at bottom to avoid polluting the module top)
