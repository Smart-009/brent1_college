"""
core/session_guard.py
=====================
Market Hours & Holiday Calendar Guard.

CRITICAL FUNCTION:
  This module prevents the trading engine from placing orders when markets
  are closed, during pre/post-market illiquidity, or during known low-
  liquidity periods like Friday/Sunday forex gaps.

  A trade placed into a closed or illiquid market faces:
  - Massively widened spreads (5x to 20x normal)
  - Gaps on open that skip stop-losses entirely
  - Zero liquidity resulting in catastrophic slippage

COVERAGE:
  - NYSE / NASDAQ (US Stock Market)
  - Forex & Metals (London/NY/Tokyo/Sydney sessions)
  - Crypto (24/7 — always open, but liquidity warnings on weekend)
  - Global stock exchanges via exchange code lookup

HOLIDAY DATA:
  Uses the `pandas_market_calendars` library which maintains up-to-date
  holiday schedules for 50+ global exchanges.
"""

from __future__ import annotations

import asyncio
from datetime import date, datetime, time, timezone
from enum import Enum
from typing import Optional

from loguru import logger


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class MarketState(str, Enum):
    OPEN = "open"                 # Normal trading hours — full liquidity
    PRE_MARKET = "pre_market"     # Extended hours — reduced liquidity
    POST_MARKET = "post_market"   # Extended hours — reduced liquidity
    CLOSED = "closed"             # Market is closed
    HOLIDAY = "holiday"           # Exchange holiday
    LOW_LIQUIDITY = "low_liquidity"  # Open but thin market (e.g. Sunday crypto)


class ForexSession(str, Enum):
    SYDNEY  = "sydney"     # 22:00 – 07:00 UTC
    TOKYO   = "tokyo"      # 00:00 – 09:00 UTC
    LONDON  = "london"     # 08:00 – 17:00 UTC
    NEW_YORK = "new_york"  # 13:00 – 22:00 UTC
    OVERLAP_LONDON_NY = "london_ny_overlap"  # 13:00–17:00 UTC (highest volume)


# ---------------------------------------------------------------------------
# Session Guard
# ---------------------------------------------------------------------------

class SessionGuard:
    """
    Determines market state for any exchange at the current UTC time.

    Usage:
        guard = SessionGuard()
        await guard.initialize()

        state = guard.get_market_state("NYSE")
        if state != MarketState.OPEN:
            logger.info(f"NYSE is {state} — skipping trade.")

        sessions = guard.get_active_forex_sessions()
        if ForexSession.OVERLAP_LONDON_NY in sessions:
            logger.info("Highest liquidity window — optimal for forex trades.")
    """

    # NYSE/NASDAQ trading hours in ET (Eastern Time)
    NYSE_OPEN_ET  = time(9, 30)    # 09:30 ET
    NYSE_CLOSE_ET = time(16, 0)    # 16:00 ET
    NYSE_PRE_OPEN_ET  = time(4, 0) # Pre-market starts 04:00 ET
    NYSE_POST_CLOSE_ET = time(20, 0) # Post-market ends 20:00 ET

    # ET offset from UTC (standard: -5h, daylight saving: -4h)
    # We calculate this dynamically to handle DST correctly
    # rather than hardcoding an offset.

    # Forex session times in UTC
    FOREX_SESSIONS = {
        ForexSession.SYDNEY:    (time(22, 0), time(7, 0)),   # wraps midnight
        ForexSession.TOKYO:     (time(0, 0),  time(9, 0)),
        ForexSession.LONDON:    (time(8, 0),  time(17, 0)),
        ForexSession.NEW_YORK:  (time(13, 0), time(22, 0)),
        ForexSession.OVERLAP_LONDON_NY: (time(13, 0), time(17, 0)),
    }

    def __init__(self) -> None:
        self._calendar_cache: dict = {}
        self._calendars_initialized = False

    async def initialize(self) -> None:
        """Pre-load market calendars for fast lookup during trading."""
        try:
            import pandas_market_calendars as mcal  # type: ignore
            self._mcal = mcal
            self._calendars_initialized = True
            logger.info("[SessionGuard] Market calendars loaded.")
        except ImportError:
            logger.warning(
                "[SessionGuard] pandas_market_calendars not installed. "
                "Install: pip install pandas-market-calendars. "
                "Falling back to simplified NYSE schedule."
            )
            self._mcal = None
            self._calendars_initialized = False

    # ── Stock Market State ─────────────────────────────────────────────────

    def get_stock_market_state(
        self,
        exchange_code: str = "NYSE",
        now_utc: Optional[datetime] = None,
    ) -> MarketState:
        """
        Return the current state of a stock exchange.

        Args:
            exchange_code: Exchange identifier (e.g. "NYSE", "LSE", "TSE", "XETRA").
            now_utc:       Override current UTC time (useful for testing).

        Returns:
            MarketState enum value.
        """
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)

        # Check weekend first (quick guard)
        if now_utc.weekday() >= 5:  # Saturday=5, Sunday=6
            return MarketState.CLOSED

        if self._calendars_initialized and self._mcal:
            return self._check_with_mcal(exchange_code, now_utc)
        else:
            return self._check_nyse_fallback(now_utc)

    def _check_with_mcal(self, exchange_code: str, now_utc: datetime) -> MarketState:
        """Use pandas_market_calendars to accurately check market state."""
        try:
            cal = self._mcal.get_calendar(exchange_code)
            today_str = now_utc.strftime("%Y-%m-%d")
            schedule = cal.schedule(start_date=today_str, end_date=today_str)

            if schedule.empty:
                return MarketState.HOLIDAY

            market_open_utc = schedule.iloc[0]["market_open"]
            market_close_utc = schedule.iloc[0]["market_close"]

            if market_open_utc.tzinfo is None:
                market_open_utc = market_open_utc.tz_localize("UTC")
            if market_close_utc.tzinfo is None:
                market_close_utc = market_close_utc.tz_localize("UTC")

            if market_open_utc <= now_utc <= market_close_utc:
                return MarketState.OPEN
            else:
                return MarketState.CLOSED

        except Exception as e:
            logger.warning(f"[SessionGuard] Calendar lookup failed for {exchange_code}: {e}")
            return self._check_nyse_fallback(now_utc)

    def _check_nyse_fallback(self, now_utc: datetime) -> MarketState:
        """
        Simplified NYSE state check without pandas_market_calendars.
        Does NOT account for US holidays — install pandas_market_calendars
        for full accuracy.
        """
        # Convert UTC to ET (approximate: UTC-5 standard, UTC-4 DST)
        # Use Python's built-in EST offset (simplified)
        import zoneinfo
        try:
            et = zoneinfo.ZoneInfo("America/New_York")
            now_et = now_utc.astimezone(et)
        except Exception:
            # Fallback: subtract 5 hours (approximate EST)
            from datetime import timedelta
            now_et = now_utc - timedelta(hours=5)

        now_time_et = now_et.time()

        if now_et.weekday() >= 5:
            return MarketState.CLOSED
        if self.NYSE_OPEN_ET <= now_time_et < self.NYSE_CLOSE_ET:
            return MarketState.OPEN
        if self.NYSE_PRE_OPEN_ET <= now_time_et < self.NYSE_OPEN_ET:
            return MarketState.PRE_MARKET
        if self.NYSE_CLOSE_ET <= now_time_et < self.NYSE_POST_CLOSE_ET:
            return MarketState.POST_MARKET
        return MarketState.CLOSED

    # ── Forex Session State ────────────────────────────────────────────────

    def get_active_forex_sessions(
        self,
        now_utc: Optional[datetime] = None,
    ) -> list[ForexSession]:
        """
        Return list of all currently active Forex trading sessions.

        Returns:
            List of active ForexSession values.
            Empty list only if market is in weekend dead zone.
        """
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)

        # Forex closes Friday 22:00 UTC, reopens Sunday 22:00 UTC
        weekday = now_utc.weekday()  # Monday=0, ..., Sunday=6
        current_time = now_utc.time()

        # Weekend dead zone
        if weekday == 5:  # Saturday — fully closed
            return []
        if weekday == 6 and current_time < time(22, 0):  # Sunday before 22:00 UTC
            return []
        if weekday == 4 and current_time >= time(22, 0):  # Friday after 22:00 UTC
            return []

        active = []
        for session, (open_t, close_t) in self.FOREX_SESSIONS.items():
            if open_t > close_t:
                # Session wraps midnight (e.g. Sydney 22:00–07:00)
                if current_time >= open_t or current_time < close_t:
                    active.append(session)
            else:
                if open_t <= current_time < close_t:
                    active.append(session)

        return active

    def is_forex_high_liquidity(self, now_utc: Optional[datetime] = None) -> bool:
        """
        Returns True if the London/New York overlap session is active.
        This is the highest-liquidity period of the trading day (13:00–17:00 UTC).
        """
        sessions = self.get_active_forex_sessions(now_utc)
        return ForexSession.OVERLAP_LONDON_NY in sessions

    # ── Crypto State ───────────────────────────────────────────────────────

    def get_crypto_state(self, now_utc: Optional[datetime] = None) -> MarketState:
        """
        Crypto is 24/7 but liquidity varies.
        Returns LOW_LIQUIDITY on weekend nights (UTC 00:00-10:00 Saturday/Sunday)
        when BTC volume is typically 40-60% below weekday average.
        """
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)

        weekday = now_utc.weekday()
        hour = now_utc.hour

        # Weekend low-liquidity windows
        if weekday == 5 and hour < 10:  # Saturday before 10:00 UTC
            return MarketState.LOW_LIQUIDITY
        if weekday == 6 and hour < 10:  # Sunday before 10:00 UTC
            return MarketState.LOW_LIQUIDITY

        return MarketState.OPEN

    # ── Convenience: Can Trade? ────────────────────────────────────────────

    def can_open_trade(
        self,
        asset_class: str,
        exchange_code: str = "NYSE",
        now_utc: Optional[datetime] = None,
        allow_pre_post_market: bool = False,
    ) -> tuple[bool, str]:
        """
        Master check: Can a new trade be opened right now?

        Args:
            asset_class:           "crypto" | "stock" | "forex"
            exchange_code:         Stock exchange code (if asset_class=="stock")
            now_utc:               Override current time (for testing)
            allow_pre_post_market: If True, allows stock trades in pre/post market.

        Returns:
            Tuple of (allowed: bool, reason: str)
        """
        if asset_class == "crypto":
            state = self.get_crypto_state(now_utc)
            if state == MarketState.LOW_LIQUIDITY:
                return False, "Crypto weekend low-liquidity window"
            return True, "Crypto market open (24/7)"

        elif asset_class == "forex":
            sessions = self.get_active_forex_sessions(now_utc)
            if not sessions:
                return False, "Forex market closed (weekend)"
            return True, f"Active sessions: {[s.value for s in sessions]}"

        elif asset_class in ("stock", "stocks_us"):
            state = self.get_stock_market_state(exchange_code, now_utc)
            if state == MarketState.OPEN:
                return True, f"{exchange_code} market open"
            if state in (MarketState.PRE_MARKET, MarketState.POST_MARKET):
                if allow_pre_post_market:
                    return True, f"{exchange_code} extended hours trading"
                return False, f"{exchange_code} extended hours — limited liquidity"
            if state == MarketState.HOLIDAY:
                return False, f"{exchange_code} holiday"
            return False, f"{exchange_code} market closed"

        else:
            # Unknown asset class — be safe and block trading
            return False, f"Unknown asset class: {asset_class!r}"
