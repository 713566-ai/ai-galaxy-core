#!/usr/bin/env node
// ============================================================
// 🎮 AI GALAXY CORE V143 — С CREATIVE LOOP ENGINE
// ============================================================

const express = require("express");
const GameFactoryV142 = require("./GameFactoryV142");
const creativeLoop = require("./creative-loop-v143");

const app = express();
app.use(express.json());
const PORT = 3000;

// =========================
// 🌍 СОСТОЯНИЕ МИРА
// =========================
let world = {
  tick: 0,
  entropy: 0.5,
  stability: 0.65
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
// 🔁 СИМУЛЯЦИЯ
// =========================
setInterval(() => {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.01;
  world.entropy = Math.max(0.2, Math.min(0.8, world.entropy));
  world.stability = 1 - world.entropy;
  
  swarm.tick++;
  swarm.entropy = world.entropy;
  
}, 2000);

// =========================
// 🌐 API
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "🧬 AI GALAXY CORE V143 — CREATIVE LOOP",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3) },
    creativeLoop: creativeLoop.getStats()
  });
});

app.get("/api/status", (req, res) => {
  res.json({ 
    world, 
    swarm, 
    creativeLoop: creativeLoop.getStats(),
    bestPatterns: creativeLoop.getBestPatterns().slice(0, 5)
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
});

// 🧬 CREATIVE LOOP API
app.post("/api/creative/generate", (req, res) => {
  const iterations = req.body.iterations || 10;
  const best = creativeLoop.creativeLoop(iterations);
  res.json({ 
    generated: true, 
    iterations,
    best: {
      score: best.evaluation.score,
      verdict: best.evaluation.verdict,
      core_loop: best.mechanics.core_loop,
      mechanics: best.mechanics.mechanics,
      feedback: best.evaluation.feedback
    }
  });
});

app.get("/api/creative/stats", (req, res) => {
  res.json(creativeLoop.getStats());
});

app.get("/api/creative/best", (req, res) => {
  res.json(creativeLoop.getBestPatterns());
});

app.post("/api/creative/build", (req, res) => {
  const bestGame = creativeLoop.generateBestGame();
  res.json({
    built: true,
    game: bestGame
  });
});

// 🏭 GAME FACTORY API
app.post("/api/factory/deploy", (req, res) => {
  const game = gameFactory.deploy(world, swarm);
  res.json({ deployed: true, game });
});

app.get("/api/factory/status", (req, res) => {
  res.json(gameFactory.getStatus());
});

// =========================
// 🚀 ЗАПУСК
// =========================
app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧬 AI GALAXY CORE V143 — CREATIVE LOOP ENGINE                           ║");
  console.log("║   ✅ Генерация механик | ✅ Оценка интересности | ✅ Эволюция идей        ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core API: http://127.0.0.1:${PORT}`);
  console.log(`🧬 Creative Loop: POST /api/creative/generate`);
  console.log(`📊 Creative Stats: GET /api/creative/stats`);
  console.log(`🏆 Best Patterns: GET /api/creative/best`);
  console.log(`🏭 Factory Deploy: POST /api/factory/deploy\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
