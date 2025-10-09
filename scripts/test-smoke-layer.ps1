# Smoke Layer Verification Script (PowerShell)
# Tests all core functionality of the smoke deployment
# @lastModified 2025-10-08
# @version 1.0.0

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SMOKE LAYER VERIFICATION TESTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test counter
$script:Passed = 0
$script:Failed = 0

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus
    )
    
    Write-Host "Testing $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $($response.StatusCode))"
            $script:Passed++
            return $true
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $($response.StatusCode), expected $ExpectedStatus)"
            $script:Failed++
            return $false
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (Could not connect: $($_.Exception.Message))"
        $script:Failed++
        return $false
    }
}

# Test 1: Arbitrator Health
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST 1: ARBITRATOR HEALTH ENDPOINT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Test-Endpoint -Name "Arbitrator /api/health" -Url "http://localhost:4000/api/health" -ExpectedStatus 200
Write-Host ""

# Test 2: Bot Health Checks
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST 2: BOT HEALTH ENDPOINTS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Test-Endpoint -Name "RandomBot1 /health" -Url "http://localhost:3001/health" -ExpectedStatus 200
Test-Endpoint -Name "RandomBot2 /health" -Url "http://localhost:3002/health" -ExpectedStatus 200
Write-Host ""

# Test 3: Bot Discovery
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST 3: BOT DISCOVERY ENDPOINT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Testing /api/bots/available... " -NoNewline

try {
    $botsResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/bots/available" -Method Get -TimeoutSec 5
    
    $healthyCount = ($botsResponse.bots | Where-Object { $_.status -eq "healthy" }).Count
    $totalCount = ($botsResponse.bots | Where-Object { $_.name -like "RandomBot*" }).Count
    
    if ($healthyCount -ge 2 -and $totalCount -ge 2) {
        Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
        Write-Host " (Found $healthyCount healthy bots out of $totalCount)"
        $script:Passed++
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (Found $healthyCount healthy bots, expected 2)"
        $script:Failed++
    }
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
    Write-Host " (Could not connect to endpoint)"
    $script:Failed++
}
Write-Host ""

# Test 4: SSE Stream Endpoint (SKIP - SSE keeps connection open)
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST 4: SSE STREAM ENDPOINT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Testing SSE /api/stream... " -NoNewline
Write-Host "SKIPPED" -ForegroundColor Yellow -NoNewline
Write-Host " (SSE keeps connection open - tested in frontend)"
Write-Host ""

# Test 5: Match Execution
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST 5: MATCH EXECUTION" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Testing POST /api/match... " -NoNewline

$matchPayload = @{
    player1 = @{ name = "RandomBot1"; port = 3001 }
    player2 = @{ name = "RandomBot2"; port = 3002 }
    boardSize = "3x3"
} | ConvertTo-Json

try {
    $matchResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/match" `
        -Method Post `
        -ContentType "application/json" `
        -Body $matchPayload `
        -TimeoutSec 30
    
    if ($matchResponse.result -and $matchResponse.winner) {
        Write-Host "✅ PASS" -ForegroundColor Green
        Write-Host "   Match completed successfully"
        Write-Host "   Winner: $($matchResponse.winner.name)"
        Write-Host "   Result: $($matchResponse.result)"
        $script:Passed++
    } else {
        Write-Host "❌ FAIL" -ForegroundColor Red
        Write-Host "   Response missing expected fields"
        $script:Failed++
    }
} catch {
    Write-Host "❌ FAIL" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
    $script:Failed++
}
Write-Host ""

# Test 6: Container Status
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST 6: CONTAINER HEALTH STATUS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$containers = @(
    "tateti-arbitrator-smoke",
    "tateti-random-bot-1",
    "tateti-random-bot-2"
)

foreach ($container in $containers) {
    Write-Host "Testing $container... " -NoNewline
    
    try {
        $status = docker inspect --format='{{.State.Health.Status}}' $container 2>$null
        
        if ($status -eq "healthy") {
            Write-Host "✅ PASS" -ForegroundColor Green -NoNewline
            Write-Host " (healthy)"
            $script:Passed++
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (status: $status)"
            $script:Failed++
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red -NoNewline
        Write-Host " (Could not inspect container)"
        $script:Failed++
    }
}
Write-Host ""

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Total Tests: $($script:Passed + $script:Failed)"
Write-Host "Passed: $($script:Passed)" -ForegroundColor Green
Write-Host "Failed: $($script:Failed)" -ForegroundColor Red
Write-Host ""

if ($script:Failed -eq 0) {
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "ALL TESTS PASSED - SMOKE LAYER READY" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ready to proceed to next layer: 4-PLAYER TOURNAMENT" -ForegroundColor Yellow
    Write-Host "   Run: npm run deploy:4player" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the failing tests before proceeding." -ForegroundColor Yellow
    exit 1
}
