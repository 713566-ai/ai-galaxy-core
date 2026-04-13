#!/usr/bin/env node
// ============================================================
// 🧠🔥 AI GALAXY CORE V148 — SELF-GENERATING GENRE ENGINE
// ============================================================

const express = require("express");
const GameDNA = require("./gameDNA");
const MutationEngine = require("./mutationEngine");
const GameSpecies = require("./gameSpecies");
const biosphere = require("./biosphere");
const brainClimate = require("./brainClimate");
const { resolveCompetition } = require("./speciesConflict");
const genreFactory = require("./genreFactory");
const industry = require("./industryV148");
const brainV148 = require("./brainV148");

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
  biosphere.tick();
  
  // 🧠 Эволюционный климат
  brainClimate.tick(biosphere);
  
  // ⚔️ Конкуренция между видами
  resolveCompetition(biosphere.species);
  
  // 📊 Эволюция индустрии (жанры)
  industry.update(biosphere, genreFactory);
  
  // 🧬 Естественное скрещивание видов
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
    const trendingGenres = industry.getTrending();
    console.log(`\n🌍 [TICK ${world.tick}] Species: ${biosphere.species.length} | Trending Genres: ${trendingGenres.length}`);
    console.log(`   🌡️ Climate: ${climate.description} | Market: ${industry.getStats().trendingGenres} active genres`);
    if (trendingGenres.length > 0) {
      console.log(`   🎭 Top Genre: ${trendingGenres[0].id} (pop: ${trendingGenres[0].popularity})`);
    }
  }
  
}, 2000);

// API
app.get("/", (req, res) => {
  res.json({
    status: "🧠🔥 AI GALAXY CORE V148 — SELF-GENERATING GENRE ENGINE",
    version: "V148",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3) },
    biosphere: biosphere.getStats(),
    industry: industry.getStats(),
    climate: brainClimate.getClimate()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    world,
    biosphere: biosphere.getStats(),
    climate: brainClimate.getClimate(),
    industry: industry.getStats(),
    trendingGenres: industry.getTrending(),
    species: biosphere.species.slice(0, 10).map(s => s.getStats())
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
});

app.post("/api/factory/deploy", (req, res) => {
  const genrePrediction = brainV148.decideNextGenre(biosphere, industry);
  
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
    predictedGenre: genrePrediction,
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

app.get("/api/genres", (req, res) => {
  res.json({
    trending: industry.getTrending(),
    stats: industry.getStats(),
    deadGenres: industry.deadGenres.slice(-10)
  });
});

app.get("/api/genres/trending", (req, res) => {
  res.json(industry.getTrending());
});

app.get("/api/genres/factory", (req, res) => {
  res.json(genreFactory.getStats());
});

app.get("/api/climate", (req, res) => {
  res.json(brainClimate.getStats());
});

app.get("/api/mutations/stats", (req, res) => {
  res.json(MutationEngine.getStats());
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠🔥 AI GALAXY CORE V148 — SELF-GENERATING GENRE ENGINE                   ║");
  console.log("║   ✅ Жанры рождаются сами | ✅ Тренды | ✅ Эволюция жанров                  ║");
  console.log("║   ✅ Игровая индустрия как эволюция идей                                    ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core: http://127.0.0.1:${PORT}`);
  console.log(`🎭 Genres: GET /api/genres`);
  console.log(`📈 Trending: GET /api/genres/trending`);
  console.log(`🧬 Deploy: POST /api/factory/deploy`);
  console.log(`🌍 Biosphere: GET /api/biosphere`);
  console.log(`🌡️ Climate: GET /api/climate\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
