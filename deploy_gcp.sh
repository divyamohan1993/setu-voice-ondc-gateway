#!/bin/bash
set -e

# ==========================================
# Setu Voice-to-ONDC Gateway Deployment Script
# Target: Ubuntu/Debian on GCP (e.g. e2-micro/e2-medium)
# ==========================================

# 1. System Updates & Dependencies
echo "Update system and install dependencies..."
sudo apt-get update
sudo apt-get install -y git curl build-essential python3 nginx certbot python3-certbot-nginx

# 2. Setup Swap (Critical for micro instances to avoid OOM during build)
if [ ! -f /swapfile ]; then
    echo "Setting up 4GB Swap file..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
else
    echo "Swap file already exists."
fi

# 3. Install Node.js 20 (LTS)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js $(node -v) already installed."
fi

# 4. Install PM2 (Process Manager)
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# 5. Clone Application
APP_DIR=~/setu-voice-ondc-gateway
REPO_URL="https://github.com/divyamohan1993/setu-voice-ondc-gateway.git"

if [ -d "$APP_DIR" ]; then
    echo "Updating existing repository..."
    cd $APP_DIR
    git pull
else
    echo "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 6. Setup Environment Variables
# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    # NOTE: You may need to edit this file to add API keys if required
    # defaulting to simple local sqlite as per repo defaults
fi

# 7. Install Dependencies & Build
echo "Installing dependencies..."
npm install

echo "Generating Prisma Client..."
npx prisma generate

echo "Pushing Database Schema (SQLite)..."
npx prisma db push

echo "Building Next.js App..."
npm run build

# 8. Start Application & Webhook Server with PM2
echo "Starting App with PM2..."
chmod +x scripts/redeploy.sh
pm2 delete setu-app 2>/dev/null || true
pm2 start npm --name "setu-app" -- start -- --port 3000

echo "Starting Webhook Handler..."
pm2 delete webhook-handler 2>/dev/null || true
# Pass secret via env var if needed, here we default or rely on .env if loaded
pm2 start scripts/webhook-server.js --name "webhook-handler"

pm2 save
# Ensure PM2 starts on boot
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME | bash 2>/dev/null || true

# 9. Configure Nginx (Reserve Proxy Port 80 -> 3000 & 4000)
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Webhook Endpoint
    location /api/webhook {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Main App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=================================================="
echo "Deployment Complete!"
echo "Your app is live at http://<YOUR_PUBLIC_IP>"
echo "Webhook URL: http://<YOUR_PUBLIC_IP>/api/webhook"
echo "=================================================="
echo "To finish setup:"
echo "1. Add the Webhook URL to your GitHub Repo Settings"
echo "   URL: http://<YOUR_PUBLIC_IP>/api/webhook (or domain)"
echo "   Content Type: application/json"
echo "   Secret: default-secret-change-me (Update in scripts/webhook-server.js if changed)" 
echo "=================================================="
