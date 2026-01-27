# Deploy Guide: Accounting Control System
This document outlines the complete process to deploy the application to the Production VM.

## 1. Environment Overview
- **Target VM**: 1 OCPU, 1GB RAM (Oracle Cloud)
- **OS**: Ubuntu 24.04
- **Runtime**: Node.js 20 (PM2)
- **Database**: SQLite (Persistent at `~/app_data/production.db`)
- **Key File**: `ssh-key-2026-01-26.key` (Keep this safe!)

## 2. Prerequisites (Local Machine)
Ensure you have the following tools installed:
- Node.js & npm
- PowerShell (Windows)
- OpenSSH Client

## 3. Configuration Files
### `next.config.ts`
Must have `output: "standalone"` enabled for low-memory environments.

### `prisma/schema.prisma`
Datasource must use environment variable:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## 4. Deployment Process (Step-by-Step)

### Step 1: Build Locally
Run the build command in your project root to generate optimized artifacts.
```powershell
npm run build
```

### Step 2: Package Application
Run the included PowerShell script to create `deploy.zip`.
```powershell
.\scripts\package_deploy.ps1
```
*Creates `deploy.zip` in the project root.*

### Step 3: Upload to Server
Use SCP to transfer the package and the deployment script.
Replace `your-key.pem` with the actual path to your SSH key.
```powershell
# Upload Package
scp -i "path/to/ssh-key-2026-01-26.key" deploy.zip ubuntu@144.22.254.132:~/deploy.zip

# Upload Deployment Script (if changed)
scp -i "path/to/ssh-key-2026-01-26.key" scripts/finalize_deploy.sh ubuntu@144.22.254.132:~/finalize_deploy.sh
```

### Step 4: Execute Deployment
Connect to the VM and run the deployment script.
```powershell
ssh -i "path/to/ssh-key-2026-01-26.key" ubuntu@144.22.254.132 "bash finalize_deploy.sh"
```
*This script automatically updates the app, keeps the database safe, and restarts PM2.*

## 5. Database Management
The database is stored outside the application folder to prevent data loss during updates.
- **Location**: `/home/ubuntu/app_data/production.db`

### Backup Database
To download the production database to your local machine:
```powershell
scp -i "path/to/ssh-key-2026-01-26.key" ubuntu@144.22.254.132:~/app_data/production.db ./backup_production.db
```

### Restore / Overwrite Database
To upload a local database (e.g., `dev.db`) to production:
1. Rename your local file to `dev.db`.
2. Upload it to the user's home directory:
   ```powershell
   scp -i "path/to/ssh-key-2026-01-26.key" dev.db ubuntu@144.22.254.132:~/dev.db
   ```
3. Run the deployment script (it detects `~/dev.db` and moves it to production specific location).

## 6. Troubleshooting
- **Logs**: `ssh ... "pm2 logs next-app"`
- **Status**: `ssh ... "pm2 status"`
- **Restart**: `ssh ... "pm2 restart next-app"`
