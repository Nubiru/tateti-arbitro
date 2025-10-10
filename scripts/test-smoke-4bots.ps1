<#
.SYNOPSIS
    Smoke Test Suite for 4-Bot Environment
.DESCRIPTION
    Sophisticated verification script for smoke environment
    Tests: 4 bots (2 Random, 1 Smart, 1 Strategic) + Arbitrator
.PARAMETER ShowLogs
    Display Docker container logs for failed tests
.PARAMETER JsonOutput
    Output results in JSON format for CI/CD integration
.PARAMETER Verbose
    Built-in PowerShell parameter - shows detailed error messages
.NOTES
    Version: 2.1.1
    Author: UPC Programacion Full Stack
    Last Modified: 2025-10-10
.EXAMPLE
    .\scripts\test-smoke-4bots.ps1
    Basic smoke test execution
.EXAMPLE
    .\scripts\test-smoke-4bots.ps1 -ShowLogs
    Show Docker logs for failed tests
.EXAMPLE
    .\scripts\test-smoke-4bots.ps1 -Verbose
    Show detailed error information
.EXAMPLE
    .\scripts\test-smoke-4bots.ps1 -ShowLogs -Verbose
    Combine logs and verbose output
.EXAMPLE
    npm run verify:smoke:win
    Run via npm script
#>

[CmdletBinding()]
param(
    [switch]$ShowLogs,
    [switch]$JsonOutput
)

# ============================================
# CONFIGURATION
# ============================================

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Test configuration
$ARBITRATOR_URL = "http://localhost:4000"
$BOTS = @(
    @{ Name = "RandomBot1";     Port = 3001; Container = "tateti-random-bot-1" },
    @{ Name = "RandomBot2";     Port = 3002; Container = "tateti-random-bot-2" },
    @{ Name = "SmartBot1";      Port = 3003; Container = "tateti-smart-bot-1" },
    @{ Name = "StrategicBot1";  Port = 3004; Container = "tateti-strategic-bot-1" }
)

$CONTAINERS = @(
    @{ Name = "tateti-arbitrator-smoke"; Description = "Arbitrator" },
    @{ Name = "tateti-random-bot-1"; Description = "RandomBot #1" },
    @{ Name = "tateti-random-bot-2"; Description = "RandomBot #2" },
    @{ Name = "tateti-smart-bot-1"; Description = "SmartBot #1" },
    @{ Name = "tateti-strategic-bot-1"; Description = "StrategicBot #1" }
)

# Counters
$script:TotalTests = 0
$script:PassedTests = 0
$script:FailedTests = 0
$script:WarningTests = 0
$script:TestResults = @()

# ============================================
# HELPER FUNCTIONS
# ============================================

function Write-TestHeader {
    param([string]$Title)
    
    if (-not $JsonOutput) {
        Write-Host ""
        Write-Host "=" * 60 -ForegroundColor Cyan
        Write-Host "  $Title" -ForegroundColor Cyan
        Write-Host "=" * 60 -ForegroundColor Cyan
        Write-Host ""
    }
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = "",
        [string]$ErrorMessage = ""
    )
    
    $script:TotalTests++
    
    $result = @{
        Test = $TestName
        Status = $Status
        Details = $Details
        Error = $ErrorMessage
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    $script:TestResults += $result
    
    switch ($Status) {
        "PASS" { $script:PassedTests++; $color = "Green"; $symbol = "[OK]" }
        "FAIL" { $script:FailedTests++; $color = "Red"; $symbol = "[!!]" }
        "WARN" { $script:WarningTests++; $color = "Yellow"; $symbol = "[**]" }
        default { $color = "Gray"; $symbol = "[--]" }
    }
    
    if (-not $JsonOutput) {
        Write-Host "  $symbol " -ForegroundColor $color -NoNewline
        Write-Host "$TestName" -NoNewline
        
        if ($Details) {
            Write-Host " - $Details" -ForegroundColor Gray
        } else {
            Write-Host ""
        }
        
        if ($ErrorMessage -and $VerbosePreference -eq 'Continue') {
            Write-Host "      Error: $ErrorMessage" -ForegroundColor DarkGray
        }
    }
}

function Get-ContainerLogs {
    param([string]$ContainerName, [int]$Lines = 20)
    
    try {
        $logs = docker logs --tail $Lines $ContainerName 2>&1
        return $logs -join "`n"
    }
    catch {
        return "No se pudieron obtener logs: $_"
    }
}

function Test-HttpEndpoint {
    param(
        [string]$Url,
        [int]$ExpectedStatus = 200,
        [int]$TimeoutSec = 5
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec $TimeoutSec -ErrorAction Stop
        
        return @{
            Success = ($response.StatusCode -eq $ExpectedStatus)
            StatusCode = $response.StatusCode
            Content = $response.Content
            Error = $null
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = 0
            Content = $null
            Error = $_.Exception.Message
        }
    }
}

function Test-JsonResponse {
    param([string]$Content)
    
    try {
        $json = $Content | ConvertFrom-Json
        return @{ Valid = $true; Data = $json; Error = $null }
    }
    catch {
        return @{ Valid = $false; Data = $null; Error = $_.Exception.Message }
    }
}

# ============================================
# TEST SUITES
# ============================================

function Test-ArbitratorHealth {
    Write-TestHeader "TEST 1/5: Salud del Arbitrador"
    
    $result = Test-HttpEndpoint -Url "$ARBITRATOR_URL/api/health"
    
    if ($result.Success) {
        $json = Test-JsonResponse -Content $result.Content
        
        if ($json.Valid -and $json.Data.status) {
            Write-TestResult -TestName "Arbitrator health check" -Status "PASS" -Details "Status: $($json.Data.status)"
        }
        else {
            Write-TestResult -TestName "Arbitrator health check" -Status "WARN" -Details "Respuesta no valida" -ErrorMessage $json.Error
        }
    }
    else {
        Write-TestResult -TestName "Arbitrator health check" -Status "FAIL" -Details "HTTP $($result.StatusCode)" -ErrorMessage $result.Error
        
        if ($ShowLogs) {
            Write-Host "  --- Logs del Arbitrador (ultimas 20 lineas) ---" -ForegroundColor Yellow
            Get-ContainerLogs -ContainerName "tateti-arbitrator-smoke" | Write-Host -ForegroundColor DarkGray
        }
    }
}

function Test-BotsHealth {
    Write-TestHeader "TEST 2/5: Salud Individual de Bots"
    
    foreach ($bot in $BOTS) {
        $url = "http://localhost:$($bot.Port)/health"
        $result = Test-HttpEndpoint -Url $url
        
        if ($result.Success) {
            Write-TestResult -TestName "$($bot.Name) health" -Status "PASS" -Details "Puerto $($bot.Port)"
        }
        else {
            Write-TestResult -TestName "$($bot.Name) health" -Status "FAIL" -Details "HTTP $($result.StatusCode)" -ErrorMessage $result.Error
            
            if ($ShowLogs) {
                Write-Host "  --- Logs de $($bot.Name) (ultimas 10 lineas) ---" -ForegroundColor Yellow
                Get-ContainerLogs -ContainerName $bot.Container -Lines 10 | Write-Host -ForegroundColor DarkGray
            }
        }
    }
}

function Test-BotDiscovery {
    Write-TestHeader "TEST 3/5: Descubrimiento de Bots"
    
    $result = Test-HttpEndpoint -Url "$ARBITRATOR_URL/api/bots/available"
    
    if ($result.Success) {
        $json = Test-JsonResponse -Content $result.Content
        
        if ($json.Valid -and $json.Data) {
            $botCount = ($json.Data | Measure-Object).Count
            
            if ($botCount -ge 4) {
                Write-TestResult -TestName "Bot discovery" -Status "PASS" -Details "Descubiertos: $botCount bots"
            }
            elseif ($botCount -gt 0) {
                Write-TestResult -TestName "Bot discovery" -Status "WARN" -Details "Solo $botCount bots (esperados: 4)"
            }
            else {
                Write-TestResult -TestName "Bot discovery" -Status "FAIL" -Details "No se descubrieron bots"
            }
        }
        else {
            Write-TestResult -TestName "Bot discovery" -Status "FAIL" -Details "Respuesta invalida" -ErrorMessage $json.Error
        }
    }
    else {
        Write-TestResult -TestName "Bot discovery" -Status "FAIL" -Details "HTTP $($result.StatusCode)" -ErrorMessage $result.Error
    }
}

function Test-BotMoves {
    Write-TestHeader "TEST 4/5: Logica de Movimientos"
    
    $emptyBoard = "[0,0,0,0,0,0,0,0,0]"
    
    foreach ($bot in $BOTS) {
        $url = "http://localhost:$($bot.Port)/move?board=$emptyBoard"
        $result = Test-HttpEndpoint -Url $url
        
        if ($result.Success) {
            $json = Test-JsonResponse -Content $result.Content
            
            if ($json.Valid -and $null -ne $json.Data.move) {
                $move = $json.Data.move
                
                if ($move -ge 0 -and $move -le 8) {
                    $details = "Movimiento: $move"
                    
                    # Validar estrategia esperada
                    if ($bot.Name -like "Smart*" -or $bot.Name -like "Strategic*") {
                        if ($move -eq 4) {
                            $details += " (centro, correcto)"
                        }
                        else {
                            $details += " (no centro, inesperado)"
                        }
                    }
                    
                    Write-TestResult -TestName "$($bot.Name) move logic" -Status "PASS" -Details $details
                }
                else {
                    Write-TestResult -TestName "$($bot.Name) move logic" -Status "FAIL" -Details "Movimiento invalido: $move"
                }
            }
            else {
                Write-TestResult -TestName "$($bot.Name) move logic" -Status "FAIL" -Details "Respuesta invalida" -ErrorMessage $json.Error
            }
        }
        else {
            Write-TestResult -TestName "$($bot.Name) move logic" -Status "FAIL" -Details "HTTP $($result.StatusCode)" -ErrorMessage $result.Error
        }
    }
}

function Test-ContainerHealth {
    Write-TestHeader "TEST 5/5: Estado de Contenedores Docker"
    
    foreach ($container in $CONTAINERS) {
        try {
            $status = docker inspect --format='{{.State.Status}}' $container.Name 2>$null
            
            if ($LASTEXITCODE -ne 0) {
                Write-TestResult -TestName "$($container.Description) container" -Status "FAIL" -Details "Contenedor no encontrado"
                continue
            }
            
            $health = docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' $container.Name 2>$null
            
            if ($status -eq "running") {
                if ($health -eq "healthy" -or $health -eq "none") {
                    Write-TestResult -TestName "$($container.Description) container" -Status "PASS" -Details "Running, Health: $health"
                }
                else {
                    Write-TestResult -TestName "$($container.Description) container" -Status "WARN" -Details "Running, Health: $health"
                }
            }
            else {
                Write-TestResult -TestName "$($container.Description) container" -Status "FAIL" -Details "Status: $status"
            }
        }
        catch {
            Write-TestResult -TestName "$($container.Description) container" -Status "FAIL" -Details "Error inspeccionando" -ErrorMessage $_.Exception.Message
        }
    }
}

# ============================================
# MAIN EXECUTION
# ============================================

function Main {
    if (-not $JsonOutput) {
        Write-Host ""
        Write-Host "##############################################" -ForegroundColor Magenta
        Write-Host "#                                            #" -ForegroundColor Magenta
        Write-Host "#   SMOKE LAYER - SUITE DE PRUEBAS (4 Bots) #" -ForegroundColor Magenta
        Write-Host "#                                            #" -ForegroundColor Magenta
        Write-Host "##############################################" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "Ambiente: Smoke (4 Bots + Arbitrador)" -ForegroundColor Gray
        Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
        Write-Host ""
    }
    
    # Execute test suites
    Test-ArbitratorHealth
    Test-BotsHealth
    Test-BotDiscovery
    Test-BotMoves
    Test-ContainerHealth
    
    # Summary
    if ($JsonOutput) {
        $summary = @{
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Total = $script:TotalTests
            Passed = $script:PassedTests
            Failed = $script:FailedTests
            Warnings = $script:WarningTests
            Success = ($script:FailedTests -eq 0)
            Tests = $script:TestResults
        }
        
        $summary | ConvertTo-Json -Depth 10 | Write-Output
    }
    else {
        Write-Host ""
        Write-Host "=" * 60 -ForegroundColor Cyan
        Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
        Write-Host "=" * 60 -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  Total:        $script:TotalTests" -ForegroundColor White
        Write-Host "  Exitosas:     $script:PassedTests" -ForegroundColor Green
        Write-Host "  Fallidas:     $script:FailedTests" -ForegroundColor Red
        Write-Host "  Advertencias: $script:WarningTests" -ForegroundColor Yellow
        Write-Host ""
        
        if ($script:FailedTests -eq 0) {
            Write-Host "=" * 60 -ForegroundColor Green
            Write-Host "  [OK] SMOKE LAYER VERIFICATION: PASSED" -ForegroundColor Green
            Write-Host "=" * 60 -ForegroundColor Green
            Write-Host ""
            exit 0
        }
        else {
            Write-Host "=" * 60 -ForegroundColor Red
            Write-Host "  [!!] SMOKE LAYER VERIFICATION: FAILED" -ForegroundColor Red
            Write-Host "=" * 60 -ForegroundColor Red
            Write-Host ""
            
            if (-not $ShowLogs) {
                Write-Host "Sugerencia: Ejecute con -ShowLogs para ver logs de contenedores fallidos" -ForegroundColor Yellow
                Write-Host "Ejemplo: .\scripts\test-smoke-4bots.ps1 -ShowLogs" -ForegroundColor Yellow
            }
            
            Write-Host ""
            exit 1
        }
    }
}

# Execute
try {
    Main
}
catch {
    Write-Host ""
    Write-Host "ERROR CRITICO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack Trace: $($_.ScriptStackTrace)" -ForegroundColor DarkGray
    exit 1
}
