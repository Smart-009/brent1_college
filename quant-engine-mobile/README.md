# 📱 Éclat Quant Engine — Mobile Android System

## Architecture: Zero Local Hosting Automated Trading

The **Éclat Quant Engine Mobile App** delivers institutional-grade quantitative control directly to your Android device, eliminating any requirement to keep a local Windows PC running 24/7.

---

### System Topology

```
┌─────────────────────────────────┐
│     Android Device / Tablet     │
│   (React + TypeScript + Cap)    │
│  - Live Telemetry Cockpit       │
│  - 1-Tap Broker Connect         │
│  - Stealth Trailing Ratchet     │
│  - 1-Tap Emergency Panic Button │
└────────────────┬────────────────┘
                 │ Secure TLS JSON / REST
                 ▼
┌─────────────────────────────────┐
│     Cloud Quant Backend API     │
│   (FastAPI + SQLite WAL DB)     │
│  - Multi-Tenant Authentication  │
│  - Signal Processing Pipeline   │
│  - Risk Governance & Gates      │
│  - Performance Tracking         │
└────────────────┬────────────────┘
                 │ High-Speed Cloud Socket
                 ▼
┌─────────────────────────────────┐
│   Cloud MT5 Gateway (MetaApi)   │
│  - Connects to any MT5 Server   │
│    (Exness, IC Markets, FTMO)   │
│  - 24/5 Automated Execution     │
│  - Zero Local Software Needed   │
└─────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Start the Cloud API Backend
In terminal 1:
```powershell
cd "c:\Users\egerton\Desktop\ECLAT WEBSITE\quant_engine"
python run_cloud_api.py
```
* **API Server**: `http://localhost:8000`
* **Interactive Docs**: `http://localhost:8000/docs`

---

### 2. Run the Mobile App in Dev Mode (Browser Preview)
In terminal 2:
```powershell
cd "c:\Users\egerton\Desktop\ECLAT WEBSITE\quant-engine-mobile"
npm run dev
```
Open `http://localhost:3000` in your browser. Toggle mobile responsive view in developer tools (F12) to test touch ergonomics.

---

### 3. Build & Run on Android Device / Emulator
Ensure an Android device with USB debugging or an Android Virtual Device (AVD) is running:

```powershell
cd "c:\Users\egerton\Desktop\ECLAT WEBSITE\quant-engine-mobile"

# Sync latest web assets into the Android native wrapper
npm run cap:sync

# Option A: Open directly in Android Studio
npm run android:open

# Option B: Build APK via Gradle command line
cd android
.\gradlew assembleDebug
# Generated APK: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Mobile App Screens & Features

1. **Authentication Screen (`AuthScreen.tsx`)**:
   - Secure account registration & login.
   - Issues JWT token stored securely on device.

2. **Cloud Broker & MT5 Connector (`BrokerConnectScreen.tsx`)**:
   - Auto-selects major brokers: **Exness**, **IC Markets**, **FTMO**, **Pepperstone**, or custom servers.
   - Enter **Server**, **Account #**, and **Password** to link automatically without local MT5 software.
   - Displays live Free Margin, Margin Level %, and Leverage.

3. **The Live Cockpit (`DashboardScreen.tsx`)**:
   - Live Equity & Balance display with dual **USD (\$)** and **KES (Ksh)** currency toggle.
   - Glowing State Badges:
     - `🔥 HOUSE MONEY (50% RISK)` (appears when daily profit target is reached).
     - `🛡️ CIRCUIT BREAKER: NORMAL` (-3% daily safety boundary).
     - `⚡ REGIME: BULL_MOMENTUM / CHOP_RANGING`.
   - Real-time engine state toggle: **Pause / Resume**.

4. **Active Positions & Trailing Ratchet (`PositionsScreen.tsx`)**:
   - Visual inspection of open trades.
   - Displays Stage 1 (TP1 50% scale-out), Stage 2 (Risk-free stop lock), and Stage 3 (Chandelier trailing stop ratchet).
   - One-tap individual trade exit.

5. **Risk Governance (`RiskSettingsScreen.tsx`)**:
   - Max Risk % per trade slider (0.2% - 3.0%).
   - Daily Loss Circuit Breaker slider (-1.0% - -5.0%).
   - Half-Kelly sizing toggle and Chandelier trailing stop engine toggle.

6. **Emergency Mobile Killswitch (`PanicButton.tsx`)**:
   - Prominent floating action button available across all screens.
   - Market-closes 100% of open positions immediately, realizes cash balance, and engages Safe Pause for the remainder of the day.

7. **Audit History (`HistoryScreen.tsx`)**:
   - Full trade history with realized PnL, lot sizing, and strategy exit reason.
