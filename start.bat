@echo off
title ZyronByte AI Studio - Launcher
color 0b

echo =====================================================================
echo                ZYRONBYTE AI STUDIO - GAMING AUTOMATOR
echo =====================================================================
echo.
echo Channel: ZyronByteYT
echo Initializing backend and dashboard services...
echo.

cd /d "%~dp0"

:: Start FastAPI Backend on Port 8000
echo [1/2] Starting FastAPI Backend Automation Server (Port 8000)...
start "ZyronByte AI Backend" /min cmd /c "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Give backend 2 seconds to initialize database & scheduler
timeout /t 2 /nobreak >nul

:: Open Browser to ZyronByte Studio Dashboard
echo [2/2] Opening ZyronByte AI Studio in your browser...
start http://localhost:8000

echo.
echo =====================================================================
echo  Studio is active and running!
echo  Dashboard: http://localhost:8000 (or http://localhost:5173 for Vite dev)
echo  API Documentation: http://localhost:8000/docs
echo =====================================================================
echo  Press any key to stop all background services...
pause >nul

taskkill /f /im uvicorn.exe >nul 2>&1
echo Studio services stopped.
