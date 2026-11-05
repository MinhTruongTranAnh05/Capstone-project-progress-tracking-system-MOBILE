# MatchPoint FPT Server Launcher
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Starting MatchPoint FPT Mobile Tunnel Server" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check or start Cloudflare Tunnel
$cloudflared = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($null -ne $cloudflared) {
    Write-Host "[OK] Cloudflare tunnel is already active." -ForegroundColor Green
} else {
    Write-Host "[..] Starting Cloudflare tunnel for Backend (port 8081)..." -ForegroundColor Yellow
    Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:8081"
}

# 2. Run Expo in Tunnel Mode
Write-Host "[..] Starting Expo Metro Bundler in Tunnel Mode..." -ForegroundColor Yellow
Write-Host "Devices anywhere (4G/Wi-Fi) can scan the QR code to open the app!" -ForegroundColor Green
npm run start:tunnel
