import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, ArrowRight, ShieldCheck, Lock, Mail, User as UserIcon, Settings, Wifi, PlayCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ServerPingResult } from '../api/client';

export const AuthScreen: React.FC = () => {
  const { login, register, loginSandbox, serverUrl, updateServerUrl, testServer } = useAuth();
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkErr, setIsNetworkErr] = useState(false);

  // Server settings modal state
  const [showSettings, setShowSettings] = useState(false);
  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [pingResult, setPingResult] = useState<ServerPingResult | null>(null);
  const [testingPing, setTestingPing] = useState(false);

  useEffect(() => {
    setInputUrl(serverUrl);
  }, [serverUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsNetworkErr(false);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please check credentials.';
      setError(msg);
      if (err.isNetwork || msg.toLowerCase().includes('cannot reach server') || msg.toLowerCase().includes('fetch')) {
        setIsNetworkErr(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = () => {
    loginSandbox(name || 'Trader', email || 'demo@volt.ai');
  };

  const handleTestPing = async (target?: string) => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await testServer(target || inputUrl);
      setPingResult(res);
    } catch (err: any) {
      setPingResult({ ok: false, pingMs: 0, error: err.message });
    } finally {
      setTestingPing(false);
    }
  };

  const handleSaveSettings = () => {
    updateServerUrl(inputUrl);
    setShowSettings(false);
    setError(null);
    setIsNetworkErr(false);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col justify-center px-5 py-8 relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar / Server Settings Action */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => {
            setShowSettings(true);
            handleTestPing(serverUrl);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-300 hover:text-white hover:border-slate-500 transition shadow-lg backdrop-blur-sm"
        >
          <Settings className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[10px] truncate max-w-[120px]">{serverUrl.replace(/^https?:\/\//, '')}</span>
        </button>
      </div>

      <div className="w-full max-w-sm mx-auto relative z-10">
        {/* Brand Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 items-center justify-center shadow-xl shadow-emerald-500/20 mb-3">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-widest text-white">VOLT</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px] mx-auto">
            Autonomous Cloud Trading. Zero local hosting needed.
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-2xl border border-slate-800 bg-[#0c1220]/90">
          <div className="flex border-b border-slate-800/80 mb-5">
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); setIsNetworkErr(false); }}
              className={`flex-1 pb-2.5 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
                isRegister ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
              {isRegister && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); setIsNetworkErr(false); }}
              className={`flex-1 pb-2.5 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
                !isRegister ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
              {!isRegister && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Error Banner with Instant Sandbox Escape Hatch */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-snug">{error}</p>
              </div>

              {isNetworkErr && (
                <div className="pt-2 border-t border-rose-500/20 flex flex-col gap-2">
                  <p className="text-[11px] text-slate-300 font-medium">
                    Testing on mobile or server not running?
                  </p>
                  <button
                    type="button"
                    onClick={handleSandboxLogin}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Continue in Sandbox Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSettings(true); handleTestPing(serverUrl); }}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Change Server IP ({serverUrl.replace(/^https?:\/\//, '')})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Trader Name"
                    className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
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
                  Connecting...
                </span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account & Connect' : 'Access Pro Terminal'}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#848e9c]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0ecb81]" />
            <span>256-Bit Encrypted Cloud Gateway</span>
          </div>
        </div>
      </div>

      {/* Server Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c1220] border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Server Connection</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 uppercase font-semibold mb-1">
                Backend Server URL
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://192.168.0.119:8000"
                className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">
                Quick Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('http://192.168.0.119:8000');
                    handleTestPing('http://192.168.0.119:8000');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-200 text-left transition"
                >
                  <span className="block font-semibold text-emerald-400">🏠 Home Wi-Fi</span>
                  <span className="text-[10px] text-slate-400 font-mono">192.168.0.119:8000</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('http://10.0.2.2:8000');
                    handleTestPing('http://10.0.2.2:8000');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-200 text-left transition"
                >
                  <span className="block font-semibold text-teal-400">📱 Android Emulator</span>
                  <span className="text-[10px] text-slate-400 font-mono">10.0.2.2:8000</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputUrl('http://localhost:8000');
                    handleTestPing('http://localhost:8000');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-[11px] text-slate-200 text-left transition col-span-2"
                >
                  <span className="block font-semibold text-blue-400">💻 PC Localhost</span>
                  <span className="text-[10px] text-slate-400 font-mono">http://localhost:8000</span>
                </button>
              </div>
            </div>

            {/* Test Connection Button & Ping Status */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleTestPing()}
                disabled={testingPing}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                {testingPing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing Connection...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ping Server Now</span>
                  </>
                )}
              </button>

              {pingResult && (
                <div
                  className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    pingResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {pingResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {pingResult.ok ? `Online (${pingResult.pingMs}ms)` : 'Unreachable'}
                    </div>
                    {pingResult.error && (
                      <div className="text-[10px] opacity-80">{pingResult.error}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
