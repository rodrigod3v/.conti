#!/bin/bash
set -e

# 0. Install dependencies (only if needed)
# sudo apt-get update && sudo apt-get install -y p7zip-full

# 1. Stop App (Run as current user 'ubuntu', NOT sudo)
echo "Stopping app..."
pm2 stop next-app || true
pm2 delete next-app || true

# 2. Prepare Persistent DB Directory
echo "Configuring Database..."
mkdir -p ~/app_data
if [ -f ~/dev.db ]; then
    echo "Found new database file, deploying to ~/app_data/production.db..."
    sudo mv ~/dev.db ~/app_data/production.db
    sudo chown ubuntu:ubuntu ~/app_data/production.db
    sudo chmod 644 ~/app_data/production.db
else
    echo "No new database file found. Using existing if available."
fi
# Ensure dir permissions
sudo chown -R ubuntu:ubuntu ~/app_data
sudo chmod 755 ~/app_data

# 3. Clean & Unzip App
echo "Deploying App..."
sudo rm -rf ~/app/*
# Use unzip
unzip -o ~/deploy.zip -d /home/ubuntu/app > /dev/null

# 4. Create .env for Prisma
echo "Creating .env..."
echo 'DATABASE_URL="file:/home/ubuntu/app_data/production.db"' | sudo tee ~/app/.env > /dev/null
# Ensure ubuntu owns .env
sudo chown ubuntu:ubuntu ~/app/.env

# 5. Fix Permissions (Crucial)
echo "Fixing permissions..."
sudo chown -R ubuntu:ubuntu ~/app
sudo chmod -R 755 ~/app

# 6. Start
cd ~/app
# Reinstall node_modules if needed
npm install --omit=dev

echo "Generating Prisma Client..."
npx prisma generate

echo "Starting with PM2..."
pm2 start server.js --name "next-app"
pm2 save

echo "Deployment Successful!"
pm2 status
