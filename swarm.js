const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

const BASE_PORT = 3100;
const MASTER_PORT = 3001;  // ← ИЗМЕНЕНО: используем 3001 вместо 3000

// ===============================
// 1. ПОИСК ВСЕХ ЯДЕР
// ===============================
const cores = fs.readdirSync(".")
  .filter(f => f.startsWith("core-v") && f.endsWith(".js"));

console.log("💀 FOUND CORES:", cores.length);

// ===============================
// 2. ЗАПУСК ВСЕХ ЯДЕР КАК НОД
// ===============================
const nodes = [];

cores.forEach((file, i) => {
  const port = BASE_PORT + i;
  console.log(`🚀 starting ${file} on port ${port}`);

  const child = spawn("node", [file], {
    env: {
      ...process.env,
      PORT: port,
      NODE_ID: file.replace(".js", "")
    },
    stdio: "pipe"
  });

  child.stdout.on("data", (data) => {
    // Фильтруем лишний шум
    const msg = data.toString().trim();
    if (!msg.includes("listening") && !msg.includes("Listening")) {
      console.log(`[${file}] ${msg.slice(0, 100)}`);
    }
  });
  
  child.stderr.on("data", (data) => {
    console.error(`[${file}] ERROR: ${data.toString().trim().slice(0, 100)}`);
  });

  nodes.push({ file, port, child, last: null });
});

// ===============================
// 3. MASTER СЕРВЕР ДЛЯ СБОРА ДАННЫХ
// ===============================
const express = require("express");
const app = express();

// MASTER STATE
const masterState = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  lastSync: null
};

// СИНХРОНИЗАЦИЯ СО ВСЕМИ НОДАМИ
function syncAllNodes() {
  nodes.forEach(node => {
    http.get(`http://127.0.0.1:${node.port}/api/ping`, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          node.last = json;
          masterState.nodes[node.port] = json;
          masterState.lastSync = new Date().toISOString();
          
          // Обновляем master tick (берём максимум)
          if (json.tick > masterState.tick) {
            masterState.tick = json.tick;
          }
          masterState.entropy = json.entropy;
        } catch(e) {}
      });
    }).on("error", (err) => {
      masterState.nodes[node.port] = { error: "offline" };
    });
  });
}

// Ждём 2 секунды пока стартуют ноды, потом начинаем синхронизацию
setTimeout(() => {
  console.log("\n💀 Starting swarm synchronization...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 3000);
}, 2000);

// ===============================
// 4. API MASTER ДЛЯ КОНТРОЛЯ
// ===============================
app.get("/", (req, res) => {
  res.json({
    status: "V124 SWARM MASTER",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy,
    totalNodes: nodes.length,
    activeNodes: Object.values(masterState.nodes).filter(n => n && !n.error).length,
    nodes: masterState.nodes
  });
});

app.get("/api/swarm/status", (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    activeNodes: Object.values(masterState.nodes).filter(n => n && !n.error).length,
    totalNodes: nodes.length,
    nodes: masterState.nodes,
    masterState: {
      tick: masterState.tick,
      entropy: masterState.entropy,
      lastSync: masterState.lastSync
    }
  });
});

app.get("/api/swarm/sync", (req, res) => {
  syncAllNodes();
  res.json({ synced: true, timestamp: new Date().toISOString() });
});

// ===============================
// 5. ЗАПУСК MASTER
// ===============================
app.listen(MASTER_PORT, () => {
  console.log(`\n💀 ===== V124 SWARM MASTER =====`);
  console.log(`🌐 Master API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Swarm status: http://127.0.0.1:${MASTER_PORT}/api/swarm/status`);
  console.log(`🚀 Nodes running: ${nodes.length}`);
  console.log(`⚠️  Main core still on port 3000 (unchanged)\n`);
});

// ===============================
// 6. ВЫВОД СТАТУСА В КОНСОЛЬ
// ===============================
setInterval(() => {
  const active = Object.values(masterState.nodes).filter(n => n && !n.error).length;
  console.log(`💀 SWARM STATUS: ${active}/${nodes.length} nodes active | Master tick: ${masterState.tick}`);
}, 10000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n💀 Shutting down swarm...");
  nodes.forEach(node => {
    try { node.child.kill(); } catch(e) {}
  });
  process.exit();
});
