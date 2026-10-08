import React, { useState, useMemo, useRef } from 'react';
import { CandleData } from '../types';
import { TrendingUp, TrendingDown, Eye, Sliders, Maximize2, Zap } from 'lucide-react';

interface CandleChartProps {
  candles: CandleData[];
  symbol: string;
  currentPrice: number;
  high24h: number;
  low24h: number;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  showEma?: boolean;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  symbol,
  currentPrice,
  high24h,
  low24h,
  timeframe,
  onTimeframeChange,
  showEma = true,
}) => {
  const [activeCandleIndex, setActiveCandleIndex] = useState<number | null>(null);
  const [displayEma, setDisplayEma] = useState(showEma);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  // Dimensions & geometry
  const chartHeight = 230;
  const volumeHeight = 45;
  const totalSvgHeight = chartHeight + volumeHeight;
  const svgWidth = 430;
  const paddingRight = 50; // for live price scale
  const paddingLeft = 8;
  const chartWidth = svgWidth - paddingRight - paddingLeft;

  const { minPrice, maxPrice, priceRange, maxVol } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 1, maxPrice: 2, priceRange: 1, maxVol: 100 };
    }
    let min = Math.min(...candles.map((c) => c.low));
    let max = Math.max(...candles.map((c) => c.high));
    const pad = (max - min) * 0.08 || 0.01;
    min -= pad;
    max += pad;
    const maxV = Math.max(...candles.map((c) => c.volume), 10);
    return { minPrice: min, maxPrice: max, priceRange: max - min, maxVol: maxV };
  }, [candles]);

  const candleWidth = useMemo(() => {
    if (!candles || candles.length === 0) return 6;
    return Math.max(3, Math.min(10, (chartWidth / candles.length) * 0.72));
  }, [candles, chartWidth]);

  const getX = (idx: number) => {
    if (candles.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (candles.length - 1)) * chartWidth;
  };

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  // Polyline paths for EMA 20 & EMA 50
  const ema20Points = useMemo(() => {
    if (!displayEma) return '';
    return candles
      .filter((c) => c.ema20 !== undefined)
      .map((c, idx) => `${getX(idx).toFixed(1)},${getY(c.ema20!).toFixed(1)}`)
      .join(' ');
  }, [candles, displayEma, minPrice, priceRange]);

  const ema50Points = useMemo(() => {
    if (!displayEma) return '';
    return candles
      .filter((c) => c.ema50 !== undefined)
      .map((c, idx) => `${getX(idx).toFixed(1)},${getY(c.ema50!).toFixed(1)}`)
      .join(' ');
  }, [candles, displayEma, minPrice, priceRange]);

  const activeCandle = activeCandleIndex !== null ? candles[activeCandleIndex] : candles[candles.length - 1];

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = (x / rect.width) * svgWidth - paddingLeft;
    const index = Math.round((relativeX / chartWidth) * (candles.length - 1));
    if (index >= 0 && index < candles.length) {
      setActiveCandleIndex(index);
    }
  };

  const decimals = symbol.includes('JPY') || symbol === 'XAUUSD' || symbol === 'BTCUSD' ? 2 : 4;
  const firstPrice = candles.length > 0 ? candles[0].open : currentPrice;
  const changePct = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;
  const isUp = changePct >= 0;

  return (
    <div className="pro-card rounded-2xl p-3 border border-white/[0.08] shadow-2xl relative select-none">
      {/* ── Top Bar: Symbol Header & Live HUD ────────────────────── */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white tracking-tight">{symbol}</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-[#848e9c]">
              SPOT
            </span>
            <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.2 rounded ${
              isUp ? 'bg-[#0ecb81]/15 text-[#0ecb81]' : 'bg-[#f6465d]/15 text-[#f6465d]'
            }`}>
              {isUp ? '+' : ''}{changePct.toFixed(2)}%
            </span>
          </div>

          {/* Live Price */}
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`text-xl font-black tabular-nums tracking-tight ${isUp ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
              {currentPrice.toFixed(decimals)}
            </span>
            <span className="text-[10px] text-[#5e6673] font-mono">
              24h H: {high24h.toFixed(decimals)} / L: {low24h.toFixed(decimals)}
            </span>
          </div>
        </div>

        {/* EMA Indicator Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDisplayEma(!displayEma)}
            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
              displayEma
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border-[#00f2fe]/30'
                : 'bg-[#121824] text-[#848e9c] border-white/[0.06]'
            }`}
          >
            EMA 20/50
          </button>
        </div>
      </div>

      {/* ── Interactive Crosshair HUD Strip ───────────────────────── */}
      {activeCandle && (
        <div className="flex items-center justify-between text-[9.5px] font-mono text-[#848e9c] px-1 py-1 bg-[#090d16] rounded-lg border border-white/[0.04] mb-2 tabular-nums">
          <div className="flex items-center gap-2">
            <span className="text-white/60">T: <span className="text-white font-medium">{activeCandle.time}</span></span>
            <span>O: <span className="text-white font-medium">{activeCandle.open.toFixed(decimals)}</span></span>
            <span>H: <span className="text-white font-medium">{activeCandle.high.toFixed(decimals)}</span></span>
            <span>L: <span className="text-white font-medium">{activeCandle.low.toFixed(decimals)}</span></span>
            <span>C: <span className={`font-bold ${activeCandle.close >= activeCandle.open ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>{activeCandle.close.toFixed(decimals)}</span></span>
          </div>
          {displayEma && activeCandle.ema20 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#00f2fe]">E20: {activeCandle.ema20.toFixed(decimals)}</span>
            </div>
          )}
        </div>
      )}

      {/* ── SVG Candlestick & Volume Chart Engine ──────────────────── */}
      <div 
        ref={containerRef}
        className="relative bg-[#07090e] rounded-xl overflow-hidden border border-white/[0.04] cursor-crosshair"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
          className="w-full h-auto block select-none touch-none"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setActiveCandleIndex(null)}
        >
          <defs>
            {/* Grid lines */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width={svgWidth} height={totalSvgHeight} fill="#07090e" />
          <rect width={chartWidth + paddingLeft} height={totalSvgHeight} fill="url(#grid)" />

          {/* Horizontal Price Grid Lines & Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const p = minPrice + priceRange * ratio;
            const y = getY(p);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="2 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft + chartWidth + 6}
                  y={y + 3}
                  fill="#848e9c"
                  fontSize="8.5"
                  fontFamily="monospace"
                >
                  {p.toFixed(decimals)}
                </text>
              </g>
            );
          })}

          {/* Volume Separator */}
          <line
            x1={paddingLeft}
            y1={chartHeight}
            x2={paddingLeft + chartWidth}
            y2={chartHeight}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* 1. Volume Histogram Bars */}
          {candles.map((c, idx) => {
            const x = getX(idx);
            const vHeight = (c.volume / maxVol) * (volumeHeight - 8);
            const y = totalSvgHeight - vHeight;
            const isGreenCandle = c.close >= c.open;
            return (
              <rect
                key={`vol-${idx}`}
                x={x - candleWidth / 2}
                y={y}
                width={candleWidth}
                height={vHeight}
                fill={isGreenCandle ? 'rgba(14, 203, 129, 0.3)' : 'rgba(246, 70, 93, 0.3)'}
                rx="0.5"
              />
            );
          })}

          {/* 2. Candlestick Bodies & Wicks */}
          {candles.map((c, idx) => {
            const x = getX(idx);
            const isGreenCandle = c.close >= c.open;
            const color = isGreenCandle ? '#0ecb81' : '#f6465d';
            const yHigh = getY(c.high);
            const yLow = getY(c.low);
            const yOpen = getY(c.open);
            const yClose = getY(c.close);
            const top = Math.min(yOpen, yClose);
            const bHeight = Math.max(1.5, Math.abs(yClose - yOpen));

            return (
              <g key={`candle-${idx}`}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.2"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={top}
                  width={candleWidth}
                  height={bHeight}
                  fill={color}
                  rx="0.8"
                />
              </g>
            );
          })}

          {/* 3. EMA Overlays */}
          {displayEma && ema20Points && (
            <polyline
              points={ema20Points}
              fill="none"
              stroke="#00f2fe"
              strokeWidth="1.5"
              opacity="0.9"
            />
          )}
          {displayEma && ema50Points && (
            <polyline
              points={ema50Points}
              fill="none"
              stroke="#a855f7"
              strokeWidth="1.5"
              opacity="0.8"
            />
          )}

          {/* 4. Active Touch Crosshair HUD */}
          {activeCandleIndex !== null && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(activeCandleIndex)}
                y1={0}
                x2={getX(activeCandleIndex)}
                y2={totalSvgHeight}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Horizontal line */}
              <line
                x1={paddingLeft}
                y1={getY(activeCandle.close)}
                x2={paddingLeft + chartWidth}
                y2={getY(activeCandle.close)}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Floating Price Tag on Axis */}
              <rect
                x={paddingLeft + chartWidth}
                y={getY(activeCandle.close) - 8}
                width={paddingRight}
                height={16}
                fill={activeCandle.close >= activeCandle.open ? '#0ecb81' : '#f6465d'}
                rx="2"
              />
              <text
                x={paddingLeft + chartWidth + 4}
                y={getY(activeCandle.close) + 3.5}
                fill="#000"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {activeCandle.close.toFixed(decimals)}
              </text>
            </g>
          )}

          {/* 5. Live Current Price Floating Badge */}
          {activeCandleIndex === null && (
            <g>
              <line
                x1={paddingLeft}
                y1={getY(currentPrice)}
                x2={paddingLeft + chartWidth}
                y2={getY(currentPrice)}
                stroke={isUp ? '#0ecb81' : '#f6465d'}
                strokeDasharray="2 2"
                strokeWidth="1"
                opacity="0.75"
              />
              <rect
                x={paddingLeft + chartWidth}
                y={getY(currentPrice) - 7.5}
                width={paddingRight}
                height={15}
                fill={isUp ? '#0ecb81' : '#f6465d'}
                rx="2"
              />
              <text
                x={paddingLeft + chartWidth + 4}
                y={getY(currentPrice) + 3.5}
                fill="#000"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {currentPrice.toFixed(decimals)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ── Timeframe Segment Selector (Binance Style) ─────────────── */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04]">
        <div className="flex items-center gap-1 bg-[#090d16] p-0.5 rounded-xl border border-white/[0.05]">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition active:scale-95 ${
                timeframe === tf
                  ? 'bg-white text-black shadow-md'
                  : 'text-[#848e9c] hover:text-white'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-[#5e6673] font-mono">
          {candles.length} BARS
        </span>
      </div>
    </div>
  );
};
