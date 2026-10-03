@echo off
title Library Management System - Project Launcher
echo =======================================================
echo    LIBRARY MANAGEMENT SYSTEM WITH RFID INTEGRATION
echo =======================================================
echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server - Library API" cmd /k "cd backend && npm start"

timeout /t 2 >nul

echo Starting Frontend Dev Server (Port 5173)...
start "Frontend Client - React Vite" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo =======================================================
echo Both Backend and Frontend servers are running!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo =======================================================
pause
