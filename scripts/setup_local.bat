@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - Local Development Setup (Windows)
REM ============================================================================
REM
REM Description:
REM   This script sets up Setu for local development without Docker.
REM   Uses SQLite instead of PostgreSQL for simplicity.
REM
REM Usage:
REM   setup_local.bat
REM
REM Requirements:
REM   - Node.js 18+ installed
REM   - npm 7+ installed
REM
REM ============================================================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================================
echo    ____  ____  ____  _  _    __    ___   ___   __   __    
echo   / ___)(  __)(_  _)/ )( \  (  )  /___\ / __) / _\ (  )   
echo   \___ \ ) _)   )(  ) \/ (  / (_/\(  O )( (__ /    \/ (_/\
echo   (____/(____) (__) \____/  \____/ \__/  \___)\_/\_/\____/
echo.
echo   Voice-to-ONDC Gateway - Local Development Setup
echo ============================================================================
echo.

REM ============================================================================
REM Dependency Checks
REM ============================================================================

echo [INFO] Checking Dependencies...
echo.

REM Check for Node.js
echo [INFO] Checking for Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version

REM Check for npm
echo [INFO] Checking for npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)
echo [OK] npm is installed
npm --version
echo.

REM ============================================================================
REM Port Check
REM ============================================================================

echo [INFO] Checking if port 3000 is available...
netstat -an | findstr ":3000 " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 3000 is currently in use
    echo.
    set /p KILL_PORT="Do you want to attempt to free port 3000? (Y/N): "
    if /i "!KILL_PORT!"=="Y" (
        echo [INFO] Attempting to free port 3000...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        echo [OK] Port cleanup attempted
    )
) else (
    echo [OK] Port 3000 is available
)
echo.

REM ============================================================================
REM Environment Setup
REM ============================================================================

echo [INFO] Setting up Environment...
echo.

if exist .env.local (
    echo [OK] .env.local file already exists
    echo [INFO] Using existing environment configuration
) else (
    echo [INFO] Creating .env.local file with SQLite configuration...
    (
        echo # Setu Voice-to-ONDC Gateway - Local Development Environment
        echo.
        echo # Database Configuration ^(SQLite for local development^)
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # OpenAI API Configuration ^(Optional^)
        echo # If not provided, the system will use fallback responses
        echo OPENAI_API_KEY=
        echo.
        echo # Application Configuration
        echo NODE_ENV=development
        echo NEXT_TELEMETRY_DISABLED=1
    ) > .env.local
    echo [OK] .env.local file created
)
echo.

REM ============================================================================
REM Install Dependencies
REM ============================================================================

echo [INFO] Installing Dependencies...
echo [INFO] This may take a few minutes on first run...
echo.

npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies installed successfully
echo.

REM ============================================================================
REM Database Setup
REM ============================================================================

echo [INFO] Setting up Database...
echo.

echo [INFO] Generating Prisma client...
npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma client
    pause
    exit /b 1
)
echo [OK] Prisma client generated

echo [INFO] Creating database schema...
npx prisma db push --skip-generate
if errorlevel 1 (
    echo [ERROR] Failed to create database schema
    pause
    exit /b 1
)
echo [OK] Database schema created

echo [INFO] Seeding database with sample data...
node prisma/seed.js
if errorlevel 1 (
    echo [ERROR] Failed to seed database
    pause
    exit /b 1
)
echo [OK] Database seeded successfully
echo.

REM ============================================================================
REM Success Banner
REM ============================================================================

cls
echo.
echo ============================================================================
echo.
echo                   
echo                   
echo                             
echo                           
echo                
echo                    
echo.
echo              Local Development Setup Complete!
echo.
echo ============================================================================
echo.
echo [SETUP SUMMARY]
echo.
echo   Database:             SQLite (prisma/dev.db)
echo   Environment:          .env.local
echo   Node Version:         
node --version
echo   npm Version:          
npm --version
echo.
echo ============================================================================
echo.
echo [NEXT STEPS]
echo.
echo 1. Start the development server:
echo    npm run dev
echo.
echo 2. Open your browser and navigate to: http://localhost:3000
echo.
echo 3. Try the voice scenarios from the dropdown menu
echo.
echo 4. View the debug interface at: http://localhost:3000/debug
echo.
echo 5. Run tests:
echo    npm test
echo.
echo 6. OPTIONAL: Add your OpenAI API key to .env.local:
echo    OPENAI_API_KEY="your-actual-api-key"
echo.
echo ============================================================================
echo.
echo [USEFUL COMMANDS]
echo.
echo   Start dev server:     npm run dev
echo   Run tests:            npm test
echo   Run tests with UI:    npm run test:ui
echo   Test coverage:        npm run test:coverage
echo   View database:        npx prisma studio
echo   Reset database:       del prisma\dev.db ^&^& npx prisma db push
echo.
echo ============================================================================
echo.
echo Setu is ready for local development! 
echo.
pause
