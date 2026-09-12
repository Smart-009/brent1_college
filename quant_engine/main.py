"""
main.py
=======
Quant Engine — Entry Point.

Usage:
    # Paper trading (default, safe):
    python main.py

    # Backtesting mode:
    python main.py --mode backtest --start 2022-01-01 --end 2024-12-31

    # Live trading (REAL MONEY — only when ready):
    # First: set trading.mode = "live" in config/config.yaml
    # Then:  python main.py
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from loguru import logger

# ── Ensure UTF-8 output on Windows console ─────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Configure logger ──────────────────────────────────────────────────────
logger.remove()  # Remove default handler
logger.add(
    sys.stdout,
    colorize=True,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    ),
    level="INFO",
)
logger.add(
    "logs/quant_engine_{time:YYYY-MM-DD}.log",
    rotation="00:00",       # Rotate at midnight
    retention="30 days",    # Keep 30 days of logs
    compression="gz",       # Compress old logs
    level="DEBUG",
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level: <8} | {name}:{line} | {message}",
)

# Ensure logs directory exists
Path("logs").mkdir(exist_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Quant Engine — Multi-Asset Algorithmic Trading System"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="config/config.yaml",
        help="Path to config.yaml (default: config/config.yaml)",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["paper", "live", "backtest"],
        default=None,
        help="Override trading mode from config (paper/live/backtest)",
    )
    parser.add_argument(
        "--start",
        type=str,
        default="2022-01-01",
        help="Backtest start date YYYY-MM-DD (backtest mode only)",
    )
    parser.add_argument(
        "--end",
        type=str,
        default="2024-12-31",
        help="Backtest end date YYYY-MM-DD (backtest mode only)",
    )
    return parser.parse_args()


async def run_live(config_path: str) -> None:
    """Run the live/paper trading engine."""
    from core.engine import TradingEngine

    engine = TradingEngine(config_path)
    try:
        await engine.run()
    except KeyboardInterrupt:
        logger.info("[Main] Shutdown requested by user (Ctrl+C).")
    except Exception as e:
        logger.critical(f"[Main] Unhandled exception in engine: {e}", exc_info=True)
    finally:
        await engine.shutdown()


async def run_backtest(config_path: str, start: str, end: str) -> None:
    """Run the backtesting engine."""
    from simulation.backtester import Backtester

    bt = Backtester(config_path)
    results = await bt.run(start_date=start, end_date=end)
    results.print_summary()
    results.save_report()


def main() -> None:
    args = parse_args()

    logger.info("=" * 70)
    logger.info("  QUANT ENGINE — MULTI-ASSET ALGORITHMIC TRADING SYSTEM")
    logger.info("  ⚠️  Always test in PAPER mode before going LIVE")
    logger.info("=" * 70)

    # Override mode from command line if provided
    if args.mode:
        import yaml
        with open(args.config, "r") as f:
            cfg = yaml.safe_load(f)
        cfg["trading"]["mode"] = args.mode
        with open(args.config, "w") as f:
            yaml.dump(cfg, f)
        logger.info(f"[Main] Mode overridden to: {args.mode.upper()}")

    mode = args.mode or "paper"
    if mode == "backtest":
        asyncio.run(run_backtest(args.config, args.start, args.end))
    else:
        asyncio.run(run_live(args.config))


if __name__ == "__main__":
    main()
