// =========================
// 💀 V92 CONTROLLED CHAOS CORE
// =========================

const express = require("express");
const app = express();

const state = {
  tick: 0,

  world: {
    entropy: 0.45,
    wars: 0,
    entities: 500,
    alliances: 1,
  },

  agents: [
    { name: "codey", fitness: 0.6, energy: 1 },
    { name: "uiax", fitness: 0.55, energy: 1 },
    { name: "garlic", fitness: 0.3, energy: 1 },
  ],

  meta: {
    chaosDrive: 0.6,
    stability: 0.4,
  },

  reward: 0,
};

// =========================
// 🔥 WAR SYSTEM (source of life)
// =========================
function simulateWars() {
  const chance = state.world.entropy * state.meta.chaosDrive;

  if (Math.random() < chance) {
    state.world.wars += 1;

    const reward = Math.random() * 2 - 0.5;

    state.reward += reward;

    // wars = evolution fuel, not destruction
    state.agents.forEach(a => {
      a.fitness += reward * 0.01;
      a.energy -= 0.02;
    });
  }
}

// =========================
// 🌡 STABILITY SYSTEM (FIXED V92)
// =========================
function stabilityBrake() {
  const entropy = state.world.entropy;

  // soft clamp, NOT kill switch
  const target = 0.5;

  const delta = target - entropy;

  state.world.entropy += delta * 0.02; // VERY slow correction

  // stability affects chaos driver slightly
  state.meta.chaosDrive += delta * 0.01;

  // clamp (IMPORTANT)
  state.world.entropy = Math.max(0.05, Math.min(0.95, state.world.entropy));
  state.meta.chaosDrive = Math.max(0.1, Math.min(0.9, state.meta.chaosDrive));
}

// =========================
// 🧠 EVOLUTION STEP
// =========================
function evolveAgents() {
  state.agents.forEach(agent => {
    const noise = (Math.random() - 0.5) * state.world.entropy;

    agent.fitness += noise * 0.01;

    // survival drift
    if (agent.energy < 0.5) agent.fitness -= 0.02;
    if (agent.energy > 1) agent.energy = 1;
  });
}

// =========================
// 🌍 WORLD STEP
// =========================
function worldStep() {
  state.tick++;

  simulateWars();
  evolveAgents();
  stabilityBrake();

  // passive entropy drift
  state.world.entropy += (Math.random() - 0.5) * 0.01;
  state.world.entropy = Math.max(0.05, Math.min(0.95, state.world.entropy));
}

// =========================
// 🚀 API
// =========================
app.get("/api/status", (req, res) => {
  res.json({
    tick: state.tick,
    world: state.world,
    reward: state.reward,
    chaos: state.meta,
    agents: state.agents,
  });
});

// =========================
// 🔁 LOOP
// =========================
setInterval(worldStep, 500);

app.listen(3000, () => {
  console.log("💀 V92 CONTROLLED CHAOS CORE ONLINE :3000");
});
