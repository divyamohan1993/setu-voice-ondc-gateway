# Docker Quick Start - Setu Voice-to-ONDC Gateway

## Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+

## Setup in 5 Steps

### 1. Create Environment File
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key (optional):
```bash
OPENAI_API_KEY=sk-your-key-here
```

### 2. Build and Start
```bash
docker compose up -d --build
```

### 3. Wait for Services
The app will automatically wait for the database to be ready (health check).

### 4. Initialize Database
```bash
# Push Prisma schema
docker compose exec app npx prisma db push

# Seed sample data
docker compose exec app npx prisma db seed
```

### 5. Access Application
Open http://localhost:3000 in your browser.

## Verify Setup

Check if services are running:
```bash
docker compose ps
```

Expected output:
```
NAME            IMAGE              STATUS         PORTS
setu-app        setu-app:latest    Up (healthy)   0.0.0.0:3000->3000/tcp
setu-postgres   postgres:16-alpine Up (healthy)   0.0.0.0:5432->5432/tcp
```

## Common Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Clean slate (removes volumes)
docker compose down -v
```

## Troubleshooting

### Port 3000 already in use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Port 5432 already in use
```bash
# Find and kill process
lsof -i :5432
kill -9 <PID>
```

### Database connection failed
```bash
# Check database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Rebuild from scratch
```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

## Next Steps

1. ✅ Services running
2. ✅ Database initialized
3. ✅ Sample data seeded
4. 🎯 Open http://localhost:3000
5. 🎯 Test voice scenarios
6. 🎯 View network logs at http://localhost:3000/debug

## Need Help?

See detailed documentation in `DOCKER_SETUP.md`
