@echo off
REM ============================================================================
REM Helper Script: Start Docker Desktop
REM ============================================================================

echo Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo.
echo Waiting for Docker to be ready...
echo This may take 30-60 seconds...
echo.

set /a elapsed=0
set /a max_wait=120

:wait_loop
if %elapsed% geq %max_wait% (
    echo.
    echo [WARNING] Docker Desktop is taking longer than expected
    echo Please check if Docker Desktop is running in your system tray
    pause
    exit /b 1
)

docker info >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [SUCCESS] Docker Desktop is ready!
    echo You can now run: install_setu.bat
    echo.
    pause
    exit /b 0
)

echo|set /p="."
timeout /t 3 /nobreak >nul
set /a elapsed+=3
goto wait_loop
