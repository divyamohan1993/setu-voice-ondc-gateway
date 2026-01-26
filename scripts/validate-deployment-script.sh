#!/bin/bash

################################################################################
# Deployment Script Validation
################################################################################
#
# This script validates the install_setu.sh deployment script for:
# - Syntax errors
# - Required functions
# - Configuration variables
# - Error handling
#
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_PATH="./install_setu.sh"
ERRORS=0
WARNINGS=0

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

echo "=================================="
echo "Deployment Script Validation"
echo "=================================="
echo ""

# Check if script exists
print_info "Checking if script exists..."
if [ -f "$SCRIPT_PATH" ]; then
    print_success "Script file exists: $SCRIPT_PATH"
else
    print_error "Script file not found: $SCRIPT_PATH"
    exit 1
fi

# Check if script is executable
print_info "Checking if script is executable..."
if [ -x "$SCRIPT_PATH" ]; then
    print_success "Script is executable"
else
    print_warning "Script is not executable (run: chmod +x $SCRIPT_PATH)"
fi

# Check bash syntax
print_info "Checking bash syntax..."
if bash -n "$SCRIPT_PATH" 2>/dev/null; then
    print_success "Bash syntax is valid"
else
    print_error "Bash syntax errors found"
    bash -n "$SCRIPT_PATH"
fi

# Check for shebang
print_info "Checking for shebang..."
if head -n 1 "$SCRIPT_PATH" | grep -q "^#!/bin/bash"; then
    print_success "Correct shebang found"
else
    print_error "Missing or incorrect shebang"
fi

# Check for set -e
print_info "Checking for error handling (set -e)..."
if grep -q "^set -e" "$SCRIPT_PATH"; then
    print_success "Error handling enabled (set -e)"
else
    print_warning "Error handling not found (set -e)"
fi

# Check for required functions
print_info "Checking for required functions..."
REQUIRED_FUNCTIONS=(
    "check_dependencies"
    "manage_ports"
    "setup_environment"
    "docker_operations"
    "wait_for_database"
    "initialize_database"
    "display_success_banner"
    "main"
)

for func in "${REQUIRED_FUNCTIONS[@]}"; do
    if grep -q "^${func}()" "$SCRIPT_PATH"; then
        print_success "Function found: $func"
    else
        print_error "Function missing: $func"
    fi
done

# Check for configuration variables
print_info "Checking for configuration variables..."
REQUIRED_VARS=(
    "APP_PORT"
    "DB_PORT"
    "DB_HEALTH_CHECK_TIMEOUT"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" "$SCRIPT_PATH"; then
        print_success "Variable found: $var"
    else
        print_error "Variable missing: $var"
    fi
done

# Check for color codes
print_info "Checking for color codes..."
COLOR_CODES=("RED" "GREEN" "YELLOW" "BLUE" "CYAN" "NC")

for color in "${COLOR_CODES[@]}"; do
    if grep -q "^${color}=" "$SCRIPT_PATH"; then
        print_success "Color code found: $color"
    else
        print_warning "Color code missing: $color"
    fi
done

# Check for Docker commands
print_info "Checking for Docker commands..."
DOCKER_COMMANDS=(
    "docker --version"
    "docker compose version"
    "docker info"
    "docker compose down"
    "docker compose up"
    "docker compose exec"
)

for cmd in "${DOCKER_COMMANDS[@]}"; do
    if grep -q "$cmd" "$SCRIPT_PATH"; then
        print_success "Docker command found: $cmd"
    else
        print_warning "Docker command not found: $cmd"
    fi
done

# Check for Prisma commands
print_info "Checking for Prisma commands..."
if grep -q "npx prisma db push" "$SCRIPT_PATH"; then
    print_success "Prisma migration command found"
else
    print_error "Prisma migration command missing"
fi

if grep -q "node prisma/seed.js" "$SCRIPT_PATH"; then
    print_success "Prisma seed command found"
else
    print_error "Prisma seed command missing"
fi

# Check for health check
print_info "Checking for database health check..."
if grep -q "pg_isready" "$SCRIPT_PATH"; then
    print_success "Database health check found"
else
    print_error "Database health check missing"
fi

# Check for error trapping
print_info "Checking for error trapping..."
if grep -q "trap.*ERR" "$SCRIPT_PATH"; then
    print_success "Error trap found"
else
    print_warning "Error trap not found"
fi

# Check for cleanup function
print_info "Checking for cleanup function..."
if grep -q "error_exit" "$SCRIPT_PATH"; then
    print_success "Cleanup function found"
else
    print_warning "Cleanup function not found"
fi

# Check for ASCII art banner
print_info "Checking for ASCII art banner..."
if grep -q "SETU" "$SCRIPT_PATH" && grep -q "╔═" "$SCRIPT_PATH"; then
    print_success "ASCII art banner found"
else
    print_warning "ASCII art banner not found"
fi

# Check for .env file creation
print_info "Checking for .env file creation..."
if grep -q "cat > .env" "$SCRIPT_PATH"; then
    print_success ".env file creation found"
else
    print_error ".env file creation missing"
fi

# Check for port checking logic
print_info "Checking for port checking logic..."
if grep -q "check_port" "$SCRIPT_PATH"; then
    print_success "Port checking logic found"
else
    print_error "Port checking logic missing"
fi

# Summary
echo ""
echo "=================================="
echo "Validation Summary"
echo "=================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "All checks passed! Script is ready for deployment."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    print_warning "$WARNINGS warning(s) found. Script should work but may need improvements."
    exit 0
else
    print_error "$ERRORS error(s) and $WARNINGS warning(s) found. Please fix errors before deployment."
    exit 1
fi
