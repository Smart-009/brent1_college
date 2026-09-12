"""
monitoring/telegram_alerts.py
==============================
Telegram Bot Alert System.

Sends real-time notifications for:
  - Trade opens and closes (with full PnL breakdown)
  - Circuit breaker activations
  - News panic alerts
  - Daily PnL summaries
  - Hourly heartbeat reports
  - System errors and warnings

Setup:
  1. Create a Telegram bot via @BotFather → get the BOT_TOKEN.
  2. Message your bot once, then get your CHAT_ID via @userinfobot.
  3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file.
"""

from __future__ import annotations

import os
from typing import Optional

import aiohttp
from loguru import logger


class TelegramAlerter:
    """
    Async Telegram notification sender via Bot API.

    Usage:
        tg = TelegramAlerter(config["telegram"])
        await tg.send_message("✅ *Trade opened!*")
    """

    API_URL = "https://api.telegram.org/bot{token}/sendMessage"

    def __init__(self, config: dict) -> None:
        self._token = os.environ.get(
            config.get("bot_token_env", "TELEGRAM_BOT_TOKEN"), ""
        )
        self._chat_id = os.environ.get(
            config.get("chat_id_env", "TELEGRAM_CHAT_ID"), ""
        )
        self._commands_enabled: bool = config.get("commands_enabled", True)
        self._enabled = bool(self._token and self._chat_id)
        self._running = False
        self._last_update_id = 0
        self._engine = None

        if not self._enabled:
            logger.warning(
                "[TelegramAlerter] Bot token or chat ID not configured. "
                "Telegram alerts are disabled."
            )

    async def send_message(self, text: str, parse_mode: str = "Markdown") -> bool:
        """
        Send a message to the configured Telegram chat.

        Args:
            text:       Message text. Supports Markdown formatting.
            parse_mode: "Markdown" | "HTML"

        Returns:
            True if sent successfully, False otherwise.
        """
        if not self._enabled:
            return False

        url = self.API_URL.format(token=self._token)
        payload = {
            "chat_id":    self._chat_id,
            "text":       text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=10),
                ) as resp:
                    if resp.status == 200:
                        return True
                    else:
                        body = await resp.text()
                        logger.warning(
                            f"[TelegramAlerter] API error {resp.status}: {body[:200]}"
                        )
                        return False
        except Exception as e:
            logger.warning(f"[TelegramAlerter] Send failed: {e}")
            return False

    async def send_trade_open(
        self,
        symbol: str,
        direction: str,
        entry: float,
        stop: float,
        target: float,
        quantity: float,
        risk_usd: float,
        strategy: str,
        regime: str,
    ) -> None:
        icon = "📈" if direction.lower() == "long" else "📉"
        rr = abs(target - entry) / abs(entry - stop) if abs(entry - stop) > 0 else 0
        msg = (
            f"{icon} *Trade Opened*\n"
            f"Symbol: `{symbol}`\n"
            f"Direction: `{direction.upper()}`\n"
            f"Entry: `{entry:.6f}`\n"
            f"Stop: `{stop:.6f}`\n"
            f"Target: `{target:.6f}` (RR: {rr:.1f}:1)\n"
            f"Qty: `{quantity:.6f}`\n"
            f"Risk: `${risk_usd:.2f}`\n"
            f"Strategy: `{strategy}`\n"
            f"Regime: `{regime}`"
        )
        await self.send_message(msg)

    async def send_trade_close(
        self,
        symbol: str,
        direction: str,
        entry: float,
        exit_price: float,
        pnl: float,
        pnl_pct: float,
        reason: str,
    ) -> None:
        icon = "✅" if pnl >= 0 else "❌"
        pnl_sign = "+" if pnl >= 0 else ""
        msg = (
            f"{icon} *Trade Closed*\n"
            f"Symbol: `{symbol}`\n"
            f"Direction: `{direction.upper()}`\n"
            f"Entry: `{entry:.6f}` → Exit: `{exit_price:.6f}`\n"
            f"PnL: `{pnl_sign}${pnl:.2f}` (`{pnl_sign}{pnl_pct:.2f}%`)\n"
            f"Reason: `{reason}`"
        )
        await self.send_message(msg)

    # ── 2-Way Command Center ───────────────────────────────────────────────

    def register_engine(self, engine) -> None:
        """Connect the engine instance to handle remote incoming commands."""
        self._engine = engine

    async def start_command_listener(self) -> None:
        """Polls Telegram getUpdates to handle incoming commands from the owner."""
        if not self._enabled or not self._commands_enabled:
            return

        self._running = True
        logger.info("[TelegramAlerter] 📱 2-Way Command Center started. Listening for /status, /pause, /closeall...")
        url = f"https://api.telegram.org/bot{self._token}/getUpdates"

        async with aiohttp.ClientSession() as session:
            while self._running:
                try:
                    params = {"offset": self._last_update_id + 1, "timeout": 10}
                    async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            for update in data.get("result", []):
                                self._last_update_id = update.get("update_id", self._last_update_id)
                                message = update.get("message", {})
                                from_id = str(message.get("from", {}).get("id", ""))
                                text = message.get("text", "").strip()

                                # Security: Only process commands from configured chat_id
                                if from_id == self._chat_id and text.startswith("/"):
                                    await self._handle_command(text)
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.debug(f"[TelegramAlerter] Command listener error: {e}")
                    await asyncio.sleep(2)

    def stop_command_listener(self) -> None:
        """Stops the incoming command polling loop."""
        self._running = False

    async def _handle_command(self, cmd_text: str) -> None:
        """Route received slash command to engine action."""
        cmd = cmd_text.split()[0].lower()
        logger.info(f"[TelegramAlerter] Received command: {cmd}")

        if not hasattr(self, "_engine") or self._engine is None:
            await self.send_message("⚠️ Engine is not connected to command handler.")
            return

        engine = self._engine

        if cmd in ("/start", "/help"):
            msg = (
                "🎮 *Brent Quant Engine — Remote Command Center*\n\n"
                "Available commands:\n"
                "📊 `/status` — View portfolio equity, daily PnL, open positions\n"
                "📈 `/positions` — Inspect all active positions & trailing stops\n"
                "⏸️ `/pause` — Freeze new trade entries\n"
                "▶️ `/resume` — Unpause entry gates\n"
                "🚨 `/closeall` — **Panic Button**: Market close ALL active positions\n"
                "📋 `/report` — Summary of today's trades\n"
            )
            await self.send_message(msg)

        elif cmd == "/status":
            try:
                equity = engine._portfolio_monitor.equity if engine._portfolio_monitor else 0.0
                daily_pnl = engine._portfolio_monitor.daily_pnl if engine._portfolio_monitor else 0.0
                daily_pnl_pct = engine._portfolio_monitor.daily_pnl_pct if engine._portfolio_monitor else 0.0
                pos_count = engine._order_manager.position_count if engine._order_manager else 0
                cb = engine._portfolio_monitor.is_circuit_breaker_active() if engine._portfolio_monitor else False
                is_paused = getattr(engine, "_trading_paused", False)

                pnl_sign = "+" if daily_pnl >= 0 else ""
                status_icon = "⏸️ PAUSED" if is_paused else ("🔴 CIRCUIT BREAKER" if cb else "🟢 ACTIVE")

                msg = (
                    f"📊 <b>Engine Status: {status_icon}</b>\n"
                    f"Mode: <code>{engine._mode.upper()}</code>\n"
                    f"Equity: <code>${equity:,.2f}</code>\n"
                    f"Daily PnL: <code>{pnl_sign}${daily_pnl:,.2f} ({pnl_sign}{daily_pnl_pct:.2f}%)</code>\n"
                    f"Open Positions: <code>{pos_count}</code>\n"
                )
                await self.send_message(msg, parse_mode="HTML")
            except Exception as e:
                await self.send_message(f"❌ Error getting status: {e}", parse_mode="HTML")

        elif cmd in ("/positions", "/position"):
            try:
                positions = engine._order_manager.open_positions.values() if engine._order_manager else []
                if not positions:
                    await self.send_message("📭 No open positions right now.")
                    return

                lines = ["📈 *Active Positions:*"]
                for p in positions:
                    dir_icon = "▲" if p.direction == "long" else "▼"
                    pnl_sign = "+" if p.unrealized_pnl >= 0 else ""
                    trail_tag = " [🚀TRAIL]" if getattr(p, "trailing_active", False) else (" [🛡️BE]" if getattr(p, "partial_exited", False) else "")
                    lines.append(
                        f"• `{p.symbol}` {dir_icon} ({p.quantity:.4f})\n"
                        f"  Entry: `{p.entry_price:.4f}` | Cur: `{p.current_price:.4f}`\n"
                        f"  PnL: `{pnl_sign}${p.unrealized_pnl:.2f}`\n"
                        f"  SL: `{p.stop_loss:.4f}`{trail_tag} | TP: `{p.take_profit:.4f}`"
                    )
                await self.send_message("\n".join(lines))
            except Exception as e:
                await self.send_message(f"❌ Error fetching positions: {e}")

        elif cmd == "/pause":
            engine._trading_paused = True
            await self.send_message("⏸️ *Trading PAUSED.* Existing positions will still be managed with stop-losses and trailing stops, but NO new trade entries will open.")

        elif cmd == "/resume":
            engine._trading_paused = False
            await self.send_message("▶️ *Trading RESUMED.* New trade entry signals will be processed normally.")

        elif cmd == "/closeall":
            try:
                await self.send_message("🚨 *Executing emergency market close on ALL positions...*")
                closed = await engine._order_manager.close_all_positions(reason="telegram_remote_closeall")
                await self.send_message(f"✅ Closed {closed} positions. All trades are flat.")
            except Exception as e:
                await self.send_message(f"❌ Error during emergency close: {e}")

        elif cmd == "/report":
            try:
                import aiosqlite
                db_path = engine._cfg.get("database", {}).get("path", "db/trades.sqlite")
                today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                query = "SELECT symbol, side, realized_pnl, realized_pnl_pct FROM trades WHERE closed_at LIKE ?"
                async with aiosqlite.connect(db_path) as db:
                    async with db.execute(query, (f"{today}%",)) as cur:
                        rows = await cur.fetchall()

                if not rows:
                    await self.send_message(f"📋 No closed trades logged yet for today ({today}).")
                    return

                total_pnl = sum(r[2] for r in rows if r[2] is not None)
                pnl_sign = "+" if total_pnl >= 0 else ""
                lines = [f"📋 *Daily Trade Report ({today})*\nTotal Closed: {len(rows)} | Net PnL: {pnl_sign}${total_pnl:,.2f}\n"]
                for r in rows[:10]:
                    s = "+" if (r[2] or 0) >= 0 else ""
                    lines.append(f"• `{r[0]}` ({r[1].upper()}): {s}${r[2]:.2f} ({s}{r[3]:.2f}%)")
                await self.send_message("\n".join(lines))
            except Exception as e:
                await self.send_message(f"❌ Error generating report: {e}")
        else:
            await self.send_message(f"❓ Unknown command: `{cmd}`. Send `/help` for available commands.")
