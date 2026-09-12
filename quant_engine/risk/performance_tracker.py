"""
risk/performance_tracker.py
===========================
Rolling Performance Tracker & Dynamic Kelly Feedback Loop.

Responsibilities
----------------
1. Queries closed trades from `db/trades.sqlite` periodically.
2. Calculates rolling Win Rate (p) and Win/Loss Payout Ratio (b)
   for each strategy over the last N trades (default 30).
3. Provides dynamic (win_rate, win_loss_ratio) inputs to `PositionSizer.calculate()`,
   enabling authentic Half-Kelly dynamic compounding when strategies are hot,
   and automatic risk throttling when strategies are experiencing drawdowns.
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from typing import Dict, Optional, Tuple
import aiosqlite
from loguru import logger


@dataclass
class StrategyMetrics:
    """Performance summary for a single strategy."""
    strategy_id: str
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float            # 0.0 to 1.0
    avg_win: float             # Avg dollar win
    avg_loss: float            # Avg dollar loss
    win_loss_ratio: float      # avg_win / avg_loss (payout ratio)
    net_pnl: float


class PerformanceTracker:
    """
    Asynchronously tracks strategy performance metrics from SQLite.
    """

    def __init__(self, config: dict, db_path: str = "db/trades.sqlite") -> None:
        self._cfg = config.get("alpha_engine", {}).get("feedback", {})
        self.enabled: bool = self._cfg.get("enabled", True)
        self._db_path = db_path
        self._rolling_trades: int = self._cfg.get("rolling_trades", 30)
        self._min_trades: int = self._cfg.get("min_trades_for_feedback", 5)

        self._cache: Dict[str, StrategyMetrics] = {}
        self._lock = asyncio.Lock()

    async def refresh_metrics(self) -> None:
        """Query SQLite and recompute rolling metrics for all strategies."""
        if not self.enabled:
            return

        query = f"""
            SELECT strategy_id, realized_pnl
            FROM trades
            WHERE closed_at IS NOT NULL
            ORDER BY closed_at DESC
        """

        try:
            async with aiosqlite.connect(self._db_path) as db:
                async with db.execute(query) as cursor:
                    rows = await cursor.fetchall()
        except Exception as e:
            logger.debug(f"[PerformanceTracker] Could not query trades table: {e}")
            return

        # Group recent trades by strategy
        strategy_pnl: Dict[str, list[float]] = {}
        for row in rows:
            strat_id, pnl = row[0], row[1]
            if not strat_id or pnl is None:
                continue
            if strat_id not in strategy_pnl:
                strategy_pnl[strat_id] = []
            if len(strategy_pnl[strat_id]) < self._rolling_trades:
                strategy_pnl[strat_id].append(float(pnl))

        # Compute metrics per strategy
        async with self._lock:
            for strat_id, pnls in strategy_pnl.items():
                total = len(pnls)
                wins = [p for p in pnls if p > 0]
                losses = [abs(p) for p in pnls if p < 0]

                win_count = len(wins)
                loss_count = len(losses)
                win_rate = (win_count / total) if total > 0 else 0.5

                avg_win = (sum(wins) / win_count) if win_count > 0 else 1.0
                avg_loss = (sum(losses) / loss_count) if loss_count > 0 else 1.0
                win_loss_ratio = (avg_win / avg_loss) if avg_loss > 0 else 1.0

                self._cache[strat_id] = StrategyMetrics(
                    strategy_id=strat_id,
                    total_trades=total,
                    winning_trades=win_count,
                    losing_trades=loss_count,
                    win_rate=round(win_rate, 4),
                    avg_win=round(avg_win, 2),
                    avg_loss=round(avg_loss, 2),
                    win_loss_ratio=round(win_loss_ratio, 4),
                    net_pnl=round(sum(pnls), 2),
                )

    def get_strategy_feedback(self, strategy_id: str) -> Tuple[Optional[float], Optional[float]]:
        """
        Returns (win_rate, avg_win_loss_ratio) for Kelly sizing if minimum
        trade threshold is met; otherwise returns (None, None).
        """
        if not self.enabled:
            return None, None

        metrics = self._cache.get(strategy_id)
        if metrics and metrics.total_trades >= self._min_trades:
            return metrics.win_rate, metrics.win_loss_ratio

        return None, None
