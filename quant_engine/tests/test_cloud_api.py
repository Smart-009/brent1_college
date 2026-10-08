"""
tests/test_cloud_api.py
=======================
Automated test suite verifying the Cloud Quant API for mobile Android clients.
"""

import pytest
from fastapi.testclient import TestClient
from server.api import app


def test_auth_register_and_login():
    with TestClient(app) as client:
        # 1. Register a new user
        reg_payload = {
            "name": "Jane Doe Quant",
            "email": "janedoe@example.com",
            "password": "Password123!",
        }
        res = client.post("/api/auth/register", json=reg_payload)
        assert res.status_code in (201, 400)  # 400 if already registered

        # 2. Login
        login_payload = {
            "email": "janedoe@example.com",
            "password": "Password123!",
        }
        res_login = client.post("/api/auth/login", json=login_payload)
        assert res_login.status_code == 200
        data = res_login.json()
        assert "token" in data
        assert data["user"]["email"] == "janedoe@example.com"


def test_mt5_cloud_connect_and_dashboard():
    with TestClient(app) as client:
        # Login to get token
        res_login = client.post("/api/auth/login", json={
            "email": "janedoe@example.com",
            "password": "Password123!",
        })
        token = res_login.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Connect MT5
        connect_payload = {
            "broker_name": "Exness",
            "server": "Exness-Real10",
            "login": "14258902",
            "password": "TraderPassword123!",
            "platform": "mt5",
        }
        res_conn = client.post("/api/broker/mt5/connect", json=connect_payload, headers=headers)
        assert res_conn.status_code == 200
        conn_data = res_conn.json()
        assert conn_data["connected"] is True
        assert conn_data["broker"] == "Exness"
        assert conn_data["account_id"] == "14258902"

        # Get Dashboard Overview
        res_dash = client.get("/api/dashboard/overview", headers=headers)
        assert res_dash.status_code == 200
        dash_data = res_dash.json()
        assert "portfolio" in dash_data
        assert "intelligence" in dash_data
        assert "broker" in dash_data
        assert dash_data["portfolio"]["equity_usd"] > 0
        assert dash_data["broker"]["connected"] is True

        # Get Positions
        res_pos = client.get("/api/positions", headers=headers)
        assert res_pos.status_code == 200
        pos_data = res_pos.json()
        assert len(pos_data["positions"]) >= 1

        # Emergency Close All
        res_close_all = client.post("/api/engine/close-all", headers=headers)
        assert res_close_all.status_code == 200
        assert res_close_all.json()["success"] is True
