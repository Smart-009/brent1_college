"""
core/engine.py
==============
Master Trading Engine — The Heart of the System.

This is the main async event loop that ties all modules together.
It runs continuously, processing market data and making trading decisions.

EXECUTION FLOW (once per candle close on the primary timeframe):
  1. For each symbol in the watchlist:
     a. Get the latest OHLCV data from the ring buffer.
     b. Compute/refresh the market regime (HTF + primary TF).
     c. Select the appropriate strategy for the current regime.
     d. Run the strategy to get a trade signal.
     e. If signal is actionable:
        → Submit to RiskManager.authorize()
        → If authorized → execute via OrderManager
  2. Update portfolio equity snapshot.
  3. Send monitoring heartbeat to Telegram every N minutes.

SAFETY:
  Any unhandled exception in the main loop is caught, logged, and
  the loop continues after a brief pause — the bot NEVER crashes silently.
  Critical errors (circuit breaker, broker disconnect) trigger an alert.
"""

from __future__ import annotations

import asyncio
import platform
from datetime import datetime, timezone
from typing import Optional

import yaml
from dotenv import load_dotenv
from loguru import logger

# Conditionally use uvloop on Linux/Mac for better performance
if platform.system() != "Windows":
    try:
        import uvloop
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        logger.info("[Engine] uvloop activated (Linux/Mac).")
    except ImportError:
        logger.info("[Engine] uvloop not available, using default asyncio.")
else:
    logger.info("[Engine] Running on Windows — using standard asyncio.")

from core.event_calendar import EventCalendar
from core.news_sentinel import NewsSentinel
from core.session_guard import SessionGuard
from data.market_data_router import MarketDataRouter
from db.trade_logger import TradeLogger
from execution.order_manager import OrderManager
from monitoring.telegram_alerts import TelegramAlerter
from monitoring.dashboard import (
    DashboardMonitor,
    LiveDashboard,
    IntelSnap,
    PortfolioSnap,
    PositionSnap,
    SignalSnap,
)
from regime.regime_engine import RegimeEngine
from regime.volatility_model import compute_atr
from risk.leverage_manager import LeverageManager
from risk.performance_tracker import PerformanceTracker
from risk.portfolio_monitor import PortfolioMonitor
from risk.position_sizer import PositionSizer
from risk.risk_manager import RiskManager
from strategies.breakout import BreakoutStrategy
from strategies.market_scanner import MarketScanner
from strategies.mean_reversion import MeanReversionStrategy
from strategies.trend_following import TrendFollowingStrategy

load_dotenv()


class TradingEngine:
    """
    Master orchestrator for the full trading system.

    Usage:
        engine = TradingEngine("config/config.yaml")
        await engine.run()      # Runs indefinitely until Ctrl+C
    """

    HEARTBEAT_INTERVAL_MINUTES = 60    # Send Telegram summary every 60 minutes
    CANDLE_CHECK_INTERVAL_S    = 60    # Check for new closed candles every 60s
    EQUITY_UPDATE_INTERVAL_S   = 30    # Update portfolio equity every 30s

    def __init__(self, config_path: str = "config/config.yaml") -> None:
        with open(config_path, "r") as f:
            self._cfg = yaml.safe_load(f)

        self._mode = self._cfg["trading"]["mode"]
        logger.info(f"[Engine] Trading Mode: {self._mode.upper()}")
        if self._mode == "live":
            logger.warning(
                "[Engine] ⚠️  LIVE MODE ACTIVE. Real money will be used. "
                "Ensure all config settings are verified."
            )

        # Module instances (initialized in startup())
        self._data_router: Optional[MarketDataRouter] = None
        self._trade_logger: Optional[TradeLogger] = None
        self._session_guard: Optional[SessionGuard] = None
        self._event_cal: Optional[EventCalendar] = None
        self._news_sentinel: Optional[NewsSentinel] = None
        self._regime_engine: Optional[RegimeEngine] = None
        self._portfolio_monitor: Optional[PortfolioMonitor] = None
        self._position_sizer: Optional[PositionSizer] = None
        self._leverage_manager: Optional[LeverageManager] = None
        self._risk_manager: Optional[RiskManager] = None
        self._order_manager: Optional[OrderManager] = None
        self._scanner: Optional[MarketScanner] = None
        self._performance_tracker: Optional[PerformanceTracker] = None
        self._telegram: Optional[TelegramAlerter] = None
        self._dashboard_monitor: Optional[DashboardMonitor] = None
        self._live_dashboard: Optional[LiveDashboard] = None

        # Strategy instances
        self._strategies = {}

        self._running = False
        self._trading_paused = False
        self._last_heartbeat: Optional[datetime] = None

    # ── Lifecycle ──────────────────────────────────────────────────────────

    async def startup(self) -> None:
        """Initialize all modules. Called once before the main loop."""
        logger.info("[Engine] Starting up...")

        # Database
        db_path = self._cfg.get("database", {}).get("path", "db/trades.sqlite")
        self._trade_logger = TradeLogger(db_path)
        await self._trade_logger.initialize()

        # Data infrastructure
        self._data_router = MarketDataRouter("config/config.yaml")
        await self._data_router.initialize()

        # Intelligence layers
        self._session_guard = SessionGuard()
        await self._session_guard.initialize()

        self._event_cal = EventCalendar(
            finnhub_api_key=self._cfg.get("credentials", {}).get("finnhub", {}).get("api_key")
        )
        await self._event_cal.refresh()
        await self._event_cal.start_auto_refresh(interval_hours=4.0)

        self._news_sentinel = NewsSentinel(self._cfg.get("news", {}))
        await self._news_sentinel.start()

        # Regime engine
        self._regime_engine = RegimeEngine(self._cfg)

        # Risk infrastructure
        self._portfolio_monitor = PortfolioMonitor(self._cfg)
        self._position_sizer = PositionSizer(self._cfg)

        # Get starting equity
        starting_equity = self._cfg["trading"].get("paper_balance_usd", 100000.0)
        if self._mode == "live":
            try:
                broker = (
                    self._data_router.get_broker("crypto") or
                    self._data_router.get_broker("stocks_us") or
                    self._data_router.get_broker("forex")
                )
                if broker:
                    balance = await broker.get_account_balance()
                    starting_equity = balance.total_equity
            except Exception as e:
                logger.warning(f"[Engine] Could not fetch live balance: {e}. Using paper balance.")

        self._portfolio_monitor.initialize(starting_equity)
        self._leverage_manager = LeverageManager(self._cfg)

        self._risk_manager = RiskManager(
            config=self._cfg,
            session_guard=self._session_guard,
            event_calendar=self._event_cal,
            news_sentinel=self._news_sentinel,
            portfolio_monitor=self._portfolio_monitor,
            position_sizer=self._position_sizer,
            leverage_manager=self._leverage_manager,
        )

        # Order manager
        self._order_manager = OrderManager(self._cfg, self._data_router, self._trade_logger)
        await self._order_manager.start()

        # Alpha Engine — Market Scanner & Performance Feedback Tracker
        self._scanner = MarketScanner(self._cfg)
        self._performance_tracker = PerformanceTracker(self._cfg, db_path=db_path)
        await self._performance_tracker.refresh_metrics()

        # Wire up circuit breaker → close all positions
        self._portfolio_monitor.register_circuit_breaker_callback(
            self._on_circuit_breaker
        )

        # Wire up news panic → close all positions
        self._news_sentinel.register_panic_callback(self._on_news_panic)

        # Telegram alerts
        tg_cfg = self._cfg.get("telegram", {})
        if tg_cfg.get("enabled", False):
            self._telegram = TelegramAlerter(tg_cfg)
            self._telegram.register_engine(self)
            await self._telegram.send_message(
                f"🤖 *Quant Engine Started*\n"
                f"Mode: `{self._mode.upper()}`\n"
                f"Equity: ${starting_equity:,.2f}\n"
                f"Time: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n\n"
                "📱 *Mobile commands ready:* send `/status`, `/positions`, `/pause`, `/resume`, or `/closeall`"
            )

        # Strategy registry
        self._strategies = {
            "trend_following": TrendFollowingStrategy(self._cfg),
            "mean_reversion":  MeanReversionStrategy(self._cfg),
            "breakout":        BreakoutStrategy(self._cfg),
        }

        # Live dashboard
        try:
            self._dashboard_monitor = DashboardMonitor(
                mode=self._mode,
                starting_equity=starting_equity,
            )
            self._live_dashboard = LiveDashboard(self._dashboard_monitor, refresh_every=2.0)
            self._live_dashboard.start()
            logger.info("[Engine] Live dashboard started. Watch it in this terminal.")
        except Exception as e:
            logger.warning(f"[Engine] Dashboard could not start (non-fatal): {e}")
            self._dashboard_monitor = None
            self._live_dashboard = None

        logger.info("[Engine] All modules initialized. Ready to trade.")

    async def shutdown(self) -> None:
        """Cleanly shut down all modules."""
        logger.info("[Engine] Shutting down...")
        self._running = False

        if self._telegram:
            self._telegram.stop_command_listener()
        if self._live_dashboard:
            self._live_dashboard.stop()
        if self._order_manager:
            await self._order_manager.stop()
        if self._news_sentinel:
            await self._news_sentinel.stop()
        if self._data_router:
            await self._data_router.shutdown()
        if self._trade_logger:
            await self._trade_logger.close()

        if self._telegram:
            await self._telegram.send_message("🛑 *Quant Engine Stopped*")

        logger.info("[Engine] Shutdown complete.")

    # ── Main Loop ──────────────────────────────────────────────────────────

    async def run(self) -> None:
        """Main trading loop. Runs until interrupted."""
        await self.startup()
        self._running = True
        logger.info("[Engine] Main loop started.")

        tasks = [
            self._candle_processing_loop(),
            self._equity_update_loop(),
            self._heartbeat_loop(),
        ]

        # Add 2-way Telegram mobile command listener if enabled
        if self._telegram and self._telegram._commands_enabled:
            tasks.append(self._telegram.start_command_listener())

        # Run all background tasks concurrently
        await asyncio.gather(*tasks)

    async def _candle_processing_loop(self) -> None:
        """Process each new candle close across all symbols."""
        while self._running:
            try:
                await self._process_all_symbols()
            except Exception as e:
                logger.error(f"[Engine] Candle processing error: {e}")
            await asyncio.sleep(self.CANDLE_CHECK_INTERVAL_S)

    async def _process_all_symbols(self) -> None:
        """Run the full signal pipeline for every symbol in the watchlist."""
        markets_cfg = self._cfg.get("markets", {})

        for market_name, market_cfg in markets_cfg.items():
            if not market_cfg.get("enabled", False):
                continue

            asset_class = "crypto" if "crypto" in market_name else (
                "forex" if "forex" in market_name else "stocks_us"
            )
            exchange_code = "NYSE" if "stock" in market_name else ""
            primary_tf = market_cfg.get("primary_timeframe", "15m")
            htf_tf     = market_cfg.get("htf_timeframe", "4h")

            symbols = market_cfg.get("symbols", [])
            # Alpha Engine: Dynamically rank symbols by relative strength & momentum
            if self._scanner and self._scanner.enabled and len(symbols) > 1:
                try:
                    data_map = {}
                    for s in symbols:
                        buf = self._data_router.get_ohlcv_buffer(s, primary_tf) if hasattr(self._data_router, "get_ohlcv_buffer") else None
                        if buf is not None and getattr(buf, "size", 0) >= 15:
                            data_map[s] = buf.to_dataframe()
                        else:
                            bars = await self._data_router.get_ohlcv(s, primary_tf, limit=30, asset_class=asset_class)
                            if bars and len(bars) >= 15:
                                import pandas as pd
                                data_map[s] = pd.DataFrame([{
                                    "close": b.close, "high": b.high, "low": b.low
                                } for b in bars])
                    if data_map:
                        symbols = self._scanner.rank_symbols(data_map, asset_class)
                except Exception as e:
                    logger.debug(f"[Engine] Scanner ranking fallback for {market_name}: {e}")

            for symbol in symbols:
                try:
                    await self._process_symbol(
                        symbol, asset_class, exchange_code, primary_tf, htf_tf
                    )
                except Exception as e:
                    logger.debug(f"[Engine] Error processing {symbol}: {e}")

    async def _process_symbol(
        self,
        symbol: str,
        asset_class: str,
        exchange_code: str,
        primary_tf: str,
        htf_tf: str,
    ) -> None:
        """Full signal pipeline for a single symbol."""
        # Skip if trading is remotely paused via Telegram
        if self._trading_paused:
            return

        # Skip if circuit breaker is active
        if self._portfolio_monitor.is_circuit_breaker_active():
            return

        # Skip if we already have an open position in this symbol
        for pos in self._order_manager.open_positions.values():
            if pos.symbol == symbol:
                return

        # Get OHLCV data
        try:
            bars_primary = await self._data_router.get_ohlcv(
                symbol, primary_tf, limit=200, asset_class=asset_class
            )
            bars_htf = await self._data_router.get_ohlcv(
                symbol, htf_tf, limit=200, asset_class=asset_class
            )
        except Exception:
            return

        if len(bars_primary) < 60 or len(bars_htf) < 60:
            return

        import pandas as pd
        df = pd.DataFrame([{
            "open":   b.open, "high": b.high, "low": b.low,
            "close":  b.close, "volume": b.volume
        } for b in bars_primary])
        df_htf = pd.DataFrame([{
            "open":   b.open, "high": b.high, "low": b.low,
            "close":  b.close, "volume": b.volume
        } for b in bars_htf])

        # Compute current ATR
        from regime.volatility_model import compute_atr
        import numpy as np
        atr_arr = compute_atr(df, period=14)
        current_atr = float(atr_arr[-1]) if not np.isnan(atr_arr[-1]) else 0.0
        if current_atr == 0:
            return

        # Compute regime
        trading_periods = 365 if asset_class == "crypto" else (260 if asset_class == "forex" else 252)
        htf_regime = self._regime_engine.compute(df_htf, f"{symbol}_htf", trading_periods)
        primary_regime = self._regime_engine.compute(df, symbol, trading_periods)

        # Push regime to dashboard
        if self._dashboard_monitor:
            self._dashboard_monitor.update_regime(symbol, primary_regime.state.value)

        # HTF must agree directionally with primary
        if primary_regime.state.value not in ["CHOP_RANGING", "SQUEEZE", "HIGH_VOL_CHAOS"]:
            if htf_regime.ema_aligned_bull != primary_regime.ema_aligned_bull:
                return  # Conflicting directional bias — skip

        # Select strategy for this regime
        allowed = primary_regime.allowed_strategies
        strategy = None
        for name in allowed:
            if name in self._strategies:
                strategy = self._strategies[name]
                break

        if strategy is None:
            return

        # Generate signal
        signal = strategy.generate_signal(
            df=df,
            symbol=symbol,
            regime_state=primary_regime.state.value,
            df_htf=df_htf,
        )

        if not signal.is_actionable():
            return

        # Set entry price to current price if not set
        if signal.entry_price is None:
            try:
                tick = await self._data_router.get_ticker(symbol, asset_class)
                signal.entry_price = tick.ask if signal.direction.value == "long" else tick.bid
            except Exception:
                return

        # Risk authorization with dynamic performance feedback
        existing_exposure = self._portfolio_monitor.get_correlated_exposure(asset_class)
        win_rate, win_loss_ratio = (None, None)
        if self._performance_tracker:
            win_rate, win_loss_ratio = self._performance_tracker.get_feedback_or_none(getattr(strategy, "name", type(strategy).__name__)) \
                if hasattr(self._performance_tracker, "get_feedback_or_none") else \
                self._performance_tracker.get_strategy_feedback(getattr(strategy, "name", type(strategy).__name__))

        auth = await self._risk_manager.authorize(
            signal=signal,
            regime=primary_regime,
            current_equity=self._portfolio_monitor.equity,
            atr=current_atr,
            asset_class=asset_class,
            exchange_code=exchange_code,
            win_rate=win_rate,
            avg_win_loss_ratio=win_loss_ratio,
            existing_correlated_exposure=existing_exposure,
        )

        if not auth:
            logger.debug(f"[Engine] {symbol} blocked: {auth.reason}")
            # Still push to dashboard so user can see why it was blocked
            if self._dashboard_monitor:
                self._dashboard_monitor.push_signal(SignalSnap(
                    ts=datetime.now(timezone.utc),
                    symbol=symbol,
                    direction=signal.direction.value.upper() if hasattr(signal.direction, "value") else str(signal.direction).upper(),
                    strategy=getattr(strategy, "name", type(strategy).__name__),
                    confidence=getattr(signal, "confidence", 0.0),
                    authorised=False,
                    block_reason=getattr(auth, "reason", "risk gate"),
                ))
            return

        # Push authorised signal to dashboard
        if self._dashboard_monitor:
            self._dashboard_monitor.push_signal(SignalSnap(
                ts=datetime.now(timezone.utc),
                symbol=symbol,
                direction=signal.direction.value.upper() if hasattr(signal.direction, "value") else str(signal.direction).upper(),
                strategy=getattr(strategy, "name", type(strategy).__name__),
                confidence=getattr(signal, "confidence", 0.0),
                authorised=True,
            ))

        # If leverage enabled, configure exchange leverage on broker before execution
        if self._leverage_manager and self._leverage_manager.enabled:
            lev = self._leverage_manager.get_leverage(asset_class)
            broker = self._data_router.get_broker(asset_class)
            if broker and hasattr(broker, "set_leverage"):
                try:
                    await broker.set_leverage(symbol, lev)
                except Exception as e:
                    logger.debug(f"[Engine] Could not set leverage for {symbol}: {e}")

        # Execute
        pos = await self._order_manager.execute_trade(auth, asset_class=asset_class)
        if pos and self._telegram:
            direction_icon = "📈" if pos.direction == "long" else "📉"
            await self._telegram.send_message(
                f"{direction_icon} *Trade Opened*\n"
                f"Symbol: `{pos.symbol}`\n"
                f"Direction: `{pos.direction.upper()}`\n"
                f"Entry: `{pos.entry_price:.6f}`\n"
                f"SL: `{pos.stop_loss:.6f}`\n"
                f"TP: `{pos.take_profit:.6f}`\n"
                f"Strategy: `{pos.strategy_id}`\n"
                f"Regime: `{primary_regime.state.value}`"
            )

        if pos:
            self._portfolio_monitor.record_position_open(
                asset_class, pos.quantity * pos.entry_price
            )

    async def _equity_update_loop(self) -> None:
        """Periodically update the portfolio equity from the broker."""
        while self._running:
            try:
                if self._mode == "live":
                    broker = (
                        self._data_router.get_broker("crypto") or
                        self._data_router.get_broker("stocks_us") or
                        self._data_router.get_broker("forex")
                    )
                    if broker:
                        balance = await broker.get_account_balance()
                        curr_equity = balance.total_equity
                    else:
                        curr_equity = self._portfolio_monitor.equity
                else:
                    unrealized = sum(p.unrealized_pnl for p in self._order_manager.open_positions.values())
                    curr_equity = self._portfolio_monitor.equity + unrealized

                snap = self._portfolio_monitor.update_equity(
                    current_equity=curr_equity,
                    open_positions=self._order_manager.position_count,
                )
                if abs(snap.daily_pnl_pct) > 1.0:
                    logger.info(
                        f"[Engine] Portfolio | Equity=${snap.equity:,.2f} | "
                        f"Daily: {'+' if snap.daily_pnl_pct >= 0 else ''}"
                        f"{snap.daily_pnl_pct:.2f}% | "
                        f"DD={snap.drawdown_pct:.2f}%"
                    )

                # Periodically re-sync performance feedback metrics
                if self._performance_tracker:
                    await self._performance_tracker.refresh_metrics()

                # ── Push to dashboard ──────────────────────────────────
                if self._dashboard_monitor:
                    lev_str = "OFF"
                    if self._leverage_manager and self._leverage_manager.enabled:
                        lev_str = f"ON (C:{self._leverage_manager.get_leverage('crypto')}× F:{self._leverage_manager.get_leverage('forex')}×)"

                    self._dashboard_monitor.update_portfolio(PortfolioSnap(
                        equity=snap.equity,
                        starting_equity=self._portfolio_monitor._daily_start_equity,
                        daily_pnl=snap.daily_pnl,
                        daily_pnl_pct=snap.daily_pnl_pct,
                        max_drawdown_pct=snap.drawdown_pct,
                        high_water_mark=self._portfolio_monitor._high_water_mark,
                        circuit_breaker_active=snap.circuit_breaker_active,
                        open_position_count=snap.open_position_count,
                        total_trades_today=getattr(self._portfolio_monitor, "_trades_today", 0),
                        leverage_mode=lev_str,
                    ))

                    # Refresh open positions in dashboard
                    active_symbols = set()
                    for p in self._order_manager.open_positions.values():
                        active_symbols.add(p.symbol)
                        pos_lev = getattr(p, "leverage", 1)
                        pos_liq = 0.0
                        if self._leverage_manager and pos_lev > 1:
                            pos_liq = self._leverage_manager.calculate_liquidation_price(
                                direction=p.direction.value.lower() if hasattr(p.direction, "value") else str(p.direction).lower(),
                                entry_price=p.entry_price,
                                leverage=pos_lev,
                            )
                        self._dashboard_monitor.upsert_position(PositionSnap(
                            symbol=p.symbol,
                            direction=p.direction.value.upper() if hasattr(p.direction, "value") else str(p.direction).upper(),
                            quantity=p.quantity,
                            entry_price=p.entry_price,
                            current_price=getattr(p, "current_price", p.entry_price),
                            unrealized_pnl=getattr(p, "unrealized_pnl", 0.0),
                            stop_price=p.stop_loss,
                            target_price=p.take_profit,
                            regime=getattr(p, "regime", "UNKNOWN"),
                            opened_at=getattr(p, "opened_at", datetime.now(timezone.utc)),
                            leverage=pos_lev,
                            liquidation_price=pos_liq,
                            trailing_active=getattr(p, "trailing_active", False),
                            tp1_hit=getattr(p, "partial_exited", False),
                        ))

                    # Clear positions that are no longer open
                    dash_syms = set(self._dashboard_monitor._positions.keys())
                    for closed_sym in dash_syms - active_symbols:
                        self._dashboard_monitor.remove_position(closed_sym)

                    # Intelligence snapshot
                    news_panic = self._news_sentinel.is_panic_active() if self._news_sentinel else False
                    news_reason = getattr(self._news_sentinel, "_last_panic_reason", "") if self._news_sentinel else ""
                    try:
                        session_info = self._session_guard.can_open_trade("BTC/USDT", "crypto", "") if self._session_guard else None
                        session_active = session_info.can_trade if session_info else True
                        session_name = session_info.reason if session_info else "GLOBAL"
                    except Exception:
                        session_active = True
                        session_name = "GLOBAL"
                    next_evt_name = "—"
                    next_evt_mins = 9999.0
                    if self._event_cal:
                        try:
                            upcoming = self._event_cal.get_upcoming_events(horizon_minutes=120)
                            if upcoming:
                                e = upcoming[0]
                                from datetime import timezone as _tz
                                delta_mins = (e.event_time - datetime.now(_tz.utc)).total_seconds() / 60
                                next_evt_name = e.name[:30]
                                next_evt_mins = max(0.0, delta_mins)
                        except Exception:
                            pass
                    try:
                        blackout = self._event_cal.check_blackout() if self._event_cal else False
                    except Exception:
                        blackout = False
                    self._dashboard_monitor.update_intel(IntelSnap(
                        news_panic=news_panic,
                        news_reason=news_reason,
                        session_active=session_active,
                        session_name=str(session_name)[:20],
                        next_event_name=next_evt_name,
                        next_event_eta_mins=next_evt_mins,
                        blackout_active=bool(blackout),
                    ))

            except Exception as e:
                logger.debug(f"[Engine] Equity update error: {e}")
            await asyncio.sleep(self.EQUITY_UPDATE_INTERVAL_S)

    async def _heartbeat_loop(self) -> None:
        """Send a periodic Telegram summary."""
        while self._running:
            await asyncio.sleep(self.HEARTBEAT_INTERVAL_MINUTES * 60)
            if self._telegram:
                snap = self._portfolio_monitor.update_equity(
                    self._portfolio_monitor.equity,
                    self._order_manager.position_count,
                )
                await self._telegram.send_message(
                    f"💓 *Hourly Heartbeat*\n"
                    f"Equity: `${snap.equity:,.2f}`\n"
                    f"Daily PnL: `{snap.daily_pnl_pct:+.2f}%`\n"
                    f"Open Positions: `{snap.open_position_count}`\n"
                    f"Drawdown: `{snap.drawdown_pct:.2f}%`\n"
                    f"Circuit Breaker: `{'🔴 ACTIVE' if snap.circuit_breaker_active else '🟢 OK'}`"
                )

    # ── Callbacks ──────────────────────────────────────────────────────────

    async def _on_circuit_breaker(self, daily_pnl: float, daily_pnl_pct: float) -> None:
        """Called when daily loss limit is breached."""
        closed = await self._order_manager.close_all_positions(reason="circuit_breaker")
        if self._telegram:
            await self._telegram.send_message(
                f"⛔ *CIRCUIT BREAKER TRIGGERED*\n"
                f"Daily PnL: `{daily_pnl_pct:+.2f}%`\n"
                f"Positions closed: `{closed}`\n"
                f"Trading suspended for 24 hours."
            )

    def _on_news_panic(self, news_item) -> None:
        """Called synchronously when a panic news item is detected."""
        logger.critical(
            f"[Engine] 🚨 NEWS PANIC: {news_item.headline}"
        )
        # Schedule async close in the event loop
        asyncio.create_task(
            self._order_manager.close_all_positions(reason="news_panic")
        )
