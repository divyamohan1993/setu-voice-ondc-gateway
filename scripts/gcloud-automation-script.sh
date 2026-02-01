#!/bin/bash

# ==========================================
# 1. System Prep & User Creation
# ==========================================
# (Standard setup for a fresh VM)
apt-get update
apt-get install -y git nano vim curl

# Define your user
USERNAME="divyamohan1993"

# Create the user if it's missing (Crucial for fresh VMs)
if ! id "$USERNAME" &>/dev/null; then
    echo "Creating user $USERNAME..."
    useradd -m -s /bin/bash "$USERNAME"
    # Add to sudoers so deploy script works
    echo "$USERNAME ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/divyamohan-init
    chmod 440 /etc/sudoers.d/divyamohan-init
    # Add to systemd-journal for logs
    usermod -aG systemd-journal "$USERNAME"
fi

# ==========================================
# 2. Clone & Configure (Run as User)
# ==========================================
sudo -u "$USERNAME" bash <<'EOF'
    set -e
    
    USERNAME="divyamohan1993"
    USER_HOME="/home/$USERNAME"
    APP_DIR="$USER_HOME/setu-voice-ondc-gateway"
    
    # A. Clean start (Remove any partial attempts)
    if [ -d "$APP_DIR" ]; then
        rm -rf "$APP_DIR"
    fi

    # B. Clone the repo
    echo "Cloning repository..."
    git clone https://github.com/divyamohan1993/setu-voice-ondc-gateway.git "$APP_DIR"
    cd "$APP_DIR"

    # C. WRITE THE .ENV FILE DIRECTLY
    # This creates the file with your keys so the app works immediately.
    # ---------------------------------------------------------
    # 👇👇 PASTE YOUR FULL .ENV CONTENT BELOW BETWEEN THE 'EOT' LINES 👇👇
    cat > .env <<EOT
GOOGLE_API_KEY=[GCP_API_KEY]
GEMINI_API_KEY=[GCP_API_KEY]
# Any other keys from your local .env...
EOT
    # ---------------------------------------------------------

    # D. Run Deployment
    echo "Starting deployment..."
    chmod +x deploy_gcp.sh
    ./deploy_gcp.sh
EOF

echo "Startup script completed."