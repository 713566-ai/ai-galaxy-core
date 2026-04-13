class World {
  constructor() {
    this.energy = Math.random();
    this.entropy = Math.random();
    this.games = [];
    this.tick = 0;
  }

  evolve() {
    this.tick++;

    // 🌌 natural chaos
    this.energy *= 1 + (Math.random() - 0.5) * 0.1;
    this.entropy += (Math.random() - 0.5) * 0.05;

    // 💀 collapse condition
    if (this.entropy > 1.3) {
      this.dead = true;
    }
  }
}

class Game {
  constructor(worldId) {
    this.id = "G-" + Date.now();
    this.worldId = worldId;
    this.fun = Math.random();
    this.players = Math.floor(Math.random() * 500);
    this.money = Math.random() * 100;
  }

  tick() {
    this.fun += (Math.random() - 0.5) * 0.1;
    this.money += this.players * 0.01;

    if (this.fun < 0.1) this.dead = true;
  }
}

class CoreLoop {

  constructor() {
    this.worlds = [];
    this.games = [];
    this.cycle = 0;
  }

  spawnWorld() {
    const w = new World();
    this.worlds.push(w);
  }

  spawnGame(world) {
    const g = new Game(world);
    this.games.push(g);
    world.games.push(g.id);
  }

  tick() {
    this.cycle++;

    // 🌍 WORLD STEP
    for (const w of this.worlds) {
      w.evolve();

      // 🏭 GAME CREATION
      if (Math.random() < 0.3) {
        this.spawnGame(w);
      }
    }

    // 🎮 GAME STEP
    for (const g of this.games) {
      g.tick();
    }

    // 💀 cleanup dead worlds
    this.worlds = this.worlds.filter(w => !w.dead);

    // 💀 cleanup dead games
    this.games = this.games.filter(g => !g.dead);

    // 🧬 EVOLUTION RULE
    if (this.cycle % 10 === 0) {
      this.evolution();
    }
  }

  evolution() {
    // 🧠 keep only best games
    this.games.sort((a, b) => b.fun - a.fun);

    this.games = this.games.slice(0, Math.max(1, this.games.length));

    console.log("🧬 EVOLUTION APPLIED | games:", this.games.length);
  }

  stats() {
    return {
      cycle: this.cycle,
      worlds: this.worlds.length,
      games: this.games.length
    };
  }
}

// 🚀 BOOT
const core = new CoreLoop();

// initial world
for (let i = 0; i < 3; i++) core.spawnWorld();

console.log("🌌 CORE LOOP STARTED");

setInterval(() => {
  core.tick();
  console.log("📊", core.stats());
}, 2000);
