"""
Éclat Institute - Real-Time Automated Algorithmic Trading Execution Bot
Main runtime entry point: connects to MT5, monitors market ticks, enforces risk limits, and executes strategy.
"""

import time
import logging
from config import (
    MT5_LOGIN, MT5_PASSWORD, MT5_SERVER, MT5_PATH,
    BOT_SYMBOL, BOT_TIMEFRAME, BOT_STRATEGY, BOT_MAGIC_NUMBER,
    RISK_PER_TRADE_PERCENT, MAX_DAILY_DRAWDOWN_PERCENT, MAX_OPEN_POSITIONS, MAX_SPREAD_PIPS, RISK_TO_REWARD_RATIO,
    TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TELEGRAM_ENABLED
)
from mt5_interface import MT5Interface
from risk_manager import RiskManager
from notifier import TelegramNotifier
from live_market_feed import UniversalLiveFeed
from strategies.ema_crossover import EMACrossoverStrategy
from strategies.rsi_mean_reversion import RSIMeanReversionStrategy

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("QuantBot")


def main():
    print("=" * 70)
    print("Éclat Institute - ALGO-101 Autonomous Trading Bot Engine")
    print(f"Symbol: {BOT_SYMBOL} | Timeframe: {BOT_TIMEFRAME} | Strategy: {BOT_STRATEGY}")
    print("=" * 70)

    # Initialize Live Market Feed
    live_feed = UniversalLiveFeed(symbol=BOT_SYMBOL, timeframe=BOT_TIMEFRAME)
    latest_quote = live_feed.get_latest_price()
    logger.info(f"Live Market Connected! Source: {latest_quote['source']} | Bid: {latest_quote['bid']} | Ask: {latest_quote['ask']} | Spread: {latest_quote['spread_pips']} pips")

    # Initialize Modules
    client = MT5Interface(login=MT5_LOGIN, password=MT5_PASSWORD, server=MT5_SERVER, path=MT5_PATH)
    risk = RiskManager(
        risk_per_trade_pct=RISK_PER_TRADE_PERCENT,
        max_daily_drawdown_pct=MAX_DAILY_DRAWDOWN_PERCENT,
        max_open_positions=MAX_OPEN_POSITIONS,
        max_spread_pips=MAX_SPREAD_PIPS
    )
    notifier = TelegramNotifier(bot_token=TELEGRAM_BOT_TOKEN, chat_id=TELEGRAM_CHAT_ID, enabled=TELEGRAM_ENABLED)

    if BOT_STRATEGY == "rsi_mean_reversion":
        strategy = RSIMeanReversionStrategy(rr_ratio=RISK_TO_REWARD_RATIO)
    else:
        strategy = EMACrossoverStrategy(fast_period=9, slow_period=21, rr_ratio=RISK_TO_REWARD_RATIO)

    # Connect to MT5
    connected = client.connect()
    if not connected:
        logger.warning("Could not connect to live MT5 terminal. Running in simulated demonstration mode.")

    account = client.get_account_summary()
    logger.info(f"Workstation Initialized. Balance: ${account['balance']:.2f}")

    try:
        iteration = 0
        while True:
            iteration += 1
            account = client.get_account_summary()
            symbol_info = client.get_symbol_info(BOT_SYMBOL)
            open_positions = client.get_open_positions(magic=BOT_MAGIC_NUMBER)

            spread_pips = (symbol_info['spread'] / symbol_info['point']) if symbol_info else 1.2
            
            # 1. Pre-Trade Risk Gatekeeper
            is_risk_ok, risk_msg = risk.evaluate_pre_trade_risk(
                current_balance=account['balance'],
                current_equity=account['equity'],
                current_spread_pips=spread_pips,
                open_positions_count=len(open_positions)
            )

            if not is_risk_ok:
                logger.warning(f"Risk Guard: {risk_msg}")
                if "KILL_SWITCH" in risk_msg:
                    notifier.notify_kill_switch(risk_msg)
                    break
                time.sleep(30)
                continue

            # 2. Fetch Market Candle Data
            df = client.fetch_ohlcv(symbol=BOT_SYMBOL, timeframe_str=BOT_TIMEFRAME, num_bars=100)
            if df.empty:
                time.sleep(15)
                continue

            # 3. Generate Quantitative Signal
            signal = strategy.generate_signal(df, current_spread_pips=spread_pips)

            if signal.action in ["BUY", "SELL"]:
                logger.info(f"Signal Detected: {signal.action} on {BOT_SYMBOL} @ {signal.entry_price:.5f} | {signal.reason}")

                # Calculate Institutional Lot Sizing
                lots = risk.calculate_lot_size(
                    balance=account['balance'],
                    stop_loss_pips=signal.stop_loss_pips,
                    symbol=BOT_SYMBOL
                )

                # Execute Order
                order_res = client.place_market_order(
                    symbol=BOT_SYMBOL,
                    action=signal.action,
                    volume=lots,
                    sl_price=signal.stop_loss_price,
                    tp_price=signal.take_profit_price,
                    magic=BOT_MAGIC_NUMBER
                )

                if order_res.get('retcode') == 0 or order_res.get('order'):
                    notifier.notify_trade_opened(
                        symbol=BOT_SYMBOL,
                        action=signal.action,
                        volume=lots,
                        price=signal.entry_price,
                        sl=signal.stop_loss_price,
                        tp=signal.take_profit_price,
                        reason=signal.reason
                    )

            # Sleep until next candle cycle (e.g. 15s check interval)
            time.sleep(15)

    except KeyboardInterrupt:
        logger.info("Bot execution stopped gracefully by user.")
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()
