@echo off
echo ============================================
echo   PC Monitor - Dev / Preview Mode
echo ============================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies first...
    call npm install
)

echo Launching PC Monitor...
call npm start
