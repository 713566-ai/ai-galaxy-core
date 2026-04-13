const { spawn } = require("child_process");
const http = require("http");
const express = require("express");

const MASTER_PORT = 3001;
const SWARM_SIZE = 5; // 5 параллельных вселенных
const BASE_PORT = 3200;

// ===============================
// 1. СОЗДАЁМ МИНИ-ЯДРО ДЛЯ SWARM
// ===============================
const coreCode = `
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3200;
const NODE_ID = process.env.NODE_ID || "node";

// УНИКАЛЬНОЕ СОСТОЯНИЕ ДЛЯ КАЖДОЙ НОДЫ
let worldState = {
  tick: 0,
  entropy: 0.5 + (Math.random() - 0.5) * 0.2,
  nodeId: NODE_ID,
  startTime: Date.now()
};

// ТИКАЕМ КАЖДУЮ СЕКУНДУ
setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, 
    worldState.entropy + (Math.random() - 0.5) * 0.03
  ));
}, 1000);

// API
app.get("/", (req, res) => {
  res.json({ 
    status: "swarm-node", 
    nodeId: NODE_ID,
    ...worldState 
  });
});

app.get("/api/status", (req, res) => {
  res.json(worldState);
});

app.get("/api/ping", (req, res) => {
  res.json({ 
    online: true, 
    nodeId: NODE_ID,
    tick: worldState.tick,
    entropy: worldState.entropy
  });
});

app.listen(PORT, () => {
  console.log(\`   ✅ Node \${NODE_ID} on port \${PORT}\`);
});
`;

// ===============================
// 2. ЗАПУСКАЕМ НОДЫ
// ===============================
const nodes = [];

for (let i = 0; i < SWARM_SIZE; i++) {
  const port = BASE_PORT + i;
  const nodeId = `swarm-${i + 1}`;
  
  console.log(`🚀 Starting ${nodeId} on port ${port}`);
  
  const child = spawn("node", ["-e", coreCode], {
    env: {
      ...process.env,
      PORT: port,
      NODE_ID: nodeId
    },
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (!msg.includes("✅")) console.log(`[${nodeId}] ${msg}`);
  });
  
  child.stderr.on("data", (data) => {
    console.error(`[${nodeId}] ERROR: ${data.toString().trim().slice(0, 100)}`);
  });
  
  nodes.push({ nodeId, port, child, last: null });
}

// ===============================
// 3. MASTER ДЛЯ СБОРА ДАННЫХ
// ===============================
const app = express();
const masterState = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  lastSync: null
};

function syncAllNodes() {
  nodes.forEach(node => {
    http.get(`http://127.0.0.1:${node.port}/api/ping`, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          node.last = json;
          masterState.nodes[node.nodeId] = {
            online: true,
            tick: json.tick,
            entropy: json.entropy,
            port: node.port
          };
          
          // Агрегируем данные
          let totalTick = 0;
          let totalEntropy = 0;
          let onlineCount = 0;
          
          nodes.forEach(n => {
            if (n.last) {
              totalTick += n.last.tick;
              totalEntropy += n.last.entropy;
              onlineCount++;
            }
          });
          
          if (onlineCount > 0) {
            masterState.tick = Math.round(totalTick / onlineCount);
            masterState.entropy = totalEntropy / onlineCount;
          }
          
          masterState.lastSync = new Date().toISOString();
        } catch(e) {}
      });
    }).on("error", (err) => {
      masterState.nodes[node.nodeId] = { online: false, error: "offline" };
    });
  });
}

// Задержка перед стартом синхронизации
setTimeout(() => {
  console.log("\n💀 Starting swarm synchronization...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 2000);
}, 2000);

// ===============================
// 4. API MASTER
// ===============================
app.get("/", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  res.json({
    status: "V124 REAL SWARM MASTER",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy.toFixed(4),
    swarmSize: SWARM_SIZE,
    onlineNodes: online,
    lastSync: masterState.lastSync
  });
});

app.get("/api/swarm/status", (req, res) => {
  const online = Object.values(masterState.nodes).filter(n => n.online).length;
  res.json({
    timestamp: new Date().toISOString(),
    onlineNodes: online,
    totalNodes: SWARM_SIZE,
    masterState: {
      tick: masterState.tick,
      entropy: masterState.entropy,
      lastSync: masterState.lastSync
    },
    nodes: masterState.nodes
  });
});

app.get("/api/swarm/sync", (req, res) => {
  syncAllNodes();
  res.json({ synced: true });
});

// ===============================
// 5. ЗАПУСК
// ===============================
app.listen(MASTER_PORT, () => {
  console.log(`\n💀 ===== V124 REAL SWARM MASTER =====`);
  console.log(`🌐 Master API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${MASTER_PORT}/api/swarm/status`);
  console.log(`🚀 Swarm size: ${SWARM_SIZE} parallel universes`);
  console.log(`📡 Nodes on ports: ${BASE_PORT}-${BASE_PORT + SWARM_SIZE - 1}\n`);
});

// Статус в консоль
setInterval(() => {
  const online = Object.values(masterState.nodes).filter(n => n && n.online).length;
  if (online > 0) {
    console.log(`💀 SWARM: ${online}/${SWARM_SIZE} nodes | Master tick: ${masterState.tick} | Entropy: ${masterState.entropy.toFixed(4)}`);
  }
}, 5000);

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down swarm...");
  nodes.forEach(node => node.child.kill());
  process.exit();
});
