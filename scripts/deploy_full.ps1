$ErrorActionPreference = "Stop"

# Configuration
$KeyPath = "C:\Users\777\Documents\ssh-key-2026-01-26.key" # Updated path per user request
$ServerUser = "ubuntu"
$ServerIP = "144.22.254.132"
$RemoteHost = "$ServerUser@$ServerIP"

# 1. Verification
if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH Key not found at: $KeyPath. Please copy the key to the project root or update the script."
    exit 1
}

Write-Host "Starting Full Deployment Process..." -ForegroundColor Green

# 2. Build & Package
Write-Host "`n[0/3] Compiling Application (npm run build)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed! Fix errors before deploying."; exit 1 }

Write-Host "`n[1/3] Packaging Application..." -ForegroundColor Cyan
.\scripts\package_deploy.ps1
if ($LASTEXITCODE -ne 0) { Write-Error "Packaging failed!"; exit 1 }

# 3. Upload Credentials & Files
Write-Host "`n[2/3] Uploading to Server ($ServerIP)..." -ForegroundColor Cyan

# Upload Zip
Write-Host "   - Uploading deploy.zip (this may take a minute)..."
scp -i $KeyPath deploy.zip "$RemoteHost`:~/deploy.zip"
if ($LASTEXITCODE -ne 0) { Write-Error "Upload of deploy.zip failed!"; exit 1 }

# Upload Script
Write-Host "   - Uploading finalize_deploy.sh..."
scp -i $KeyPath scripts/finalize_deploy.sh "$RemoteHost`:~/finalize_deploy.sh"
if ($LASTEXITCODE -ne 0) { Write-Error "Upload of script failed!"; exit 1 }

# Fix Line Endings (CRLF -> LF) because we are uploading from Windows
Write-Host "   - Fixing line endings (dos2unix)..."
ssh -i $KeyPath $RemoteHost "sed -i 's/\r$//' finalize_deploy.sh"

# 4. Remote Execution
Write-Host "`n[3/3] Finalizing Remote Deployment..." -ForegroundColor Cyan
ssh -i $KeyPath $RemoteHost "bash finalize_deploy.sh"

Write-Host "`n[SUCCESS] Deployment Consummated! App should be live." -ForegroundColor Green
