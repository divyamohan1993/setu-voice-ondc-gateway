# Setu - Complete Installation Guide

## One-Click Installation (Recommended)

The Setu installation scripts are designed to work on **completely blank systems** and handle all dependencies automatically, including Docker installation.

### Windows
Double-click **`START.bat`** in the root directory.

*Or run via PowerShell:*
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
- ✅ **Checks for Docker** - If not installed, automatically installs it
  - **Windows**: Uses `winget` or downloads Docker Desktop installer
  - **macOS**: Uses Homebrew or downloads Docker Desktop DMG
  - **Linux**: Detects distribution (Ubuntu/Debian/Fedora/Arch) and installs Docker Engine
- ✅ **Checks for Docker Compose** - Verifies it's available (included with Docker Desktop)
- ✅ **Starts Docker daemon** - Automatically starts Docker if it's not running

### 2. Port Management
- ✅ **Checks port 3000** (Application) - Offers to free it if occupied
- ✅ **Checks port 5432** (PostgreSQL) - Offers to free it if occupied
- ✅ **Kills conflicting processes** - With user confirmation

### 3. Environment Configuration
- ✅ **Creates .env file** - If not present, creates with default values
- ✅ **Preserves existing .env** - Uses your existing configuration if present
- ✅ **Sets secure defaults** - Database credentials, connection strings

### 4. Docker Operations
- ✅ **Cleans up old containers** - Removes any existing Setu containers
- ✅ **Builds Docker images** - Compiles the Next.js application
- ✅ **Starts containers** - Launches PostgreSQL and application containers
- ✅ **Configures networking** - Sets up internal Docker network

### 5. Database Initialization
- ✅ **Waits for PostgreSQL** - Health checks until database is ready (60s timeout)
- ✅ **Runs Prisma migrations** - Synchronizes database schema
- ✅ **Seeds sample data** - Populates with 2 farmers, 2 catalogs, 3 network logs
- ✅ **Verifies data** - Confirms seed data was inserted correctly

### 6. Success Verification
- ✅ **Displays deployment summary** - Shows URLs, ports, timing
- ✅ **Provides next steps** - Clear instructions for using the application
- ✅ **Shows management commands** - How to stop, restart, view logs

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

### Automatic Docker Installation Support

#### Windows
- **Method 1**: `winget` (Windows 10 1809+ / Windows 11)
- **Method 2**: Direct download of Docker Desktop installer
- **Requires**: Administrator privileges for installation

#### macOS
- **Method 1**: Homebrew (`brew install --cask docker`)
- **Method 2**: Direct download of Docker Desktop DMG
- **Supports**: Both Intel (x86_64) and Apple Silicon (arm64)

#### Linux
- **Ubuntu/Debian**: APT package manager
- **Fedora/RHEL/CentOS**: YUM package manager
- **Arch/Manjaro**: Pacman package manager
- **Requires**: `sudo` privileges

## What Gets Installed

### Docker Components
- **Docker Engine** (Linux) or **Docker Desktop** (Windows/macOS)
- **Docker Compose** (included with Docker Desktop)
- **Container runtime** and dependencies

### Application Components
- **PostgreSQL 16** (in Docker container)
- **Next.js 15 application** (in Docker container)
- **Node.js 20** (in Docker container)
- **Prisma ORM** (in Docker container)

### No System-Wide Changes
- ✅ All application code runs in Docker containers
- ✅ No global Node.js packages installed
- ✅ No system-wide configuration changes
- ✅ Easy to uninstall (just remove Docker containers)

## Troubleshooting Automatic Installation

### Windows

#### Issue: winget not found
**Solution**: The script will automatically fall back to direct download method.

#### Issue: Docker Desktop installation requires restart
**Solution**: 
1. Restart your computer
2. Start Docker Desktop from Start Menu
3. Run `install_setu.bat` again

#### Issue: WSL 2 installation required
**Solution**: Docker Desktop will prompt you to install WSL 2. Follow the prompts and restart.

### macOS

#### Issue: Homebrew not installed
**Solution**: The script will automatically download Docker Desktop DMG.

#### Issue: "Docker.app" cannot be opened because it is from an unidentified developer
**Solution**:
1. Go to System Preferences → Security & Privacy
2. Click "Open Anyway" for Docker
3. Run the script again

#### Issue: Rosetta 2 required (Apple Silicon)
**Solution**: macOS will prompt to install Rosetta 2. Accept and continue.

### Linux

#### Issue: sudo password required
**Solution**: The script will prompt for your password when needed.

#### Issue: User not in docker group
**Solution**: 
1. The script automatically adds you to the docker group
2. Log out and log back in, or run: `newgrp docker`
3. Run the script again

#### Issue: Unsupported distribution
**Solution**: Install Docker manually:
```bash
# Follow official Docker installation guide for your distribution
# https://docs.docker.com/engine/install/
```

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
install_setu.bat

# Linux/macOS
chmod +x install_setu.sh
./install_setu.sh
```

## Verifying Installation

After installation completes, verify everything is working:

### Quick Verification

Run the automated verification script:

**Windows:**
```cmd
verify_installation.bat
```

**Linux/macOS:**
```bash
chmod +x verify_installation.sh
./verify_installation.sh
```

The script checks:
- ✅ Docker installed and running
- ✅ Docker Compose available
- ✅ Setu containers running
- ✅ Application accessible on port 3000
- ✅ Database accessible
- ✅ Seed data present

### Manual Verification

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
Open browser: http://localhost:3000

You should see the Setu voice interface.

### 3. Check Database
```bash
docker compose exec db psql -U setu -d setu_db -c "SELECT COUNT(*) FROM farmers;"
```

Expected output: `2` (two farmers seeded)

### 4. Check Logs
```bash
docker compose logs app
```

Should show no errors, application running on port 3000.

## Helper Scripts

The project includes several helper scripts to make management easier:

### Installation Script
**Purpose**: Complete automated installation from scratch

**Windows**: `install_setu.bat`  
**Linux/macOS**: `install_setu.sh`

**What it does**:
- Installs Docker if not present
- Starts Docker daemon
- Manages port conflicts
- Creates environment configuration
- Builds and starts containers
- Initializes database
- Seeds sample data

### Start Docker Script (Windows Only)
**Purpose**: Start Docker Desktop and wait for it to be ready

**Windows**: `start_docker.bat`

**When to use**: If Docker Desktop is installed but not running

### Verification Script
**Purpose**: Verify that the installation is complete and working

**Windows**: `verify_installation.bat`  
**Linux/macOS**: `verify_installation.sh`

**What it checks**:
- Docker installed and running
- Docker Compose available
- Containers running
- Application accessible
- Database accessible
- Seed data present

**Usage**:
```bash
# Windows
verify_installation.bat

# Linux/macOS
chmod +x verify_installation.sh
./verify_installation.sh
```

## Post-Installation

### Adding OpenAI API Key (Optional)

The system works without an API key using fallback responses, but for AI-powered translation:

1. Edit `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

2. Restart application:
   ```bash
   docker compose restart app
   ```

### Managing the Application

**Stop**:
```bash
docker compose down
```

**Start**:
```bash
docker compose up -d
```

**Restart**:
```bash
docker compose restart
```

**View Logs**:
```bash
docker compose logs -f app
```

**Reset Database** (WARNING: Deletes all data):
```bash
docker compose down -v
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js
```

## Uninstallation

### Remove Application
```bash
docker compose down -v
```

### Remove Docker (Optional)

**Windows**: Uninstall Docker Desktop from Settings → Apps

**macOS**: 
```bash
# If installed via Homebrew
brew uninstall --cask docker

# If installed manually
rm -rf /Applications/Docker.app
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt-get purge docker-ce docker-ce-cli containerd.io

# Fedora/RHEL
sudo yum remove docker-ce docker-ce-cli containerd.io

# Arch
sudo pacman -R docker docker-compose
```

## Support

If you encounter issues:

1. **Check the logs**: `docker compose logs`
2. **Check Docker status**: `docker info`
3. **Check port availability**: `netstat -an | findstr "3000 5432"` (Windows) or `lsof -i :3000,5432` (Linux/macOS)
4. **Review this guide**: Look for your specific issue above
5. **Open an issue**: Include error messages and system information

## Success Indicators

You'll know the installation succeeded when you see:

✅ Docker installed and running  
✅ Ports 3000 and 5432 available  
✅ .env file created  
✅ Docker containers built and started  
✅ PostgreSQL healthy and ready  
✅ Database schema synchronized  
✅ Sample data seeded  
✅ Application accessible at http://localhost:3000  
✅ Success banner displayed  

**Total time**: 2-10 minutes depending on your system and internet speed.

---

**Built with ❤️ for Indian Farmers**

*One command. Zero configuration. Complete deployment.*
