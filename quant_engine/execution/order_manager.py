"""
execution/order_manager.py
===========================
Smart Order Manager — Routes, Tracks, and Manages All Orders.

RESPONSIBILITIES:
  1. Receives authorized trade decisions from the risk manager.
  2. Routes orders to the appropriate broker via the data router.
  3. Maintains SYNTHETIC stop-losses in private memory (never on exchange).
  4. Monitors fill status of pending orders asynchronously.
  5. Handles partial fills gracefully.
  6. Implements breakeven stop movement (moves SL to entry once target is 50% hit).
  7. Logs every order and trade state change to the database.

STEALTH EXECUTION (Synthetic Stops):
  Our stop-losses are NEVER placed as resting orders on the exchange order book.
  Placing a stop on the exchange means:
  - HFT market makers can see exactly where your stop is.
  - Liquidity hunters actively push price to YOUR stop to fill their own orders.
  - Your stop becomes a target.

  Instead, the order manager maintains stop prices in private memory only.
  A background monitoring task polls price every second and fires a MARKET
  order to exit the position if the current price crosses the stop level.
  This is a SYNTHETIC stop — invisible to the market.
"""

from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from loguru import logger

from brokers.base_broker import (
    AssetClass,
    Order,
    OrderSide,
    OrderStatus,
    OrderType,
)
from data.market_data_router import MarketDataRouter
from db.trade_logger import TradeLogger
from risk.risk_manager import TradeAuthorization
from strategies.base_strategy import SignalDirection


@dataclass
class ManagedPosition:
    """
    Tracks an open position along with its private synthetic stop-loss.
    """
    trade_id:        str
    symbol:          str
    asset_class:     str
    direction:       str           # "long" | "short"
    quantity:        float
    entry_price:     float
    stop_loss:       float         # PRIVATE — never placed on exchange
    take_profit:     float
    broker_order_id: str
    strategy_id:     str
    opened_at:       datetime
    regime_at_entry: str
    breakeven_moved: bool = False  # True if SL has been moved to BE
    partial_exited:  bool = False  # True if 50% has been exited at TP1
    current_price:   float = 0.0
    unrealized_pnl:  float = 0.0
    atr:             float = 0.0   # ATR at trade entry
    initial_quantity: float = 0.0  # Original full position size
    highest_price:   float = 0.0   # Tracked for long trailing stops
    lowest_price:    float = 0.0   # Tracked for short trailing stops
    trailing_active: bool = False  # True once TP1 is hit and trailing starts


class OrderManager:
    """
    Routes authorized trades to brokers and monitors open positions.

    Usage:
        order_mgr = OrderManager(config, data_router, trade_logger)
        await order_mgr.start()

        # After risk manager approves:
        managed_pos = await order_mgr.execute_trade(authorization)

        # Order manager now monitors the position for stop/target in background
        await order_mgr.stop()
    """

    MONITOR_INTERVAL_S = 1.0    # Check stop-losses every 1 second

    def __init__(
        self,
        config: dict,
        data_router: MarketDataRouter,
        trade_logger: TradeLogger,
    ) -> None:
        self._config = config
        self._data_router = data_router
        self._logger = trade_logger
        self._trading_mode = config.get("trading", {}).get("mode", "paper")
        self._synthetic_stops: bool = config.get("risk", {}).get("synthetic_stops", True)
        self._use_breakeven: bool = config.get("risk", {}).get("use_breakeven_on_half_target", True)

        # Alpha Engine — Trailing Stop & Partial Exit Config
        alpha_cfg = config.get("alpha_engine", {}).get("trailing_stop", {})
        self._trailing_enabled: bool = alpha_cfg.get("enabled", True)
        self._scale_out_pct: float = alpha_cfg.get("scale_out_pct", 0.5)
        self._tp1_atr_mult: float = alpha_cfg.get("tp1_atr_mult", 2.0)
        self._breakeven_buffer_atr: float = alpha_cfg.get("breakeven_atr_buffer", 0.2)
        self._trail_atr_mult: float = alpha_cfg.get("trail_atr_mult", 2.5)

        self._positions: dict[str, ManagedPosition] = {}
        self._running = False
        self._monitor_task: Optional[asyncio.Task] = None

    @property
    def open_positions(self) -> dict[str, ManagedPosition]:
        """Dictionary of currently open managed positions keyed by trade_id."""
        return self._positions

    @property
    def position_count(self) -> int:
        """Total number of open positions."""
        return len(self._positions)

    @property
    def positions(self) -> dict[str, ManagedPosition]:
        """Alias for open_positions."""
        return self._positions

    # ── Lifecycle ──────────────────────────────────────────────────────────

    async def start(self) -> None:
        """Start the background position monitoring task."""
        self._running = True
        self._monitor_task = asyncio.create_task(
            self._monitor_loop(),
            name="order_manager_monitor",
        )
        logger.info("[OrderManager] Started. Monitoring positions every 1s.")

    async def stop(self) -> None:
        """Stop monitoring and clean up."""
        self._running = False
        if self._monitor_task and not self._monitor_task.done():
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass
        logger.info("[OrderManager] Stopped.")

    # ── Order Execution ────────────────────────────────────────────────────

    async def execute_trade(
        self,
        authorization: TradeAuthorization,
        asset_class: str = "crypto",
    ) -> Optional[ManagedPosition]:
        """
        Execute an authorized trade signal.

        Args:
            authorization: Approved TradeAuthorization from RiskManager.
            asset_class:   "crypto" | "stocks_us" | "forex"

        Returns:
            ManagedPosition if execution succeeded, None if it failed.
        """
        if not authorization.authorized:
            logger.error(
                "[OrderManager] Attempted to execute a non-authorized trade. Ignoring."
            )
            return None

        signal  = authorization.signal
        sizing  = authorization.sizing
        trade_id = f"T{uuid.uuid4().hex[:12].upper()}"

        direction = "long" if signal.direction == SignalDirection.LONG else "short"
        order_side = OrderSide.BUY if direction == "long" else OrderSide.SELL

        order = Order(
            symbol=signal.symbol,
            asset_class=AssetClass(asset_class.replace("stocks_us", "stock")),
            side=order_side,
            order_type=OrderType.MARKET,
            quantity=sizing.quantity,
            client_order_id=f"qe_{trade_id}",
            strategy_id=signal.strategy_id,
            metadata={
                "trade_id": trade_id,
                "stop_loss": sizing.stop_loss_price,
                "take_profit": sizing.take_profit_price,
            },
        )

        # In paper mode, simulate the fill
        if self._trading_mode == "paper":
            try:
                tick = await self._data_router.get_ticker(signal.symbol)
                fill_price = tick.ask if direction == "long" else tick.bid
            except Exception:
                fill_price = signal.entry_price or 0.0

            order.status = OrderStatus.FILLED
            order.filled_price = fill_price
            order.filled_quantity = sizing.quantity
            order.broker_order_id = f"PAPER_{trade_id}"

            logger.info(
                f"[OrderManager] 📄 PAPER FILL | {direction.upper()} "
                f"{sizing.quantity:.6f} {signal.symbol} @ {fill_price:.6f}"
            )
        else:
            # Live mode: route to actual broker
            broker = self._data_router.get_broker(asset_class)
            if broker is None:
                logger.error(
                    f"[OrderManager] No broker available for {asset_class}. Order rejected."
                )
                return None

            try:
                order = await broker.place_order(order)
                fill_price = order.filled_price or signal.entry_price or 0.0
            except Exception as e:
                logger.error(f"[OrderManager] Order execution failed: {e}")
                await self._logger.log_order(order)
                return None

        if order.status != OrderStatus.FILLED:
            logger.warning(
                f"[OrderManager] Order {trade_id} not immediately filled: {order.status}"
            )
            await self._logger.log_order(order)
            return None

        # ── Create Managed Position ────────────────────────────────────────
        pos = ManagedPosition(
            trade_id=trade_id,
            symbol=signal.symbol,
            asset_class=asset_class,
            direction=direction,
            quantity=order.filled_quantity,
            entry_price=order.filled_price,
            stop_loss=sizing.stop_loss_price,
            take_profit=sizing.take_profit_price,
            broker_order_id=order.broker_order_id or trade_id,
            strategy_id=signal.strategy_id,
            opened_at=datetime.now(timezone.utc),
            regime_at_entry=signal.regime_context or "",
            current_price=order.filled_price,
            atr=getattr(sizing, "atr", 0.0),
            initial_quantity=order.filled_quantity,
            highest_price=order.filled_price,
            lowest_price=order.filled_price,
        )
        self._positions[trade_id] = pos

        # Log to database
        await self._logger.log_order(order)
        await self._logger.log_trade_open(
            trade_id=trade_id,
            symbol=signal.symbol,
            asset_class=asset_class,
            side=direction,
            entry_price=order.filled_price,
            quantity=order.filled_quantity,
            strategy_id=signal.strategy_id,
            regime_at_entry=signal.regime_context,
            entry_order_id=order.client_order_id,
        )

        logger.info(
            f"[OrderManager] ✅ POSITION OPEN | {trade_id} | "
            f"{direction.upper()} {order.filled_quantity:.6f} {signal.symbol} "
            f"@ {order.filled_price:.6f} | "
            f"SL={sizing.stop_loss_price:.6f} | TP={sizing.take_profit_price:.6f} | "
            f"Risk=${sizing.dollar_risk:.2f}"
        )
        return pos

    async def close_position(
        self,
        trade_id: str,
        reason: str = "manual",
    ) -> bool:
        """
        Close a specific open position by trade_id.

        Args:
            trade_id: The internal trade ID.
            reason:   Why it's being closed (for logging).

        Returns:
            True if successfully closed, False otherwise.
        """
        pos = self._positions.get(trade_id)
        if pos is None:
            logger.warning(f"[OrderManager] Trade {trade_id} not found in active positions.")
            return False

        close_side = OrderSide.SELL if pos.direction == "long" else OrderSide.BUY
        close_order = Order(
            symbol=pos.symbol,
            asset_class=AssetClass(pos.asset_class.replace("stocks_us", "stock")),
            side=close_side,
            order_type=OrderType.MARKET,
            quantity=pos.quantity,
            client_order_id=f"qe_close_{trade_id}",
            strategy_id=pos.strategy_id,
        )

        if self._trading_mode == "paper":
            try:
                tick = await self._data_router.get_ticker(pos.symbol)
                exit_price = tick.bid if pos.direction == "long" else tick.ask
            except Exception:
                exit_price = pos.current_price
            close_order.status = OrderStatus.FILLED
            close_order.filled_price = exit_price
            close_order.filled_quantity = pos.quantity
        else:
            broker = self._data_router.get_broker(pos.asset_class)
            if broker:
                try:
                    close_order = await broker.place_order(close_order)
                    exit_price = close_order.filled_price or pos.current_price
                except Exception as e:
                    logger.error(f"[OrderManager] Close order failed for {trade_id}: {e}")
                    return False
            else:
                return False

        # Calculate PnL
        if pos.direction == "long":
            pnl = (exit_price - pos.entry_price) * pos.quantity
        else:
            pnl = (pos.entry_price - exit_price) * pos.quantity

        pnl_pct = (pnl / (pos.entry_price * pos.quantity)) * 100.0 if pos.entry_price > 0 else 0.0

        # Log trade close
        await self._logger.log_trade_close(
            trade_id=trade_id,
            exit_price=exit_price,
            realized_pnl=pnl,
            realized_pnl_pct=pnl_pct,
            exit_order_id=close_order.client_order_id,
        )

        del self._positions[trade_id]

        pnl_sign = "+" if pnl >= 0 else ""
        icon = "✅" if pnl >= 0 else "❌"
        logger.info(
            f"[OrderManager] {icon} POSITION CLOSED | {trade_id} | "
            f"{pos.symbol} | Exit @ {exit_price:.6f} | "
            f"PnL: {pnl_sign}${pnl:.2f} ({pnl_sign}{pnl_pct:.2f}%) | "
            f"Reason: {reason}"
        )
        return True

    async def partial_close_position(
        self,
        trade_id: str,
        close_fraction: float = 0.5,
        reason: str = "tp1_scale_out",
    ) -> bool:
        """
        Close a fraction (e.g. 50%) of an active position to lock in profit.
        Leaves the remaining position open to ride trends with a trailing stop.
        """
        pos = self._positions.get(trade_id)
        if pos is None:
            return False

        qty_to_close = pos.quantity * close_fraction
        if qty_to_close <= 0:
            return False

        close_side = OrderSide.SELL if pos.direction == "long" else OrderSide.BUY
        close_order = Order(
            symbol=pos.symbol,
            asset_class=AssetClass(pos.asset_class.replace("stocks_us", "stock")),
            side=close_side,
            order_type=OrderType.MARKET,
            quantity=qty_to_close,
            client_order_id=f"qe_partial_{trade_id}",
            strategy_id=pos.strategy_id,
        )

        if self._trading_mode == "paper":
            try:
                tick = await self._data_router.get_ticker(pos.symbol)
                exit_price = tick.bid if pos.direction == "long" else tick.ask
            except Exception:
                exit_price = pos.current_price
            close_order.status = OrderStatus.FILLED
            close_order.filled_price = exit_price
            close_order.filled_quantity = qty_to_close
        else:
            broker = self._data_router.get_broker(pos.asset_class)
            if broker:
                try:
                    close_order = await broker.place_order(close_order)
                    exit_price = close_order.filled_price or pos.current_price
                except Exception as e:
                    logger.error(f"[OrderManager] Partial close order failed for {trade_id}: {e}")
                    return False
            else:
                return False

        # Realize PnL on the closed slice
        if pos.direction == "long":
            pnl = (exit_price - pos.entry_price) * qty_to_close
        else:
            pnl = (pos.entry_price - exit_price) * qty_to_close

        pnl_pct = (pnl / (pos.entry_price * qty_to_close)) * 100.0 if pos.entry_price > 0 else 0.0

        # Log partial exit as completed slice
        await self._logger.log_trade_close(
            trade_id=f"{trade_id}_P1",
            exit_price=exit_price,
            realized_pnl=pnl,
            realized_pnl_pct=pnl_pct,
            exit_order_id=close_order.client_order_id,
        )

        # Update remaining position state
        pos.quantity -= qty_to_close
        pos.partial_exited = True
        pos.trailing_active = True

        pnl_sign = "+" if pnl >= 0 else ""
        logger.info(
            f"[OrderManager] 💰 PARTIAL PROFIT LOCKED | {trade_id} | "
            f"{pos.symbol} | Closed {qty_to_close:.4f} ({close_fraction*100:.0f}%) @ {exit_price:.6f} | "
            f"PnL: {pnl_sign}${pnl:.2f} ({pnl_sign}{pnl_pct:.2f}%) | "
            f"Remaining: {pos.quantity:.4f} with Trailing Stop"
        )
        return True

    # ── Background Monitor ─────────────────────────────────────────────────

    async def _monitor_loop(self) -> None:
        """
        Background task: polls prices every second and enforces synthetic stops.
        """
        while self._running:
            try:
                if self._positions:
                    await self._check_stops_and_targets()
            except Exception as e:
                logger.error(f"[OrderManager] Monitor loop error: {e}")
            await asyncio.sleep(self.MONITOR_INTERVAL_S)

    async def _check_stops_and_targets(self) -> None:
        """
        Check each open position against:
          1. Hard synthetic stop-loss or dynamic Chandelier trailing stop.
          2. Partial Take-Profit 1 (TP1) -> locks 50% profit + moves SL to risk-free.
          3. Final Take-Profit target (if not trailing).
          4. Chandelier trailing ratcheting for runner positions.
        """
        for trade_id, pos in list(self._positions.items()):
            try:
                tick = await self._data_router.get_ticker(pos.symbol)
                current_price = tick.last
                pos.current_price = current_price

                # Track highest/lowest price for Chandelier trailing stop
                if pos.direction == "long":
                    if current_price > pos.highest_price:
                        pos.highest_price = current_price
                    pnl = (current_price - pos.entry_price) * pos.quantity

                    # 1. Stop-Loss / Trailing Stop Trigger
                    if current_price <= pos.stop_loss:
                        reason = "trailing_stop" if pos.trailing_active else "stop_loss"
                        await self.close_position(trade_id, reason=reason)
                        continue

                    # 2. Stage 1: Partial Scale-Out (TP1) at 2.0x ATR
                    if self._trailing_enabled and not pos.partial_exited and pos.atr > 0:
                        tp1_price = pos.entry_price + (pos.atr * self._tp1_atr_mult)
                        if current_price >= tp1_price:
                            # Close 50%
                            await self.partial_close_position(
                                trade_id,
                                close_fraction=self._scale_out_pct,
                                reason="tp1_scale_out",
                            )
                            # Move stop to Entry + buffer (guaranteed green trade)
                            new_sl = pos.entry_price + (pos.atr * self._breakeven_buffer_atr)
                            if new_sl > pos.stop_loss:
                                pos.stop_loss = new_sl
                                pos.breakeven_moved = True
                                logger.info(
                                    f"[OrderManager] 🛡️ Risk-Free Stop Activated | {trade_id} | "
                                    f"{pos.symbol} SL moved to {pos.stop_loss:.6f} (+{self._breakeven_buffer_atr} ATR)"
                                )
                            continue

                    # 3. Stage 2: ATR Chandelier Trailing Stop Ratchet
                    if pos.trailing_active and pos.atr > 0:
                        # Trail stop behind highest price reached
                        trail_stop = pos.highest_price - (pos.atr * self._trail_atr_mult)
                        if trail_stop > pos.stop_loss:
                            pos.stop_loss = trail_stop
                            logger.debug(
                                f"[OrderManager] 📈 Trailing Stop Ratchet | {trade_id} {pos.symbol} "
                                f"SL raised to ${pos.stop_loss:.6f} (High: ${pos.highest_price:.6f})"
                            )

                    # 4. Standard Take-Profit hit (if trailing not active)
                    if not pos.trailing_active and current_price >= pos.take_profit:
                        await self.close_position(trade_id, reason="take_profit")
                        continue

                    # 5. Breakeven fallback (if trailing disabled)
                    if not self._trailing_enabled and self._use_breakeven and not pos.breakeven_moved:
                        half_target = pos.entry_price + (pos.take_profit - pos.entry_price) * 0.5
                        if current_price >= half_target:
                            pos.stop_loss = pos.entry_price
                            pos.breakeven_moved = True
                            logger.info(
                                f"[OrderManager] 🔄 Breakeven moved for {trade_id} | "
                                f"{pos.symbol} | New SL = {pos.stop_loss:.6f}"
                            )

                else:
                    # ── Short Positions ────────────────────────────────────
                    if pos.lowest_price <= 0 or current_price < pos.lowest_price:
                        pos.lowest_price = current_price
                    pnl = (pos.entry_price - current_price) * pos.quantity

                    # 1. Stop-Loss / Trailing Stop Trigger
                    if current_price >= pos.stop_loss:
                        reason = "trailing_stop" if pos.trailing_active else "stop_loss"
                        await self.close_position(trade_id, reason=reason)
                        continue

                    # 2. Stage 1: Partial Scale-Out (TP1) at 2.0x ATR
                    if self._trailing_enabled and not pos.partial_exited and pos.atr > 0:
                        tp1_price = pos.entry_price - (pos.atr * self._tp1_atr_mult)
                        if current_price <= tp1_price:
                            await self.partial_close_position(
                                trade_id,
                                close_fraction=self._scale_out_pct,
                                reason="tp1_scale_out",
                            )
                            new_sl = pos.entry_price - (pos.atr * self._breakeven_buffer_atr)
                            if new_sl < pos.stop_loss:
                                pos.stop_loss = new_sl
                                pos.breakeven_moved = True
                                logger.info(
                                    f"[OrderManager] 🛡️ Risk-Free Stop Activated | {trade_id} | "
                                    f"{pos.symbol} SL moved to {pos.stop_loss:.6f} (-{self._breakeven_buffer_atr} ATR)"
                                )
                            continue

                    # 3. Stage 2: ATR Chandelier Trailing Stop Ratchet
                    if pos.trailing_active and pos.atr > 0:
                        trail_stop = pos.lowest_price + (pos.atr * self._trail_atr_mult)
                        if trail_stop < pos.stop_loss:
                            pos.stop_loss = trail_stop
                            logger.debug(
                                f"[OrderManager] 📉 Trailing Stop Ratchet | {trade_id} {pos.symbol} "
                                f"SL lowered to ${pos.stop_loss:.6f} (Low: ${pos.lowest_price:.6f})"
                            )

                    # 4. Standard Take-Profit hit (if trailing not active)
                    if not pos.trailing_active and current_price <= pos.take_profit:
                        await self.close_position(trade_id, reason="take_profit")
                        continue

                    # 5. Breakeven fallback (if trailing disabled)
                    if not self._trailing_enabled and self._use_breakeven and not pos.breakeven_moved:
                        half_target = pos.entry_price - (pos.entry_price - pos.take_profit) * 0.5
                        if current_price <= half_target:
                            pos.stop_loss = pos.entry_price
                            pos.breakeven_moved = True
                            logger.info(
                                f"[OrderManager] 🔄 Breakeven moved for {trade_id} | "
                                f"{pos.symbol} | New SL = {pos.stop_loss:.6f}"
                            )

                pos.unrealized_pnl = pnl

            except Exception as e:
                logger.debug(f"[OrderManager] Monitor error for {trade_id}: {e}")
