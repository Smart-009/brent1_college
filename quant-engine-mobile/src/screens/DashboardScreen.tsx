import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { DashboardData } from '../types';
import { EquityChart } from '../components/EquityChart';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Flame, 
  PauseCircle, 
  PlayCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Globe2,
  ChevronRight,
  Sliders
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigateToPositions: () => void;
  onNavigateToBroker: () => void;
  onNavigateToTrade?: (symbol?: string) => void;
  currencyMode?: 'USD' | 'KES';
}

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  onNavigateToPositions, 
  onNavigateToBroker,
  onNavigateToTrade,
  currencyMode = 'USD'
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: 'XAUUSD', name: 'Gold Spot', price: 4149.60, change24h: 0.85, high24h: 4160.80, low24h: 4130.20 },
    { symbol: 'BTCUSD', name: 'Bitcoin', price: 80888.00, change24h: -1.24, high24h: 82400.00, low24h: 80100.00 },
    { symbol: 'EURUSD', name: 'Euro / USD', price: 1.1198, change24h: 0.12, high24h: 1.1215, low24h: 1.1170 },
    { symbol: 'GBPUSD', name: 'Pound / USD', price: 1.3214, change24h: 0.28, high24h: 1.3240, low24h: 1.3190 },
    { symbol: 'USDJPY', name: 'USD / Yen', price: 157.98, change24h: -0.05, high24h: 158.40, low24h: 157.60 },
  ]);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlistPrices = async () => {
    try {
      const updated = await Promise.all(
        watchlist.map(async (item) => {
          try {
            const c = await api.getCandles(item.symbol, '15m');
            if (c && c.current_price > 0) {
              const first = c.candles?.[0]?.open || c.current_price;
              const chg = ((c.current_price - first) / first) * 100;
              return {
                ...item,
                price: c.current_price,
                change24h: parseFloat(chg.toFixed(2)),
                high24h: c.high_24h,
                low24h: c.low_24h,
              };
            }
          } catch {
            // keep old
          }
          return item;
        })
      );
      setWatchlist(updated);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchWatchlistPrices();
    const interval = setInterval(() => {
      fetchDashboard();
      fetchWatchlistPrices();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePause = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      if (data.portfolio.trading_paused) {
        await api.resumeTrading();
      } else {
        await api.pauseTrading();
      }
      await fetchDashboard();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#848e9c]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0ecb81] border-t-transparent animate-spin mb-3"></div>
        <p className="text-xs font-mono tracking-wider text-slate-400">CONNECTING VOLT ENGINE...</p>
      </div>
    );
  }

  const p = data?.portfolio;
  const intel = data?.intelligence;
  const broker = data?.broker;

  const isGreen = (p?.daily_pnl_usd || 0) >= 0;
  const pnlDisplay = currencyMode === 'USD' 
    ? `${isGreen ? '+' : ''}$${p?.daily_pnl_usd.toFixed(2)}`
    : `${isGreen ? '+' : ''}KES ${(p?.daily_pnl_kes || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const equityDisplay = currencyMode === 'USD'
    ? `$${p?.equity_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : `KES ${(p?.equity_kes || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="px-3.5 py-3 pb-24 space-y-3.5 max-w-lg mx-auto">
      {/* ── 1. Binance Pro Hero Account Card ────────────────────────── */}
      <div className="pro-card rounded-2xl p-4.5 border border-white/[0.08] relative overflow-hidden shadow-2xl">
        {/* Subtle ambient lighting */}
        <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
          isGreen ? 'bg-[#0ecb81]/15' : 'bg-[#f6465d]/15'
        }`}></div>

        <div className="flex items-center justify-between text-xs text-[#848e9c] mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#848e9c]">
              Total Portfolio Equity
            </span>
            <button 
              onClick={() => setHideBalance(!hideBalance)}
              className="text-[#848e9c] hover:text-white transition p-0.5"
            >
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {broker?.connected ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0ecb81]/15 border border-[#0ecb81]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#0ecb81] tracking-tight font-mono">
                {broker.broker_name || 'MT5 LIVE'}
              </span>
            </div>
          ) : (
            <button
              onClick={onNavigateToBroker}
              className="text-[10px] font-bold text-[#f0b90b] bg-[#f0b90b]/15 border border-[#f0b90b]/30 px-2 py-0.5 rounded-full hover:bg-[#f0b90b]/25 transition flex items-center gap-1"
            >
              <span>+ Connect Broker</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Main Balance Display */}
        <div className="text-3xl font-black text-white tabular-nums tracking-tight mb-3">
          {hideBalance ? '••••••••' : equityDisplay}
        </div>

        {/* 24h PnL Banner & Open Trades */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#090d16]/90 border border-white/[0.05] mb-3">
          <div>
            <span className="text-[10px] font-semibold text-[#848e9c] uppercase tracking-wider block">
              Today's P&L
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isGreen ? (
                <ArrowUpRight className="w-4 h-4 text-[#0ecb81]" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-[#f6465d]" />
              )}
              <span className={`text-[15px] font-bold tabular-nums ${isGreen ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                {hideBalance ? '••••' : pnlDisplay}
              </span>
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                isGreen ? 'bg-[#0ecb81]/15 text-[#0ecb81]' : 'bg-[#f6465d]/15 text-[#f6465d]'
              }`}>
                {isGreen ? '+' : ''}{p?.daily_pnl_pct.toFixed(2)}%
              </span>
            </div>
          </div>

          <div 
            onClick={onNavigateToPositions}
            className="text-right flex flex-col justify-center cursor-pointer group"
          >
            <span className="text-[10px] font-semibold text-[#848e9c] uppercase tracking-wider block">
              Open Positions
            </span>
            <div className="text-[15px] font-bold text-white group-hover:text-[#0ecb81] transition mt-0.5 flex items-center justify-end gap-1">
              <span className="tabular-nums font-mono">{p?.open_positions_count || 0}</span>
              <span className="text-xs text-[#848e9c] font-normal">Active &rarr;</span>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center gap-2">
          {/* Bot State Toggle */}
          <button
            onClick={handleTogglePause}
            disabled={actionLoading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition active:scale-95 border ${
              p?.trading_paused
                ? 'bg-[#f0b90b]/15 border-[#f0b90b]/40 text-[#f0b90b]'
                : 'bg-[#0ecb81]/15 border-[#0ecb81]/40 text-[#0ecb81]'
            }`}
          >
            {p?.trading_paused ? (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Resume Auto-Pilot</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4" />
                <span>Auto-Pilot Running</span>
              </>
            )}
          </button>

          {/* Quick Trade Pad Trigger */}
          <button
            onClick={() => onNavigateToTrade && onNavigateToTrade('XAUUSD')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-[#121824] hover:bg-[#182030] text-white border border-white/[0.1] transition active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>Open Trade Pad</span>
          </button>
        </div>
      </div>

      {/* ── 2. Live Market Watchlist (Binance Pro Style) ─────────────── */}
      <div className="pro-card rounded-2xl p-3.5 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-ping"></span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Institutional Watchlist
            </h2>
          </div>
          <span className="text-[10px] text-[#848e9c] font-mono">Real Feeds</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {watchlist.map((item) => {
            const isItemGreen = item.change24h >= 0;
            const decimals = item.symbol.includes('JPY') || item.symbol === 'XAUUSD' || item.symbol === 'BTCUSD' ? 2 : 4;
            return (
              <div
                key={item.symbol}
                onClick={() => onNavigateToTrade && onNavigateToTrade(item.symbol)}
                className="py-2.5 px-2 flex items-center justify-between hover:bg-white/[0.03] rounded-xl transition cursor-pointer active:scale-98"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white font-sans">{item.symbol}</span>
                    <span className="text-[10px] text-[#848e9c]">{item.name}</span>
                  </div>
                  <div className="text-[10px] text-[#5e6673] font-mono mt-0.5">
                    H: {item.high24h.toFixed(decimals)} / L: {item.low24h.toFixed(decimals)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm text-white tabular-nums">
                    {item.price.toFixed(decimals)}
                  </div>
                  <div className="inline-block mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tabular-nums ${
                      isItemGreen 
                        ? 'bg-[#0ecb81]/15 text-[#0ecb81] border border-[#0ecb81]/25' 
                        : 'bg-[#f6465d]/15 text-[#f6465d] border border-[#f6465d]/25'
                    }`}>
                      {isItemGreen ? '+' : ''}{item.change24h}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Equity Curve Chart ────────────────────────────────────── */}
      <EquityChart
        currentEquity={p?.equity_usd || 10000}
        dailyPnl={p?.daily_pnl_usd || 0}
        dailyPnlPct={p?.daily_pnl_pct || 0}
      />

      {/* ── 4. Alpha Regime Sentinel HUD ────────────────────────────── */}
      <div className="pro-card rounded-2xl p-3.5 border border-white/[0.08]">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#0ecb81]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Quant Regime Sentinel
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#0ecb81] bg-[#0ecb81]/10 px-2 py-0.5 rounded border border-[#0ecb81]/20 font-bold">
            H = {intel?.hurst_exponent} ({intel?.hurst_label})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#090d16] p-2.5 rounded-xl border border-white/[0.05]">
            <span className="text-[9.5px] text-[#848e9c] uppercase font-semibold block">Market Session</span>
            <p className="font-bold text-white text-[11px] mt-0.5">{intel?.active_session}</p>
          </div>

          <div className="bg-[#090d16] p-2.5 rounded-xl border border-white/[0.05]">
            <span className="text-[9.5px] text-[#848e9c] uppercase font-semibold block">News Blackout</span>
            <p className="font-bold text-[#0ecb81] text-[11px] mt-0.5">
              {intel?.event_blackout ? '🔴 ACTIVE BLACKOUT' : '🟢 CLEAR TO TRADE'}
            </p>
          </div>

          <div className="col-span-2 bg-[#090d16] p-2.5 rounded-xl border border-white/[0.05] flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-[#848e9c] uppercase font-semibold block">Upcoming Macro Catalyst</span>
              <p className="text-white text-[11px] font-medium mt-0.5">{intel?.next_macro_event}</p>
            </div>
            <Clock className="w-4 h-4 text-[#848e9c]" />
          </div>
        </div>
      </div>

      {/* ── 5. Institutional Performance Metrics ────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="pro-card p-2.5 rounded-xl border border-white/[0.06] text-center">
          <span className="text-[9px] text-[#848e9c] uppercase font-bold block">Win Rate</span>
          <p className="text-sm font-extrabold text-[#0ecb81] tabular-nums mt-0.5">{p?.win_rate_pct}%</p>
        </div>
        <div className="pro-card p-2.5 rounded-xl border border-white/[0.06] text-center">
          <span className="text-[9px] text-[#848e9c] uppercase font-bold block">Profit Factor</span>
          <p className="text-sm font-extrabold text-white tabular-nums mt-0.5">{p?.profit_factor}</p>
        </div>
        <div className="pro-card p-2.5 rounded-xl border border-white/[0.06] text-center">
          <span className="text-[9px] text-[#848e9c] uppercase font-bold block">Sharpe Ratio</span>
          <p className="text-sm font-extrabold text-[#00f2fe] tabular-nums mt-0.5">{p?.sharpe_ratio}</p>
        </div>
      </div>
    </div>
  );
};
