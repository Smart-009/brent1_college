import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MarketCandlesResponse } from '../types';
import { CandleChart } from '../components/CandleChart';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Sliders,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Lock,
  Plus,
  Minus,
  ArrowRight,
  Info
} from 'lucide-react';

interface TradeScreenProps {
  onOrderPlaced?: () => void;
  onNavigateToBroker?: () => void;
  initialSymbol?: string;
}

export const TradeScreen: React.FC<TradeScreenProps> = ({ 
  onOrderPlaced,
  onNavigateToBroker,
  initialSymbol = 'XAUUSD'
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<'XAUUSD' | 'EURUSD' | 'GBPUSD' | 'USDJPY' | 'BTCUSD'>(
    (initialSymbol as any) || 'XAUUSD'
  );
  const [timeframe, setTimeframe] = useState('15m');
  const [marketData, setMarketData] = useState<MarketCandlesResponse | null>(null);
  const [loadingChart, setLoadingChart] = useState(true);

  // Engine Mode
  const [engineMode, setEngineMode] = useState<'autopilot' | 'manual'>('autopilot');
  const [modeLoading, setModeLoading] = useState(false);

  // Manual Order Pad state
  const [lotSize, setLotSize] = useState<number>(0.10);
  const [useAutoBracket, setUseAutoBracket] = useState<boolean>(true);
  const [customSlPips, setCustomSlPips] = useState<number>(20);
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);
  const [orderNotification, setOrderNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Real Money Broker Gate
  const [brokerConnected, setBrokerConnected] = useState<boolean>(false);
  const [brokerName, setBrokerName] = useState<string>('');

  const symbols = [
    { id: 'XAUUSD' as const, label: 'Gold', subtitle: 'XAU/USD', decimals: 2, pipSize: 0.10, defaultSpread: 0.20 },
    { id: 'BTCUSD' as const, label: 'Bitcoin', subtitle: 'BTC/USD', decimals: 2, pipSize: 1.0, defaultSpread: 4.50 },
    { id: 'EURUSD' as const, label: 'EUR/USD', subtitle: 'Euro', decimals: 5, pipSize: 0.0001, defaultSpread: 0.00012 },
    { id: 'GBPUSD' as const, label: 'GBP/USD', subtitle: 'Pound', decimals: 5, pipSize: 0.0001, defaultSpread: 0.00015 },
    { id: 'USDJPY' as const, label: 'USD/JPY', subtitle: 'Yen', decimals: 3, pipSize: 0.01, defaultSpread: 0.012 },
  ];

  const currentSymbolConfig = symbols.find((s) => s.id === selectedSymbol) || symbols[0];

  const checkBrokerStatus = async () => {
    try {
      const status = await api.getMT5Status();
      if (status && status.connected) {
        setBrokerConnected(true);
        setBrokerName(status.broker);
      } else {
        setBrokerConnected(false);
      }
    } catch {
      setBrokerConnected(false);
    }
  };

  const fetchCandles = async () => {
    try {
      const data = await api.getCandles(selectedSymbol, timeframe);
      setMarketData(data);
    } catch (err) {
      console.error('Failed to fetch candles:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchEngineMode = async () => {
    try {
      const res = await api.getEngineMode();
      setEngineMode(res.mode);
    } catch {
      // default
    }
  };

  useEffect(() => {
    checkBrokerStatus();
  }, []);

  useEffect(() => {
    fetchCandles();
  }, [selectedSymbol, timeframe]);

  useEffect(() => {
    fetchEngineMode();
    const interval = setInterval(fetchCandles, 4000); // 4s tick polling
    return () => clearInterval(interval);
  }, [selectedSymbol, timeframe]);

  const handleToggleEngineMode = async (mode: 'autopilot' | 'manual') => {
    if (mode === engineMode) return;
    setModeLoading(true);
    try {
      await api.setEngineMode(mode);
      setEngineMode(mode);
    } catch (err: any) {
      alert(`Failed to set mode: ${err.message}`);
    } finally {
      setModeLoading(false);
    }
  };

  const currentPrice = marketData?.current_price || 0;
  const spread = currentSymbolConfig.defaultSpread;
  const bidPrice = Math.max(0, currentPrice - spread / 2);
  const askPrice = currentPrice + spread / 2;

  // Bracket Calculation: 1:2 Risk/Reward
  const slOffset = customSlPips * currentSymbolConfig.pipSize;
  const tpOffset = slOffset * 2.0;

  const buySl = parseFloat((askPrice - slOffset).toFixed(currentSymbolConfig.decimals));
  const buyTp = parseFloat((askPrice + tpOffset).toFixed(currentSymbolConfig.decimals));
  const sellSl = parseFloat((bidPrice + slOffset).toFixed(currentSymbolConfig.decimals));
  const sellTp = parseFloat((bidPrice - tpOffset).toFixed(currentSymbolConfig.decimals));

  const handlePlaceOrder = async (direction: 'BUY' | 'SELL') => {
    if (!brokerConnected) {
      setOrderNotification({
        text: 'Live Broker Not Linked. Please connect your Exness or MT5 account in Settings.',
        type: 'error',
      });
      return;
    }

    setOrderSubmitting(true);
    setOrderNotification(null);

    const price = direction === 'BUY' ? askPrice : bidPrice;
    const sl = useAutoBracket ? (direction === 'BUY' ? buySl : sellSl) : undefined;
    const tp = useAutoBracket ? (direction === 'BUY' ? buyTp : sellTp) : undefined;

    try {
      const res = await api.openManualOrder({
        symbol: selectedSymbol,
        type: direction.toLowerCase() as 'buy' | 'sell',
        volume: lotSize,
        price,
        stop_loss: sl,
        take_profit: tp,
      });

      setOrderNotification({
        text: `Order Placed! ${res.position?.position_id || 'OK'} ${direction} ${lotSize} lots ${selectedSymbol}`,
        type: 'success',
      });
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      setOrderNotification({
        text: err.message || 'Broker rejected order. Check account margin.',
        type: 'error',
      });
    } finally {
      setOrderSubmitting(false);
    }
  };

  const handleAdjustLots = (delta: number) => {
    const next = Math.max(0.01, parseFloat((lotSize + delta).toFixed(2)));
    setLotSize(next);
  };

  return (
    <div className="px-3.5 py-3 pb-24 space-y-3 max-w-lg mx-auto">
      {/* ── 1. Symbol Switcher Strip (Binance Pro Carousel) ──────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {symbols.map((s) => {
          const isSelected = selectedSymbol === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSymbol(s.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-left border transition active:scale-95 ${
                isSelected
                  ? 'bg-[#121824] border-[#0ecb81] shadow-lg shadow-[#0ecb81]/15'
                  : 'bg-[#090d16] border-white/[0.06] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#848e9c]'}`}>
                  {s.label}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse"></span>
                )}
              </div>
              <span className="text-[10px] text-[#5e6673] block">{s.subtitle}</span>
            </button>
          );
        })}
      </div>

      {/* ── 2. TradingView Pro Style Candlestick Chart ───────────────── */}
      <CandleChart
        candles={marketData?.candles || []}
        symbol={selectedSymbol}
        currentPrice={currentPrice}
        high24h={marketData?.high_24h || currentPrice}
        low24h={marketData?.low_24h || currentPrice}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />

      {/* ── 3. Engine Mode Segment Switcher ─────────────────────────── */}
      <div className="pro-card rounded-2xl p-2.5 border border-white/[0.08] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider block">
            Execution Mode
          </span>
          <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
            {engineMode === 'autopilot' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-[#0ecb81]" />
                <span className="text-[#0ecb81]">Quant Auto-Pilot</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span className="text-[#00f2fe]">Manual Execution Pad</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#07090e] p-1 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => handleToggleEngineMode('autopilot')}
            disabled={modeLoading}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition active:scale-95 ${
              engineMode === 'autopilot'
                ? 'bg-[#0ecb81] text-black shadow-md'
                : 'text-[#848e9c] hover:text-white'
            }`}
          >
            Auto Bot
          </button>
          <button
            onClick={() => handleToggleEngineMode('manual')}
            disabled={modeLoading}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition active:scale-95 ${
              engineMode === 'manual'
                ? 'bg-[#00f2fe] text-black shadow-md'
                : 'text-[#848e9c] hover:text-white'
            }`}
          >
            Manual
          </button>
        </div>
      </div>

      {/* ── 4. Order Notification Toast ─────────────────────────────── */}
      {orderNotification && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
          orderNotification.type === 'success'
            ? 'bg-[#0ecb81]/15 border-[#0ecb81]/30 text-[#0ecb81]'
            : 'bg-[#f6465d]/15 border-[#f6465d]/30 text-[#f6465d]'
        }`}>
          {orderNotification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#0ecb81]" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#f6465d]" />
          )}
          <span className="flex-1">{orderNotification.text}</span>
          <button
            onClick={() => setOrderNotification(null)}
            className="text-white/40 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 5. Binance Pro Tactile Order Pad ─────────────────────────── */}
      <div className="pro-card rounded-2xl p-3.5 border border-white/[0.08] space-y-3">
        {/* Bid / Ask Strip */}
        <div className="grid grid-cols-2 gap-2 text-center p-2 rounded-xl bg-[#090d16] border border-white/[0.05]">
          <div>
            <span className="text-[10px] text-[#848e9c] uppercase font-bold block">BID (SELL)</span>
            <span className="text-base font-black text-[#f6465d] tabular-nums">
              {bidPrice.toFixed(currentSymbolConfig.decimals)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#848e9c] uppercase font-bold block">ASK (BUY)</span>
            <span className="text-base font-black text-[#0ecb81] tabular-nums">
              {askPrice.toFixed(currentSymbolConfig.decimals)}
            </span>
          </div>
        </div>

        {/* Lot Size Stepper Control */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#848e9c] uppercase tracking-wider">
              Lot Volume Size
            </span>
            <span className="text-[10px] text-[#5e6673] font-mono">
              Min: 0.01 / Max: 10.0
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAdjustLots(-0.01)}
              className="w-10 h-10 rounded-xl bg-[#121824] hover:bg-[#182030] text-white flex items-center justify-center border border-white/[0.08] active:scale-95 transition"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="10.0"
                value={lotSize}
                onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                className="w-full text-center text-lg font-black text-white bg-[#07090e] border border-white/[0.1] rounded-xl py-2 tabular-nums focus:outline-none focus:border-[#0ecb81]"
              />
              <span className="absolute right-3 top-2.5 text-xs text-[#848e9c] font-bold">LOTS</span>
            </div>

            <button
              onClick={() => handleAdjustLots(0.01)}
              className="w-10 h-10 rounded-xl bg-[#121824] hover:bg-[#182030] text-white flex items-center justify-center border border-white/[0.08] active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Lot Presets */}
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {[0.01, 0.05, 0.10, 0.50, 1.00].map((preset) => (
              <button
                key={preset}
                onClick={() => setLotSize(preset)}
                className={`py-1 text-[11px] font-bold rounded-lg border transition active:scale-95 ${
                  lotSize === preset
                    ? 'bg-[#0ecb81] text-black border-[#0ecb81] font-black'
                    : 'bg-[#121824] text-[#848e9c] border-white/[0.06] hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* 1:2 Risk/Reward Bracket Sentinel */}
        <div className="p-2.5 rounded-xl bg-[#090d16] border border-white/[0.05] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0ecb81]" />
              <span>1:2 Risk:Reward Bracket Guard</span>
            </span>
            <span className="text-[10px] font-mono text-[#0ecb81] font-bold">
              {customSlPips} pips SL
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#848e9c]">
            <div className="p-1.5 bg-[#07090e] rounded-lg">
              <span className="block text-[#f6465d] font-bold">BUY SL: {buySl}</span>
              <span className="text-[#0ecb81] font-bold">BUY TP: {buyTp}</span>
            </div>
            <div className="p-1.5 bg-[#07090e] rounded-lg">
              <span className="block text-[#f6465d] font-bold">SELL SL: {sellSl}</span>
              <span className="text-[#0ecb81] font-bold">SELL TP: {sellTp}</span>
            </div>
          </div>
        </div>

        {/* ── Giant Tactile Buy/Sell Order Pads ─────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* SELL BUTTON */}
          <button
            onClick={() => handlePlaceOrder('SELL')}
            disabled={orderSubmitting}
            className={`sell-btn-gradient text-white py-3.5 px-3 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 ${
              !brokerConnected ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-center gap-1.5">
              {!brokerConnected && <Lock className="w-3.5 h-3.5 text-white/80" />}
              <span className="text-sm font-black tracking-wide">SELL / SHORT</span>
            </div>
            <span className="text-xs font-bold text-white/90 tabular-nums mt-0.5">
              @{bidPrice.toFixed(currentSymbolConfig.decimals)}
            </span>
          </button>

          {/* BUY BUTTON */}
          <button
            onClick={() => handlePlaceOrder('BUY')}
            disabled={orderSubmitting}
            className={`buy-btn-gradient text-black py-3.5 px-3 rounded-2xl flex flex-col items-center justify-center transition active:scale-95 ${
              !brokerConnected ? 'opacity-70' : ''
            }`}
          >
            <div className="flex items-center gap-1.5">
              {!brokerConnected && <Lock className="w-3.5 h-3.5 text-black/80" />}
              <span className="text-sm font-black tracking-wide">BUY / LONG</span>
            </div>
            <span className="text-xs font-bold text-black/90 tabular-nums mt-0.5">
              @{askPrice.toFixed(currentSymbolConfig.decimals)}
            </span>
          </button>
        </div>

        {/* Broker Not Connected Alert & Link */}
        {!brokerConnected && (
          <div 
            onClick={onNavigateToBroker}
            className="flex items-center justify-between p-2 rounded-xl bg-[#f0b90b]/10 border border-[#f0b90b]/25 cursor-pointer hover:bg-[#f0b90b]/20 transition"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#f0b90b]" />
              <span className="text-[11px] font-bold text-[#f0b90b]">
                Real Money Locked: Connect Exness/MT5 to Trade
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#f0b90b]" />
          </div>
        )}
      </div>
    </div>
  );
};
