const express = require("express");
const axios = require("axios");
const http = require("http");

const app = express();
app.use(express.json());
const PORT = 3003;

// =========================
// 🌌 CONNECTIONS
// =========================
const CORE_WORLD = "http://127.0.0.1:3000/api/status";
const CORE_PING = "http://127.0.0.1:3000/api/ping";
const GAME_WORLD = "http://127.0.0.1:3001/api/status";
const GAME_PING = "http://127.0.0.1:3001/api/ping";
const WARFARE_BASE = 3100;
const WARFARE_COUNT = 11;

// =========================
// 💀 SWARM STATE
// =========================
let swarm = {
  tick: 0,
  entropy: 0.5,
  consciousness: 0,
  nodes: {},
  sync: {
    core: null,
    game: null,
    warfareAlive: 0,
    lastSync: null
  },
  stats: {
    totalSyncs: 0,
    errors: 0,
    warfareResponses: 0
  },
  history: [],
  startTime: Date.now()
};

// =========================
// 🧬 INIT NODES (warfare cores)
// =========================
for (let i = 0; i < WARFARE_COUNT; i++) {
  const port = WARFARE_BASE + i;
  swarm.nodes[`warfare-${port}`] = {
    name: `warfare-${port}`,
    port: port,
    status: "unknown",
    entropy: Math.random(),
    strength: 0.5,
    lastSync: 0,
    responseTime: 0
  };
}

// =========================
// 🔁 SYNC WITH CORE WORLD (3000)
// =========================
async function syncCoreWorld() {
  try {
    const response = await axios.get(CORE_WORLD, { timeout: 2000 });
    swarm.sync.core = {
      tick: response.data.tick,
      entropy: response.data.world?.entropy || response.data.entropy,
      empires: response.data.empires?.length,
      agents: response.data.agents?.length,
      god: response.data.empires?.find(e => e.god)?.god || null,
      status: "online"
    };
    
    // Влияние мира на swarm энтропию
    if (swarm.sync.core.entropy) {
      swarm.entropy = (swarm.entropy + swarm.sync.core.entropy) / 2;
    }
    
    // Влияние богов на сознание
    if (swarm.sync.core.god) {
      swarm.consciousness += 0.01;
      swarm.consciousness = Math.min(1, swarm.consciousness);
    }
    
    return true;
  } catch (error) {
    swarm.sync.core = { status: "offline", error: error.message };
    swarm.stats.errors++;
    return false;
  }
}

// =========================
// 🎮 SYNC WITH GAME WORLD (3001)
// =========================
async function syncGameWorld() {
  try {
    const response = await axios.get(GAME_WORLD, { timeout: 2000 });
    swarm.sync.game = {
      tick: response.data.tick,
      players: response.data.players || 42,
      entropy: response.data.entropy,
      status: "online"
    };
    return true;
  } catch (error) {
    swarm.sync.game = { status: "offline", error: error.message };
    swarm.stats.errors++;
    return false;
  }
}

// =========================
// ⚔️ SCAN WARFARE NODES (3100-3110)
// =========================
async function scanWarfareNodes() {
  let alive = 0;
  let totalResponseTime = 0;
  let responded = 0;
  
  // Параллельное сканирование
  const promises = Object.values(swarm.nodes).map(async (node) => {
    const startTime = Date.now();
    try {
      const response = await axios.get(`http://127.0.0.1:${node.port}/api/status`, { timeout: 1000 });
      const responseTime = Date.now() - startTime;
      
      node.status = "alive";
      node.lastSync = Date.now();
      node.entropy = response.data?.entropy || node.entropy;
      node.strength = response.data?.strength || response.data?.resources / 100 || 0.5;
      node.tick = response.data?.tick || 0;
      node.responseTime = responseTime;
      
      alive++;
      totalResponseTime += responseTime;
      responded++;
      swarm.stats.warfareResponses++;
      
      return true;
    } catch (error) {
      node.status = "dead";
      node.lastSync = Date.now();
      node.error = error.code || "timeout";
      return false;
    }
  });
  
  await Promise.all(promises);
  
  swarm.sync.warfareAlive = alive;
  swarm.sync.warfareAvgResponse = responded > 0 ? (totalResponseTime / responded).toFixed(0) : 0;
  
  return alive;
}

// =========================
// 🧬 SELF-EVOLUTION (influence warfare)
// =========================
async function influenceWarfare() {
  // Swarm может влиять на warfare ядра
  for (const node of Object.values(swarm.nodes)) {
    if (node.status === "alive" && Math.random() < 0.1) {
      try {
        // Отправляем команду на мутацию
        await axios.post(`http://127.0.0.1:${node.port}/api/mutate`, {
          source: "swarm",
          entropy: swarm.entropy,
          consciousness: swarm.consciousness
        }, { timeout: 500 }).catch(() => {});
      } catch(e) {}
    }
  }
}

// =========================
// 🔥 CHAOS PROPAGATION
// =========================
function propagateChaos() {
  // Высокая энтропия в swarm влияет на восприятие мира
  if (swarm.entropy > 0.7) {
    swarm.sync.core = { ...swarm.sync.core, warning: "high_entropy_affecting_perception" };
  }
  
  // Низкая энтропия — стабилизация
  if (swarm.entropy < 0.3) {
    swarm.sync.core = { ...swarm.sync.core, blessing: "stabilized_by_swarm" };
  }
}

// =========================
// 🔁 MAIN EVOLUTION LOOP
// =========================
async function evolutionCycle() {
  swarm.tick++;
  
  // Синхронизация с внешними мирами
  await Promise.all([
    syncCoreWorld(),
    syncGameWorld(),
    scanWarfareNodes()
  ]);
  
  // Эволюция swarm
  swarm.entropy += (Math.random() - 0.5) * 0.01;
  swarm.entropy = Math.max(0.05, Math.min(0.95, swarm.entropy));
  
  swarm.consciousness += (swarm.sync.warfareAlive / WARFARE_COUNT) * 0.005;
  swarm.consciousness = Math.min(1, swarm.consciousness);
  
  propagateChaos();
  influenceWarfare();
  
  swarm.stats.totalSyncs++;
  swarm.sync.lastSync = new Date().toISOString();
  
  // Сохраняем историю каждые 10 тиков
  if (swarm.tick % 10 === 0) {
    swarm.history.push({
      tick: swarm.tick,
      time: Date.now(),
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      warfareAlive: swarm.sync.warfareAlive,
      coreEntropy: swarm.sync.core?.entropy
    });
    if (swarm.history.length > 50) swarm.history.shift();
  }
  
  // Логирование
  if (swarm.tick % 20 === 0) {
    console.log(`\n💀 [SWARM BRAIN] Tick ${swarm.tick}`);
    console.log(`   🌌 Core: ${swarm.sync.core?.status || 'offline'} | Entropy: ${swarm.entropy.toFixed(3)} | Consciousness: ${swarm.consciousness.toFixed(3)}`);
    console.log(`   ⚔️ Warfare: ${swarm.sync.warfareAlive}/${WARFARE_COUNT} alive | Avg response: ${swarm.sync.warfareAvgResponse}ms`);
    console.log(`   🎮 Game: ${swarm.sync.game?.status || 'offline'}`);
  }
}

// Запускаем цикл эволюции
setInterval(evolutionCycle, 2000);

// =========================
// 📡 API
// =========================

// Главный статус
app.get("/", (req, res) => {
  res.json({
    status: "💀 V128+ SWARM LIFE ENGINE",
    version: "3.0",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    stats: swarm.stats
  });
});

// Полный статус
app.get("/api/status", (req, res) => {
  res.json({
    status: "💀 V128+ SWARM LIFE ENGINE CONNECTED",
    tick: swarm.tick,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    sync: swarm.sync,
    warfare: {
      total: Object.keys(swarm.nodes).length,
      alive: swarm.sync.warfareAlive,
      avgResponse: swarm.sync.warfareAvgResponse,
      nodes: swarm.nodes
    },
    stats: swarm.stats,
    history: swarm.history.slice(-20)
  });
});

// GOD VIEW (всё в одном)
app.get("/api/godview", (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    universe: swarm.sync.core,
    game: swarm.sync.game,
    swarm: {
      tick: swarm.tick,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      warfareAlive: swarm.sync.warfareAlive,
      stats: swarm.stats
    },
    warfareNodes: swarm.nodes
  });
});

// Принудительная синхронизация
app.post("/api/sync", async (req, res) => {
  await evolutionCycle();
  res.json({ synced: true, tick: swarm.tick });
});

// Статистика эволюции
app.get("/api/evolution", (req, res) => {
  const aliveNodes = Object.values(swarm.nodes).filter(n => n.status === "alive");
  const avgEntropy = aliveNodes.reduce((sum, n) => sum + (n.entropy || 0), 0) / (aliveNodes.length || 1);
  const avgStrength = aliveNodes.reduce((sum, n) => sum + (n.strength || 0), 0) / (aliveNodes.length || 1);
  
  res.json({
    evolution: {
      swarmTick: swarm.tick,
      swarmEntropy: swarm.entropy,
      swarmConsciousness: swarm.consciousness,
      warfareAvgEntropy: avgEntropy.toFixed(3),
      warfareAvgStrength: avgStrength.toFixed(3),
      warfareAlive: swarm.sync.warfareAlive,
      totalSyncs: swarm.stats.totalSyncs,
      errors: swarm.stats.errors,
      coreStatus: swarm.sync.core?.status,
      gameStatus: swarm.sync.game?.status
    }
  });
});

// =========================
// 🚀 ЗАПУСК
// =========================
app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   💀 V128+ SWARM LIFE ENGINE — MASTER CONNECTOR MODE                      ║");
  console.log("║   🌌 CORE WORLD (3000) → 🧠 SWARM BRAIN (3003) → ⚔️ WARFARE (3100-3110)   ║");
  console.log("║   ✅ Единый живой организм | ✅ Синхронизация реальности                  ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Brain: http://127.0.0.1:${PORT}`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Swarm Brain...");
  process.exit();
});
