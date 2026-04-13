#!/usr/bin/env node
// ============================================================
// 🧬🔥 AI GALAXY CORE V146 — GAME DNA + MUTATION ENGINE
// ============================================================

const express = require("express");
const GameFactoryV142 = require("./GameFactoryV142");
const creativeLoop = require("./creativeLoop");
const GameBrain = require("./gameBrain");
const GameDNA = require("./gameDNA");
const MutationEngine = require("./mutationEngine");
const GameCivilizationV146 = require("./gameCivilizationV146");

const app = express();
app.use(express.json());
const PORT = 3000;

let world = { tick: 0, entropy: 0.5, stability: 0.65 };
let swarm = { tick: 0, entropy: 0.5, aliveNodes: 11 };
let civilizations = [];

const gameFactory = new GameFactoryV142({ world, swarm });
const gameBrain = new GameBrain(gameFactory);

setInterval(() => {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.01;
  world.entropy = Math.max(0.2, Math.min(0.8, world.entropy));
  world.stability = 1 - world.entropy;
  
  // 🧬 Эволюция цивилизаций
  for (const civ of civilizations) {
    civ.tick();
  }
  
  // 💀 Удаление мёртвых
  civilizations = civilizations.filter(c => c.alive);
  
  // 🧬 Естественное размножение
  if (civilizations.length >= 2 && Math.random() < 0.1) {
    const parent1 = civilizations[Math.floor(Math.random() * civilizations.length)];
    const parent2 = civilizations[Math.floor(Math.random() * civilizations.length)];
    if (parent1 !== parent2) {
      const child = parent1.breed(parent2);
      civilizations.push(child);
      console.log(`🧬 [BREED] New game born: ${child.id} (${child.genre})`);
    }
  }
  
  if (world.tick % 20 === 0) {
    console.log(`\n🌍 [TICK ${world.tick}] Games: ${civilizations.length} alive | Total mutations: ${MutationEngine.getStats().totalMutations}`);
  }
  
}, 2000);

app.get("/", (req, res) => {
  res.json({
    status: "🧬🔥 AI GALAXY CORE V146 — GAME DNA + MUTATION",
    version: "V146",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3) },
    civilizations: { alive: civilizations.length, total: civilizations.length },
    mutations: MutationEngine.getStats()
  });
});

app.get("/api/status", (req, res) => {
  res.json({ world, swarm, civilizations: civilizations.map(c => c.getStats()) });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
});

app.post("/api/factory/deploy", (req, res) => {
  const concept = gameBrain.decideNextGame(world);
  
  const dna = new GameDNA({
    mechanics: [concept.mechanics[0] || "combat"],
    loop: [concept.coreLoop],
    rules: ["random_events"],
    rewardSystem: ["xp"],
    complexity: Math.random() * 0.8 + 0.2,
    chaos: Math.random() * 0.6,
    fun: 0.5
  });
  
  const game = {
    name: `Game_${civilizations.length + 1}_${Date.now()}`,
    genre: concept.genre
  };
  
  const civ = new GameCivilizationV146(game, dna);
  civilizations.push(civ);
  
  res.json({
    deployed: true,
    game: { name: civ.id, genre: civ.genre, dna: dna.getSummary() }
  });
});

app.get("/api/civilizations", (req, res) => {
  res.json({
    total: civilizations.length,
    alive: civilizations.filter(c => c.alive).length,
    list: civilizations.map(c => c.getStats())
  });
});

app.get("/api/civilizations/:id", (req, res) => {
  const civ = civilizations.find(c => c.id === req.params.id);
  if (civ) res.json(civ.getStats());
  else res.status(404).json({ error: "Not found" });
});

app.get("/api/mutations/stats", (req, res) => {
  res.json(MutationEngine.getStats());
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧬🔥 AI GALAXY CORE V146 — GAME DNA + MUTATION ENGINE                    ║");
  console.log("║   ✅ Игры как живые организмы | ✅ Мутации | ✅ Эволюция | ✅ Скрещивание  ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core: http://127.0.0.1:${PORT}`);
  console.log(`🧬 Deploy: POST /api/factory/deploy`);
  console.log(`🌍 Civilizations: GET /api/civilizations`);
  console.log(`🧬 Mutations stats: GET /api/mutations/stats\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
