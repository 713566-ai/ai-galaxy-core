#!/data/data/com.termux/files/usr/bin/bash

cd ~/ai-galaxy-core || exit 1

echo "🧠 AI-GALAXY BOOTING..."

# kill old
pkill -f core-v145.js 2>/dev/null

# unlock
rm -f core.lock

# start
node core-v145.js
