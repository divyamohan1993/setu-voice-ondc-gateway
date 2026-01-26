@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - Ultimate One-Click Setup (Windows)
REM ============================================================================
REM
REM This script is IDEMPOTENT and handles:
REM - Auto-detection of existing installations
REM - Automatic .env generation with secure random keys
REM - Docker installation and configuration
REM - Database setup and migrations
REM - Dependency installation
REM - Health checks and verification
REM - Automatic updates and key rotation
REM
REM Usage: setup.bat
REM
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set APP_PORT=3000
set DB_PORT=5432
set SCRIPT_VERSION=2.0.0

cls
echo.
echo ============================================================================
echo    ____  ____  ____  _  _    ____  ____  ____  _  _  ____ 
echo   / ___)(  __)(_  _)/ )( \  / ___)(  __)(_  _)/ )( \(  _ \
echo   \___ \ ) _)   )(  ) \/ (  \___ \ ) _)   )(  ) \/ ( ) __/
echo   (____/(____) (__) \____/  (____/(____) (__) \____/(__)  
echo.
echo   Ultimate One-Click Setup v%SCRIPT_VERSION%
echo   Idempotent - Safe to run multiple times
echo ============================================================================
echo.

REM ============================================================================
REM Helper Functions
REM ============================================================================

:generate_random_password
REM Generate a secure random password using PowerShell
for /f "delims=" %%i in ('powershell -Command "$bytes = New-Object byte[] 32; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', '' | Select-Object -First 32"') do set "RANDOM_PASSWORD=%%i"
goto :eof

:generate_random_key
REM Generate a secure random key
for /f "delims=" %%i in ('powershell -Command "$bytes = New-Object byte[] 64; (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)"') do set "RANDOM_KEY=%%i"
goto :eof

REM ============================================================================
REM Step 1: Environment Detection and Setup
REM ==========