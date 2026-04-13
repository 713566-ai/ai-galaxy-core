const express = require("express");
const axios = require("axios");
const { updateGoals, getActiveGoal, getAllGoals, getGoalStats, createGoal } = require("./goals-v133");
const { ensurePlan, executePlan, getActivePlan, getAllPlans, getPlanStats } = require("./planner-v134");

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

// Главный цикл с целями и планами
setInterval(async () => {
  swarm.tick++;
  
  await checkAllNodes();
  
  swarm.entropy += (Math.random() - 0.5) * 0.005;
  swarm.entropy = Math.max(0.3, Math.min(0.7, swarm.entropy));
  
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
    
    // 🧠 СОЗДАНИЕ ПЛАНА ДЛЯ ЦЕЛИ
    const plan = ensurePlan(activeGoal);
    swarm.currentPlan = plan;
    
    // 🧠 ВЫПОЛНЕНИЕ ПЛАНА
    const planCompleted = executePlan(plan, swarm);
    
    // Логируем план каждые 10 тиков
    if (swarm.tick % 10 === 0) {
      const progress = plan.currentStep / plan.steps.length;
      console.log(`🎯 [GOAL] ${activeGoal.type} | Plan progress: ${(progress * 100).toFixed(1)}% (step ${plan.currentStep}/${plan.steps.length})`);
    }
  }
  
  if (swarm.tick % 10 === 0) {
    swarm.history.push({
      tick: swarm.tick,
      alive: swarm.alive,
      entropy: swarm.entropy,
      consciousness: swarm.consciousness,
      health: swarm.health,
      goal: swarm.currentGoal,
      planStep: swarm.currentPlan?.currentStep || 0
    });
    if (swarm.history.length > 50) swarm.history.shift();
  }
  
  if (swarm.tick % 5 === 0) {
    console.log(`💓 [SWARM] tick:${swarm.tick} | alive:${swarm.alive}/${WARFARE_PORTS.length} | goal:${swarm.currentGoal || 'none'} | plan:${swarm.currentPlan?.currentStep || 0}/${swarm.currentPlan?.steps?.length || 0}`);
  }
  
}, 2000);

// =========================
// API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "🧠 V134 SWARM CORE + PLANNER SYSTEM",
    version: "9.0",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    consciousness: swarm.consciousness.toFixed(4),
    health: swarm.health,
    alive: swarm.alive,
    dead: swarm.dead,
    total: WARFARE_PORTS.length,
    currentGoal: swarm.currentGoal,
    currentPlan: swarm.currentPlan ? {
      goal: swarm.currentPlan.goal,
      step: swarm.currentPlan.currentStep,
      totalSteps: swarm.currentPlan.steps.length,
      progress: (swarm.currentPlan.currentStep / swarm.currentPlan.steps.length * 100).toFixed(1) + '%'
    } : null,
    learning: swarm.learning
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "V134 SWARM CORE",
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
      totalSteps: swarm.currentPlan.steps.length,
      steps: swarm.currentPlan.steps.map(s => ({ action: s.action, status: s.status }))
    } : null,
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

// 🎯 GOALS API
app.get("/api/goals", (req, res) => {
  res.json(getAllGoals());
});

app.get("/api/goals/stats", (req, res) => {
  res.json(getGoalStats());
});

app.post("/api/goals/create", (req, res) => {
  const { type, priority, target } = req.body;
  const goal = createGoal(type, priority, target);
  res.json({ created: true, goal });
});

// 🧠 PLANNER API
app.get("/api/plans", (req, res) => {
  res.json(getAllPlans());
});

app.get("/api/plans/stats", (req, res) => {
  res.json(getPlanStats());
});

app.get("/api/plans/active", (req, res) => {
  const plan = getActivePlan();
  res.json(plan || { active: false });
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
      currentGoal: swarm.currentGoal,
      currentPlan: swarm.currentPlan ? {
        step: swarm.currentPlan.currentStep,
        total: swarm.currentPlan.steps.length
      } : null,
      learning: swarm.learning,
      stability: (swarm.alive / WARFARE_PORTS.length * 100).toFixed(1) + '%'
    },
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
      planProgress: swarm.currentPlan ? (swarm.currentPlan.currentStep / swarm.currentPlan.steps.length * 100).toFixed(1) + '%' : null,
      learningRate: swarm.learning.adaptationRate,
      decisions: swarm.decisions.length,
      uptime: Math.floor((Date.now() - swarm.startTime) / 1000)
    },
    history: swarm.history.slice(-20)
  });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠 V134 SWARM CORE + PLANNER SYSTEM — СИСТЕМА ПЛАНИРОВАНИЯ              ║");
  console.log("║   ✅ Цель → План → Шаги → Выполнение                                      ║");
  console.log("║   ✅ Пошаговое исполнение | ✅ Адаптация | ✅ Архитектор поведения        ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Core: http://127.0.0.1:${PORT}`);
  console.log(`👁️ God View: http://127.0.0.1:${PORT}/api/godview`);
  console.log(`🎯 Goals: http://127.0.0.1:${PORT}/api/goals`);
  console.log(`🧠 Plans: http://127.0.0.1:${PORT}/api/plans`);
  console.log(`📊 Stats: http://127.0.0.1:${PORT}/api/plans/stats`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down Swarm Core...");
  process.exit();
});
