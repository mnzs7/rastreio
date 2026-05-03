# RastreioApp - Script de desenvolvimento local
# Uso: .\dev.ps1
# Para parar: feche as janelas ou Ctrl+C em cada uma

$root = $PSScriptRoot

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  RastreioApp - Iniciando ambiente de dev" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Iniciando Backend (porta 3000)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; npm run start:dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[2/2] Iniciando Frontend (porta 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Swagger:  http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Duas janelas foram abertas. Feche-as para parar os servicos." -ForegroundColor Yellow
