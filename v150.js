class Universe {
  constructor(id) {
    this.id = id;
    this.energy = Math.random();
    this.entropy = Math.random() * 0.5;
    this.stability = Math.random();
    this.alive = true;
    this.physics = { gravity: Math.random(), timeFlow: 1 + Math.random() };
  }
  tick() {
    this.entropy += (Math.random() - 0.5) * 0.05;
    this.energy *= this.physics.timeFlow;
    if (this.entropy > 1.2) this.alive = false;
  }
}

class Multiverse {
  constructor() {
    this.universes = [];
    this.wars = [];
  }
  spawn() {
    this.universes.push(new Universe("U" + Date.now()));
  }
  tick() {
    this.universes.forEach(u => u.tick());
    this.universes = this.universes.filter(u => u.alive);
    if (this.universes.length > 1) this.war();
  }
  war() {
    const a = this.universes[Math.floor(Math.random() * this.universes.length)];
    const b = this.universes[Math.floor(Math.random() * this.universes.length)];
    if (!a || !b || a === b) return;

    const winner = (a.energy * a.stability > b.energy * b.stability) ? a : b;
    const loser = winner === a ? b : a;

    loser.physics.gravity = winner.physics.gravity;
    loser.entropy += 0.2;

    this.wars.push({ winner: winner.id, loser: loser.id });
  }
  stats() {
    return { universes: this.universes.length, wars: this.wars.length };
  }
}

const multiverse = new Multiverse();
for (let i = 0; i < 3; i++) multiverse.spawn();

console.log("🌌 V150 MULTIVERSE ACTIVE");

setInterval(() => {
  multiverse.tick();
  console.log("📊", multiverse.stats());
}, 2000);
