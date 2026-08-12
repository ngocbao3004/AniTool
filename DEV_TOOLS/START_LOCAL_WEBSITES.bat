@echo off
setlocal

set "ANITOOL_ROOT=%~dp0.."

where python >nul 2>&1
if errorlevel 1 (
    echo Python was not found on this computer.
    echo Install Python or ask Codex to update this launcher.
    pause
    exit /b 1
)

start "AniTool Local Server" /min cmd /k "cd /d ""%ANITOOL_ROOT%"" && python -m http.server 5500"

timeout /t 2 /nobreak >nul
start "" "http://localhost:5500/WEBSITE/Site/"
start "" "http://localhost:5500/WEBSITE/CMS/"

endlocal
