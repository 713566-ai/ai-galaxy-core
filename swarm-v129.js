const express = require("express");
const axios = require("axios");
const http = require("http");

const app = express();
app.use(express.json());
const PORT = 3003;

// =========================
// 🧬 SWARM STATE (STABLE)
// =========================
let swarm = {
  tick: 0,
  entropy: 0.5,
  consciousness: 0,
  alive: true,
  nodes: {},
  lastCoreSync: 0,
  lastGameSync: 0,
  startTime: Date.now(),
  health: {
    status: "stable",
    uptime: 0,
    errors: 0
  }
};

// =========================
// 🧬 INIT WARFARE NODES (11 ядер)
// =========================
for (let i = 0; i < 11; i++) {
  const port = 3100 + i;
  swarm.nodes[`warfare-${port}`] = {
    name: `warfare-${port}`,
    port: port,
    status: "unknown",
    entropy: 0.4 + Math.random() * 0.3,
    stability: 1.0,
    lastSeen: Date.now(),
    heartbeats: 0,
    errors: 0
  };
}

// =========================
// 🔁 HEALTH CHECK & STABILIZATION
// =========================
async function syncWithCore() {
  try {
    const response = await axios.get("http://127.0.0.1:3000/api/status", { timeout: 2000 });
    if (response.data) {
      const coreEntropy = response.data.world?.entropy || response.data.entropy || 0.5;
      swarm.entropy = (swarm.entropy + coreEntropy) / 2;
      swarm.entropy = Math.max(0.1, Math.min(0.9, swarm.entropy));
      swarm.lastCoreSync = Date.now();
      
      // Влияние богов на сознание swarm
      const hasGod = response.data.empires?.some(e => e.god) || false;
      if (hasGod) {
        swarm.consciousness += 0.005;
        swarm.consciousness = Math.min(1, swarm.consciousness);
      }
      
      return true;
    }
  } catch (error) {
    swarm.health.errors++;
  }
  return false;
}

async function syncWithGame() {
  try {
    const response = await axios.get("http://127.0.0.1:3001/api/status", { timeout: 2000 });
    if (response.data) {
      swarm.lastGameSync = Date.now();
      return true;
    }
  } catch (error) {
    swarm.health.errors++;
  }
  return false;
}

async function scanWarfareNodes() {
  let aliveCount = 0;
  let totalStability = 0;
  
  // Параллельное сканирование всех узлов
  const promises = Object.values(swarm.nodes).map(async (node) => {
    try {
      const response = await axios.get(`http://127.0.0.1:${node.port}/api/status`, { timeout: 1000 });
      
      node.status = "alive";
      node.lastSeen = Date.now();
      node.heartbeats++;
      node.entropy = response.data?.entropy || node.entropy;
      
      // Стабилизация — увеличиваем стабильность при успешном ответе
      node.stability = Math.min(1.0, node.stability + 0.02);
      
      aliveCount++;
      totalStability += node.stability;
      
      return true;
    } catch (error) {
      // Узел не ответил — уменьшаем стабильность, но НЕ убиваем сразу
      node.status = "dead";
      node.stability = Math.max(0, node.stability - 0.1);
      node.errors++;
      
      return false;
    }
  });
  
  await Promise.all(promises);
  
  const avgStability = totalStability / Object.keys(swarm.nodes).length;
  return { aliveCount, avgStability };
}

// =========================
// 🔁 MAIN HEARTBEAT LOOP (СТАБИЛЬНЫЙ)
// =========================
async function heartbeat() {
  try {
    // Синхронизация с внешними мирами
    await Promise.all([syncWithCore(), syncWithGame()]);
    
    // Сканирование warfare узлов
    const { aliveCount, avgStability } = await scanWarfareNodes();
    
    // Обновление состояния swarm
    swarm.tick++;
    swarm.health.uptime = Math.floor((Date.now() - swarm.startTime) / 1000);
    
    // Дрейф энтропии (медленный, стабильный)
    swarm.entropy += (Math.random() - 0.5) * 0.005;
    swarm.entropy = Math.max(0.1, Math.min(0.9, swarm.entropy));
    
    // Сознание растёт с количеством живых узлов
    swarm.consciousness += (aliveCount / 11) * 0.002;
    swarm.consciousness = Math.min(1, swarm.consciousness);
    
    // Определение здоровья swarm
    if (aliveCount >= 9 && avgStability > 0.6) {
      swarm.health.status = "stable";
    } else if (aliveCount >= 5) {
      swarm.health.status = "degraded";
    } else {
      swarm.health.status = "critical";
    }
    
    // Логирование каждые 10 тиков
    if (swarm.tick % 10 === 0) {
      console.log(`\n💀 [SWARM GOD] Tick ${swarm.tick}`);
      console.log(`   🌌 Entropy: ${swarm.entropy.toFixed(3)} | Consciousness: ${swarm.consciousness.toFixed(3)}`);
      console.log(`   ⚔️ Warfare: ${aliveCount}/11 alive | Stability: ${avgStability.toFixed(2)}`);
      console.log(`   ❤️ Health: ${swarm.health.status} | Uptime: ${swarm.health.uptime}s`);
    }
    
    swarm.alive = true;
    
  } catch (error) {
    console.log(`⚠️ Swarm heartbeat error: ${error.message}`);
    swarm.health.errors++;
    swarm.alive = false;
  }
}

// Запускаем стабильный цикл (не перегружаем систему)
setInterval(heartbeat, 1500);

// =========================
// 📡 API
// =========================

// Главный статус
app.get("/", (req, res) => {
  res.json({
    status: "💀 V129 SWARM GOD ENGINE",
    version: "4.0",
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    health: swarm.health
  });
});

// Полный статус
app.get("/api/status", (req, res) => {
  const alive = Object.values(swarm.nodes).filter(n => n.status === "alive").length;
  const avgStability = Object.values(swarm.nodes).reduce((sum, n) => sum + n.stability, 0) / 11;
  const totalHeartbeats = Object.values(swarm.nodes).reduce((sum, n) => sum + n.heartbeats, 0);
  
  res.json({
    status: "💀 V129 SWARM GOD ENGINE (STABLE LIFE)",
    tick: swarm.tick,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    health: swarm.health,
    aliveNodes: alive,
    totalNodes: Object.keys(swarm.nodes).length,
    avgStability: avgStability.toFixed(3),
    totalHeartbeats: totalHeartbeats,
    lastCoreSync: swarm.lastCoreSync,
    lastGameSync: swarm.lastGameSync,
    nodes: swarm.nodes
  });
});

// God View (всё в одном)
app.get("/api/godview", async (req, res) => {
  let coreStatus = null;
  let gameStatus = null;
  
  try {
    const core = await axios.get("http://127.0.0.1:3000/api/status", { timeout: 1000 });
    coreStatus = { tick: core.data.tick, entropy: core.data.world?.entropy, god: core.data.empires?.find(e => e.god)?.god };
  } catch(e) { coreStatus = { error: "offline" }; }
  
  try {
    const game = await axios.get("http://127.0.0.1:3001/api/status", { timeout: 1000 });
    gameStatus = { tick: game.data.tick, players: game.data.players };
  } catch(e) { gameStatus = { error: "offline" }; }
  
  const alive = Object.values(swarm.nodes).filter(n => n.status === "alive").length;
  
  res.json({
    timestamp: new Date().toISOString(),
    core: coreStatus,
    game: gameStatus,
    swarm: {
      tick: swarm.tick,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      health: swarm.health.status,
      warfareAlive: alive,
      warfareTotal: 11
    },
    warfareNodes: swarm.nodes
  });
});

// Эволюционная статистика
app.get("/api/evolution", (req, res) => {
  const alive = Object.values(swarm.nodes).filter(n => n.status === "alive");
  const avgEntropy = alive.reduce((sum, n) => sum + n.entropy, 0) / (alive.length || 1);
  const avgStability = alive.reduce((sum, n) => sum + n.stability, 0) / (alive.length || 1);
  const totalHeartbeats = Object.values(swarm.nodes).reduce((sum, n) => sum + n.heartbeats, 0);
  
  res.json({
    evolution: {
      swarmTick: swarm.tick,
      swarmEntropy: swarm.entropy,
      swarmConsciousness: swarm.consciousness,
      swarmHealth: swarm.health.status,
      warfareAlive: alive.length,
      warfareAvgEntropy: avgEntropy.toFixed(3),
      warfareAvgStability: avgStability.toFixed(3),
      warfareTotalHeartbeats: totalHeartbeats,
      uptime: swarm.health.uptime,
      errors: swarm.health.errors
    }
  });
});

// Принудительная стабилизация узла
app.post("/api/stabilize/:port", async (req, res) => {
  const port = parseInt(req.params.port);
  const node = Object.values(swarm.nodes).find(n => n.port === port);
  
  if (node) {
    node.stability = Math.min(1.0, node.stability + 0.3);
    node.status = "alive";
    res.json({ stabilized: true, port, newStability: node.stability });
  } else {
    res.status(404).json({ error: "Node not found" });
  }
});

// =========================
// 🚀 ЗАПУСК
// =========================
app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   💀 V129 SWARM GOD ENGINE — STABLE LIFE SYSTEM                           ║");
  console.log("║   ✅ Неубиваемый swarm | ✅ Стабилизация узлов | ✅ Self-healing           ║");
  console.log("║   🌌 CORE (3000) → 🧠 SWARM (3003) → ⚔️ WARFARE (3100-3110)              ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm God: http://127.0.0.1:${PORT}`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status\n`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Swarm God...");
  process.exit();
});
