@echo off
setlocal
cd /d "%~dp0"
title ASH IRON - Iteration 1.0.1
where node >nul 2>nul
if errorlevel 1 (
 start "" "%~dp0CONTROL.html"
 exit /b 0
)
node server.mjs
if errorlevel 1 pause
endlocal
