/**
 * V153 — GAME DNA + SELECTION PRESSURE CORE
 * Autonomous evolution system for games
 */

// =========================
// 🧬 GAME DNA MODEL
// =========================
class GameDNA {
  constructor() {
    this.mechanics = [];
    this.loopSpeed = Math.random() * 1000;
    this.rewardCurve = Math.random() * 2;
    this.difficulty = 1 + Math.random() * 10;
    this.funGene = Math.random();
    this.stabilityGene = Math.random();
    this.mutationRate = 0.05;
  }
}

// =========================
// 🎮 GAME ENTITY
// =========================
class Game {
  constructor(id) {
    this.id = id;
    this.dna = new GameDNA();
    this.fun = Math.random();
    this.money = 10 + Math.random() * 10;
    this.entropy = Math.random();
    this.dead = false;
    this.fitness = 0;
  }

  tick() {
    if (this.dead) return;

    this.fun += (Math.random() - 0.5) * this.dna.funGene;
    this.money += Math.random() * this.dna.rewardCurve;
    this.entropy += (Math.random() - 0.5) * 0.1;
  }

  mutate() {
    this.dna.funGene += (Math.random() - 0.5) * 0.1;
    this.dna.rewardCurve *= 0.9 + Math.random() * 0.2;
    this.dna.difficulty += (Math.random() - 0.5) * 1;
    this.dna.mutationRate = Math.min(0.5, this.dna.mutationRate + 0.01);
  }
}

// =========================
// 🧬 MUTATION ENGINE
// =========================
function mutateDNA(dna) {
  return {
    ...dna,
    funGene: dna.funGene + (Math.random() - 0.5) * 0.1,
    difficulty: Math.max(1, dna.difficulty + (Math.random() - 0.5) * 1),
    rewardCurve: dna.rewardCurve * (0.9 + Math.random() * 0.2),
    mutationRate: Math.min(0.5, dna.mutationRate + 0.01)
  };
}

// =========================
// ⚔️ SELECTION PRESSURE LOOP
// =========================
function coreLoop(world) {
  const THRESHOLD_LOW = 0.5;
  const EXTINCTION_LEVEL = 0.2;
  const REPRODUCE_LEVEL = 1.5;

  for (let game of world.games) {
    if (game.dead) continue;

    game.tick();

    game.fitness =
      (game.fun * game.money) /
      (world.entropy + 0.01);

    if (game.fitness < THRESHOLD_LOW) {
      game.mutate();
    }

    if (game.fitness < EXTINCTION_LEVEL) {
      game.dead = true;
    }

    if (game.fitness > REPRODUCE_LEVEL) {
      const child = new Game("G-" + Date.now());
      child.dna = mutateDNA(game.dna);
      world.games.push(child);
    }
  }

  world.entropy += (Math.random() - 0.5) * 0.05;
}

// =========================
// 🌍 EXPORT
// =========================
module.exports = {
  Game,
  GameDNA,
  coreLoop,
  mutateDNA
};

// =========================
// 🚀 AUTO TEST RUNNER
// =========================
if (require.main === module) {
  console.log("🧬 V153 TEST START");

  const { Game, coreLoop } = module.exports;

  const world = {
    entropy: 0.5,
    games: [
      new Game("G-TEST-1"),
      new Game("G-TEST-2"),
      new Game("G-TEST-3")
    ]
  };

  for (let i = 0; i < 10; i++) {
    coreLoop(world);

    console.log("CYCLE:", i);
    console.log(
      world.games.map(g => ({
        id: g.id,
        fun: g.fun.toFixed(3),
        money: g.money.toFixed(2),
        fitness: g.fitness?.toFixed(3),
        dead: g.dead
      }))
    );
  }

  console.log("🧬 V153 TEST COMPLETE");
}
