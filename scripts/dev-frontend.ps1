# scripts/dev-frontend.ps1 — Chinar Agro AI Frontend Development Startup
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot "frontend"
Set-Location $frontendDir

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Chinar Agro AI - Frontend Dev Launcher" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Stop stale node listener on port 3000
$conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    $pidToKill = $conn.OwningProcess
    try {
        $p = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
        if ($p -and $p.ProcessName -like "*node*") {
            Write-Host "Stopping existing frontend dev server PID $pidToKill on port 3000..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

# 2. Ensure .env.local exists with port 8010
$envLocalPath = Join-Path $frontendDir ".env.local"
if (-not (Test-Path $envLocalPath)) {
    Set-Content -Path $envLocalPath -Value "REACT_APP_API_URL=http://127.0.0.1:8010"
}

Write-Host "Starting React development server on http://localhost:3000..." -ForegroundColor Green
$env:BROWSER = "none"
npm start
