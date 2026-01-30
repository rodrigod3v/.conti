$ErrorActionPreference = "Stop"
$keyPath = "C:\Users\777\Documents\ssh-key-2026-01-26.key"
$vmUser = "ubuntu"
$vmHost = "144.22.254.132"

Write-Host "Fetching PM2 Logs..."
ssh -i $keyPath "$($vmUser)@$($vmHost)" "pm2 logs next-app --lines 50 --nostream --err"

Write-Host "`nChecking DB File..."
ssh -i $keyPath "$($vmUser)@$($vmHost)" "ls -l ~/app_data/production.db"
