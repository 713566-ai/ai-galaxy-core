#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 AI-GALAXY SAFE START"

cd ~/ai-galaxy-core || exit

echo "🛑 STOP OLD NODE PROCESSES..."
pkill -f node 2>/dev/null

sleep 2

echo "🧹 FREE PORTS..."
for port in 3000 3001 3003 3100 4000; do
  lsof -ti :$port | xargs kill -9 2>/dev/null
  echo "✔ port $port cleared"
done

sleep 1

echo "🚀 START CORE..."

node core-v145.js
