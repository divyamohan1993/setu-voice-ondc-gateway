#!/bin/bash

################################################################################
# Setu Installation Verification Script
################################################################################

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

print_test() {
    echo -e "${BLUE}[TEST $1]${NC} $2"
}

echo ""
echo "============================================================================"
echo "  Setu Installation Verification"
echo "============================================================================"
echo ""

# Test 1: Docker installed
print_test "1" "Checking if Docker is installed..."
if command -v docker &> /dev/null; then
    print_pass "Docker is installed ($(docker --version))"
else
    print_fail "Docker is not installed"
fi
echo ""

# Test 2: Docker running
print_test "2" "Checking if Docker daemon is running..."
if docker info &> /dev/null; then
    print_pass "Docker daemon is running"
else
    print_fail "Docker daemon is not running"
fi
echo ""

# Test 3: Docker Compose available
print_test "3" "Checking if Docker Compose is available..."
if docker compose version &> /dev/null; then
    print_pass "Docker Compose is available ($(docker compose version))"
else
    print_fail "Docker Compose is not available"
fi
echo ""

# Test 4: Containers running
print_test "4" "Checking if Setu containers are running..."
if docker compose ps | grep -q "setu-app"; then
    print_pass "Setu containers are running"
    docker compose ps
else
    print_fail "Setu containers are not running"
fi
echo ""

# Test 5: Application accessible
print_test "5" "Checking if application is accessible on port 3000..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    print_pass "Application is accessible on http://localhost:3000"
else
    print_fail "Application is not accessible on http://localhost:3000"
fi
echo ""

# Test 6: Database accessible
print_test "6" "Checking if database is accessible..."
if docker compose exec -T db pg_isready -U setu -d setu_db &> /dev/null; then
    print_pass "Database is accessible"
else
    print_fail "Database is not accessible"
fi
echo ""

# Test 7: Seed data present
print_test "7" "Checking if seed data is present..."
FARMER_COUNT=$(docker compose exec -T db psql -U setu -d setu_db -t -c "SELECT COUNT(*) FROM farmers;" 2>/dev/null | tr -d ' \n\r')
if [ -n "$FARMER_COUNT" ] && [ "$FARMER_COUNT" -gt 0 ]; then
    print_pass "Seed data is present ($FARMER_COUNT farmers)"
else
    print_fail "No seed data found"
fi
echo ""

# Summary
echo "============================================================================"
echo "  Verification Summary"
echo "============================================================================"
echo ""
echo -e "Tests Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Tests Failed: ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS]${NC} All tests passed! Setu is fully operational."
    echo ""
    echo "You can access the application at: http://localhost:3000"
    echo "Debug interface: http://localhost:3000/debug"
else
    echo -e "${YELLOW}[WARNING]${NC} Some tests failed. Please review the output above."
    echo ""
    echo "Common fixes:"
    echo "- If Docker is not running: Start Docker Desktop or run 'sudo systemctl start docker'"
    echo "- If containers are not running: Run ./install_setu.sh"
    echo "- If application is not accessible: Check 'docker compose logs app'"
fi
echo ""
echo "============================================================================"
echo ""
