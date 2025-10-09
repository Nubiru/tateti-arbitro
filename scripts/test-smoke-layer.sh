#!/bin/bash
# Smoke Layer Verification Script
# Tests all core functionality of the smoke deployment
# @lastModified 2025-10-08
# @version 1.0.0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 SMOKE LAYER VERIFICATION TESTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    
    echo -n "Testing ${name}... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Arbitrator Health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: ARBITRATOR HEALTH ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Arbitrator /api/health" "http://localhost:4000/api/health" "200"
echo ""

# Test 2: Bot Health Checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: BOT HEALTH ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "RandomBot1 /health" "http://localhost:3001/health" "200"
test_endpoint "RandomBot2 /health" "http://localhost:3002/health" "200"
echo ""

# Test 3: Bot Discovery
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: BOT DISCOVERY ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Testing /api/bots/available... "

bots_response=$(curl -s "http://localhost:4000/api/bots/available" 2>/dev/null)

if [ $? -eq 0 ]; then
    healthy_count=$(echo "$bots_response" | grep -o '"status":"healthy"' | wc -l)
    total_count=$(echo "$bots_response" | grep -o '"name":"RandomBot' | wc -l)
    
    if [ "$healthy_count" -ge 2 ] && [ "$total_count" -ge 2 ]; then
        echo -e "${GREEN}✅ PASS${NC} (Found $healthy_count healthy bots out of $total_count)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Found $healthy_count healthy bots, expected 2)"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} (Could not connect to endpoint)"
    ((FAILED++))
fi
echo ""

# Test 4: SSE Stream Endpoint (SKIP - SSE keeps connection open)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: SSE STREAM ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚠️  SKIPPED${NC} (SSE keeps connection open - tested in frontend)"
echo ""

# Test 5: Match Execution
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: MATCH EXECUTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Testing POST /api/match... "

match_payload='{
  "player1": {"name": "RandomBot1", "port": 3001},
  "player2": {"name": "RandomBot2", "port": 3002},
  "boardSize": "3x3"
}'

match_response=$(curl -s --max-time 30 -X POST "http://localhost:4000/api/match" \
  -H "Content-Type: application/json" \
  -d "$match_payload" 2>/dev/null)

if [ $? -eq 0 ]; then
    # Check if response contains expected fields
    if echo "$match_response" | grep -q '"result"' && echo "$match_response" | grep -q '"winner"'; then
        echo -e "${GREEN}✅ PASS${NC}"
        echo "   Match completed successfully"
        winner=$(echo "$match_response" | grep -o '"name":"[^"]*"' | head -1)
        result=$(echo "$match_response" | grep -o '"result":"[^"]*"' | head -1)
        echo "   Winner: $winner"
        echo "   Result: $result"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Response missing expected fields"
        echo "   Response: $match_response"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL${NC} (Could not connect to endpoint)"
    ((FAILED++))
fi
echo ""

# Test 6: Container Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: CONTAINER HEALTH STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

containers=(
    "tateti-arbitrator-smoke"
    "tateti-random-bot-1"
    "tateti-random-bot-2"
)

for container in "${containers[@]}"; do
    echo -n "Testing $container... "
    
    status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
    
    if [ "$status" == "healthy" ]; then
        echo -e "${GREEN}✅ PASS${NC} (healthy)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (status: $status)"
        ((FAILED++))
    fi
done
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ ALL TESTS PASSED - SMOKE LAYER READY${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🚀 Ready to proceed to next layer: 4-PLAYER TOURNAMENT"
    echo "   Run: npm run deploy:4player"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please fix the failing tests before proceeding."
    exit 1
fi
