#!/data/data/com.termux/files/usr/bin/bash

echo "🏗️ AUTO ARCH BUILDER V1"
echo "========================"

PROJECT=~/ai-galaxy-core

mkdir -p $PROJECT

cd $PROJECT || exit

echo "📁 Creating architecture..."

# CORE SIM
mkdir -p 1-core-sim
mkdir -p 2-orchestrator
mkdir -p 3-game-factory
mkdir -p 4-mmo-server
mkdir -p 5-client
mkdir -p 6-runtime
mkdir -p 7-storage

# STORAGE FILES
echo '{}' > 7-storage/world-db.json
echo '{}' > 7-storage/games-db.json
echo '[]' > 7-storage/evolution-log.json

# BASIC START FILE (SAFE BOOT)
cat > start-core.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

echo "🧠 AI-GALAXY SAFE BOOT"

cd ~/ai-galaxy-core || exit

echo "🛑 stopping node..."
pkill -f node 2>/dev/null

sleep 2

echo "🧹 cleaning ports..."
for port in 3000 3001 3003 3100 4000; do
  lsof -ti :$port | xargs kill -9 2>/dev/null
done

echo "🚀 launching core..."

node core-v145.js
EOF

chmod +x start-core.sh

# ORCHESTRATOR PLACEHOLDER
cat > 2-orchestrator/god-orchestrator.js << 'EOF'
class GodOrchestrator {
  constructor(core) {
    this.core = core;
    this.tick = 0;
  }

  think() {
    this.tick++;

    if (!this.core.games) this.core.games = [];
    if (!this.core.worlds) this.core.worlds = [];

    if (this.core.games.length < 3) {
      this.core.games.push({ id: "auto-game-" + Date.now() });
    }

    console.log("🧠 ORCH TICK", this.tick, "games:", this.core.games.length);
  }
}

module.exports = { GodOrchestrator };
EOF

echo "📦 creating runtime bootstrap..."

cat > 6-runtime/start.js << 'EOF'
const { GodOrchestrator } = require("../2-orchestrator/god-orchestrator");

const core = {
  games: [],
  worlds: [{ entropy: 0.5 }]
};

const orch = new GodOrchestrator(core);

setInterval(() => {
  orch.think();
}, 2000);
EOF

echo ""
echo "✅ ARCH V2 BUILT SUCCESSFULLY"
echo "================================"
echo "📁 core structure created"
echo "🧠 orchestrator ready"
echo "🚀 use: ./start-core.sh or node 6-runtime/start.js"
echo "================================"
