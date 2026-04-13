// 🔥 WARFARE CORE 3104 - Совместимое ядро для V127
const express = require("express");
const http = require("http");

const app = express();
app.use(express.json());

const PORT = 3104;
const CORE_NAME = "warfare-3104";
const SWARM_URL = "http://127.0.0.1:3003";

let state = {
  tick: 0,
  entropy: 0.5,
  strength: 0.5 + Math.random() * 0.3,
  resources: 100 + Math.random() * 50,
  agents: [],
  warsWon: 0
};

// Life Agent интеграция
async function register() {
  try {
    const data = JSON.stringify({ name: CORE_NAME, port: PORT, type: "warfare" });
    const req = http.request(`${SWARM_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, () => {});
    req.write(data);
    req.end();
  } catch(e) {}
}

async function heartbeat() {
  try {
    const data = JSON.stringify({ name: CORE_NAME, tick: state.tick, entropy: state.entropy });
    const req = http.request(`${SWARM_URL}/api/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, () => {});
    req.write(data);
    req.end();
  } catch(e) {}
}

// API
app.get("/", (req, res) => res.json({ status: "online", ...state, name: CORE_NAME }));
app.get("/api/status", (req, res) => res.json(state));
app.get("/api/ping", (req, res) => res.json({ online: true, tick: state.tick, pong: true }));
app.get("/api/core-info", (req, res) => res.json({ strength: state.strength, resources: state.resources }));

// Игровой цикл
setInterval(() => {
  state.tick++;
  state.entropy += (Math.random() - 0.5) * 0.02;
  state.entropy = Math.max(0.2, Math.min(0.8, state.entropy));
  state.resources += Math.random() * 5;
  heartbeat();
}, 2000);

// Запуск
register();
app.listen(PORT, () => {
  console.log(`🔥 Warfare core ${CORE_NAME} on port ${PORT}`);
});
