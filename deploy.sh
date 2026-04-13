#!/bin/bash
# Авто-деплой на VPS
SERVER="your-server.com"
USER="root"
PATH="/var/www/galaxy"

echo "🚀 Деплой на $SERVER..."
scp -r game-build/* $USER@$SERVER:$PATH/
ssh $USER@$SERVER "cd $PATH && npm install && pm2 restart galaxy-universe"
echo "✅ Деплой завершён!"
