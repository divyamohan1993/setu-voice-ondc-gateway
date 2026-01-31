#!/bin/bash
set -e

# Redeployment Script
# Call this when new code is pushed

echo "=========================================="
echo "Starting Redeployment: $(date)"
echo "=========================================="

# 1. Pull latest code
echo "Pulling latest code..."
git pull origin main

# 2. Install dependencies
echo "Installing dependencies..."
npm install

# 3. Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# 4. Push User Schema
echo "Pushing DB schema..."
npx prisma db push

# 5. Build
echo "Building application..."
npm run build

# 6. Restart PM2 process
echo "Restarting application..."
pm2 restart setu-app

echo "=========================================="
echo "Redeployment Complete!"
echo "=========================================="
