#!/usr/bin/env node
// ============================================================
// 🧠🚀 AI GALAXY CORE V144 — FULL AUTONOMY GAME BRAIN
// ============================================================
// V142: Game Factory (build/run)
// V143: Creative Loop (идеи + механики)
// V144: Autonomy Brain (решения + эволюция)
// ============================================================

const express = require("express");
const path = require("path");
const GameFactoryV142 = require("./GameFactoryV142");
const creativeLoop = require("./creativeLoop");
const GameBrain = require("./gameBrain");

const app = express();
app.use(express.json());
const PORT = 3000;

// =========================
// 🌍 СОСТОЯНИЕ МИРА
// =========================
let world = {
  tick: 0,
  entropy: 0.5,
  stability: 0.65,
  consciousness: 0.3
};

// =========================
// 🧠 SWARM STATE
// =========================
let swarm = {
  tick: 0,
  entropy: 0.5,
  aliveNodes: 11,
  health: "stable"
};

// =========================
// 🏭 GAME FACTORY
// =========================
const gameFactory = new GameFactoryV142({ world, swarm });

// =========================
// 🧠 GAME BRAIN (V144)
// =========================
const gameBrain = new GameBrain(gameFactory);

// =========================
// 🔁 СИМУЛЯЦИЯ МИРА
// =========================
setInterval(() => {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.01;
  world.entropy = Math.max(0.2, Math.min(0.8, world.entropy));
  world.stability = 1 - world.entropy;
  world.consciousness = Math.min(1, world.consciousness + 0.001);
  
  swarm.tick++;
  swarm.entropy = world.entropy;
  
}, 2000);

// =========================
// 🌐 API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "🧠🚀 AI GALAXY CORE V144 — FULL AUTONOMY",
    version: "V144",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3), stability: world.stability.toFixed(3) },
    brain: gameBrain.getStats(),
    factory: gameFactory.getStatus()
  });
});

app.get("/api/status", (req, res) => {
  res.json({ world, swarm, brain: gameBrain.getStats() });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
});

// 🧠 BRAIN API
app.get("/api/brain/stats", (req, res) => {
  res.json(gameBrain.getStats());
});

app.get("/api/brain/best", (req, res) => {
  res.json(gameBrain.bestGames);
});

// 🧬 CREATIVE LOOP API
app.post("/api/creative/generate", (req, res) => {
  const count = req.body.count || 5;
  const concepts = [];
  for (let i = 0; i < count; i++) {
    const concept = creativeLoop.generateConcept();
    const evaluation = creativeLoop.evaluateConcept(concept);
    concepts.push({ concept, evaluation });
  }
  res.json({ concepts });
});

app.post("/api/creative/mutate", (req, res) => {
  const concept = req.body.concept;
  const mutated = creativeLoop.mutateConcept(concept);
  res.json({ original: concept, mutated });
});

// 🏭 FACTORY API (С ИНТЕГРАЦИЕЙ BRAIN)
app.post("/api/factory/deploy", (req, res) => {
  // 🧠 V144 BRAIN DECIDES
  const concept = gameBrain.decideNextGame(world);
  const evaluation = creativeLoop.evaluateConcept(concept);
  
  // 🏭 BUILD GAME
  const game = {
    name: `AutoGame_${Date.now()}`,
    genre: concept.genre,
    mechanics: concept.mechanics,
    coreLoop: concept.coreLoop,
    dna: concept.funDNA,
    evaluation: evaluation
  };
  
  // 📚 BRAIN LEARNS
  gameBrain.learn({
    concept: game,
    successScore: evaluation.score,
    timestamp: Date.now()
  });
  
  // 🏭 DEPLOY
  const deployed = gameFactory.deploy(world, swarm);
  
  res.json({
    deployed: true,
    game: game,
    evaluation: evaluation,
    brainStats: gameBrain.getStats()
  });
});

app.get("/api/factory/status", (req, res) => {
  res.json(gameFactory.getStatus());
});

// 🎮 Сгенерированная игра
app.get("/api/game/status", async (req, res) => {
  try {
    const axios = require("axios");
    const gameStatus = await axios.get("http://127.0.0.1:4000/api/status", { timeout: 1000 });
    res.json(gameStatus.data);
  } catch(e) {
    res.json({ status: "offline", error: e.message });
  }
});

// =========================
// 🚀 ЗАПУСК
// =========================
app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠🚀 AI GALAXY CORE V144 — FULL AUTONOMY GAME BRAIN                       ║");
  console.log("║   ✅ V142: Game Factory | ✅ V143: Creative Loop | ✅ V144: Autonomy Brain  ║");
  console.log("║   🧬 GAME EVOLUTION STACK: идеи → механики → сборка → эволюция             ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core API: http://127.0.0.1:${PORT}`);
  console.log(`🧠 Brain Stats: GET /api/brain/stats`);
  console.log(`🏆 Best Games: GET /api/brain/best`);
  console.log(`🧬 Creative Gen: POST /api/creative/generate`);
  console.log(`🏭 Deploy Game: POST /api/factory/deploy`);
  console.log(`🎮 Game Status: GET /api/game/status\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
