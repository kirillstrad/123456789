@echo off
cd /d "%~dp0"
if not exist node_modules\typescript\bin\tsc call npm install
if errorlevel 1 goto end
call npm run build
:end
pause
