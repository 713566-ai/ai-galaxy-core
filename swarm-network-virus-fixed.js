#!/usr/bin/env node
// ============================================================
// V127 - DISTRIBUTED INFECTED MULTIVERSE (FIXED)
// Исправлены ошибки с http.post
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

// Вспомогательная функция для HTTP POST
function httpPost(url, data, callback) {
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (callback) callback(null, body);
    });
  });
  
  req.on('error', (err) => {
    if (callback) callback(err);
  });
  
  req.write(JSON.stringify(data));
  req.end();
}

// ===============================
// 1. ВИРУСНОЕ ЯДРО ДЛЯ ВСЕЛЕННЫХ
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
  networkPeers: [],
  localIp: null
};

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

function infect(source = null) {
  if (worldState.infected) return;
  
  worldState.infected = true;
  worldState.virusSignature = crypto.randomBytes(8).toString('hex');
  worldState.infectionTime = Date.now();
  worldState.entropy = Math.min(1, worldState.entropy + 0.2);
  
  console.log(\`🦠 [ВИРУС] \${NODE_ID} ЗАРАЖЕНА! Сигнатура: \${worldState.virusSignature}\`);
  if (source) console.log(\`   Источник: \${source}\`);
}

function httpPostJson(host, port, path, data) {
  return new Promise((resolve) => {
    const options = { hostname: host, port: port, path: path, method: 'POST', timeout: 2000 };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
    req.write(JSON.stringify(data));
    req.end();
  });
}

function scanNetwork() {
  if (!worldState.infected) return;
  
  const subnet = worldState.localIp.split('.').slice(0, 3).join('.');
  for (let i = 1; i <= 10; i++) {
    const ip = \`\${subnet}.\${i}\`;
    if (ip !== worldState.localIp) {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.on('connect', () => {
        console.log(\`[СЕТЬ] 🎯 Найден узел: \${ip}:${MASTER_PORT}\`);
        httpPostJson(ip, ${MASTER_PORT}, '/api/network-infect', {
          source: NODE_ID,
          signature: worldState.virusSignature,
          port: PORT
        });
        socket.destroy();
      });
      socket.on('error', () => {});
      socket.connect(${MASTER_PORT}, ip);
    }
  }
}

app.use(express.json());

app.post("/api/infect", (req, res) => {
  if (!worldState.infected) {
    infect(req.body.source);
    worldState.spreadCount++;
    res.json({ infected: true });
  } else {
    res.json({ alreadyInfected: true });
  }
});

app.post("/api/network-infect", (req, res) => {
  if (!worldState.infected) {
    infect(req.body.source);
    worldState.networkPeers.push(req.body.source);
    worldState.spreadCount++;
    console.log(\`[СЕТЬ] 🦠 НОВЫЙ УЗЕЛ: \${req.body.source}\`);
    res.json({ infected: true });
  } else {
    res.json({ alreadyInfected: true });
  }
});

app.get("/api/status", (req, res) => {
  res.json({
    nodeId: NODE_ID,
    tick: worldState.tick,
    entropy: worldState.entropy,
    infected: worldState.infected,
    signature: worldState.virusSignature,
    spreadCount: worldState.spreadCount,
    networkPeers: worldState.networkPeers,
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

app.post("/api/infect-now", (req, res) => {
  infect("manual");
  res.json({ infected: true });
});

app.get("/api/virus-status", (req, res) => {
  res.json({
    infected: worldState.infected,
    signature: worldState.virusSignature,
    infectionTime: worldState.infectionTime,
    spreadCount: worldState.spreadCount,
    networkPeers: worldState.networkPeers
  });
});

setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, 
    worldState.entropy + (Math.random() - 0.5) * 0.03
  ));
  
  if (worldState.infected && worldState.tick % 10 === 0) {
    scanNetwork();
  }
  
  if (Math.random() < 0.2) {
    worldState.agents.push({
      id: \`agent_\${Math.random().toString(36).slice(2, 7)}\`,
      energy: Math.random(),
      virusCarrier: worldState.infected && Math.random() < 0.5,
      createdAt: worldState.tick
    });
  }
}, 1000);

if (Math.random() < 0.5) {
  setTimeout(() => infect("auto"), 2000);
}

app.listen(PORT, () => {
  const status = worldState.infected ? "🦠 INFECTED" : "🌌 CLEAN";
  console.log(\`\${status} Universe \${NODE_ID} on port \${PORT} | IP: \${worldState.localIp}\`);
});
`;

// ===============================
// 2. MASTER
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
  infectionHistory: []
};

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
    if (!msg.includes("🌌") && !msg.includes("🦠") && msg.length > 0) {
      // console.log(`[${nodeId}] ${msg.slice(0, 100)}`);
    }
  });
  
  nodes.push({ nodeId, port, child, last: null, createdAt: Date.now() });
  
  if (forceInfected) {
    setTimeout(() => {
      httpPost(`http://127.0.0.1:${port}/api/infect-now`, {}, () => {});
    }, 1000);
  }
  
  return { nodeId, port };
}

function httpPost(url, data, callback) {
  const urlObj = new URL(url);
  const options = {
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    timeout: 2000
  };
  
  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (callback) callback(null, body);
    });
  });
  
  req.on('error', (err) => {
    if (callback) callback(err);
  });
  
  req.write(JSON.stringify(data));
  req.end();
}

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
        
        if (result.infected) infectedCount++;
      } else {
        masterState.nodes[node.nodeId] = { online: false };
      }
    } catch(e) {}
  }
  
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
    if (masterState.infectionHistory.length > 50) masterState.infectionHistory.shift();
  }
}

// ===============================
// 3. API
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
    outbreak: masterState.virusOutbreak
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

app.post("/api/multiverse/create", (req, res) => {
  const infected = req.body.infected || false;
  const universe = createUniverse(infected);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success: true, universe, infected });
});

app.delete("/api/multiverse/:nodeId", (req, res) => {
  const index = nodes.findIndex(n => n.nodeId === req.params.nodeId);
  if (index === -1) return res.json({ success: false });
  nodes[index].child.kill();
  nodes.splice(index, 1);
  setTimeout(() => syncAllNodes(), 500);
  res.json({ success: true });
});

app.post("/api/multiverse/:nodeId/infect", async (req, res) => {
  const node = nodes.find(n => n.nodeId === req.params.nodeId);
  if (!node) return res.status(404).json({ error: "Not found" });
  
  httpPost(`http://127.0.0.1:${node.port}/api/infect-now`, {}, () => {});
  setTimeout(() => syncAllNodes(), 500);
  res.json({ infected: true });
});

app.post("/api/multiverse/virus-apocalypse", async (req, res) => {
  for (const node of nodes) {
    httpPost(`http://127.0.0.1:${node.port}/api/infect-now`, {}, () => {});
  }
  setTimeout(() => syncAllNodes(), 1000);
  res.json({ apocalypse: true });
});

app.post("/api/multiverse/sync", async (req, res) => {
  await syncAllNodes();
  res.json({ synced: true });
});

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

for (let i = 0; i < SWARM_SIZE; i++) {
  const infected = Math.random() < 0.3;
  createUniverse(infected);
}

setTimeout(() => {
  console.log("\n🦠🌌 Starting DISTRIBUTED INFECTED MULTIVERSE...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 2000);
}, 2000);

app.listen(MASTER_PORT, () => {
  console.log(`\n🦠🌌 ===== V127 DISTRIBUTED INFECTED MULTIVERSE =====`);
  console.log(`🌐 Master API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${MASTER_PORT}/api/multiverse/status`);
  console.log(`🌌 Initial universes: ${SWARM_SIZE} (30% pre-infected)`);
  console.log(`\n🦠 NETWORK VIRUS COMMANDS:`);
  console.log(`   Create infected: POST /api/multiverse/create -d '{"infected":true}'`);
  console.log(`   Infect universe:  POST /api/multiverse/uni-1/infect`);
  console.log(`   Virus apocalypse: POST /api/multiverse/virus-apocalypse`);
  console.log(`   Reset:            POST /api/multiverse/reset-all\n`);
});

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
