const express = require("express");
const axios = require("axios");
const { updateGoals, getActiveGoal, getAllGoals, getGoalStats, createGoal } = require("./goals-v133");
const { ensurePlan, executePlan, getActivePlan, getAllPlans, getPlanStats } = require("./planner-v134");
const { buildWorld, getWorldStats } = require("./world-builder-v136");

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
  currentGoal: null,
  currentGoalObj: null,
  currentPlan: null,
  world: null,
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
  
  for (const port of WARFARE_PORTS) {
    const result = await pingNode(port);
    if (result.alive) alive++;
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

async function syncWorldToGame(world) {
  if (!world) return;
  
  try {
    await axios.post("http://127.0.0.1:3001/api/world", {
      empires: world.empires,
      agents: world.agents,
      events: world.events.slice(-20)
    }, { timeout: 2000 });
    console.log(`🔗 [SYNC] World synced to game (${world.empires.length} empires, ${world.agents.length} agents)`);
  } catch (error) {
    console.log(`⚠️ [SYNC] Failed to sync world: ${error.message}`);
  }
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
  
  switch (decision.type) {
    case "boost_entropy":
      swarm.entropy = Math.min(0.7, swarm.entropy + 0.02 * swarm.learning.adaptationRate);
      break;
      
    case "stabilize":
      swarm.entropy = Math.max(0.3, swarm.entropy - 0.02 * swarm.learning.adaptationRate);
      break;
      
    case "reduce_entropy":
      swarm.entropy = Math.max(0.3, swarm.entropy - 0.03 * swarm.learning.adaptationRate);
      break;
      
    case "revive_all":
      console.log(`🧠 [AI] ⚠️ FORCE REVIVE TRIGGERED`);
      break;
      
    case "evolve":
      swarm.consciousness = Math.min(1, swarm.consciousness + 0.01);
      swarm.learning.adaptationRate = Math.min(0.5, swarm.learning.adaptationRate + 0.01);
      break;
      
    case "balance":
      break;
  }
}

// Главный цикл
setInterval(async () => {
  swarm.tick++;
  
  await checkAllNodes();
  
  swarm.entropy += (Math.random() - 0.5) * 0.005;
  swarm.entropy = Math.max(0.3, Math.min(0.7, swarm.entropy));
  
  // 🌍 ПОСТРОЕНИЕ МИРА
  buildWorld(swarm);
  
  // 🎯 ОБНОВЛЕНИЕ ЦЕЛЕЙ
  const swarmStateForGoals = {
    tick: swarm.tick,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    health: swarm.health
  };
  
  updateGoals(swarmStateForGoals);
  
  const activeGoal = getActiveGoal();
  if (activeGoal) {
    swarm.currentGoal = activeGoal.type;
    swarm.currentGoalObj = activeGoal;
    
    const plan = ensurePlan(activeGoal);
    swarm.currentPlan = plan;
    executePlan(plan, swarm);
  }
  
  // 🔗 СИНХРОНИЗАЦИЯ С ИГРОЙ (каждые 5 тиков)
  if (swarm.tick % 5 === 0) {
    syncWorldToGame(swarm.world);
  }
  
  if (swarm.tick % 10 === 0) {
    swarm.history.push({
      tick: swarm.tick,
      alive: swarm.alive,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      health: swarm.health,
      goal: swarm.currentGoal,
      worldStats: getWorldStats(swarm.world)
    });
    if (swarm.history.length > 50) swarm.history.shift();
  }
  
  if (swarm.tick % 5 === 0) {
    const worldStats = getWorldStats(swarm.world);
    console.log(`💓 [SWARM] tick:${swarm.tick} | alive:${swarm.alive}/${WARFARE_PORTS.length} | goal:${swarm.currentGoal || 'none'} | world:${worldStats?.empires || 0} empires, ${worldStats?.agents || 0} agents`);
  }
  
}, 2000);

// =========================
// API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "🌍 V136 SWARM CORE + WORLD BUILDER",
    version: "10.0",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    health: swarm.health,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    currentGoal: swarm.currentGoal,
    worldStats: getWorldStats(swarm.world),
    learning: swarm.learning
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "V136 SWARM CORE",
    tick: swarm.tick,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    health: swarm.health,
    currentGoal: swarm.currentGoal,
    currentPlan: swarm.currentPlan ? {
      goal: swarm.currentPlan.goal,
      currentStep: swarm.currentPlan.currentStep,
      totalSteps: swarm.currentPlan.steps.length
    } : null,
    worldStats: getWorldStats(swarm.world),
    world: swarm.world ? {
      empires: swarm.world.empires.length,
      agents: swarm.world.agents.length,
      events: swarm.world.events.slice(-5),
      generation: swarm.world.generation
    } : null,
    lastDecision: swarm.lastDecision,
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

app.get("/api/world", (req, res) => {
  res.json(swarm.world || { empires: [], agents: [], events: [] });
});

app.get("/api/world/stats", (req, res) => {
  res.json(getWorldStats(swarm.world));
});

app.get("/api/goals", (req, res) => {
  res.json(getAllGoals());
});

app.get("/api/goals/stats", (req, res) => {
  res.json(getGoalStats());
});

app.get("/api/plans", (req, res) => {
  res.json(getAllPlans());
});

app.get("/api/plans/stats", (req, res) => {
  res.json(getPlanStats());
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
    game = { tick: gameRes.data.tick, players: gameRes.data.players, empires: gameRes.data.empires?.length };
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
      currentGoal: swarm.currentGoal,
      stability: (swarm.alive / WARFARE_PORTS.length * 100).toFixed(1) + '%'
    },
    world: getWorldStats(swarm.world),
    goals: getGoalStats(),
    plans: getPlanStats()
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
      currentGoal: swarm.currentGoal,
      learningRate: swarm.learning.adaptationRate,
      decisions: swarm.decisions.length,
      worldGeneration: swarm.world?.generation || 1,
      uptime: Math.floor((Date.now() - swarm.startTime) / 1000)
    },
    history: swarm.history.slice(-20)
  });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🌍 V136 SWARM CORE + WORLD BUILDER — СОЗДАНИЕ ИГРОВОГО МИРА              ║");
  console.log("║   ✅ Фракции | ✅ Агенты | ✅ События | ✅ Синхронизация с игрой           ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Core: http://127.0.0.1:${PORT}`);
  console.log(`🌍 World: http://127.0.0.1:${PORT}/api/world`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🎯 Goals: http://127.0.0.1:${PORT}/api/goals`);
  console.log(`🧠 Plans: http://127.0.0.1:${PORT}/api/plans`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Swarm Core...");
  process.exit();
});
