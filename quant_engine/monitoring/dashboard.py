"""
monitoring/dashboard.py
=======================
Live terminal dashboard powered by the `rich` library.

Run automatically when you start the engine with --mode paper/live.
Displays real-time portfolio, open positions, recent signals, and
intelligence layer status — refreshing every 2 seconds.

Architecture
------------
DashboardMonitor is a lightweight data-store.  The engine pushes data
into it via simple thread-safe methods.  The dashboard's own async loop
reads from it to render the UI — completely decoupled from trading logic.
"""

from __future__ import annotations

import asyncio
import threading
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Deque, Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Optional rich import — dashboard gracefully degrades to no-op if unavailable
# ---------------------------------------------------------------------------
try:
    from rich import box
    from rich.columns import Columns
    from rich.console import Console
    from rich.layout import Layout
    from rich.live import Live
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich.align import Align
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False


# ═══════════════════════════════════════════════════════════════════════════
# Data containers — engine pushes into these
# ═══════════════════════════════════════════════════════════════════════════

@dataclass
class PositionSnap:
    """Snapshot of a single open position."""
    symbol: str
    direction: str          # LONG / SHORT
    quantity: float
    entry_price: float
    current_price: float
    unrealized_pnl: float
    stop_price: float
    target_price: float
    regime: str
    opened_at: datetime
    leverage: int = 1
    liquidation_price: float = 0.0
    trailing_active: bool = False
    tp1_hit: bool = False


@dataclass
class SignalSnap:
    """Snapshot of a generated signal (authorised or blocked)."""
    ts: datetime
    symbol: str
    direction: str
    strategy: str
    confidence: float
    authorised: bool
    block_reason: str = ""


@dataclass
class PortfolioSnap:
    """Snapshot of current portfolio state."""
    equity: float = 100_000.0
    starting_equity: float = 100_000.0
    daily_pnl: float = 0.0
    daily_pnl_pct: float = 0.0
    max_drawdown_pct: float = 0.0
    high_water_mark: float = 100_000.0
    circuit_breaker_active: bool = False
    open_position_count: int = 0
    total_trades_today: int = 0
    leverage_mode: str = "OFF"
    margin_ratio_pct: float = 0.0


@dataclass
class IntelSnap:
    """Snapshot of intelligence layer state."""
    news_panic: bool = False
    news_reason: str = ""
    session_active: bool = True
    session_name: str = "GLOBAL"
    next_event_name: str = "—"
    next_event_eta_mins: float = 9999.0
    blackout_active: bool = False


# ═══════════════════════════════════════════════════════════════════════════
# DashboardMonitor  — the shared data store
# ═══════════════════════════════════════════════════════════════════════════

class DashboardMonitor:
    """
    Thread-safe shared state that the TradingEngine writes to
    and the dashboard reads from.

    Usage inside engine
    -------------------
    dashboard = DashboardMonitor(mode="PAPER", starting_equity=100_000)
    dashboard.update_portfolio(portfolio_snap)
    dashboard.push_position(position_snap)
    dashboard.push_signal(signal_snap)
    dashboard.update_intel(intel_snap)
    """

    def __init__(self, mode: str = "PAPER", starting_equity: float = 100_000.0):
        self.mode = mode.upper()
        self.started_at: datetime = datetime.now(timezone.utc)
        self._lock = threading.Lock()

        self.portfolio: PortfolioSnap = PortfolioSnap(
            equity=starting_equity,
            starting_equity=starting_equity,
            high_water_mark=starting_equity,
        )

        # open positions — keyed by symbol
        self._positions: Dict[str, PositionSnap] = {}

        # ring buffer of last 10 signals
        self._signals: Deque[SignalSnap] = deque(maxlen=10)

        # intelligence snapshot
        self.intel: IntelSnap = IntelSnap()

        # log tail (last 6 lines)
        self._log_lines: Deque[str] = deque(maxlen=6)

        # per-symbol regime map
        self._regimes: Dict[str, str] = {}

        # engine running flag
        self.engine_alive: bool = True

    # ── Portfolio ──────────────────────────────────────────────────────────

    def update_portfolio(self, snap: PortfolioSnap) -> None:
        with self._lock:
            self.portfolio = snap

    def quick_equity_update(self, equity: float) -> None:
        """Lightweight update — just equity changes (called every second)."""
        with self._lock:
            start = self.portfolio.starting_equity
            hwm = self.portfolio.high_water_mark
            self.portfolio.equity = equity
            self.portfolio.daily_pnl = equity - start
            self.portfolio.daily_pnl_pct = ((equity - start) / start) * 100
            dd = ((hwm - equity) / hwm) * 100 if hwm > 0 else 0.0
            self.portfolio.max_drawdown_pct = max(0.0, dd)
            if equity > hwm:
                self.portfolio.high_water_mark = equity

    # ── Positions ──────────────────────────────────────────────────────────

    def upsert_position(self, snap: PositionSnap) -> None:
        with self._lock:
            self._positions[snap.symbol] = snap
            self.portfolio.open_position_count = len(self._positions)

    def remove_position(self, symbol: str) -> None:
        with self._lock:
            self._positions.pop(symbol, None)
            self.portfolio.open_position_count = len(self._positions)

    def get_positions(self) -> List[PositionSnap]:
        with self._lock:
            return list(self._positions.values())

    # ── Signals ────────────────────────────────────────────────────────────

    def push_signal(self, snap: SignalSnap) -> None:
        with self._lock:
            self._signals.appendleft(snap)

    def get_signals(self) -> List[SignalSnap]:
        with self._lock:
            return list(self._signals)

    # ── Intelligence ───────────────────────────────────────────────────────

    def update_intel(self, snap: IntelSnap) -> None:
        with self._lock:
            self.intel = snap

    def update_regime(self, symbol: str, regime: str) -> None:
        with self._lock:
            self._regimes[symbol] = regime

    def get_regimes(self) -> Dict[str, str]:
        with self._lock:
            return dict(self._regimes)

    # ── Logs ───────────────────────────────────────────────────────────────

    def push_log(self, line: str) -> None:
        with self._lock:
            ts = datetime.now().strftime("%H:%M:%S")
            self._log_lines.append(f"[dim]{ts}[/dim] {line}")

    def get_logs(self) -> List[str]:
        with self._lock:
            return list(self._log_lines)

    # ── Helpers ────────────────────────────────────────────────────────────

    def uptime_str(self) -> str:
        delta = datetime.now(timezone.utc) - self.started_at
        h, rem = divmod(int(delta.total_seconds()), 3600)
        m, s = divmod(rem, 60)
        return f"{h:02d}h {m:02d}m {s:02d}s"


# ═══════════════════════════════════════════════════════════════════════════
# Rich renderer helpers
# ═══════════════════════════════════════════════════════════════════════════

def _color_pnl(val: float, pct: Optional[float] = None) -> Text:
    """Return a rich Text coloured green/red based on sign."""
    if pct is not None:
        label = f"${val:+,.2f}  ({pct:+.2f}%)"
    else:
        label = f"${val:+,.2f}"
    color = "bright_green" if val >= 0 else "bright_red"
    return Text(label, style=color)


def _regime_badge(regime: str) -> Text:
    palette = {
        "BULL_MOMENTUM": ("▲ BULL", "bright_green"),
        "BEAR_MOMENTUM": ("▼ BEAR", "bright_red"),
        "CHOP_RANGING": ("↔ CHOP", "yellow"),
        "HIGH_VOL_CHAOS": ("⚡ CHAOS", "bright_red"),
        "SQUEEZE": ("◉ SQUEEZE", "cyan"),
        "UNKNOWN": ("? UNKN", "dim white"),
    }
    label, color = palette.get(regime, ("? UNKN", "dim white"))
    return Text(label, style=color)


def _build_header(monitor: DashboardMonitor) -> Panel:
    mode_color = "bright_yellow" if monitor.mode == "PAPER" else "bright_red"
    mode_badge = Text(f"  {monitor.mode} MODE  ", style=f"bold {mode_color} on {mode_color if monitor.mode != 'PAPER' else 'dark_orange3'}")

    now_str = datetime.now().strftime("%Y-%m-%d  %H:%M:%S")
    uptime = monitor.uptime_str()

    cb = monitor.portfolio.circuit_breaker_active
    cb_text = Text("  ⛔ CIRCUIT BREAKER ACTIVE  ", style="bold white on red") if cb else Text("  ✅ RUNNING  ", style="bold white on dark_green")

    title_parts = Text()
    title_parts.append("  🤖 BRENT QUANT ENGINE  ", style="bold white")
    title_parts.append("  ")
    title_parts.append(mode_badge)
    title_parts.append("  ")
    title_parts.append(cb_text)
    title_parts.append(f"   🕐 {now_str}   ⏱ Uptime: {uptime}  ", style="dim white")

    return Panel(Align.center(title_parts), style="bold", height=3)


def _build_portfolio_panel(monitor: DashboardMonitor) -> Panel:
    p = monitor.portfolio
    t = Table.grid(expand=True, padding=(0, 2))
    t.add_column(justify="left")
    t.add_column(justify="right")
    t.add_column(justify="left")
    t.add_column(justify="right")

    equity_text = Text(f"${p.equity:,.2f}", style="bold bright_white")
    hwm_text = Text(f"${p.high_water_mark:,.2f}", style="cyan")
    dd_color = "bright_red" if p.max_drawdown_pct > 1 else "yellow" if p.max_drawdown_pct > 0.3 else "green"
    dd_text = Text(f"{p.max_drawdown_pct:.2f}%", style=dd_color)

    lev_style = "bold bright_yellow" if p.leverage_mode != "OFF" else "dim"
    lev_text = Text(f"{p.leverage_mode}", style=lev_style)
    margin_color = "bright_red" if p.margin_ratio_pct > 70 else "yellow" if p.margin_ratio_pct > 40 else "green"
    margin_text = Text(f"{p.margin_ratio_pct:.1f}%", style=margin_color)

    t.add_row(
        Text("Equity:", style="dim"),       equity_text,
        Text("High-Water Mark:", style="dim"), hwm_text,
    )
    t.add_row(
        Text("Daily P&L:", style="dim"),    _color_pnl(p.daily_pnl, p.daily_pnl_pct),
        Text("Max Drawdown:", style="dim"), dd_text,
    )
    t.add_row(
        Text("Open Positions:", style="dim"), Text(str(p.open_position_count), style="bold white"),
        Text("Trades Today:", style="dim"),   Text(str(p.total_trades_today), style="bold white"),
    )
    t.add_row(
        Text("Leverage Mode:", style="dim"),  lev_text,
        Text("Margin Util:", style="dim"),    margin_text,
    )

    border_style = "bold red" if p.circuit_breaker_active else "blue"
    return Panel(t, title="[bold]📊 Portfolio[/bold]", border_style=border_style)


def _build_positions_table(monitor: DashboardMonitor) -> Panel:
    positions = monitor.get_positions()

    t = Table(
        show_header=True,
        header_style="bold magenta",
        box=box.SIMPLE_HEAVY,
        expand=True,
        row_styles=["", "dim"],
    )
    t.add_column("Symbol",    style="bold cyan", no_wrap=True)
    t.add_column("Dir",       justify="center")
    t.add_column("Lev",       justify="center", style="yellow")
    t.add_column("Qty",       justify="right", style="white")
    t.add_column("Entry",     justify="right", style="white")
    t.add_column("Current",   justify="right")
    t.add_column("Unreal PnL",justify="right")
    t.add_column("Stop",      justify="right", style="bright_red")
    t.add_column("Liq.Price", justify="right", style="bright_yellow")
    t.add_column("Target",    justify="right", style="bright_green")
    t.add_column("Regime",    justify="center")
    t.add_column("Open Since",justify="right", style="dim")

    if not positions:
        t.add_row("—", "—", "—", "—", "—", "—", "—", "—", "—", "—", "—", "—")
    else:
        for pos in positions:
            dir_text = Text("▲ LONG", style="bright_green") if pos.direction == "LONG" else Text("▼ SHORT", style="bright_red")
            pnl_color = "bright_green" if pos.unrealized_pnl >= 0 else "bright_red"
            pnl_text = Text(f"${pos.unrealized_pnl:+,.2f}", style=pnl_color)
            open_since = pos.opened_at.strftime("%H:%M:%S") if pos.opened_at else "—"
            stop_style = "bold bright_yellow" if pos.trailing_active else "bright_red"
            stop_label = f"{pos.stop_price:.4f}" + (" 🚀TRAIL" if pos.trailing_active else (" 🛡️BE" if pos.tp1_hit else ""))
            liq_text = (
                Text(f"{pos.liquidation_price:.4f}", style="bold bright_yellow")
                if pos.liquidation_price and pos.liquidation_price > 0
                else Text("—", style="dim")
            )
            t.add_row(
                pos.symbol,
                dir_text,
                f"{pos.leverage}×" if pos.leverage > 1 else "1×",
                f"{pos.quantity:.4f}",
                f"{pos.entry_price:.4f}",
                f"{pos.current_price:.4f}",
                pnl_text,
                Text(stop_label, style=stop_style),
                liq_text,
                f"{pos.target_price:.4f}",
                _regime_badge(pos.regime),
                open_since,
            )

    count = len(positions)
    return Panel(t, title=f"[bold]📈 Open Positions ({count})[/bold]", border_style="green" if count else "dim")


def _build_signals_table(monitor: DashboardMonitor) -> Panel:
    signals = monitor.get_signals()

    t = Table(
        show_header=True,
        header_style="bold magenta",
        box=box.SIMPLE_HEAVY,
        expand=True,
        row_styles=["", "dim"],
    )
    t.add_column("Time",      style="dim", no_wrap=True)
    t.add_column("Symbol",    style="bold cyan", no_wrap=True)
    t.add_column("Dir",       justify="center")
    t.add_column("Strategy",  style="white")
    t.add_column("Confidence",justify="right")
    t.add_column("Status",    justify="center")
    t.add_column("Block Reason", style="dim red")

    if not signals:
        t.add_row("—", "—", "—", "—", "—", "—", "—")
    else:
        for sig in signals:
            dir_text = Text("▲ LONG", style="bright_green") if sig.direction == "LONG" else Text("▼ SHORT", style="bright_red")
            conf_text = Text(f"{sig.confidence:.1%}", style="bright_white")
            status_text = Text("✅ AUTH", style="bright_green") if sig.authorised else Text("🚫 BLOCKED", style="bright_red")
            t.add_row(
                sig.ts.strftime("%H:%M:%S"),
                sig.symbol,
                dir_text,
                sig.strategy,
                conf_text,
                status_text,
                sig.block_reason or "—",
            )

    return Panel(t, title="[bold]📡 Recent Signals (last 10)[/bold]", border_style="blue")


def _build_intel_panel(monitor: DashboardMonitor) -> Panel:
    intel = monitor.intel
    regimes = monitor.get_regimes()

    grid = Table.grid(expand=True, padding=(0, 2))
    grid.add_column(justify="left", ratio=1)
    grid.add_column(justify="left", ratio=1)

    # News panic
    if intel.news_panic:
        news_text = Text("🚨 PANIC: " + (intel.news_reason[:40] or "breaking news"), style="bold bright_red")
    else:
        news_text = Text("✅ Clear", style="bright_green")

    # Session
    sess_text = Text(
        f"✅ {intel.session_name}" if intel.session_active else f"💤 {intel.session_name} (closed)",
        style="bright_green" if intel.session_active else "dim"
    )

    # Upcoming event
    if intel.next_event_eta_mins < 30:
        evt_text = Text(f"⚠️  {intel.next_event_name}  ({intel.next_event_eta_mins:.0f}m)", style="bold yellow")
    elif intel.next_event_eta_mins < 9999:
        evt_text = Text(f"📅 {intel.next_event_name}  ({intel.next_event_eta_mins:.0f}m)", style="dim")
    else:
        evt_text = Text("📅 No events soon", style="dim")

    # Blackout
    blackout_text = Text("🔴 BLACKOUT ACTIVE", style="bold red") if intel.blackout_active else Text("✅ No blackout", style="dim green")

    grid.add_row(Text("News Panic:", style="dim"),    news_text)
    grid.add_row(Text("Session:",    style="dim"),    sess_text)
    grid.add_row(Text("Next Event:", style="dim"),    evt_text)
    grid.add_row(Text("Blackout:",   style="dim"),    blackout_text)

    # Regime mini table
    if regimes:
        r_text = Text()
        for sym, reg in list(regimes.items())[:8]:
            r_text.append(f"{sym}: ", style="dim")
            badge = _regime_badge(reg)
            r_text.append_text(badge)
            r_text.append("  ")
        grid.add_row(Text("Regimes:", style="dim"), r_text)

    return Panel(grid, title="[bold]🧠 Intelligence Layer[/bold]", border_style="magenta")


def _build_log_panel(monitor: DashboardMonitor) -> Panel:
    logs = monitor.get_logs()
    text = Text()
    for line in logs:
        text.append(line + "\n")
    if not logs:
        text.append("  — waiting for engine log output —", style="dim")
    return Panel(text, title="[bold]📋 Engine Log Tail[/bold]", border_style="dim", height=10)


def _build_layout(monitor: DashboardMonitor) -> Layout:
    layout = Layout()

    layout.split_column(
        Layout(name="header",     size=3),
        Layout(name="portfolio",  size=7),
        Layout(name="middle",     size=16),
        Layout(name="signals",    size=14),
        Layout(name="bottom",     minimum_size=10),
    )

    layout["middle"].split_row(
        Layout(name="positions", ratio=3),
        Layout(name="intel",     ratio=2),
    )

    layout["bottom"].split_row(
        Layout(name="logs",      ratio=1),
    )

    layout["header"].update(_build_header(monitor))
    layout["portfolio"].update(_build_portfolio_panel(monitor))
    layout["positions"].update(_build_positions_table(monitor))
    layout["intel"].update(_build_intel_panel(monitor))
    layout["signals"].update(_build_signals_table(monitor))
    layout["logs"].update(_build_log_panel(monitor))

    return layout


# ═══════════════════════════════════════════════════════════════════════════
# LiveDashboard — the async rendering loop
# ═══════════════════════════════════════════════════════════════════════════

class LiveDashboard:
    """
    Starts a `rich.live.Live` session in its own thread.
    Call `start()` once the engine is initialised.
    Call `stop()` when the engine shuts down.

    Parameters
    ----------
    monitor : DashboardMonitor
        The shared data store that the engine writes to.
    refresh_every : float
        Seconds between screen refreshes (default 2.0).
    """

    def __init__(self, monitor: DashboardMonitor, refresh_every: float = 2.0):
        if not RICH_AVAILABLE:
            raise RuntimeError(
                "The `rich` library is required for the dashboard. "
                "Install it with:  pip install rich"
            )
        self.monitor = monitor
        self.refresh_every = refresh_every
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._console = Console()

    def start(self) -> None:
        """Launch the dashboard rendering thread (non-blocking)."""
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_sync, daemon=True, name="DashboardThread")
        self._thread.start()

    def stop(self) -> None:
        """Signal the dashboard to stop and wait for thread to exit."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)

    def _run_sync(self) -> None:
        """Blocking loop that owns the Live context."""
        try:
            with Live(
                _build_layout(self.monitor),
                console=self._console,
                refresh_per_second=1,
                screen=True,
                transient=False,
            ) as live:
                while not self._stop_event.is_set():
                    live.update(_build_layout(self.monitor))
                    time.sleep(self.refresh_every)
        except Exception as exc:  # pragma: no cover
            # Dashboard failure must never crash the trading engine
            print(f"[Dashboard] Render error (non-fatal): {exc}")


# ═══════════════════════════════════════════════════════════════════════════
# Standalone demo — run this file directly to see the dashboard with fake data
# ═══════════════════════════════════════════════════════════════════════════

def _demo() -> None:
    """
    Self-contained demo with simulated live data.
    Usage:  python -m monitoring.dashboard
    """
    import random, math

    monitor = DashboardMonitor(mode="PAPER", starting_equity=100_000.0)

    # Seed some positions
    monitor.upsert_position(PositionSnap(
        symbol="BTC/USDT", direction="LONG", quantity=0.25,
        entry_price=67_200.0, current_price=67_850.0, unrealized_pnl=162.50,
        stop_price=66_000.0, target_price=70_000.0, regime="BULL_MOMENTUM",
        opened_at=datetime(2025, 1, 1, 9, 30, 0),
    ))
    monitor.upsert_position(PositionSnap(
        symbol="ETH/USDT", direction="SHORT", quantity=1.5,
        entry_price=3_520.0, current_price=3_480.0, unrealized_pnl=60.0,
        stop_price=3_600.0, target_price=3_300.0, regime="BEAR_MOMENTUM",
        opened_at=datetime(2025, 1, 1, 10, 15, 0),
    ))

    # Seed some signals
    for i in range(5):
        monitor.push_signal(SignalSnap(
            ts=datetime.now(), symbol=["BTC/USDT", "AAPL", "EUR/USD"][i % 3],
            direction=["LONG", "SHORT"][i % 2],
            strategy=["TrendFollowing", "MeanReversion", "Breakout"][i % 3],
            confidence=random.uniform(0.55, 0.92),
            authorised=i % 4 != 0,
            block_reason="" if i % 4 != 0 else "Risk: corr exposure limit",
        ))

    # Seed regime map
    for sym, reg in [("BTC/USDT", "BULL_MOMENTUM"), ("ETH/USDT", "BEAR_MOMENTUM"),
                     ("AAPL", "SQUEEZE"), ("EUR/USD", "CHOP_RANGING")]:
        monitor.update_regime(sym, reg)

    # Seed intel
    monitor.update_intel(IntelSnap(
        news_panic=False, session_active=True, session_name="LONDON+NY",
        next_event_name="FOMC Minutes", next_event_eta_mins=22.5,
        blackout_active=False,
    ))

    # Seed logs
    for msg in [
        "[Engine] Main loop tick — 4 symbols processed",
        "[BTC/USDT] Signal: LONG (conf=0.78) → AUTHORISED",
        "[PortfolioMonitor] Equity: $100,162.50",
        "[NewsSentinel] No panic signals",
    ]:
        monitor.push_log(msg)

    dash = LiveDashboard(monitor, refresh_every=1.0)
    dash.start()

    # Simulate live equity movement
    eq = 100_000.0
    t = 0
    try:
        while True:
            t += 1
            eq += random.uniform(-120, 135) + math.sin(t / 10) * 50
            monitor.quick_equity_update(eq)
            monitor.push_log(f"[Engine] Tick {t} | equity=${eq:,.2f}")

            # Occasionally update positions
            if t % 5 == 0:
                monitor.upsert_position(PositionSnap(
                    symbol="BTC/USDT", direction="LONG", quantity=0.25,
                    entry_price=67_200.0, current_price=67_200 + random.uniform(-300, 600),
                    unrealized_pnl=random.uniform(-200, 400),
                    stop_price=66_000.0, target_price=70_000.0, regime="BULL_MOMENTUM",
                    opened_at=datetime(2025, 1, 1, 9, 30, 0),
                ))

            time.sleep(1)
    except KeyboardInterrupt:
        dash.stop()
        print("\n[Dashboard] Demo stopped.")


if __name__ == "__main__":
    _demo()
