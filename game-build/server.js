const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

let state = {
  tick: 0,
  entropy: 0.45,
  players: 42,
  empires: [
    { name: "Aurora", strength: 0.75, god: "codey" },
    { name: "Obsidian", strength: 0.55, god: null },
    { name: "Nexus", strength: 0.65, god: null }
  ],
  agents: [
    { name: "codey", fitness: 0.88, isGod: true },
    { name: "uiax", fitness: 0.65, isGod: false },
    { name: "garlic", fitness: 0.45, isGod: false },
    { name: "nova", fitness: 0.70, isGod: false }
  ],
  events: []
};

setInterval(() => {
  state.tick++;
  state.entropy += (Math.random() - 0.5) * 0.01;
  state.entropy = Math.max(0.2, Math.min(0.8, state.entropy));
}, 1000);

// API
app.get("/", (req, res) => res.json({ status: "game", ...state }));
app.get("/api/status", (req, res) => res.json(state));
app.get("/api/ping", (req, res) => res.json({ online: true, tick: state.tick }));

// 🌍 WORLD SYNC ENDPOINT
app.post("/api/world", (req, res) => {
  const world = req.body;
  
  if (world.empires && world.empires.length > 0) {
    state.empires = world.empires;
    console.log(`🌍 World synced: ${state.empires.length} empires, ${state.agents.length} agents`);
  }
  
  if (world.agents && world.agents.length > 0) {
    state.agents = world.agents;
  }
  
  if (world.events) {
    state.events = world.events.slice(-20);
  }
  
  res.json({ ok: true, synced: true });
});

app.listen(PORT, () => {
  console.log(`🎮 Game server on http://localhost:${PORT}`);
});
