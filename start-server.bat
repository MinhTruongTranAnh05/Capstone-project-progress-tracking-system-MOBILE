@echo off
title MatchPoint FPT Mobile Server
cd /d "%~dp0"
echo ========================================================
echo   Starting MatchPoint FPT Mobile Tunnel Server
echo ========================================================
echo.
set EXPO_TOKEN=nqqaMwoKO_vIO3s3op02rkk4Jb_nLMHrzzNFGAgg

echo 1. Checking Backend Cloudflare Tunnel...
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Cloudflare tunnel is already running.
) else (
    echo Starting Cloudflare tunnel for Backend on port 8081...
    start "Cloudflare Tunnel (Backend 8081)" "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:8081
)

echo.
echo 2. Starting Expo Metro Bundler in Tunnel Mode...
echo Phones anywhere can scan the QR code to open the app!
echo.
call npm run start:tunnel
pause
