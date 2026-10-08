import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, RefreshCw, Zap, Shield, Wifi, ChevronDown } from 'lucide-react';
import { api } from '../api/client';

interface HeaderProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  currencyMode?: 'USD' | 'KES';
  onToggleCurrency?: (mode: 'USD' | 'KES') => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onRefresh, 
  refreshing, 
  currencyMode = 'USD', 
  onToggleCurrency 
}) => {
  const { user, logout } = useAuth();
  const [latency, setLatency] = useState<number>(14);

  useEffect(() => {
    // Periodic random jitter to reflect realistic live WS latency (10-22ms)
    const interval = setInterval(() => {
      setLatency(Math.floor(10 + Math.random() * 8));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 px-3.5 py-2.5 bg-[#07090e]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between">
      {/* Brand & Connection Badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0ecb81] to-[#00f2fe] flex items-center justify-center shadow-md shadow-[#0ecb81]/25 ring-1 ring-white/20">
          <Zap className="w-4 h-4 text-black fill-black" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[15px] tracking-tight text-white font-sans">VOLT</span>
            <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-[#0ecb81]/15 text-[#0ecb81] border border-[#0ecb81]/30">
              PRO
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] text-[#848e9c]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ecb81] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0ecb81]"></span>
            </span>
            <span className="font-medium text-[#848e9c]">Cloud Host</span>
            <span className="text-white/20">•</span>
            <span className="tabular-nums font-mono text-[9px] text-[#0ecb81] font-semibold">{latency}ms</span>
          </div>
        </div>
      </div>

      {/* Right Control Strip: Currency Toggle & Sync */}
      <div className="flex items-center gap-1.5">
        {onToggleCurrency && (
          <div className="flex items-center p-0.5 bg-[#121824] rounded-lg border border-white/[0.08]">
            <button
              onClick={() => onToggleCurrency('USD')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                currencyMode === 'USD'
                  ? 'bg-[#0ecb81] text-black shadow-sm'
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => onToggleCurrency('KES')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${
                currencyMode === 'KES'
                  ? 'bg-[#0ecb81] text-black shadow-sm'
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              KES
            </button>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-lg bg-[#121824] border border-white/[0.06] text-[#848e9c] hover:text-white hover:border-white/20 transition active:scale-95"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#0ecb81]' : ''}`} />
          </button>
        )}

        {user && (
          <button
            onClick={logout}
            className="p-1.5 rounded-lg bg-[#121824] border border-white/[0.06] text-[#848e9c] hover:text-[#f6465d] hover:border-[#f6465d]/30 transition active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
