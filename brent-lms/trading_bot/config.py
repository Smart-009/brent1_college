"""
Éclat Institute - School of Business
Department of Business Tech and Computerized Accounting
ALGO-101: Algorithmic Forex Trading and Quantitative Bot Strategies

Global Configuration and Environment Loader
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

# MetaTrader 5 Settings
MT5_LOGIN = int(os.getenv('MT5_LOGIN', 0))
MT5_PASSWORD = os.getenv('MT5_PASSWORD', '')
MT5_SERVER = os.getenv('MT5_SERVER', 'MetaQuotes-Demo')
MT5_PATH = os.getenv('MT5_PATH', '')

# Trading Symbol and Timeframe
BOT_SYMBOL = os.getenv('BOT_SYMBOL', 'EURUSD')
BOT_TIMEFRAME = os.getenv('BOT_TIMEFRAME', 'M15')
BOT_STRATEGY = os.getenv('BOT_STRATEGY', 'ema_crossover')
BOT_MAGIC_NUMBER = int(os.getenv('BOT_MAGIC_NUMBER', 260901))

# Risk Parameters
RISK_PER_TRADE_PERCENT = float(os.getenv('RISK_PER_TRADE_PERCENT', 1.0))
MAX_DAILY_DRAWDOWN_PERCENT = float(os.getenv('MAX_DAILY_DRAWDOWN_PERCENT', 4.0))
MAX_OPEN_POSITIONS = int(os.getenv('MAX_OPEN_POSITIONS', 2))
MAX_SPREAD_PIPS = float(os.getenv('MAX_SPREAD_PIPS', 2.5))
RISK_TO_REWARD_RATIO = float(os.getenv('RISK_TO_REWARD_RATIO', 2.0))

# Telegram Notifications
TELEGRAM_ENABLED = os.getenv('TELEGRAM_ENABLED', 'false').lower() == 'true'
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID', '')
