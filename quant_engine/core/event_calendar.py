"""
core/event_calendar.py
======================
Macro Economic Calendar & Event Blackout Guard.

CRITICAL FUNCTION:
  High-impact economic news releases cause instantaneous, violent price
  moves with spreads widening 5x-20x above normal. Any position opened
  seconds before such an event has near-zero edge and very high risk.

  This module:
  1. Fetches the upcoming economic events from free APIs.
  2. Caches them locally (refreshed every 4 hours).
  3. Provides a real-time check: "is there a high-impact event in the
     next N minutes for this symbol's currency pair?"
  4. Signals the trade authorizer to block new entries pre-event and
     move existing stops to breakeven.

EVENT SOURCES:
  - ForexFactory JSON feed (no auth required — public API)
  - Finnhub earnings calendar (free tier — requires FINNHUB_API_KEY)
  - Fallback: hardcoded schedule of known recurring high-impact releases

IMPACT CLASSIFICATION:
  - HIGH:   Block new entries + move stops to BE
  - MEDIUM: Reduce position size by 50%
  - LOW:    Proceed normally (informational only)
"""

from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import aiohttp
from loguru import logger


# ---------------------------------------------------------------------------
# Data Structures
# ---------------------------------------------------------------------------

class EconomicEvent:
    """Represents a single economic calendar event."""

    __slots__ = (
        "title", "country", "currency", "impact",
        "timestamp_utc", "actual", "forecast", "previous",
        "affects_symbols",
    )

    def __init__(
        self,
        title: str,
        country: str,
        currency: str,
        impact: str,
        timestamp_utc: datetime,
        actual: Optional[str] = None,
        forecast: Optional[str] = None,
        previous: Optional[str] = None,
    ) -> None:
        self.title = title
        self.country = country
        self.currency = currency
        self.impact = impact.upper()          # "HIGH", "MEDIUM", "LOW"
        self.timestamp_utc = timestamp_utc
        self.actual = actual
        self.forecast = forecast
        self.previous = previous

        # Which forex pairs and asset classes are affected by this currency
        self.affects_symbols: list[str] = self._derive_affected_symbols(currency)

    def _derive_affected_symbols(self, currency: str) -> list[str]:
        """Map a currency to the symbols most sensitive to its events."""
        currency_symbol_map = {
            "USD": ["EURUSD", "GBPUSD", "USDJPY", "USDCAD", "AUDUSD", "USDCHF",
                    "NZDUSD", "XAUUSD", "SPY", "QQQ", "BTC/USDT"],
            "EUR": ["EURUSD", "EURGBP", "EURJPY", "EURCAD"],
            "GBP": ["GBPUSD", "EURGBP", "GBPJPY"],
            "JPY": ["USDJPY", "EURJPY", "GBPJPY", "AUDJPY"],
            "AUD": ["AUDUSD", "AUDJPY", "AUDCAD"],
            "CAD": ["USDCAD", "AUDCAD", "CADJPY"],
            "NZD": ["NZDUSD"],
            "CHF": ["USDCHF", "EURCHF", "GBPCHF"],
            "CNY": ["BTC/USDT", "ETH/USDT"],  # China events affect crypto sentiment
        }
        return currency_symbol_map.get(currency.upper(), [])

    def minutes_until(self, now_utc: Optional[datetime] = None) -> float:
        """Return how many minutes until this event fires. Negative if past."""
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)
        delta = self.timestamp_utc - now_utc
        return delta.total_seconds() / 60.0

    def __repr__(self) -> str:
        mins = self.minutes_until()
        sign = "+" if mins >= 0 else ""
        return (
            f"EconomicEvent({self.impact}|{self.currency}|{self.title!r} "
            f"in {sign}{mins:.0f}m)"
        )


# ---------------------------------------------------------------------------
# Event Calendar
# ---------------------------------------------------------------------------

class EventCalendar:
    """
    Fetches, caches, and queries upcoming macro economic events.

    Usage:
        cal = EventCalendar()
        await cal.refresh()

        # Check before placing a trade
        result = cal.check_blackout("EURUSD", blackout_minutes=15)
        if result.is_blocked:
            print(result.reason)
    """

    CACHE_FILE = Path("data/cache/event_calendar.json")
    CACHE_TTL_HOURS = 4          # Refresh cache every 4 hours
    FOREXFACTORY_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"

    def __init__(self, finnhub_api_key: Optional[str] = None) -> None:
        self._events: list[EconomicEvent] = []
        self._last_refresh: Optional[datetime] = None
        self._finnhub_key = finnhub_api_key or os.environ.get("FINNHUB_API_KEY", "")
        self._lock = asyncio.Lock()

    async def refresh(self, force: bool = False) -> None:
        """
        Refresh the event calendar from online sources.

        Args:
            force: If True, refresh even if cache is still fresh.
        """
        async with self._lock:
            now = datetime.now(timezone.utc)

            # Check if cache is still fresh
            if not force and self._last_refresh:
                age_hours = (now - self._last_refresh).total_seconds() / 3600
                if age_hours < self.CACHE_TTL_HOURS:
                    return

            events = []

            # Try ForexFactory feed first (no API key required)
            ff_events = await self._fetch_forexfactory()
            events.extend(ff_events)

            # Try Finnhub earnings calendar for stock events
            if self._finnhub_key:
                earnings = await self._fetch_finnhub_earnings()
                events.extend(earnings)

            # Fallback: hardcoded recurring high-impact events schedule
            if not events:
                events = self._get_hardcoded_recurring_events()

            self._events = events
            self._last_refresh = now

            high_count = sum(1 for e in events if e.impact == "HIGH")
            logger.info(
                f"[EventCalendar] Refreshed: {len(events)} events "
                f"({high_count} HIGH-impact) for this week."
            )

    async def start_auto_refresh(self, interval_hours: float = 4.0) -> None:
        """Start a background task that auto-refreshes the calendar."""
        async def _refresh_loop():
            while True:
                try:
                    await self.refresh()
                except Exception as e:
                    logger.error(f"[EventCalendar] Auto-refresh failed: {e}")
                await asyncio.sleep(interval_hours * 3600)

        asyncio.create_task(_refresh_loop(), name="event_calendar_refresh")
        logger.info(f"[EventCalendar] Auto-refresh every {interval_hours}h started.")

    # ── Blackout Check ─────────────────────────────────────────────────────

    def check_blackout(
        self,
        symbol: str,
        blackout_minutes: int = 15,
        now_utc: Optional[datetime] = None,
    ) -> "BlackoutResult":
        """
        Check if there is an upcoming HIGH-impact event that affects
        the given symbol within the blackout window.

        Args:
            symbol:           Trading symbol to check (e.g. "EURUSD", "AAPL").
            blackout_minutes: Block trading this many minutes before event.
            now_utc:          Override current time (for testing).

        Returns:
            BlackoutResult with is_blocked bool and reason string.
        """
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)

        for event in self._events:
            # Check if event affects this symbol
            symbol_matches = (
                symbol in event.affects_symbols or
                symbol.replace("/", "").replace("USDT", "") in event.currency
            )
            if not symbol_matches:
                continue

            if event.impact != "HIGH":
                continue

            mins_until = event.minutes_until(now_utc)

            # Block if event is within the blackout window and hasn't expired
            if -5 <= mins_until <= blackout_minutes:
                direction = "in" if mins_until >= 0 else "passed"
                abs_mins = abs(mins_until)
                return BlackoutResult(
                    is_blocked=True,
                    reason=(
                        f"HIGH-impact event [{event.currency} {event.title!r}] "
                        f"{direction} {abs_mins:.0f}m. "
                        f"Trading suspended for {symbol}."
                    ),
                    event=event,
                )

        return BlackoutResult(is_blocked=False, reason="No upcoming high-impact events.", event=None)

    def get_upcoming_events(
        self,
        hours_ahead: float = 24.0,
        impact_filter: Optional[str] = None,
        now_utc: Optional[datetime] = None,
    ) -> list[EconomicEvent]:
        """
        Return all upcoming events within the next N hours.

        Args:
            hours_ahead:    Look-ahead window in hours.
            impact_filter:  "HIGH" | "MEDIUM" | "LOW" | None (all)
            now_utc:        Override current time.

        Returns:
            List of EconomicEvent, sorted chronologically.
        """
        if now_utc is None:
            now_utc = datetime.now(timezone.utc)

        cutoff = now_utc + timedelta(hours=hours_ahead)
        events = [
            e for e in self._events
            if now_utc <= e.timestamp_utc <= cutoff
            and (impact_filter is None or e.impact == impact_filter.upper())
        ]
        return sorted(events, key=lambda e: e.timestamp_utc)

    # ── Data Fetchers ──────────────────────────────────────────────────────

    async def _fetch_forexfactory(self) -> list[EconomicEvent]:
        """Fetch this week's events from ForexFactory public JSON feed."""
        events = []
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.FOREXFACTORY_URL,
                    timeout=aiohttp.ClientTimeout(total=10),
                    headers={"User-Agent": "QuantEngine/1.0"},
                ) as response:
                    if response.status != 200:
                        logger.warning(
                            f"[EventCalendar] ForexFactory returned HTTP {response.status}"
                        )
                        return []
                    raw = await response.json(content_type=None)

            for item in raw:
                try:
                    # Parse timestamp: ForexFactory format "01-06-2026T00:00:00-0500"
                    ts_str = item.get("date", "")
                    if not ts_str:
                        continue
                    ts = datetime.fromisoformat(ts_str)
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                    ts_utc = ts.astimezone(timezone.utc)

                    impact_raw = item.get("impact", "Low").lower()
                    impact = "HIGH" if impact_raw in ("high", "holiday") else \
                             "MEDIUM" if impact_raw == "medium" else "LOW"

                    event = EconomicEvent(
                        title=item.get("title", "Unknown"),
                        country=item.get("country", ""),
                        currency=item.get("country", ""),  # FF uses country code
                        impact=impact,
                        timestamp_utc=ts_utc,
                        actual=item.get("actual"),
                        forecast=item.get("forecast"),
                        previous=item.get("previous"),
                    )
                    events.append(event)
                except Exception as e:
                    logger.debug(f"[EventCalendar] Skipping malformed FF event: {e}")

            logger.info(f"[EventCalendar] Fetched {len(events)} events from ForexFactory.")
        except Exception as e:
            logger.warning(f"[EventCalendar] ForexFactory fetch failed: {e}")

        return events

    async def _fetch_finnhub_earnings(self) -> list[EconomicEvent]:
        """Fetch corporate earnings dates from Finnhub (requires API key)."""
        if not self._finnhub_key:
            return []
        events = []
        try:
            now = datetime.now(timezone.utc)
            from_date = now.strftime("%Y-%m-%d")
            to_date = (now + timedelta(days=7)).strftime("%Y-%m-%d")
            url = (
                f"https://finnhub.io/api/v1/calendar/earnings"
                f"?from={from_date}&to={to_date}&token={self._finnhub_key}"
            )
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status != 200:
                        return []
                    data = await resp.json()

            for item in data.get("earningsCalendar", []):
                date_str = item.get("date", "")
                hour = item.get("hour", "bmo")  # bmo=before market open, amc=after
                if not date_str:
                    continue

                # Earnings typically at 06:30 ET (bmo) or 16:15 ET (amc)
                time_offset = timedelta(hours=11, minutes=30) if hour == "bmo" else timedelta(hours=21, minutes=15)
                base_dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                event_ts = base_dt + time_offset

                event = EconomicEvent(
                    title=f"Earnings: {item.get('symbol', 'Unknown')}",
                    country="US",
                    currency="USD",
                    impact="HIGH",
                    timestamp_utc=event_ts,
                    forecast=str(item.get("epsEstimate", "")) if item.get("epsEstimate") else None,
                    actual=str(item.get("epsActual", "")) if item.get("epsActual") else None,
                )
                # Earnings specifically affects the stock symbol
                event.affects_symbols = [item.get("symbol", "")]
                events.append(event)

            logger.info(f"[EventCalendar] Fetched {len(events)} earnings events from Finnhub.")
        except Exception as e:
            logger.warning(f"[EventCalendar] Finnhub fetch failed: {e}")

        return events

    def _get_hardcoded_recurring_events(self) -> list[EconomicEvent]:
        """
        Hardcoded weekly/monthly recurring event schedule as last resort.
        Times are approximate UTC. These are the most impactful recurring
        US economic releases.
        """
        now = datetime.now(timezone.utc)
        current_week_monday = now - timedelta(days=now.weekday())
        events = []

        # US Non-Farm Payrolls — First Friday of each month at 13:30 UTC
        # US CPI — Usually 2nd Tuesday or Wednesday at 13:30 UTC
        # FOMC — 8 times per year (approximate Wednesday 19:00 UTC)
        # These are placeholders — real data comes from the API feeds above.
        # This is only a last-resort fallback.

        recurring = [
            ("US Non-Farm Payrolls (NFP)", "USD", "HIGH",
             current_week_monday + timedelta(days=4, hours=13, minutes=30)),
        ]

        for title, currency, impact, ts in recurring:
            if ts > now:
                events.append(EconomicEvent(
                    title=title,
                    country="US",
                    currency=currency,
                    impact=impact,
                    timestamp_utc=ts,
                ))

        return events


# ---------------------------------------------------------------------------
# Blackout Result
# ---------------------------------------------------------------------------

class BlackoutResult:
    """Result of an event blackout check."""
    __slots__ = ("is_blocked", "reason", "event")

    def __init__(self, is_blocked: bool, reason: str, event: Optional[EconomicEvent]) -> None:
        self.is_blocked = is_blocked
        self.reason = reason
        self.event = event

    def __bool__(self) -> bool:
        return self.is_blocked

    def __repr__(self) -> str:
        status = "BLOCKED" if self.is_blocked else "CLEAR"
        return f"BlackoutResult({status}: {self.reason})"
