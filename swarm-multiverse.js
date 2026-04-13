const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const fs = require("fs");

const MASTER_PORT = 3001;
const BASE_PORT = 3200;
let SWARM_SIZE = 5; // Динамический размер

// ===============================
// 1. МИНИ-ЯДРО ДЛЯ ВСЕЛЕННЫХ
// ===============================
const coreCode = `
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3200;
const NODE_ID = process.env.NODE_ID || "node";

let worldState = {
  tick: 0,
  entropy: 0.5 + (Math.random() - 0.5) * 0.2,
  nodeId: NODE_ID,
  startTime: Date.now(),
  agents: [],
  events: []
};

// Тикаем каждую секунду
setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, 
    worldState.entropy + (Math.random() - 0.5) * 0.03
  ));
  
  // Рождаем агентов
  if (Math.random() < 0.3) {
    worldState.agents.push({
      id: "agent_" + Math.random().toString(36).slice(2, 7),
      energy: Math.random(),
      createdAt: worldState.tick
    });
  }
}, 1000);

// API
app.get("/", (req, res) => {
  res.json({ status: "universe", nodeId: NODE_ID, ...worldState });
});

app.get("/api/status", (req, res) => {
  res.json(worldState);
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, nodeId: NODE_ID, tick: worldState.tick, entropy: worldState.entropy });
});

app.post("/api/reset", (req, res) => {
  worldState.tick = 0;
  worldState.entropy = 0.5;
  worldState.agents = [];
  res.json({ reset: true });
});

app.post("/api/entropy/:value", (req, res) => {
  const value = parseFloat(req.params.value);
  worldState.entropy = Math.max(0, Math.min(1, value));
  res.json({ entropy: worldState.entropy });
});

app.listen(PORT, () => {
  console.log(\`🌌 Universe \${NODE_ID} on port \${PORT}\`);
});
`;

// ===============================
// 2. УПРАВЛЕНИЕ ВСЕЛЕННЫМИ
// ===============================
let nodes = [];
const app = express();
const masterState = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  lastSync: null,
  history: []
};

// Создание новой вселенной
function createUniverse() {
  const port = BASE_PORT + nodes.length;
  const nodeId = `uni-${nodes.length + 1}`;
  
  console.log(`🌌 Creating universe ${nodeId} on port ${port}`);
  
  const child = spawn("node", ["-e", coreCode], {
    env: { ...process.env, PORT: port, NODE_ID: nodeId },
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (!msg.includes("🌌")) console.log(`[${nodeId}] ${msg}`);
  });
  
  child.stderr.on("data", (data) => {
    console.error(`[${nodeId}] ERROR: ${data.toString().trim().slice(0, 100)}`);
  });
  
  nodes.push({ nodeId, port, child, last: null, createdAt: Date.now() });
  return { nodeId, port };
}

// Удаление вселенной
function destroyUniverse(nodeId) {
  const index = nodes.findIndex(n => n.nodeId === nodeId);
  if (index === -1) return false;
  
  console.log(`💀 Destroying universe ${nodeId}`);
  nodes[index].child.kill();
  nodes.splice(index, 1);
  return true;
}

// Синхронизация всех вселенных
async function syncAllNodes() {
  for (const node of nodes) {
    try {
      const result = await new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${node.port}/api/ping`, (res) => {
          let data = "";
          res.on("data", c => data += c);
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch(e) {
              resolve(null);
            }
          });
        });
        req.setTimeout(1000, () => {
          req.destroy();
          resolve(null);
        });
        req.on("error", () => resolve(null));
      });
      
      if (result) {
        node.last = result;
        masterState.nodes[node.nodeId] = {
          online: true,
          tick: result.tick,
          entropy: result.entropy,
          port: node.port,
          uptime: Date.now() - node.createdAt
        };
      } else {
        masterState.nodes[node.nodeId] = { online: false, error: "timeout" };
      }
    } catch(e) {
      masterState.nodes[node.nodeId] = { online: false, error: e.message };
    }
  }
  
  // Агрегация
  const onlineNodes = nodes.filter(n => n.last);
  if (onlineNodes.length > 0) {
    const avgTick = onlineNodes.reduce((sum, n) => sum + n.last.tick, 0) / onlineNodes.length;
    const avgEntropy = onlineNodes.reduce((sum, n) => sum + n.last.entropy, 0) / onlineNodes.length;
    
    masterState.tick = Math.round(avgTick);
    masterState.entropy = avgEntropy;
    
    // Сохраняем историю
    masterState.history.push({
      time: Date.now(),
      tick: masterState.tick,
      entropy: masterState.entropy,
      nodes: onlineNodes.length
    });
    
    // Оставляем только последние 100 записей
    if (masterState.history.length > 100) {
      masterState.history.shift();
    }
  }
  
  masterState.lastSync = new Date().toISOString();
}

// ===============================
// 3. API MASTER
// ===============================
app.use(express.json());

// Статус
app.get("/", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  res.json({
    status: "V125 MULTIVERSE CONTROLLER",
    version: "2.0",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy.toFixed(4),
    totalUniverses: nodes.length,
    onlineUniverses: online,
    lastSync: masterState.lastSync
  });
});

// Детальный статус
app.get("/api/multiverse/status", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  res.json({
    timestamp: new Date().toISOString(),
    onlineUniverses: online,
    totalUniverses: nodes.length,
    masterState: {
      tick: masterState.tick,
      entropy: masterState.entropy,
      lastSync: masterState.lastSync
    },
    universes: masterState.nodes,
    history: masterState.history.slice(-20)
  });
});

// Создать вселенную
app.post("/api/multiverse/create", (req, res) => {
  const universe = createUniverse();
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success: true, universe });
});

// Удалить вселенную
app.delete("/api/multiverse/:nodeId", (req, res) => {
  const success = destroyUniverse(req.params.nodeId);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success });
});

// Принудительная синхронизация
app.post("/api/multiverse/sync", async (req, res) => {
  await syncAllNodes();
  res.json({ synced: true, timestamp: new Date().toISOString() });
});

// Глобальный сброс
app.post("/api/multiverse/reset-all", async (req, res) => {
  for (const node of nodes) {
    http.post(`http://127.0.0.1:${node.port}/api/reset`, () => {});
  }
  setTimeout(() => syncAllNodes(), 500);
  res.json({ reset: true });
});

// Установить энтропию для всех
app.post("/api/multiverse/entropy/:value", async (req, res) => {
  const value = parseFloat(req.params.value);
  for (const node of nodes) {
    http.post(`http://127.0.0.1:${node.port}/api/entropy/${value}`, () => {});
  }
  res.json({ entropy: value });
});

// ===============================
// 4. ЗАПУСК MASTER
// ===============================
// Создаём начальные вселенные
for (let i = 0; i < SWARM_SIZE; i++) {
  createUniverse();
}

// Запускаем синхронизацию
setTimeout(() => {
  console.log("\n💀 Starting multiverse synchronization...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 2000);
}, 2000);

// Запускаем сервер
app.listen(MASTER_PORT, () => {
  console.log(`\n💀 ===== V125 MULTIVERSE CONTROLLER =====`);
  console.log(`🌐 API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${MASTER_PORT}/api/multiverse/status`);
  console.log(`🌌 Initial universes: ${SWARM_SIZE}`);
  console.log(`\n🚀 COMMANDS:`);
  console.log(`   Create: POST /api/multiverse/create`);
  console.log(`   Delete: DELETE /api/multiverse/:nodeId`);
  console.log(`   Sync:   POST /api/multiverse/sync`);
  console.log(`   Reset:  POST /api/multiverse/reset-all\n`);
});

// Статус в консоль
setInterval(() => {
  const online = Object.values(masterState.nodes).filter(n => n && n.online).length;
  if (online > 0) {
    console.log(`🌌 MULTIVERSE: ${online}/${nodes.length} universes | Master tick: ${masterState.tick} | Entropy: ${masterState.entropy.toFixed(4)}`);
  }
}, 5000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n💀 Shutting down multiverse...");
  nodes.forEach(node => node.child.kill());
  process.exit();
});
