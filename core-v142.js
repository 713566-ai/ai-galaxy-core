#!/usr/bin/env node
// ============================================================
// 🎮 AI GALAXY CORE V142 — С ИНТЕГРИРОВАННОЙ GAME FACTORY
// ============================================================

const express = require("express");
const GameFactoryV142 = require("./GameFactoryV142");

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
  empires: [
    { id: "E1", name: "Aurora", strength: 0.75, wealth: 1500, god: "codey" },
    { id: "E2", name: "Obsidian", strength: 0.55, wealth: 1000, god: null },
    { id: "E3", name: "Nexus", strength: 0.65, wealth: 1200, god: null }
  ]
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
    status: "🎮 AI GALAXY CORE V142",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3) },
    factory: gameFactory.getStatus()
  });
});

app.get("/api/status", (req, res) => {
  res.json({ world, swarm, factory: gameFactory.getStatus() });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
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
  console.log("║   🏭 AI GALAXY CORE V142 — GAME FACTORY ENGINE                            ║");
  console.log("║   ✅ DESIGN → COMPOSE → BUILD → RUN                                       ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core API: http://127.0.0.1:${PORT}`);
  console.log(`🏭 Deploy Game: POST /api/factory/deploy`);
  console.log(`📊 Factory Status: GET /api/factory/status\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
