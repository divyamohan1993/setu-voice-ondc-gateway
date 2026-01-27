# Docker Setup Guide - Setu Voice-to-ONDC Gateway

This guide explains the Docker configuration for the Setu application.

## Architecture

The application uses a multi-container Docker setup with:
- **Next.js Application Container**: Runs the web application on port 3000
- **PostgreSQL Database Container**: Runs PostgreSQL 16 on port 5432

## Files Overview

### Dockerfile
Multi-stage build for optimized Next.js deployment:
1. **deps stage**: Installs Node.js dependencies
2. **builder stage**: Generates Prisma client and builds Next.js app
3. **runner stage**: Creates minimal production image with only necessary files

### docker-compose.yml
Orchestrates both services with:
- Health checks for database readiness
- Named volumes for data persistence
- Environment variable configuration
- Network isolation for service communication

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Database Configuration
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db

# Database URL for Prisma
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# AI API Key (Optional - fallback mechanism handles missing keys)
OPENAI_API_KEY=

# Next.js Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

## Quick Start

### 1. Build and Start Services

```bash
docker compose up -d --build
```

This will:
- Build the Next.js application image
- Pull PostgreSQL 16 Alpine image
- Start both containers in detached mode
- Create named volumes for database persistence

### 2. Wait for Database Health Check

The app container automatically waits for the database to be healthy before starting.

### 3. Initialize Database

Run Prisma migrations:

```bash
docker compose exec app npx prisma db push
```

Seed the database with sample data:

```bash
docker compose exec app npx prisma db seed
```

### 4. Access Application

Open your browser to: http://localhost:3000

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db
```

### Stop Services

```bash
docker compose down
```

### Stop and Remove Volumes (Clean Slate)

```bash
docker compose down -v
```

### Rebuild Application

```bash
docker compose up -d --build app
```

### Access Database

```bash
docker compose exec db psql -U setu -d setu_db
```

### Run Prisma Commands

```bash
# Generate Prisma Client
docker compose exec app npx prisma generate

# Push schema changes
docker compose exec app npx prisma db push

# Open Prisma Studio
docker compose exec app npx prisma studio
```

## Volume Mounts

### Database Persistence
- **Volume**: `setu_postgres_data`
- **Mount Point**: `/var/lib/postgresql/data`
- **Purpose**: Persists database data across container restarts

### Prisma Directory
- **Mount**: `./prisma:/app/prisma`
- **Purpose**: Allows schema changes without rebuilding the container

## Networking

All services communicate through the `setu_network` bridge network:
- **App Container**: Accessible at `app:3000` internally
- **DB Container**: Accessible at `db:5432` internally
- **External Access**: 
  - App: `localhost:3000`
  - DB: `localhost:5432`

## Health Checks

### Database Health Check
- **Command**: `pg_isready -U setu`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Retries**: 5

The application container waits for the database to pass health checks before starting.

## Troubleshooting

### Port Already in Use

If ports 3000 or 5432 are already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Find process using port 5432
lsof -i :5432

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

Check database logs:
```bash
docker compose logs db
```

Verify connection string in `.env` matches docker-compose.yml settings.

### Application Build Failures

Clean build cache and rebuild:
```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

### Prisma Client Issues

Regenerate Prisma client:
```bash
docker compose exec app npx prisma generate
```

## Production Considerations

For production deployment:

1. **Use secrets management** for sensitive environment variables
2. **Enable SSL/TLS** for database connections
3. **Configure proper backup strategy** for database volumes
4. **Use Docker secrets** instead of environment variables for passwords
5. **Implement proper logging** and monitoring
6. **Use reverse proxy** (nginx/traefik) for SSL termination
7. **Set resource limits** in docker-compose.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Security Notes

- The application runs as a non-root user (nextjs:nodejs)
- Database credentials should be changed from defaults
- Use Docker secrets for production deployments
- Keep base images updated for security patches

## Next Steps

After successful Docker setup:
1. Configure environment variables in `.env`
2. Run database migrations
3. Seed initial data
4. Access the application at http://localhost:3000
5. Check the debug page at http://localhost:3000/debug

For the automated deployment script, see `install_setu.sh` (coming in Phase 9).
