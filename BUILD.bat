@echo off
echo ============================================
echo   PC Monitor - Build Script
echo ============================================
echo.

:: Check Node is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download it from https://nodejs.org and install it first.
    pause
    exit /b 1
)

echo [1/4] Node.js found: 
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [3/4] Building Windows installer + portable .exe...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo [4/4] Done!
echo.
echo Output files are in the "dist" folder:
echo   - PC Monitor Setup.exe   (installer for both PCs)
echo   - PC Monitor.exe         (portable, no install needed)
echo.
pause
