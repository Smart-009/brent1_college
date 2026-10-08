import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TradeHistoryItem } from '../types';
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';

interface HistoryScreenProps {
  onBack?: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.getTradeHistory();
      setTrades(res.trades || []);
    } catch (err) {
      console.error('Failed to fetch trade history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalPnL = trades.reduce((acc, t) => acc + t.pnl_usd, 0);
  const winningTrades = trades.filter((t) => t.pnl_usd > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;

  return (
    <div className="px-4 py-4 pb-28 space-y-4 max-w-lg mx-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-800/50"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to Dashboard</span>
        </button>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Audit History & Realized Alpha</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable SQLite transaction log from cloud execution
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Realized Performance Overview */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 grid grid-cols-3 gap-2 text-center">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Trades</span>
          <p className="text-sm font-bold text-white font-mono mt-0.5">{trades.length}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</span>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{winRate.toFixed(1)}%</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Alpha</span>
          <p className={`text-sm font-bold font-mono mt-0.5 ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Trade Rows */}
      <div className="space-y-2.5">
        {trades.map((t) => {
          const isGreen = t.pnl_usd >= 0;
          return (
            <div
              key={t.trade_id}
              className="glass-panel rounded-xl p-3.5 border border-slate-800/90 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isGreen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {isGreen ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white font-mono">{t.symbol}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-semibold">
                      {t.direction}
                    </span>
                    <span className="text-[10px] text-slate-400">({t.lots} lots)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>{t.reason}</span>
                    <span>•</span>
                    <span>{t.closed_at}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-xs font-bold font-mono-numbers ${isGreen ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isGreen ? '+' : ''}${t.pnl_usd.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono-numbers">
                  {isGreen ? '+' : ''}KES {t.pnl_kes.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
