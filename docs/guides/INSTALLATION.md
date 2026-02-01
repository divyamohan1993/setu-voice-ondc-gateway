# Setu - Complete Installation Guide

## One-Click Installation (Recommended)

The Setu installation scripts are designed to work on **completely blank systems** and handle all dependencies automatically, including Docker installation.

### Windows
Run the PowerShell setup script:
```powershell
.\setup.ps1
```

### Linux / macOS
```bash
chmod +x setup.sh
./setup.sh
```

## What the Script Does

The installation script is a **fully automated, zero-configuration deployment** that handles:

### 1. Dependency Management
- [OK] **Checks for Docker** - If not installed, automatically installs it (Windows/Linux)
- [OK] **Checks for Node.js** - If running in local mode
- [OK] **Starts Docker daemon** - Automatically starts Docker if it's not running

### 2. Port Management
- [OK] **Checks port 3001** (Application) - Offers to free it if occupied
- [OK] **Checks port 5432** (PostgreSQL) - Offers to free it if occupied
- [OK] **Kills conflicting processes** - With user confirmation

### 3. Environment Configuration
- [OK] **Creates .env file** - If not present, creates with default values for Production
- [OK] **Preserves existing .env** - Uses your existing configuration if present
- [OK] **Sets secure defaults** - Database credentials, Google AI placeholders

### 4. Docker Operations
- [OK] **Cleans up old containers** - Removes any existing Setu containers
- [OK] **Builds Docker images** - Compiles the Next.js application
- [OK] **Starts containers** - Launches PostgreSQL and application containers
- [OK] **Configures networking** - Sets up internal Docker network

### 5. Database Initialization
- [OK] **Waits for PostgreSQL** - Health checks until database is ready (60s timeout)
- [OK] **Runs Prisma migrations** - Synchronizes database schema
- [OK] **Seeds sample data** - Populates with 2 farmers, 2 catalogs, 3 network logs
- [OK] **Verifies data** - Confirms seed data was inserted correctly

### 6. Success Verification
- [OK] **Displays deployment summary** - Shows URLs, ports, timing
- [OK] **Provides next steps** - Clear instructions for using the application
- [OK] **Shows management commands** - How to stop, restart, view logs

## Installation Time

- **First run** (with Docker installation): 5-10 minutes
- **Subsequent runs** (Docker already installed): 2-3 minutes

## System Requirements

### Minimum Requirements
- **RAM**: 4GB (8GB recommended)
- **Disk Space**: 2GB free
- **OS**: 
  - Windows 10/11 (64-bit)
  - macOS 10.15+ (Catalina or later)
  - Linux (Ubuntu 18.04+, Debian 10+, Fedora 32+, Arch Linux)

## Manual Installation (If Automatic Fails)

If the automatic installation fails, you can install manually:

### Step 1: Install Docker

**Windows**: https://docs.docker.com/desktop/install/windows-install/  
**macOS**: https://docs.docker.com/desktop/install/mac-install/  
**Linux**: https://docs.docker.com/engine/install/

### Step 2: Start Docker

- **Windows/macOS**: Open Docker Desktop from Start Menu/Applications
- **Linux**: `sudo systemctl start docker`

### Step 3: Run Installation Script

```bash
# Windows
.\setup.ps1

# Linux/macOS
chmod +x setup.sh
./setup.sh
```

## Verifying Installation

After installation completes, verify everything is working:

### 1. Check Containers
```bash
docker compose ps
```

Expected output:
```
NAME            IMAGE                    STATUS
setu-app        setu-app                 Up
setu-postgres   postgres:16-alpine       Up (healthy)
```

### 2. Check Application
Open browser: http://localhost:3001

You should see the Setu voice interface.

### 3. Check Logs
```bash
docker compose logs app
```

Should show no errors, application running on port 3001.

## Troubleshooting

### Windows

#### Issue: PowerShell execution policy
**Solution**: Run as Administrator:
```powershell
Set-ExecutionPolicy RemoteSigned
```

#### Issue: Docker Desktop installation requires restart
**Solution**: 
1. Restart your computer
2. Start Docker Desktop from Start Menu
3. Run `.\setup.ps1` again

### Linux

#### Issue: sudo password required
**Solution**: The script will prompt for your password when needed.

#### Issue: User not in docker group
**Solution**: 
1. The script automatically adds you to the docker group
2. Log out and log back in, or run: `newgrp docker`
3. Run the script again

## Post-Installation

### Adding Google Gemini API Key (Optional but Recommended)

The system works without an API key using fallback responses, but for full AI-powered translation:

1. Edit `.env` file:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=AIzaSy...
   ```

2. Restart application:
   ```bash
   docker compose restart app
   ```
