import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { RadarData, LeadLagPair, LiquidityPoolItem } from '../types';
import {
  Compass,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
  Sparkles,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export const RadarScreen: React.FC = () => {
  const [radar, setRadar] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'lead_lag' | 'liquidity'>('lead_lag');

  const fetchRadar = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await api.getRadarOverview();
      setRadar(data);
    } catch (err) {
      console.error('Failed to load radar data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRadar();
    const interval = setInterval(() => fetchRadar(), 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !radar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
        <p className="text-xs font-mono tracking-wider">CALIBRATING INTERMARKET RADAR...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24 text-slate-100">
      {/* Institutional Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0e1628] to-[#0a1120] border border-cyan-500/30 p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">ALPHA RADAR</h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  INSTITUTIONAL
                </span>
              </div>
              <p className="text-[10px] text-cyan-300 font-mono">Cross-Market Lead-Lag & Liquidity Traps</p>
            </div>
          </div>

          <button
            onClick={() => fetchRadar(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Core Statistical Edge Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80">
          <div className="bg-[#070b14]/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
              Win Probability
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono-numbers">
              {radar?.institutional_win_probability || '71.4%'}
            </span>
          </div>

          <div className="bg-[#070b14]/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
              Target R:R
            </span>
            <span className="text-xs font-bold text-cyan-400 font-mono-numbers">
              {radar?.average_rrr || '1:3.4'}
            </span>
          </div>

          <div className="bg-[#070b14]/70 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
              Latency Window
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono-numbers flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> 15-45s
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-[#0a0f1d] p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('lead_lag')}
          className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'lead_lag'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Lead-Lag Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('liquidity')}
          className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'liquidity'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Liquidity Sweeps</span>
        </button>
      </div>

      {/* TAB 1: LEAD-LAG MATRIX */}
      {activeTab === 'lead_lag' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Intermarket Asymmetry Feeds
            </span>
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Order Flow Feed
            </span>
          </div>

          {radar?.lead_lag.map((pair, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 rounded-2xl border border-slate-800/90 bg-[#0a0f1d]/85 shadow-lg space-y-3"
            >
              {/* Pair Headers */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-cyan-300 font-mono font-bold text-xs border border-slate-700">
                    {pair.lead_symbol}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/20">
                    {pair.lag_symbol}
                  </span>
                </div>

                {pair.divergence_detected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                    IMPULSE ACTIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-800">
                    Equilibrium
                  </span>
                )}
              </div>

              {/* Rationale & Signal */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{pair.rationale}</p>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono-numbers">
                <div className="bg-[#070b14] p-1.5 rounded-lg border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 block">Lead Velocity</span>
                  <span
                    className={`text-xs font-bold ${
                      pair.lead_impulse_zscore < 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {pair.lead_impulse_zscore > 0 ? `+${pair.lead_impulse_zscore}` : pair.lead_impulse_zscore}σ
                  </span>
                </div>

                <div className="bg-[#070b14] p-1.5 rounded-lg border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 block">Look-Ahead</span>
                  <span className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {pair.estimated_latency_window_sec}s
                  </span>
                </div>

                <div className="bg-[#070b14] p-1.5 rounded-lg border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 block">Predicted</span>
                  <span
                    className={`text-xs font-black ${
                      pair.predicted_direction === 'BUY'
                        ? 'text-emerald-400'
                        : pair.predicted_direction === 'SELL'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {pair.predicted_direction}
                  </span>
                </div>

                <div className="bg-[#070b14] p-1.5 rounded-lg border border-slate-800/60">
                  <span className="text-[9px] text-slate-500 block">Target Move</span>
                  <span className="text-xs font-bold text-slate-200">+{pair.target_move_pips}p</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIQUIDITY SWEEPS */}
      {activeTab === 'liquidity' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Institutional Stop-Hunt Traps
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Smart Money Concepts</span>
          </div>

          {radar?.liquidity.map((pool, idx) => (
            <div
              key={idx}
              className={`glass-panel p-4 rounded-2xl border bg-[#0a0f1d]/85 shadow-lg space-y-3 ${
                pool.status === 'SWEPT_AND_REJECTED'
                  ? 'border-emerald-500/40 shadow-emerald-500/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                    {pool.symbol}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{pool.pool_type}</span>
                </div>

                {pool.status === 'SWEPT_AND_REJECTED' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    SWEPT & RECLAIMED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    AWAITING SWEEP
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">{pool.description}</p>

              {/* Execution Details if Swept */}
              {pool.entry_price && (
                <div className="p-2.5 rounded-xl bg-[#070b14] border border-slate-800 grid grid-cols-4 gap-2 text-center font-mono-numbers">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Entry</span>
                    <span className="text-xs font-bold text-white">{pool.entry_price}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Tight SL</span>
                    <span className="text-xs font-bold text-rose-400">{pool.stop_loss}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">TP Target</span>
                    <span className="text-xs font-bold text-emerald-400">{pool.take_profit}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Risk:Reward</span>
                    <span className="text-xs font-black text-cyan-400">1:{pool.risk_reward}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Autonomous Notice Footer */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Autonomous Execution Engaged:</strong> When a cross-asset divergence reaches{' '}
          <span className="font-mono text-cyan-300">&gt; 1.65σ</span> or an institutional liquidity sweep rejects,
          the engine fires the order automatically into your MT5 broker account.
        </p>
      </div>
    </div>
  );
};
