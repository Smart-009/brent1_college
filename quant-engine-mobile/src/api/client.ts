import { DashboardData, MT5AccountStatus, Position, RiskSettings, TradeHistoryItem, User, RadarData, CandleData, MarketCandlesResponse, ManualOrderPayload } from '../types';

// Default Cloud API URL for production mobile app
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://volt-engine.onrender.com';

export interface ServerPingResult {
  ok: boolean;
  pingMs: number;
  error?: string;
  statusText?: string;
}

class QuantApiClient {
  private token: string | null = null;
  private sandboxPositions: Position[] = [
    {
      position_id: 'pos_demo_01',
      symbol: 'EURUSD',
      type: 'buy',
      volume: 0.1,
      open_price: 1.08420,
      current_price: 1.08645,
      stop_loss: 1.08200,
      take_profit: 1.08950,
      unrealized_pnl: 22.50,
      opened_at: new Date(Date.now() - 3600000).toISOString(),
      trailing_active: true,
      stage: 'TP1 Scale-Out (50% Closed)',
      risk_free: true,
    },
    {
      position_id: 'pos_demo_02',
      symbol: 'XAUUSD',
      type: 'buy',
      volume: 0.05,
      open_price: 2642.10,
      current_price: 2648.70,
      stop_loss: 2638.00,
      take_profit: 2660.00,
      unrealized_pnl: 33.00,
      opened_at: new Date(Date.now() - 7200000).toISOString(),
      trailing_active: true,
      stage: 'Trailing Stop Stage 2',
      risk_free: true,
    },
  ];

  private sandboxTrades: TradeHistoryItem[] = [
    {
      trade_id: 'trd_demo_01',
      symbol: 'GBPUSD',
      direction: 'buy',
      entry_price: 1.30150,
      exit_price: 1.30550,
      lots: 0.1,
      pnl_usd: 40.00,
      pnl_pct: 0.4,
      pnl_kes: 5200.00,
      strategy: 'London Breakout Trend',
      closed_at: new Date(Date.now() - 14400000).toISOString(),
      reason: 'Take Profit Hit',
    },
    {
      trade_id: 'trd_demo_02',
      symbol: 'USDJPY',
      direction: 'sell',
      entry_price: 154.20,
      exit_price: 153.80,
      lots: 0.08,
      pnl_usd: 21.30,
      pnl_pct: 0.21,
      pnl_kes: 2769.00,
      strategy: 'Mean Reversion EMA20',
      closed_at: new Date(Date.now() - 28800000).toISOString(),
      reason: 'Trailing Stop Locked Profit',
    },
  ];

  private sandboxRiskSettings: RiskSettings = {
    max_risk_pct: 1.0,
    max_daily_loss_pct: 3.0,
    half_kelly: true,
    leverage_forex: 2,
    leverage_crypto: 3,
    trailing_stop_enabled: true,
    tp1_scale_out_pct: 50.0,
  };

  private sandboxEnginePaused: boolean = false;
  private sandboxMT5Connected: boolean = false;
  private sandboxBrokerInfo = {
    broker_name: 'Exness (Cloud Demo)',
    server: 'Exness-MT5Trial7',
    account_id: '88204912',
    leverage: '1:500',
  };

  constructor() {
    this.token = localStorage.getItem('volt_auth_token');
  }

  // Server Base URL management
  getBaseUrl(): string {
    const saved = localStorage.getItem('volt_api_base_url');
    if (saved) return saved.trim().replace(/\/+$/, '');
    return DEFAULT_API_URL;
  }

  setBaseUrl(url: string) {
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem('volt_api_base_url', cleaned);
  }

  resetBaseUrl() {
    localStorage.removeItem('volt_api_base_url');
  }

  // Token management
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('volt_auth_token', token);
    } else {
      localStorage.removeItem('volt_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Sandbox / Offline mode
  isSandbox(): boolean {
    return localStorage.getItem('volt_sandbox_active') === 'true';
  }

  setSandboxMode(active: boolean) {
    if (active) {
      localStorage.setItem('volt_sandbox_active', 'true');
    } else {
      localStorage.removeItem('volt_sandbox_active');
    }
  }

  enableSandbox(userData?: { name?: string; email?: string }): { token: string; user: User } {
    this.setSandboxMode(true);
    const user: User = {
      id: 'usr_sandbox_' + Math.random().toString(36).substring(2, 9),
      name: userData?.name?.trim() || 'Volt Trader',
      email: userData?.email?.trim() || 'demo@volt.ai',
      created_at: new Date().toISOString(),
      has_mt5: true,
    };
    localStorage.setItem('volt_sandbox_user', JSON.stringify(user));
    const token = 'sandbox_jwt_token_' + Date.now();
    this.setToken(token);
    this.sandboxMT5Connected = true;
    return { token, user };
  }

  getSandboxUser(): User | null {
    const raw = localStorage.getItem('volt_sandbox_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Health check / Ping
  async checkHealth(targetUrl?: string): Promise<ServerPingResult> {
    const url = (targetUrl || this.getBaseUrl()).replace(/\/+$/, '');
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${url}/api/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const pingMs = Date.now() - start;

      if (res.ok) {
        return { ok: true, pingMs, statusText: 'Online' };
      }
      return { ok: false, pingMs, error: `Server returned HTTP ${res.status}` };
    } catch (err: any) {
      const pingMs = Date.now() - start;
      const isTimeout = err.name === 'AbortError';
      return {
        ok: false,
        pingMs,
        error: isTimeout ? 'Connection timed out (4s)' : (err.message || 'Network unreachable'),
      };
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fullUrl = `${this.getBaseUrl()}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`[QuantApiClient] Error calling ${endpoint}:`, err);
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
        const enhancedError: any = new Error(
          `Cannot reach server at ${this.getBaseUrl()}. Please verify server is running or switch to Sandbox Mode.`
        );
        enhancedError.isNetwork = true;
        enhancedError.serverUrl = this.getBaseUrl();
        throw enhancedError;
      }
      throw err;
    }
  }

  // Auth Methods
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    if (this.isSandbox()) {
      return this.enableSandbox({ name, email });
    }

    try {
      const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      this.setToken(res.token);
      return res;
    } catch (err: any) {
      if (err.isNetwork) {
        throw err;
      }
      throw err;
    }
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    if (this.isSandbox()) {
      return this.enableSandbox({ email });
    }

    try {
      const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(res.token);
      return res;
    } catch (err: any) {
      if (err.isNetwork) {
        throw err;
      }
      throw err;
    }
  }

  async getMe(): Promise<User> {
    if (this.isSandbox()) {
      const user = this.getSandboxUser();
      if (user) return user;
      return this.enableSandbox().user;
    }
    return this.request<User>('/api/auth/me');
  }

  // Broker & MT5
  async connectMT5(data: { broker_name: string; server: string; login: string; password: string }): Promise<MT5AccountStatus> {
    if (this.isSandbox()) {
      this.sandboxMT5Connected = true;
      this.sandboxBrokerInfo = {
        broker_name: data.broker_name || 'Exness (Demo)',
        server: data.server || 'Exness-MT5Trial',
        account_id: data.login || '9928104',
        leverage: '1:500',
      };
      return this.getMT5Status();
    }
    return this.request<MT5AccountStatus>('/api/broker/mt5/connect', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMT5Status(): Promise<MT5AccountStatus> {
    if (this.isSandbox()) {
      return {
        connected: this.sandboxMT5Connected,
        account_id: this.sandboxBrokerInfo.account_id,
        broker: this.sandboxBrokerInfo.broker_name,
        server: this.sandboxBrokerInfo.server,
        currency: 'USD',
        balance: 10000.0,
        equity: 10055.50,
        margin: 240.0,
        free_margin: 9815.50,
        margin_level_pct: 4189.7,
        leverage: 500,
        open_positions_count: this.sandboxPositions.length,
        connection_time: new Date().toISOString(),
      };
    }
    return this.request<MT5AccountStatus>('/api/broker/mt5/status');
  }

  // Dashboard & Positions
  async getDashboard(): Promise<DashboardData> {
    if (this.isSandbox()) {
      const totalUnrealized = this.sandboxPositions.reduce((acc, p) => acc + p.unrealized_pnl, 0);
      return {
        portfolio: {
          equity_usd: 10000.0 + totalUnrealized,
          equity_kes: (10000.0 + totalUnrealized) * 130.0,
          balance_usd: 10000.0,
          daily_pnl_usd: 55.50 + totalUnrealized,
          daily_pnl_kes: (55.50 + totalUnrealized) * 130.0,
          daily_pnl_pct: parseFloat((( (55.50 + totalUnrealized) / 10000.0) * 100).toFixed(2)),
          target_reached: (55.50 + totalUnrealized) >= 100.0,
          house_money_mode: true,
          drawdown_pct: 0.45,
          high_water_mark: 10120.0,
          circuit_breaker_active: false,
          trading_paused: this.sandboxEnginePaused,
          open_positions_count: this.sandboxPositions.length,
          win_rate_pct: 73.8,
          profit_factor: 2.45,
          sharpe_ratio: 2.12,
        },
        intelligence: {
          regime_state: 'Bullish Momentum Expansion',
          hurst_exponent: 0.68,
          hurst_label: 'Trending (Persistent)',
          volatility_state: 'Normal Dynamic ATR',
          active_session: 'London / NY Overlap',
          news_panic: false,
          event_blackout: false,
          next_macro_event: 'US CPI in 18 hrs',
        },
        broker: {
          connected: this.sandboxMT5Connected,
          broker_name: this.sandboxBrokerInfo.broker_name,
          server: this.sandboxBrokerInfo.server,
          account_id: this.sandboxBrokerInfo.account_id,
          leverage: this.sandboxBrokerInfo.leverage,
        },
      };
    }
    return this.request<DashboardData>('/api/dashboard/overview');
  }

  async getPositions(): Promise<{ positions: Position[] }> {
    if (this.isSandbox()) {
      // Simulate micro-fluctuations in sandbox PnL
      const jittered = this.sandboxPositions.map((p) => {
        const delta = (Math.random() - 0.48) * 0.4;
        const newPnl = parseFloat((p.unrealized_pnl + delta).toFixed(2));
        return { ...p, unrealized_pnl: newPnl };
      });
      this.sandboxPositions = jittered;
      return { positions: jittered };
    }
    return this.request<{ positions: Position[] }>('/api/positions');
  }

  async closePosition(positionId: string): Promise<{ success: boolean; message: string }> {
    if (this.isSandbox()) {
      const idx = this.sandboxPositions.findIndex((p) => p.position_id === positionId);
      if (idx !== -1) {
        const [removed] = this.sandboxPositions.splice(idx, 1);
        this.sandboxTrades.unshift({
          trade_id: 'trd_sim_' + Date.now(),
          symbol: removed.symbol,
          direction: removed.type,
          entry_price: removed.open_price,
          exit_price: removed.current_price,
          lots: removed.volume,
          pnl_usd: removed.unrealized_pnl,
          pnl_pct: parseFloat(((removed.unrealized_pnl / 1000) * 100).toFixed(2)),
          pnl_kes: removed.unrealized_pnl * 130,
          strategy: 'Manual User Close',
          closed_at: new Date().toISOString(),
          reason: 'Closed via Mobile Cockpit',
        });
        return { success: true, message: `Position ${removed.symbol} closed successfully in sandbox.` };
      }
      return { success: false, message: 'Position not found' };
    }
    return this.request<{ success: boolean; message: string }>(`/api/positions/${positionId}/close`, {
      method: 'POST',
    });
  }

  // Controls & Emergency
  async pauseTrading(): Promise<{ success: boolean; status: string; message: string }> {
    if (this.isSandbox()) {
      this.sandboxEnginePaused = true;
      return { success: true, status: 'paused', message: 'Engine paused in sandbox mode.' };
    }
    return this.request('/api/engine/pause', { method: 'POST' });
  }

  async resumeTrading(): Promise<{ success: boolean; status: string; message: string }> {
    if (this.isSandbox()) {
      this.sandboxEnginePaused = false;
      return { success: true, status: 'active', message: 'Engine resumed in sandbox mode.' };
    }
    return this.request('/api/engine/resume', { method: 'POST' });
  }

  async closeAllEmergency(): Promise<{ success: boolean; closed_count: number; message: string }> {
    if (this.isSandbox()) {
      const count = this.sandboxPositions.length;
      this.sandboxPositions = [];
      this.sandboxEnginePaused = true;
      return { success: true, closed_count: count, message: `Emergency triggered: closed ${count} positions and halted trading.` };
    }
    return this.request('/api/engine/close-all', { method: 'POST' });
  }

  // History & Settings
  async getTradeHistory(): Promise<{ trades: TradeHistoryItem[] }> {
    if (this.isSandbox()) {
      return { trades: this.sandboxTrades };
    }
    return this.request<{ trades: TradeHistoryItem[] }>('/api/trades/history');
  }

  async getRiskSettings(): Promise<RiskSettings> {
    if (this.isSandbox()) {
      return this.sandboxRiskSettings;
    }
    return this.request<RiskSettings>('/api/settings/risk');
  }

  async updateRiskSettings(settings: RiskSettings): Promise<{ success: boolean; settings: RiskSettings }> {
    if (this.isSandbox()) {
      this.sandboxRiskSettings = { ...this.sandboxRiskSettings, ...settings };
      return { success: true, settings: this.sandboxRiskSettings };
    }
    return this.request('/api/settings/risk', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  // Alpha Radar: Intermarket Lead-Lag & Liquidity
  async getRadarOverview(): Promise<RadarData> {
    if (this.isSandbox()) {
      return {
        lead_lag: [
          {
            lead_symbol: 'DXY',
            lag_symbol: 'EURUSD',
            correlation: -0.92,
            lead_impulse_zscore: -1.84,
            lag_spread_zscore: 2.15,
            divergence_detected: true,
            predicted_direction: 'BUY',
            estimated_latency_window_sec: 24,
            confidence: 0.89,
            rationale: 'DXY Dollar Index dumped -1.84σ via futures order flow. EURUSD expected to surge in ~24s.',
            target_move_pips: 28.5,
            updated_at: new Date().toISOString(),
          },
          {
            lead_symbol: 'US10Y',
            lag_symbol: 'XAUUSD',
            correlation: -0.94,
            lead_impulse_zscore: -2.10,
            lag_spread_zscore: 2.45,
            divergence_detected: true,
            predicted_direction: 'BUY',
            estimated_latency_window_sec: 38,
            confidence: 0.92,
            rationale: 'US 10-Year Treasury Yield dropped sharply. Gold real-yield impulse triggered ahead of retail broker feed.',
            target_move_pips: 65.0,
            updated_at: new Date().toISOString(),
          },
          {
            lead_symbol: 'BTCUSD',
            lag_symbol: 'ETHUSD',
            correlation: 0.89,
            lead_impulse_zscore: 1.72,
            lag_spread_zscore: 1.90,
            divergence_detected: true,
            predicted_direction: 'BUY',
            estimated_latency_window_sec: 45,
            confidence: 0.84,
            rationale: 'Institutional BTC Spot volume breakout. ETH/USDT perpetual lagging by 45s.',
            target_move_pips: 42.0,
            updated_at: new Date().toISOString(),
          },
          {
            lead_symbol: 'USOIL',
            lag_symbol: 'USDCAD',
            correlation: -0.86,
            lead_impulse_zscore: 1.45,
            lag_spread_zscore: 1.60,
            divergence_detected: false,
            predicted_direction: 'HOLD',
            estimated_latency_window_sec: 18,
            confidence: 0.68,
            rationale: 'Crude Oil in steady accumulation. USDCAD spread within normal equilibrium.',
            target_move_pips: 15.0,
            updated_at: new Date().toISOString(),
          },
        ],
        liquidity: [
          {
            pool_id: 'pool_xau_01',
            symbol: 'XAUUSD',
            pool_type: 'ASIAN_SESSION_LOW',
            price_level: 2638.50,
            status: 'SWEPT_AND_REJECTED',
            action: 'INSTITUTIONAL_BUY_EXECUTED',
            entry_price: 2640.20,
            stop_loss: 2637.10,
            take_profit: 2658.00,
            risk_reward: 5.74,
            volume_surge: 2.4,
            description: 'Retail sell-stops below Asian Low swept by 1.4 pips. Strong buyer wick rejection reclaimed level.',
          },
          {
            pool_id: 'pool_eur_01',
            symbol: 'EURUSD',
            pool_type: 'EQUAL_HIGHS (EQH)',
            price_level: 1.08860,
            status: 'AWAITING_SWEEP',
            action: 'MONITORING_TRAP',
            entry_price: undefined,
            stop_loss: undefined,
            take_profit: undefined,
            risk_reward: 3.8,
            volume_surge: 1.0,
            description: 'Heavy retail stop-loss liquidity cluster above 1.08860. Bot is waiting for stop hunt before shorting.',
          },
          {
            pool_id: 'pool_gbp_01',
            symbol: 'GBPUSD',
            pool_type: 'PREVIOUS_DAY_LOW (PDL)',
            price_level: 1.30180,
            status: 'SWEPT_AND_REJECTED',
            action: 'INSTITUTIONAL_BUY_EXECUTED',
            entry_price: 1.30240,
            stop_loss: 1.30120,
            take_profit: 1.30820,
            risk_reward: 4.83,
            volume_surge: 1.9,
            description: 'London Open swept PDL, flushed weak hands, and reclaimed within 2 candles.',
          },
        ],
        active_edge: 'Intermarket Asymmetry + Smart Money Traps Active',
        institutional_win_probability: '71.4%',
        average_rrr: '1:3.4',
      };
    }
    return this.request<RadarData>('/api/radar/overview');
  }

  // ── Candlestick & Live Market Feeds ──────────────────────────────────────
  async getCandles(symbol: string = 'XAUUSD', timeframe: string = '15m'): Promise<MarketCandlesResponse> {
    return this.request<MarketCandlesResponse>(`/api/market/candles?symbol=${symbol}&timeframe=${timeframe}`);
  }

  // ── Manual Order Placement ──────────────────────────────────────────────
  async openManualOrder(payload: ManualOrderPayload): Promise<{ success: boolean; position: Position; message: string }> {
    return this.request<{ success: boolean; position: Position; message: string }>('/api/orders/place', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // ── Engine Mode Switcher (Autopilot vs Manual Co-Pilot) ───────────────────
  async getEngineMode(): Promise<{ mode: 'autopilot' | 'manual' }> {
    if (this.isSandbox()) {
      const saved = localStorage.getItem('volt_engine_mode') as 'autopilot' | 'manual';
      return { mode: saved || 'autopilot' };
    }
    try {
      return await this.request<{ mode: 'autopilot' | 'manual' }>('/api/engine/mode');
    } catch {
      return { mode: 'autopilot' };
    }
  }

  async setEngineMode(mode: 'autopilot' | 'manual'): Promise<{ success: boolean; mode: 'autopilot' | 'manual' }> {
    localStorage.setItem('volt_engine_mode', mode);
    if (this.isSandbox()) {
      return { success: true, mode };
    }
    try {
      return await this.request<{ success: boolean; mode: 'autopilot' | 'manual' }>('/api/engine/mode', {
        method: 'POST',
        body: JSON.stringify({ mode }),
      });
    } catch {
      return { success: true, mode };
    }
  }
}


export const api = new QuantApiClient();
