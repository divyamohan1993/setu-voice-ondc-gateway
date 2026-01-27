@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - Local Test Script (Windows)
REM ============================================================================

cls
echo.
echo ============================================================================
echo    ____  ____  ____  _  _    ____  ____  ____  ____  ____
echo   / ___)(  __)(_  _)/ )( \  (_  _)(  __)/ ___)(_  _)/ ___)
echo   \___ \ ) _)   )(  ) \/ (    )(   ) _) \___ \  )(  \___ \
echo   (____/(____) (__) \____/   (__) (____)(____/ (__) (____/
echo.
echo   Voice-to-ONDC Gateway - Test Suite
echo ============================================================================
echo.

echo [INFO] Checking Dependencies...
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version

npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
echo [OK] npm is installed
npm --version
echo.

echo [INFO] Installing Dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [INFO] Running Test Suite...
echo.
npm test
if errorlevel 1 (
    echo.
    echo [WARNING] Some tests failed
    echo.
) else (
    echo.
    echo [OK] All tests passed!
    echo.
)

echo ============================================================================
echo.
echo [TEST SUMMARY]
echo.
echo   Tests completed. Review the output above for details.
echo.
echo [NEXT STEPS]
echo.
echo   1. Review test results above
echo   2. Run tests with UI: npm run test:ui
echo   3. Check test coverage: npm run test:coverage
echo   4. View code in your editor
echo.
echo ============================================================================
echo.
pause
