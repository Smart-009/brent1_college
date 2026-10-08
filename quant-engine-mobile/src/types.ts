export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  has_mt5?: boolean;
}

export interface MT5AccountStatus {
  connected: boolean;
  account_id: string;
  broker: string;
  server: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level_pct: number;
  leverage: number;
  open_positions_count: number;
  connection_time: string;
}

export interface PortfolioOverview {
  equity_usd: number;
  equity_kes: number;
  balance_usd: number;
  daily_pnl_usd: number;
  daily_pnl_kes: number;
  daily_pnl_pct: number;
  target_reached: boolean;
  house_money_mode: boolean;
  drawdown_pct: number;
  high_water_mark: number;
  circuit_breaker_active: boolean;
  trading_paused: boolean;
  open_positions_count: number;
  win_rate_pct: number;
  profit_factor: number;
  sharpe_ratio: number;
}

export interface IntelligenceState {
  regime_state: string;
  hurst_exponent: number;
  hurst_label: string;
  volatility_state: string;
  active_session: string;
  news_panic: boolean;
  event_blackout: boolean;
  next_macro_event: string;
}

export interface BrokerInfo {
  connected: boolean;
  broker_name: string;
  server: string;
  account_id: string;
  leverage: string;
}

export interface DashboardData {
  portfolio: PortfolioOverview;
  intelligence: IntelligenceState;
  broker: BrokerInfo;
}

export interface Position {
  position_id: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  open_price: number;
  current_price: number;
  stop_loss: number;
  take_profit: number;
  unrealized_pnl: number;
  opened_at: string;
  trailing_active: boolean;
  stage: string;
  risk_free: boolean;
}

export interface TradeHistoryItem {
  trade_id: string;
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price: number;
  lots: number;
  pnl_usd: number;
  pnl_pct: number;
  pnl_kes: number;
  strategy: string;
  closed_at: string;
  reason: string;
}

export interface RiskSettings {
  max_risk_pct: number;
  max_daily_loss_pct: number;
  half_kelly: boolean;
  leverage_forex: number;
  leverage_crypto: number;
  trailing_stop_enabled: boolean;
  tp1_scale_out_pct?: number;
}

export interface LeadLagPair {
  lead_symbol: string;
  lag_symbol: string;
  correlation: number;
  lead_impulse_zscore: number;
  lag_spread_zscore: number;
  divergence_detected: boolean;
  predicted_direction: 'BUY' | 'SELL' | 'HOLD';
  estimated_latency_window_sec: number;
  confidence: number;
  rationale: string;
  target_move_pips: number;
  updated_at: string;
}

export interface LiquidityPoolItem {
  pool_id: string;
  symbol: string;
  pool_type: string;
  price_level: number;
  status: 'SWEPT_AND_REJECTED' | 'AWAITING_SWEEP' | 'BROKEN';
  action: string;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_reward: number;
  volume_surge: number;
  description: string;
}

export interface RadarData {
  lead_lag: LeadLagPair[];
  liquidity: LiquidityPoolItem[];
  active_edge: string;
  institutional_win_probability: string;
  average_rrr: string;
}

export interface CandleData {
  time: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
}

export interface MarketCandlesResponse {
  symbol: string;
  timeframe: string;
  current_price: number;
  high_24h: number;
  low_24h: number;
  candles: CandleData[];
}

export interface ManualOrderPayload {
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  price: number;
  stop_loss?: number;
  take_profit?: number;
}

