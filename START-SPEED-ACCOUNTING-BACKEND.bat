@echo off
cd /d "%~dp0"
echo Starting Speed Accounting backend...
echo Opening Speed Accounting in your browser...
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:8765/'"
python backend\server.py
echo.
pause
