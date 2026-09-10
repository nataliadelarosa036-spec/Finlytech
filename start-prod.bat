@echo off
title Finlytech — Produccion
color 0A

echo.
echo  ========================================
echo   FINLYTECH — Iniciando en produccion
echo  ========================================
echo.

REM ── 1. Build frontend ──────────────────────────────────────────────────────
echo [1/3] Compilando frontend (Vite)...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: El build del frontend fallo.
    pause
    exit /b 1
)
echo        Frontend compilado OK

REM ── 2. Build backend ───────────────────────────────────────────────────────
echo [2/3] Compilando backend (TypeScript)...
cd backend
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: El build del backend fallo.
    pause
    exit /b 1
)
echo        Backend compilado OK

REM ── 3. Copiar .env.production como .env activo ─────────────────────────────
echo [3/3] Cargando configuracion de produccion...
copy /Y .env.production .env >nul
cd ..

REM ── 4. Arrancar servidor ───────────────────────────────────────────────────
echo.
echo  Servidor iniciando en http://localhost:3001
echo  Presiona Ctrl+C para detener.
echo.
node backend\dist\server.js
pause
