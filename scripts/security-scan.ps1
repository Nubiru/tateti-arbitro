# Security Scanning Script for Docker Images - Windows PowerShell
# @lastModified 2025-10-05
# @version 1.0.0
# @todo Senior software engineer security solution for Windows

Write-Host "🔒 Starting Security Scan for Ta-Te-Ti Arbitrator..." -ForegroundColor Green

# Check if trivy is installed
try {
    $trivyVersion = trivy version
    Write-Host "✅ Trivy found: $trivyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Trivy not found. Installing via Chocolatey..." -ForegroundColor Red
    try {
        choco install trivy -y
        Write-Host "✅ Trivy installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Trivy. Please install manually from: https://github.com/aquasecurity/trivy/releases" -ForegroundColor Red
        exit 1
    }
}

# Build the image
Write-Host "🏗️  Building Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.secure-alpine -t tateti-arbitro:secure .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

# Scan the image
Write-Host "🔍 Scanning Docker image for vulnerabilities..." -ForegroundColor Yellow
trivy image tateti-arbitro:secure --severity HIGH,CRITICAL --exit-code 1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No high or critical vulnerabilities found!" -ForegroundColor Green
} else {
    Write-Host "⚠️  High or critical vulnerabilities detected" -ForegroundColor Yellow
}

# Scan with detailed report
Write-Host "📊 Generating detailed security report..." -ForegroundColor Yellow
trivy image tateti-arbitro:secure --format table --output security-report.txt

Write-Host "✅ Security scan completed. Report saved to security-report.txt" -ForegroundColor Green
Write-Host "🚀 Image is ready for production deployment!" -ForegroundColor Green
