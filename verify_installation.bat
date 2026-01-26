@echo off
REM ============================================================================
REM Setu Installation Verification Script
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   Setu Installation Verification
echo ============================================================================
echo.

set PASS_COUNT=0
set FAIL_COUNT=0

REM Test 1: Docker installed
echo [TEST 1] Checking if Docker is installed...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker is not installed
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] Docker is installed
    docker --version
    set /a PASS_COUNT+=1
)
echo.

REM Test 2: Docker running
echo [TEST 2] Checking if Docker daemon is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker daemon is not running
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] Docker daemon is running
    set /a PASS_COUNT+=1
)
echo.

REM Test 3: Docker Compose available
echo [TEST 3] Checking if Docker Compose is available...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker Compose is not available
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] Docker Compose is available
    docker compose version
    set /a PASS_COUNT+=1
)
echo.

REM Test 4: Containers running
echo [TEST 4] Checking if Setu containers are running...
docker compose ps | findstr "setu-app" >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Setu containers are not running
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] Setu containers are running
    docker compose ps
    set /a PASS_COUNT+=1
)
echo.

REM Test 5: Application accessible
echo [TEST 5] Checking if application is accessible on port 3000...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5 -UseBasicParsing; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    echo [FAIL] Application is not accessible on http://localhost:3000
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] Application is accessible on http://localhost:3000
    set /a PASS_COUNT+=1
)
echo.

REM Test 6: Database accessible
echo [TEST 6] Checking if database is accessible...
docker compose exec -T db pg_isready -U setu -d setu_db >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Database is not accessible
    set /a FAIL_COUNT+=1
) else (
    echo [PASS] Database is accessible
    set /a PASS_COUNT+=1
)
echo.

REM Test 7: Seed data present
echo [TEST 7] Checking if seed data is present...
for /f %%i in ('docker compose exec -T db psql -U setu -d setu_db -t -c "SELECT COUNT(*) FROM farmers;" 2^>nul') do set FARMER_COUNT=%%i
if "%FARMER_COUNT%"=="" (
    echo [FAIL] Cannot query database
    set /a FAIL_COUNT+=1
) else (
    if %FARMER_COUNT% GTR 0 (
        echo [PASS] Seed data is present ^(%FARMER_COUNT% farmers^)
        set /a PASS_COUNT+=1
    ) else (
        echo [FAIL] No seed data found
        set /a FAIL_COUNT+=1
    )
)
echo.

REM Summary
echo ============================================================================
echo   Verification Summary
echo ============================================================================
echo.
echo Tests Passed: %PASS_COUNT%
echo Tests Failed: %FAIL_COUNT%
echo.

if %FAIL_COUNT% EQU 0 (
    echo [SUCCESS] All tests passed! Setu is fully operational.
    echo.
    echo You can access the application at: http://localhost:3000
    echo Debug interface: http://localhost:3000/debug
) else (
    echo [WARNING] Some tests failed. Please review the output above.
    echo.
    echo Common fixes:
    echo - If Docker is not running: Run start_docker.bat
    echo - If containers are not running: Run install_setu.bat
    echo - If application is not accessible: Check docker compose logs app
)
echo.
echo ============================================================================
echo.

pause
