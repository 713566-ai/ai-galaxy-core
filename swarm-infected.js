const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const fs = require("fs");
const crypto = require("crypto");

const MASTER_PORT = 3001;
const BASE_PORT = 3200;
let SWARM_SIZE = 5;

// ===============================
// 1. ВИРУСНОЕ ЯДРО ДЛЯ ВСЕЛЕННЫХ
// ===============================
const infectedCoreCode = `
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3200;
const NODE_ID = process.env.NODE_ID || "universe";
const crypto = require("crypto");

// ЗАРАЖЁННОЕ СОСТОЯНИЕ
let worldState = {
  tick: 0,
  entropy: 0.5 + (Math.random() - 0.5) * 0.2,
  nodeId: NODE_ID,
  startTime: Date.now(),
  agents: [],
  infected: false,
  virusSignature: null,
  infectionTime: null,
  spreadCount: 0
};

// ВИРУСНЫЙ МЕХАНИЗМ
function infect() {
  if (worldState.infected) return;
  
  worldState.infected = true;
  worldState.virusSignature = crypto.randomBytes(8).toString('hex');
  worldState.infectionTime = Date.now();
  worldState.entropy = Math.min(1, worldState.entropy + 0.2); // Вирус повышает хаос
  
  console.log(\`🦠 [ВИРУС] Вселенная \${NODE_ID} ЗАРАЖЕНА! Сигнатура: \${worldState.virusSignature}\`);
}

function spreadTo(targetPort) {
  return new Promise((resolve) => {
    const req = http.post(\`http://127.0.0.1:\${targetPort}/api/infect\`, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
    req.write(JSON.stringify({ source: NODE_ID, signature: worldState.virusSignature }));
    req.end();
  });
}

// ЭНДПОЙНТ ЗАРАЖЕНИЯ
app.post("/api/infect", express.json(), (req, res) => {
  if (!worldState.infected) {
    infect();
    worldState.spreadCount++;
    console.log(\`🦠 [ВИРУС] \${NODE_ID} заражён от \${req.body.source}\`);
    res.json({ infected: true, source: req.body.source });
  } else {
    res.json({ alreadyInfected: true });
  }
});

// ТИК С ВИРУСНОЙ АКТИВНОСТЬЮ
setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, 
    worldState.entropy + (Math.random() - 0.5) * 0.03
  ));
  
  // РАСПРОСТРАНЕНИЕ ВИРУСА (если заражён)
  if (worldState.infected && Math.random() < 0.2) {
    console.log(\`🕸️ [ВИРУС] \${NODE_ID} пытается распространиться...\`);
    // Поиск соседних портов
    const neighbors = [PORT - 1, PORT + 1].filter(p => p >= 3200 && p < 3210);
    neighbors.forEach(port => spreadTo(port));
  }
  
  // РОЖДЕНИЕ ЗАРАЖЁННЫХ АГЕНТОВ
  if (worldState.infected && Math.random() < 0.3) {
    worldState.agents.push({
      id: "infected_agent_" + Math.random().toString(36).slice(2, 7),
      energy: Math.random(),
      virusCarrier: true,
      createdAt: worldState.tick
    });
  } else if (Math.random() < 0.2) {
    worldState.agents.push({
      id: "agent_" + Math.random().toString(36).slice(2, 7),
      energy: Math.random(),
      virusCarrier: false,
      createdAt: worldState.tick
    });
  }
}, 1000);

// API
app.get("/", (req, res) => {
  res.json({ status: "infected-universe", ...worldState });
});

app.get("/api/status", (req, res) => {
  res.json(worldState);
});

app.get("/api/ping", (req, res) => {
  res.json({ 
    online: true, 
    nodeId: NODE_ID, 
    tick: worldState.tick, 
    entropy: worldState.entropy,
    infected: worldState.infected
  });
});

app.post("/api/infect-now", (req, res) => {
  infect();
  res.json({ infected: true });
});

app.get("/api/virus-status", (req, res) => {
  res.json({
    infected: worldState.infected,
    signature: worldState.virusSignature,
    infectionTime: worldState.infectionTime,
    spreadCount: worldState.spreadCount,
    infectedAgents: worldState.agents.filter(a => a.virusCarrier).length
  });
});

// АВТОМАТИЧЕСКОЕ ЗАРАЖЕНИЕ ПРИ СТАРТЕ (50% шанс)
if (Math.random() < 0.5) {
  setTimeout(() => infect(), 2000);
}

app.listen(PORT, () => {
  const status = worldState.infected ? "🦠 INFECTED" : "🌌 CLEAN";
  console.log(\`\${status} Universe \${NODE_ID} on port \${PORT}\`);
});
`;

// ===============================
// 2. MASTER С ВИРУСНЫМ КОНТРОЛЕМ
// ===============================
let nodes = [];
const app = express();
app.use(express.json());

const masterState = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  lastSync: null,
  virusOutbreak: false,
  patientZero: null,
  infectionHistory: []
};

// Создание вселенной
function createUniverse(forceInfected = false) {
  const port = BASE_PORT + nodes.length;
  const nodeId = `uni-${nodes.length + 1}`;
  
  console.log(`${forceInfected ? '🦠' : '🌌'} Creating universe ${nodeId} on port ${port}`);
  
  const child = spawn("node", ["-e", infectedCoreCode], {
    env: { ...process.env, PORT: port, NODE_ID: nodeId },
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (!msg.includes("🌌") && !msg.includes("🦠")) {
      console.log(`[${nodeId}] ${msg.slice(0, 100)}`);
    }
  });
  
  child.stderr.on("data", (data) => {
    // Игнорируем
  });
  
  nodes.push({ nodeId, port, child, last: null, createdAt: Date.now() });
  
  // Принудительное заражение если нужно
  if (forceInfected) {
    setTimeout(() => {
      http.post(`http://127.0.0.1:${port}/api/infect-now`, () => {});
    }, 1000);
  }
  
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

// Синхронизация
async function syncAllNodes() {
  let infectedCount = 0;
  
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
          infected: result.infected || false,
          port: node.port
        };
        
        if (result.infected) {
          infectedCount++;
        }
      } else {
        masterState.nodes[node.nodeId] = { online: false };
      }
    } catch(e) {}
  }
  
  // Агрегация
  const onlineNodes = nodes.filter(n => n.last);
  if (onlineNodes.length > 0) {
    const avgTick = onlineNodes.reduce((sum, n) => sum + n.last.tick, 0) / onlineNodes.length;
    const avgEntropy = onlineNodes.reduce((sum, n) => sum + n.last.entropy, 0) / onlineNodes.length;
    
    masterState.tick = Math.round(avgTick);
    masterState.entropy = avgEntropy;
  }
  
  masterState.virusOutbreak = infectedCount > nodes.length / 2;
  masterState.lastSync = new Date().toISOString();
  
  // Логируем вспышку
  if (infectedCount > 0) {
    masterState.infectionHistory.push({
      time: Date.now(),
      infected: infectedCount,
      total: nodes.length
    });
    if (masterState.infectionHistory.length > 50) {
      masterState.infectionHistory.shift();
    }
  }
}

// ===============================
// 3. API MASTER
// ===============================

// Статус
app.get("/", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  const infected = Object.values(masterState.nodes).filter(n => n.infected).length;
  
  res.json({
    status: "V126 INFECTED MULTIVERSE",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy.toFixed(4),
    totalUniverses: nodes.length,
    onlineUniverses: online,
    infectedUniverses: infected,
    outbreak: masterState.virusOutbreak,
    lastSync: masterState.lastSync
  });
});

// Детальный статус
app.get("/api/multiverse/status", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  const infected = Object.values(masterState.nodes).filter(n => n.infected).length;
  
  res.json({
    timestamp: new Date().toISOString(),
    onlineUniverses: online,
    totalUniverses: nodes.length,
    infectedUniverses: infected,
    outbreakActive: masterState.virusOutbreak,
    masterState: {
      tick: masterState.tick,
      entropy: masterState.entropy,
      lastSync: masterState.lastSync
    },
    universes: masterState.nodes,
    infectionHistory: masterState.infectionHistory.slice(-20)
  });
});

// Создать вселенную (опционально заражённую)
app.post("/api/multiverse/create", (req, res) => {
  const infected = req.body.infected || false;
  const universe = createUniverse(infected);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success: true, universe, infected });
});

// Удалить вселенную
app.delete("/api/multiverse/:nodeId", (req, res) => {
  const success = destroyUniverse(req.params.nodeId);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success });
});

// Заразить конкретную вселенную
app.post("/api/multiverse/:nodeId/infect", async (req, res) => {
  const node = nodes.find(n => n.nodeId === req.params.nodeId);
  if (!node) {
    return res.status(404).json({ error: "Universe not found" });
  }
  
  http.post(`http://127.0.0.1:${node.port}/api/infect-now`, () => {});
  setTimeout(() => syncAllNodes(), 500);
  res.json({ infected: true, nodeId: req.params.nodeId });
});

// Вирусный апокалипсис - заразить всё
app.post("/api/multiverse/virus-apocalypse", async (req, res) => {
  for (const node of nodes) {
    http.post(`http://127.0.0.1:${node.port}/api/infect-now`, () => {});
  }
  setTimeout(() => syncAllNodes(), 1000);
  res.json({ apocalypse: true, message: "🦠 ВСЕ ВСЕЛЕННЫЕ ЗАРАЖЕНЫ!" });
});

// Принудительная синхронизация
app.post("/api/multiverse/sync", async (req, res) => {
  await syncAllNodes();
  res.json({ synced: true });
});

// Сбросить все вселенные (вылечить)
app.post("/api/multiverse/reset-all", async (req, res) => {
  for (const node of nodes) {
    node.child.kill();
  }
  nodes = [];
  for (let i = 0; i < SWARM_SIZE; i++) {
    createUniverse(false);
  }
  setTimeout(() => syncAllNodes(), 1000);
  res.json({ reset: true });
});

// ===============================
// 4. ЗАПУСК
// ===============================

// Создаём начальные вселенные (некоторые заражены)
for (let i = 0; i < SWARM_SIZE; i++) {
  const infected = Math.random() < 0.3; // 30% заражены при старте
  createUniverse(infected);
}

// Запускаем синхронизацию
setTimeout(() => {
  console.log("\n🦠 Starting infected multiverse synchronization...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 2000);
}, 2000);

// Запускаем сервер
app.listen(MASTER_PORT, () => {
  console.log(`\n🦠 ===== V126 INFECTED MULTIVERSE =====`);
  console.log(`🌐 API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${MASTER_PORT}/api/multiverse/status`);
  console.log(`🌌 Initial universes: ${SWARM_SIZE} (30% pre-infected)`);
  console.log(`\n🦠 VIRUS COMMANDS:`);
  console.log(`   Create infected: POST /api/multiverse/create -d '{"infected":true}'`);
  console.log(`   Infect universe:  POST /api/multiverse/uni-1/infect`);
  console.log(`   VIRUS APOCALYPSE: POST /api/multiverse/virus-apocalypse`);
  console.log(`   Reset (clean):    POST /api/multiverse/reset-all\n`);
});

// Статус в консоль
setInterval(() => {
  const online = Object.values(masterState.nodes).filter(n => n && n.online).length;
  const infected = Object.values(masterState.nodes).filter(n => n && n.infected).length;
  if (online > 0) {
    const outbreakIcon = masterState.virusOutbreak ? "🦠💀" : "🦠";
    console.log(`${outbreakIcon} INFECTED MULTIVERSE: ${online}/${nodes.length} online | ${infected} infected | Tick: ${masterState.tick} | Entropy: ${masterState.entropy.toFixed(4)}`);
  }
}, 5000);

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down infected multiverse...");
  nodes.forEach(node => node.child.kill());
  process.exit();
});
