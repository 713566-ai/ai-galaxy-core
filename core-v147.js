#!/usr/bin/env node
// ============================================================
// 🧬🌍 AI GALAXY CORE V147 — FULL AUTONOMOUS GAME SPECIES
// ============================================================

const express = require("express");
const GameDNA = require("./gameDNA");
const MutationEngine = require("./mutationEngine");
const GameSpecies = require("./gameSpecies");
const biosphere = require("./biosphere");
const brainClimate = require("./brainClimate");
const { resolveCompetition } = require("./speciesConflict");

const app = express();
app.use(express.json());
const PORT = 3000;

let world = { tick: 0, entropy: 0.5, stability: 0.65 };

// Глобальный цикл эволюции
setInterval(() => {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.01;
  world.entropy = Math.max(0.1, Math.min(0.9, world.entropy));
  world.stability = 1 - world.entropy;
  
  // 🌍 Эволюция биосферы
  const biosphereStats = biosphere.tick();
  
  // 🧠 Эволюционный климат
  brainClimate.tick(biosphere);
  
  // ⚔️ Конкуренция между видами
  const { conflicts } = resolveCompetition(biosphere.species);
  
  // 🧬 Естественное скрещивание (редко)
  if (biosphere.species.length >= 2 && Math.random() < 0.05) {
    const idx1 = Math.floor(Math.random() * biosphere.species.length);
    let idx2;
    do { idx2 = Math.floor(Math.random() * biosphere.species.length); } while (idx1 === idx2);
    
    const parent1 = biosphere.species[idx1];
    const parent2 = biosphere.species[idx2];
    
    if (!parent1.extinct && !parent2.extinct) {
      const child = parent1.crossbreed(parent2);
      biosphere.add(child);
    }
  }
  
  if (world.tick % 20 === 0) {
    const climate = brainClimate.getClimate();
    console.log(`\n🌍 [TICK ${world.tick}] Species: ${biosphere.species.length} | Biodiversity: ${biosphere.biodiversity}`);
    console.log(`   🌡️ Climate: ${climate.description} | Pressure: ${brainClimate.getPressure().toFixed(3)}`);
    console.log(`   🧬 Global Entropy: ${biosphere.globalEntropy.toFixed(3)} | Stability: ${biosphere.stability.toFixed(3)}`);
  }
  
}, 2000);

// API
app.get("/", (req, res) => {
  res.json({
    status: "🧬🌍 AI GALAXY CORE V147 — GAME SPECIES ECOSYSTEM",
    version: "V147",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3) },
    biosphere: biosphere.getStats(),
    climate: brainClimate.getClimate()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    world,
    biosphere: biosphere.getStats(),
    climate: brainClimate.getClimate(),
    species: biosphere.species.map(s => s.getStats())
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
});

app.post("/api/factory/deploy", (req, res) => {
  // Создаём случайную ДНК для нового вида
  const dna = new GameDNA({
    mechanics: ["combat", "economy", "exploration"].slice(0, 2 + Math.floor(Math.random() * 3)),
    loop: ["collect → upgrade → fight"],
    rules: ["random_events"],
    rewardSystem: ["xp"],
    complexity: 0.3 + Math.random() * 0.5,
    chaos: 0.2 + Math.random() * 0.5,
    fun: 0.4 + Math.random() * 0.4
  });
  
  const species = new GameSpecies(dna, {
    population: Math.floor(Math.random() * 30 + 10),
    fitness: 0.3 + Math.random() * 0.4
  });
  
  biosphere.add(species);
  
  res.json({
    spawned: true,
    species: {
      id: species.id,
      genre: species.genreCluster,
      population: Math.floor(species.population),
      fitness: species.fitness.toFixed(3)
    }
  });
});

app.get("/api/biosphere", (req, res) => {
  res.json(biosphere.getStats());
});

app.get("/api/biosphere/species", (req, res) => {
  res.json({
    total: biosphere.species.length,
    list: biosphere.species.map(s => s.getStats())
  });
});

app.get("/api/biosphere/extinctions", (req, res) => {
  res.json(biosphere.extinctionEvents.slice(-20));
});

app.get("/api/climate", (req, res) => {
  res.json(brainClimate.getStats());
});

app.get("/api/mutations/stats", (req, res) => {
  res.json(MutationEngine.getStats());
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧬🌍 AI GALAXY CORE V147 — FULL AUTONOMOUS GAME SPECIES ENGINE           ║");
  console.log("║   ✅ Игры как виды | ✅ Экосистема | ✅ Естественный отбор                 ║");
  console.log("║   ✅ Эволюционный климат | ✅ Конкуренция | ✅ Скрещивание                  ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core: http://127.0.0.1:${PORT}`);
  console.log(`🧬 Deploy: POST /api/factory/deploy`);
  console.log(`🌍 Biosphere: GET /api/biosphere`);
  console.log(`🧬 Species: GET /api/biosphere/species`);
  console.log(`🌡️ Climate: GET /api/climate`);
  console.log(`💀 Extinctions: GET /api/biosphere/extinctions\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
