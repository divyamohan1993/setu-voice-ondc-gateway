@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - Local Development Setup (No Docker)
REM ============================================================================

echo.
echo ============================================================================
echo    SETU - Local Development Setup
echo ============================================================================
echo.

REM Check Node.js
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Create .env file for local development
echo [INFO] Setting up environment variables...
if exist .env (
    echo [OK] .env file already exists
) else (
    (
        echo # Local Development Environment
        echo DATABASE_URL="file:./dev.db"
        echo OPENAI_API_KEY=
        echo NODE_ENV=development
        echo NEXT_TELEMETRY_DISABLED=1
    ) > .env
    echo [OK] .env file created
)
echo.

REM Generate Prisma Client
echo [INFO] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client generated
echo.

REM Push database schema
echo [INFO] Creating database schema...
call npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo [ERROR] Failed to create database schema
    pause
    exit /b 1
)
echo [OK] Database schema created
echo.

REM Seed database
echo [INFO] Seeding database with sample data...
call node prisma/seed.js
if errorlevel 1 (
    echo [ERROR] Failed to seed database
    pause
    exit /b 1
)
echo [OK] Database seeded
echo.

echo ============================================================================
echo    SETUP COMPLETE!
echo ============================================================================
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Open: http://localhost:3000
echo   3. Run tests: npm test
echo.
echo ============================================================================
pause
