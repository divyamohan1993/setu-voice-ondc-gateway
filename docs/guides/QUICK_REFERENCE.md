# Setu - Quick Reference Card

##  Installation (One Command)

### Windows
```cmd
install_setu.bat
```

### Linux / macOS
```bash
chmod +x install_setu.sh
./install_setu.sh
```

**What it does**: Installs Docker (if needed), builds containers, initializes database, seeds data

**Time**: 2-10 minutes (depending on whether Docker needs to be installed)

---

##  Access URLs

| Service | URL |
|---------|-----|
| **Main Application** | http://localhost:3000 |
| **Debug Interface** | http://localhost:3000/debug |
| **PostgreSQL** | localhost:5432 |

**Default Credentials**:
- Database: `setu_db`
- User: `setu`
- Password: `setu_password`

---

##  Common Commands

### Container Management

```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# Restart containers
docker compose restart

# Stop and remove all data (WARNING: Deletes database)
docker compose down -v

# View running containers
docker compose ps
```

### Logs

```bash
# View all logs
docker compose logs

# View application logs only
docker compose logs app

# View database logs only
docker compose logs db

# Follow logs in real-time
docker compose logs -f app

# View last 100 lines
docker compose logs --tail=100 app
```

### Database Operations

```bash
# Access PostgreSQL shell
docker compose exec db psql -U setu -d setu_db

# Run Prisma migrations
docker compose exec app npx prisma db push

# Seed database
docker compose exec app node prisma/seed.js

# Check database status
docker compose exec db pg_isready -U setu -d setu_db

# View farmers
docker compose exec db psql -U setu -d setu_db -c "SELECT * FROM farmers;"

# View catalogs
docker compose exec db psql -U setu -d setu_db -c "SELECT * FROM catalogs;"

# View network logs
docker compose exec db psql -U setu -d setu_db -c "SELECT * FROM network_logs;"
```

### Application Management

```bash
# Restart application only
docker compose restart app

# Rebuild application
docker compose up -d --build app

# View application environment
docker compose exec app printenv

# Access application shell
docker compose exec app sh
```

---

##  Testing & Verification

### Quick Verification

**Windows**:
```cmd
verify_installation.bat
```

**Linux/macOS**:
```bash
./verify_installation.sh
```

### Manual Tests

```bash
# Test application is accessible
curl http://localhost:3000

# Test database connection
docker compose exec db pg_isready -U setu -d setu_db

# Count farmers in database
docker compose exec db psql -U setu -d setu_db -t -c "SELECT COUNT(*) FROM farmers;"
```

---

##  Troubleshooting

### Docker Not Running

**Windows**:
```cmd
start_docker.bat
```

**Linux**:
```bash
sudo systemctl start docker
```

**macOS**:
Open Docker Desktop from Applications

### Port Conflicts

**Check what's using port 3000**:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000
```

**Kill process on port**:
```bash
# Windows
taskkill /F /PID <PID>

# Linux/macOS
kill -9 <PID>
```

### Reset Everything

```bash
# Stop containers and remove all data
docker compose down -v

# Remove Docker images
docker rmi setu-app

# Clean Docker system
docker system prune -a

# Reinstall
./install_setu.sh  # or install_setu.bat on Windows
```

### Database Issues

```bash
# Reset database (WARNING: Deletes all data)
docker compose down -v
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app node prisma/seed.js
```

### Application Not Starting

```bash
# Check logs for errors
docker compose logs app

# Rebuild application
docker compose down
docker compose up -d --build

# Check if port 3000 is available
netstat -an | grep 3000  # Linux/macOS
netstat -an | findstr 3000  # Windows
```

---

##  Configuration

### Environment Variables (.env)

```env
# Database
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# AI (Optional - uses fallback if not provided)
OPENAI_API_KEY=your-api-key-here

# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

**After changing .env**:
```bash
docker compose restart app
```

---

##  System Status

### Check Everything

```bash
# Docker status
docker info

# Container status
docker compose ps

# Application health
curl -I http://localhost:3000

# Database health
docker compose exec db pg_isready -U setu -d setu_db

# Disk usage
docker system df
```

### Resource Usage

```bash
# Container resource usage
docker stats

# Container logs size
docker compose logs app | wc -l
```

---

##  Uninstallation

### Remove Application

```bash
# Stop and remove containers
docker compose down -v

# Remove images
docker rmi setu-app postgres:16-alpine

# Remove volumes
docker volume rm setu_postgres_data
```

### Remove Docker (Optional)

**Windows**: Settings -> Apps -> Uninstall Docker Desktop

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

---

##  Quick Workflows

### Fresh Start

```bash
docker compose down -v
./install_setu.sh  # or install_setu.bat
```

### Update Application

```bash
git pull
docker compose down
docker compose up -d --build
```

### Backup Database

```bash
docker compose exec db pg_dump -U setu setu_db > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker compose exec -T db psql -U setu -d setu_db
```

### View Real-Time Logs

```bash
docker compose logs -f app
```

### Debug Mode

```bash
# Access application shell
docker compose exec app sh

# Access database shell
docker compose exec db psql -U setu -d setu_db

# View environment variables
docker compose exec app printenv
```

---

##  Getting Help

1. **Check logs**: `docker compose logs app`
2. **Run verification**: `verify_installation.bat` or `./verify_installation.sh`
3. **Check documentation**: See `INSTALLATION.md` and `README.md`
4. **Check Docker status**: `docker info`
5. **Check container status**: `docker compose ps`

---

## [OK] Success Indicators

You'll know everything is working when:

- [OK] `docker compose ps` shows both containers as "Up"
- [OK] http://localhost:3000 loads the Setu interface
- [OK] `verify_installation` script passes all tests
- [OK] You can select voice scenarios and see visual cards
- [OK] Broadcast button triggers buyer bid notifications
- [OK] Debug interface shows network logs

---

**Built with love for Indian Farmers**

*Keep this reference handy for quick access to common commands and workflows.*
