const express = require("express");
const app = express();
app.use(express.json());

let state = {
  tick: 0,
  entropy: 0.45,
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
  ]
};

setInterval(() => {
  state.tick++;
  state.entropy += (Math.random() - 0.5) * 0.01;
  state.entropy = Math.max(0.2, Math.min(0.8, state.entropy));
}, 1000);

app.get("/", (req, res) => res.json({ status: "online", ...state }));
app.get("/api/status", (req, res) => res.json(state));
app.get("/api/ping", (req, res) => res.json({ online: true, tick: state.tick }));
app.get("/api/empires", (req, res) => res.json(state.empires));
app.get("/api/agents", (req, res) => res.json(state.agents));
app.get("/api/gods", (req, res) => res.json(state.empires.filter(e => e.god)));

app.listen(3000, () => console.log("🌌 Core running on 3000"));
