"""
Éclat Institute - MetaTrader 5 Client Interface Wrapper
Encapsulates account connection, order execution, tick streaming, and position tracking.
"""

import logging
from datetime import datetime
import pandas as pd
import numpy as np

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MT5Interface")


class MT5Interface:
    def __init__(self, login: int, password: str, server: str, path: str = None):
        self.login = login
        self.password = password
        self.server = server
        self.path = path
        self.is_connected = False

    def connect(self) -> bool:
        if not MT5_AVAILABLE:
            logger.error("MetaTrader5 package is not installed. Run 'pip install MetaTrader5'.")
            return False

        init_params = {"server": self.server}
        if self.path:
            init_params["path"] = self.path

        if not mt5.initialize(**init_params):
            logger.error(f"MT5 initialization failed: {mt5.last_error()}")
            return False

        if self.login > 0:
            authorized = mt5.login(self.login, password=self.password, server=self.server)
            if not authorized:
                logger.error(f"MT5 login failed for account {self.login}: {mt5.last_error()}")
                mt5.shutdown()
                return False

        account_info = mt5.account_info()
        if account_info is None:
            logger.error(f"Failed to fetch account info: {mt5.last_error()}")
            return False

        self.is_connected = True
        logger.info(f"Connected to MT5 Account: {account_info.login} | Currency: {account_info.currency} | Balance: {account_info.balance:.2f} | Equity: {account_info.equity:.2f}")
        return True

    def disconnect(self):
        if MT5_AVAILABLE and self.is_connected:
            mt5.shutdown()
            self.is_connected = False
            logger.info("MT5 disconnected safely.")

    def get_account_summary(self) -> dict:
        if not self.is_connected:
            return {"balance": 10000.0, "equity": 10000.0, "profit": 0.0, "margin": 0.0, "free_margin": 10000.0}
        acc = mt5.account_info()
        return {
            "login": acc.login,
            "balance": acc.balance,
            "equity": acc.equity,
            "profit": acc.profit,
            "margin": acc.margin,
            "free_margin": acc.margin_free,
            "leverage": acc.leverage,
        }

    def get_timeframe_constant(self, tf_str: str):
        if not MT5_AVAILABLE:
            return None
        mapping = {
            "M1": mt5.TIMEFRAME_M1,
            "M5": mt5.TIMEFRAME_M5,
            "M15": mt5.TIMEFRAME_M15,
            "M30": mt5.TIMEFRAME_M30,
            "H1": mt5.TIMEFRAME_H1,
            "H4": mt5.TIMEFRAME_H4,
            "D1": mt5.TIMEFRAME_D1,
        }
        return mapping.get(tf_str.upper(), mt5.TIMEFRAME_M15)

    def fetch_ohlcv(self, symbol: str, timeframe_str: str, num_bars: int = 200) -> pd.DataFrame:
        if not self.is_connected:
            logger.warning("Simulating OHLCV because MT5 is not connected.")
            return self._generate_simulated_ohlcv(symbol, num_bars)

        tf = self.get_timeframe_constant(timeframe_str)
        rates = mt5.copy_rates_from_pos(symbol, tf, 0, num_bars)
        if rates is None or len(rates) == 0:
            logger.error(f"Failed to fetch rates for {symbol}: {mt5.last_error()}")
            return pd.DataFrame()

        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        return df[['time', 'open', 'high', 'low', 'close', 'tick_volume']]

    def get_symbol_info(self, symbol: str):
        if not self.is_connected:
            return {"point": 0.00001, "digits": 5, "spread": 0.00012, "ask": 1.08500, "bid": 1.08488}
        info = mt5.symbol_info(symbol)
        if info is None:
            return None
        return {
            "point": info.point,
            "digits": info.digits,
            "spread": info.spread * info.point,
            "ask": info.ask,
            "bid": info.bid,
        }

    def place_market_order(self, symbol: str, action: str, volume: float, sl_price: float, tp_price: float, magic: int = 260901) -> dict:
        if not self.is_connected:
            logger.info(f"[SIMULATED ORDER] {action} {volume} lots of {symbol} | SL: {sl_price:.5f} | TP: {tp_price:.5f}")
            return {"retcode": 0, "order": 999999, "comment": "Simulated Success"}

        symbol_info = mt5.symbol_info(symbol)
        if not symbol_info.visible:
            mt5.symbol_select(symbol, True)

        order_type = mt5.ORDER_TYPE_BUY if action.upper() == "BUY" else mt5.ORDER_TYPE_SELL
        price = symbol_info.ask if action.upper() == "BUY" else symbol_info.bid

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": float(volume),
            "type": order_type,
            "price": price,
            "sl": float(sl_price),
            "tp": float(tp_price),
            "deviation": 20,
            "magic": magic,
            "comment": "Eclat-Quant-Bot",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request)
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            logger.error(f"Order failed! Retcode: {result.retcode} | Comment: {result.comment}")
            return {"retcode": result.retcode, "comment": result.comment}

        logger.info(f"Order EXECUTED successfully! Ticket #{result.order} | Price: {result.price} | Volume: {result.volume}")
        return {"retcode": result.retcode, "order": result.order, "price": result.price}

    def close_position(self, ticket: int) -> bool:
        if not self.is_connected:
            logger.info(f"[SIMULATED CLOSE] Position #{ticket} closed.")
            return True

        position = mt5.positions_get(ticket=ticket)
        if not position:
            logger.warning(f"Position #{ticket} not found.")
            return False

        pos = position[0]
        order_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
        price = mt5.symbol_info_tick(pos.symbol).bid if pos.type == mt5.ORDER_TYPE_BUY else mt5.symbol_info_tick(pos.symbol).ask

        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "position": pos.ticket,
            "symbol": pos.symbol,
            "volume": pos.volume,
            "type": order_type,
            "price": price,
            "deviation": 20,
            "magic": pos.magic,
            "comment": "Eclat-Close",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        res = mt5.order_send(request)
        return res.retcode == mt5.TRADE_RETCODE_DONE

    def get_open_positions(self, magic: int = 260901) -> list:
        if not self.is_connected:
            return []
        positions = mt5.positions_get()
        if not positions:
            return []
        return [p._asdict() for p in positions if p.magic == magic]

    def _generate_simulated_ohlcv(self, symbol: str, num_bars: int = 200) -> pd.DataFrame:
        base_price = 1.0850 if "EUR" in symbol else 1.2750 if "GBP" in symbol else 2350.0 if "XAU" in symbol else 65000.0
        dates = pd.date_range(end=datetime.utcnow(), periods=num_bars, freq="15min")
        returns = np.random.normal(0, 0.001, num_bars)
        price_series = base_price * np.exp(np.cumsum(returns))
        
        highs = price_series * (1 + np.abs(np.random.normal(0, 0.0005, num_bars)))
        lows = price_series * (1 - np.abs(np.random.normal(0, 0.0005, num_bars)))
        opens = price_series * (1 + np.random.normal(0, 0.0002, num_bars))
        volumes = np.random.randint(50, 500, num_bars)

        return pd.DataFrame({
            "time": dates,
            "open": opens,
            "high": highs,
            "low": lows,
            "close": price_series,
            "tick_volume": volumes,
        })
