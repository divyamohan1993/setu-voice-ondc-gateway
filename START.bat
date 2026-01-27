@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - Setup Launcher
REM ============================================================================
REM 
REM This script launches the main PowerShell setup script.
REM Double-click this file or run it from Command Prompt.
REM
REM Project: Setu Voice-to-ONDC Gateway
REM Repository: https://github.com/divyamohan1993/setu-voice-ondc-gateway
REM Contributors: divyamohan1993, kumkum-thakur
REM Hackathon: AI for Bharat - Republic Day 2026
REM
REM ============================================================================

title Setu Voice-to-ONDC Gateway Setup

echo.
echo ============================================================================
echo    Setu Voice-to-ONDC Gateway - Setup Launcher
echo    AI for Bharat Hackathon - Republic Day 2026
echo ============================================================================
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PowerShell is not available on this system.
    echo Please install PowerShell or run setup.ps1 manually.
    pause
    exit /b 1
)

REM Check if setup.ps1 exists
if not exist "%~dp0setup.ps1" (
    echo ERROR: setup.ps1 not found in %~dp0
    echo Please ensure you're running this from the repository root.
    pause
    exit /b 1
)

echo Launching PowerShell setup script...
echo.

REM Run the PowerShell script with execution policy bypass for this session
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0setup.ps1" %*

REM Capture the exit code
set EXIT_CODE=%ERRORLEVEL%

echo.
if %EXIT_CODE% EQU 0 (
    echo Setup completed successfully!
) else (
    echo Setup encountered errors. Exit code: %EXIT_CODE%
)

echo.
pause
exit /b %EXIT_CODE%
