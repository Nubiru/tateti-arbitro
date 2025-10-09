# Debug Match Endpoint
# Tests match endpoint with verbose logging

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DEBUGGING MATCH ENDPOINT" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Simple match request
Write-Host "Test 1: POST /api/match with valid players" -ForegroundColor Yellow
Write-Host "Payload:" -ForegroundColor Gray

$payload = @{
    player1 = @{
        name = "RandomBot1"
        port = 3001
    }
    player2 = @{
        name = "RandomBot2"
        port = 3002
    }
    boardSize = "3x3"
} | ConvertTo-Json

Write-Host $payload -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/match" `
        -Method Post `
        -ContentType "application/json" `
        -Body $payload `
        -Verbose

    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response:" -ForegroundColor Red
    
    $errorDetails = $_.ErrorDetails.Message
    if ($errorDetails) {
        Write-Host $errorDetails -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
