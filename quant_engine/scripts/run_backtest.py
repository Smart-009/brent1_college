"""
scripts/run_backtest.py
========================
Backtest Runner — One-command historical performance report.

Runs the full strategy pipeline on 2 years of 15-minute OHLCV data
for the configured crypto symbols. Uses the Binance public API
(no API key required) and caches data locally in data/cache/.

USAGE:
    python scripts/run_backtest.py

    # Specific symbol and date range:
    python scripts/run_backtest.py --symbol ETH/USDT --start 2023-01-01 --end 2024-12-31

    # All 12 symbols (takes ~10 minutes, downloads ~500MB of data first time):
    python scripts/run_backtest.py --all

OUTPUT:
    - Console: per-symbol win rate, Sharpe, profit factor, max drawdown
    - CSV:      logs/backtest_SYMBOL_DATE.csv  (full trade log)
    - Summary:  logs/backtest_summary_DATE.csv  (one row per symbol)
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
from loguru import logger

from simulation.backtester import Backtester


ALL_SYMBOLS = [
    "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT",
    "XRP/USDT", "ADA/USDT", "AVAX/USDT", "DOGE/USDT",
    "LINK/USDT", "DOT/USDT", "LTC/USDT", "MATIC/USDT",
]


def print_banner() -> None:
    print("\n" + "=" * 65)
    print("  BRENT QUANT ENGINE - HISTORICAL BACKTEST RUNNER")
    print("=" * 65)
    print("  Strategy: Trend Pullback + Mean Reversion + Breakout")
    print("  Regime:   Hurst + ADX + Yang-Zhang + Bollinger Squeeze")
    print("  Sizing:   Half-Kelly + ATR Volatility Normalization")
    print("=" * 65 + "\n")


async def run_single(backtester, symbol, timeframe, start, end):
    try:
        results = await backtester.run(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start,
            end_date=end,
            asset_class="crypto",
        )
        results.print_summary()

        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        safe_sym = symbol.replace("/", "_")
        date_str = datetime.now().strftime("%Y%m%d_%H%M")
        csv_path = logs_dir / f"backtest_{safe_sym}_{date_str}.csv"
        results.save_report(str(csv_path))

        return {
            "symbol":           symbol,
            "timeframe":        timeframe,
            "period":           f"{start} to {end}",
            "total_trades":     results.total_trades,
            "win_rate_pct":     round(results.win_rate_pct, 1),
            "profit_factor":    results.profit_factor,
            "sharpe_ratio":     results.sharpe_ratio,
            "total_return_pct": round(results.total_return_pct, 2),
            "max_drawdown_pct": round(results.max_drawdown_pct, 2),
            "avg_win_usd":      round(results.avg_win, 2),
            "avg_loss_usd":     round(results.avg_loss, 2),
            "final_equity_usd": round(results.final_equity, 2),
        }
    except Exception as e:
        logger.error(f"[BacktestRunner] Failed for {symbol}: {e}")
        return None


async def main():
    parser = argparse.ArgumentParser(description="Brent Quant Engine Backtest Runner")
    parser.add_argument("--symbol",    default="BTC/USDT",    help="Symbol to backtest")
    parser.add_argument("--timeframe", default="15m",         help="Candle timeframe")
    parser.add_argument("--start",     default="2023-01-01",  help="Start date YYYY-MM-DD")
    parser.add_argument("--end",       default="2024-12-31",  help="End date YYYY-MM-DD")
    parser.add_argument("--all",       action="store_true", dest="run_all",
                        help="Backtest all 12 configured symbols")
    args = parser.parse_args()

    print_banner()
    backtester = Backtester("config/config.yaml")
    symbols = ALL_SYMBOLS if args.run_all else [args.symbol]
    summaries = []

    print(f"Period:    {args.start}  to  {args.end}")
    print(f"Timeframe: {args.timeframe}")
    print(f"Symbols:   {', '.join(symbols)}\n")

    for sym in symbols:
        print(f"\n{'-' * 65}")
        print(f"  Running: {sym}")
        print(f"{'-' * 65}")
        result = await run_single(backtester, sym, args.timeframe, args.start, args.end)
        if result:
            summaries.append(result)

    if summaries:
        print("\n\n" + "=" * 65)
        print("  AGGREGATE RESULTS SUMMARY")
        print("=" * 65)
        df = pd.DataFrame(summaries)
        print(df[["symbol", "total_trades", "win_rate_pct",
                   "profit_factor", "sharpe_ratio",
                   "total_return_pct", "max_drawdown_pct"]].to_string(index=False))

        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        date_str = datetime.now().strftime("%Y%m%d_%H%M")
        summary_path = logs_dir / f"backtest_summary_{date_str}.csv"
        df.to_csv(summary_path, index=False)
        print(f"\nFull summary saved to: {summary_path}")

        if len(df) > 1:
            best  = df.loc[df["sharpe_ratio"].idxmax()]
            worst = df.loc[df["total_return_pct"].idxmin()]
            print(f"Best Sharpe:  {best['symbol']} ({best['sharpe_ratio']:.2f})")
            print(f"Worst Return: {worst['symbol']} ({worst['total_return_pct']:+.2f}%)")

        print(f"\nPortfolio Total Trades:  {df['total_trades'].sum()}")
        print(f"Average Win Rate:        {df['win_rate_pct'].mean():.1f}%")
        print(f"Average Sharpe Ratio:    {df['sharpe_ratio'].mean():.2f}")

    print("\n" + "=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
