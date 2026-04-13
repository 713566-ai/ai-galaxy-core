class Brain {

  decide(state) {
    const { worlds, games, cycle } = state;

    return {
      spawnWorld: worlds.length < 3 ? 1 : Math.random() < 0.2,
      spawnGame: Math.random() < 0.5,
      forceEvolution: cycle % 5 === 0,
      purgeWeak: games.length > 5
    };
  }

  mood(state) {
    if (state.games.length > 10) return "OVERLOAD";
    if (state.worlds.length < 2) return "EXPANDING";
    return "STABLE";
  }
}

class World {
  constructor() {
    this.energy = Math.random();
    this.entropy = Math.random();
    this.dead = false;
    this.games = [];
  }

  tick() {
    this.energy *= 1 + (Math.random() - 0.5) * 0.1;
    this.entropy += (Math.random() - 0.5) * 0.05;
    if (this.entropy > 1.3) this.dead = true;
  }
}

class Game {
  constructor(worldId) {
    this.id = "G-" + Date.now();
    this.worldId = worldId;
    this.fun = Math.random();
    this.money = 10;
    this.dead = false;
  }

  tick() {
    this.fun += (Math.random() - 0.5) * 0.1;
    this.money += this.fun;

    if (this.fun < 0.05) this.dead = true;
  }
}

class Core {

  constructor() {
    this.brain = new Brain();
    this.worlds = [];
    this.games = [];
    this.cycle = 0;
  }

  spawnWorld() {
    this.worlds.push(new World());
  }

  spawnGame(world) {
    const g = new Game(world);
    this.games.push(g);
    world.games.push(g.id);
  }

  tick() {
    this.cycle++;

    // 🧠 BRAIN DECISION
    const decision = this.brain.decide(this.state());

    // 🌍 WORLD LOGIC
    if (decision.spawnWorld) this.spawnWorld();

    for (const w of this.worlds) {
      w.tick();

      if (decision.spawnGame) {
        this.spawnGame(w);
      }
    }

    // 🎮 GAME LOGIC
    for (const g of this.games) {
      g.tick();
    }

    // 🧬 EVOLUTION CONTROLLED BY BRAIN
    if (decision.forceEvolution) {
      this.evolution();
    }

    // 💀 PURGE CONTROLLED BY BRAIN
    if (decision.purgeWeak) {
      this.games.sort((a,b)=>b.fun-a.fun);
      this.games = this.games.slice(0, 5);
    }

    // cleanup
    this.worlds = this.worlds.filter(w => !w.dead);
    this.games = this.games.filter(g => !g.dead);

    // 📊 OUTPUT
    console.log("🧠 BRAIN:", this.brain.mood(this.state()));
    console.log("📊", this.state());
  }

  evolution() {
    this.games.sort((a,b)=>b.fun-a.fun);
    this.games = this.games.slice(0, Math.max(1, this.games.length));
    console.log("🧬 EVOLUTION TRIGGERED");
  }

  state() {
    return {
      worlds: this.worlds,
      games: this.games,
      cycle: this.cycle
    };
  }
}

// 🚀 BOOT
const core = new Core();

for (let i = 0; i < 3; i++) core.spawnWorld();

console.log("🌌 CORE + AI BRAIN CONNECTED STARTED");

setInterval(() => {
  core.tick();
}, 2000);
