const express = require("express");
const app = express();

const state = {
  tick: 0,

  world: {
    entropy: 0.6,
    ideologyPressure: 0.5,
  },

  // 🏛️ IDEOLOGICAL EMPIRES
  empires: [
    {
      id: "E1",
      name: "Aurora",
      ideology: {
        type: "harmony",
        expansionism: 0.4,
        tolerance: 0.8,
        collectivism: 0.7,
      },
      strength: 0.7,
      territory: 60,
      cohesion: 0.8,
      status: "stable",
    },

    {
      id: "E2",
      name: "Obsidian",
      ideology: {
        type: "dominion",
        expansionism: 0.9,
        tolerance: 0.2,
        collectivism: 0.3,
      },
      strength: 0.6,
      territory: 40,
      cohesion: 0.6,
      status: "stable",
    },
  ],

  agents: [
    {
      name: "codey",
      loyalty: "E1",
      belief: { harmony: 0.7, dominion: 0.3 },
      fitness: 0.6,
    },
    {
      name: "uiax",
      loyalty: "E1",
      belief: { harmony: 0.6, dominion: 0.4 },
      fitness: 0.55,
    },
    {
      name: "garlic",
      loyalty: "E2",
      belief: { harmony: 0.2, dominion: 0.8 },
      fitness: 0.4,
    },
  ],
};

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
// 🔄 AGENT REALIGNMENT
// =========================
function updateLoyalty() {
  state.agents.forEach(agent => {
    let bestEmpire = null;
    let bestScore = -Infinity;

    state.empires.forEach(empire => {
      const score = ideologyMatch(agent, empire);

      if (score > bestScore) {
        bestScore = score;
        bestEmpire = empire;
      }
    });

    // switch ideology if mismatch too high
    if (bestEmpire && bestEmpire.id !== agent.loyalty) {
      if (Math.random() < bestScore) {
        agent.loyalty = bestEmpire.id;
      }
    }

    agent.fitness += bestScore * 0.01;
  });
}

// =========================
// ⚔️ IDEOLOGICAL WAR SYSTEM
// =========================
function ideologicalWar() {
  const [a, b] = state.empires;

  const ideologicalConflict =
    Math.abs(a.ideology.expansionism - b.ideology.expansionism) +
    (1 - Math.abs(a.ideology.tolerance - b.ideology.tolerance));

  if (Math.random() < ideologicalConflict * state.world.entropy) {
    const winner = Math.random() > 0.5 ? a : b;
    const loser = winner === a ? b : a;

    winner.territory += 5;
    loser.territory -= 6;

    winner.strength += 0.02;
    loser.strength -= 0.03;

    if (loser.territory <= 10) {
      loser.status = "ideological_collapse";
    }
  }
}

// =========================
// 🌍 WORLD STEP
// =========================
function step() {
  state.tick++;

  updateLoyalty();
  ideologicalWar();

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
  console.log("💀 V94 IDEOLOGY CORE ONLINE");
});
