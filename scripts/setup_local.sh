#!/bin/bash

################################################################################
# Setu Voice-to-ONDC Gateway - Local Development Setup
################################################################################
#
# Description:
#   This script sets up Setu for local development without Docker.
#   Uses SQLite instead of PostgreSQL for simplicity.
#
# Usage:
#   chmod +x setup_local.sh
#   ./setup_local.sh
#
# Requirements:
#   - Node.js 18+ installed
#   - npm 7+ installed
#
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[OK] $1${NC}"
}

print_error() {
    echo -e "${RED}[X] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[i] $1${NC}"
}

print_header() {
    echo -e "${CYAN}"
    echo ""
    echo "  $1"
    echo ""
    echo -e "${NC}"
}

clear

echo -e "${CYAN}"
cat << 'EOF'
    ____  ____  ____  _  _    __    ___   ___   __   __    
   / ___)(  __)(_  _)/ )( \  (  )  /___\ / __) / _\ (  )   
   \___ \ ) _)   )(  ) \/ (  / (_/\(  O )( (__ /    \/ (_/\
   (____/(____) (__) \____/  \____/ \__/  \___)\_/\_/\____/
                                                            
   Voice-to-ONDC Gateway - Local Development Setup
EOF
echo -e "${NC}"
echo ""

################################################################################
# Dependency Checks
################################################################################

print_header "Checking Dependencies"

print_info "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

print_info "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm is installed ($(npm --version))"

echo ""

################################################################################
# Port Check
################################################################################

print_header "Port Management"

print_info "Checking if port 3000 is available..."
if lsof -i :3000 &> /dev/null || netstat -an 2>/dev/null | grep ":3000 " | grep LISTEN &> /dev/null; then
    print_warning "Port 3000 is currently in use"
    echo ""
    read -p "Do you want to kill the process using port 3000? [y/N]: " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Attempting to free port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 2
        print_success "Port cleanup attempted"
    fi
else
    print_success "Port 3000 is available"
fi

echo ""

################################################################################
# Environment Setup
################################################################################

print_header "Environment Setup"

print_info "Checking for .env.local file..."
if [ -f .env.local ]; then
    print_success ".env.local file already exists"
    print_info "Using existing environment configuration"
else
    print_info "Creating .env.local file with SQLite configuration..."
    
    cat > .env.local << 'EOF'
# Setu Voice-to-ONDC Gateway - Local Development Environment

# Database Configuration (SQLite for local development)
DATABASE_URL="file:./dev.db"

# OpenAI API Configuration (Optional)
# If not provided, the system will use fallback responses
OPENAI_API_KEY=

# Application Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
EOF
    
    print_success ".env.local file created"
fi

echo ""

################################################################################
# Install Dependencies
################################################################################

print_header "Installing Dependencies"

print_info "This may take a few minutes on first run..."
echo ""

if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

################################################################################
# Database Setup
################################################################################

print_header "Database Setup"

print_info "Generating Prisma client..."
if npx prisma generate; then
    print_success "Prisma client generated"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

print_info "Creating database schema..."
if npx prisma db push --skip-generate; then
    print_success "Database schema created"
else
    print_error "Failed to create database schema"
    exit 1
fi

print_info "Seeding database with sample data..."
if node prisma/seed.js; then
    print_success "Database seeded successfully"
else
    print_error "Failed to seed database"
    exit 1
fi

echo ""

################################################################################
# Success Banner
################################################################################

clear

echo ""
echo -e "${GREEN}"
cat << 'EOF'

                                                                       
                  
                  
                            
                          
               
                   
                                                                       
              Local Development Setup Complete!                       
                                                                       

EOF
echo -e "${NC}"

echo ""
print_header "Setup Summary"

echo -e "${GREEN}[OK] Database:${NC}             ${CYAN}SQLite (prisma/dev.db)${NC}"
echo -e "${GREEN}[OK] Environment:${NC}          ${CYAN}.env.local${NC}"
echo -e "${GREEN}[OK] Node Version:${NC}         ${CYAN}$(node --version)${NC}"
echo -e "${GREEN}[OK] npm Version:${NC}          ${CYAN}$(npm --version)${NC}"

echo ""
print_header "Next Steps"

echo "1. Start the development server:"
echo "   ${CYAN}npm run dev${NC}"
echo ""
echo "2. Open your browser and navigate to: ${CYAN}http://localhost:3000${NC}"
echo ""
echo "3. Try the voice scenarios from the dropdown menu"
echo ""
echo "4. View the debug interface at: ${CYAN}http://localhost:3000/debug${NC}"
echo ""
echo "5. Run tests:"
echo "   ${CYAN}npm test${NC}"
echo ""
echo "6. OPTIONAL: Add your OpenAI API key to .env.local:"
echo "   ${CYAN}OPENAI_API_KEY=\"your-actual-api-key\"${NC}"

echo ""
print_header "Useful Commands"

echo "  Start dev server:     ${CYAN}npm run dev${NC}"
echo "  Run tests:            ${CYAN}npm test${NC}"
echo "  Run tests with UI:    ${CYAN}npm run test:ui${NC}"
echo "  Test coverage:        ${CYAN}npm run test:coverage${NC}"
echo "  View database:        ${CYAN}npx prisma studio${NC}"
echo "  Reset database:       ${CYAN}rm prisma/dev.db && npx prisma db push${NC}"

echo ""
print_success "Setu is ready for local development! "
echo ""
