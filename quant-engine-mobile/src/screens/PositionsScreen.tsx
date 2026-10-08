import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Position } from '../types';
import { 
  Layers, 
  ShieldCheck, 
  Flame, 
  RefreshCw, 
  X, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Sliders,
  Lock
} from 'lucide-react';

export const PositionsScreen: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      const res = await api.getPositions();
      setPositions(res.positions || []);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleClose = async (positionId: string) => {
    if (!confirm(`Execute immediate market exit for #${positionId}?`)) return;
    setClosingId(positionId);
    try {
      await api.closePosition(positionId);
      await fetchPositions();
    } catch (err: any) {
      alert(`Close failed: ${err.message}`);
    } finally {
      setClosingId(null);
    }
  };

  const totalUnrealized = positions.reduce((acc, p) => acc + (p.unrealized_pnl || 0), 0);
  const isTotalGreen = totalUnrealized >= 0;

  return (
    <div className="px-3.5 py-3 pb-24 space-y-3.5 max-w-lg mx-auto">
      {/* ── Top Header with Total Unrealized P&L ───────────────────── */}
      <div className="pro-card rounded-2xl p-3.5 border border-white/[0.08] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0ecb81]" />
            <h2 className="text-sm font-black text-white uppercase tracking-tight">
              Active Positions ({positions.length})
            </h2>
          </div>
          <span className="text-[10px] text-[#848e9c] block mt-0.5">
            Synthetic Stop-Loss & Dynamic Ratchet Trailing
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold text-[#848e9c] uppercase block">Net P&L</span>
          <span className={`text-base font-black tabular-nums ${isTotalGreen ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
            {isTotalGreen ? '+' : ''}${totalUnrealized.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Positions List ─────────────────────────────────────────── */}
      {positions.length === 0 ? (
        <div className="pro-card rounded-2xl p-8 border border-white/[0.08] text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#121824] border border-white/[0.08] flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6 text-[#5e6673]" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No Active Positions</h3>
          <p className="text-xs text-[#848e9c] max-w-xs mx-auto leading-relaxed">
            The quantitative engine is actively scanning order flow for high-confluence institutional liquidity sweeps.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((pos) => {
            const isBuy = pos.type.toLowerCase() === 'buy';
            const isGreen = (pos.unrealized_pnl || 0) >= 0;
            const decimals = pos.symbol.includes('JPY') || pos.symbol.includes('XAU') || pos.symbol.includes('BTC') ? 2 : 5;

            // Estimated ROE percentage based on 1% margin
            const estMargin = (pos.open_price * pos.volume * 1000) / 100;
            const roePct = estMargin > 0 ? (pos.unrealized_pnl / estMargin) * 100 : 0;

            return (
              <div
                key={pos.position_id}
                className="pro-card rounded-2xl p-4 border border-white/[0.08] relative overflow-hidden space-y-3"
              >
                {/* Position Title Bar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-0.5 ${
                      isBuy
                        ? 'bg-[#0ecb81]/15 text-[#0ecb81] border border-[#0ecb81]/30'
                        : 'bg-[#f6465d]/15 text-[#f6465d] border border-[#f6465d]/30'
                    }`}>
                      {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {pos.type.toUpperCase()}
                    </span>

                    <span className="font-extrabold text-sm text-white font-sans">{pos.symbol}</span>
                    <span className="text-[11px] font-mono font-bold text-[#848e9c]">
                      {pos.volume} Lots
                    </span>
                  </div>

                  {/* P&L Badge */}
                  <div className="text-right">
                    <div className={`text-base font-black tabular-nums ${isGreen ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                      {isGreen ? '+' : ''}${pos.unrealized_pnl.toFixed(2)}
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded tabular-nums ${
                      isGreen ? 'bg-[#0ecb81]/15 text-[#0ecb81]' : 'bg-[#f6465d]/15 text-[#f6465d]'
                    }`}>
                      {isGreen ? '+' : ''}{roePct.toFixed(2)}% ROE
                    </span>
                  </div>
                </div>

                {/* Trailing Stage / Risk-Free Banner */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {pos.risk_free && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0ecb81]/15 text-[#0ecb81] border border-[#0ecb81]/30 text-[9.5px] font-bold">
                      <ShieldCheck className="w-3 h-3 text-[#0ecb81]" />
                      <span>100% Risk-Free (Floor Locked)</span>
                    </span>
                  )}
                  {pos.trailing_active && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f0b90b]/15 text-[#f0b90b] border border-[#f0b90b]/30 text-[9.5px] font-bold">
                      <Flame className="w-3 h-3 text-[#f0b90b]" />
                      <span>{pos.stage || 'Trailing Ratchet Stage 2'}</span>
                    </span>
                  )}
                </div>

                {/* Price Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#090d16] p-2.5 rounded-xl border border-white/[0.05]">
                  <div>
                    <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Entry Price</span>
                    <p className="font-mono text-white text-[11px] mt-0.5 tabular-nums">{pos.open_price.toFixed(decimals)}</p>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Mark Price</span>
                    <p className="font-mono text-white text-[11px] mt-0.5 tabular-nums">{pos.current_price.toFixed(decimals)}</p>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Stop Loss (SL)</span>
                    <p className="font-mono text-[#f6465d] text-[11px] mt-0.5 tabular-nums">{pos.stop_loss.toFixed(decimals)}</p>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Take Profit (TP)</span>
                    <p className="font-mono text-[#0ecb81] text-[11px] mt-0.5 tabular-nums">{pos.take_profit.toFixed(decimals)}</p>
                  </div>
                </div>

                {/* Market Exit Action */}
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                  <span className="text-[10px] text-[#5e6673] font-mono">#{pos.position_id}</span>
                  <button
                    onClick={() => handleClose(pos.position_id)}
                    disabled={closingId === pos.position_id}
                    className="px-3.5 py-1.5 rounded-xl bg-[#f6465d]/15 hover:bg-[#f6465d]/25 text-[#f6465d] border border-[#f6465d]/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{closingId === pos.position_id ? 'Closing...' : 'Market Close'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
