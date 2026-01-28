@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - One-Click Deployment Script (Windows)
REM ============================================================================
REM
REM Description:
REM   This script automates the complete deployment of the Setu application
REM   on Windows systems, including dependency checks, Docker container setup,
REM   database initialization, and data seeding.
REM
REM Usage:
REM   install_setu.bat
REM
REM Requirements:
REM   - Docker Desktop for Windows
REM   - Docker Compose (included with Docker Desktop)
REM
REM Author: Setu Development Team
REM Version: 1.0.0
REM
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set APP_PORT=3000
set DB_PORT=5432
set DB_HEALTH_CHECK_TIMEOUT=60

REM Color codes (limited support in Windows)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

cls
echo.
echo ============================================================================
echo    ____  ____  ____  _  _    ____  ____  ____  _  _  ____ 
echo   / ___)(  __)(_  _)/ )( \  / ___)(  __)(_  _)/ )( \(  _ \
echo   \___ \ ) _)   )(  ) \/ (  \___ \ ) _)   )(  ) \/ ( ) __/
echo   (____/(____) (__) \____/  (____/(____) (__) \____/(__)  
echo.
echo   Voice-to-ONDC Gateway - One-Click Deployment (Windows)
echo ============================================================================
echo.

REM ============================================================================
REM Dependency Checks
REM ============================================================================

echo [INFO] Checking Dependencies...
echo.

REM Check for Docker
echo [INFO] Checking for Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker is not installed
    echo [INFO] Attempting to install Docker Desktop for Windows...
    echo.
    
    REM Check if winget is available (Windows 10 1809+ / Windows 11)
    winget --version >nul 2>&1
    if not errorlevel 1 (
        echo [INFO] Installing Docker Desktop using winget...
        winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
        if errorlevel 1 (
            echo [ERROR] Failed to install Docker Desktop via winget
            goto docker_manual_install
        )
        echo [OK] Docker Desktop installed successfully
        echo.
        echo [INFO] Starting Docker Desktop...
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        
        echo [INFO] Waiting for Docker to initialize (this may take 60-90 seconds)...
        timeout /t 10 /nobreak >nul
        
        REM Refresh PATH to include Docker
        call refreshenv >nul 2>&1
        
        REM Wait for Docker to be ready
        set /a elapsed=0
        set /a max_wait=120
        
        :docker_init_wait
        if !elapsed! geq !max_wait! (
            echo.
            echo [WARNING] Docker Desktop is taking longer than expected to start
            echo [INFO] Please ensure Docker Desktop is running and run this script again
            pause
            exit /b 0
        )
        
        docker info >nul 2>&1
        if not errorlevel 1 (
            echo.
            echo [OK] Docker Desktop is ready!
            goto docker_check_complete
        )
        
        echo|set /p="."
        timeout /t 3 /nobreak >nul
        set /a elapsed+=3
        goto docker_init_wait
    ) else (
        goto docker_manual_install
    )
)
echo [OK] Docker is installed
docker --version
goto docker_check_complete

:docker_manual_install
echo [INFO] Automatic installation not available
echo [INFO] Downloading Docker Desktop installer...
echo.

REM Create temp directory for download
if not exist "%TEMP%\setu_install" mkdir "%TEMP%\setu_install"

REM Download Docker Desktop installer using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile '%TEMP%\setu_install\DockerDesktopInstaller.exe'}"

if errorlevel 1 (
    echo [ERROR] Failed to download Docker Desktop installer
    echo.
    echo Please manually download and install Docker Desktop from:
    echo https://docs.docker.com/desktop/install/windows-install/
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [OK] Docker Desktop installer downloaded
echo [INFO] Running Docker Desktop installer...
echo [INFO] Please follow the installation wizard
echo.

start /wait "%TEMP%\setu_install\DockerDesktopInstaller.exe" install --quiet --accept-license

if errorlevel 1 (
    echo [WARNING] Docker Desktop installation may require manual steps
    echo [INFO] Please complete the installation and start Docker Desktop
    echo [INFO] Then run this script again
    pause
    exit /b 0
)

echo [OK] Docker Desktop installed successfully
echo [INFO] Starting Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo [INFO] Please wait for Docker Desktop to start, then run this script again
pause
exit /b 0

:docker_check_complete

REM Check for Docker Compose
echo [INFO] Checking for Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not available
    echo.
    echo Please ensure Docker Desktop is properly installed.
    pause
    exit /b 1
)
echo [OK] Docker Compose is installed
docker compose version

REM Check if Docker daemon is running
echo [INFO] Checking if Docker daemon is running...
docker info >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker daemon is not running
    echo [INFO] Attempting to start Docker Desktop...
    
    REM Try to start Docker Desktop
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    echo [INFO] Waiting for Docker Desktop to start (this may take 30-60 seconds)...
    set /a elapsed=0
    set /a max_wait=120
    
    :docker_wait_loop
    if !elapsed! geq !max_wait! (
        echo.
        echo [ERROR] Docker Desktop failed to start within 120 seconds
        echo [INFO] Please start Docker Desktop manually from the Start Menu
        echo [INFO] After Docker Desktop is running, run this script again
        pause
        exit /b 1
    )
    
    docker info >nul 2>&1
    if not errorlevel 1 (
        echo.
        echo [OK] Docker Desktop is now running
        goto docker_running
    )
    
    echo|set /p="."
    timeout /t 3 /nobreak >nul
    set /a elapsed+=3
    goto docker_wait_loop
)

:docker_running
echo [OK] Docker daemon is running
echo.

REM ============================================================================
REM Port Management
REM ============================================================================

echo [INFO] Checking Port Availability...
echo.

REM Check port 3000
echo [INFO] Checking if port %APP_PORT% is available...
netstat -an | findstr ":%APP_PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port %APP_PORT% is currently in use
    echo.
    set /p KILL_PORT="Do you want to attempt to free port %APP_PORT%? (Y/N): "
    if /i "!KILL_PORT!"=="Y" (
        echo [INFO] Attempting to free port %APP_PORT%...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%APP_PORT% " ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        echo [OK] Port cleanup attempted
    ) else (
        echo [ERROR] Cannot proceed with port %APP_PORT% in use
        pause
        exit /b 1
    )
) else (
    echo [OK] Port %APP_PORT% is available
)

REM Check port 5432
echo [INFO] Checking if port %DB_PORT% is available...
netstat -an | findstr ":%DB_PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port %DB_PORT% is currently in use
    echo.
    set /p KILL_PORT="Do you want to attempt to free port %DB_PORT%? (Y/N): "
    if /i "!KILL_PORT!"=="Y" (
        echo [INFO] Attempting to free port %DB_PORT%...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%DB_PORT% " ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        echo [OK] Port cleanup attempted
    ) else (
        echo [ERROR] Cannot proceed with port %DB_PORT% in use
        pause
        exit /b 1
    )
) else (
    echo [OK] Port %DB_PORT% is available
)
echo.

REM ============================================================================
REM Environment Setup
REM ============================================================================

echo [INFO] Setting up Environment...
echo.

if exist .env (
    echo [OK] .env file already exists
    echo [INFO] Using existing environment configuration
) else (
    echo [WARNING] .env file not found, creating with default values...
    (
        echo # Database Configuration
        echo POSTGRES_USER=setu
        echo POSTGRES_PASSWORD=setu_password
        echo POSTGRES_DB=setu_db
        echo.
        echo # Database URL for Prisma ^(used by the application^)
        echo DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db
        echo.
        echo # OpenAI API Configuration
        echo # Replace with your actual OpenAI API key for AI-powered translation
        echo # If not provided, the system will use fallback responses
        echo OPENAI_API_KEY=
        echo.
        echo # Application Configuration
        echo NODE_ENV=production
        echo NEXT_TELEMETRY_DISABLED=1
    ) > .env
    echo [OK] .env file created with default values
    echo [WARNING] Please update OPENAI_API_KEY in .env file for AI-powered translation
)
echo.

REM ============================================================================
REM Docker Operations
REM ============================================================================

echo [INFO] Starting Docker Operations...
echo.

echo [INFO] Cleaning up existing containers...
docker compose down -v >nul 2>&1
echo [OK] Cleanup complete

echo [INFO] Building and starting Docker containers...
echo [INFO] This may take a few minutes on first run...
docker compose up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start Docker containers
    pause
    exit /b 1
)
echo [OK] Docker containers started successfully
echo.

REM ============================================================================
REM Database Health Check
REM ============================================================================

echo [INFO] Waiting for PostgreSQL to be ready...
set /a elapsed=0
set /a max_wait=%DB_HEALTH_CHECK_TIMEOUT%

:wait_loop
if !elapsed! geq !max_wait! (
    echo.
    echo [ERROR] PostgreSQL failed to become ready within %DB_HEALTH_CHECK_TIMEOUT% seconds
    pause
    exit /b 1
)

docker compose exec -T db pg_isready -U setu -d setu_db >nul 2>&1
if not errorlevel 1 (
    echo.
    echo [OK] PostgreSQL is ready!
    goto db_ready
)

echo|set /p="."
timeout /t 2 /nobreak >nul
set /a elapsed+=2
goto wait_loop

:db_ready
echo.

REM ============================================================================
REM Database Initialization
REM ============================================================================

echo [INFO] Initializing Database...
echo.

echo [INFO] Synchronizing database schema with Prisma...
docker compose exec -T app npx prisma db push --skip-generate
if errorlevel 1 (
    echo [ERROR] Failed to synchronize database schema
    pause
    exit /b 1
)
echo [OK] Database schema synchronized

echo [INFO] Seeding database with initial data...
docker compose exec -T app node prisma/seed.js
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
echo              Voice-to-ONDC Gateway Successfully Deployed!
echo.
echo ============================================================================
echo.
echo [DEPLOYMENT SUMMARY]
echo.
echo   Application URL:      http://localhost:%APP_PORT%
echo   Database:             PostgreSQL on localhost:%DB_PORT%
echo   Database Name:        setu_db
echo   Database User:        setu
echo   Timestamp:            %date% %time%
echo.
echo ============================================================================
echo.
echo [NEXT STEPS]
echo.
echo 1. Open your browser and navigate to: http://localhost:%APP_PORT%
echo 2. Try the voice scenarios from the dropdown menu
echo 3. View the debug interface at: http://localhost:%APP_PORT%/debug
echo.
echo 4. IMPORTANT: Update your OpenAI API key in the .env file:
echo    OPENAI_API_KEY="your-actual-api-key"
echo    Then restart: docker compose restart app
echo.
echo 5. To stop the application: docker compose down
echo 6. To view logs: docker compose logs -f
echo 7. To restart: docker compose up -d
echo.
echo ============================================================================
echo.
echo Setu is ready to bridge farmers to ONDC! 
echo.
pause
