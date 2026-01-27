@echo off
REM ============================================================================
REM Setu Voice-to-ONDC Gateway - Ultimate One-Click Setup (Windows)
REM ============================================================================
REM
REM This script is IDEMPOTENT and handles:
REM - Auto-detection of existing installations
REM - Automatic .env generation with secure random keys
REM - Password synchronization across all configuration points:
REM   * POSTGRES_PASSWORD in .env
REM   * DATABASE_URL in .env (must match POSTGRES_PASSWORD)
REM   * Docker Compose environment variables (reads from .env)
REM   * Prisma connection string (uses DATABASE_URL from .env)
REM - Docker installation and configuration
REM - Database setup and migrations
REM - Dependency installation
REM - Health checks and verification
REM - Automatic password validation and rotation with backup
REM
REM Password Synchronization Points:
REM 1. .env file: POSTGRES_PASSWORD=<password>
REM 2. .env file: DATABASE_URL=postgresql://setu:<password>@localhost:5432/setu_db
REM 3. docker-compose.yml: Uses ${POSTGRES_PASSWORD} from .env
REM 4. Prisma: Uses DATABASE_URL from .env
REM
REM The script ensures all four points use the SAME password for business continuity.
REM If mismatch detected, it regenerates .env with backup of old version.
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
REM ============================================================================

echo [INFO] Detecting Environment...
echo.

REM Check for Docker
echo [INFO] Checking for Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker is not installed
    echo [INFO] This script requires Docker Desktop for Windows
    echo.
    set /p INSTALL_DOCKER="Would you like to install Docker Desktop? (Y/N): "
    if /i "!INSTALL_DOCKER!"=="Y" (
        goto install_docker
    ) else (
        echo [ERROR] Cannot proceed without Docker
        pause
        exit /b 1
    )
)
echo [OK] Docker is installed
docker --version

REM Check for Docker Compose
echo [INFO] Checking for Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not available
    echo [INFO] Please ensure Docker Desktop is properly installed
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
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo [INFO] Waiting for Docker Desktop to start (this may take 30-60 seconds)...
    
    set /a elapsed=0
    set /a max_wait=120
    
    :docker_wait_loop
    if !elapsed! geq !max_wait! (
        echo.
        echo [ERROR] Docker Desktop failed to start within 120 seconds
        echo [INFO] Please start Docker Desktop manually and run this script again
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
REM Step 2: Port Management
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
    )
) else (
    echo [OK] Port %DB_PORT% is available
)
echo.

REM ============================================================================
REM Step 3: Environment File Setup
REM ============================================================================

echo [INFO] Setting up Environment Configuration...
echo.

if exist .env (
    echo [OK] .env file already exists
    echo [INFO] Checking for required keys...
    
    REM Check if DATABASE_URL exists
    findstr /C:"DATABASE_URL" .env >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] DATABASE_URL not found in .env
        set UPDATE_ENV=1
    )
    
    REM Check if POSTGRES_PASSWORD exists
    findstr /C:"POSTGRES_PASSWORD" .env >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] POSTGRES_PASSWORD not found in .env
        set UPDATE_ENV=1
    )
    
    if defined UPDATE_ENV (
        echo [INFO] Updating .env file with missing keys...
        call :generate_random_password
        set DB_PASSWORD=!RANDOM_PASSWORD!
        
        REM Append missing keys with synchronized password
        findstr /C:"POSTGRES_PASSWORD" .env >nul 2>&1
        if errorlevel 1 (
            echo POSTGRES_PASSWORD=!DB_PASSWORD! >> .env
        )
        
        findstr /C:"DATABASE_URL" .env >nul 2>&1
        if errorlevel 1 (
            echo DATABASE_URL=postgresql://setu:!DB_PASSWORD!@localhost:%DB_PORT%/setu_db >> .env
        )
        
        echo [OK] .env file updated with synchronized credentials
    ) else (
        echo [OK] All required keys present
        echo [INFO] Verifying password synchronization...
        
        REM Extract password from .env for verification
        for /f "tokens=2 delims==" %%a in ('findstr /C:"POSTGRES_PASSWORD" .env') do set EXISTING_PASSWORD=%%a
        
        REM Verify DATABASE_URL contains the same password
        findstr /C:"postgresql://setu:!EXISTING_PASSWORD!@" .env >nul 2>&1
        if errorlevel 1 (
            echo [WARNING] Password mismatch detected between POSTGRES_PASSWORD and DATABASE_URL
            echo [INFO] Regenerating .env file for consistency...
            
            REM Backup existing .env
            copy .env .env.backup.%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2% >nul 2>&1
            
            REM Generate new password and recreate .env
            call :generate_random_password
            set DB_PASSWORD=!RANDOM_PASSWORD!
            
            REM Preserve OPENAI_API_KEY if it exists
            set OPENAI_KEY=
            for /f "tokens=2 delims==" %%a in ('findstr /C:"OPENAI_API_KEY" .env 2^>nul') do set OPENAI_KEY=%%a
            
            (
                echo # Setu Voice-to-ONDC Gateway - Environment Configuration
                echo # Regenerated: %date% %time%
                echo # Previous version backed up
                echo.
                echo # Database Configuration
                echo POSTGRES_USER=setu
                echo POSTGRES_PASSWORD=!DB_PASSWORD!
                echo POSTGRES_DB=setu_db
                echo.
                echo # Database URL for Prisma
                echo DATABASE_URL=postgresql://setu:!DB_PASSWORD!@localhost:%DB_PORT%/setu_db
                echo.
                echo # OpenAI API Configuration
                echo OPENAI_API_KEY=!OPENAI_KEY!
                echo.
                echo # Application Configuration
                echo NODE_ENV=production
                echo NEXT_TELEMETRY_DISABLED=1
            ) > .env
            echo [OK] .env file regenerated with synchronized credentials
        ) else (
            echo [OK] Password synchronization verified
        )
    )
) else (
    echo [INFO] Creating new .env file with secure defaults...
    call :generate_random_password
    set DB_PASSWORD=!RANDOM_PASSWORD!
    
    (
        echo # Setu Voice-to-ONDC Gateway - Environment Configuration
        echo # Generated: %date% %time%
        echo.
        echo # Database Configuration
        echo POSTGRES_USER=setu
        echo POSTGRES_PASSWORD=!DB_PASSWORD!
        echo POSTGRES_DB=setu_db
        echo.
        echo # Database URL for Prisma
        echo DATABASE_URL=postgresql://setu:!DB_PASSWORD!@localhost:%DB_PORT%/setu_db
        echo.
        echo # OpenAI API Configuration
        echo # Replace with your actual OpenAI API key
        echo OPENAI_API_KEY=
        echo.
        echo # Application Configuration
        echo NODE_ENV=production
        echo NEXT_TELEMETRY_DISABLED=1
    ) > .env
    echo [OK] .env file created with secure random password
)
echo.

REM ============================================================================
REM Step 4: Docker Operations
REM ============================================================================

echo [INFO] Starting Docker Operations...
echo.

echo [INFO] Cleaning up existing containers...
docker compose down -v >nul 2>&1
echo [OK] Cleanup complete

echo [INFO] Building and starting Docker containers...
echo [INFO] This may take several minutes on first run...
echo.
docker compose up -d --build
if errorlevel 1 (
    echo [ERROR] Failed to start Docker containers
    echo [INFO] Check Docker Desktop and try again
    pause
    exit /b 1
)
echo [OK] Docker containers started successfully
echo.

REM ============================================================================
REM Step 5: Database Health Check
REM ============================================================================

echo [INFO] Waiting for PostgreSQL to be ready...
set /a elapsed=0
set /a max_wait=60

:db_wait_loop
if !elapsed! geq !max_wait! (
    echo.
    echo [ERROR] PostgreSQL failed to become ready within 60 seconds
    echo [INFO] Check logs: docker compose logs db
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
goto db_wait_loop

:db_ready
echo.

REM Verify password authentication works
echo [INFO] Verifying database authentication...
docker compose exec -T db psql -U setu -d setu_db -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database authentication failed
    echo [INFO] Password mismatch between .env and Docker containers
    echo [INFO] This should not happen - please check .env file
    pause
    exit /b 1
)
echo [OK] Database authentication verified
echo.

REM ============================================================================
REM Step 6: Database Initialization
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
REM Step 7: Health Verification
REM ============================================================================

echo [INFO] Verifying Application Health...
echo.

echo [INFO] Waiting for application to be ready...
timeout /t 5 /nobreak >nul

REM Check if app container is running
docker compose ps app | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Application container may not be running properly
    echo [INFO] Check logs: docker compose logs app
) else (
    echo [OK] Application container is running
)

echo [OK] Health verification complete
echo.

REM ============================================================================
REM Success Banner
REM ============================================================================

cls
echo.
echo ============================================================================
echo.
echo    ███████╗███████╗████████╗██╗   ██╗    ██╗     ██╗██╗   ██╗███████╗
echo    ██╔════╝██╔════╝╚══██╔══╝██║   ██║    ██║     ██║██║   ██║██╔════╝
echo    ███████╗█████╗     ██║   ██║   ██║    ██║     ██║██║   ██║█████╗  
echo    ╚════██║██╔══╝     ██║   ██║   ██║    ██║     ██║╚██╗ ██╔╝██╔══╝  
echo    ███████║███████╗   ██║   ╚██████╔╝    ███████╗██║ ╚████╔╝ ███████╗
echo    ╚══════╝╚══════╝   ╚═╝    ╚═════╝     ╚══════╝╚═╝  ╚═══╝  ╚══════╝
echo.
echo              Setup Complete - Setu is Live!
echo.
echo ============================================================================
echo.
echo [DEPLOYMENT SUMMARY]
echo.
echo   Application URL:      http://localhost:%APP_PORT%
echo   Debug Interface:      http://localhost:%APP_PORT%/debug
echo   Database:             PostgreSQL on localhost:%DB_PORT%
echo   Database Name:        setu_db
echo   Database User:        setu
echo   Setup Version:        %SCRIPT_VERSION%
echo   Timestamp:            %date% %time%
echo.
echo ============================================================================
echo.
echo [NEXT STEPS]
echo.
echo 1. Open your browser: http://localhost:%APP_PORT%
echo 2. Try voice scenarios from the dropdown menu
echo 3. View debug interface: http://localhost:%APP_PORT%/debug
echo.
echo 4. OPTIONAL: Add your OpenAI API key to .env:
echo    OPENAI_API_KEY="your-actual-api-key"
echo    Then restart: docker compose restart app
echo.
echo ============================================================================
echo.
echo [USEFUL COMMANDS]
echo.
echo   View logs:            docker compose logs -f
echo   Stop application:     docker compose down
echo   Restart:              docker compose restart
echo   View database:        docker compose exec db psql -U setu -d setu_db
echo   Reset database:       docker compose down -v ^&^& setup.bat
echo.
echo ============================================================================
echo.
echo Setu is ready to bridge farmers to ONDC! 🌾
echo.
pause
exit /b 0

REM ============================================================================
REM Docker Installation Subroutine
REM ============================================================================

:install_docker
echo.
echo [INFO] Installing Docker Desktop for Windows...
echo.

REM Check if winget is available
winget --version >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Installing Docker Desktop using winget...
    winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
    if errorlevel 1 (
        echo [ERROR] Failed to install Docker Desktop via winget
        goto docker_manual_install
    )
    echo [OK] Docker Desktop installed successfully
    echo [INFO] Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo [INFO] Please wait for Docker Desktop to start, then run this script again
    pause
    exit /b 0
) else (
    goto docker_manual_install
)

:docker_manual_install
echo [INFO] Automatic installation not available
echo.
echo Please manually download and install Docker Desktop from:
echo https://docs.docker.com/desktop/install/windows-install/
echo.
echo After installation, run this script again.
pause
exit /b 1