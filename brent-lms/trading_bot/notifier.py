"""
Éclat Institute - Real-Time Telegram Trade Alerts Notifier
Dispatches live order fills, stop-loss triggers, and daily performance summaries.
"""

import logging
import requests

logger = logging.getLogger("Notifier")


class TelegramNotifier:
    def __init__(self, bot_token: str, chat_id: str, enabled: bool = True):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.enabled = enabled and bool(bot_token) and bool(chat_id)
        self.api_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

    def send_message(self, text: str):
        if not self.enabled:
            logger.info(f"[NOTIFIER (Mock)]: {text}")
            return

        try:
            payload = {"chat_id": self.chat_id, "text": text, "parse_mode": "Markdown"}
            res = requests.post(self.api_url, json=payload, timeout=5)
            if res.status_code != 200:
                logger.warning(f"Telegram alert delivery failed: {res.text}")
        except Exception as e:
            logger.error(f"Telegram notification error: {e}")

    def notify_trade_opened(self, symbol: str, action: str, volume: float, price: float, sl: float, tp: float, reason: str):
        icon = "[BUY]" if action.upper() == "BUY" else "[SELL]"
        msg = (
            f"*{icon} ORDER EXECUTED - {symbol}*\n"
            f"- *Action*: {action.upper()} {volume} Lots\n"
            f"- *Entry Price*: {price:.5f}\n"
            f"- *Stop Loss*: {sl:.5f}\n"
            f"- *Take Profit*: {tp:.5f}\n"
            f"- *Confluence*: {reason}\n"
            f"- *Engine*: Éclat Institute Quant Bot ALGO-101"
        )
        self.send_message(msg)

    def notify_kill_switch(self, reason: str):
        msg = f"*[ALERT] EMERGENCY KILL-SWITCH ACTIVATED*\n{reason}\nTrading has been halted."
        self.send_message(msg)
