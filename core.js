#!/usr/bin/env node
// ============================================================
// 🎮 AI GALAXY CORE V141 — GAME FACTORY LAYER
// ============================================================
// ✅ Интеграция Game Factory в ядро
// ✅ Авто-генерация игр из состояния мира
// ✅ API для создания, списка и экспорта игр
// ============================================================

const express = require("express");
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
  ],
  agents: [
    { name: "codey", fitness: 0.88, isGod: true },
    { name: "uiax", fitness: 0.65, isGod: false },
    { name: "garlic", fitness: 0.45, isGod: false },
    { name: "nova", fitness: 0.70, isGod: false }
  ],
  conflicts: 2
};

// =========================
// 🧠 SWARM STATE (симуляция)
// =========================
let swarm = {
  tick: 0,
  entropy: 0.5,
  warfareAlive: 11,
  aliveNodes: 11,
  health: "stable"
};

// =========================
// 🧠 BRAIN STATE
// =========================
let brain = {
  learning: 0.15,
  decisions: []
};

// =========================
// 🏭 V141 GAME FACTORY LAYER
// =========================
class GameFactory {
  constructor(world, swarm, brain) {
    this.world = world;
    this.swarm = swarm;
    this.brain = brain;
    this.blueprints = [];
    this.builtGames = [];
  }

  // 🧠 1. Генерация игрового blueprint из мира
  generateBlueprint() {
    const blueprint = {
      id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      genre: this.pickGenre(),
      mechanics: this.extractMechanics(),
      difficulty: this.calculateDifficulty(),
      worldSeed: this.world?.tick || 0,
      entities: this.swarm?.aliveNodes || 0,
      rules: this.generateRules(),
      createdAt: new Date().toISOString()
    };

    this.blueprints.push(blueprint);
    console.log(`📐 [BLUEPRINT] Created: ${blueprint.id} (${blueprint.genre})`);
    return blueprint;
  }

  // 🎮 2. Выбор жанра на основе состояния системы
  pickGenre() {
    const entropy = this.swarm?.entropy || 0.5;
    const stability = this.world?.stability || 0.5;

    if (stability > 0.7 && entropy < 0.4) return "strategy";
    if (entropy < 0.5) return "rpg";
    if (entropy < 0.7) return "platformer";
    if (entropy < 0.85) return "survival";
    return "chaos_sandbox";
  }

  // ⚙️ 3. Механики из состояния мира
  extractMechanics() {
    const mechanics = ["resource_management"];
    
    if (this.swarm?.warfareAlive > 5) mechanics.push("combat_system");
    if (this.world?.conflicts > 1) mechanics.push("diplomacy");
    if (this.world?.empires?.length > 2) mechanics.push("faction_system");
    if (this.brain?.learning > 0.1) mechanics.push("adaptive_ai");
    if (this.world?.agents?.length > 3) mechanics.push("character_progression");
    
    return mechanics;
  }

  // 📊 4. Сложность
  calculateDifficulty() {
    const base = this.swarm?.entropy || 0.5;
    const factor = this.world?.stability ? (1 - this.world.stability) : 0.3;
    return Math.min(0.95, Math.max(0.05, base + factor * 0.3));
  }

  // 📜 5. Генерация правил игры
  generateRules() {
    return {
      winCondition: this.world?.stability > 0.7 ? "achieve_dominance" : "survive_and_expand",
      loseCondition: "system_collapse",
      tickRate: 1000,
      aiInfluence: this.brain?.learning || 0.1,
      maxPlayers: Math.floor(10 + (this.swarm?.aliveNodes || 0) * 2),
      startingResources: 500 + Math.floor(this.world?.empires[0]?.wealth / 10 || 100)
    };
  }

  // 🧱 6. СБОРКА ИГРЫ
  buildGame(blueprint) {
    const game = {
      ...blueprint,
      status: "built",
      runtime: {
        score: 0,
        players: [],
        state: "initialized",
        version: "1.0"
      },
      buildAt: new Date().toISOString()
    };

    this.builtGames.push(game);
    console.log(`🔨 [BUILD] Game built: ${game.id}`);
    return game;
  }

  // 🚀 7. ПОЛНЫЙ PIPELINE
  createGame() {
    const blueprint = this.generateBlueprint();
    const game = this.buildGame(blueprint);
    
    console.log(`🏭 [GAME FACTORY] Game created: ${game.id} (${game.genre})`);
    return game;
  }

  // 📦 8. EXPORT (структура для сборки клиента)
  exportGame(gameId) {
    const game = this.builtGames.find(g => g.id === gameId);
    if (!game) return null;

    const exportData = {
      bundle: {
        id: game.id,
        game: {
          genre: game.genre,
          mechanics: game.mechanics,
          rules: game.rules,
          difficulty: game.difficulty
        },
        client: {
          type: "web",
          entryPoint: "index.html",
          assets: ["game.js", "style.css"]
        },
        server: {
          type: "node",
          entryPoint: "server.js",
          port: 4000
        },
        version: "V141"
      },
      metadata: {
        exportedAt: new Date().toISOString(),
        sourceWorldTick: this.world?.tick,
        swarmHealth: this.swarm?.health
      }
    };
    
    console.log(`📦 [EXPORT] Game ${gameId} ready for export`);
    return exportData;
  }
  
  // 📋 Получить все игры
  getAllGames() {
    return this.builtGames.map(g => ({
      id: g.id,
      genre: g.genre,
      status: g.status,
      createdAt: g.createdAt,
      mechanics: g.mechanics.length
    }));
  }
  
  // 📊 Статистика фабрики
  getStats() {
    return {
      totalBlueprints: this.blueprints.length,
      totalGames: this.builtGames.length,
      genres: [...new Set(this.builtGames.map(g => g.genre))],
      lastGame: this.builtGames[this.builtGames.length - 1]?.id || null
    };
  }
}

// =========================
// 🏭 ИНИЦИАЛИЗАЦИЯ ФАБРИКИ
// =========================
const gameFactory = new GameFactory(world, swarm, brain);

// =========================
// 🔁 СИМУЛЯЦИЯ МИРА (тик)
// =========================
setInterval(() => {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.01;
  world.entropy = Math.max(0.2, Math.min(0.8, world.entropy));
  world.stability = 1 - world.entropy;
  
  swarm.tick++;
  swarm.entropy = world.entropy;
  
  // Авто-генерация игр каждые 20 тиков
  if (world.tick % 20 === 0 && world.tick > 0) {
    gameFactory.createGame();
  }
  
  if (world.tick % 10 === 0) {
    console.log(`🌍 [WORLD] tick:${world.tick} | entropy:${world.entropy.toFixed(3)} | games:${gameFactory.builtGames.length}`);
  }
  
}, 2000);

// =========================
// 🌐 API
// =========================

// Статус
app.get("/", (req, res) => {
  res.json({
    status: "🎮 AI GALAXY CORE V141",
    world: {
      tick: world.tick,
      entropy: world.entropy.toFixed(3),
      stability: world.stability.toFixed(3),
      empires: world.empires.length,
      agents: world.agents.length
    },
    swarm: {
      health: swarm.health,
      aliveNodes: swarm.aliveNodes
    },
    factory: gameFactory.getStats()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    world,
    swarm,
    factory: gameFactory.getStats()
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, tick: world.tick });
});

// 🏭 GAME FACTORY API
app.get("/api/factory/create", (req, res) => {
  const game = gameFactory.createGame();
  res.json(game);
});

app.get("/api/factory/list", (req, res) => {
  res.json({
    total: gameFactory.builtGames.length,
    games: gameFactory.getAllGames()
  });
});

app.get("/api/factory/export/:id", (req, res) => {
  const exportData = gameFactory.exportGame(req.params.id);
  if (exportData) {
    res.json(exportData);
  } else {
    res.status(404).json({ error: "Game not found" });
  }
});

app.get("/api/factory/stats", (req, res) => {
  res.json(gameFactory.getStats());
});

app.get("/api/factory/blueprints", (req, res) => {
  res.json(gameFactory.blueprints.slice(-10));
});

// =========================
// 🚀 ЗАПУСК
// =========================
app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🎮 AI GALAXY CORE V141 — GAME FACTORY LAYER                              ║");
  console.log("║   ✅ Авто-генерация игр | ✅ Blueprint система | ✅ Export-ready           ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Core API: http://127.0.0.1:${PORT}`);
  console.log(`🏭 Create Game: GET /api/factory/create`);
  console.log(`📋 List Games: GET /api/factory/list`);
  console.log(`📦 Export Game: GET /api/factory/export/:id`);
  console.log(`📊 Factory Stats: GET /api/factory/stats`);
  console.log(`📐 Blueprints: GET /api/factory/blueprints\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  process.exit();
});
