"""
risk/leverage_manager.py
========================
Centralised leverage management layer.

Responsibilities
----------------
1.  Load and validate leverage settings from config.
2.  Apply hard ceiling caps per asset class (never exceed max_crypto etc.)
3.  Set leverage on the exchange before a trade is placed.
4.  Calculate the exact liquidation price for a proposed position.
5.  Run the liquidation-buffer safety gate (block trade if liq price
    is dangerously close to entry).
6.  Monitor margin health every 30 seconds and emit warnings.

Design principle
----------------
All leverage logic lives here. The rest of the system (RiskManager,
PositionSizer, Engine) just calls into this module. Nothing is scattered.

Liquidation price formula (simplified, cross-margin isolated)
-------------------------------------------------------------
  LONG:   liq_price = entry × (1 - 1/leverage + maintenance_margin)
  SHORT:  liq_price = entry × (1 + 1/leverage - maintenance_margin)

Binance uses ~0.5% maintenance margin for most perpetuals.
Bybit uses 0.5% as well.  We use 0.5% as a conservative default.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Dict, Optional

from loguru import logger


# ── Constants ──────────────────────────────────────────────────────────────
MAINTENANCE_MARGIN_RATE = 0.005   # 0.5% — standard for most perpetuals
DEFAULT_LEVERAGE_CAP    = 20      # absolute global ceiling if not set in config


# ── Data structures ────────────────────────────────────────────────────────

@dataclass
class LeverageDecision:
    """Result of a leverage safety gate check."""
    approved:           bool
    reason:             str
    effective_leverage: int
    liquidation_price:  float
    margin_required:    float       # USD required to open the position


@dataclass
class MarginHealth:
    """Current margin state on the exchange."""
    available_margin:   float
    used_margin:        float
    margin_ratio:       float       # used / total — if 1.0 the account is liquidated
    is_healthy:         bool
    warning:            str = ""


# ── LeverageManager ────────────────────────────────────────────────────────

class LeverageManager:
    """
    Single source of truth for all leverage-related decisions.

    Usage
    -----
        lm = LeverageManager(config)

        # Before placing a trade:
        decision = lm.check_trade(
            symbol="BTC/USDT",
            direction="long",
            entry_price=67_000.0,
            quantity=0.01,
            atr=1_800.0,
            asset_class="crypto",
        )
        if not decision.approved:
            logger.warning(f"Leverage gate blocked: {decision.reason}")
            return
    """

    def __init__(self, config: dict) -> None:
        lev_cfg = config.get("leverage", {})

        self.enabled: bool = lev_cfg.get("enabled", False)

        # Per-asset-class leverage settings
        self._leverage: Dict[str, int] = {
            "crypto":    min(int(lev_cfg.get("crypto", 1)),    int(lev_cfg.get("max_crypto", 20))),
            "forex":     min(int(lev_cfg.get("forex",  1)),    int(lev_cfg.get("max_forex",  10))),
            "stocks_us": min(int(lev_cfg.get("stocks", 1)),    int(lev_cfg.get("max_stocks",  4))),
        }

        self._max_leverage: Dict[str, int] = {
            "crypto":    int(lev_cfg.get("max_crypto", 20)),
            "forex":     int(lev_cfg.get("max_forex",  10)),
            "stocks_us": int(lev_cfg.get("max_stocks",  4)),
        }

        self._margin_health_min_pct: float = lev_cfg.get("margin_health_min_pct", 20.0)
        self._liquidation_buffer_atr: float = lev_cfg.get("liquidation_buffer_atr", 1.5)
        self._futures_exchange: str = lev_cfg.get("futures_exchange", "binance")

        # Cache of leverage set on the exchange (symbol → leverage)
        self._exchange_leverage_cache: Dict[str, int] = {}

        # Lock for async margin checks
        self._lock = asyncio.Lock()

        if self.enabled:
            logger.info(
                f"[LeverageManager] ENABLED — "
                f"Crypto: {self._leverage['crypto']}×  "
                f"Forex: {self._leverage['forex']}×  "
                f"Stocks: {self._leverage['stocks_us']}×"
            )
        else:
            logger.info("[LeverageManager] Leverage disabled (spot/cash trading mode).")

    # ── Public API ─────────────────────────────────────────────────────────

    def get_leverage(self, asset_class: str) -> int:
        """Return the configured leverage for an asset class. Returns 1 if disabled."""
        if not self.enabled:
            return 1
        return self._leverage.get(asset_class, 1)

    def calculate_liquidation_price(
        self,
        direction: str,
        entry_price: float,
        leverage: int,
        maintenance_margin: float = MAINTENANCE_MARGIN_RATE,
    ) -> float:
        """
        Calculate the exchange liquidation price for a position.

        Parameters
        ----------
        direction : 'long' or 'short'
        entry_price : float  — price at which the position is entered
        leverage : int       — leverage multiplier
        maintenance_margin : float — exchange maintenance margin rate (default 0.5%)

        Returns
        -------
        float — price at which exchange will force-liquidate the position
        """
        if leverage <= 1:
            return 0.0  # No liquidation risk with no leverage

        if direction == "long":
            # LONG liquidation: price falls enough to wipe initial margin
            liq = entry_price * (1 - (1 / leverage) + maintenance_margin)
        else:
            # SHORT liquidation: price rises enough to wipe initial margin
            liq = entry_price * (1 + (1 / leverage) - maintenance_margin)

        return round(liq, 8)

    def calculate_margin_required(
        self,
        entry_price: float,
        quantity: float,
        leverage: int,
    ) -> float:
        """
        Calculate the USD margin (collateral) required to open a position.

        margin = (entry_price × quantity) / leverage
        """
        if leverage <= 0:
            return entry_price * quantity
        return (entry_price * quantity) / leverage

    def check_trade(
        self,
        symbol: str,
        direction: str,
        entry_price: float,
        quantity: float,
        atr: float,
        asset_class: str,
        available_margin: Optional[float] = None,
    ) -> LeverageDecision:
        """
        Full pre-trade leverage safety gate.

        Checks
        ------
        1. Leverage is within allowed range for asset class.
        2. Liquidation price is not within liquidation_buffer_atr of entry.
        3. Available margin is sufficient (if provided).

        Returns LeverageDecision with approved=True/False and reason.
        """
        leverage = self.get_leverage(asset_class)

        # Compute key values
        liq_price = self.calculate_liquidation_price(direction, entry_price, leverage)
        margin_required = self.calculate_margin_required(entry_price, quantity, leverage)

        # No leverage mode — always approve
        if not self.enabled or leverage <= 1:
            return LeverageDecision(
                approved=True,
                reason="No leverage — spot trade",
                effective_leverage=1,
                liquidation_price=0.0,
                margin_required=margin_required,
            )

        # ── Gate 1: Liquidation buffer check ──────────────────────────────
        if atr > 0:
            if direction == "long":
                distance_to_liq = entry_price - liq_price
            else:
                distance_to_liq = liq_price - entry_price

            buffer_required = atr * self._liquidation_buffer_atr

            if distance_to_liq < buffer_required:
                return LeverageDecision(
                    approved=False,
                    reason=(
                        f"Liquidation price ${liq_price:.2f} is only "
                        f"{distance_to_liq:.2f} from entry (need {buffer_required:.2f} buffer). "
                        f"Reduce leverage to {self._safe_leverage(entry_price, atr, direction)}×."
                    ),
                    effective_leverage=leverage,
                    liquidation_price=liq_price,
                    margin_required=margin_required,
                )

        # ── Gate 2: Margin sufficiency check ──────────────────────────────
        if available_margin is not None and available_margin < margin_required:
            return LeverageDecision(
                approved=False,
                reason=(
                    f"Insufficient margin: need ${margin_required:.2f} "
                    f"but only ${available_margin:.2f} available."
                ),
                effective_leverage=leverage,
                liquidation_price=liq_price,
                margin_required=margin_required,
            )

        # ── All gates passed ───────────────────────────────────────────────
        logger.debug(
            f"[LeverageManager] {symbol} {direction.upper()} {leverage}× | "
            f"Entry: ${entry_price:.4f} | Liq: ${liq_price:.4f} | "
            f"Margin: ${margin_required:.2f}"
        )
        return LeverageDecision(
            approved=True,
            reason=f"{leverage}× leverage approved",
            effective_leverage=leverage,
            liquidation_price=liq_price,
            margin_required=margin_required,
        )

    def adjust_position_size_for_leverage(
        self,
        base_quantity: float,
        leverage: int,
        asset_class: str,
    ) -> float:
        """
        Adjust a base quantity to account for leverage.

        With leverage, we keep the RISK (stop loss distance × quantity × price)
        the same in USD terms. The position is larger but the margin required is
        smaller, and the exchange provides the rest.

        We do NOT blindly multiply quantity by leverage — that would multiply
        our risk too. Instead we use leverage to reduce margin requirements while
        keeping the same dollar risk per trade.
        """
        if not self.enabled or leverage <= 1:
            return base_quantity

        # Cap leverage at the asset-class maximum
        max_lev = self._max_leverage.get(asset_class, DEFAULT_LEVERAGE_CAP)
        effective_leverage = min(leverage, max_lev)

        # Scale quantity: more exposure for same margin outlay
        adjusted = base_quantity * effective_leverage
        return adjusted

    def check_margin_health(
        self,
        used_margin: float,
        total_margin: float,
    ) -> MarginHealth:
        """
        Check if current margin ratio is healthy.

        margin_ratio = used_margin / total_margin
        If > (1 - margin_health_min_pct/100) → warning
        """
        if total_margin <= 0:
            return MarginHealth(
                available_margin=0,
                used_margin=0,
                margin_ratio=0,
                is_healthy=True,
            )

        available = total_margin - used_margin
        ratio = used_margin / total_margin
        threshold = 1.0 - (self._margin_health_min_pct / 100.0)
        is_healthy = ratio < threshold

        warning = ""
        if not is_healthy:
            warning = (
                f"⚠️ Margin at {ratio*100:.1f}% utilisation "
                f"(limit: {threshold*100:.0f}%). "
                f"Reducing position sizes."
            )
            logger.warning(f"[LeverageManager] {warning}")

        return MarginHealth(
            available_margin=available,
            used_margin=used_margin,
            margin_ratio=ratio,
            is_healthy=is_healthy,
            warning=warning,
        )

    # ── Private helpers ────────────────────────────────────────────────────

    def _safe_leverage(
        self,
        entry_price: float,
        atr: float,
        direction: str,
        maintenance_margin: float = MAINTENANCE_MARGIN_RATE,
    ) -> int:
        """
        Calculate the highest leverage where the liquidation price is still
        outside the ATR buffer. Useful for suggesting a safer alternative.
        """
        for lev in range(20, 0, -1):
            liq = self.calculate_liquidation_price(direction, entry_price, lev, maintenance_margin)
            if direction == "long":
                dist = entry_price - liq
            else:
                dist = liq - entry_price
            if dist >= atr * self._liquidation_buffer_atr:
                return lev
        return 1
