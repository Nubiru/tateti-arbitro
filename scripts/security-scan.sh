#!/bin/bash
# Security Scanning Script for Docker Images
# @lastModified 2025-10-05
# @version 1.0.0
# @todo Senior software engineer security solution

set -e

echo "🔒 Starting Security Scan for Ta-Te-Ti Arbitrator..."

# Check if trivy is installed
if ! command -v trivy &> /dev/null; then
    echo "❌ Trivy not found. Installing..."
    # Install trivy (adjust for your OS)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update
        sudo apt-get install wget apt-transport-https gnupg lsb-release
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update
        sudo apt-get install trivy
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install trivy
    else
        echo "❌ Unsupported OS. Please install trivy manually."
        exit 1
    fi
fi

# Build the image
echo "🏗️  Building Docker image..."
docker build -t tateti-arbitro:latest .

# Scan the image
echo "🔍 Scanning Docker image for vulnerabilities..."
trivy image tateti-arbitro:latest --severity HIGH,CRITICAL --exit-code 1

# Scan with detailed report
echo "📊 Generating detailed security report..."
trivy image tateti-arbitro:latest --format table --output security-report.txt

echo "✅ Security scan completed. Report saved to security-report.txt"
echo "🚀 Image is ready for production deployment!"
