@echo off
cd /d "%~dp0"
if not exist node_modules call npm ci
if errorlevel 1 goto end
call npm run build
:end
pause
