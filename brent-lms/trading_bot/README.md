# Éclat Institute - Quantitative Forex & Algorithmic Trading Bot (ALGO-101)

This repository contains the production-ready Python algorithmic trading bot taught in **ALGO-101: Algorithmic Forex Trading & Quantitative Bot Strategies** at the **School of Business (Department of Business Tech & Computerized Accounting)**.

---

## Key Capabilities

1. **MetaTrader 5 API Socket Integration**: High-frequency tick and multi-timeframe OHLCV bar streaming.
2. **Prop Firm & Institutional Risk Engine**:
   - Fixed-percentage fractional lot sizing based on account balance and stop loss distance.
   - Hard daily drawdown circuit breakers (e.g. 4% daily kill-switch) for passing FTMO, FundedNext, and prop firm evaluations.
   - Max concurrent exposure caps and real-time broker spread filtering.
3. **Quantitative Strategy Implementations**:
   - **EMA Trend Crossover**: Fast/Slow EMA with ATR volatility trailing stop.
   - **RSI Dynamic Mean-Reversion**: Extreme oversold/overbought momentum bounces.
4. **Automated Vector Backtesting Engine**:
   - Calculates Sharpe Ratio, Profit Factor, Win Rate %, Maximum Drawdown %, and Net PnL.
5. **Real-Time Telegram Alerts**: Instant trade notifications with entry, SL, TP, and performance stats.

---

## Quickstart Setup

### Step 1: Install Python & Dependencies
```bash
cd trading_bot
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux / Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### Step 2: Configure Credentials
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your MetaTrader 5 demo/live account number, broker server, and desired risk settings.

### Step 3: Test Live Market & Broker Connectivity
Run the diagnostic test tool to verify real-time price feeds, server ping latency, and broker authorization:
```bash
python test_live_connection.py
```

### Step 4: Run the Strategy Backtester
```bash
python backtester.py
```

### Step 5: Run Live / Demo Automated Bot
```bash
python main.py
```

---

## Cloud Linux VPS Deployment (24/5 Automated Execution)
To keep your bot running 24 hours a day on a cloud VPS (e.g. Ubuntu):
```bash
nohup python main.py > bot.log 2>&1 &
```
To monitor live execution logs:
```bash
tail -f bot.log
```
