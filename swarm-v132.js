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
  startTime: Date.now(),
  lastDecision: null,
  decisions: [],
  learning: {
    enabled: true,
    adaptationRate: 0.1
  }
};

async function pingNode(port) {
  try {
    const response = await axios.get(`http://127.0.0.1:${port}/api/ping`, { timeout: 500 });
    if (response.data && response.data.pong) {
      return { alive: true, tick: response.data.tick };
    }
  } catch (error) {}
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
  swarm.consciousness = alive / WARFARE_PORTS.length;
  
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

function applyDecision(decision) {
  if (!decision) return;
  
  swarm.lastDecision = decision;
  swarm.decisions.push({
    tick: swarm.tick,
    decision: decision,
    time: Date.now()
  });
  
  if (swarm.decisions.length > 30) swarm.decisions.shift();
  
  // Применяем решения с учётом обучения
  switch (decision.type) {
    case "boost_entropy":
      swarm.entropy = Math.min(0.7, swarm.entropy + 0.02 * swarm.learning.adaptationRate);
      console.log(`🧠 [AI] Boost entropy → ${swarm.entropy.toFixed(3)}`);
      break;
      
    case "stabilize":
      swarm.entropy = Math.max(0.3, swarm.entropy - 0.02 * swarm.learning.adaptationRate);
      console.log(`🧠 [AI] Stabilize → ${swarm.entropy.toFixed(3)}`);
      break;
      
    case "reduce_entropy":
      swarm.entropy = Math.max(0.3, swarm.entropy - 0.03 * swarm.learning.adaptationRate);
      console.log(`🧠 [AI] Reduce entropy → ${swarm.entropy.toFixed(3)}`);
      break;
      
    case "revive_all":
      console.log(`🧠 [AI] ⚠️ FORCE REVIVE TRIGGERED`);
      break;
      
    case "evolve":
      swarm.consciousness = Math.min(1, swarm.consciousness + 0.01);
      swarm.learning.adaptationRate = Math.min(0.5, swarm.learning.adaptationRate + 0.01);
      console.log(`🧠 [AI] Evolve → consciousness: ${swarm.consciousness.toFixed(3)}`);
      break;
      
    case "balance":
      // стабильность
      break;
  }
}

// Главный цикл
setInterval(async () => {
  swarm.tick++;
  
  await checkAllNodes();
  
  swarm.entropy += (Math.random() - 0.5) * 0.005;
  swarm.entropy = Math.max(0.3, Math.min(0.7, swarm.entropy));
  
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
  
  if (swarm.tick % 5 === 0) {
    console.log(`💓 [SWARM] tick:${swarm.tick} | alive:${swarm.alive}/${WARFARE_PORTS.length} | health:${swarm.health} | entropy:${swarm.entropy.toFixed(3)}`);
  }
  
}, 2000);

// =========================
// API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "🧠 V132 SWARM CORE + LEARNING",
    version: "7.0",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    health: swarm.health,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    learning: swarm.learning
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "V132 SWARM CORE",
    tick: swarm.tick,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    health: swarm.health,
    lastDecision: swarm.lastDecision,
    decisions: swarm.decisions,
    learning: swarm.learning,
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    history: swarm.history.slice(-20)
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: swarm.tick, status: "alive" });
});

app.post("/api/brain", (req, res) => {
  const decision = req.body;
  console.log(`🧠 [SWARM] Received decision: ${decision.type}`);
  applyDecision(decision);
  res.json({ ok: true, applied: true });
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
      learning: swarm.learning,
      lastDecision: swarm.lastDecision,
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
      learningRate: swarm.learning.adaptationRate,
      decisions: swarm.decisions.length,
      uptime: Math.floor((Date.now() - swarm.startTime) / 1000)
    },
    history: swarm.history.slice(-20)
  });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠 V132 SWARM CORE + LEARNING — ПАМЯТЬ И АДАПТАЦИЯ                      ║");
  console.log("║   ✅ Память | ✅ Обучение | ✅ Адаптация | ✅ Анализ решений               ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Core: http://127.0.0.1:${PORT}`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status`);
  console.log(`🧠 AI Decision: POST /api/brain\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Swarm Core...");
  process.exit();
});
