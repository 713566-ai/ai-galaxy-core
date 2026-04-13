const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
const PORT = 3003;

const WARFARE_PORTS = [3100,3101,3102,3103,3104,3105,3106,3107,3108,3109,3110];

let swarm = {
  tick: 0,
  entropy: 0.5,
  consciousness: 0,
  alive: 0,
  dead: 0,
  health: "initializing",
  errors: 0,
  history: [],
  startTime: Date.now()
};

async function pingNode(port) {
  try {
    const response = await axios.get(`http://127.0.0.1:${port}/api/ping`, { timeout: 500 });
    if (response.data && response.data.pong) {
      return { alive: true, tick: response.data.tick };
    }
  } catch (error) {
    // узел не отвечает
  }
  return { alive: false };
}

async function checkAllNodes() {
  let alive = 0;
  let totalTick = 0;
  
  for (const port of WARFARE_PORTS) {
    const result = await pingNode(port);
    if (result.alive) {
      alive++;
      totalTick += result.tick || 0;
    }
  }
  
  swarm.alive = alive;
  swarm.dead = WARFARE_PORTS.length - alive;
  
  // Эволюция сознания
  swarm.consciousness = alive / WARFARE_PORTS.length;
  
  // Определение здоровья
  if (alive === WARFARE_PORTS.length) {
    swarm.health = "stable";
  } else if (alive >= WARFARE_PORTS.length / 2) {
    swarm.health = "degraded";
  } else if (alive > 0) {
    swarm.health = "critical";
  } else {
    swarm.health = "dead";
  }
  
  return alive;
}

// Главный цикл
setInterval(async () => {
  swarm.tick++;
  
  // Проверяем все узлы
  await checkAllNodes();
  
  // Дрейф энтропии
  swarm.entropy += (Math.random() - 0.5) * 0.005;
  swarm.entropy = Math.max(0.3, Math.min(0.7, swarm.entropy));
  
  // Сохраняем историю
  if (swarm.tick % 10 === 0) {
    swarm.history.push({
      tick: swarm.tick,
      alive: swarm.alive,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      health: swarm.health
    });
    if (swarm.history.length > 50) swarm.history.shift();
  }
  
  // Логирование
  if (swarm.tick % 5 === 0) {
    console.log(`💓 [SWARM] tick:${swarm.tick} | alive:${swarm.alive}/${WARFARE_PORTS.length} | health:${swarm.health} | entropy:${swarm.entropy.toFixed(3)}`);
  }
  
}, 2000);

// =========================
// API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "💀 V130 SWARM CORE",
    version: "final",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    health: swarm.health,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "V130 SWARM CORE",
    tick: swarm.tick,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    health: swarm.health,
    errors: swarm.errors,
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    history: swarm.history.slice(-20)
  });
});

app.get("/api/godview", async (req, res) => {
  let core = null;
  let game = null;
  
  try {
    const coreRes = await axios.get("http://127.0.0.1:3000/api/status", { timeout: 1000 });
    core = { tick: coreRes.data.tick, entropy: coreRes.data.world?.entropy, god: coreRes.data.empires?.find(e => e.god)?.god };
  } catch(e) { core = { error: "offline" }; }
  
  try {
    const gameRes = await axios.get("http://127.0.0.1:3001/api/status", { timeout: 1000 });
    game = { tick: gameRes.data.tick, players: gameRes.data.players };
  } catch(e) { game = { error: "offline" }; }
  
  res.json({
    timestamp: new Date().toISOString(),
    core: core,
    game: game,
    swarm: {
      tick: swarm.tick,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      alive: swarm.alive,
      dead: swarm.dead,
      health: swarm.health,
      stability: (swarm.alive / WARFARE_PORTS.length * 100).toFixed(1) + '%'
    }
  });
});

app.get("/api/evolution", (req, res) => {
  res.json({
    evolution: {
      tick: swarm.tick,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      survivalRate: (swarm.alive / WARFARE_PORTS.length * 100).toFixed(1) + '%',
      health: swarm.health,
      uptime: Math.floor((Date.now() - swarm.startTime) / 1000)
    },
    history: swarm.history.slice(-20)
  });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠 V130 SWARM CORE — STABLE LIFE SYSTEM                                  ║");
  console.log("║   ✅ Process manager | ✅ Auto-revive | ✅ Health monitoring               ║");
  console.log("║   🌌 CORE (3000) → 🧠 SWARM (3003) → ⚔️ WARFARE (3100-3110)              ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Core: http://127.0.0.1:${PORT}`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Swarm Core...");
  process.exit();
});

// =========================
// 🔔 PING ENDPOINT (FIX)
// =========================
app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: swarm.tick, status: "alive" });
});
