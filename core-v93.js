// =========================
// 💀 V93 CIVILIZATION CORE
// =========================

const express = require("express");
const app = express();

const state = {
  tick: 0,

  world: {
    entropy: 0.5,
    stability: 0.4,
    warPressure: 0.3,
  },

  // 🏛️ CIVILIZATIONS
  empires: [
    {
      id: "E1",
      name: "Aurora",
      strength: 0.6,
      territory: 30,
      cohesion: 0.8,
      agents: ["codey", "uiax"],
      status: "stable",
    },
    {
      id: "E2",
      name: "Obsidian",
      strength: 0.5,
      territory: 25,
      cohesion: 0.7,
      agents: ["garlic"],
      status: "stable",
    },
  ],

  agents: [
    { name: "codey", fitness: 0.6, loyalty: "E1", energy: 1 },
    { name: "uiax", fitness: 0.55, loyalty: "E1", energy: 1 },
    { name: "garlic", fitness: 0.4, loyalty: "E2", energy: 1 },
  ],

  history: {
    wars: 0,
    collapses: 0,
    expansions: 0,
  },
};

// =========================
// ⚔️ CIVILIZATION WAR ENGINE
// =========================
function simulateCivilWar() {
  const warChance = state.world.warPressure * state.world.entropy;

  if (Math.random() < warChance) {
    state.history.wars++;

    const a = state.empires[0];
    const b = state.empires[1];

    const powerA = a.strength * a.cohesion;
    const powerB = b.strength * b.cohesion;

    const winner = powerA > powerB ? a : b;
    const loser = winner === a ? b : a;

    winner.territory += 3;
    loser.territory -= 4;

    winner.strength += 0.01;
    loser.strength -= 0.02;

    // collapse condition
    if (loser.territory <= 5) {
      loser.status = "collapsing";
      state.history.collapses++;
    }

    state.world.entropy += 0.02;
  }
}

// =========================
// 🏛️ EMPIRE EXPANSION SYSTEM
// =========================
function expandEmpires() {
  state.empires.forEach(empire => {
    if (empire.status === "stable") {
      const gain = empire.strength * Math.random();

      empire.territory += gain * 0.5;
      state.history.expansions++;

      // cohesion drift
      empire.cohesion += (Math.random() - 0.5) * 0.01;

      empire.cohesion = Math.max(0.1, Math.min(1, empire.cohesion));
    }
  });
}

// =========================
// 🧠 LOYALTY SHIFT SYSTEM
// =========================
function updateAgentLoyalty() {
  state.agents.forEach(agent => {
    const empire = state.empires.find(e => e.id === agent.loyalty);

    if (!empire) return;

    const pressure = empire.cohesion - state.world.entropy;

    // rebellion chance
    if (Math.random() > pressure + 0.5) {
      const target = state.empires[Math.floor(Math.random() * state.empires.length)];
      agent.loyalty = target.id;
    }

    agent.fitness += pressure * 0.01;
  });
}

// =========================
// 🌍 WORLD BALANCE
// =========================
function worldStep() {
  state.tick++;

  simulateCivilWar();
  expandEmpires();
  updateAgentLoyalty();

  // entropy drift
  state.world.entropy += (Math.random() - 0.5) * 0.01;

  // soft clamp
  state.world.entropy = Math.max(0.05, Math.min(0.95, state.world.entropy));

  // war pressure evolves
  state.world.warPressure += (Math.random() - 0.5) * 0.005;
  state.world.warPressure = Math.max(0.1, Math.min(0.9, state.world.warPressure));
}

// =========================
// 🚀 API
// =========================
app.get("/api/status", (req, res) => {
  res.json({
    tick: state.tick,
    world: state.world,
    empires: state.empires,
    agents: state.agents,
    history: state.history,
  });
});

// =========================
// 🔁 LOOP
// =========================
setInterval(worldStep, 500);

app.listen(3000, () => {
  console.log("💀 V93 CIVILIZATION CORE ONLINE :3000");
});
