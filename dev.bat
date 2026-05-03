@echo off
title RastreioApp - Dev

echo ============================================
echo   RastreioApp - Iniciando ambiente de dev
echo ============================================
echo.

REM Verifica se o banco esta rodando (opcional)
echo [1/2] Iniciando Backend (porta 3000)...
start "BACKEND" cmd /k "cd /d %~dp0backend && npm run start:dev"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (porta 5173)...
start "FRONTEND" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo  Backend:  http://localhost:3000
echo  Frontend: http://localhost:5173
echo  Swagger:  http://localhost:3000/api/docs
echo ============================================
echo.
echo Duas janelas foram abertas. Feche-as para parar os servicos.
pause
