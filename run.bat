@echo off
setlocal
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo <--installing dependencies-->
call npm install
echo.
echo <--starting expo-->
echo.
(
    timeout /t 8 /nobreak >nul
    echo w
) | npm start

pause
