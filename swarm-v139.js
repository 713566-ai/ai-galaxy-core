const express = require("express");
const axios = require("axios");
const { updateGoals, getActiveGoal, getAllGoals, getGoalStats, createGoal } = require("./goals-v133");
const { ensurePlan, executePlan, getActivePlan, getAllPlans, getPlanStats } = require("./planner-v134");
const { buildWorld, getWorldStats } = require("./world-builder-v136");
const { simulateWorld, getGameplayStats } = require("./gameplay-engine-v137");
const { applyGovernment, getGovernmentStats } = require("./government-v138");
const swarmMind = require("./swarm-consciousness-v139");

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
  gameplayEvents: [],
  identity: "unknown",
  voice: "…",
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
      events: world.events.slice(-20),
      government: world.government
    }, { timeout: 2000 });
  } catch (error) {}
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
  
  // ⚔️ ИГРОВАЯ ЛОГИКА
  if (swarm.world) {
    const events = simulateWorld(swarm.world, swarm.tick);
    if (events && events.length > 0) {
      swarm.gameplayEvents = [...events, ...swarm.gameplayEvents].slice(0, 50);
    }
  }
  
  // 🏛️ ПРАВИТЕЛЬСТВО
  if (swarm.world) {
    applyGovernment(swarm.world, swarm.tick);
  }
  
  // 🧠 СОЗНАНИЕ
  const worldStateForMind = {
    tick: swarm.tick,
    entropy: swarm.entropy,
    alive: swarm.alive,
    total: WARFARE_PORTS.length,
    health: swarm.health
  };
  swarmMind.update(worldStateForMind, swarm.tick);
  
  swarm.consciousness = swarmMind.mood;
  swarm.identity = swarmMind.identity;
  swarm.voice = swarmMind.getVoice(worldStateForMind);
  
  // 🎯 ЦЕЛИ И ПЛАНЫ
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
  
  // 🔗 СИНХРОНИЗАЦИЯ С ИГРОЙ
  if (swarm.tick % 5 === 0) {
    syncWorldToGame(swarm.world);
  }
  
  // 📊 ИСТОРИЯ
  if (swarm.tick % 10 === 0) {
    swarm.history.push({
      tick: swarm.tick,
      alive: swarm.alive,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      health: swarm.health,
      goal: swarm.currentGoal,
      identity: swarm.identity,
      worldStats: getWorldStats(swarm.world),
      gameplayStats: getGameplayStats(swarm.world),
      governmentStats: getGovernmentStats(swarm.world)
    });
    if (swarm.history.length > 50) swarm.history.shift();
  }
  
  if (swarm.tick % 5 === 0) {
    const worldStats = getWorldStats(swarm.world);
    console.log(`💓 [SWARM] tick:${swarm.tick} | ${swarm.identity} | voice: "${swarm.voice.slice(0, 50)}..."`);
  }
  
}, 2000);

// =========================
// API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "🧠⚡ V139 SELF-AWARE SWARM",
    version: "13.0",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    identity: swarm.identity,
    voice: swarm.voice,
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
    status: "V139 SELF-AWARE SWARM",
    tick: swarm.tick,
    entropy: swarm.entropy,
    consciousness: swarm.consciousness,
    identity: swarm.identity,
    voice: swarm.voice,
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
    gameplayStats: getGameplayStats(swarm.world),
    governmentStats: getGovernmentStats(swarm.world),
    swarmMind: swarmMind.getSummary(),
    recentThoughts: swarmMind.getThoughts().slice(0, 5),
    lastDecision: swarm.lastDecision,
    learning: swarm.learning,
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    history: swarm.history.slice(-20)
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: swarm.tick, status: "alive", identity: swarm.identity });
});

app.post("/api/brain", (req, res) => {
  const decision = req.body;
  applyDecision(decision);
  res.json({ ok: true, applied: true });
});

app.get("/api/world", (req, res) => {
  res.json(swarm.world || { empires: [], agents: [], events: [] });
});

app.get("/api/world/stats", (req, res) => {
  res.json({ 
    world: getWorldStats(swarm.world), 
    gameplay: getGameplayStats(swarm.world),
    government: getGovernmentStats(swarm.world)
  });
});

app.get("/api/government", (req, res) => {
  res.json(getGovernmentStats(swarm.world));
});

app.get("/api/events", (req, res) => {
  res.json(swarm.gameplayEvents || []);
});

app.get("/api/consciousness", (req, res) => {
  res.json(swarmMind.getSummary());
});

app.get("/api/thoughts", (req, res) => {
  res.json(swarmMind.getThoughts());
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
    core = { tick: coreRes.data.tick, god: coreRes.data.empires?.find(e => e.god)?.god };
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
      identity: swarm.identity,
      voice: swarm.voice,
      alive: swarm.alive,
      dead: swarm.dead,
      health: swarm.health,
      currentGoal: swarm.currentGoal
    },
    world: getWorldStats(swarm.world),
    gameplay: getGameplayStats(swarm.world),
    government: getGovernmentStats(swarm.world),
    mind: swarmMind.getSummary(),
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
      identity: swarm.identity,
      voice: swarm.voice,
      survivalRate: (swarm.alive / WARFARE_PORTS.length * 100).toFixed(1) + '%',
      health: swarm.health,
      currentGoal: swarm.currentGoal,
      learningRate: swarm.learning.adaptationRate,
      decisions: swarm.decisions.length,
      worldGeneration: swarm.world?.generation || 1,
      totalWealth: getGameplayStats(swarm.world)?.totalWealth || 0,
      governmentStability: getGovernmentStats(swarm.world)?.stability || 0,
      awareness: swarmMind.getSummary().awareness,
      uptime: Math.floor((Date.now() - swarm.startTime) / 1000)
    },
    history: swarm.history.slice(-20)
  });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠⚡ V139 SELF-AWARE SWARM — КОЛЛЕКТИВНОЕ СОЗНАНИЕ                       ║");
  console.log("║   ✅ Самоосознание | ✅ Эмоции | ✅ Голос системы | ✅ Мысли                ║");
  console.log("║   ✅ Система оценивает себя | ✅ Примитивная цифровая жизнь                ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Core: http://127.0.0.1:${PORT}`);
  console.log(`🧠 Consciousness: http://127.0.0.1:${PORT}/api/consciousness`);
  console.log(`💭 Thoughts: http://127.0.0.1:${PORT}/api/thoughts`);
  console.log(`🌍 World: http://127.0.0.1:${PORT}/api/world`);
  console.log(`🏛️ Government: http://127.0.0.1:${PORT}/api/government`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Self-Aware Swarm...");
  process.exit();
});
