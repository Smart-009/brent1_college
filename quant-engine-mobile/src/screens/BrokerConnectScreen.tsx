import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MT5AccountStatus } from '../types';
import { 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Server, 
  Building2, 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  Lock,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface BrokerConnectScreenProps {
  onBack?: () => void;
}

export const BrokerConnectScreen: React.FC<BrokerConnectScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'mt5' | 'crypto'>('mt5');
  const [brokerStatus, setBrokerStatus] = useState<MT5AccountStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [brokerName, setBrokerName] = useState('Exness');
  const [server, setServer] = useState('Exness-Real10');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  // Popular Broker presets
  const brokerPresets = [
    { name: 'Exness', defaultServer: 'Exness-Real10', tag: 'Fast Execution (Recommended)' },
    { name: 'IC Markets', defaultServer: 'ICMarketsSC-Live', tag: 'Raw Spread ECN' },
    { name: 'FTMO', defaultServer: 'FTMO-Server', tag: 'Prop Firm Funded' },
    { name: 'Pepperstone', defaultServer: 'Pepperstone-Live01', tag: 'Razor Spread' },
    { name: 'XM Global', defaultServer: 'XMGlobal-Real', tag: 'Ultra Low Spread' },
    { name: 'Deriv', defaultServer: 'Deriv-Server', tag: 'Synthetics & FX' },
    { name: 'Custom MT5 Broker', defaultServer: '', tag: 'Any MT5 Broker' },
  ];

  const fetchStatus = async () => {
    setFetching(true);
    try {
      const status = await api.getMT5Status();
      if (status && status.connected) {
        setBrokerStatus(status);
      }
    } catch {
      // not connected yet
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleBrokerSelect = (preset: { name: string; defaultServer: string }) => {
    setBrokerName(preset.name);
    setServer(preset.defaultServer);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password || !server) {
      setMessage({ text: 'Please fill in account login ID, password, and MT5 server.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await api.connectMT5({
        broker_name: brokerName,
        server,
        login,
        password,
      });
      setBrokerStatus(res);
      setMessage({ 
        text: `Connected successfully to ${brokerName} (${res.account_id}) via Cloud Gateway!`, 
        type: 'success' 
      });
    } catch (err: any) {
      setMessage({ 
        text: err.message || 'Failed to authenticate MT5 credentials. Verify account number and server.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-3.5 py-3 pb-24 max-w-lg mx-auto space-y-3.5">
      {/* ── Top Bar / Back Button ──────────────────────────────────── */}
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#848e9c] hover:text-white transition-colors mb-2 px-2 py-1 -ml-1 rounded-lg hover:bg-white/[0.04]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0ecb81]" />
            <span>Back to Cockpit</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0ecb81]/15 border border-[#0ecb81]/30 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-[#0ecb81]" />
          </div>
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">
              Broker Gateway
            </h2>
            <p className="text-[10px] text-[#848e9c]">
              Link your live trading account. Autonomous cloud execution with zero local software.
            </p>
          </div>
        </div>
      </div>

      {/* ── Connected Account Live Status Card ─────────────────────── */}
      {brokerStatus && brokerStatus.connected && (
        <div className="pro-card rounded-2xl p-4 border border-[#0ecb81]/40 shadow-xl glow-green space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0ecb81] animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-wider text-[#0ecb81]">
                Cloud Gateway Synchronized
              </span>
            </div>
            <button
              onClick={fetchStatus}
              className="text-[#848e9c] hover:text-white p-1 rounded-lg"
              title="Refresh Account Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin text-[#0ecb81]' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-[#090d16] p-2.5 rounded-xl border border-white/[0.05]">
            <div>
              <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Broker</span>
              <p className="text-xs font-black text-white mt-0.5">{brokerStatus.broker}</p>
            </div>
            <div>
              <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Server</span>
              <p className="text-xs font-mono text-[#00f2fe] mt-0.5">{brokerStatus.server}</p>
            </div>
            <div>
              <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Account Login ID</span>
              <p className="text-xs font-mono font-bold text-white mt-0.5">{brokerStatus.account_id}</p>
            </div>
            <div>
              <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Leverage</span>
              <p className="text-xs font-mono text-[#0ecb81] mt-0.5">1:{brokerStatus.leverage}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Real Equity</span>
              <p className="text-lg font-black text-white tabular-nums">
                ${brokerStatus.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9.5px] text-[#848e9c] uppercase font-bold block">Free Margin</span>
              <p className="text-xs font-bold text-[#0ecb81] tabular-nums mt-0.5">
                ${brokerStatus.free_margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Broker Type Switcher (MT5 vs Crypto) ────────────────────── */}
      <div className="flex bg-[#090d16] p-1 rounded-xl border border-white/[0.06]">
        <button
          onClick={() => setActiveTab('mt5')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition active:scale-95 ${
            activeTab === 'mt5' 
              ? 'bg-[#0ecb81] text-black shadow-md' 
              : 'text-[#848e9c] hover:text-white'
          }`}
        >
          MetaTrader 5 (Exness / Gold / FX)
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition active:scale-95 ${
            activeTab === 'crypto' 
              ? 'bg-[#f0b90b] text-black shadow-md' 
              : 'text-[#848e9c] hover:text-white'
          }`}
        >
          Crypto Exchange (Binance / Bybit)
        </button>
      </div>

      {/* ── MT5 Connector Form ──────────────────────────────────────── */}
      {activeTab === 'mt5' ? (
        <div className="pro-card rounded-2xl p-4 border border-white/[0.08] shadow-2xl space-y-3.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0ecb81]" />
            <h3 className="text-sm font-extrabold text-white">Auto-Link MT5 Broker Account</h3>
          </div>

          {/* Quick Presets Carousel */}
          <div>
            <label className="block text-[10px] font-bold text-[#848e9c] uppercase tracking-wider mb-1.5">
              Select Your Broker
            </label>
            <div className="grid grid-cols-2 gap-2">
              {brokerPresets.map((preset) => {
                const isSelected = brokerName === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleBrokerSelect(preset)}
                    className={`p-2.5 rounded-xl text-left border transition active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0ecb81]/15 border-[#0ecb81]/40 text-[#0ecb81]'
                        : 'bg-[#090d16] border-white/[0.06] text-[#848e9c] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#848e9c]'}`}>
                        {preset.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0ecb81] shrink-0" />}
                    </div>
                    <span className="text-[9px] text-[#5e6673] font-mono mt-1">{preset.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
              message.type === 'success'
                ? 'bg-[#0ecb81]/15 border border-[#0ecb81]/30 text-[#0ecb81]'
                : 'bg-[#f6465d]/15 border border-[#f6465d]/30 text-[#f6465d]'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#0ecb81]" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#f6465d]" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Connection Form */}
          <form onSubmit={handleConnect} className="space-y-3 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-[#848e9c] uppercase tracking-wider mb-1">
                Broker Server Name
              </label>
              <div className="relative">
                <Server className="w-4 h-4 text-[#5e6673] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  placeholder="e.g. Exness-Real10"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#5e6673] font-mono focus:outline-none focus:border-[#0ecb81]"
                />
              </div>
              <span className="text-[9.5px] text-[#5e6673] mt-0.5 block">
                Found on your Exness/broker dashboard under Account Details.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#848e9c] uppercase tracking-wider mb-1">
                MT5 Account Login Number
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#5e6673] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="e.g. 88204912"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#5e6673] font-mono focus:outline-none focus:border-[#0ecb81]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#848e9c] uppercase tracking-wider mb-1">
                MT5 Trading Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5e6673] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#07090e] border border-white/[0.1] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#5e6673] font-mono focus:outline-none focus:border-[#0ecb81]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl buy-btn-gradient text-black font-black text-xs tracking-wider uppercase shadow-xl shadow-[#0ecb81]/30 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Connecting to Cloud Broker...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black fill-black" />
                  <span>Authenticate & Link Account</span>
                </>
              )}
            </button>
          </form>

          {/* Security Banner */}
          <div className="pt-2 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-[10px] text-[#848e9c]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0ecb81]" />
            <span>Encrypted cloud credentials. Direct broker FIX/MT5 socket.</span>
          </div>
        </div>
      ) : (
        /* Crypto Connector Placeholder */
        <div className="pro-card rounded-2xl p-6 border border-white/[0.08] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f0b90b]/15 border border-[#f0b90b]/30 flex items-center justify-center mx-auto text-[#f0b90b]">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-white">Binance / Bybit API Gateway</h3>
          <p className="text-xs text-[#848e9c] max-w-xs mx-auto leading-relaxed">
            Spot and USDT-M perpetual futures trading via CCXT direct exchange socket.
          </p>
          <div className="p-3 bg-[#090d16] rounded-xl border border-white/[0.05] text-[11px] text-[#848e9c] font-mono">
            Requires API Key with "Enable Spot & Margin Trading" permission.
          </div>
        </div>
      )}
    </div>
  );
};
