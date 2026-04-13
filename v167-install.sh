#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 V167 AUTO BUILDER"
echo "===================="

BASE="$HOME/ai-galaxy-core"
cd "$BASE" || exit

FILE="v167-arch-map.sh"

echo "📦 Creating engine file: $FILE"

cat > $FILE << 'SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 V167 ARCH MAP ENGINE"
echo "======================="

cd "$HOME/ai-galaxy-core" || exit

echo "📍 DIR: $(pwd)"

# 🔒 LOCK FIX
LOCK=".core.lock"

if [ -f "$LOCK" ]; then
  PID=$(cat $LOCK)
  if ps -p $PID > /dev/null 2>&1; then
    echo "⚠ KILL OLD CORE PID $PID"
    kill -9 $PID 2>/dev/null
    sleep 1
  fi
fi

echo $$ > $LOCK
echo "✔ LOCK SET"

# 🧹 CLEAN
echo "🧹 CLEAN NODE"
pkill -f node 2>/dev/null
sleep 1

# 🔌 PORT FIX (ВАЖНО: без lsof crash)
echo "🔌 FREE PORTS"
for port in 3000 3001 3003 3100 4000; do
  fuser -k $port/tcp 2>/dev/null
  echo "✔ port $port checked"
done

# 🧠 ARCH MAP
echo "🧠 ARCH MAP ANALYSIS"

CORE_COUNT=$(ls core-*.js 2>/dev/null | wc -l)
MODULE_COUNT=$(ls -d */ 2>/dev/null | wc -l)

echo "cores=$CORE_COUNT modules=$MODULE_COUNT"

if [ "$CORE_COUNT" -gt 10 ]; then
  NEXT="STABILIZE"
elif [ "$MODULE_COUNT" -lt 6 ]; then
  NEXT="BUILD"
else
  NEXT="RUN"
fi

echo "👉 NEXT: $NEXT"

echo "🚀 START CORE"
node core-v145.js
SCRIPT

chmod +x $FILE

echo "✔ CREATED: $FILE"
echo "🚀 RUNNING V167..."

./$FILE
