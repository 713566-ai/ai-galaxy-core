const express = require("express");
const app = express();
app.use(express.json());

// ==========================
// 🧬 CORE STATE
// ==========================
let state = {
  tick: 0,
  dnaPool: [],
  games: [],
  stats: {
    births: 0,
    deaths: 0,
    mutations: 0
  }
};

// ==========================
// 🧬 GAME DNA ENGINE
// ==========================
function createDNA(parent = null) {
  const base = parent?.dna || null;

  const dna = {
    id: "DNA-" + Date.now() + "-" + Math.floor(Math.random()*999),
    speed: base ? base.speed + rand(-0.1,0.1) : rand(0,1),
    economy: base ? base.economy + rand(-0.1,0.1) : rand(0,1),
    fun: base ? base.fun + rand(-0.1,0.1) : rand(0,1),
    chaos: base ? base.chaos + rand(-0.1,0.1) : rand(0,1),
    generation: base ? base.generation + 1 : 1
  };

  return dna;
}

// ==========================
// 🎮 GAME CREATION
// ==========================
function spawnGame(parent = null) {
  const dna = createDNA(parent);

  const game = {
    id: "G-" + Date.now() + "-" + Math.floor(Math.random()*999),
    dna,
    energy: 1,
    alive: true,
    age: 0
  };

  state.games.push(game);
  state.stats.births++;
  return game;
}

// ==========================
// 🧬 SELECTION PRESSURE
// ==========================
function evaluateFitness(game) {
  const d = game.dna;

  const fitness =
    d.fun * 0.4 +
    d.economy * 0.3 +
    d.speed * 0.2 +
    (1 - d.chaos) * 0.1;

  return fitness * game.energy;
}

// ==========================
// ☠️ NATURAL SELECTION
// ==========================
function selection() {
  state.games.forEach(g => {
    const fitness = evaluateFitness(g);

    g.age++;
    g.energy -= 0.01;

    if (fitness < 0.3 || g.energy <= 0) {
      g.alive = false;
      state.stats.deaths++;
    }
  });

  // remove dead
  state.games = state.games.filter(g => g.alive);

  // keep ecosystem alive
  if (state.games.length < 3) {
    spawnGame();
  }
}

// ==========================
// 🧬 MUTATION + REPRODUCTION
// ==========================
function evolve() {
  state.games.forEach(g => {
    if (Math.random() < 0.3) {
      g.dna.fun += rand(-0.05, 0.05);
      g.dna.economy += rand(-0.05, 0.05);
      state.stats.mutations++;
    }
  });

  // reproduction of best
  const sorted = [...state.games].sort((a,b)=>evaluateFitness(b)-evaluateFitness(a));

  if (sorted[0] && Math.random() < 0.5) {
    spawnGame(sorted[0]);
  }
}

// ==========================
// 🌍 WORLD LOOP
// ==========================
function loop() {
  state.tick++;

  // birth cycle
  if (state.tick % 3 === 0) spawnGame();

  // evolution cycle
  if (state.tick % 5 === 0) evolve();

  // selection pressure
  selection();

  console.log("🧬 TICK", state.tick,
    "games:", state.games.length,
    "births:", state.stats.births,
    "deaths:", state.stats.deaths,
    "mutations:", state.stats.mutations
  );
}

// ==========================
// 🌍 API
// ==========================
app.get("/api/status", (req,res)=>{
  res.json(state);
});

app.get("/api/fitness", (req,res)=>{
  res.json(state.games.map(g => ({
    id: g.id,
    fitness: evaluateFitness(g),
    dna: g.dna,
    age: g.age
  })));
});

app.post("/api/spawn", (req,res)=>{
  res.json({ spawned: true, game: spawnGame() });
});

// ==========================
// 🚀 START
// ==========================
app.listen(3000, ()=>{
  console.log("🚀 V152 GAME DNA EVOLUTION ONLINE http://127.0.0.1:3000");
  setInterval(loop, 1000);
});

// ==========================
function rand(min,max){
  return Math.random()*(max-min)+min;
}
