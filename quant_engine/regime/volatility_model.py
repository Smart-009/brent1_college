"""
regime/volatility_model.py
===========================
Yang-Zhang Volatility Estimator & Volatility State Classifier.

WHY NOT STANDARD CLOSE-TO-CLOSE VOLATILITY?
  The standard approach:  σ = std(log(close_t / close_{t-1}))
  This IGNORES intraday price movement (open gaps, intraday swings) and
  significantly underestimates true volatility, especially after earnings
  or overnight news gaps.

WHY YANG-ZHANG?
  Yang-Zhang (2000) is the minimum-variance unbiased estimator of
  true volatility using OHLC data. It accounts for:
  - Overnight gaps (open vs previous close)
  - Intraday price range (high vs low)
  - Closing drift within the session

  It provides approximately 4-14× better efficiency (lower estimation
  error) compared to simple close-to-close returns.

  Formula:
    σ²_YZ = σ²_o + k·σ²_c + (1-k)·σ²_RS

  where:
    σ²_o  = overnight (open) variance
    σ²_c  = close-to-close variance
    σ²_RS = Rogers-Satchell intraday variance
    k     = 0.34 / (1.34 + (n+1)/(n-1))  (optimal weighting coefficient)

REFERENCE:
  Yang, D., & Zhang, Q. (2000). "Drift-Independent Volatility Estimation
  Based on High, Low, Open, and Close Prices."
  The Journal of Business, 73(3), 477-492.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def yang_zhang_volatility(
    df: pd.DataFrame,
    window: int = 20,
    trading_periods: int = 252,
    annualize: bool = True,
) -> np.ndarray:
    """
    Compute the Yang-Zhang volatility estimate over a rolling window.

    Args:
        df:              DataFrame with columns 'open', 'high', 'low', 'close'.
                         Index must be datetime-based (oldest first).
        window:          Rolling window size (number of bars).
        trading_periods: Annualization factor (252 for daily stocks,
                         365 for crypto, 260 for forex).
        annualize:       If True, return annualized volatility (%).
                         If False, return per-bar volatility.

    Returns:
        numpy array of shape (len(df),) with Yang-Zhang volatility values.
        First (window-1) values will be NaN.
    """
    log_ho = np.log(df["high"] / df["open"])    # Intraday high/open
    log_lo = np.log(df["low"]  / df["open"])    # Intraday low/open
    log_co = np.log(df["close"] / df["open"])   # Close/open (intraday drift)
    log_oc = np.log(df["open"] / df["close"].shift(1))   # Overnight gap
    log_cc = np.log(df["close"] / df["close"].shift(1))  # Close-to-close

    # Rogers-Satchell estimator (removes drift, valid for non-zero mean series)
    rs = log_ho * (log_ho - log_co) + log_lo * (log_lo - log_co)

    # Optimal weighting coefficient k
    k = 0.34 / (1.34 + (window + 1) / (window - 1))

    # Yang-Zhang variance components
    sigma2_o  = log_oc.rolling(window).var(ddof=1)    # Overnight variance
    sigma2_c  = log_cc.rolling(window).var(ddof=1)    # Close-to-close variance
    sigma2_rs = rs.rolling(window).mean()              # Average RS intraday variance

    # Combined Yang-Zhang variance
    sigma2_yz = sigma2_o + k * sigma2_c + (1.0 - k) * sigma2_rs

    # Annualize if required
    if annualize:
        volatility = np.sqrt(sigma2_yz * trading_periods) * 100.0  # As percentage
    else:
        volatility = np.sqrt(sigma2_yz)

    return volatility.to_numpy()


def classify_volatility_state(
    current_vol: float,
    historical_mean: float,
    historical_std: float,
    high_vol_z_score: float = 2.0,
    low_vol_z_score: float = -1.0,
) -> str:
    """
    Classify the current volatility level relative to its historical distribution.

    Args:
        current_vol:       Current Yang-Zhang volatility value.
        historical_mean:   Mean volatility over the lookback period.
        historical_std:    Std dev of volatility over the lookback period.
        high_vol_z_score:  Z-score above which we classify as HIGH_VOL.
        low_vol_z_score:   Z-score below which we classify as LOW_VOL (squeeze).

    Returns:
        One of: "HIGH_VOL", "NORMAL_VOL", "LOW_VOL_SQUEEZE"
    """
    if historical_std == 0:
        return "NORMAL_VOL"

    z_score = (current_vol - historical_mean) / historical_std

    if z_score >= high_vol_z_score:
        return "HIGH_VOL"
    if z_score <= low_vol_z_score:
        return "LOW_VOL_SQUEEZE"  # Coiling spring — often precedes breakout
    return "NORMAL_VOL"


def compute_atr(
    df: pd.DataFrame,
    period: int = 14,
) -> np.ndarray:
    """
    Average True Range (ATR) — used for position sizing and stop-loss placement.

    True Range = max(
        High - Low,
        |High - Previous Close|,
        |Low  - Previous Close|
    )

    ATR = Exponential moving average of True Range over 'period' bars.

    Args:
        df:     DataFrame with columns 'high', 'low', 'close'.
        period: ATR smoothing period (14 is standard).

    Returns:
        numpy array of ATR values. First (period-1) values are NaN.
    """
    high  = df["high"]
    low   = df["low"]
    close = df["close"]
    prev_close = close.shift(1)

    tr = pd.concat([
        high - low,
        (high - prev_close).abs(),
        (low  - prev_close).abs(),
    ], axis=1).max(axis=1)

    # Use EMA (Wilder's smoothing: span = 2*period - 1) for ATR
    atr = tr.ewm(span=2 * period - 1, min_periods=period, adjust=False).mean()
    return atr.to_numpy()


def compute_bollinger_bandwidth(
    closes: np.ndarray,
    period: int = 20,
    num_std: float = 2.0,
) -> float:
    """
    Bollinger Band Width — measures the compression/expansion of volatility.

    Formula: BBW = (Upper Band - Lower Band) / Middle Band

    Low BBW (squeeze): Price is coiling; breakout is likely imminent.
    High BBW (expansion): Breakout is underway; trend-following is active.

    Args:
        closes: 1-D numpy array of closing prices (most recent last).
        period: Bollinger Band period.
        num_std: Number of standard deviations for band width.

    Returns:
        Current Bollinger Band Width as a float.
        Returns 0.0 if insufficient data.
    """
    if len(closes) < period:
        return 0.0

    window = closes[-period:]
    sma = np.mean(window)
    std = np.std(window, ddof=1)

    upper = sma + num_std * std
    lower = sma - num_std * std

    if sma == 0:
        return 0.0

    return (upper - lower) / sma
