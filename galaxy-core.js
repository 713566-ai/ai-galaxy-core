// ============================================================
// 🌌 AI GALAXY CORE — УНИВЕРСАЛЬНЫЙ ЭВОЛЮЦИОННЫЙ ДВИЖОК
// Версии: V76-V95 (Civilization + Economy + Ideology + Chaos)
// ============================================================

const express = require("express");
const app = express();

// =========================
// 📊 НАЧАЛЬНОЕ СОСТОЯНИЕ
// =========================

let state = {
  tick: 0,
  tickSpeed: 500, // мс между тиками

  // 🌍 МИР
  world: {
    entropy: 0.55,
    stability: 0.5,
    warPressure: 0.3,
    economicPressure: 0.5,
    ideologyPressure: 0.5,
  },

  // 🏛️ ИМПЕРИИ
  empires: [
    {
      id: "E1",
      name: "Aurora",
      ideology: { type: "harmony", expansionism: 0.4, tolerance: 0.8, collectivism: 0.7 },
      economy: { wealth: 120, production: 10, consumption: 8 },
      strength: 0.7,
      territory: 60,
      cohesion: 0.8,
      status: "stable",
      agentsCount: 0,
    },
    {
      id: "E2",
      name: "Obsidian",
      ideology: { type: "dominion", expansionism: 0.9, tolerance: 0.2, collectivism: 0.3 },
      economy: { wealth: 80, production: 7, consumption: 9 },
      strength: 0.6,
      territory: 40,
      cohesion: 0.6,
      status: "stable",
      agentsCount: 0,
    },
  ],

  // 🧬 АГЕНТЫ
  agents: [
    { name: "codey", loyalty: "E1", belief: { harmony: 0.7, dominion: 0.3 }, fitness: 0.6, productivity: 1.2, energy: 1 },
    { name: "uiax", loyalty: "E1", belief: { harmony: 0.6, dominion: 0.4 }, fitness: 0.55, productivity: 1.0, energy: 1 },
    { name: "garlic", loyalty: "E2", belief: { harmony: 0.2, dominion: 0.8 }, fitness: 0.4, productivity: 0.8, energy: 1 },
  ],

  // 📈 ИСТОРИЯ
  history: { wars: 0, collapses: 0, expansions: 0, ideologicalWars: 0, economicWars: 0 },

  // ⚙️ МЕТА-ПАРАМЕТРЫ
  meta: { chaosDrive: 0.6, stability: 0.4 },
  reward: 0,
};

// =========================
// 🔗 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =========================

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

// =========================
// 🧠 IDEOLOGY MATCH SCORE
// =========================
function ideologyMatch(agent, empire) {
  const a = agent.belief;
  const e = empire.ideology;
  let score = 0;
  if (e.type === "harmony") score += a.harmony * 0.7;
  if (e.type === "dominion") score += a.dominion * 0.7;
  score += empire.cohesion * 0.3;
  return score;
}

// =========================
// 🔄 AGENT REALIGNMENT (V94)
// =========================
function updateLoyalty() {
  state.agents.forEach(agent => {
    let bestEmpire = null;
    let bestScore = -Infinity;
    state.empires.forEach(empire => {
      const score = ideologyMatch(agent, empire);
      if (score > bestScore) { bestScore = score; bestEmpire = empire; }
    });
    if (bestEmpire && bestEmpire.id !== agent.loyalty && Math.random() < bestScore) {
      agent.loyalty = bestEmpire.id;
    }
    agent.fitness += bestScore * 0.01;
  });
}

// =========================
// 📊 MAP AGENTS TO EMPIRES
// =========================
function mapAgents() {
  state.empires.forEach(empire => {
    empire.agentsCount = state.agents.filter(a => a.loyalty === empire.id).length;
  });
}

// =========================
// 💰 ECONOMY STEP (V95)
// =========================
function economyStep(empire) {
  const productionBoost = empire.agentsCount || 1;
  empire.economy.production += productionBoost * 0.1;
  empire.economy.wealth += empire.economy.production;
  empire.economy.wealth -= empire.economy.consumption;
  if (empire.economy.wealth < 0) empire.strength -= 0.05;
  empire.strength += empire.economy.wealth * 0.0001;
  empire.strength = clamp(empire.strength, 0.1, 0.95);
}

// =========================
// 📈 AGENT ECONOMY CONTRIBUTION (V95)
// =========================
function agentEconomy() {
  state.agents.forEach(agent => {
    const empire = state.empires.find(e => e.id === agent.loyalty);
    if (!empire) return;
    const output = agent.productivity * agent.energy;
    empire.economy.wealth += output * 0.5;
    empire.economy.consumption += 0.2;
    if (empire.economy.wealth < 50) agent.energy -= 0.02;
    else agent.energy += 0.01;
    agent.energy = clamp(agent.energy, 0, 1);
  });
}

// =========================
// ⚔️ IDEOLOGICAL WAR (V94)
// =========================
function ideologicalWar() {
  const [a, b] = state.empires;
  const ideologicalConflict = Math.abs(a.ideology.expansionism - b.ideology.expansionism) +
    (1 - Math.abs(a.ideology.tolerance - b.ideology.tolerance));
  if (Math.random() < ideologicalConflict * state.world.entropy) {
    state.history.ideologicalWars++;
    const winner = Math.random() > 0.5 ? a : b;
    const loser = winner === a ? b : a;
    winner.territory += 5;
    loser.territory -= 6;
    winner.strength += 0.02;
    loser.strength -= 0.03;
    if (loser.territory <= 10) loser.status = "ideological_collapse";
  }
}

// =========================
// ⚔️ ECONOMIC WAR (V95)
// =========================
function economicWar() {
  const [a, b] = state.empires;
  const imbalance = Math.abs(a.economy.wealth - b.economy.wealth) * 0.01;
  if (Math.random() < imbalance * state.world.entropy) {
    state.history.economicWars++;
    const winner = a.economy.wealth > b.economy.wealth ? a : b;
    const loser = winner === a ? b : a;
    winner.economy.wealth += 10;
    loser.economy.wealth -= 12;
    winner.strength += 0.02;
    loser.strength -= 0.03;
  }
}

// =========================
// 🏛️ EMPIRE EXPANSION
// =========================
function expandEmpires() {
  state.empires.forEach(empire => {
    if (empire.status === "stable") {
      const gain = empire.strength * Math.random();
      empire.territory += gain * 0.5;
      state.history.expansions++;
      empire.cohesion += (Math.random() - 0.5) * 0.01;
      empire.cohesion = clamp(empire.cohesion, 0.1, 1);
    }
  });
}

// =========================
// 🌡️ STABILITY BRAKE (V92)
// =========================
function stabilityBrake() {
  const target = 0.5;
  const delta = target - state.world.entropy;
  state.world.entropy += delta * 0.02;
  state.meta.chaosDrive += delta * 0.01;
  state.world.entropy = clamp(state.world.entropy, 0.05, 0.95);
  state.meta.chaosDrive = clamp(state.meta.chaosDrive, 0.1, 0.9);
}

// =========================
// 🔥 WAR SYSTEM (V92)
// =========================
function simulateWars() {
  const chance = state.world.entropy * state.meta.chaosDrive;
  if (Math.random() < chance) {
    state.history.wars++;
    const reward = Math.random() * 2 - 0.5;
    state.reward += reward;
    state.agents.forEach(a => { a.fitness += reward * 0.01; a.energy -= 0.02; });
  }
}

// =========================
// 🧬 EVOLVE AGENTS
// =========================
function evolveAgents() {
  state.agents.forEach(agent => {
    const noise = (Math.random() - 0.5) * state.world.entropy;
    agent.fitness += noise * 0.01;
    agent.fitness = clamp(agent.fitness, 0.1, 0.95);
  });
}

// =========================
// 🔁 MAIN STEP
// =========================
function step() {
  state.tick++;

  mapAgents();
  updateLoyalty();
  state.empires.forEach(economyStep);
  agentEconomy();
  economicWar();
  ideologicalWar();
  expandEmpires();
  simulateWars();
  evolveAgents();
  stabilityBrake();

  // Пассивный дрейф
  state.world.entropy += (Math.random() - 0.5) * 0.01;
  state.world.entropy = clamp(state.world.entropy, 0.05, 0.95);
  state.world.warPressure += (Math.random() - 0.5) * 0.005;
  state.world.warPressure = clamp(state.world.warPressure, 0.1, 0.9);
}

// =========================
// 🚀 API
// =========================
app.get("/api/status", (req, res) => { res.json(state); });
app.get("/api/empires", (req, res) => { res.json(state.empires); });
app.get("/api/agents", (req, res) => { res.json(state.agents); });
app.get("/api/history", (req, res) => { res.json(state.history); });

// =========================
// 🔁 LOOP
// =========================
setInterval(step, 500);

// =========================
// 🧱 START
// =========================
app.listen(3000, () => {
  console.log("🌌 AI GALAXY CORE — УНИВЕРСАЛЬНЫЙ ДВИЖОК (V76-V95)");
  console.log("🔥 Features: Economy | Ideology | Wars | Chaos Control | Agents");
  console.log("📡 API: /api/status, /api/empires, /api/agents, /api/history");
});
