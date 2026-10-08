import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MT5AccountStatus } from '../types';
import { Link2, CheckCircle2, AlertCircle, RefreshCw, Key, Server, Building2, ShieldCheck, Zap, ArrowLeft } from 'lucide-react';

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
    { name: 'Exness', defaultServer: 'Exness-Real10', tag: 'Fast Execution' },
    { name: 'IC Markets', defaultServer: 'ICMarketsSC-Live', tag: 'Raw Spread' },
    { name: 'FTMO', defaultServer: 'FTMO-Server', tag: 'Prop Firm' },
    { name: 'Pepperstone', defaultServer: 'Pepperstone-Live01', tag: 'Razor Spread' },
    { name: 'XM Global', defaultServer: 'XMGlobal-Real', tag: 'Ultra Low' },
    { name: 'Forex.com', defaultServer: 'Forex.com-Live', tag: 'Direct Market' },
    { name: 'OANDA', defaultServer: 'OANDA-v20-Live', tag: 'Institutional' },
    { name: 'Deriv', defaultServer: 'Deriv-Server', tag: 'Synthetics & FX' },
    { name: 'Custom Broker', defaultServer: '', tag: 'Any MT5 Server' },
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
      setMessage({ text: 'Please fill in account login, password, and server', type: 'error' });
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
      setMessage({ text: `Successfully connected to ${brokerName} (${res.account_id}) via Cloud Gateway!`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to authenticate MT5 account with broker server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4 pb-24 max-w-lg mx-auto">
      {/* Title */}
      <div className="mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-2 px-2 py-1 -ml-2 rounded-lg hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Dashboard</span>
          </button>
        )}
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-emerald-400" />
          <span>Cloud Broker Connection</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect your trading account directly to the cloud engine. No desktop MT5 or local PC needed.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0d1322] p-1 rounded-xl mb-4 border border-slate-800">
        <button
          onClick={() => setActiveTab('mt5')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'mt5' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          MetaTrader 5 (Forex/Gold)
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'crypto' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Crypto (Binance / Bybit)
        </button>
      </div>

      {/* Connected Account Card if connected */}
      {brokerStatus && brokerStatus.connected && (
        <div className="glass-panel rounded-2xl p-4 mb-5 border border-emerald-500/30 glow-emerald">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Cloud Synchronized
              </span>
            </div>
            <button
              onClick={fetchStatus}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Broker</span>
              <p className="text-xs font-bold text-white">{brokerStatus.broker}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Server</span>
              <p className="text-xs font-mono text-slate-300">{brokerStatus.server}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Account ID</span>
              <p className="text-xs font-mono text-white">{brokerStatus.account_id}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Leverage</span>
              <p className="text-xs font-mono text-emerald-400">1:{brokerStatus.leverage}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Equity</span>
              <p className="text-base font-extrabold text-white font-mono-numbers">
                ${brokerStatus.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Free Margin</span>
              <p className="text-xs font-semibold text-emerald-400 font-mono-numbers">
                ${brokerStatus.free_margin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MT5 Connector Form */}
      {activeTab === 'mt5' ? (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Auto-Connect MT5 Account</h3>
          </div>

          {/* Quick Presets */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Select Broker Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {brokerPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleBrokerSelect(preset)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-left flex flex-col justify-between transition ${
                    brokerName === preset.name
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0a0f1d] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs">{preset.name}</span>
                    {brokerName === preset.name && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-0.5">{preset.tag}</span>
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleConnect} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                MT5 Server Name
              </label>
              <div className="relative">
                <Server className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  placeholder="e.g. Exness-Real10 or ICMarketsSC-Live"
                  className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                MT5 Account Login (Account #)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="e.g. 14258902"
                  className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Trading Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0a0f1d] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Cloud Gateway...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Connect & Link Account</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-3 text-[10px] text-slate-500 text-center leading-normal">
            Your login and password are encrypted in transit. The cloud gateway connects via MetaApi TLS protocol with zero local software needed.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 text-center">
          <Key className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Crypto Exchange Integration</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Connect your Binance or Bybit Spot/Futures account using read + trade API keys.
          </p>
          <div className="p-3 bg-[#0a0f1d] rounded-xl border border-slate-800 text-left text-xs font-mono text-slate-300 mb-3">
            API Key: ••••••••••••••••••••••••
            <br />
            API Secret: ••••••••••••••••••••
          </div>
          <button
            type="button"
            onClick={() => alert('Crypto API linking is active in Sandbox/Testnet mode.')}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            Connect Exchange Keys
          </button>
        </div>
      )}
    </div>
  );
};
