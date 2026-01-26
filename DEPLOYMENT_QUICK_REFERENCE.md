# Setu Deployment - Quick Reference

## One-Line Installation

### Linux / macOS
```bash
chmod +x install_setu.sh && ./install_setu.sh
```

### Windows
```cmd
install_setu.bat
```

## Common Commands

### Start/Stop Application
```bash
# Start
docker compose up -d

# Stop
docker compose stop

# Restart
docker compose restart

# Stop and remove
docker compose down

# Stop and remove with volumes
docker compose down -v
```

### View Logs
```bash
# All logs
docker compose logs -f

# App logs only
docker compose logs -f app

# Database logs only
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100
```

### Database Operations
```bash
# Access PostgreSQL CLI
docker compose exec db psql -U setu -d setu_db

# Run SQL query
docker compose exec db psql -U setu -d setu_db -c "SELECT * FROM farmers;"

# Backup database
docker compose exec db pg_dump -U setu setu_db > backup.sql

# Restore database
docker compose exec -T db psql -U setu -d setu_db < backup.sql

# Reset database
docker compose down -v && ./install_setu.sh
```

### Prisma Operations
```bash
# Run migrations
docker compose exec app npx prisma db push

# Seed database
docker compose exec app node prisma/seed.js

# Open Prisma Studio
docker compose exec app npx prisma studio

# Generate Prisma Client
docker compose exec app npx prisma generate
```

### Container Management
```bash
# Check container status
docker compose ps

# View container stats
docker stats setu-app setu-postgres

# Execute shell in container
docker compose exec app sh
docker compose exec db sh

# Rebuild containers
docker compose up -d --build
```

## URLs

- **Application**: http://localhost:3000
- **Debug Interface**: http://localhost:3000/debug
- **Prisma Studio**: http://localhost:5555 (when running)

## Default Credentials

- **Database User**: `setu`
- **Database Password**: `setu_password`
- **Database Name**: `setu_db`
- **Database Port**: `5432`
- **App Port**: `3000`

## Troubleshooting

### Port Already in Use

**Linux/macOS:**
```bash
# Find process
lsof -i :3000
lsof -i :5432

# Kill process
kill -9 <PID>
```

**Windows:**
```cmd
# Find process
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Kill process
taskkill /F /PID <PID>
```

### Docker Issues

```bash
# Restart Docker daemon
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop (Windows/macOS)

# Clean Docker system
docker system prune -a --volumes

# Check Docker status
docker info
```

### Database Issues

```bash
# Check database health
docker compose exec db pg_isready -U setu -d setu_db

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Application Issues

```bash
# View app logs
docker compose logs app

# Restart app
docker compose restart app

# Rebuild app
docker compose up -d --build app
```

## Environment Variables

Edit `.env` file:

```env
# Database
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# AI API Key
OPENAI_API_KEY=your-api-key-here

# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

After editing, restart:
```bash
docker compose restart
```

## Quick Fixes

### Complete Reset
```bash
docker compose down -v
rm .env
./install_setu.sh
```

### Update Application
```bash
git pull
docker compose up -d --build
```

### Clear Cache
```bash
docker compose down
docker system prune -f
docker compose up -d --build
```

## Health Checks

```bash
# Check all services
docker compose ps

# Test application
curl http://localhost:3000

# Test database
docker compose exec db pg_isready -U setu -d setu_db

# View resource usage
docker stats
```

## Backup & Restore

### Full Backup
```bash
# Backup database
docker compose exec db pg_dump -U setu setu_db > backup_$(date +%Y%m%d).sql

# Backup .env
cp .env .env.backup
```

### Full Restore
```bash
# Restore database
docker compose exec -T db psql -U setu -d setu_db < backup_20240126.sql

# Restore .env
cp .env.backup .env
docker compose restart
```

## Performance Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Network inspection
docker network inspect setu_network

# Volume inspection
docker volume inspect setu_postgres_data
```

## Development Mode

```bash
# Run in development mode
docker compose -f docker-compose.dev.yml up

# Watch logs
docker compose logs -f --tail=100

# Hot reload (if configured)
docker compose restart app
```

## Production Checklist

- [ ] Change default database password
- [ ] Add OpenAI API key
- [ ] Configure SSL/TLS
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Restrict database port
- [ ] Enable firewall rules
- [ ] Set up log rotation
- [ ] Configure health checks
- [ ] Set up alerting

## Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md`
- **Logs**: `docker compose logs -f`
- **Status**: `docker compose ps`
- **Health**: `docker compose exec db pg_isready -U setu`

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: 2024-01-26
