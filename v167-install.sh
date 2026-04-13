#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 V167 AUTO INSTALLER"
echo "======================"

FILE="v167-arch-map.sh"

echo "📦 Creating $FILE ..."

cat > $FILE << 'SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 V167 ARCH MAP ENGINE STARTING"
echo "=================================="

BASE_DIR="$HOME/ai-galaxy-core"
cd "$BASE_DIR" || exit

echo "📍 DIR: $(pwd)"

echo "🔒 SINGLE INSTANCE CHECK"

LOCK_FILE=".core.lock"

if [ -f "$LOCK_FILE" ]; then
  OLD_PID=$(cat $LOCK_FILE)
  if ps -p $OLD_PID > /dev/null 2>&1; then
    echo "⚠ CORE RUNNING PID $OLD_PID → KILLING"
    kill -9 $OLD_PID 2>/dev/null
    sleep 1
  fi
fi

echo $$ > $LOCK_FILE
echo "✔ LOCK SET $$"

echo "🧹 CLEAN NODE"
pkill -f node 2>/dev/null
sleep 1

echo "🔌 FREE PORTS"
for port in 3000 3001 3003 3100 3101 3102 4000; do
  pid=$(lsof -ti :$port 2>/dev/null)
  if [ ! -z "$pid" ]; then
    kill -9 $pid 2>/dev/null
    echo "✔ $port freed"
  else
    echo "• $port free"
  fi
done

echo "🧠 ARCH MAP ANALYSIS"

CORE_COUNT=$(ls core-*.js 2>/dev/null | wc -l)
MODULE_COUNT=$(ls -d */ 2>/dev/null | wc -l)

echo "cores=$CORE_COUNT modules=$MODULE_COUNT"

if [ $CORE_COUNT -gt 10 ]; then
  NEXT="STABILIZE_CORE"
elif [ $MODULE_COUNT -lt 6 ]; then
  NEXT="BUILD_MODULES"
else
  NEXT="RUN"
fi

echo "👉 NEXT: $NEXT"

echo "🚀 EXEC"

node core-v145.js
SCRIPT

chmod +x $FILE

echo "✔ CREATED: $FILE"
echo "🚀 RUNNING..."

./$FILE
