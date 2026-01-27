$baseDir = "c:\Users\777\Desktop\.conti"
$deployDir = "$baseDir\deploy_package"
$deployZip = "$baseDir\deploy.zip"

# Clean up previous attempts
if (Test-Path $deployDir) { Remove-Item -Recurse -Force $deployDir }
if (Test-Path $deployZip) { Remove-Item -Force $deployZip }

# Create structure
New-Item -ItemType Directory -Force -Path $deployDir | Out-Null
New-Item -ItemType Directory -Force -Path "$deployDir\.next" | Out-Null

# 1. Copy Standalone (Base)
Write-Host "Copying Standalone..."
Copy-Item -Recurse "$baseDir\.next\standalone\*" -Destination $deployDir

# 2. Copy Static Assets (REQUIRED)
Write-Host "Copying Static Assets..."
New-Item -ItemType Directory -Force -Path "$deployDir\.next\static" | Out-Null
Copy-Item -Recurse "$baseDir\.next\static\*" -Destination "$deployDir\.next\static"

# 3. Copy Public Folder (REQUIRED)
Write-Host "Copying Public Folder..."
New-Item -ItemType Directory -Force -Path "$deployDir\public" | Out-Null
Copy-Item -Recurse "$baseDir\public\*" -Destination "$deployDir\public"

# 4. Copy Prisma Folder (For DB Schema)
Write-Host "Copying Prisma Folder..."
New-Item -ItemType Directory -Force -Path "$deployDir\prisma" | Out-Null
Copy-Item -Recurse "$baseDir\prisma\*" -Destination "$deployDir\prisma"

# 5. Zip it (Using tar for POSIX paths)
Write-Host "Compressing to deploy.zip..."
Set-Location $deployDir
tar -a -c -f $deployZip *
Set-Location $baseDir

Write-Host "Done! Package at: $deployZip"
