#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 AI-GALAXY SAFE START (V161 CORE LAUNCHER)"

cd "$(dirname "$0")"

echo "🛑 STOPPING OLD NODE PROCESSES..."
pkill -f node 2>/dev/null

sleep 2

echo "🧹 CLEANING PORTS..."
for port in 3000 3001 3003 3100 3101 3102 3103 3104 3105 3106 3107 3108 3109 3110 4000
do
  lsof -ti :$port | xargs kill -9 2>/dev/null
done

sleep 1

echo "🔒 SINGLE INSTANCE LOCK ACTIVE (V160)"

LOCK_FILE=".core.lock"

if [ -f "$LOCK_FILE" ]; then
  echo "⚠ CORE ALREADY RUNNING - EXIT"
  exit 1
fi

echo $$ > $LOCK_FILE

cleanup() {
  echo "🧹 REMOVING LOCK..."
  rm -f $LOCK_FILE
  exit
}

trap cleanup EXIT

echo "🚀 STARTING CORE SYSTEM..."

node core-v145.js
