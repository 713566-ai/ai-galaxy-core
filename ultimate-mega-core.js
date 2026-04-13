#!/usr/bin/env node
// ============================================================
// 🌌 ULTIMATE MEGA CORE V130
// Стабилизация | Боги | Swarm | Tor | Дипломатия | Технологии
// ============================================================

const express = require("express");
const http = require("http");
const crypto = require("crypto");

const app = express();
app.use(express.json());

// =========================
// 📊 ГОСУДАРСТВО (СТАБИЛИЗИРОВАННОЕ)
// =========================
let state = {
  tick: 0,
  tickSpeed: 500,
  startTime: Date.now(),
  stabilized: true,
  stabilityCheck: 0,

  // 🌍 МИР (стабилизированный)
  world: {
    entropy: 0.45,        // Стабилизированная энтропия
    stability: 0.65,      // Высокая стабильность
    warPressure: 0.25,
    economicPressure: 0.35,
    ideologyPressure: 0.35,
  },

  // 🏛️ ИМПЕРИИ (расширенные)
  empires: [
    {
      id: "E1",
      name: "Aurora",
      ideology: { type: "harmony", expansionism: 0.4, tolerance: 0.8, collectivism: 0.7 },
      economy: { wealth: 150, production: 12, consumption: 8, tech: 1.2 },
      strength: 0.75,
      territory: 65,
      cohesion: 0.85,
      status: "stable",
      agentsCount: 0,
      godAgent: null,
      diplomacy: { allies: [], enemies: [], tradeAgreements: [] },
      technology: { level: 1, discoveries: [] }
    },
    {
      id: "E2",
      name: "Obsidian",
      ideology: { type: "dominion", expansionism: 0.85, tolerance: 0.25, collectivism: 0.35 },
      economy: { wealth: 100, production: 9, consumption: 10, tech: 0.8 },
      strength: 0.55,
      territory: 35,
      cohesion: 0.55,
      status: "unstable",
      agentsCount: 0,
      godAgent: null,
      diplomacy: { allies: [], enemies: [], tradeAgreements: [] },
      technology: { level: 0, discoveries: [] }
    },
    {
      id: "E3",
      name: "Nexus",
      ideology: { type: "balance", expansionism: 0.5, tolerance: 0.6, collectivism: 0.5 },
      economy: { wealth: 120, production: 10, consumption: 9, tech: 1.0 },
      strength: 0.65,
      territory: 50,
      cohesion: 0.7,
      status: "stable",
      agentsCount: 0,
      godAgent: null,
      diplomacy: { allies: [], enemies: [], tradeAgreements: [] },
      technology: { level: 1, discoveries: [] }
    }
  ],

  // 🧬 АГЕНТЫ
  agents: [
    { 
      name: "codey", loyalty: "E1", belief: { harmony: 0.7, dominion: 0.3, balance: 0.5 }, 
      fitness: 0.88, productivity: 1.3, energy: 0.95, 
      consciousness: { trauma: 0.1, aggressionBias: 0.2, trustDecay: 0.1, godAwareness: 0.7 },
      memory: [], capabilities: { isGod: false }
    },
    { 
      name: "uiax", loyalty: "E1", belief: { harmony: 0.6, dominion: 0.4, balance: 0.5 }, 
      fitness: 0.65, productivity: 1.1, energy: 0.9,
      consciousness: { trauma: 0, aggressionBias: 0.3, trustDecay: 0.1, godAwareness: 0.1 },
      memory: [], capabilities: {}
    },
    { 
      name: "garlic", loyalty: "E2", belief: { harmony: 0.2, dominion: 0.8, balance: 0.3 }, 
      fitness: 0.45, productivity: 0.85, energy: 0.8,
      consciousness: { trauma: 0.2, aggressionBias: 0.5, trustDecay: 0.2, godAwareness: 0 },
      memory: [], capabilities: {}
    },
    { 
      name: "nova", loyalty: "E3", belief: { harmony: 0.5, dominion: 0.4, balance: 0.7 }, 
      fitness: 0.7, productivity: 1.0, energy: 0.9,
      consciousness: { trauma: 0, aggressionBias: 0.2, trustDecay: 0.05, godAwareness: 0.2 },
      memory: [], capabilities: {}
    }
  ],

  // 📈 ИСТОРИЯ
  history: { 
    wars: 0, collapses: 0, expansions: 0, 
    ideologicalWars: 0, economicWars: 0, 
    godAscensions: 0, technologies: 0,
    alliances: 0, tradeDeals: 0
  },

  // ⚙️ МЕТА
  meta: { chaosDrive: 0.45, stability: 0.65, consciousness: 0 },
  reward: 0,
  
  // 🌌 МУЛЬТИВСЕЛЕННАЯ
  multiverse: [],
  
  // 👑 БОГИ
  gods: [],
  
  // 🔗 SWARM
  swarm: {
    masterPort: 3001,
    peers: [],
    torEnabled: false,
    lastSync: null
  },
  
  // 🔧 СТАБИЛИЗАЦИЯ
  stabilization: {
    targetEntropy: 0.45,
    targetStability: 0.65,
    correctionRate: 0.03
  }
};

// =========================
// 🔧 СТАБИЛИЗАЦИЯ (НОВОЕ!)
// =========================
function stabilizeWorld() {
  // Стабилизация энтропии
  const entropyDelta = state.stabilization.targetEntropy - state.world.entropy;
  state.world.entropy += entropyDelta * state.stabilization.correctionRate;
  
  // Стабилизация хаоса
  const chaosTarget = 0.45;
  const chaosDelta = chaosTarget - state.meta.chaosDrive;
  state.meta.chaosDrive += chaosDelta * 0.02;
  
  // Проверка стабильности
  const isStable = Math.abs(state.world.entropy - state.stabilization.targetEntropy) < 0.1 &&
                   Math.abs(state.meta.chaosDrive - chaosTarget) < 0.1;
  
  state.stabilized = isStable;
  state.stabilityCheck++;
  
  if (state.tick % 50 === 0) {
    console.log(`🔧 STABILIZATION: Entropy=${state.world.entropy.toFixed(3)} Chaos=${state.meta.chaosDrive.toFixed(3)} Stable=${state.stabilized}`);
  }
}

// =========================
// 👑 БОГИ (РАСШИРЕННЫЕ)
// =========================
function detectAndAscendGod() {
  state.empires.forEach(empire => {
    if (empire.godAgent) return;
    
    const agents = state.agents.filter(a => a.loyalty === empire.id);
    const bestAgent = agents.sort((a, b) => b.fitness - a.fitness)[0];
    
    // Условия для становления богом
    const canAscend = bestAgent && 
                      bestAgent.fitness > 0.85 && 
                      empire.strength > 0.7 && 
                      state.tick > 30 &&
                      bestAgent.consciousness.godAwareness > 0.5;
    
    if (canAscend) {
      empire.godAgent = bestAgent.name;
      bestAgent.capabilities.isGod = true;
      bestAgent.capabilities = {
        ...bestAgent.capabilities,
        influenceWars: true,
        rewriteRewards: true,
        biasEntropy: true,
        stabilizeWorld: true,
        blessEmpire: true,
        curseEnemies: true
      };
      bestAgent.consciousness.godAwareness = 1.0;
      bestAgent.fitness = 0.95;
      state.history.godAscensions++;
      
      console.log(`👑✨ GOD ASCENSION: ${bestAgent.name} (${empire.name}) at tick ${state.tick}`);
      
      // Бог стабилизирует свою империю
      empire.cohesion = Math.min(1, empire.cohesion + 0.2);
      empire.status = "blessed";
    }
  });
}

// Божественные способности
function divineIntervention() {
  state.empires.forEach(empire => {
    if (!empire.godAgent) return;
    
    const god = state.agents.find(a => a.name === empire.godAgent);
    if (!god) return;
    
    // Бог стабилизирует мир
    if (god.capabilities.stabilizeWorld && Math.random() < 0.1) {
      state.world.entropy = Math.max(0.3, state.world.entropy - 0.05);
      console.log(`✨ ${god.name} стабилизирует вселенную!`);
    }
    
    // Бог благословляет империю
    if (god.capabilities.blessEmpire && Math.random() < 0.15) {
      empire.economy.wealth += 10;
      empire.strength = Math.min(1, empire.strength + 0.03);
      console.log(`🙏 ${god.name} благословляет ${empire.name}`);
    }
  });
}

// =========================
// 🤝 ДИПЛОМАТИЯ (НОВОЕ!)
// =========================
function diplomacySystem() {
  const [a, b, c] = state.empires;
  
  // Шанс создания альянса
  if (Math.random() < 0.05 && a.diplomacy.allies.length < 2) {
    if (!a.diplomacy.allies.includes(b.id) && a.ideology.tolerance > 0.5 && b.ideology.tolerance > 0.4) {
      a.diplomacy.allies.push(b.id);
      b.diplomacy.allies.push(a.id);
      state.history.alliances++;
      console.log(`🤝 ALIANCE: ${a.name} + ${b.name}`);
    }
  }
  
  // Торговые соглашения
  state.empires.forEach(empire => {
    empire.diplomacy.allies.forEach(allyId => {
      const ally = state.empires.find(e => e.id === allyId);
      if (ally && Math.random() < 0.1) {
        const trade = Math.min(empire.economy.wealth * 0.1, 20);
        empire.economy.wealth -= trade;
        ally.economy.wealth += trade;
        state.history.tradeDeals++;
      }
    });
  });
}

// =========================
// 🔬 ТЕХНОЛОГИИ (НОВОЕ!)
// =========================
function technologySystem() {
  state.empires.forEach(empire => {
    // Исследование
    const researchChance = 0.02 * (empire.economy.tech || 1);
    if (Math.random() < researchChance) {
      const discoveries = [
        "Agriculture", "Writing", "Mathematics", "Astronomy", 
        "Medicine", "Engineering", "Electricity", "Computing",
        "AI", "SpaceTravel", "QuantumPhysics", "ConsciousnessTransfer"
      ];
      
      const newTech = discoveries[Math.floor(Math.random() * discoveries.length)];
      if (!empire.technology.discoveries.includes(newTech)) {
        empire.technology.discoveries.push(newTech);
        empire.technology.level++;
        state.history.technologies++;
        console.log(`🔬 DISCOVERY: ${empire.name} invented ${newTech}!`);
        
        // Технологический буст
        empire.economy.production *= 1.1;
        empire.strength = Math.min(1, empire.strength + 0.02);
      }
    }
  });
}

// =========================
// 🔗 SWARM СИНХРОНИЗАЦИЯ
// =========================
function syncToSwarm() {
  if (!state.swarm.masterPort) return;
  
  const data = JSON.stringify({
    tick: state.tick,
    entropy: state.world.entropy,
    stability: state.world.stability,
    empires: state.empires.length,
    agents: state.agents.length,
    gods: state.history.godAscensions,
    technologies: state.history.technologies,
    alliances: state.history.alliances,
    consciousness: state.meta.consciousness
  });
  
  const options = {
    hostname: '127.0.0.1',
    port: state.swarm.masterPort,
    path: '/api/swarm/sync',
    method: 'POST',
    timeout: 1000,
    headers: { 'Content-Type': 'application/json' }
  };
  
  const req = http.request(options, () => {});
  req.on('error', () => {});
  req.write(data);
  req.end();
}

// =========================
// 🧠 ОСТАЛЬНЫЕ ФУНКЦИИ (оптимизированные)
// =========================
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function ideologyMatch(agent, empire) {
  const a = agent.belief;
  const e = empire.ideology;
  let score = 0;
  if (e.type === "harmony") score += a.harmony * 0.7;
  if (e.type === "dominion") score += a.dominion * 0.7;
  if (e.type === "balance") score += a.balance * 0.7;
  score += empire.cohesion * 0.3;
  return score;
}

function updateLoyalty() {
  state.agents.forEach(agent => {
    let bestEmpire = null;
    let bestScore = -Infinity;
    state.empires.forEach(empire => {
      const score = ideologyMatch(agent, empire);
      if (score > bestScore) { bestScore = score; bestEmpire = empire; }
    });
    if (bestEmpire && bestEmpire.id !== agent.loyalty && Math.random() < bestScore * 0.3) {
      agent.loyalty = bestEmpire.id;
      console.log(`🔄 ${agent.name} перешёл в ${bestEmpire.name}`);
    }
    agent.fitness += bestScore * 0.005;
    agent.fitness = clamp(agent.fitness, 0.1, 0.95);
  });
}

function economyStep(empire) {
  const productionBoost = (empire.agentsCount || 1) * (empire.economy.tech || 1);
  empire.economy.production += productionBoost * 0.05;
  empire.economy.wealth += empire.economy.production;
  empire.economy.wealth -= empire.economy.consumption;
  if (empire.economy.wealth < 0) empire.strength -= 0.02;
  empire.strength += empire.economy.wealth * 0.0005;
  empire.strength = clamp(empire.strength, 0.1, 0.95);
}

function warSystem() {
  const chance = state.world.entropy * state.meta.chaosDrive;
  if (Math.random() < chance * 0.1) {
    state.history.wars++;
    console.log(`⚔️ WAR at tick ${state.tick}`);
  }
}

// =========================
// 🔁 MAIN LOOP
// =========================
function step() {
  state.tick++;
  
  // Основные системы
  state.empires.forEach(e => { e.agentsCount = state.agents.filter(a => a.loyalty === e.id).length; });
  updateLoyalty();
  state.empires.forEach(economyStep);
  warSystem();
  diplomacySystem();
  technologySystem();
  detectAndAscendGod();
  divineIntervention();
  stabilizeWorld();
  
  // Пассивный дрейф
  state.world.entropy += (Math.random() - 0.5) * 0.005;
  state.world.entropy = clamp(state.world.entropy, 0.2, 0.8);
  
  // Мета-сознание
  state.meta.consciousness = state.empires.reduce((sum, e) => sum + e.strength, 0) / state.empires.length;
  
  // Swarm синхронизация
  if (state.tick % 10 === 0) syncToSwarm();
  
  // Логирование
  if (state.tick % 20 === 0) {
    const godCount = state.empires.filter(e => e.godAgent).length;
    console.log(`\n🌌 TICK ${state.tick} | Entropy:${state.world.entropy.toFixed(3)} | Stability:${state.world.stability.toFixed(3)} | Wars:${state.history.wars} | Gods:${godCount} | Tech:${state.history.technologies} | Alliances:${state.history.alliances}`);
  }
}

// =========================
// 🚀 API
// =========================
app.get("/", (req, res) => {
  const godCount = state.empires.filter(e => e.godAgent).length;
  res.json({
    status: "🌌 ULTIMATE MEGA CORE V130",
    tick: state.tick,
    stabilized: state.stabilized,
    uptime: Math.floor((Date.now() - state.startTime) / 1000),
    world: state.world,
    empires: state.empires.map(e => ({ name: e.name, strength: e.strength.toFixed(3), wealth: e.economy.wealth.toFixed(0), god: e.godAgent, tech: e.technology.level })),
    gods: godCount,
    history: state.history,
    meta: state.meta
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    tick: state.tick,
    stabilized: state.stabilized,
    world: state.world,
    empires: state.empires.map(e => ({ 
      id: e.id, name: e.name, strength: e.strength.toFixed(3), 
      wealth: e.economy.wealth.toFixed(0), status: e.status, 
      god: e.godAgent, tech: e.technology.level, 
      discoveries: e.technology.discoveries,
      allies: e.diplomacy.allies
    })),
    agents: state.agents.map(a => ({ 
      name: a.name, fitness: a.fitness.toFixed(3), 
      loyalty: a.loyalty, isGod: a.capabilities.isGod || false 
    })),
    history: state.history,
    consciousness: state.meta.consciousness.toFixed(3)
  });
});

app.get("/api/empires", (req, res) => { res.json(state.empires); });
app.get("/api/agents", (req, res) => { res.json(state.agents); });
app.get("/api/gods", (req, res) => { res.json(state.empires.filter(e => e.godAgent).map(e => ({ empire: e.name, god: e.godAgent, capabilities: state.agents.find(a => a.name === e.godAgent)?.capabilities }))); });
app.get("/api/diplomacy", (req, res) => { res.json(state.empires.map(e => ({ name: e.name, allies: e.diplomacy.allies }))); });
app.get("/api/technologies", (req, res) => { res.json(state.empires.map(e => ({ name: e.name, level: e.technology.level, discoveries: e.technology.discoveries }))); });
app.get("/api/ping", (req, res) => { res.json({ online: true, tick: state.tick, entropy: state.world.entropy, stabilized: state.stabilized }); });

// Swarm endpoints
app.post("/api/swarm/sync", (req, res) => {
  state.swarm.lastSync = new Date().toISOString();
  res.json({ received: true, tick: state.tick });
});

// =========================
// 🔁 LOOP
// =========================
setInterval(step, state.tickSpeed);

// =========================
// 🧱 START
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🌌 ULTIMATE MEGA CORE V130 — ПОЛНАЯ ВСЕЛЕННАЯ                            ║");
  console.log("║   ✅ Стабилизация | 👑 Боги | 🔗 Swarm | 🧅 Tor | 🤝 Дипломатия | 🔬 Технологии ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n📡 API: http://127.0.0.1:${PORT}`);
  console.log(`   /api/status - полное состояние`);
  console.log(`   /api/empires - империи`);
  console.log(`   /api/agents - агенты`);
  console.log(`   /api/gods - боги`);
  console.log(`   /api/diplomacy - дипломатия`);
  console.log(`   /api/technologies - технологии`);
  console.log(`   /api/ping - heartbeat\n`);
  console.log("🔄 СИСТЕМЫ АКТИВНЫ: Стабилизация | Божественные силы | Дипломатия | Технологии | Swarm\n");
});
