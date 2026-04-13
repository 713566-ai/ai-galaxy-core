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
// 2. ЗАПУСК КАЖДОГО ЯДРА С АДАПТЕРОМ
// ===============================
const nodes = [];

cores.forEach((file, i) => {
  const targetPort = BASE_PORT + i;
  const adapterPort = targetPort + 1000; // 4100, 4101, etc
  
  console.log(`🚀 ${file} → adapter:${adapterPort} → core:${targetPort}`);
  
  // АДАПТЕР (прокси для старого ядра)
  const adapterApp = express();
  
  // Проксируем запросы к реальному ядру
  adapterApp.get("/api/ping", (req, res) => {
    http.get(`http://127.0.0.1:${targetPort}/api/ping`, (coreRes) => {
      let data = "";
      coreRes.on("data", c => data += c);
      coreRes.on("end", () => {
        try {
          const json = JSON.parse(data);
          res.json({ ...json, adapted: true, originalPort: targetPort });
        } catch(e) {
          res.json({ error: "parse_error", port: targetPort });
        }
      });
    }).on("error", () => {
      res.json({ error: "core_offline", port: targetPort });
    });
  });
  
  adapterApp.get("/api/status", (req, res) => {
    http.get(`http://127.0.0.1:${targetPort}/api/status`, (coreRes) => {
      let data = "";
      coreRes.on("data", c => data += c);
      coreRes.on("end", () => {
        try {
          res.json(JSON.parse(data));
        } catch(e) {
          res.json({ error: "parse_error" });
        }
      });
    }).on("error", () => {
      res.json({ error: "core_offline" });
    });
  });
  
  adapterApp.listen(adapterPort, () => {
    console.log(`   ✅ Adapter listening on ${adapterPort}`);
  });
  
  // ЗАПУСК ЯДРА с его родным портом (но изолированно)
  const child = spawn("node", [file], {
    env: {
      ...process.env,
      PORT: targetPort,
      NODE_ID: file.replace(".js", "")
    },
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("ERROR") || msg.includes("error")) {
      console.error(`[${file}] ${msg.slice(0, 150)}`);
    }
  });
  
  child.stderr.on("data", (data) => {
    // Игнорируем EADDRINUSE т.к. мы знаем что порты заняты
    const msg = data.toString().trim();
    if (!msg.includes("EADDRINUSE")) {
      console.error(`[${file}] ${msg.slice(0, 150)}`);
    }
  });
  
  nodes.push({ 
    file, 
    port: targetPort,
    adapterPort,
    child, 
    last: null 
  });
});

// ===============================
// 3. MASTER СЕРВЕР
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
    // Пингуем через адаптер
    http.get(`http://127.0.0.1:${node.adapterPort}/api/ping`, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          node.last = json;
          masterState.nodes[node.port] = json;
          masterState.lastSync = new Date().toISOString();
          
          if (json.tick > masterState.tick) {
            masterState.tick = json.tick;
          }
          if (json.entropy) masterState.entropy = json.entropy;
        } catch(e) {}
      });
    }).on("error", () => {
      masterState.nodes[node.port] = { error: "offline" };
    });
  });
}

setTimeout(() => {
  console.log("\n💀 Starting swarm sync...\n");
  syncAllNodes();
  setInterval(syncAllNodes, 3000);
}, 3000);

// API MASTER
app.get("/", (req, res) => {
  const active = Object.values(masterState.nodes).filter(n => n && !n.error).length;
  res.json({
    status: "V125 SWARM ADAPTER",
    masterTick: masterState.tick,
    masterEntropy: masterState.entropy,
    totalNodes: nodes.length,
    activeNodes: active,
    nodes: masterState.nodes
  });
});

app.get("/api/swarm/status", (req, res) => {
  const active = Object.values(masterState.nodes).filter(n => n && !n.error).length;
  res.json({
    timestamp: new Date().toISOString(),
    activeNodes: active,
    totalNodes: nodes.length,
    nodes: masterState.nodes,
    masterState: {
      tick: masterState.tick,
      entropy: masterState.entropy,
      lastSync: masterState.lastSync
    }
  });
});

app.listen(MASTER_PORT, () => {
  console.log(`\n💀 ===== V125 SWARM ADAPTER MASTER =====`);
  console.log(`🌐 Master API: http://127.0.0.1:${MASTER_PORT}`);
  console.log(`📊 Swarm status: http://127.0.0.1:${MASTER_PORT}/api/swarm/status`);
  console.log(`🚀 Nodes: ${nodes.length} (adapters on ports 4100-${4100+nodes.length-1})`);
  console.log(`⚠️  Old cores keep their ports but errors are suppressed\n`);
});

setInterval(() => {
  const active = Object.values(masterState.nodes).filter(n => n && !n.error).length;
  console.log(`💀 SWARM: ${active}/${nodes.length} responsive | Master tick: ${masterState.tick}`);
}, 10000);

process.on("SIGINT", () => {
  console.log("\n💀 Shutting down swarm...");
  nodes.forEach(node => {
    try { node.child.kill(); } catch(e) {}
  });
  process.exit();
});
