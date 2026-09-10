@echo off
title Finlytech — Desarrollo
color 0B

echo.
echo  ========================================
echo   FINLYTECH — Modo desarrollo
echo  ========================================
echo.
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:3001
echo.

REM Arranca el backend en una ventana separada
start "Finlytech Backend" cmd /k "cd /d %~dp0backend && npm run dev"

REM Espera 2 segundos para que el backend inicie
timeout /t 2 /nobreak >nul

REM Arranca el frontend
cd /d %~dp0
npm run dev
