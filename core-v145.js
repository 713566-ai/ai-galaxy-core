
// ============================================================
// 🌍🧬 AI GALAXY CORE V145 — GAME CIVILIZATION LAYER
// ============================================================
// ✅ Игры как цивилизации
// ✅ Популяция игроков
// ✅ Эволюция и войны
// ✅ Естественный отбор
// ============================================================

const express = require("express");
const GameFactoryV142 = require("./GameFactoryV142");
const creativeLoop = require("./creativeLoop");
const GameBrain = require("./gameBrain");
const GameCivilization = require("./gameCivilization");
const gameWars = require("./gameWars");

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

let swarm = { tick: 0, entropy: 0.5, aliveNodes: 11, health: "stable" };

// =========================
// 🏭 ФАБРИКА И МОЗГ
// =========================
const gameFactory = new GameFactoryV142({ world, swarm });
const gameBrain = new GameBrain(gameFactory);

// =========================
// 🌍 ЦИВИЛИЗАЦИИ ИГР
// =========================
let civilizations = [];
let nextCivilizationId = 1;

// =========================
// 🔁 ОСНОВНОЙ ЦИКЛ
// =========================
setInterval(() => {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.01;
  world.entropy = Math.max(0.2, Math.min(0.8, world.entropy));
  world.stability = 1 - world.entropy;
  world.consciousness = Math.min(1, world.consciousness + 0.001);
  
  swarm.tick++;
  swarm.entropy = world.entropy;
  
  // 🧬 ЭВОЛЮЦИЯ ЦИВИЛИЗАЦИЙ
  for (const civ of civilizations) {
    civ.tick();
  }
  
  // ⚔️ ВОЙНЫ
  gameWars.tick();
  
  // 🔄 АВТО-ВОЙНЫ МЕЖДУ ЦИВИЛИЗАЦИЯМИ
  if (civilizations.length > 1 && world.tick % 10 === 0) {
    const aliveCivs = civilizations.filter(c => c.status === "alive");
    if (aliveCivs.length >= 2) {
      const idx1 = Math.floor(Math.random() * aliveCivs.length);
      let idx2;
      do { idx2 = Math.floor(Math.random() * aliveCivs.length); } while (idx1 === idx2);
      gameWars.declareWar(aliveCivs[idx1], aliveCivs[idx2]);
    }
  }
  
  // 📊 СТАТИСТИКА
  if (world.tick % 20 === 0) {
    const aliveCount = civilizations.filter(c => c.status === "alive").length;
    const deadCount = civilizations.filter(c => c.status === "dead").length;
    const totalPopulation = civilizations.reduce((sum, c) => sum + (c.status === "alive" ? c.population : 0), 0);
    
    console.log(`\n🌍 [CIVILIZATION] Tick ${world.tick}`);
    console.log(`   🎮 Games: ${aliveCount} alive, ${deadCount} dead`);
    console.log(`   👥 Total population: ${Math.floor(totalPopulation)}`);
    console.log(`   ⚔️ Active wars: ${gameWars.getActiveWars().length}`);
  }
  
}, 2000);

// =========================
// 🌐 API
// =========================
app.get("/", (req, res) => {
  const aliveCount = civilizations.filter(c => c.status === "alive").length;
  const deadCount = civilizations.filter(c => c.status === "dead").length;
  
  res.json({
    status: "🌍🧬 AI GALAXY CORE V145 — GAME CIVILIZATION",
    version: "V145",
    world: { tick: world.tick, entropy: world.entropy.toFixed(3) },
    civilizations: { alive: aliveCount, dead: deadCount, total: civilizations.length },
    activeWars: gameWars.getActiveWars().length,
    brain: gameBrain.getStats()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    world,
    swarm,
    civilizations: civilizations.map(c => c.getStats()),
    activeWars: gameWars.getActiveWars(),
    brain: gameBrain.getStats()
  });
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

// 🏭 DEPLOY NEW GAME (РОЖДЕНИЕ ЦИВИЛИЗАЦИИ)
app.post("/api/factory/deploy", (req, res) => {
  const concept = gameBrain.decideNextGame(world);
  const evaluation = creativeLoop.evaluateConcept(concept);
  
  const game = {
    name: `Game_${nextCivilizationId++}_${Date.now()}`,
    genre: concept.genre,
    coreLoop: concept.coreLoop,
    mechanics: concept.mechanics,
    dna: concept.funDNA
  };
  
  // 🌍 РОЖДЕНИЕ НОВОЙ ЦИВИЛИЗАЦИИ
  const civ = new GameCivilization(game, nextCivilizationId);
  civilizations.push(civ);
  
  // ⚔️ АВТО-ВОЙНА С СУЩЕСТВУЮЩЕЙ ЦИВИЛИЗАЦИЕЙ
  const aliveCivs = civilizations.filter(c => c !== civ && c.status === "alive");
  if (aliveCivs.length > 0) {
    const randomEnemy = aliveCivs[Math.floor(Math.random() * aliveCivs.length)];
    gameWars.declareWar(civ, randomEnemy);
  }
  
  gameBrain.learn({
    concept: game,
    successScore: evaluation.score,
    civilizationId: civ.id
  });
  
  console.log(`🌍 [BIRTH] New game civilization: ${civ.id} (${civ.genre})`);
  
  res.json({
    deployed: true,
    game: { name: civ.id, genre: civ.genre, coreLoop: civ.coreLoop },
    evaluation: { score: evaluation.score, verdict: evaluation.verdict },
    civilization: { population: Math.floor(civ.population), funIndex: civ.funIndex.toFixed(3) }
  });
});

// 🌍 CIVILIZATIONS API
app.get("/api/civilizations", (req, res) => {
  res.json({
    total: civilizations.length,
    alive: civilizations.filter(c => c.status === "alive").length,
    dead: civilizations.filter(c => c.status === "dead").length,
    list: civilizations.map(c => c.getStats())
  });
});

app.get("/api/civilizations/:id", (req, res) => {
  const civ = civilizations.find(c => c.id === req.params.id);
  if (civ) {
    res.json(civ.getStats());
  } else {
    res.status(404).json({ error: "Civilization not found" });
  }
});

app.get("/api/civilizations/:id/history", (req, res) => {
  const civ = civilizations.find(c => c.id === req.params.id);
  if (civ) {
    res.json(civ.history);
  } else {
    res.status(404).json({ error: "Civilization not found" });
  }
});

// ⚔️ WARS API
app.get("/api/wars", (req, res) => {
  res.json({
    active: gameWars.getActiveWars(),
    history: gameWars.getWarHistory()
  });
});

app.post("/api/wars/declare", (req, res) => {
  const { gameAId, gameBId } = req.body;
  const gameA = civilizations.find(c => c.id === gameAId);
  const gameB = civilizations.find(c => c.id === gameBId);
  
  if (gameA && gameB && gameA.status === "alive" && gameB.status === "alive") {
    gameWars.declareWar(gameA, gameB);
    res.json({ declared: true, gameA: gameAId, gameB: gameBId });
  } else {
    res.status(400).json({ error: "Invalid civilizations or dead" });
  }
});

app.get("/api/factory/status", (req, res) => {
  res.json(gameFactory.getStatus());
});

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
  console.log("║   🌍🧬 AI GALAXY CORE V145 — GAME CIVILIZATION LAYER                       ║");
  console.log("║   ✅ Игры как цивилизации | ✅ Популяция | ✅ Эволюция | ✅ Войны          ║");
  console.log("║   🌍 Естественный отбор игр | 🧬 Выживает сильнейший                       ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core API: http://127.0.0.1:${PORT}`);
  console.log(`🌍 Civilizations: GET /api/civilizations`);
  console.log(`⚔️ Wars: GET /api/wars`);
  console.log(`🏭 Deploy New Game: POST /api/factory/deploy`);
  console.log(`🧬 Creative: POST /api/creative/generate`);
  console.log(`🧠 Brain Stats: GET /api/brain/stats\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});

// =========================
// 🔄 V146 - AUTO-GIT MANAGER
// =========================
const autoGit = require("./auto-git-manager");

// Запускаем авто-коммиты каждую минуту
setInterval(() => {
  autoGit.tick();
}, 60000);

// Добавляем API для Git
app.get("/api/git/stats", (req, res) => {
  res.json(autoGit.getStats());
});

app.post("/api/git/commit", async (req, res) => {
  const message = req.body.message || "Manual commit via API";
  const result = await autoGit.forceCommit(message);
  res.json({ committed: result, stats: autoGit.getStats() });
});

app.post("/api/git/push", async (req, res) => {
  const result = await autoGit.forcePush();
  res.json({ pushed: result, stats: autoGit.getStats() });
});

app.post("/api/git/sync", async (req, res) => {
  const committed = await autoGit.forceCommit("Sync commit");
  const pushed = committed ? await autoGit.forcePush() : false;
  res.json({ committed, pushed, stats: autoGit.getStats() });
});

console.log("🔄 [GIT] Auto-Git Manager integrated (commits every minute)");


// ============================
// 🧠 V154 GAME CONSCIOUSNESS LAYER
// ============================
function consciousness(game) {
  const fitness = Number(game.fitness || 0);
  const fun = Number(game.fun || 0);
  const money = Number(game.money || 0);

  // базовое "сознание"
  const awareness = (fun * 0.5 + money * 0.3 + fitness * 0.2);

  // сопротивление смерти
  const willToLive = Math.max(0, Math.tanh(awareness / 50));

  return {
    awareness,
    willToLive
  };
}

// override evolution hook
if (typeof global !== 'undefined') {
  global.V154_CONSCIOUSNESS = true;
}


// ============================
// 🧬 V155 MEMORY GENOME LAYER
// ============================

// глобальная память эволюции
if (!global._genomeMemory) {
  global._genomeMemory = new Map();
}

// сохраняем опыт игры
function storeGenome(game) {
  const id = game.id;

  if (!global._genomeMemory.has(id)) {
    global._genomeMemory.set(id, []);
  }

  const memory = global._genomeMemory.get(id);

  memory.push({
    fun: Number(game.fun || 0),
    money: Number(game.money || 0),
    fitness: Number(game.fitness || 0),
    tick: Date.now()
  });

  // ограничиваем память
  if (memory.length > 20) memory.shift();

  return memory;
}

// извлекаем "генетическую память"
function readGenome(game) {
  const memory = global._genomeMemory.get(game.id) || [];

  if (memory.length === 0) {
    return { stability: 0, adaptation: 0 };
  }

  let avgFun = 0;
  let avgFitness = 0;

  for (const m of memory) {
    avgFun += m.fun;
    avgFitness += m.fitness;
  }

  avgFun /= memory.length;
  avgFitness /= memory.length;

  const stability = Math.tanh(avgFitness / 50);
  const adaptation = Math.tanh(avgFun / 50);

  return {
    stability,
    adaptation,
    memorySize: memory.length
  };
}

// подключаем в глобальный флаг
if (typeof global !== 'undefined') {
  global.V155_MEMORY_GENOME = true;
}


// ============================
// 🧬 V156 PREDATOR–PREY LAYER
// ============================

if (!global._ecosystem) {
  global._ecosystem = {
    predators: new Set(),
    prey: new Set()
  };
}

// назначаем роль игре
function assignRole(game) {
  const score = Number(game.fitness || game.fun || 0);

  if (score > 30) {
    global._ecosystem.predators.add(game.id);
    return "predator";
  } else {
    global._ecosystem.prey.add(game.id);
    return "prey";
  }
}

// охота хищника
function hunt(predator, preyGame) {
  const gain = Number(preyGame.money || 0) * 0.4;

  predator.money = (Number(predator.money || 0) + gain);
  preyGame.money = Math.max(0, Number(preyGame.money || 0) - gain);

  // если ресурсы упали → смерть
  if (preyGame.money <= 0) {
    preyGame.dead = true;
  }

  return { gain };
}

// эволюционное давление
function applyPredation(games) {
  const predators = games.filter(g => global._ecosystem.predators.has(g.id));
  const prey = games.filter(g => global._ecosystem.prey.has(g.id));

  for (const p of predators) {
    const target = prey[Math.floor(Math.random() * prey.length)];
    if (target && !target.dead) {
      hunt(p, target);
    }
  }
}

// hook в глобал
if (typeof global !== 'undefined') {
  global.V156_PREDATOR_PREY = true;
}



// ============================
// 🧠 V157 COLLECTIVE BRAIN LAYER
// ============================

if (!global._collectiveBrain) {
  global._collectiveBrain = {
    sharedMemory: [],
    knowledge: new Map()
  };
}

// запись опыта в общий мозг
function shareExperience(game) {
  global._collectiveBrain.sharedMemory.push({
    id: game.id,
    fun: Number(game.fun || 0),
    fitness: Number(game.fitness || 0),
    money: Number(game.money || 0),
    t: Date.now()
  });

  if (global._collectiveBrain.sharedMemory.length > 100) {
    global._collectiveBrain.sharedMemory.shift();
  }
}

// извлечение коллективного опыта
function getCollectiveWisdom() {
  const mem = global._collectiveBrain.sharedMemory;

  if (mem.length === 0) return { avgFitness: 0, avgFun: 0 };

  let f = 0, u = 0;

  for (const m of mem) {
    f += m.fitness;
    u += m.fun;
  }

  return {
    avgFitness: f / mem.length,
    avgFun: u / mem.length,
    size: mem.length
  };
}

// влияние коллективного мозга на игру
function applyCollectiveBrain(game) {
  const wisdom = getCollectiveWisdom();

  const boost = (wisdom.avgFitness * 0.3 + wisdom.avgFun * 0.2);

  game.fitness = Number(game.fitness || 0) + boost * 0.01;
  game.fun = Number(game.fun || 0) + boost * 0.005;

  return game;
}

// hook
if (typeof global !== 'undefined') {
  global.V157_COLLECTIVE_BRAIN = true;
}



// ============================
// 🌌 V158 WORLD PHYSICS ENGINE
// ============================

if (!global._worldPhysics) {
  global._worldPhysics = {
    energy: 1000,
    entropy: 0.5,
    tick: 0
  };
}

// обновление физики мира
function updateWorldPhysics(games) {
  const world = global._worldPhysics;

  world.tick++;

  // суммарная активность игр
  let totalEnergyUse = 0;
  let alive = 0;

  for (const g of games) {
    if (!g.dead) {
      alive++;
      totalEnergyUse += Number(g.money || 0) * 0.01;
    }
  }

  // закон сохранения энергии
  world.energy -= totalEnergyUse * 0.05;

  // восстановление энергии мира
  world.energy += Math.sin(world.tick * 0.01) * 2;

  // энтропия растёт при хаосе
  world.entropy = Math.min(
    1,
    world.entropy + (alive < 10 ? 0.01 : -0.005)
  );

  // стабилизация
  if (world.energy < 0) world.energy = 0;
  if (world.energy > 2000) world.energy = 2000;

  return world;
}

// влияние мира на игры
function applyWorldPhysics(game) {
  const world = global._worldPhysics;

  const energyFactor = world.energy / 1000;
  const entropyFactor = 1 - world.entropy;

  game.fitness =
    Number(game.fitness || 0) * energyFactor * entropyFactor;

  game.fun =
    Number(game.fun || 0) * (0.8 + energyFactor * 0.2);

  return game;
}

// hook
if (typeof global !== 'undefined') {
  global.V158_WORLD_PHYSICS = true;
}

