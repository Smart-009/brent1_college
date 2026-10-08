import React, { useState } from 'react';
import {
  GraduationCap,
  Calculator,
  Compass,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  Flame,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent,
} from 'lucide-react';

export const EducationScreen: React.FC = () => {
  // Interactive Expectancy Calculator State
  const [accountSize, setAccountSize] = useState<number>(1000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [winRate, setWinRate] = useState<number>(54);
  const [rewardRatio, setRewardRatio] = useState<number>(2.2);

  // Expanded Module State
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  // Calculator Math over 100 trades
  const riskAmount = (accountSize * riskPct) / 100;
  const rewardAmount = riskAmount * rewardRatio;
  const winTrades = Math.round((winRate / 100) * 100);
  const lossTrades = 100 - winTrades;
  const totalProfit = winTrades * rewardAmount;
  const totalLoss = lossTrades * riskAmount;
  const netProfit = totalProfit - totalLoss;
  const netProfitPct = ((netProfit / accountSize) * 100).toFixed(1);
  const expectedValuePerTrade = (netProfit / 100).toFixed(2);
  const isProfitable = netProfit > 0;

  const modules = [
    {
      title: 'Module 1: The Mathematics of Positive Expectancy',
      subtitle: 'Why 50% Win Rate makes fortunes while 90% "holy grails" blow up',
      icon: Calculator,
      color: 'emerald',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            The #1 misconception among retail traders is believing you need an 80% or 90% win rate to become wealthy.
            In reality, almost all systems boasting a 90% win rate use <strong>Martingale averaging</strong>, meaning they
            risk $100 to make $2 until one black swan wipes out their entire account.
          </p>
          <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-2">
            <span className="font-bold text-white block">The Institutional Expectancy Formula:</span>
            <code className="block font-mono text-emerald-400 text-[11px] bg-slate-900 p-2 rounded">
              E = (Win% &times; Avg Win) - (Loss% &times; Avg Loss)
            </code>
            <p className="text-[11px] text-slate-400">
              With a <strong>50% win rate</strong> and a <strong>1:2.0 Risk-to-Reward</strong>, you win $20 and lose $10.
              Over 100 trades: 50 wins ($1,000) - 50 losses ($500) = <strong>+$500 Net Profit (+50%)</strong>!
            </p>
          </div>
          <p>
            VOLT enforces the <strong>Half-Kelly Criterion</strong>: when your statistical edge expands, position sizes
            safely scale; when market conditions become uncertain, sizes automatically compress to zero.
          </p>
        </div>
      ),
    },
    {
      title: 'Module 2: Market Regimes & The Fractal Hurst Exponent',
      subtitle: 'How VOLT tells the difference between trends and random gambling noise',
      icon: Compass,
      color: 'cyan',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Prices do not move in smooth cycles. They alternate between <strong>Persistent Trends</strong> and{' '}
            <strong>Mean-Reverting Noise</strong>. VOLT calculates the <strong>Hurst Exponent (H)</strong> on every bar:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="font-bold block">H &gt; 0.55 — Persistent Trending Regime</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Past price changes predict future price changes. VOLT deploys Trend Following and Donchian Breakout strategies.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              <span className="font-bold block">0.45 &le; H &le; 0.55 — Random Brownian Motion (Noise)</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Market has zero statistical memory. Trading here is pure gambling. <strong>VOLT strictly blocks all new orders.</strong>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
              <span className="font-bold block">H &lt; 0.45 — Mean-Reverting Regime</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Prices snap back toward the dynamic volume-weighted mean. VOLT unlocks Bollinger Mean Reversion.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Module 3: Cross-Asset Lead-Lag Asymmetry',
      subtitle: 'The 15-45 second look-ahead edge that front-runs retail charts',
      icon: Zap,
      color: 'amber',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Standard retail bots look only at one chart at a time. But in global finance, <strong>macro markets lead retail broker feeds</strong>:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-300 pl-1">
            <li>
              <strong>US 10-Year Bond Yields (US10Y) ➔ Gold (XAUUSD):</strong> Bond yields lead Gold by 20 to 45 seconds. When yields plunge in futures markets, Gold surges immediately after.
            </li>
            <li>
              <strong>US Dollar Index (DXY) ➔ EURUSD:</strong> Institutional dollar futures order flow drives currency pairs before retail broker quotes catch up.
            </li>
            <li>
              <strong>Bitcoin Spot Depth ➔ Perpetual Futures:</strong> Spot volume on institutional exchanges leads retail leverage.
            </li>
          </ul>
          <p className="text-[11px] text-slate-400">
            VOLT monitors the leading asset tick-by-tick. When a divergence exceeds 1.65&sigma;, it enters the lagging asset
            with an anticipatory statistical advantage.
          </p>
        </div>
      ),
    },
    {
      title: 'Module 4: Institutional Liquidity Sweeps (Smart Money Traps)',
      subtitle: 'Why 90% of retail stops get hunted and how to profit from the trap',
      icon: Target,
      color: 'rose',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Retail traders place their Stop Loss orders at obvious places: Asian Session Highs, Previous Day Lows, or round numbers like 1.0800.
          </p>
          <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-1.5">
            <span className="font-bold text-white block">The 3-Step Stop Hunt Sequence:</span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li><strong>The Sweep:</strong> Market makers push price past the key level to trigger retail stop losses and liquidations.</li>
              <li><strong>The Trap:</strong> Breakout traders buy the peak; their stops become institutional liquidity.</li>
              <li><strong>The Rejection (Turtle Soup):</strong> Price rapidly wicks back inside the range. VOLT enters with the institution with an ultra-tight stop just beyond the sweep wick!</li>
            </ol>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            Result: Ultra-tight stop loss + wide target = 1:3.0 to 1:6.0 Risk-to-Reward ratio!
          </p>
        </div>
      ),
    },
    {
      title: 'Module 5: The Institutional Capital Preservation Rules',
      subtitle: 'The 4 defense layers that guarantee your account cannot blow up',
      icon: ShieldCheck,
      color: 'emerald',
      content: (
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block text-[11px]">1. Strict 1% Risk Rule</span>
              <p className="text-[11px] text-slate-400">
                No individual trade is ever permitted to risk more than 1% of your equity. Five losses in a row only draw down ~4.9%.
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block text-[11px]">2. -3% Daily Circuit Breaker</span>
              <p className="text-[11px] text-slate-400">
                If daily cumulative losses reach -3%, trading halts automatically for the day. Emotional revenge trading is physically impossible.
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block text-[11px]">3. Auto-Breakeven at 1R</span>
              <p className="text-[11px] text-slate-400">
                The moment a trade reaches 1R in profit, the Stop Loss moves to the exact entry price. The trade becomes 100% risk-free.
              </p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="font-bold text-white block text-[11px]">4. 50% Banked at TP1 + Trailing Runner</span>
              <p className="text-[11px] text-slate-400">
                50% of the lot size closes at TP1 to lock in guaranteed cash. The remaining 50% trails with an ATR stop to ride multi-day trends.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Module 6: Trader Roadmap (Sandbox to Live)',
      subtitle: 'How to scale disciplined capital step-by-step',
      icon: Flame,
      color: 'amber',
      content: (
        <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <span className="font-bold text-white block">Explore in Sandbox Mode</span>
              <p className="text-[11px] text-slate-400">Inspect the Cockpit, Trailing Stop simulator, and Lead-Lag Radar with zero financial risk.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <span className="font-bold text-white block">Run on a 14-Day Broker Demo Account</span>
              <p className="text-[11px] text-slate-400">Connect a free MetaTrader 5 Demo (e.g. Exness MT5 Trial) and let the engine execute real live market orders.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <span className="font-bold text-white block">Deploy Live with Strict 1% Risk</span>
              <p className="text-[11px] text-slate-400">Fund your MT5 account and let the autonomous engine compound capital steadily over months.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4 pb-28 text-slate-100 max-w-lg mx-auto">
      {/* Academy Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0d1627] to-[#070e1c] border border-emerald-500/30 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">VOLT ACADEMY</h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO QUANT
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Master Institutional Mathematics & Market Edge</p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE EXPECTANCY CALCULATOR */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-[#0c1220]/95 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Interactive Edge & Expectancy Calculator
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">100 Trades Simulation</span>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-3 pt-1">
          {/* Account Balance */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-semibold">
              <span className="text-slate-400">Account Capital</span>
              <span className="text-white font-mono-numbers">${accountSize.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={accountSize}
              onChange={(e) => setAccountSize(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Risk Per Trade */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-semibold">
              <span className="text-slate-400">Risk Per Trade</span>
              <span className="text-emerald-400 font-mono-numbers">{riskPct.toFixed(1)}% (${riskAmount.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={riskPct}
              onChange={(e) => setRiskPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Win Rate */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-semibold">
              <span className="text-slate-400">Win Rate</span>
              <span className="text-cyan-400 font-mono-numbers">{winRate}% ({winTrades} Wins / {lossTrades} Losses)</span>
            </div>
            <input
              type="range"
              min="35"
              max="75"
              step="1"
              value={winRate}
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Risk to Reward */}
          <div>
            <div className="flex justify-between text-[11px] mb-1 font-semibold">
              <span className="text-slate-400">Risk-to-Reward Ratio</span>
              <span className="text-amber-400 font-mono-numbers">1 : {rewardRatio.toFixed(1)} (Reward: ${rewardAmount.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="1.2"
              max="4.0"
              step="0.1"
              value={rewardRatio}
              onChange={(e) => setRewardRatio(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Live Mathematical Outcome Card */}
        <div
          className={`p-3.5 rounded-xl border mt-3 transition-all ${
            isProfitable
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-rose-500/10 border-rose-500/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Projected 100-Trade Return
            </span>
            <span
              className={`text-xs font-black font-mono-numbers px-2 py-0.5 rounded ${
                isProfitable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isProfitable ? '+' : ''}{netProfitPct}% ROI
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black font-mono-numbers ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfitable ? '+' : ''}${netProfit.toFixed(2)}
            </div>
            <div className="text-right text-[11px] text-slate-400 font-mono-numbers">
              Expected Value: <strong className="text-white">${expectedValuePerTrade}</strong> / trade
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono-numbers">
            <div className="text-slate-400">
              Wins Total: <span className="text-emerald-400 font-bold">+${totalProfit.toFixed(2)}</span>
            </div>
            <div className="text-slate-400 text-right">
              Losses Total: <span className="text-rose-400 font-bold">-${totalLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE CURRICULUM MODULES */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
            Quantitative Knowledge Base
          </h3>
        </div>

        {modules.map((m, idx) => {
          const Icon = m.icon;
          const isExpanded = expandedModule === idx;
          return (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-slate-800/90 bg-[#0a0f1d]/85 shadow-lg overflow-hidden transition-all"
            >
              <button
                onClick={() => setExpandedModule(isExpanded ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/20 transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{m.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.subtitle}</p>
                  </div>
                </div>

                <div className="text-slate-400 ml-2">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-[#070b14]/50 animate-fadeIn">
                  {m.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
