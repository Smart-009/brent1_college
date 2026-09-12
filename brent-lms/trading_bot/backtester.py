"""
Éclat Institute - Standalone Quantitative Strategy Backtesting Engine
Simulates historical trades, equity curves, drawdown, Sharpe ratio, and profit factor.
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime

# Allow relative import from root
sys.path.insert(0, str(Path(__file__).resolve().parent))

from strategies.ema_crossover import EMACrossoverStrategy
from strategies.rsi_mean_reversion import RSIMeanReversionStrategy


class BacktestEngine:
    def __init__(self, initial_capital: float = 10000.0, risk_per_trade_pct: float = 1.0, spread_pips: float = 1.5):
        self.initial_capital = initial_capital
        self.risk_per_trade_pct = risk_per_trade_pct
        self.spread_pips = spread_pips

    def run(self, df: pd.DataFrame, strategy) -> dict:
        balance = self.initial_capital
        equity_curve = [balance]
        trades = []
        open_position = None

        pip_unit = 0.0001 if df['close'].iloc[0] < 500 else 0.01

        for i in range(50, len(df)):
            sub_df = df.iloc[:i]
            current_bar = df.iloc[i]
            current_price = current_bar['close']

            # Check if open position hit SL or TP
            if open_position:
                hit_tp = False
                hit_sl = False

                if open_position['action'] == 'BUY':
                    if current_bar['high'] >= open_position['tp']:
                        hit_tp = True
                    elif current_bar['low'] <= open_position['sl']:
                        hit_sl = True
                else:  # SELL
                    if current_bar['low'] <= open_position['tp']:
                        hit_tp = True
                    elif current_bar['high'] >= open_position['sl']:
                        hit_sl = True

                if hit_tp or hit_sl:
                    pnl_mult = 2.0 if hit_tp else -1.0
                    risk_amount = balance * (self.risk_per_trade_pct / 100.0)
                    pnl = risk_amount * pnl_mult
                    balance += pnl
                    equity_curve.append(balance)

                    trades.append({
                        "entry_time": open_position['time'],
                        "exit_time": current_bar['time'],
                        "action": open_position['action'],
                        "entry_price": open_position['entry'],
                        "exit_price": open_position['tp'] if hit_tp else open_position['sl'],
                        "pnl": round(pnl, 2),
                        "outcome": "WIN (TP Hit)" if hit_tp else "LOSS (SL Hit)",
                        "balance_after": round(balance, 2)
                    })
                    open_position = None

            # Generate new signal if no position
            if open_position is None:
                signal = strategy.generate_signal(sub_df, self.spread_pips)
                if signal.action in ["BUY", "SELL"]:
                    open_position = {
                        "time": current_bar['time'],
                        "action": signal.action,
                        "entry": signal.entry_price,
                        "sl": signal.stop_loss_price,
                        "tp": signal.take_profit_price,
                    }

        # Metrics computation
        total_trades = len(trades)
        wins = [t for t in trades if t['pnl'] > 0]
        losses = [t for t in trades if t['pnl'] <= 0]
        win_rate = (len(wins) / total_trades * 100.0) if total_trades > 0 else 0.0

        gross_profit = sum(t['pnl'] for t in wins)
        gross_loss = abs(sum(t['pnl'] for t in losses))
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else float('inf')

        net_profit = balance - self.initial_capital
        return_pct = (net_profit / self.initial_capital) * 100.0

        # Drawdown calculation
        eq = np.array(equity_curve)
        peak = np.maximum.accumulate(eq)
        drawdowns = (peak - eq) / peak * 100.0
        max_drawdown = np.max(drawdowns) if len(drawdowns) > 0 else 0.0

        # Sharpe ratio estimate
        returns_diff = np.diff(eq) / eq[:-1] if len(eq) > 1 else np.array([0])
        sharpe = (np.mean(returns_diff) / (np.std(returns_diff) + 1e-9) * np.sqrt(252)) if len(returns_diff) > 0 else 0.0

        return {
            "initial_capital": self.initial_capital,
            "final_balance": round(balance, 2),
            "net_profit": round(net_profit, 2),
            "return_pct": round(return_pct, 2),
            "total_trades": total_trades,
            "winning_trades": len(wins),
            "losing_trades": len(losses),
            "win_rate_pct": round(win_rate, 2),
            "profit_factor": round(profit_factor, 2),
            "max_drawdown_pct": round(max_drawdown, 2),
            "sharpe_ratio": round(sharpe, 2),
            "trades": trades,
        }


def run_sample_backtest():
    print("=" * 65)
    print("Éclat Institute - Quantitative Backtesting Engine (ALGO-101)")
    print("=" * 65)

    # Generate 1000 simulated 15-minute bars
    dates = pd.date_range(end=datetime.utcnow(), periods=1000, freq="15min")
    prices = 1.0850 * np.exp(np.cumsum(np.random.normal(0.00005, 0.0012, 1000)))
    df = pd.DataFrame({
        "time": dates,
        "open": prices,
        "high": prices * 1.0008,
        "low": prices * 0.9992,
        "close": prices,
        "tick_volume": np.random.randint(100, 1000, 1000),
    })

    engine = BacktestEngine(initial_capital=10000.0, risk_per_trade_pct=1.0)
    strategy = EMACrossoverStrategy(fast_period=9, slow_period=21, rr_ratio=2.0)

    results = engine.run(df, strategy)
    print(f"Initial Capital:   ${results['initial_capital']:,.2f}")
    print(f"Final Balance:     ${results['final_balance']:,.2f}")
    print(f"Net Profit:        ${results['net_profit']:,.2f} ({results['return_pct']}%)")
    print(f"Total Trades:      {results['total_trades']} (Wins: {results['winning_trades']}, Losses: {results['losing_trades']})")
    print(f"Win Rate:          {results['win_rate_pct']}%")
    print(f"Profit Factor:     {results['profit_factor']}")
    print(f"Max Drawdown:      {results['max_drawdown_pct']}%")
    print(f"Sharpe Ratio:      {results['sharpe_ratio']}")
    print("=" * 65)


if __name__ == "__main__":
    run_sample_backtest()
