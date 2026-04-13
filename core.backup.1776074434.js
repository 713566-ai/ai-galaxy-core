require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =====================
// 💀 CORE STATE
// =====================
const state = {
  tick: 0,
  entropy: 0.5,
  alive: true
};

// =====================
// 🧠 STATUS ENGINE
// =====================
function buildStatus() {
  return {
    status: "AI GALAXY CORE V117 CLEAN",
    tick: state.tick,
    entropy: state.entropy,
    uptime: process.uptime(),
    time: new Date().toISOString()
  };
}

// =====================
// 🔁 SIM LOOP
// =====================
setInterval(() => {
  state.tick++;

  // лёгкая симуляция энтропии
  state.entropy += (Math.random() - 0.5) * 0.01;

  if (state.entropy < 0) state.entropy = 0;
  if (state.entropy > 1) state.entropy = 1;

}, 1000);

// =====================
// 🌐 API
// =====================
app.get('/', (req, res) => {
  res.json(buildStatus());
});

app.get('/api/status', (req, res) => {
  res.json({
    ...buildStatus(),
    system: "stable",
    mode: "clean-core-v117"
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// =====================
// 🚀 START SERVER (SAFE)
// =====================
app.listen(PORT, '0.0.0.0', () => {
  console.log("\n╔══════════════════════════════╗");
  console.log("║   💀 V117 CLEAN CORE ONLINE   ║");
  console.log("╠══════════════════════════════╣");
  console.log("║  PORT:", PORT);
  console.log("║  STATUS: STABLE BOOT");
  console.log("╚══════════════════════════════╝\n");
});
