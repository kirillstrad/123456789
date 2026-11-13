@echo off
setlocal
cd /d "%~dp0"
title ASH IRON - The Nave - ASCII 196
where node >nul 2>nul
if errorlevel 1 (
 echo Opening the bundled offline version.
 start "" "%~dp0PLAY.html"
 exit /b 0
)
node server.mjs
if errorlevel 1 pause
endlocal
