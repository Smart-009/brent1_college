"""
quant_engine/server/auth.py
===========================
User Authentication and Token Management for Multi-Tenant Quant Mobile Service.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import time
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import aiosqlite
from pydantic import BaseModel

DB_PATH = Path("db/users.sqlite")
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_hex(32))


class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    created_at: str
    has_mt5: bool = False
    has_crypto: bool = False
    trading_enabled: bool = True


def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    ).hex()
    return hashed, salt


def verify_password(password: str, hashed: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(new_hash, hashed)


def create_access_token(user_id: str, email: str, expires_in_seconds: int = 86400 * 30) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "exp": int(time.time()) + expires_in_seconds,
        "iat": int(time.time()),
    }
    header_bytes = urlsafe_b64encode(json.dumps(header).encode("utf-8")).rstrip(b"=")
    payload_bytes = urlsafe_b64encode(json.dumps(payload).encode("utf-8")).rstrip(b"=")
    signature = hmac.new(
        JWT_SECRET.encode("utf-8"),
        f"{header_bytes.decode()}.{payload_bytes.decode()}".encode("utf-8"),
        hashlib.sha256,
    ).digest()
    sig_bytes = urlsafe_b64encode(signature).rstrip(b"=")
    return f"{header_bytes.decode()}.{payload_bytes.decode()}.{sig_bytes.decode()}"


def decode_access_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        expected_sig = hmac.new(
            JWT_SECRET.encode("utf-8"),
            f"{header_b64}.{payload_b64}".encode("utf-8"),
            hashlib.sha256,
        ).digest()
        
        # Add padding back if necessary
        sig_padding = len(sig_b64) % 4
        if sig_padding != 0:
            sig_b64 += "=" * (4 - sig_padding)
        sig = urlsafe_b64decode(sig_b64)
        
        if not hmac.compare_digest(expected_sig, sig):
            return None

        payload_padding = len(payload_b64) % 4
        if payload_padding != 0:
            payload_b64 += "=" * (4 - payload_padding)
        payload = json.loads(urlsafe_b64decode(payload_b64).decode("utf-8"))

        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


async def init_auth_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS broker_connections (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                broker_type TEXT NOT NULL, -- 'mt5' | 'binance' | 'alpaca'
                account_id TEXT NOT NULL,
                server_name TEXT,
                encrypted_token TEXT,
                status TEXT NOT NULL, -- 'connected' | 'error' | 'disconnected'
                created_at TEXT NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            );
            """
        )
        await db.commit()
