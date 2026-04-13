const express = require("express");
const app = express();
app.use(express.json());

// =====================
// 🧠 CORE STATE
// =====================
let state = {
  tick: 0,
  brain: { stability: "STABLE", learning: 0, mood: 0.5 },
  worlds: [],
  games: [],
};

// =====================
// 🎮 GAME FACTORY
// =====================
function createGame() {
  const id = "G-" + Date.now();
  const game = {
    id,
    fun: Math.random(),
    money: 10 + Math.random() * 5,
    dead: false
  };
  state.games.push(game);
  return game;
}

// =====================
// 🧬 EVOLUTION / MUTATION
// =====================
function mutate() {
  state.games.forEach(g => {
    g.fun += (Math.random() - 0.5) * 0.1;
    g.money += (Math.random() - 0.3) * 0.2;
    if (g.fun < 0) g.dead = true;
  });
}

// =====================
// 🧠 AI BRAIN LOOP
// =====================
function brainLoop() {
  state.tick++;

  state.brain.learning += Math.random() * 0.02;
  state.brain.mood = 0.5 + Math.sin(state.tick / 5) * 0.5;

  if (state.tick % 3 === 0) createGame();
  if (state.tick % 5 === 0) mutate();

  console.log("🧠 TICK", state.tick, {
    games: state.games.length,
    learning: state.brain.learning.toFixed(3),
    mood: state.brain.mood.toFixed(3)
  });
}

// =====================
// 🌍 API CORE
// =====================
app.get("/api/status", (req,res)=>{
  res.json(state);
});

app.post("/api/factory/deploy", (req,res)=>{
  res.json({ deployed: true, game: createGame() });
});

app.get("/api/brain", (req,res)=>{
  res.json(state.brain);
});

// =====================
// 🚀 START SYSTEM
// =====================
app.listen(3000, ()=>{
  console.log("🚀 V151 CORE ONLINE http://127.0.0.1:3000");

  setInterval(brainLoop, 1000);
});
