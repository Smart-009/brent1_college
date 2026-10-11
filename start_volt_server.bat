@echo off
title VOLT Quant Engine - Cloud Gateway Server
echo ========================================================
echo   VOLT QUANT ENGINE - CLOUD GATEWAY SERVER
echo   Listening on: http://0.0.0.0:8000
echo   LAN IP:       http://192.168.0.119:8000
echo   Swagger Docs: http://localhost:8000/docs
echo ========================================================
echo.
python -m uvicorn quant_engine.server.api:app --host 0.0.0.0 --port 8000
pause
