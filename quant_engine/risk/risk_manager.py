"""
risk/risk_manager.py
=====================
Central Risk Manager — Portfolio-Level Gate for All Trade Decisions.

THE RISK MANAGER IS THE LAST LINE OF DEFENSE BEFORE ANY ORDER REACHES A BROKER.

It aggregates all individual risk checks into a single authorize() call:
  1. Portfolio Monitor: Is the circuit breaker active? Max positions reached?
  2. Session Guard: Is the market open for this asset class?
  3. Event Calendar: Is there a high-impact event in the next 15 minutes?
  4. News Sentinel: Is there a panic alert active for this symbol?
  5. Position Sizer: Calculate the actual position size and stop/target levels.
  6. Minimum viable trade: Is the computed size above the broker's minimum?

If ALL checks pass → the risk-adjusted trade is authorized.
If ANY check fails → the trade is blocked with a specific reason.

DESIGN PRINCIPLE:
  The risk manager is STATELESS between calls — it reads current state from
  the portfolio monitor, session guard, event calendar, and news sentinel,
  but does not maintain its own mutable state.
  This makes it testable, debuggable, and safe for concurrent access.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

from loguru import logger

from core.event_calendar import EventCalendar
from core.news_sentinel import NewsSentinel
from core.session_guard import SessionGuard
from regime.regime_engine import RegimeResult
from risk.leverage_manager import LeverageDecision, LeverageManager
from risk.portfolio_monitor import PortfolioMonitor
from risk.position_sizer import PositionSizer, SizingResult
from strategies.base_strategy import SignalDirection, TradeSignal


@dataclass
class TradeAuthorization:
    """
    Result of the risk manager's authorization check.

    If authorized=True, the trade may proceed with the provided sizing.
    If authorized=False, the reason field explains why it was blocked.
    """
    authorized: bool
    reason: str
    sizing: Optional[SizingResult] = None
    signal: Optional[TradeSignal] = None
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)

    def __bool__(self) -> bool:
        return self.authorized

    def __repr__(self) -> str:
        status = "✅ AUTHORIZED" if self.authorized else "🚫 BLOCKED"
        return f"TradeAuthorization({status}: {self.reason})"


class RiskManager:
    """
    Central risk gate that authorizes or blocks every trade signal.

    Usage:
        risk_mgr = RiskManager(config, session_guard, event_calendar,
                                news_sentinel, portfolio_monitor, position_sizer)

        auth = await risk_mgr.authorize(
            signal=signal,
            regime=current_regime,
            current_equity=50000.0,
            asset_class="crypto",
        )

        if auth:
            # Place the order with auth.sizing.quantity
        else:
            logger.info(f"Trade blocked: {auth.reason}")
    """

    def __init__(
        self,
        config: dict,
        session_guard: SessionGuard,
        event_calendar: EventCalendar,
        news_sentinel: NewsSentinel,
        portfolio_monitor: PortfolioMonitor,
        position_sizer: PositionSizer,
        leverage_manager: Optional[LeverageManager] = None,
    ) -> None:
        self._config = config
        self._session_guard = session_guard
        self._event_cal = event_calendar
        self._news_sentinel = news_sentinel
        self._portfolio = portfolio_monitor
        self._sizer = position_sizer
        self._leverage_mgr = leverage_manager or LeverageManager(config)

        risk_cfg = config.get("risk", {})
        self._event_blackout_mins = config.get("events", {}).get(
            "pre_event_blackout_minutes", 15
        )
        self._min_confidence = 0.25   # Signals below this confidence are ignored

    async def authorize(
        self,
        signal: TradeSignal,
        regime: RegimeResult,
        current_equity: float,
        atr: float,
        asset_class: str,
        exchange_code: str = "NYSE",
        win_rate: Optional[float] = None,
        avg_win_loss_ratio: Optional[float] = None,
        existing_correlated_exposure: float = 0.0,
        min_order_quantity: float = 0.0,
    ) -> TradeAuthorization:
        """
        Full risk authorization pipeline for a trade signal.

        Args:
            signal:            TradeSignal from a strategy.
            regime:            Current RegimeResult for this symbol.
            current_equity:    Current account equity.
            atr:               Current ATR(14) for this symbol.
            asset_class:       "crypto" | "stock" | "stocks_us" | "forex"
            exchange_code:     Exchange for session check (e.g. "NYSE", "LSE").
            win_rate:          Historical win rate for Kelly sizing (optional).
            avg_win_loss_ratio: Historical win/loss ratio (optional).
            existing_correlated_exposure: Current $ in same asset class.
            min_order_quantity: Broker minimum lot/quantity.

        Returns:
            TradeAuthorization.
        """
        symbol = signal.symbol

        # ── Check 1: Signal must be actionable ───────────────────────────
        if not signal.is_actionable():
            return TradeAuthorization(
                authorized=False,
                reason=f"Signal direction is {signal.direction.value} — no trade.",
                signal=signal,
            )

        # ── Check 2: Minimum signal confidence ───────────────────────────
        if signal.confidence < self._min_confidence:
            return TradeAuthorization(
                authorized=False,
                reason=(
                    f"Signal confidence too low: {signal.confidence:.0%} "
                    f"(minimum: {self._min_confidence:.0%})."
                ),
                signal=signal,
            )

        # ── Check 3: Regime compatibility ─────────────────────────────────
        if not regime.is_tradeable():
            return TradeAuthorization(
                authorized=False,
                reason=f"Regime {regime.state.value} is not tradeable.",
                signal=signal,
            )

        # ── Check 4: Session / Market Hours ───────────────────────────────
        session_ok, session_reason = self._session_guard.can_open_trade(
            asset_class=asset_class,
            exchange_code=exchange_code,
        )
        if not session_ok:
            return TradeAuthorization(
                authorized=False,
                reason=f"Market session closed: {session_reason}",
                signal=signal,
            )

        # ── Check 5: Economic Event Blackout ──────────────────────────────
        blackout = self._event_cal.check_blackout(
            symbol=symbol,
            blackout_minutes=self._event_blackout_mins,
        )
        if blackout.is_blocked:
            return TradeAuthorization(
                authorized=False,
                reason=f"Event blackout: {blackout.reason}",
                signal=signal,
            )

        # ── Check 6: News Panic Sentinel ──────────────────────────────────
        if self._news_sentinel.is_panic_active(symbol=symbol):
            return TradeAuthorization(
                authorized=False,
                reason=f"NEWS PANIC active for {symbol}. Trading suspended.",
                signal=signal,
            )

        # ── Check 7: Portfolio-Level Limits ───────────────────────────────
        portfolio_ok, portfolio_reason = self._portfolio.can_open_new_trade(
            asset_class=asset_class
        )
        if not portfolio_ok:
            return TradeAuthorization(
                authorized=False,
                reason=f"Portfolio limit: {portfolio_reason}",
                signal=signal,
            )

        # ── Check 8: Position Sizing (with leverage support) ─────────────
        direction = "long" if signal.direction == SignalDirection.LONG else "short"
        leverage = self._leverage_mgr.get_leverage(asset_class)
        sizing = self._sizer.calculate(
            equity=current_equity,
            entry_price=signal.entry_price or 0.0,
            atr=atr,
            signal_confidence=signal.confidence,
            win_rate=win_rate,
            avg_win_loss_ratio=avg_win_loss_ratio,
            direction=direction,
            existing_correlated_exposure=existing_correlated_exposure,
            leverage=leverage,
        )

        if sizing.quantity <= 0:
            return TradeAuthorization(
                authorized=False,
                reason=f"Computed position size is zero or negative. Cannot trade.",
                signal=signal,
                sizing=sizing,
            )

        # ── Check 9: Minimum Broker Order Size ────────────────────────────
        if min_order_quantity > 0 and sizing.quantity < min_order_quantity:
            return TradeAuthorization(
                authorized=False,
                reason=(
                    f"Computed quantity {sizing.quantity:.8f} is below broker "
                    f"minimum {min_order_quantity:.8f}."
                ),
                signal=signal,
                sizing=sizing,
            )

        # ── Check 10: Leverage & Liquidation Buffer Gate ──────────────────
        lev_decision = self._leverage_mgr.check_trade(
            symbol=symbol,
            direction=direction,
            entry_price=signal.entry_price or 0.0,
            quantity=sizing.quantity,
            atr=atr,
            asset_class=asset_class,
        )
        if not lev_decision.approved:
            return TradeAuthorization(
                authorized=False,
                reason=f"Leverage risk gate: {lev_decision.reason}",
                signal=signal,
                sizing=sizing,
            )

        # ── ALL CHECKS PASSED ─────────────────────────────────────────────
        logger.info(
            f"[RiskManager] ✅ AUTHORIZED | {signal.direction.value.upper()} "
            f"{sizing.quantity:.6f} {symbol} | "
            f"Risk=${sizing.dollar_risk:.2f} ({sizing.dollar_risk_pct:.3f}%) | "
            f"SL={sizing.stop_loss_price:.6f} | TP={sizing.take_profit_price:.6f} | "
            f"Strategy={signal.strategy_id} | Regime={regime.state.value}"
        )

        return TradeAuthorization(
            authorized=True,
            reason="All risk checks passed.",
            sizing=sizing,
            signal=signal,
        )
