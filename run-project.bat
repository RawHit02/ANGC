@echo off
echo 🧹 Cleaning up old server instances...
taskkill /f /im node.exe >nul 2>&1

SET "NODE_PATH=C:\Program Files\nodejs"
SET "PATH=%NODE_PATH%;%PATH%"

echo 🚀 Starting ANGC Synapse Backend...
echo 📁 Working Directory: %~dp0server
cd /d "%~dp0server"

if not exist "node_modules" (
    echo 📦 Missing node_modules. Installing dependencies...
    call npm install
)

echo ⚡ Starting Backend...
start /b node server.js

echo 🌐 Opening Website...
start http://localhost:3000

echo.
echo --------------------------------------------------
echo ✅ BACKEND RUNNING: http://localhost:3000
echo ✅ FRONTEND OPENED: index.html
echo --------------------------------------------------
echo.
echo View visitor logs in this window. Press Ctrl+C to stop.
echo.
pause
