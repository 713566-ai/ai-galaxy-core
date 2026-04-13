#!/usr/bin/env node
// ============================================================
// V127 - DISTRIBUTED INFECTED MULTIVERSE
// Совмещение: Сетевой вирус + Мультиверс + P2P + C&C
// ============================================================

const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const fs = require("fs");
const crypto = require("crypto");
const net = require("net");
const os = require("os");

// ===============================
// КОНФИГУРАЦИЯ
// ===============================
const MASTER_PORT = 3001;
const BASE_PORT = 3200;
const P2P_PORT = 13337;
const CC_PORT = 8080;
let SWARM_SIZE = 5;

// ===============================
// 1. ВИРУСНОЕ ЯДРО ДЛЯ ВСЕЛЕННЫХ (С СЕТЕВЫМИ ФУНКЦИЯМИ)
// ===============================
const infectedNetworkCore = `
const express = require("express");
const app = express();
const http = require("http");
const net = require("net");
const crypto = require("crypto");
const os = require("os");

const PORT = process.env.PORT || 3200;
const NODE_ID = process.env.NODE_ID || "universe";
const P2P_PORT = ${P2P_PORT};

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
  spreadCount: 0,
  networkPeers: new Set(),
  localIp: null
};

// Получение локального IP
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

worldState.localIp = getLocalIp();

// ============ ВИРУСНЫЕ ФУНКЦИИ ============
function infect(source = null) {
  if (worldState.infected) return;
  
  worldState.infected = true;
  worldState.virusSignature = crypto.randomBytes(8).toString('hex');
  worldState.infectionTime = Date.now();
  worldState.entropy = Math.min(1, worldState.entropy + 0.2);
  
  console.log(\`🦠 [ВИРУС] Вселенная \${NODE_ID} ЗАРАЖЕНА! Сигнатура: \${worldState.virusSignature}\`);
  if (source) {
    console.log(\`   Источник: \${source}\`);
  }
}

// Сканирование сети
function scanNetwork() {
  if (!worldState.infected) return;
  
  const subnet = worldState.localIp.split('.').slice(0, 3).join('.');
  const targets = [];
  
  for (let i = 1; i <= 10; i++) { // Ограничиваем для демо
    targets.push(\`\${subnet}.\${i}\`);
  }
  
  targets.forEach(ip => {
    if (ip !== worldState.localIp) {
      checkPort(ip, ${MASTER_PORT});
      checkPort(ip, ${P2P_PORT});
    }
  });
}

function checkPort(ip, port) {
  const socket = new net.Socket();
  socket.setTimeout(1000);
  
  socket.on('connect', () => {
    console.log(\`[СЕТЬ] 🎯 Найден узел: \${ip}:\${port}\`);
    spreadToNetwork(ip, port);
    socket.destroy();
  });
  
  socket.on('error', () => {});
  socket.on('timeout', () => { socket.destroy(); });
  
  socket.connect(port, ip);
}

// Сетевое распространение
function spreadToNetwork(ip, port) {
  if (!worldState.infected) return;
  
  const data = JSON.stringify({
    source: NODE_ID,
    signature: worldState.virusSignature,
    nodeId: NODE_ID,
    port: PORT
  });
  
  const options = {
    hostname: ip,
    port: port,
    path: '/api/network-infect',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    timeout: 2000
  };
  
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log(\`[СЕТЬ] ✅ ЗАРАЖЕН УЗЕЛ: \${ip}:\${port}\`);
      worldState.networkPeers.add(\`\${ip}:\${port}\`);
      worldState.spreadCount++;
    }
  });
  
  req.write(data);
  req.end();
  req.on('error', () => {});
}

// ============ P2P СЕРВЕР ============
function startP2PServer() {
  const server = net.createServer((socket) => {
    let data = '';
    socket.on('data', (chunk) => {
      data += chunk.toString();
      if (data.includes('PEER_DISCOVERY')) {
        const peerList = Array.from(worldState.networkPeers).join(',');
        socket.write(\`PEER_RESPONSE:\${peerList}\\n\`);
      }
      
      if (data.includes('FETCH_STATE')) {
        socket.write(JSON.stringify({
          tick: worldState.tick,
          entropy: worldState.entropy,
          infected: worldState.infected
        }));
      }
    });
  });
  
  server.listen(${P2P_PORT}, '0.0.0.0', () => {
    console.log(\`[P2P] 🌐 P2P сервер на порту \${${P2P_PORT}}\`);
  });
}

// ============ API ВСЕЛЕННОЙ ============
app.use(express.json());

// Локальное заражение
app.post("/api/infect", (req, res) => {
  if (!worldState.infected) {
    infect(req.body.source);
    worldState.spreadCount++;
    res.json({ infected: true, source: req.body.source });
  } else {
    res.json({ alreadyInfected: true });
  }
});

// Сетевое заражение
app.post("/api/network-infect", (req, res) => {
  if (!worldState.infected) {
    infect(req.body.source);
    worldState.networkPeers.add(\`\${req.socket.remoteAddress}:\${req.body.port}\`);
    worldState.spreadCount++;
    console.log(\`[СЕТЬ] 🦠 НОВЫЙ УЗЕЛ ЗАРАЖЁН: \${req.body.source}\`);
    res.json({ infected: true });
  } else {
    res.json({ alreadyInfected: true });
  }
});

// Статус
app.get("/api/status", (req, res) => {
  res.json({
    nodeId: NODE_ID,
    tick: worldState.tick,
    entropy: worldState.entropy,
    infected: worldState.infected,
    signature: worldState.virusSignature,
    spreadCount: worldState.spreadCount,
    networkPeers: Array.from(worldState.networkPeers),
    localIp: worldState.localIp
  });
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

// Принудительное заражение
app.post("/api/infect-now", (req, res) => {
  infect("manual");
  res.json({ infected: true });
});

// Вирусный статус
app.get("/api/virus-status", (req, res) => {
  res.json({
    infected: worldState.infected,
    signature: worldState.virusSignature,
    infectionTime: worldState.infectionTime,
    spreadCount: worldState.spreadCount,
    networkPeers: Array.from(worldState.networkPeers)
  });
});

// ============ ТИК И РАСПРОСТРАНЕНИЕ ============
setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, 
    worldState.entropy + (Math.random() - 0.5) * 0.03
  ));
  
  // Сканирование сети (если заражён)
  if (worldState.infected && worldState.tick % 10 === 0) {
    scanNetwork();
  }
  
  // Рождение агентов
  if (Math.random() < 0.2) {
    worldState.agents.push({
      id: \`agent_\${Math.random().toString(36).slice(2, 7)}\`,
      energy: Math.random(),
      virusCarrier: worldState.infected && Math.random() < 0.5,
      createdAt: worldState.tick
    });
  }
}, 1000);

// ============ ЗАПУСК ============
if (Math.random() < 0.5) {
  setTimeout(() => infect("auto"), 2000);
}

startP2PServer();

app.listen(PORT, () => {
  const status = worldState.infected ? "🦠 INFECTED" : "🌌 CLEAN";
  console.log(\`\${status} Universe \${NODE_ID} on port \${PORT} | IP: \${worldState.localIp}\`);
});
`;

// ===============================
// 2. MASTER С СЕТЕВЫМ КОНТРОЛЕМ
// ===============================
let nodes = [];
const app = express();
app.use(express.json());

const masterState = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  networkPeers: new Set(),
  lastSync: null,
  virusOutbreak: false,
  infectionHistory: []
};

// Создание вселенной
function createUniverse(forceInfected = false) {
  const port = BASE_PORT + nodes.length;
  const nodeId = `uni-${nodes.length + 1}`;
  
  console.log(`${forceInfected ? '🦠' : '🌌'} Creating ${nodeId} on port ${port}`);
  
  const child = spawn("node", ["-e", infectedNetworkCore], {
    env: { ...process.env, PORT: port, NODE_ID: nodeId },
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (!msg.includes("🌌") && !msg.includes("🦠")) {
      console.log(`[${nodeId}] ${msg.slice(0, 100)}`);
    }
  });
  
  nodes.push({ nodeId, port, child, last: null, createdAt: Date.now() });
  
  if (forceInfected) {
    setTimeout(() => {
      http.post(`http://127.0.0.1:${port}/api/infect-now`, () => {});
    }, 1000);
  }
  
  return { nodeId, port };
}

// Синхронизация
async function syncAllNodes() {
  let infectedCount = 0;
  let networkPeers = new Set();
  
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
  
  if (infectedCount > 0) {
    masterState.infectionHistory.push({
      time: Date.now(),
      infected: infectedCount,
      total: nodes.length
    });
  }
}

// ===============================
// 3. API MASTER
// ===============================

app.get("/", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  const infected = Object.values(masterState.nodes).filter(n => n.infected).length;
  
  res.json({
    status: "V127 DISTRIBUTED INFECTED MULTIVERSE",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy.toFixed(4),
    totalUniverses: nodes.length,
    onlineUniverses: online,
    infectedUniverses: infected,
    outbreak: masterState.virusOutbreak,
    p2pPort: P2P_PORT,
    ccPort: CC_PORT
  });
});

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

// Создать вселенную
app.post("/api/multiverse/create", (req, res) => {
  const infected = req.body.infected || false;
  const universe = createUniverse(infected);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success: true, universe, infected });
});

// Удалить вселенную
app.delete("/api/multiverse/:nodeId", (req, res) => {
  const index = nodes.findIndex(n => n.nodeId === req.params.nodeId);
  if (index === -1) return res.json({ success: false });
  nodes[index].child.kill();
  nodes.splice(index, 1);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success: true });
});

// Заразить вселенную
app.post("/api/multiverse/:nodeId/infect", async (req, res) => {
  const node = nodes.find(n => n.nodeId === req.params.nodeId);
  if (!node) return res.status(404).json({ error: "Not found" });
  
  http.post(`http://127.0.0.1:${node.port}/api/infect-now`, () => {});
  setTimeout(() => syncAllNodes(), 500);
  res.json({ infected: true });
});

// Вирусный апокалипсис
app.post("/api/multiverse/virus-apocalypse", async (req, res) => {
  for (const node of nodes) {
    http.post(`http://127.0.0.1:${node.port}/api/infect-now`, () => {});
  }
  setTimeout(() => syncAllNodes(), 1000);
  res.json({ apocalypse: true });
});

// Синхронизация
app.post("/api/multiverse/sync", async (req, res) => {
  await syncAllNodes();
  res.json({ synced: true });
});

// Сброс
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

// Создаём начальные вселенные
for (let i = 0; i < SWARM_SIZE; i++) {
  const infected = Math.random() < 0.3;
  createUniverse(infected);
}

// Запускаем синхронизацию
setTimeout(() => {
  console.log("\n🦠🌌 Starting DISTRIBUTED INFECTED MULTIVERSE...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 2000);
}, 2000);

// Запускаем сервер
app.listen(MASTER_PORT, () => {
  console.log(`\n🦠🌌 ===== V127 DISTRIBUTED INFECTED MULTIVERSE =====`);
  console.log(`🌐 Master API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${MASTER_PORT}/api/multiverse/status`);
  console.log(`🌌 Initial universes: ${SWARM_SIZE} (30% pre-infected)`);
  console.log(`🔗 P2P Port: ${P2P_PORT} (для межвселенской коммуникации)`);
  console.log(`\n🦠 NETWORK VIRUS COMMANDS:`);
  console.log(`   Create infected: POST /api/multiverse/create -d '{"infected":true}'`);
  console.log(`   Infect universe:  POST /api/multiverse/uni-1/infect`);
  console.log(`   Virus apocalypse: POST /api/multiverse/virus-apocalypse`);
  console.log(`   Reset:            POST /api/multiverse/reset-all\n`);
});

// Статус в консоль
setInterval(() => {
  const online = Object.values(masterState.nodes).filter(n => n && n.online).length;
  const infected = Object.values(masterState.nodes).filter(n => n && n.infected).length;
  if (online > 0) {
    console.log(`🦠🌌 MULTIVERSE: ${online}/${nodes.length} online | ${infected} infected | Tick: ${masterState.tick} | Entropy: ${masterState.entropy.toFixed(4)}`);
  }
}, 5000);

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down...");
  nodes.forEach(node => node.child.kill());
  process.exit();
});
