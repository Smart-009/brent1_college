"""
simulation/backtester.py
========================
Historical Backtesting Engine.

Simulates the full trading pipeline on historical data:
  - Regime classification
  - Strategy signal generation
  - Risk management (position sizing, ATR stops)
  - Realistic fills with configurable slippage and commission
  - Tracks equity curve, drawdown, win rate, and Sharpe Ratio

ANTI-LOOKAHEAD BIAS:
  The engine processes bars STRICTLY one at a time, oldest first.
  No future bar data is ever accessible during signal generation.
  This is the most common cause of inflated backtest results in
  retail backtesting — we prevent it entirely.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import numpy as np
import pandas as pd
from loguru import logger

import yaml

from data.historical_loader import HistoricalLoader
from regime.regime_engine import RegimeEngine
from regime.volatility_model import compute_atr
from risk.position_sizer import PositionSizer
from strategies.breakout import BreakoutStrategy
from strategies.mean_reversion import MeanReversionStrategy
from strategies.trend_following import TrendFollowingStrategy


@dataclass
class BacktestTrade:
    """A single completed trade in the backtest."""
    symbol:       str
    direction:    str
    entry_price:  float
    exit_price:   float
    quantity:     float
    entry_bar:    int          # Bar index when trade was opened
    exit_bar:     int
    pnl:          float
    pnl_pct:      float
    commission:   float
    slippage:     float
    exit_reason:  str          # "stop_loss" | "take_profit" | "end_of_data"
    strategy_id:  str
    regime:       str


@dataclass
class BacktestResults:
    """Summary statistics of a completed backtest."""
    symbol:         str
    timeframe:      str
    start_date:     str
    end_date:       str
    total_bars:     int
    initial_equity: float
    final_equity:   float
    total_return_pct: float
    max_drawdown_pct: float
    sharpe_ratio:   float
    win_rate_pct:   float
    profit_factor:  float
    total_trades:   int
    winning_trades: int
    losing_trades:  int
    avg_win:        float
    avg_loss:       float
    trades:         list[BacktestTrade] = field(default_factory=list)
    equity_curve:   list[float] = field(default_factory=list)

    def print_summary(self) -> None:
        logger.info("=" * 60)
        logger.info(f"BACKTEST RESULTS: {self.symbol} {self.timeframe}")
        logger.info(f"  Period: {self.start_date} → {self.end_date}")
        logger.info(f"  Total Bars: {self.total_bars}")
        logger.info(f"  Total Trades: {self.total_trades}")
        logger.info(f"  Win Rate: {self.win_rate_pct:.1f}%")
        logger.info(f"  Profit Factor: {self.profit_factor:.2f}")
        logger.info(f"  Sharpe Ratio: {self.sharpe_ratio:.2f}")
        logger.info(f"  Total Return: {self.total_return_pct:+.2f}%")
        logger.info(f"  Max Drawdown: -{self.max_drawdown_pct:.2f}%")
        logger.info(f"  Final Equity: ${self.final_equity:,.2f}")
        logger.info("=" * 60)

    def save_report(self, path: str = "backtest_report.csv") -> None:
        if self.trades:
            df = pd.DataFrame([vars(t) for t in self.trades])
            df.to_csv(path, index=False)
            logger.info(f"Backtest report saved: {path}")


class Backtester:
    """
    Full-fidelity backtester with anti-lookahead protection.

    Usage:
        bt = Backtester("config/config.yaml")
        results = await bt.run(
            symbol="BTC/USDT",
            timeframe="15m",
            start_date="2022-01-01",
            end_date="2024-12-31",
            asset_class="crypto",
        )
        results.print_summary()
    """

    def __init__(self, config_path: str = "config/config.yaml") -> None:
        with open(config_path, "r") as f:
            self._cfg = yaml.safe_load(f)

        bt_cfg = self._cfg.get("backtest", {})
        self._commission_pct: float = bt_cfg.get("commission_pct", 0.05) / 100.0
        self._slippage_pct:   float = bt_cfg.get("slippage_pct", 0.02) / 100.0
        self._initial_equity: float = bt_cfg.get("initial_balance_usd", 100000.0)

        self._loader  = HistoricalLoader()
        self._regime  = RegimeEngine(self._cfg)
        self._sizer   = PositionSizer(self._cfg)
        self._strategies = {
            "trend_following": TrendFollowingStrategy(self._cfg),
            "mean_reversion":  MeanReversionStrategy(self._cfg),
            "breakout":        BreakoutStrategy(self._cfg),
        }

    async def run(
        self,
        symbol: str = "BTC/USDT",
        timeframe: str = "15m",
        start_date: str = "2022-01-01",
        end_date: str = "2024-12-31",
        asset_class: str = "crypto",
    ) -> BacktestResults:
        """Run a full backtest for a single symbol."""
        logger.info(
            f"[Backtester] Starting: {symbol} {timeframe} | "
            f"{start_date} → {end_date}"
        )

        # Load data
        df = await self._loader.load(symbol, timeframe, start_date, end_date, asset_class)
        if df.empty or len(df) < 100:
            raise RuntimeError(f"Insufficient data for {symbol}: {len(df)} bars")

        equity = self._initial_equity
        equity_curve = [equity]
        trades: list[BacktestTrade] = []
        hwm = equity

        open_trade: Optional[dict] = None
        warmup = 100  # Bars needed to initialize indicators

        for i in range(warmup, len(df)):
            # CRITICAL: Only use bars [0:i] — no lookahead
            window = df.iloc[:i].copy()
            current_bar = df.iloc[i]
            current_price = float(current_bar["close"])

            # ── Check open trade (stop/target) ───────────────────────────
            if open_trade:
                hit_sl = hit_tp = False
                if open_trade["direction"] == "long":
                    if current_price <= open_trade["stop"]:
                        hit_sl = True
                    elif current_price >= open_trade["target"]:
                        hit_tp = True
                else:
                    if current_price >= open_trade["stop"]:
                        hit_sl = True
                    elif current_price <= open_trade["target"]:
                        hit_tp = True

                if hit_sl or hit_tp:
                    exit_price = open_trade["stop"] if hit_sl else open_trade["target"]
                    exit_price *= (1.0 + self._slippage_pct * (1 if open_trade["direction"] == "long" else -1))
                    qty = open_trade["quantity"]

                    if open_trade["direction"] == "long":
                        raw_pnl = (exit_price - open_trade["entry"]) * qty
                    else:
                        raw_pnl = (open_trade["entry"] - exit_price) * qty

                    commission = exit_price * qty * self._commission_pct
                    net_pnl = raw_pnl - commission - open_trade["entry_commission"]
                    pnl_pct = net_pnl / equity * 100.0

                    trades.append(BacktestTrade(
                        symbol=symbol,
                        direction=open_trade["direction"],
                        entry_price=open_trade["entry"],
                        exit_price=exit_price,
                        quantity=qty,
                        entry_bar=open_trade["entry_bar"],
                        exit_bar=i,
                        pnl=net_pnl,
                        pnl_pct=pnl_pct,
                        commission=commission + open_trade["entry_commission"],
                        slippage=exit_price * qty * self._slippage_pct,
                        exit_reason="stop_loss" if hit_sl else "take_profit",
                        strategy_id=open_trade["strategy"],
                        regime=open_trade["regime"],
                    ))

                    equity += net_pnl
                    equity_curve.append(equity)
                    hwm = max(hwm, equity)
                    open_trade = None
                continue

            # ── Generate new signal ───────────────────────────────────────
            if open_trade is None:
                regime_result = self._regime.compute(window, symbol)
                if not regime_result.is_tradeable():
                    equity_curve.append(equity)
                    continue

                strategy = None
                for name in regime_result.allowed_strategies:
                    if name in self._strategies:
                        strategy = self._strategies[name]
                        break

                if strategy is None:
                    equity_curve.append(equity)
                    continue

                signal = strategy.generate_signal(
                    df=window,
                    symbol=symbol,
                    regime_state=regime_result.state.value,
                )

                if not signal.is_actionable():
                    equity_curve.append(equity)
                    continue

                # Compute sizing
                atr_arr = compute_atr(window, period=14)
                atr = float(atr_arr[-1]) if len(atr_arr) > 0 and not np.isnan(atr_arr[-1]) else 0.0
                if atr == 0:
                    equity_curve.append(equity)
                    continue

                sizing = self._sizer.calculate(
                    equity=equity,
                    entry_price=current_price,
                    atr=atr,
                    signal_confidence=signal.confidence,
                )

                if sizing.quantity <= 0:
                    equity_curve.append(equity)
                    continue

                # Simulate fill with slippage
                if signal.direction.value == "long":
                    fill_price = current_price * (1.0 + self._slippage_pct)
                else:
                    fill_price = current_price * (1.0 - self._slippage_pct)

                entry_commission = fill_price * sizing.quantity * self._commission_pct

                open_trade = {
                    "entry":      fill_price,
                    "stop":       sizing.stop_loss_price,
                    "target":     sizing.take_profit_price,
                    "quantity":   sizing.quantity,
                    "direction":  signal.direction.value,
                    "entry_bar":  i,
                    "entry_commission": entry_commission,
                    "strategy":   signal.strategy_id,
                    "regime":     regime_result.state.value,
                }

            equity_curve.append(equity)

        # Close any trade still open at end of data
        if open_trade:
            exit_price = float(df.iloc[-1]["close"])
            qty = open_trade["quantity"]
            if open_trade["direction"] == "long":
                raw_pnl = (exit_price - open_trade["entry"]) * qty
            else:
                raw_pnl = (open_trade["entry"] - exit_price) * qty
            commission = exit_price * qty * self._commission_pct
            net_pnl = raw_pnl - commission - open_trade["entry_commission"]
            trades.append(BacktestTrade(
                symbol=symbol, direction=open_trade["direction"],
                entry_price=open_trade["entry"], exit_price=exit_price,
                quantity=qty, entry_bar=open_trade["entry_bar"],
                exit_bar=len(df) - 1, pnl=net_pnl,
                pnl_pct=net_pnl / equity * 100.0,
                commission=commission, slippage=0.0,
                exit_reason="end_of_data",
                strategy_id=open_trade["strategy"],
                regime=open_trade["regime"],
            ))
            equity += net_pnl

        # ── Compute Summary Statistics ─────────────────────────────────────
        wins  = [t for t in trades if t.pnl > 0]
        losses = [t for t in trades if t.pnl <= 0]

        gross_profit = sum(t.pnl for t in wins)
        gross_loss   = abs(sum(t.pnl for t in losses))
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float("inf")

        eq_array = np.array(equity_curve)
        returns  = np.diff(eq_array) / eq_array[:-1]
        sharpe   = (np.mean(returns) / np.std(returns) * np.sqrt(252)) if np.std(returns) > 0 else 0.0

        peak = np.maximum.accumulate(eq_array)
        dd   = (peak - eq_array) / peak * 100.0
        max_dd = float(dd.max())

        return BacktestResults(
            symbol=symbol,
            timeframe=timeframe,
            start_date=start_date,
            end_date=end_date,
            total_bars=len(df),
            initial_equity=self._initial_equity,
            final_equity=equity,
            total_return_pct=((equity - self._initial_equity) / self._initial_equity) * 100.0,
            max_drawdown_pct=max_dd,
            sharpe_ratio=round(sharpe, 2),
            win_rate_pct=len(wins) / len(trades) * 100.0 if trades else 0.0,
            profit_factor=round(profit_factor, 2),
            total_trades=len(trades),
            winning_trades=len(wins),
            losing_trades=len(losses),
            avg_win=np.mean([t.pnl for t in wins]) if wins else 0.0,
            avg_loss=np.mean([t.pnl for t in losses]) if losses else 0.0,
            trades=trades,
            equity_curve=equity_curve,
        )
