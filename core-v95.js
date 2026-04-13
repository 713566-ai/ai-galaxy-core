const express = require("express");
const app = express();

const state = {
  tick: 0,

  world: {
    entropy: 0.55,
    economicPressure: 0.5,
  },

  // 🏛️ EMPIRES WITH ECONOMY
  empires: [
    {
      id: "E1",
      name: "Aurora",
      ideology: "harmony",

      economy: {
        wealth: 120,
        production: 10,
        consumption: 8,
      },

      strength: 0.7,
      territory: 60,
    },

    {
      id: "E2",
      name: "Obsidian",
      ideology: "dominion",

      economy: {
        wealth: 80,
        production: 7,
        consumption: 9,
      },

      strength: 0.6,
      territory: 40,
    },
  ],

  agents: [
    { name: "codey", loyalty: "E1", productivity: 1.2, energy: 1 },
    { name: "uiax", loyalty: "E1", productivity: 1.0, energy: 1 },
    { name: "garlic", loyalty: "E2", productivity: 0.8, energy: 1 },
  ],
};

// =========================
// 💰 ECONOMY UPDATE
// =========================
function economyStep(empire) {
  const productionBoost = empire.agentsCount ? empire.agentsCount : 1;

  empire.economy.production += productionBoost * 0.1;

  empire.economy.wealth += empire.economy.production;
  empire.economy.wealth -= empire.economy.consumption;

  // collapse if negative economy
  if (empire.economy.wealth < 0) {
    empire.strength -= 0.05;
  }

  // economic growth loop
  empire.strength += empire.economy.wealth * 0.0001;
}

// =========================
// 🧠 ASSIGN AGENTS
// =========================
function mapAgents() {
  state.empires.forEach(empire => {
    empire.agentsCount = state.agents.filter(
      a => a.loyalty === empire.id
    ).length;
  });
}

// =========================
// 📈 AGENT ECON CONTRIBUTION
// =========================
function agentEconomy() {
  state.agents.forEach(agent => {
    const empire = state.empires.find(e => e.id === agent.loyalty);
    if (!empire) return;

    const output = agent.productivity * agent.energy;

    empire.economy.wealth += output * 0.5;
    empire.economy.consumption += 0.2;

    // agents lose energy if empire weak
    if (empire.economy.wealth < 50) {
      agent.energy -= 0.02;
    } else {
      agent.energy += 0.01;
    }

    agent.energy = Math.max(0, Math.min(1, agent.energy));
  });
}

// =========================
// ⚔️ ECONOMIC WAR ENGINE
// =========================
function economicWar() {
  const [a, b] = state.empires;

  const imbalance = Math.abs(a.economy.wealth - b.economy.wealth) * 0.01;

  if (Math.random() < imbalance * state.world.entropy) {
    const winner = a.economy.wealth > b.economy.wealth ? a : b;
    const loser = winner === a ? b : a;

    winner.economy.wealth += 10;
    loser.economy.wealth -= 12;

    winner.strength += 0.02;
    loser.strength -= 0.03;
  }
}

// =========================
// 🌍 WORLD STEP
// =========================
function step() {
  state.tick++;

  mapAgents();

  state.empires.forEach(economyStep);
  agentEconomy();
  economicWar();

  state.world.entropy += (Math.random() - 0.5) * 0.01;
  state.world.entropy = Math.max(0.1, Math.min(0.95, state.world.entropy));
}

// =========================
// 🚀 API
// =========================
app.get("/api/status", (req, res) => {
  res.json(state);
});

setInterval(step, 500);

app.listen(3000, () => {
  console.log("💀 V95 ECONOMY CORE ONLINE");
});
