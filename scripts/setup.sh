#!/usr/bin/env bash
# ============================================================================
# Setu Voice-to-ONDC Gateway - Complete Setup Script (Linux/macOS)
# ============================================================================
#
# This idempotent script automatically configures and runs the Setu application.
# It handles all dependencies, configurations, and provides verbose output.
# Safe to run multiple times - will skip already-completed steps.
#
# Project: Setu Voice-to-ONDC Gateway
# Repository: https://github.com/divyamohan1993/setu-voice-ondc-gateway
# Contributors: divyamohan1993, kumkum-thakur
# Hackathon: AI for Bharat - Republic Day 2026
#
# Usage:
#   ./setup.sh           # Auto-detect mode
#   ./setup.sh docker    # Force Docker mode
#   ./setup.sh local     # Force local mode
#   ./setup.sh --help    # Show help
#
# ============================================================================

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="Setu Voice-to-ONDC Gateway"
APP_PORT=3000
DB_PORT=5432
NODE_MIN_VERSION="18.0.0"
DOCKER_MIN_VERSION="20.0.0"
REPO_URL="https://github.com/divyamohan1993/setu-voice-ondc-gateway"

MODE="${1:-auto}"
FORCE=false
VERBOSE=false
VERIFY_ONLY=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Counters
STEP_COUNT=0
ERRORS=()
WARNINGS=()

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

print_banner() {
    echo -e "${MAGENTA}"
    cat << 'EOF'


                                                                              
                                              
                                              
                 Voice-to-ONDC Gateway                
                 Bridging the Digital Divide          
            for Indian Farmers                   
                                                   
                                                                              
   [India] AI for Bharat Hackathon - Republic Day 2026                       
   Contributors: @divyamohan1993 @kumkum-thakur                              
                                                                              


EOF
    echo -e "${NC}"
}

timestamp() {
    date "+%H:%M:%S"
}

print_step() {
    ((STEP_COUNT++))
    echo ""
    echo -e "${GRAY}[$(timestamp)]${NC} ${CYAN}STEP $STEP_COUNT:${NC} ${WHITE}$1${NC}"
    echo -e "${GRAY}$(printf '%.0s' {1..70})${NC}"
}

print_success() {
    echo -e "${GRAY}[$(timestamp)]${NC} ${GREEN}[OK] SUCCESS:${NC} ${GREEN}$1${NC}"
}

print_failure() {
    echo -e "${GRAY}[$(timestamp)]${NC} ${RED}[X] FAILED:${NC} ${RED}$1${NC}"
    if [ -n "$2" ]; then
        echo -e "  ${RED}Details: $2${NC}"
    fi
    ERRORS+=("Step $STEP_COUNT: $1")
}

print_warning() {
    echo -e "${GRAY}[$(timestamp)]${NC} ${YELLOW}[!] WARNING:${NC} ${YELLOW}$1${NC}"
    WARNINGS+=("$1")
}

print_info() {
    echo -e "${GRAY}[$(timestamp)]${NC} ${CYAN}[i] INFO:${NC} $1"
}

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${GRAY}[$(timestamp)]   -> $1${NC}"
    fi
}

print_command() {
    echo -e "  ${GRAY}>${NC} ${CYAN}$1${NC}"
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

version_compare() {
    # Returns 0 if $1 >= $2
    [ "$(printf '%s\n' "$2" "$1" | sort -V | head -n1)" = "$2" ]
}

check_port() {
    if command_exists lsof; then
        lsof -i :"$1" >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -tuln | grep -q ":$1 "
    else
        return 1
    fi
}

kill_process_on_port() {
    local port=$1
    if command_exists lsof; then
        local pid=$(lsof -ti :"$port" 2>/dev/null)
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null || true
            sleep 2
        fi
    fi
}

# ============================================================================
# DEPENDENCY CHECKS
# ============================================================================

check_nodejs() {
    print_info "Checking Node.js..."
    
    if ! command_exists node; then
        print_failure "Node.js is not installed" "Please install Node.js 18+ from https://nodejs.org/"
        return 1
    fi
    
    local node_version=$(node --version | sed 's/v//')
    print_verbose "Found Node.js version: $node_version"
    
    if ! version_compare "$node_version" "$NODE_MIN_VERSION"; then
        print_failure "Node.js version too old" "Required: $NODE_MIN_VERSION+, Found: $node_version"
        return 1
    fi
    
    print_success "Node.js $node_version detected"
    return 0
}

check_npm() {
    print_info "Checking npm..."
    
    if ! command_exists npm; then
        print_failure "npm is not installed" "npm should come with Node.js installation"
        return 1
    fi
    
    local npm_version=$(npm --version)
    print_verbose "Found npm version: $npm_version"
    print_success "npm $npm_version detected"
    return 0
}

check_docker() {
    print_info "Checking Docker..."
    
    if ! command_exists docker; then
        print_warning "Docker is not installed"
        print_info "Docker is optional but recommended. Install from https://docker.com/"
        return 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_warning "Docker is installed but daemon is not running"
        print_info "Please start Docker and try again"
        return 1
    fi
    
    local docker_version=$(docker --version | sed 's/Docker version //' | sed 's/,.*//')
    print_verbose "Found Docker version: $docker_version"
    print_success "Docker $docker_version detected and running"
    return 0
}

check_docker_compose() {
    print_info "Checking Docker Compose..."
    
    # Try docker compose (v2)
    if docker compose version >/dev/null 2>&1; then
        local version=$(docker compose version | sed 's/.*version //' | sed 's/ .*//')
        print_success "Docker Compose $version detected"
        return 0
    fi
    
    # Try docker-compose (v1)
    if command_exists docker-compose; then
        local version=$(docker-compose --version | sed 's/.*version //' | sed 's/,.*//')
        print_success "docker-compose $version detected"
        return 0
    fi
    
    print_warning "Docker Compose is not available"
    return 1
}

check_git() {
    print_info "Checking Git..."
    
    if ! command_exists git; then
        print_warning "Git is not installed - some features may not work"
        return 1
    fi
    
    local git_version=$(git --version | sed 's/git version //')
    print_success "Git $git_version detected"
    return 0
}

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

initialize_environment() {
    print_step "Initializing Environment"
    
    local env_file="$ROOT_DIR/.env"
    local env_example="$ROOT_DIR/.env.example"
    
    if [ -f "$env_file" ] && [ "$FORCE" = false ]; then
        print_info ".env file already exists"
        print_verbose "Use --force to recreate"
        return 0
    fi
    
    if [ -f "$env_example" ]; then
        print_info "Creating .env from .env.example..."
        cp "$env_example" "$env_file"
        print_success ".env file created"
    else
        print_info "Creating default .env file..."
        cat > "$env_file" << EOF
# Database Configuration
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password_$RANDOM
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# AI Configuration (Optional - system works without this)
OPENAI_API_KEY=

# Application Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
EOF
        print_success ".env file created with default values"
    fi
    
    return 0
}

install_dependencies() {
    print_step "Installing Node.js Dependencies"
    
    local node_modules="$ROOT_DIR/node_modules"
    local package_json="$ROOT_DIR/package.json"
    
    if [ -d "$node_modules" ] && [ "$FORCE" = false ]; then
        local module_count=$(ls -1 "$node_modules" | wc -l)
        if [ "$module_count" -gt 10 ]; then
            print_info "node_modules already exists with $module_count packages"
            print_verbose "Use --force to reinstall"
            return 0
        fi
    fi
    
    if [ ! -f "$package_json" ]; then
        print_failure "package.json not found" "Are you in the correct directory?"
        return 1
    fi
    
    print_info "Running npm install..."
    print_command "npm install"
    
    if ! npm install 2>&1; then
        print_failure "npm install failed"
        return 1
    fi
    
    print_success "Dependencies installed successfully"
    return 0
}

# ============================================================================
# DATABASE SETUP
# ============================================================================

initialize_database_docker() {
    print_step "Initializing Database (Docker)"
    
    print_info "Starting database container..."
    print_command "docker compose up -d db"
    
    if ! docker compose up -d db 2>&1; then
        print_failure "Failed to start database container"
        return 1
    fi
    
    print_info "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        ((attempt++))
        print_verbose "Attempt $attempt/$max_attempts..."
        
        if docker compose exec -T db pg_isready -U setu -d setu_db >/dev/null 2>&1; then
            print_success "Database is ready"
            break
        fi
        
        sleep 2
    done
    
    if [ $attempt -ge $max_attempts ]; then
        print_failure "Database failed to start within timeout"
        return 1
    fi
    
    # Run Prisma migrations
    print_info "Running database migrations..."
    print_command "npx prisma db push"
    
    if ! npx prisma db push 2>&1; then
        print_warning "Prisma db push had issues"
    else
        print_success "Database schema synchronized"
    fi
    
    return 0
}

initialize_database_local() {
    print_step "Initializing Database (SQLite - Local Mode)"
    
    print_info "Using SQLite for local development..."
    
    # Generate Prisma client
    print_info "Generating Prisma client..."
    print_command "npx prisma generate"
    npx prisma generate 2>&1 || print_warning "Prisma generate had issues"
    
    # Push schema
    print_info "Pushing database schema..."
    print_command "npx prisma db push"
    npx prisma db push 2>&1 || print_warning "Prisma db push had issues"
    
    print_success "Local database initialized"
    return 0
}

# ============================================================================
# APPLICATION STARTUP
# ============================================================================

start_application_docker() {
    print_step "Starting Application (Docker Mode)"
    
    print_info "Building and starting containers..."
    print_command "docker compose up -d --build"
    
    if ! docker compose up -d --build 2>&1; then
        print_failure "Failed to start Docker containers"
        return 1
    fi
    
    print_info "Waiting for application to be ready..."
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        ((attempt++))
        print_verbose "Attempt $attempt/$max_attempts..."
        
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT" 2>/dev/null | grep -q "200"; then
            print_success "Application is running!"
            return 0
        fi
        
        sleep 2
    done
    
    print_warning "Application may still be starting..."
    return 0
}

start_application_local() {
    print_step "Starting Application (Local Development Mode)"
    
    # Check port availability
    if check_port $APP_PORT; then
        print_warning "Port $APP_PORT is in use"
        read -p "Would you like to kill the process? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_process_on_port $APP_PORT
        else
            print_failure "Port $APP_PORT is not available"
            return 1
        fi
    fi
    
    print_info "Starting development server..."
    print_info "The server will start. Press Ctrl+C to stop."
    print_command "npm run dev"
    
    # Start in background
    npm run dev &
    local pid=$!
    
    print_info "Waiting for application to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        ((attempt++))
        sleep 2
        
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT" 2>/dev/null | grep -q "200"; then
            print_success "Application is running! (PID: $pid)"
            return 0
        fi
    done
    
    print_warning "Application may still be starting. Check the console for details."
    return 0
}

# ============================================================================
# VERIFICATION
# ============================================================================

verify_installation() {
    print_step "Verifying Installation"
    
    local passed=0
    local failed=0
    
    # Check node_modules
    if [ -d "$ROOT_DIR/node_modules" ]; then
        print_success "node_modules exists"
        ((passed++))
    else
        print_failure "node_modules missing"
        ((failed++))
    fi
    
    # Check .env
    if [ -f "$ROOT_DIR/.env" ]; then
        print_success ".env file exists"
        ((passed++))
    else
        print_failure ".env file missing"
        ((failed++))
    fi
    
    # Check Prisma client
    if [ -d "$ROOT_DIR/node_modules/.prisma" ]; then
        print_success "Prisma client generated"
        ((passed++))
    else
        print_failure "Prisma client missing"
        ((failed++))
    fi
    
    # Check if app is accessible
    print_info "Checking application accessibility..."
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$APP_PORT" 2>/dev/null | grep -q "200"; then
        print_success "Application is accessible on port $APP_PORT"
        ((passed++))
    else
        print_warning "Application is not yet accessible (may still be starting)"
    fi
    
    print_info "Verification complete: $passed passed, $failed failed"
    return $failed
}

# ============================================================================
# SUMMARY
# ============================================================================

print_summary() {
    echo ""
    echo -e "${MAGENTA}$(printf '%.0s' {1..70})${NC}"
    echo ""
    
    if [ ${#ERRORS[@]} -eq 0 ]; then
        echo -e "  ${GREEN}[SUCCESS] SETUP COMPLETED SUCCESSFULLY!${NC}"
        echo ""
        echo -e "  ${WHITE}Access the application:${NC}"
        echo -e "  ${GRAY}${NC} Main App:     ${CYAN}http://localhost:$APP_PORT${NC}"
        echo -e "  ${GRAY}${NC} Debug View:   ${CYAN}http://localhost:$APP_PORT/debug${NC}"
        echo -e "  ${GRAY}${NC} Repository:   ${CYAN}$REPO_URL${NC}"
    else
        echo -e "  ${YELLOW}[!] SETUP COMPLETED WITH ERRORS${NC}"
        echo ""
        echo -e "  ${WHITE}The following errors occurred:${NC}"
        for error in "${ERRORS[@]}"; do
            echo -e "  ${RED}* $error${NC}"
        done
    fi
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo ""
        echo -e "  ${YELLOW}Warnings:${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo -e "  ${YELLOW}* $warning${NC}"
        done
    fi
    
    echo ""
    echo -e "${MAGENTA}$(printf '%.0s' {1..70})${NC}"
    echo ""
}

# ============================================================================
# HELP
# ============================================================================

show_help() {
    cat << EOF
Setu Voice-to-ONDC Gateway - Setup Script

Usage: $0 [MODE] [OPTIONS]

Modes:
  auto      Auto-detect best mode (default)
  docker    Use Docker for deployment
  local     Use local Node.js development server

Options:
  --force       Force reinstall even if already configured
  --verbose     Enable verbose output
  --verify      Only verify installation without running
  --help, -h    Show this help message

Examples:
  $0                    # Auto-detect and run
  $0 docker             # Force Docker mode
  $0 local --verbose    # Local mode with verbose output
  $0 --verify           # Verify existing installation

Repository: $REPO_URL
EOF
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    # Parse arguments
    for arg in "$@"; do
        case $arg in
            --force)
                FORCE=true
                ;;
            --verbose)
                VERBOSE=true
                ;;
            --verify)
                VERIFY_ONLY=true
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            docker|local|auto)
                MODE=$arg
                ;;
        esac
    done
    
    local start_time=$(date +%s)
    
    # Display banner
    print_banner
    
    echo -e "${GRAY}Starting setup at $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${GRAY}Mode: $MODE | Force: $FORCE | Verbose: $VERBOSE${NC}"
    echo ""
    
    # Change to script directory
    cd "$ROOT_DIR"
    
    # Step 1: Check dependencies
    print_step "Checking Dependencies"
    
    check_nodejs || { print_summary; exit 1; }
    check_npm || { print_summary; exit 1; }
    
    local docker_ok=false
    local docker_compose_ok=false
    
    if check_docker; then
        docker_ok=true
        if check_docker_compose; then
            docker_compose_ok=true
        fi
    fi
    
    check_git || true
    
    # Auto-detect mode
    if [ "$MODE" = "auto" ]; then
        if [ "$docker_ok" = true ] && [ "$docker_compose_ok" = true ]; then
            MODE="docker"
            print_info "Auto-selected Docker mode"
        else
            MODE="local"
            print_info "Auto-selected Local mode (Docker not available)"
        fi
    fi
    
    # Step 2: Initialize environment
    initialize_environment || { print_summary; exit 1; }
    
    # Step 3: Install dependencies
    install_dependencies || { print_summary; exit 1; }
    
    # Step 4: Setup database
    if [ "$MODE" = "docker" ]; then
        if ! initialize_database_docker; then
            print_warning "Docker database setup failed, trying local mode"
            MODE="local"
        fi
    fi
    
    if [ "$MODE" = "local" ]; then
        initialize_database_local || { print_summary; exit 1; }
    fi
    
    # Step 5: Start application (unless verify only)
    if [ "$VERIFY_ONLY" = false ]; then
        if [ "$MODE" = "docker" ]; then
            start_application_docker
        else
            start_application_local
        fi
    fi
    
    # Step 6: Verify installation
    verify_installation
    
    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    print_info "Total time: $((duration / 60))m $((duration % 60))s"
    
    # Display summary
    print_summary
    
    # Open browser
    if [ ${#ERRORS[@]} -eq 0 ] && [ "$VERIFY_ONLY" = false ]; then
        read -p "Open application in browser? (Y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            if command_exists xdg-open; then
                xdg-open "http://localhost:$APP_PORT"
            elif command_exists open; then
                open "http://localhost:$APP_PORT"
            fi
        fi
    fi
}

# Run main function
main "$@"
