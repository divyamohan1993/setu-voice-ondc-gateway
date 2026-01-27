# Setu Voice-to-ONDC Gateway - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Setu Voice-to-ONDC Gateway application using the automated deployment scripts. The deployment process is fully automated and requires minimal manual intervention.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Scripts](#deployment-scripts)
- [What the Script Does](#what-the-script-does)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)
- [Manual Deployment](#manual-deployment)
- [Uninstallation](#uninstallation)

## Prerequisites

### Required Software

1. **Docker** (version 20.10 or higher)
   - **Windows**: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - **macOS**: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

2. **Docker Compose** (version 2.0 or higher)
   - Included with Docker Desktop
   - Linux users may need to install separately

### System Requirements

- **RAM**: Minimum 4GB, Recommended 8GB
- **Disk Space**: Minimum 2GB free space
- **Ports**: 3000 (Application) and 5432 (PostgreSQL) must be available
- **Operating System**: 
  - Windows 10/11 (64-bit)
  - macOS 10.15 or later
  - Linux (Ubuntu 20.04+, Debian 10+, CentOS 8+, or equivalent)

## Quick Start

### Linux / macOS

```bash
# Make the script executable
chmod +x install_setu.sh

# Run the deployment script
./install_setu.sh
```

### Windows

```cmd
# Run the deployment script
install_setu.bat
```

That's it! The script will handle everything automatically.

## Deployment Scripts

### Linux/macOS Script: `install_setu.sh`

A comprehensive Bash script that automates the entire deployment process on Unix-like systems.

**Features:**
- ✅ Colored output for better readability
- ✅ Comprehensive error handling with automatic cleanup
- ✅ Interactive port conflict resolution
- ✅ Health checks for all services
- ✅ Automatic database initialization and seeding
- ✅ Beautiful ASCII art success banner
- ✅ Detailed deployment summary

### Windows Script: `install_setu.bat`

A Windows batch script that provides the same functionality for Windows users.

**Features:**
- ✅ Windows-compatible commands
- ✅ Interactive prompts for user decisions
- ✅ Port conflict detection and resolution
- ✅ Automatic environment setup
- ✅ Success banner with deployment information

## What the Script Does

The deployment script performs the following steps automatically:

### 1. Dependency Checks ✓

- Verifies Docker is installed
- Verifies Docker Compose is available
- Checks if Docker daemon is running
- Displays installation instructions if dependencies are missing

### 2. Port Management ✓

- Checks if port 3000 (Application) is available
- Checks if port 5432 (PostgreSQL) is available
- Offers to kill processes using required ports
- Provides clear error messages if ports cannot be freed

### 3. Environment Setup ✓

- Checks for existing `.env` file
- Creates `.env` with default values if missing
- Sets up database connection string
- Configures OpenAI API key placeholder
- Preserves existing configuration if `.env` exists

**Default Environment Variables:**
```env
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db
OPENAI_API_KEY=
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 4. Docker Operations ✓

- Cleans up any existing containers (`docker compose down -v`)
- Builds Docker images from scratch
- Starts containers in detached mode
- Configures networking between services
- Sets up persistent volumes for database

### 5. Database Health Check ✓

- Waits for PostgreSQL to be ready (max 60 seconds)
- Uses `pg_isready` for reliable health checking
- Displays progress indicator while waiting
- Fails gracefully with clear error message if timeout occurs

### 6. Database Initialization ✓

- Runs Prisma migrations (`npx prisma db push`)
- Synchronizes database schema with Prisma models
- Seeds database with sample data
- Verifies seed data was inserted successfully
- Creates sample farmers, catalogs, and network logs

### 7. Success Output ✓

- Displays beautiful ASCII art banner
- Shows deployment summary with:
  - Application URL
  - Database connection information
  - Deployment duration
  - Timestamp
- Provides clear next steps for users
- Includes troubleshooting tips

### 8. Error Handling ✓

- Traps all errors with `set -e` (Bash) or error checking (Batch)
- Provides context-specific error messages
- Automatically cleans up partial deployments on failure
- Suggests troubleshooting steps for common issues

## Post-Deployment

### Accessing the Application

Once deployment is complete, you can access:

1. **Main Application**: http://localhost:3000
   - Voice scenario selection interface
   - Visual catalog verifier
   - Broadcast functionality

2. **Debug Interface**: http://localhost:3000/debug
   - Network log viewer
   - Catalog list
   - Farmer profiles

### Configuring OpenAI API Key

For AI-powered translation, update your `.env` file:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

Then restart the application:

```bash
docker compose restart app
```

**Note**: The system will work without an API key using fallback responses, but AI-powered translation provides better results.

### Verifying the Deployment

1. **Check Container Status**:
   ```bash
   docker compose ps
   ```
   Both `setu-app` and `setu-postgres` should be "Up"

2. **View Application Logs**:
   ```bash
   docker compose logs -f app
   ```

3. **View Database Logs**:
   ```bash
   docker compose logs -f db
   ```

4. **Test Database Connection**:
   ```bash
   docker compose exec db psql -U setu -d setu_db -c "SELECT COUNT(*) FROM farmers;"
   ```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Port Already in Use

**Symptom**: Script reports port 3000 or 5432 is in use

**Solution**:
1. The script will offer to kill the process automatically
2. If automatic cleanup fails, manually identify and stop the process:

**Linux/macOS**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Windows**:
```cmd
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /F /PID <PID>
```

#### Issue: Docker Daemon Not Running

**Symptom**: "Docker daemon is not running" error

**Solution**:
- **Windows/macOS**: Start Docker Desktop
- **Linux**: `sudo systemctl start docker`

#### Issue: Database Health Check Timeout

**Symptom**: "PostgreSQL failed to become ready within 60 seconds"

**Solution**:
1. Check Docker logs: `docker compose logs db`
2. Ensure sufficient system resources (RAM, CPU)
3. Try increasing timeout in script
4. Restart Docker daemon

#### Issue: Prisma Migration Fails

**Symptom**: "Failed to synchronize database schema"

**Solution**:
1. Check database is running: `docker compose ps db`
2. Verify database connection: `docker compose exec db pg_isready -U setu`
3. Check Prisma schema syntax: `npx prisma validate`
4. Try manual migration: `docker compose exec app npx prisma db push`

#### Issue: Seed Script Fails

**Symptom**: "Failed to seed database"

**Solution**:
1. Check seed script exists: `ls prisma/seed.js`
2. Verify database schema is up to date
3. Check for unique constraint violations
4. Run seed manually: `docker compose exec app node prisma/seed.js`

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**: `docker compose logs -f`
2. **Verify Configuration**: Review `.env` file
3. **Clean Restart**: 
   ```bash
   docker compose down -v
   ./install_setu.sh
   ```
4. **Report Issues**: Include logs and error messages

## Manual Deployment

If you prefer manual deployment or need more control:

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd setu-voice-ondc-gateway
```

### Step 2: Create Environment File

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Step 3: Start Services

```bash
docker compose up -d --build
```

### Step 4: Wait for Database

```bash
# Wait for PostgreSQL to be ready
docker compose exec db pg_isready -U setu -d setu_db
```

### Step 5: Initialize Database

```bash
# Run migrations
docker compose exec app npx prisma db push

# Seed data
docker compose exec app node prisma/seed.js
```

### Step 6: Verify Deployment

```bash
# Check containers
docker compose ps

# View logs
docker compose logs -f
```

## Uninstallation

To completely remove Setu from your system:

### Remove Containers and Volumes

```bash
docker compose down -v
```

### Remove Images

```bash
docker rmi setu-voice-ondc-gateway-app
docker rmi postgres:16-alpine
```

### Remove Project Files

```bash
# Linux/macOS
rm -rf /path/to/setu-voice-ondc-gateway

# Windows
rmdir /s /q C:\path\to\setu-voice-ondc-gateway
```

### Clean Docker System (Optional)

```bash
# Remove all unused containers, networks, images
docker system prune -a --volumes
```

## Additional Commands

### Managing the Application

```bash
# Stop the application
docker compose stop

# Start the application
docker compose start

# Restart the application
docker compose restart

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f db

# Execute commands in containers
docker compose exec app sh
docker compose exec db psql -U setu -d setu_db

# Rebuild and restart
docker compose up -d --build

# Scale services (if needed)
docker compose up -d --scale app=2
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker compose exec db psql -U setu -d setu_db

# Backup database
docker compose exec db pg_dump -U setu setu_db > backup.sql

# Restore database
docker compose exec -T db psql -U setu -d setu_db < backup.sql

# Reset database
docker compose down -v
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js
```

### Development Commands

```bash
# Run Prisma Studio (Database GUI)
docker compose exec app npx prisma studio

# Generate Prisma Client
docker compose exec app npx prisma generate

# Validate Prisma Schema
docker compose exec app npx prisma validate

# Format Prisma Schema
docker compose exec app npx prisma format
```

## Performance Tuning

### For Production Deployments

1. **Increase Database Resources**:
   Edit `docker-compose.yml`:
   ```yaml
   db:
     deploy:
       resources:
         limits:
           cpus: '2'
           memory: 2G
   ```

2. **Enable Connection Pooling**:
   Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db?connection_limit=10&pool_timeout=20
   ```

3. **Configure Next.js for Production**:
   Ensure `.env` has:
   ```env
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ```

## Security Considerations

### For Production Deployments

1. **Change Default Passwords**:
   ```env
   POSTGRES_PASSWORD=<strong-random-password>
   ```

2. **Use Environment-Specific API Keys**:
   ```env
   OPENAI_API_KEY=<production-api-key>
   ```

3. **Enable HTTPS**:
   - Use a reverse proxy (nginx, Caddy)
   - Configure SSL certificates
   - Update `NEXT_PUBLIC_APP_URL`

4. **Restrict Database Access**:
   - Don't expose port 5432 publicly
   - Use Docker networks for internal communication
   - Configure PostgreSQL authentication

5. **Regular Updates**:
   ```bash
   docker compose pull
   docker compose up -d --build
   ```

## Monitoring and Logging

### View Real-Time Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app

# Last 100 lines
docker compose logs --tail=100 app
```

### Export Logs

```bash
# Export to file
docker compose logs > setu-logs.txt

# Export with timestamps
docker compose logs -t > setu-logs-timestamped.txt
```

### Monitor Resource Usage

```bash
# Container stats
docker stats

# Specific container
docker stats setu-app setu-postgres
```

## Support

For additional support:

- **Documentation**: Check the main README.md
- **Issues**: Report bugs on the issue tracker
- **Community**: Join our community forum
- **Email**: support@setu-gateway.example.com

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: Setu Development Team
