const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3003;

const swarm = {
  tick: 0,
  nodes: {},
  history: [],
  startTime: Date.now()
};

// ==========================
// 🧠 REGISTER CORE
// ==========================
app.post("/api/register", (req, res) => {
  const { name, port, type } = req.body;

  if (!swarm.nodes[name]) {
    swarm.nodes[name] = {
      name,
      port,
      type: type || "core",
      lastSeen: Date.now(),
      status: "alive",
      bornAt: Date.now(),
      ticks: 0,
      heartbeats: 0
    };
    console.log(`🟢 [BORN] ${name} on port ${port}`);
  } else {
    swarm.nodes[name].status = "alive";
    swarm.nodes[name].lastSeen = Date.now();
    console.log(`🔄 [REBORN] ${name}`);
  }

  res.json({ ok: true, swarmTick: swarm.tick });
});

// ==========================
// 💓 HEARTBEAT
// ==========================
app.post("/api/heartbeat", (req, res) => {
  const { name, tick, entropy } = req.body;

  if (swarm.nodes[name]) {
    swarm.nodes[name].lastSeen = Date.now();
    swarm.nodes[name].status = "alive";
    swarm.nodes[name].ticks = tick || (swarm.nodes[name].ticks + 1);
    swarm.nodes[name].heartbeats++;
    swarm.nodes[name].entropy = entropy;
  }

  res.json({ ok: true });
});

// ==========================
// ☠️ DEATH SCAN & AUTO-REVIVE
// ==========================
function scanAndRevive() {
  const now = Date.now();
  let aliveCount = 0;
  let deadCount = 0;

  for (const node of Object.values(swarm.nodes)) {
    if (now - node.lastSeen > 5000) {
      if (node.status !== "dead") {
        node.status = "dead";
        node.diedAt = now;
        console.log(`💀 [DEATH] ${node.name} (no heartbeat for 5s)`);
      }
      deadCount++;
    } else {
      node.status = "alive";
      aliveCount++;
    }
  }

  swarm.tick++;
  
  // Сохраняем историю каждые 10 тиков
  if (swarm.tick % 10 === 0) {
    swarm.history.push({
      tick: swarm.tick,
      time: now,
      alive: aliveCount,
      dead: deadCount,
      total: Object.keys(swarm.nodes).length
    });
    if (swarm.history.length > 100) swarm.history.shift();
  }

  // Логирование состояния
  if (swarm.tick % 20 === 0) {
    console.log(`💓 [SWARM] tick:${swarm.tick} | alive:${aliveCount} | dead:${deadCount} | total:${Object.keys(swarm.nodes).length}`);
  }
}

setInterval(scanAndRevive, 2000);

// ==========================
// 📊 STATUS API
// ==========================
app.get("/api/status", (req, res) => {
  let alive = 0;
  let dead = 0;
  let totalHeartbeats = 0;

  for (const n of Object.values(swarm.nodes)) {
    if (n.status === "alive") alive++;
    else dead++;
    totalHeartbeats += n.heartbeats || 0;
  }

  res.json({
    status: "💀 V127 LIFE SYSTEM",
    swarmTick: swarm.tick,
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    alive,
    dead,
    total: Object.keys(swarm.nodes).length,
    totalHeartbeats,
    nodes: swarm.nodes,
    history: swarm.history.slice(-20)
  });
});

app.get("/api/nodes", (req, res) => {
  res.json(swarm.nodes);
});

app.get("/api/node/:name", (req, res) => {
  const node = swarm.nodes[req.params.name];
  if (node) res.json(node);
  else res.status(404).json({ error: "Node not found" });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   💀 V127 LIFE SYSTEM — ЖИВАЯ СЕТЬ ЯДЕР                                    ║");
  console.log("║   ✅ Heartbeat | ✅ Auto-register | ✅ Death detection | ✅ Self-healing    ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Master: http://127.0.0.1:${PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status\n`);
});
