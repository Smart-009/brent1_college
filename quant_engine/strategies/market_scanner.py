"""
strategies/market_scanner.py
============================
Cross-Market Relative Strength Scanner & Currency Strength Meter (CSM).

Responsibilities
----------------
1.  Relative Strength (RS) Scanner:
    Ranks symbols by (24h Momentum / Normalized ATR Volatility).
    Ensures trade capital is dynamically allocated to the cleanest trending
    movers rather than static alphabetical order.

2.  Currency Strength Meter (CSM):
    Deconstructs all available currency pairs into individual currency scores
    (USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD).
    Pairs the strongest currency against the weakest currency for maximum edge.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from loguru import logger


@dataclass
class ScoredSymbol:
    """Symbol ranking container."""
    symbol: str
    asset_class: str
    momentum_score: float     # Higher = stronger trending momentum
    volatility_ratio: float   # Current ATR vs baseline
    rank: int = 0


class MarketScanner:
    """
    Ranks symbols dynamically across Crypto, Forex, and Equities.
    """

    MAJOR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"]

    def __init__(self, config: dict) -> None:
        self._cfg = config.get("alpha_engine", {}).get("scanner", {})
        self.enabled: bool = self._cfg.get("enabled", True)
        self._top_n: int = self._cfg.get("top_n_candidates", 3)
        self._lookback: int = self._cfg.get("lookback_bars", 20)

    def rank_symbols(
        self,
        symbol_data_map: Dict[str, pd.DataFrame],
        asset_class: str,
    ) -> List[str]:
        """
        Rank a dictionary of symbol DataFrames by momentum & efficiency.

        Parameters
        ----------
        symbol_data_map : dict[symbol -> DataFrame with 'close', 'high', 'low']
        asset_class : "crypto" | "forex" | "stocks_us"

        Returns
        -------
        List of symbol strings sorted from highest priority to lowest.
        """
        if not self.enabled or not symbol_data_map:
            return list(symbol_data_map.keys())

        # For forex, if multiple pairs are provided, we can also use CSM
        if asset_class == "forex" and len(symbol_data_map) >= 4:
            return self._rank_forex_pairs(symbol_data_map)

        scores: List[ScoredSymbol] = []

        for sym, df in symbol_data_map.items():
            if len(df) < self._lookback:
                continue

            try:
                closes = df["close"].values
                highs = df["high"].values
                lows = df["low"].values

                # Return over lookback period
                ret = (closes[-1] - closes[-self._lookback]) / closes[-self._lookback]
                abs_ret = abs(ret)

                # Volatility over lookback (ATR proxy: average range)
                ranges = highs[-self._lookback:] - lows[-self._lookback:]
                avg_range = np.mean(ranges) if len(ranges) > 0 else 1.0
                rel_vol = avg_range / closes[-1] if closes[-1] > 0 else 1.0

                # Score = Momentum / Volatility ratio (Sharpe-like ranking)
                score = (abs_ret / (rel_vol + 1e-6))

                scores.append(ScoredSymbol(
                    symbol=sym,
                    asset_class=asset_class,
                    momentum_score=float(score),
                    volatility_ratio=float(rel_vol),
                ))
            except Exception as e:
                logger.debug(f"[MarketScanner] Error scoring {sym}: {e}")

        # Sort descending by momentum score
        scores.sort(key=lambda s: s.momentum_score, reverse=True)
        ranked = [s.symbol for s in scores]

        # Append any unranked symbols to the tail
        for sym in symbol_data_map.keys():
            if sym not in ranked:
                ranked.append(sym)

        return ranked

    def calculate_currency_strength(
        self,
        forex_data_map: Dict[str, pd.DataFrame],
    ) -> Dict[str, float]:
        """
        Calculates aggregate relative strength for individual currencies.
        Returns a dict e.g. {"USD": 1.4, "EUR": -0.8, "GBP": 2.1, ...}
        """
        strength_scores: Dict[str, float] = {curr: 0.0 for curr in self.MAJOR_CURRENCIES}
        pair_counts: Dict[str, int] = {curr: 0 for curr in self.MAJOR_CURRENCIES}

        for sym, df in forex_data_map.items():
            clean_sym = sym.replace("/", "").replace("_", "").upper()
            if len(clean_sym) != 6 or len(df) < self._lookback:
                continue

            base = clean_sym[:3]
            quote = clean_sym[3:]

            if base in strength_scores and quote in strength_scores:
                closes = df["close"].values
                pct_change = (closes[-1] - closes[-self._lookback]) / closes[-self._lookback]

                # Base currency gained pct_change; quote lost pct_change
                strength_scores[base] += pct_change * 100.0
                strength_scores[quote] -= pct_change * 100.0
                pair_counts[base] += 1
                pair_counts[quote] += 1

        # Normalize by count
        for curr in self.MAJOR_CURRENCIES:
            if pair_counts[curr] > 0:
                strength_scores[curr] = round(strength_scores[curr] / pair_counts[curr], 3)

        return strength_scores

    def _rank_forex_pairs(
        self,
        forex_data_map: Dict[str, pd.DataFrame],
    ) -> List[str]:
        """Rank Forex pairs by divergence between base & quote currency strength."""
        csm = self.calculate_currency_strength(forex_data_map)
        pair_divergence: List[tuple[str, float]] = []

        for sym in forex_data_map.keys():
            clean_sym = sym.replace("/", "").replace("_", "").upper()
            if len(clean_sym) == 6:
                base = clean_sym[:3]
                quote = clean_sym[3:]
                # Divergence = |Strength(Base) - Strength(Quote)|
                div = abs(csm.get(base, 0.0) - csm.get(quote, 0.0))
                pair_divergence.append((sym, div))
            else:
                pair_divergence.append((sym, 0.0))

        pair_divergence.sort(key=lambda x: x[1], reverse=True)
        return [p[0] for p in pair_divergence]
