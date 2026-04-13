const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const express = require("express");

const BASE_PORT = 3100;
const MASTER_PORT = 3001;

// ===============================
// 1. ПОИСК ВСЕХ ЯДЕР
// ===============================
const cores = fs.readdirSync(".")
  .filter(f => f.startsWith("core-v") && f.endsWith(".js"));

console.log("💀 FOUND CORES:", cores.length);

// ===============================
// 2. ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ СТАТУСА ИЗ ЛЮБОГО ЯДРА
// ===============================
async function probeCore(port) {
  const endpoints = [
    "/api/status",
    "/",
    "/api/health",
    "/status",
    "/health"
  ];
  
  for (const endpoint of endpoints) {
    try {
      const data = await new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${port}${endpoint}`, (res) => {
          let body = "";
          res.on("data", c => body += c);
          res.on("end", () => {
            try {
              const json = JSON.parse(body);
              resolve(json);
            } catch(e) {
              reject(e);
            }
          });
        });
        req.on("error", reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error("timeout"));
        });
      });
      
      // Нашли работающий эндпоинт
      return {
        online: true,
        tick: data.tick || data.coreTick || 0,
        entropy: data.entropy || data.coreEntropy || 0.5,
        endpoint: endpoint,
        data: data
      };
    } catch(e) {
      // пробуем следующий
    }
  }
  
  return { online: false, error: "no_responding_endpoint" };
}

// ===============================
// 3. ЗАПУСК ЯДЕР
// ===============================
const nodes = [];

cores.forEach((file, i) => {
  const corePort = BASE_PORT + i;
  
  console.log(`🚀 ${file} on port ${corePort}`);
  
  const child = spawn("node", [file], {
    env: {
      ...process.env,
      PORT: corePort,
      NODE_ID: file.replace(".js", "")
    },
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("ERROR") && !msg.includes("EADDRINUSE")) {
      console.log(`[${file}] ${msg.slice(0, 100)}`);
    }
  });
  
  child.stderr.on("data", (data) => {
    const msg = data.toString().trim();
    if (!msg.includes("EADDRINUSE") && !msg.includes("deprecated")) {
      // Не выводим, чтобы не засорять консоль
    }
  });
  
  nodes.push({ 
    file, 
    port: corePort,
    child, 
    last: null,
    lastSeen: null
  });
});

// ===============================
// 4. MASTER СЕРВЕР
// ===============================
const app = express();

const masterState = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  lastSync: null,
  startTime: new Date().toISOString()
};

async function syncAllNodes() {
  let activeCount = 0;
  let maxTick = masterState.tick;
  
  for (const node of nodes) {
    const status = await probeCore(node.port);
    
    if (status.online) {
      activeCount++;
      node.last = status;
      node.lastSeen = new Date().toISOString();
      masterState.nodes[node.port] = {
        file: node.file,
        online: true,
        tick: status.tick,
        entropy: status.entropy,
        endpoint: status.endpoint,
        lastSeen: node.lastSeen
      };
      
      if (status.tick > maxTick) {
        maxTick = status.tick;
      }
      if (status.entropy !== undefined) {
        masterState.entropy = status.entropy;
      }
    } else {
      masterState.nodes[node.port] = {
        file: node.file,
        online: false,
        error: status.error,
        lastSeen: node.lastSeen
      };
    }
  }
  
  masterState.tick = maxTick;
  masterState.lastSync = new Date().toISOString();
  masterState.activeNodes = activeCount;
  
  return activeCount;
}

// Первая синхронизация через 5 секунд (даём ядрам время стартовать)
setTimeout(async () => {
  console.log("\n💀 Starting swarm sync...\n");
  const active = await syncAllNodes();
  console.log(`💀 Initial sync: ${active}/${nodes.length} cores online\n`);
  
  // Периодическая синхронизация
  setInterval(async () => {
    const active = await syncAllNodes();
    // Не выводим каждый раз, только при изменении
  }, 5000);
}, 5000);

// ===============================
// 5. API MASTER
// ===============================
app.get("/", (req, res) => {
  const active = Object.values(masterState.nodes).filter(n => n.online).length;
  res.json({
    status: "V125 SWARM MASTER (FIXED)",
    version: "2.0",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy,
    totalNodes: nodes.length,
    activeNodes: active,
    lastSync: masterState.lastSync,
    startTime: masterState.startTime
  });
});

app.get("/api/swarm/status", (req, res) => {
  const active = Object.values(masterState.nodes).filter(n => n.online).length;
  res.json({
    timestamp: new Date().toISOString(),
    activeNodes: active,
    totalNodes: nodes.length,
    uptime: process.uptime(),
    masterState: {
      tick: masterState.tick,
      entropy: masterState.entropy,
      lastSync: masterState.lastSync
    },
    nodes: masterState.nodes
  });
});

app.get("/api/swarm/sync", async (req, res) => {
  const active = await syncAllNodes();
  res.json({ 
    synced: true, 
    activeNodes: active,
    timestamp: new Date().toISOString() 
  });
});

app.get("/api/swarm/nodes/:port", async (req, res) => {
  const port = parseInt(req.params.port);
  const node = nodes.find(n => n.port === port);
  
  if (!node) {
    return res.status(404).json({ error: "node not found" });
  }
  
  const status = await probeCore(port);
  res.json({
    port,
    file: node.file,
    ...status
  });
});

// ===============================
// 6. ЗАПУСК MASTER
// ===============================
app.listen(MASTER_PORT, () => {
  console.log(`\n💀 ===== V125 SWARM MASTER (FIXED) =====`);
  console.log(`🌐 Master API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Swarm status: http://127.0.0.1:${MASTER_PORT}/api/swarm/status`);
  console.log(`🔍 Check node: http://127.0.0.1:${MASTER_PORT}/api/swarm/nodes/3100`);
  console.log(`🚀 Total cores: ${nodes.length}`);
  console.log(`⏳ Waiting 5 seconds for cores to start...\n`);
});

// Вывод статуса каждые 10 секунд
setInterval(async () => {
  const active = Object.values(masterState.nodes).filter(n => n && n.online).length;
  if (active > 0) {
    console.log(`💀 SWARM: ${active}/${nodes.length} online | Tick: ${masterState.tick} | Entropy: ${masterState.entropy.toFixed(4)}`);
  }
}, 10000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n💀 Shutting down swarm...");
  nodes.forEach(node => {
    try { node.child.kill(); } catch(e) {}
  });
  setTimeout(() => process.exit(), 1000);
});
