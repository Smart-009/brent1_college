"""
risk/position_sizer.py
=======================
Dynamic Position Sizer — Half-Kelly + ATR Volatility Targeting.

WHY FIXED PERCENTAGE STOPS ARE WRONG:
  "Risk exactly 2% per trade, always" sounds disciplined but is flawed:
  - A 2% stop on a calm stock (ATR = 0.3%) is a 7× normal daily range.
    You'll almost never be stopped out, even when wrong.
  - A 2% stop on a volatile crypto (ATR = 5%) stops you out on normal noise.

  The market doesn't care about your portfolio size. It moves based on
  its OWN volatility. We must size positions proportionally to market
  volatility so that our risk (in portfolio %) stays CONSTANT
  regardless of how volatile the asset is.

OUR APPROACH — VOLATILITY-NORMALIZED ATR SIZING:
  Position Size = (Account Equity × Risk% per Trade) / (ATR × ATR Multiplier)

  This means:
  - High volatility asset → SMALLER position → same dollar risk
  - Low volatility asset  → LARGER position  → same dollar risk

KELLY CRITERION (HALF-KELLY):
  The Kelly formula gives the OPTIMAL fraction of capital to risk per trade
  to maximize long-run geometric growth without ruin:

    f* = (p × (b+1) - 1) / b

  where p = win probability, b = win/loss ratio.

  We use HALF-KELLY (f* × 0.5) because:
  - Win rates and RRR are never perfectly known in advance.
  - Full Kelly produces extreme drawdowns even with correct estimates.
  - Half-Kelly gives ~75% of full Kelly's growth rate with much lower drawdowns.

PORTFOLIO LIMITS:
  The final position size is capped by:
  1. Max risk per trade (1% of equity, hard limit)
  2. Max correlated exposure (15% of equity in one sector/asset class)
  3. Available free margin/cash
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np
from loguru import logger


@dataclass
class SizingResult:
    """Result of a position sizing calculation."""
    quantity: float             # Number of units/shares/lots to trade
    dollar_risk: float          # $ amount risked on this trade
    dollar_risk_pct: float      # % of equity risked
    stop_loss_price: float      # Calculated stop-loss price
    take_profit_price: float    # Calculated take-profit price
    atr: float                  # ATR value used in calculation
    method: str                 # "atr_volatility" | "fixed_pct" | "kelly"
    capped: bool = False        # True if size was reduced by a limit cap
    cap_reason: str = ""        # Why it was capped (if applicable)


class PositionSizer:
    """
    Calculates optimal position sizes using ATR volatility normalization
    with Half-Kelly capital allocation.

    Usage:
        sizer = PositionSizer(config)
        result = sizer.calculate(
            equity=50000.0,
            entry_price=42000.0,
            atr=850.0,
            signal_confidence=0.75,
            win_rate=0.55,
            avg_win_loss_ratio=2.0,
        )
        print(f"Buy {result.quantity:.4f} units, risk ${result.dollar_risk:.2f}")
    """

    def __init__(self, config: dict) -> None:
        risk_cfg = config.get("risk", {})
        self._max_risk_pct:    float = risk_cfg.get("max_risk_per_trade_pct", 1.0) / 100.0
        self._atr_stop_mult:   float = risk_cfg.get("atr_multiplier_stop", 2.0)
        self._atr_target_mult: float = risk_cfg.get("atr_multiplier_target", 4.0)
        self._kelly_fraction:  float = risk_cfg.get("kelly_fraction", 0.5)
        self._max_corr_pct:    float = risk_cfg.get("max_correlated_exposure_pct", 15.0) / 100.0

    def calculate(
        self,
        equity: float,
        entry_price: float,
        atr: float,
        signal_confidence: float = 1.0,
        win_rate: Optional[float] = None,
        avg_win_loss_ratio: Optional[float] = None,
        direction: str = "long",
        existing_correlated_exposure: float = 0.0,
        leverage: int = 1,
    ) -> SizingResult:
        """
        Calculate the position size for a trade.

        Args:
            equity:                      Total account equity in base currency (USD).
            entry_price:                 Intended entry price per unit.
            atr:                         Current ATR(14) value for this symbol.
            signal_confidence:           Strategy confidence score (0.0–1.0).
                                         Higher confidence → closer to max size.
            win_rate:                    Historical win rate (0.0–1.0) of this strategy.
                                         None = use ATR sizing only (no Kelly adjustment).
            avg_win_loss_ratio:          Average win size / average loss size.
                                         None = use ATR sizing only.
            direction:                   "long" | "short"
            existing_correlated_exposure: Existing $ exposure in correlated assets.

        Returns:
            SizingResult with quantity, risk levels, and stop/target prices.
        """
        if equity <= 0 or entry_price <= 0 or atr <= 0:
            logger.error(
                f"[PositionSizer] Invalid inputs: equity={equity}, "
                f"entry_price={entry_price}, atr={atr}"
            )
            return self._zero_result(entry_price, atr)

        # ── Step 1: ATR-Based Stop and Target ─────────────────────────────
        stop_distance  = atr * self._atr_stop_mult
        target_distance = atr * self._atr_target_mult

        if direction == "long":
            stop_loss    = entry_price - stop_distance
            take_profit  = entry_price + target_distance
        else:
            stop_loss    = entry_price + stop_distance
            take_profit  = entry_price - target_distance

        if stop_distance <= 0:
            return self._zero_result(entry_price, atr)

        # ── Step 2: Base Risk Amount ───────────────────────────────────────
        # Start from the configured max risk % of equity
        base_risk_dollars = equity * self._max_risk_pct

        # ── Step 3: Kelly Adjustment (if win rate data is available) ──────
        if win_rate is not None and avg_win_loss_ratio is not None:
            kelly_f = self._compute_kelly_fraction(win_rate, avg_win_loss_ratio)
            if kelly_f <= 0:
                logger.warning("[PositionSizer] Strategy has negative or zero edge (Kelly <= 0). Position size = 0.")
                return self._zero_result(entry_price, atr)
            # Apply Kelly to the base risk amount
            kelly_adjusted_risk = equity * kelly_f
            # Use the minimum of Kelly-suggested risk and configured max
            base_risk_dollars = min(base_risk_dollars, kelly_adjusted_risk)

        # ── Step 4: Confidence Scaling ────────────────────────────────────
        # Low-confidence signals risk less capital
        confidence_adjusted_risk = base_risk_dollars * signal_confidence

        # ── Step 5: Compute Quantity ──────────────────────────────────────
        # Quantity = $ risk / $ risk per unit
        # $ risk per unit = stop_distance (how much we lose per unit if stopped out)
        quantity = confidence_adjusted_risk / stop_distance

        # ── Step 6: Portfolio Limit Caps ──────────────────────────────────
        capped = False
        cap_reason = ""

        # Cap 1: Max $ risk per trade absolute
        max_dollar_risk = equity * self._max_risk_pct
        actual_risk = quantity * stop_distance
        if actual_risk > max_dollar_risk:
            quantity = max_dollar_risk / stop_distance
            capped = True
            cap_reason = f"Max trade risk cap: {self._max_risk_pct*100:.1f}% of equity"

        # Cap 2: Max correlated exposure (measured by margin capital required)
        lev = max(1, leverage)
        margin_required = (quantity * entry_price) / lev
        max_corr_exposure = equity * self._max_corr_pct
        if (existing_correlated_exposure + margin_required) > max_corr_exposure:
            available_headroom = max(0, max_corr_exposure - existing_correlated_exposure)
            quantity = (available_headroom * lev) / entry_price if entry_price > 0 else 0.0
            capped = True
            cap_reason = f"Correlated exposure cap: {self._max_corr_pct*100:.0f}% of equity"

        # Floor: if quantity is negligibly small, return zero
        if quantity < 1e-8 or quantity * entry_price < 1.0:
            return self._zero_result(entry_price, atr)

        actual_risk = quantity * stop_distance
        actual_risk_pct = (actual_risk / equity) * 100.0

        result = SizingResult(
            quantity=round(quantity, 8),
            dollar_risk=round(actual_risk, 4),
            dollar_risk_pct=round(actual_risk_pct, 4),
            stop_loss_price=round(stop_loss, 8),
            take_profit_price=round(take_profit, 8),
            atr=round(atr, 8),
            method="atr_volatility" if win_rate is None else "kelly",
            capped=capped,
            cap_reason=cap_reason,
        )

        logger.debug(
            f"[PositionSizer] {direction.upper()} | Qty={result.quantity:.6f} | "
            f"Risk=${result.dollar_risk:.2f} ({result.dollar_risk_pct:.3f}%) | "
            f"SL={result.stop_loss_price:.6f} | TP={result.take_profit_price:.6f}"
            + (f" | CAPPED: {cap_reason}" if capped else "")
        )
        return result

    def _compute_kelly_fraction(self, win_rate: float, win_loss_ratio: float) -> float:
        """
        Compute the Half-Kelly optimal fraction of equity to risk per trade.

        Kelly Formula:
            f* = (p × (b + 1) - 1) / b
        where:
            p = probability of winning
            b = ratio of average win to average loss

        Half-Kelly: f_half = f* × kelly_fraction (default 0.5)

        Args:
            win_rate:      Probability of a winning trade (0.0–1.0)
            win_loss_ratio: Avg win / avg loss ratio

        Returns:
            Fraction of equity to risk (0.0 to max_risk_pct).
        """
        if win_rate <= 0 or win_rate >= 1 or win_loss_ratio <= 0:
            return self._max_risk_pct

        b = win_loss_ratio
        p = win_rate
        q = 1.0 - p

        full_kelly = (p * (b + 1.0) - 1.0) / b

        if full_kelly <= 0:
            # Negative Kelly = this strategy has no mathematical edge
            return 0.0

        half_kelly = full_kelly * self._kelly_fraction
        # Never exceed the configured max risk limit regardless of Kelly
        return min(half_kelly, self._max_risk_pct)

    def _zero_result(self, entry_price: float, atr: float) -> SizingResult:
        """Return a zero-size result when calculation fails or conditions not met."""
        return SizingResult(
            quantity=0.0,
            dollar_risk=0.0,
            dollar_risk_pct=0.0,
            stop_loss_price=entry_price,
            take_profit_price=entry_price,
            atr=atr,
            method="zero",
            capped=True,
            cap_reason="Calculation failed or position too small to trade",
        )
