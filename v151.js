class Universe {
  constructor(id) {
    this.id = id;
    this.energy = Math.random();
    this.entropy = Math.random() * 0.4;
    this.stability = Math.random();
    this.alive = true;

    this.physics = {
      gravity: Math.random(),
      timeFlow: 1 + Math.random()
    };
  }

  tick() {
    this.entropy += (Math.random() - 0.5) * 0.05;
    this.energy *= this.physics.timeFlow;

    if (this.entropy > 1.2) this.alive = false;
  }
}

class GameFactory {
  constructor() {
    this.games = [];
    this.version = 1;
  }

  createFromUniverse(u) {
    const game = {
      id: "G" + Date.now(),
      sourceUniverse: u.id,
      genre: ["rpg", "sandbox", "strategy"][Math.floor(Math.random()*3)],
      funIndex: Math.random().toFixed(3),
      population: Math.floor(Math.random()*500)
    };

    this.games.push(game);
    return game;
  }
}

class Multiverse {
  constructor(factory) {
    this.universes = [];
    this.wars = [];
    this.factory = factory;
  }

  spawn() {
    this.universes.push(new Universe("U" + Date.now()));
  }

  tick() {
    this.universes.forEach(u => u.tick());
    this.universes = this.universes.filter(u => u.alive);

    // ⚔️ wars
    if (this.universes.length > 1) {
      this.war();
    }

    // 🏭 GAME CREATION LOOP (V151 CORE)
    if (Math.random() < 0.4 && this.universes.length > 0) {
      const u = this.universes[Math.floor(Math.random()*this.universes.length)];
      const game = this.factory.createFromUniverse(u);
      console.log("🏭 NEW GAME FROM UNIVERSE:", game);
    }
  }

  war() {
    const a = this.universes[Math.floor(Math.random()*this.universes.length)];
    const b = this.universes[Math.floor(Math.random()*this.universes.length)];
    if (!a || !b || a === b) return;

    const winner = (a.energy * a.stability > b.energy * b.stability) ? a : b;
    const loser = winner === a ? b : a;

    loser.physics.gravity = winner.physics.gravity;
    loser.entropy += 0.2;

    this.wars.push({ winner: winner.id, loser: loser.id });
  }

  stats() {
    return {
      universes: this.universes.length,
      wars: this.wars.length,
      games: this.factory.games.length
    };
  }
}

// 🚀 BOOT SYSTEM
const factory = new GameFactory();
const multiverse = new Multiverse(factory);

// initial worlds
for (let i = 0; i < 3; i++) multiverse.spawn();

console.log("🌍⚡ V151 GAME FACTORY CONNECT STARTED");

setInterval(() => {
  multiverse.tick();
  console.log("📊", multiverse.stats());
}, 2000);
