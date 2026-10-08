import React, { useState, useId } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, Maximize2, Sparkles, Layers } from 'lucide-react';

interface EquityChartProps {
  currentEquity: number;
  dailyPnl: number;
  dailyPnlPct: number;
}

type Timeframe = '24H' | '7D' | '30D' | 'ALL';
type ChartMode = 'equity' | 'live_ticks';

export const EquityChart: React.FC<EquityChartProps> = ({
  currentEquity,
  dailyPnl,
  dailyPnlPct,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [chartMode, setChartMode] = useState<ChartMode>('equity');
  const [hoveredPoint, setHoveredPoint] = useState<{ value: number; label: string; pnl: number } | null>(null);

  // Generate realistic data points based on timeframe and current equity
  const getDataForTimeframe = (tf: Timeframe) => {
    const base = currentEquity - dailyPnl;
    switch (tf) {
      case '24H':
        return [
          { label: '00:00', value: base - 12.5 },
          { label: '04:00', value: base - 4.0 },
          { label: '08:00', value: base + 18.2 },
          { label: '12:00', value: base + 14.8 },
          { label: '16:00', value: base + 38.0 },
          { label: '20:00', value: base + 48.5 },
          { label: 'Now', value: currentEquity },
        ];
      case '7D':
        return [
          { label: 'Mon', value: base - 210.0 },
          { label: 'Tue', value: base - 145.0 },
          { label: 'Wed', value: base - 95.0 },
          { label: 'Thu', value: base - 30.0 },
          { label: 'Fri', value: base + 42.0 },
          { label: 'Sat', value: base + 42.0 },
          { label: 'Today', value: currentEquity },
        ];
      case '30D':
        return [
          { label: 'Wk 1', value: base - 640.0 },
          { label: 'Wk 2', value: base - 390.0 },
          { label: 'Wk 3', value: base - 180.0 },
          { label: 'Wk 4', value: currentEquity },
        ];
      case 'ALL':
        return [
          { label: 'Month 1', value: 8500.0 },
          { label: 'Month 2', value: 9150.0 },
          { label: 'Month 3', value: 9680.0 },
          { label: 'Current', value: currentEquity },
        ];
    }
  };

  const rawData = getDataForTimeframe(timeframe);
  const values = rawData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Chart Dimensions
  const width = 360;
  const height = 150;
  const paddingX = 15;
  const paddingTop = 20;
  const paddingBottom = 25;
  const innerHeight = height - paddingTop - paddingBottom;
  const innerWidth = width - paddingX * 2;

  // Compute SVG Points
  const points = rawData.map((d, index) => {
    const x = paddingX + (index / (rawData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.value - minVal) / range) * innerHeight;
    return { x, y, value: d.value, label: d.label };
  });

  // Construct SVG Path
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - 5} L ${points[0].x} ${height - 5} Z`;

  const isUp = currentEquity >= (rawData[0]?.value || currentEquity);
  const primaryColor = isUp ? '#10b981' : '#f43f5e';
  const startVal = rawData[0]?.value || currentEquity;
  const totalGain = currentEquity - startVal;
  const totalGainPct = ((totalGain / startVal) * 100).toFixed(2);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-[#0c1220]/90 shadow-2xl space-y-3 relative overflow-hidden">
      {/* Background radial highlight */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none blur-3xl opacity-15"
        style={{ backgroundColor: primaryColor }}
      ></div>

      {/* Header with Mode Toggle & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {chartMode === 'equity' ? 'Equity Growth Curve' : 'EURUSD Live Order Flow'}
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REAL-TIME
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-white font-mono-numbers">
              ${(hoveredPoint ? hoveredPoint.value : currentEquity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-xs font-bold font-mono-numbers flex items-center gap-0.5 ${
                isUp ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isUp ? '+' : ''}${totalGain.toFixed(2)} ({isUp ? '+' : ''}{totalGainPct}%)
            </span>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-[#070b14] p-1 rounded-xl border border-slate-800 text-[10px] font-bold font-mono">
          {(['24H', '7D', '30D', 'ALL'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setHoveredPoint(null);
              }}
              className={`px-2 py-1 rounded-lg transition ${
                timeframe === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative w-full pt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-36 overflow-visible select-none"
          onMouseLeave={() => setHoveredPoint(null)}
          onTouchEnd={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="equityFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
              <stop offset="70%" stopColor={primaryColor} stopOpacity="0.05" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + innerHeight / 2}
            stroke="#1e293b"
            strokeDasharray="3 3"
            strokeWidth="0.8"
          />
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#1e293b"
            strokeDasharray="3 3"
            strokeWidth="0.8"
          />

          {/* Gradient Filled Area */}
          <path d={areaPath} fill="url(#equityFillGrad)" />

          {/* Glowing Line */}
          <path
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEffect)"
          />

          {/* Points & Interactive Scrubber */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.label === pt.label ? 4.5 : 2.5}
                fill="#070b14"
                stroke={primaryColor}
                strokeWidth={hoveredPoint?.label === pt.label ? 2.5 : 1.5}
                className="transition-all cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    value: pt.value,
                    label: pt.label,
                    pnl: pt.value - startVal,
                  })
                }
                onTouchStart={() =>
                  setHoveredPoint({
                    value: pt.value,
                    label: pt.label,
                    pnl: pt.value - startVal,
                  })
                }
              />
              {/* Bottom label */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                fontFamily="monospace"
              >
                {pt.label}
              </text>
            </g>
          ))}

          {/* Active Tooltip Line if hovered */}
          {hoveredPoint && (
            <g>
              {points
                .filter((p) => p.label === hoveredPoint.label)
                .map((p, i) => (
                  <line
                    key={i}
                    x1={p.x}
                    y1={paddingTop}
                    x2={p.x}
                    y2={height - 20}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                ))}
            </g>
          )}
        </svg>

        {/* Hover detail pill */}
        {hoveredPoint && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700/80 px-2.5 py-1 rounded-lg text-center shadow-xl backdrop-blur-md pointer-events-none">
            <span className="text-[10px] text-slate-400 font-mono block">
              {hoveredPoint.label}
            </span>
            <span className="text-xs font-bold text-white font-mono-numbers">
              ${hoveredPoint.value.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Chart Footer Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono-numbers text-xs">
        <div className="bg-[#070b14] p-1.5 rounded-xl border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase block font-sans">Period Low</span>
          <span className="text-slate-300 font-semibold">${minVal.toFixed(2)}</span>
        </div>

        <div className="bg-[#070b14] p-1.5 rounded-xl border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase block font-sans">Period High</span>
          <span className="text-emerald-400 font-bold">${maxVal.toFixed(2)}</span>
        </div>

        <div className="bg-[#070b14] p-1.5 rounded-xl border border-slate-800/60">
          <span className="text-[9px] text-slate-500 uppercase block font-sans">Volatility Band</span>
          <span className="text-cyan-400 font-semibold">&plusmn;{((range / startVal) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
