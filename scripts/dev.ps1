# scripts/dev.ps1 — Chinar Agro AI Backend Development Startup
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Chinar Agro AI - Backend Dev Launcher" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Stop stale listeners on 8000 and 8010
$ports = @(8000, 8010)
$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort }
foreach ($conn in $connections) {
    $pidToKill = $conn.OwningProcess
    try {
        $p = Get-Process -Id $pidToKill -ErrorAction SilentlyContinue
        if ($p -and $p.ProcessName -like "*python*") {
            Write-Host "Stopping stale listener PID $pidToKill on port $($conn.LocalPort)..." -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    } catch {}
}

# 2. Verify venv Python
$venvPython = Join-Path $repoRoot "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment Python not found at: $venvPython"
    exit 1
}

# 3. Ensure logs directory
$logDir = Join-Path $repoRoot "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}
$backendLog = Join-Path $logDir "backend.log"

Write-Host "Starting Uvicorn backend on port 8010 using venv Python..." -ForegroundColor Green
$pyArgs = "-u -m uvicorn ai_api.api:app --host 127.0.0.1 --port 8010"
$proc = Start-Process -FilePath $venvPython `
    -ArgumentList "-u", "-m", "uvicorn", "ai_api.api:app", "--host", "127.0.0.1", "--port", "8010" `
    -RedirectStandardOutput $backendLog `
    -RedirectStandardError (Join-Path $logDir "backend_err.log") `
    -WorkingDirectory $repoRoot `
    -PassThru

Write-Host "Backend process launched with PID $($proc.Id). Waiting for /health..." -ForegroundColor Gray

# 4. Wait for /health
$timeoutSec = 35
$sw = [System.Diagnostics.Stopwatch]::StartNew()
$health = $null
while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:8010/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($health) { break }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $health) {
    Write-Host "`nBackend failed to respond within $timeoutSec seconds. Last log lines:" -ForegroundColor Red
    if (Test-Path $backendLog) {
        Get-Content $backendLog -Tail 25
    }
    exit 1
}

Write-Host "`nBackend is LIVE on port $($health.port)!" -ForegroundColor Green
Write-Host "-----------------------------------------" -ForegroundColor Cyan
Write-Host "  Python:       $($health.python_executable)"
Write-Host "  Disease:      $($health.disease_model)"
Write-Host "  Crop Model:   $($health.crop_model)"
Write-Host "  Yield Model:  $($health.yield_model)"
Write-Host "  Yield Pipe:   $($health.yield_pipeline)"
Write-Host "  Ensemble:     $($health.ensemble_models)"
Write-Host "-----------------------------------------" -ForegroundColor Cyan
