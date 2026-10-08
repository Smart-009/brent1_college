import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { RiskSettings } from '../types';
import { SlidersHorizontal, ShieldAlert, CheckCircle2, Save, Info, RefreshCw } from 'lucide-react';

interface RiskSettingsScreenProps {
  onNavigateToBroker?: () => void;
  onNavigateToHistory?: () => void;
}

export const RiskSettingsScreen: React.FC<RiskSettingsScreenProps> = ({ onNavigateToBroker, onNavigateToHistory }) => {
  const [settings, setSettings] = useState<RiskSettings>({
    max_risk_pct: 1.0,
    max_daily_loss_pct: 3.0,
    half_kelly: true,
    leverage_forex: 2,
    leverage_crypto: 3,
    trailing_stop_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await api.getRiskSettings();
        if (s) setSettings(s);
      } catch (err) {
        console.error('Failed to load risk settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateRiskSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 pb-28 space-y-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
          <span>Institutional Risk Governance</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Survival-first mathematical boundaries protecting account equity
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Risk Per Trade */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-white">Max Risk Per Trade</span>
              <p className="text-[11px] text-slate-400">Fixed percentage of total account equity</p>
            </div>
            <span className="text-sm font-bold font-mono text-emerald-400">
              {settings.max_risk_pct.toFixed(1)}%
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.1"
            value={settings.max_risk_pct}
            onChange={(e) => setSettings({ ...settings, max_risk_pct: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0.2% (Ultra-safe)</span>
            <span>1.0% (Standard)</span>
            <span>3.0% (Aggressive)</span>
          </div>
        </div>

        {/* Daily Circuit Breaker */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Daily Loss Circuit Breaker</span>
              </span>
              <p className="text-[11px] text-slate-400">Auto-halts bot & closes trades if reached</p>
            </div>
            <span className="text-sm font-bold font-mono text-rose-400">
              -{settings.max_daily_loss_pct.toFixed(1)}%
            </span>
          </div>

          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.5"
            value={settings.max_daily_loss_pct}
            onChange={(e) => setSettings({ ...settings, max_daily_loss_pct: parseFloat(e.target.value) })}
            className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>-1.0%</span>
            <span>-3.0% (Recommended)</span>
            <span>-5.0%</span>
          </div>
        </div>

        {/* Half-Kelly Sizing Toggle */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white">Half-Kelly Criterion</span>
            <p className="text-[11px] text-slate-400 max-w-[240px]">
              Scales sizing up when empirical win rate is hot, throttles size during drawdowns
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, half_kelly: !settings.half_kelly })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.half_kelly ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.half_kelly ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            ></span>
          </button>
        </div>

        {/* Trailing Stop Engine Toggle */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white">Chandelier Trailing Engine</span>
            <p className="text-[11px] text-slate-400 max-w-[240px]">
              Banks 50% profit at 2×ATR, moves SL to risk-free, and trails runners
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, trailing_stop_enabled: !settings.trailing_stop_enabled })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.trailing_stop_enabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.trailing_stop_enabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            ></span>
          </button>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Risk Gates Updated</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Apply Gates</span>
            </>
          )}
        </button>
      </form>

      {/* Cloud Connectors & Audit Navigation */}
      <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
        {onNavigateToBroker && (
          <button
            type="button"
            onClick={onNavigateToBroker}
            className="p-3 rounded-xl bg-[#090d1a] border border-slate-800 hover:border-slate-700 text-left transition"
          >
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">Cloud Gateway</span>
            <span className="font-semibold text-white text-xs mt-0.5 block">🔗 MT5 Broker</span>
          </button>
        )}

        {onNavigateToHistory && (
          <button
            type="button"
            onClick={onNavigateToHistory}
            className="p-3 rounded-xl bg-[#090d1a] border border-slate-800 hover:border-slate-700 text-left transition"
          >
            <span className="text-[10px] text-cyan-400 uppercase font-bold block">Performance</span>
            <span className="font-semibold text-white text-xs mt-0.5 block">📊 Trade History</span>
          </button>
        )}
      </div>
    </div>
  );
};

