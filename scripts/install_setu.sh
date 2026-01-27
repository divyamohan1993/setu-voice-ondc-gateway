#!/bin/bash

################################################################################
# Setu Voice-to-ONDC Gateway - One-Click Deployment Script
################################################################################
#
# Description:
#   This script automates the complete deployment of the Setu application,
#   including dependency checks, Docker container setup, database initialization,
#   and data seeding. It provides a production-ready installation with a single
#   command.
#
# Usage:
#   chmod +x install_setu.sh
#   ./install_setu.sh
#
# Requirements:
#   - Docker (version 20.10 or higher)
#   - Docker Compose (version 2.0 or higher)
#   - Bash shell
#
# Author: Setu Development Team
# Version: 1.0.0
#
################################################################################

# Exit immediately if a command exits with a non-zero status
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_PORT=3000
DB_PORT=5432
DB_HEALTH_CHECK_TIMEOUT=60
SCRIPT_START_TIME=$(date +%s)

################################################################################
# Utility Functions
################################################################################

# Print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_header() {
    echo -e "${CYAN}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

# Error handler
error_exit() {
    print_error "Deployment failed: $1"
    print_info "Cleaning up partial deployment..."
    docker compose down -v 2>/dev/null || true
    exit 1
}

# Set up error trap
trap 'error_exit "An unexpected error occurred at line $LINENO"' ERR

################################################################################
# Dependency Checks
################################################################################

install_docker_linux() {
    print_info "Attempting to install Docker on Linux..."
    
    # Detect Linux distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        print_error "Cannot detect Linux distribution"
        return 1
    fi
    
    case $OS in
        ubuntu|debian)
            print_info "Detected Ubuntu/Debian - Installing Docker..."
            
            # Update package index
            sudo apt-get update
            
            # Install prerequisites
            sudo apt-get install -y ca-certificates curl gnupg lsb-release
            
            # Add Docker's official GPG key
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            
            # Set up repository
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Install Docker Engine
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # Start Docker service
            sudo systemctl start docker
            sudo systemctl enable docker
            
            # Add current user to docker group
            sudo usermod -aG docker $USER
            
            print_success "Docker installed successfully"
            print_warning "You may need to log out and back in for group changes to take effect"
            print_info "Or run: newgrp docker"
            ;;
            
        fedora|rhel|centos)
            print_info "Detected Fedora/RHEL/CentOS - Installing Docker..."
            
            # Install prerequisites
            sudo yum install -y yum-utils
            
            # Add Docker repository
            sudo yum-config-manager --add-repo https://download.docker.com/linux/$OS/docker-ce.repo
            
            # Install Docker Engine
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
            
            # Start Docker service
            sudo systemctl start docker
            sudo systemctl enable docker
            
            # Add current user to docker group
            sudo usermod -aG docker $USER
            
            print_success "Docker installed successfully"
            print_warning "You may need to log out and back in for group changes to take effect"
            ;;
            
        arch|manjaro)
            print_info "Detected Arch/Manjaro - Installing Docker..."
            
            # Install Docker
            sudo pacman -Sy --noconfirm docker docker-compose
            
            # Start Docker service
            sudo systemctl start docker
            sudo systemctl enable docker
            
            # Add current user to docker group
            sudo usermod -aG docker $USER
            
            print_success "Docker installed successfully"
            print_warning "You may need to log out and back in for group changes to take effect"
            ;;
            
        *)
            print_error "Unsupported Linux distribution: $OS"
            print_info "Please install Docker manually from: https://docs.docker.com/engine/install/"
            return 1
            ;;
    esac
    
    return 0
}

install_docker_macos() {
    print_info "Attempting to install Docker Desktop on macOS..."
    
    # Check if Homebrew is installed
    if command -v brew &> /dev/null; then
        print_info "Installing Docker Desktop using Homebrew..."
        brew install --cask docker
        
        print_success "Docker Desktop installed successfully"
        print_info "Please start Docker Desktop from Applications"
        print_info "After Docker Desktop is running, run this script again"
        
        # Try to open Docker Desktop
        open -a Docker 2>/dev/null || true
        
        return 0
    else
        print_warning "Homebrew not found"
        print_info "Downloading Docker Desktop installer..."
        
        # Detect architecture
        if [[ $(uname -m) == 'arm64' ]]; then
            DOCKER_URL="https://desktop.docker.com/mac/main/arm64/Docker.dmg"
        else
            DOCKER_URL="https://desktop.docker.com/mac/main/amd64/Docker.dmg"
        fi
        
        # Download Docker Desktop
        curl -L -o /tmp/Docker.dmg "$DOCKER_URL"
        
        if [ $? -eq 0 ]; then
            print_success "Docker Desktop downloaded"
            print_info "Mounting DMG and installing..."
            
            # Mount DMG
            hdiutil attach /tmp/Docker.dmg
            
            # Copy to Applications
            sudo cp -R /Volumes/Docker/Docker.app /Applications/
            
            # Unmount DMG
            hdiutil detach /Volumes/Docker
            
            # Clean up
            rm /tmp/Docker.dmg
            
            print_success "Docker Desktop installed successfully"
            print_info "Please start Docker Desktop from Applications"
            print_info "After Docker Desktop is running, run this script again"
            
            # Try to open Docker Desktop
            open -a Docker 2>/dev/null || true
            
            return 0
        else
            print_error "Failed to download Docker Desktop"
            print_info "Please manually download from: https://docs.docker.com/desktop/install/mac-install/"
            return 1
        fi
    fi
}

check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check for Docker
    print_info "Checking for Docker..."
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed"
        echo ""
        
        # Detect OS and attempt installation
        case "$(uname -s)" in
            Linux*)
                read -p "Would you like to install Docker automatically? [Y/n]: " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    if install_docker_linux; then
                        print_info "Docker installed. Please run this script again."
                        exit 0
                    else
                        print_error "Automatic installation failed"
                        echo "Please install Docker manually from: https://docs.docker.com/engine/install/"
                        exit 1
                    fi
                else
                    print_error "Docker is required to continue"
                    echo "Please install Docker from: https://docs.docker.com/get-docker/"
                    exit 1
                fi
                ;;
                
            Darwin*)
                read -p "Would you like to install Docker Desktop automatically? [Y/n]: " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                    if install_docker_macos; then
                        exit 0
                    else
                        print_error "Automatic installation failed"
                        echo "Please install Docker Desktop manually from: https://docs.docker.com/desktop/install/mac-install/"
                        exit 1
                    fi
                else
                    print_error "Docker is required to continue"
                    echo "Please install Docker Desktop from: https://docs.docker.com/desktop/install/mac-install/"
                    exit 1
                fi
                ;;
                
            *)
                print_error "Unsupported operating system"
                echo "Please install Docker manually from: https://docs.docker.com/get-docker/"
                exit 1
                ;;
        esac
    fi
    print_success "Docker is installed ($(docker --version))"
    
    # Check for Docker Compose
    print_info "Checking for Docker Compose..."
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed or not available"
        echo ""
        echo "Docker Compose should be included with Docker Desktop."
        echo "If you installed Docker Engine separately, install Docker Compose from:"
        echo "https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed ($(docker compose version))"
    
    # Check if Docker daemon is running
    print_info "Checking if Docker daemon is running..."
    if ! docker info &> /dev/null; then
        print_warning "Docker daemon is not running"
        echo ""
        
        # Try to start Docker on Linux
        if [[ "$(uname -s)" == "Linux" ]]; then
            print_info "Attempting to start Docker daemon..."
            sudo systemctl start docker
            sleep 3
            
            if docker info &> /dev/null; then
                print_success "Docker daemon started successfully"
            else
                print_error "Failed to start Docker daemon"
                echo "Please start Docker manually: sudo systemctl start docker"
                exit 1
            fi
        else
            print_error "Docker Desktop is not running"
            echo ""
            echo "Please start Docker Desktop and try again."
            echo "On macOS: Open Docker from Applications"
            exit 1
        fi
    fi
    print_success "Docker daemon is running"
    
    echo ""
}

################################################################################
# Port Management
################################################################################

check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i :$port &> /dev/null
    elif command -v netstat &> /dev/null; then
        netstat -an | grep ":$port " | grep LISTEN &> /dev/null
    elif command -v ss &> /dev/null; then
        ss -ln | grep ":$port " &> /dev/null
    else
        # If no port checking tool is available, assume port is free
        return 1
    fi
}

get_port_process() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i :$port -t 2>/dev/null | head -1
    elif command -v netstat &> /dev/null; then
        # This is a simplified approach and may not work on all systems
        netstat -anp 2>/dev/null | grep ":$port " | grep LISTEN | awk '{print $7}' | cut -d'/' -f1 | head -1
    else
        echo ""
    fi
}

manage_ports() {
    print_header "Port Management"
    
    # Check port 3000 (Application)
    print_info "Checking if port $APP_PORT is available..."
    if check_port $APP_PORT; then
        print_warning "Port $APP_PORT is currently in use"
        local pid=$(get_port_process $APP_PORT)
        
        if [ -n "$pid" ]; then
            echo ""
            read -p "Do you want to kill the process using port $APP_PORT (PID: $pid)? [y/N]: " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -9 $pid 2>/dev/null || true
                sleep 2
                if check_port $APP_PORT; then
                    error_exit "Failed to free port $APP_PORT"
                fi
                print_success "Port $APP_PORT is now available"
            else
                error_exit "Cannot proceed with port $APP_PORT in use. Please free the port manually."
            fi
        else
            print_warning "Could not determine process using port $APP_PORT"
            echo "Please free port $APP_PORT manually and run the script again."
            exit 1
        fi
    else
        print_success "Port $APP_PORT is available"
    fi
    
    # Check port 5432 (PostgreSQL)
    print_info "Checking if port $DB_PORT is available..."
    if check_port $DB_PORT; then
        print_warning "Port $DB_PORT is currently in use"
        local pid=$(get_port_process $DB_PORT)
        
        if [ -n "$pid" ]; then
            echo ""
            read -p "Do you want to kill the process using port $DB_PORT (PID: $pid)? [y/N]: " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                kill -9 $pid 2>/dev/null || true
                sleep 2
                if check_port $DB_PORT; then
                    error_exit "Failed to free port $DB_PORT"
                fi
                print_success "Port $DB_PORT is now available"
            else
                error_exit "Cannot proceed with port $DB_PORT in use. Please free the port manually."
            fi
        else
            print_warning "Could not determine process using port $DB_PORT"
            echo "Please free port $DB_PORT manually and run the script again."
            exit 1
        fi
    else
        print_success "Port $DB_PORT is available"
    fi
    
    echo ""
}

################################################################################
# Environment Setup
################################################################################

setup_environment() {
    print_header "Environment Setup"
    
    print_info "Checking for .env file..."
    if [ -f .env ]; then
        print_success ".env file already exists"
        print_info "Using existing environment configuration"
    else
        print_warning ".env file not found, creating with default values..."
        
        cat > .env << 'EOF'
# Database Configuration
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password
POSTGRES_DB=setu_db

# Database URL for Prisma (used by the application)
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# OpenAI API Configuration
# Replace with your actual OpenAI API key for AI-powered translation
# If not provided, the system will use fallback responses
OPENAI_API_KEY=

# Application Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF
        
        print_success ".env file created with default values"
        print_warning "Please update OPENAI_API_KEY in .env file for AI-powered translation"
        print_info "The system will work with fallback responses if API key is not provided"
    fi
    
    echo ""
}

################################################################################
# Docker Operations
################################################################################

docker_operations() {
    print_header "Docker Operations"
    
    # Clean up any existing containers
    print_info "Cleaning up existing containers..."
    docker compose down -v 2>/dev/null || true
    print_success "Cleanup complete"
    
    # Build and start containers
    print_info "Building and starting Docker containers..."
    print_info "This may take a few minutes on first run..."
    if docker compose up -d --build; then
        print_success "Docker containers started successfully"
    else
        error_exit "Failed to start Docker containers"
    fi
    
    echo ""
}

################################################################################
# Database Health Check
################################################################################

wait_for_database() {
    print_header "Database Health Check"
    
    print_info "Waiting for PostgreSQL to be ready..."
    local elapsed=0
    local max_wait=$DB_HEALTH_CHECK_TIMEOUT
    
    while [ $elapsed -lt $max_wait ]; do
        if docker compose exec -T db pg_isready -U setu -d setu_db &> /dev/null; then
            print_success "PostgreSQL is ready!"
            echo ""
            return 0
        fi
        
        echo -n "."
        sleep 2
        elapsed=$((elapsed + 2))
    done
    
    echo ""
    error_exit "PostgreSQL failed to become ready within $max_wait seconds"
}

################################################################################
# Database Initialization
################################################################################

initialize_database() {
    print_header "Database Initialization"
    
    # Run Prisma migrations
    print_info "Synchronizing database schema with Prisma..."
    if docker compose exec -T app npx prisma db push --skip-generate; then
        print_success "Database schema synchronized"
    else
        error_exit "Failed to synchronize database schema"
    fi
    
    # Run seed script
    print_info "Seeding database with initial data..."
    if docker compose exec -T app node prisma/seed.js; then
        print_success "Database seeded successfully"
    else
        error_exit "Failed to seed database"
    fi
    
    # Verify seed data
    print_info "Verifying seed data..."
    local farmer_count=$(docker compose exec -T db psql -U setu -d setu_db -t -c "SELECT COUNT(*) FROM farmers;" 2>/dev/null | tr -d ' \n\r')
    local catalog_count=$(docker compose exec -T db psql -U setu -d setu_db -t -c "SELECT COUNT(*) FROM catalogs;" 2>/dev/null | tr -d ' \n\r')
    
    if [ "$farmer_count" -gt 0 ] && [ "$catalog_count" -gt 0 ]; then
        print_success "Seed data verified: $farmer_count farmers, $catalog_count catalogs"
    else
        print_warning "Seed data verification inconclusive"
    fi
    
    echo ""
}

################################################################################
# Success Banner
################################################################################

display_success_banner() {
    local script_end_time=$(date +%s)
    local duration=$((script_end_time - SCRIPT_START_TIME))
    
    echo ""
    echo -e "${GREEN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ███████╗███████╗████████╗██╗   ██╗    ██╗     ██╗██╗   ██╗███████╗║
║   ██╔════╝██╔════╝╚══██╔══╝██║   ██║    ██║     ██║██║   ██║██╔════╝║
║   ███████╗█████╗     ██║   ██║   ██║    ██║     ██║██║   ██║█████╗  ║
║   ╚════██║██╔══╝     ██║   ██║   ██║    ██║     ██║╚██╗ ██╔╝██╔══╝  ║
║   ███████║███████╗   ██║   ╚██████╔╝    ███████╗██║ ╚████╔╝ ███████╗║
║   ╚══════╝╚══════╝   ╚═╝    ╚═════╝     ╚══════╝╚═╝  ╚═══╝  ╚══════╝║
║                                                                       ║
║              Voice-to-ONDC Gateway Successfully Deployed!            ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo ""
    print_header "Deployment Summary"
    
    echo -e "${GREEN}✓ Application URL:${NC}      ${CYAN}http://localhost:$APP_PORT${NC}"
    echo -e "${GREEN}✓ Database:${NC}             ${CYAN}PostgreSQL on localhost:$DB_PORT${NC}"
    echo -e "${GREEN}✓ Database Name:${NC}        ${CYAN}setu_db${NC}"
    echo -e "${GREEN}✓ Database User:${NC}        ${CYAN}setu${NC}"
    echo -e "${GREEN}✓ Deployment Time:${NC}      ${CYAN}${duration} seconds${NC}"
    echo -e "${GREEN}✓ Timestamp:${NC}            ${CYAN}$(date '+%Y-%m-%d %H:%M:%S')${NC}"
    
    echo ""
    print_header "Next Steps"
    
    echo "1. Open your browser and navigate to: ${CYAN}http://localhost:$APP_PORT${NC}"
    echo "2. Try the voice scenarios from the dropdown menu"
    echo "3. View the debug interface at: ${CYAN}http://localhost:$APP_PORT/debug${NC}"
    echo ""
    echo "4. ${YELLOW}Important:${NC} Update your OpenAI API key in the .env file:"
    echo "   ${CYAN}OPENAI_API_KEY=\"your-actual-api-key\"${NC}"
    echo "   Then restart the containers: ${CYAN}docker compose restart app${NC}"
    echo ""
    echo "5. To stop the application: ${CYAN}docker compose down${NC}"
    echo "6. To view logs: ${CYAN}docker compose logs -f${NC}"
    echo "7. To restart: ${CYAN}docker compose up -d${NC}"
    
    echo ""
    print_success "Setu is ready to bridge farmers to ONDC! 🌾"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    clear
    
    echo -e "${CYAN}"
    cat << 'EOF'
    ____  ____  ____  _  _    ____  ____  ____  _  _  ____ 
   / ___)(  __)(_  _)/ )( \  / ___)(  __)(_  _)/ )( \(  _ \
   \___ \ ) _)   )(  ) \/ (  \___ \ ) _)   )(  ) \/ ( ) __/
   (____/(____) (__) \____/  (____/(____) (__) \____/(__)  
                                                            
   Voice-to-ONDC Gateway - One-Click Deployment
EOF
    echo -e "${NC}"
    echo ""
    
    # Execute deployment steps
    check_dependencies
    manage_ports
    setup_environment
    docker_operations
    wait_for_database
    initialize_database
    display_success_banner
}

# Run main function
main
