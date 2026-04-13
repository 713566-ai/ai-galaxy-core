const express = require("express");
const app = express();

const port = process.argv[2] || 3100;

let state = {
  tick: 0,
  entropy: 0.4 + Math.random() * 0.3,
  strength: 0.5 + Math.random() * 0.3,
  stability: 0.8,
  heartbeats: 0,
  startTime: Date.now()
};

setInterval(() => {
  state.tick++;
  state.heartbeats++;
  
  state.entropy += (Math.random() - 0.5) * 0.02;
  state.strength += (Math.random() - 0.5) * 0.01;
  
  // Стабилизация
  state.entropy = Math.max(0.3, Math.min(0.7, state.entropy));
  state.strength = Math.max(0.4, Math.min(0.95, state.strength));
  state.stability = Math.max(0.5, Math.min(1.0, state.stability + (Math.random() - 0.5) * 0.01));
  
}, 1000);

app.get("/api/status", (req, res) => res.json({
  status: "warfare",
  port: port,
  tick: state.tick,
  entropy: state.entropy,
  strength: state.strength,
  stability: state.stability,
  heartbeats: state.heartbeats,
  uptime: Math.floor((Date.now() - state.startTime) / 1000)
}));

app.get("/api/ping", (req, res) => res.json({ pong: true, port: port, tick: state.tick }));

app.listen(port, () => {
  console.log(`⚔️ warfare-${port} started on port ${port}`);
});

process.on("SIGINT", () => {
  console.log(`💀 warfare-${port} stopped`);
  process.exit();
});
