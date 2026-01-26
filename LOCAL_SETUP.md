# Setu - Local Development Setup (Without Docker)

This guide is for systems where Docker virtualization is not supported. It provides an alternative setup using local Node.js and SQLite.

## Prerequisites

- Node.js 18+ (you have v24.11.1 ✓)
- npm 7+ (you have 11.6.2 ✓)

## Quick Start

### Windows

```cmd
setup_local.bat
```

### Linux/macOS

```bash
chmod +x setup_local.sh
./setup_local.sh
```

## Manual Setup

If you prefer to run commands manually:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
copy .env.example .env.local

# Edit .env.local and update DATABASE_URL to use SQLite:
# DATABASE_URL="file:./dev.db"
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# Seed with sample data
node prisma/seed.js
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:3000

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Differences from Docker Setup

| Feature | Docker Setup | Local Setup |
|---------|-------------|-------------|
| Database | PostgreSQL 16 | SQLite |
| Port Management | Automatic | Manual |
| Isolation | Containerized | Local process |
| Setup Time | 2-5 minutes | 1-2 minutes |
| Production Ready | Yes | Development only |

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find and kill the process
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Or use a different port
set PORT=3001
npm run dev
```

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
del prisma\dev.db
npx prisma db push
node prisma/seed.js
```

### Module Not Found Errors

```bash
# Clean install
rmdir /s /q node_modules
del package-lock.json
npm install
```

## Switching to Docker Later

When Docker becomes available:

1. Stop the local dev server
2. Update `.env` to use PostgreSQL URL
3. Run `install_setu.bat` or `install_setu.sh`

## Features Available in Local Setup

✅ Voice scenario selection
✅ AI translation (with fallback)
✅ Visual catalog verification
✅ Broadcast simulation
✅ Network log viewer
✅ Debug interface
✅ All tests

## Notes

- SQLite is used instead of PostgreSQL for simplicity
- All features work identically to Docker setup
- Database file is stored as `prisma/dev.db`
- Perfect for development and testing
- Not recommended for production deployment
