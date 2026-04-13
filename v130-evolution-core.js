/**
 * V130 EVOLUTION CORE
 * Stable Swarm God System (NO CHAOS LOOP)
 * 
 * ✅ Heartbeat only system
 * ✅ Стабильный registry
 * ✅ Нормальная эволюция сознания
 * ✅ Плавная энтропия
 * ✅ Health states: stable / unstable / critical
 */

const express = require("express");
const http = require("http");

const app = express();
app.use(express.json());
const PORT = 3003;

// =====================
// 🌌 GLOBAL STATE
// =====================
const state = {
  tick: 0,
  entropy: 0.5,
  consciousness: 0,
  startTime: Date.now(),
  warfare: {
    total: 11,
    alive: 0,
    nodes: {},
    lastSync: Date.now()
  },
  health: "initializing",
  errors: 0,
  history: []
};

// =====================
// ⚔️ NODE REGISTRY (NO AUTO KILL)
// =====================
function registerNodes() {
  for (let i = 0; i < 11; i++) {
    const port = 3100 + i;
    state.warfare.nodes[`node-${port}`] = {
      name: `node-${port}`,
      port: port,
      status: "unknown",
      lastHeartbeat: Date.now(),
      entropy: 0.4 + Math.random() * 0.3,
      heartbeats: 0,
      stability: 1.0
    };
  }
  console.log(`⚔️ Registered ${Object.keys(state.warfare.nodes).length} warfare nodes`);
}

// =====================
// ❤️ HEARTBEAT CHECK (SAFE MODE)
// =====================
async function checkNodes() {
  let alive = 0;
  let totalStability = 0;
  
  for (const [name, node] of Object.entries(state.warfare.nodes)) {
    try {
      const result = await new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${node.port}/api/ping`, (res) => {
          let data = "";
          res.on("data", c => data += c);
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch(e) {
              resolve(null);
            }
          });
        });
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(null);
        });
        req.on("error", () => resolve(null));
      });
      
      if (result && (result.online || result.pong)) {
        node.status = "alive";
        node.lastHeartbeat = Date.now();
        node.heartbeats++;
        node.stability = Math.min(1.0, node.stability + 0.02);
        alive++;
      } else {
        node.status = "dead";
        node.stability = Math.max(0, node.stability - 0.05);
      }
      totalStability += node.stability;
      
    } catch (e) {
      node.status = "dead";
      node.stability = Math.max(0, node.stability - 0.05);
      state.errors++;
    }
  }
  
  state.warfare.alive = alive;
  state.warfare.lastSync = Date.now();
  
  // Определение health состояния
  if (alive === 11) {
    state.health = "stable";
  } else if (alive >= 8) {
    state.health = "good";
  } else if (alive >= 5) {
    state.health = "unstable";
  } else if (alive >= 1) {
    state.health = "critical";
  } else {
    state.health = "dead";
  }
  
  return { alive, avgStability: totalStability / Object.keys(state.warfare.nodes).length };
}

// =====================
// 🌌 EVOLUTION ENGINE (ПЛАВНАЯ)
// =====================
function evolve() {
  state.tick++;
  
  // entropy stabilizer — плавный дрейф без скачков
  state.entropy += (Math.random() - 0.5) * 0.005;
  state.entropy = Math.max(0.3, Math.min(0.7, state.entropy));
  
  // consciousness grows only if stable
  if (state.warfare.alive > 8) {
    state.consciousness += 0.002;
  } else if (state.warfare.alive > 5) {
    state.consciousness += 0.0005;
  } else {
    state.consciousness *= 0.999;
  }
  
  state.consciousness = Math.min(1, Math.max(0, state.consciousness));
  
  // Сохраняем историю каждые 20 тиков
  if (state.tick % 20 === 0) {
    state.history.push({
      tick: state.tick,
      time: Date.now(),
      entropy: state.entropy,
      consciousness: state.consciousness,
      alive: state.warfare.alive,
      health: state.health
    });
    if (state.history.length > 50) state.history.shift();
  }
  
  // Логирование каждые 20 тиков
  if (state.tick % 20 === 0) {
    console.log(`\n🧬 [EVOLUTION] Tick ${state.tick}`);
    console.log(`   🌌 Entropy: ${state.entropy.toFixed(3)} | Consciousness: ${state.consciousness.toFixed(3)}`);
    console.log(`   ⚔️ Warfare: ${state.warfare.alive}/11 alive | Health: ${state.health}`);
    console.log(`   📊 Stability: ${(state.warfare.alive / 11 * 100).toFixed(0)}%`);
  }
}

// =====================
// 🔁 MAIN LOOP (SAFE 2s TICK)
// =====================
setInterval(async () => {
  evolve();
  await checkNodes();
}, 2000);

// =====================
// 📡 API
// =====================

// Главный статус
app.get("/", (req, res) => {
  res.json({
    status: "💀 V130 EVOLUTION CORE",
    version: "stable",
    uptime: Math.floor((Date.now() - state.startTime) / 1000),
    tick: state.tick,
    entropy: state.entropy.toFixed(4),
    consciousness: state.consciousness.toFixed(4),
    health: state.health
  });
});

// Полный статус
app.get("/api/status", (req, res) => {
  res.json({
    status: "V130 EVOLUTION CORE",
    tick: state.tick,
    entropy: state.entropy,
    consciousness: state.consciousness,
    health: state.health,
    errors: state.errors,
    warfare: {
      alive: state.warfare.alive,
      total: state.warfare.total,
      stability: (state.warfare.alive / state.warfare.total * 100).toFixed(1) + '%',
      lastSync: state.warfare.lastSync,
      nodes: state.warfare.nodes
    },
    uptime: Math.floor((Date.now() - state.startTime) / 1000)
  });
});

// God View (краткий обзор)
app.get("/api/godview", (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    universe: {
      tick: state.tick,
      entropy: state.entropy,
      consciousness: state.consciousness,
      health: state.health
    },
    swarm: {
      alive: state.warfare.alive,
      total: state.warfare.total,
      health: state.health,
      stability: (state.warfare.alive / state.warfare.total * 100).toFixed(1) + '%'
    },
    uptime: Math.floor((Date.now() - state.startTime) / 1000)
  });
});

// Эволюционная статистика
app.get("/api/evolution", (req, res) => {
  res.json({
    evolution: {
      tick: state.tick,
      entropy: state.entropy,
      consciousness: state.consciousness,
      stability: (state.warfare.alive / state.warfare.total * 100).toFixed(1) + '%',
      health: state.health,
      uptime: Math.floor((Date.now() - state.startTime) / 1000)
    },
    history: state.history.slice(-20)
  });
});

// Детальная информация о нодах
app.get("/api/nodes", (req, res) => {
  res.json(state.warfare.nodes);
});

// Информация о конкретной ноде
app.get("/api/node/:port", (req, res) => {
  const port = parseInt(req.params.port);
  const node = Object.values(state.warfare.nodes).find(n => n.port === port);
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: "Node not found" });
  }
});

// =====================
// 🚀 START
// =====================
registerNodes();

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧬 V130 EVOLUTION CORE — STABLE SWARM GOD SYSTEM                         ║");
  console.log("║   ✅ Heartbeat only | ✅ No auto-kill | ✅ Stable evolution                 ║");
  console.log("║   🌌 Entropy: 0.3-0.7 | 🧠 Consciousness grows | ⚔️ 11 warfare nodes      ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Evolution Core: http://127.0.0.1:${PORT}`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status`);
  console.log(`⚔️ Nodes: http://127.0.0.1:${PORT}/api/nodes\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Evolution Core...");
  process.exit();
});
