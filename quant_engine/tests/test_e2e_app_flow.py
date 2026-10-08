"""
tests/test_e2e_app_flow.py
==========================
End-to-End User Journey Simulation for the Quant Mobile App & Cloud Engine.
Simulates all user interactions performed via the Android application interface.
"""

import sys
import uuid
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure quant_engine root is in path
sys.path.insert(0, str(Path(__file__).parent.parent))

from server.api import app


def test_full_mobile_app_user_journey():
    print("\n" + "=" * 65)
    print("  SIMULATING FULL MOBILE APP USER JOURNEY")
    print("=" * 65)

    with TestClient(app) as client:
        # ─────────────────────────────────────────────────────────────────
        # STEP 1: USER REGISTRATION (AuthScreen)
        # ─────────────────────────────────────────────────────────────────
        random_suffix = uuid.uuid4().hex[:6]
        user_email = f"trader_{random_suffix}@eclat.com"
        reg_payload = {
            "name": f"Quant Trader {random_suffix.upper()}",
            "email": user_email,
            "password": "SecurePassword123!",
        }

        print(f"\n[Step 1] Registering user: {user_email}...")
        res = client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 201, f"Registration failed: {res.text}"
        reg_data = res.json()
        assert "token" in reg_data
        token = reg_data["token"]
        user_id = reg_data["user"]["id"]
        print(f" -> SUCCESS: User created with ID: {user_id}")

        headers = {"Authorization": f"Bearer {token}"}

        # ─────────────────────────────────────────────────────────────────
        # STEP 2: VERIFY AUTH SESSION (/api/auth/me)
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 2] Verifying auth session...")
        res = client.get("/api/auth/me", headers=headers)
        assert res.status_code == 200
        me = res.json()
        assert me["email"] == user_email
        print(f" -> SUCCESS: Authenticated as {me['name']}")

        # ─────────────────────────────────────────────────────────────────
        # STEP 3: AUTO-CONNECT MT5 BROKER (BrokerConnectScreen)
        # User connects Exness MT5 account without local software
        # ─────────────────────────────────────────────────────────────────
        mt5_payload = {
            "broker_name": "Exness",
            "server": "Exness-Real10",
            "login": "14258902",
            "password": "ExnessLivePassword123!",
            "platform": "mt5",
        }
        print("\n[Step 3] Connecting MT5 Account (Exness-Real10 #14258902)...")
        res = client.post("/api/broker/mt5/connect", json=mt5_payload, headers=headers)
        assert res.status_code == 200
        mt5_data = res.json()
        assert mt5_data["connected"] is True
        assert mt5_data["broker"] == "Exness"
        assert mt5_data["balance"] >= 10000.0
        print(f" -> SUCCESS: MT5 Connected | Equity: ${mt5_data['equity']:,.2f} | Leverage: 1:{mt5_data['leverage']}")

        # ─────────────────────────────────────────────────────────────────
        # STEP 4: FETCH LIVE COCKPIT TELEMETRY (DashboardScreen)
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 4] Querying Live Dashboard Cockpit...")
        res = client.get("/api/dashboard/overview", headers=headers)
        assert res.status_code == 200
        dash = res.json()
        port = dash["portfolio"]
        intel = dash["intelligence"]

        assert port["equity_usd"] > 0
        assert port["equity_kes"] > 0
        assert port["circuit_breaker_active"] is False
        assert port["target_reached"] is True
        assert port["house_money_mode"] is True  # House Money Active!

        print(f" -> Live Equity: ${port['equity_usd']:,.2f} (KES {port['equity_kes']:,.2f})")
        print(f" -> Daily PnL: ${port['daily_pnl_usd']:+.2f} ({port['daily_pnl_pct']:+.2f}%)")
        print(f" -> House Money Mode: {'[ACTIVE]' if port['house_money_mode'] else 'OFF'}")
        print(f" -> Regime State: {intel['regime_state']} (H = {intel['hurst_exponent']})")
        print(f" -> Win Rate: {port['win_rate_pct']}% | Profit Factor: {port['profit_factor']}")

        # ─────────────────────────────────────────────────────────────────
        # STEP 5: MONITOR ACTIVE POSITIONS (PositionsScreen)
        # Inspect running trades and Chandelier trailing ratchets
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 5] Checking Open Managed Positions...")
        res = client.get("/api/positions", headers=headers)
        assert res.status_code == 200
        positions = res.json()["positions"]
        assert len(positions) == 2, f"Expected 2 open positions, found {len(positions)}"

        for pos in positions:
            print(f" -> Position: {pos['symbol']} {pos['type'].upper()} ({pos['volume']} lots)")
            print(f"    Entry: {pos['open_price']} | Mark: {pos['current_price']} | PnL: +${pos['unrealized_pnl']:.2f}")
            print(f"    Synthetic SL: {pos['stop_loss']} | Stage: {pos['stage']} | Risk-Free: {pos['risk_free']}")

        # ─────────────────────────────────────────────────────────────────
        # STEP 6: TEST REMOTE ENGINE CONTROLS (Pause / Resume)
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 6] Testing Engine Pause...")
        res = client.post("/api/engine/pause", headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "PAUSED"
        print(" -> SUCCESS: Trading engine paused successfully")

        print("[Step 6b] Testing Engine Resume...")
        res = client.post("/api/engine/resume", headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "ACTIVE"
        print(" -> SUCCESS: Trading engine resumed successfully")

        # ─────────────────────────────────────────────────────────────────
        # STEP 7: TEST RISK GOVERNANCE SETTINGS (RiskSettingsScreen)
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 7] Updating Risk Governance Boundaries...")
        risk_payload = {
            "max_risk_pct": 0.8,
            "max_daily_loss_pct": 2.5,
            "half_kelly": True,
            "leverage_forex": 3,
            "leverage_crypto": 5,
            "trailing_stop_enabled": True,
        }
        res = client.post("/api/settings/risk", json=risk_payload, headers=headers)
        assert res.status_code == 200
        updated_settings = res.json()["settings"]
        assert updated_settings["max_risk_pct"] == 0.8
        assert updated_settings["max_daily_loss_pct"] == 2.5
        print(f" -> SUCCESS: Risk parameters saved | Risk: {updated_settings['max_risk_pct']}% | Circuit Breaker: -{updated_settings['max_daily_loss_pct']}%")

        # ─────────────────────────────────────────────────────────────────
        # STEP 8: TEST EMERGENCY PANIC BUTTON (PanicButton.tsx)
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 8] Triggering Emergency 1-Tap Panic Button (/api/engine/close-all)...")
        res = client.post("/api/engine/close-all", headers=headers)
        assert res.status_code == 200
        panic_result = res.json()
        assert panic_result["success"] is True
        assert panic_result["status"] == "EMERGENCY_HALT"
        print(f" -> SUCCESS: Liquidated {panic_result['closed_count']} open positions | All cash banked")

        # Verify all positions are closed now
        res = client.get("/api/positions", headers=headers)
        assert len(res.json()["positions"]) == 0
        print(" -> SUCCESS: Open position count verified at 0")

        # ─────────────────────────────────────────────────────────────────
        # STEP 9: AUDIT LOG VERIFICATION (HistoryScreen)
        # ─────────────────────────────────────────────────────────────────
        print("\n[Step 9] Verifying Historical Trade Records...")
        res = client.get("/api/trades/history", headers=headers)
        assert res.status_code == 200
        trades = res.json()["trades"]
        assert len(trades) > 0
        print(f" -> SUCCESS: Retrieved {len(trades)} historical trade audit records")

    print("\n" + "=" * 65)
    print("  ALL END-TO-END MOBILE APP FLOWS PASSED WITH 100% SUCCESS!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    test_full_mobile_app_user_journey()
