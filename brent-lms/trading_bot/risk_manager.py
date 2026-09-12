"""
Éclat Institute - Quantitative Risk Governance & Prop Firm Capital Guard
Implements dynamic position sizing, maximum daily drawdown kill-switches, and spread validation.
"""

import logging
from datetime import datetime

logger = logging.getLogger("RiskManager")


class RiskManager:
    def __init__(self, risk_per_trade_pct: float = 1.0, max_daily_drawdown_pct: float = 4.0, max_open_positions: int = 2, max_spread_pips: float = 2.5):
        self.risk_per_trade_pct = risk_per_trade_pct
        self.max_daily_drawdown_pct = max_daily_drawdown_pct
        self.max_open_positions = max_open_positions
        self.max_spread_pips = max_spread_pips
        
        self.day_start_balance = 0.0
        self.last_reset_date = datetime.utcnow().date()
        self.is_kill_switch_active = False

    def check_daily_reset(self, current_balance: float):
        current_date = datetime.utcnow().date()
        if current_date != self.last_reset_date or self.day_start_balance == 0.0:
            self.last_reset_date = current_date
            self.day_start_balance = current_balance
            self.is_kill_switch_active = False
            logger.info(f"Daily Risk Metrics Reset. Starting Balance: ${self.day_start_balance:.2f}")

    def evaluate_pre_trade_risk(self, current_balance: float, current_equity: float, current_spread_pips: float, open_positions_count: int) -> tuple[bool, str]:
        self.check_daily_reset(current_balance)

        # 1. Kill-switch check
        if self.is_kill_switch_active:
            return False, "KILL_SWITCH_ACTIVE: Daily drawdown limit reached. Trading halted until next session."

        # 2. Daily Drawdown calculation
        daily_pnl = current_equity - self.day_start_balance
        daily_loss_pct = abs(min(0.0, daily_pnl)) / self.day_start_balance * 100.0

        if daily_loss_pct >= self.max_daily_drawdown_pct:
            self.is_kill_switch_active = True
            msg = f"EMERGENCY KILL SWITCH TRIGGERED: Daily loss {daily_loss_pct:.2f}% exceeded limit {self.max_daily_drawdown_pct:.1f}%."
            logger.critical(msg)
            return False, msg

        # 3. Maximum concurrent open positions
        if open_positions_count >= self.max_open_positions:
            return False, f"MAX_POSITIONS_REACHED: Currently {open_positions_count} open trades (Max allowed: {self.max_open_positions})."

        # 4. Spread filter
        if current_spread_pips > self.max_spread_pips:
            return False, f"HIGH_SPREAD_ALERT: Current spread {current_spread_pips:.1f} pips exceeds threshold {self.max_spread_pips:.1f} pips."

        return True, "RISK_APPROVED"

    def calculate_lot_size(self, balance: float, stop_loss_pips: float, symbol: str = "EURUSD") -> float:
        """
        Computes exact institutional lot size based on fixed fractional equity risk.
        Risk Amount = Balance * (Risk % / 100)
        Lot Size = Risk Amount / (SL Pips * Pip Value per Standard Lot)
        """
        if stop_loss_pips <= 0:
            return 0.01

        risk_amount = balance * (self.risk_per_trade_pct / 100.0)
        pip_value_standard_lot = 10.0  # Standard $10/pip for EUR/USD, GBP/USD

        if "JPY" in symbol:
            pip_value_standard_lot = 7.0
        elif "XAU" in symbol:
            pip_value_standard_lot = 1.0

        raw_lots = risk_amount / (stop_loss_pips * pip_value_standard_lot)
        rounded_lots = round(raw_lots, 2)
        final_lots = max(0.01, min(rounded_lots, 10.0))

        logger.info(f"Risk Calculation: Balance=${balance:.2f} | Risk={self.risk_per_trade_pct}% (${risk_amount:.2f}) | SL={stop_loss_pips:.1f} pips -> Lot Size={final_lots}")
        return final_lots
