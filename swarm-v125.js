// =====================================================
// 💀 V125 SWARM FULL CONNECTOR (SAFE EDITION)
// =====================================================
// - собирает все core-v*.js
// - поднимает их как workers
// - синхронизирует worldState
// - подключает к master (3000)
// =====================================================

const fs = require("fs");
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const MASTER_PORT = 3000;
const SWARM_PORT = 3003;  // Отдельный порт для swarm API

const workers = [];
const workerStatus = new Map();

// ===============================
// ПОИСК ВСЕХ ЯДЕР
// ===============================
const cores = fs.readdirSync(".")
  .filter(f => f.startsWith("core-v") && f.endsWith(".js"));

console.log("\n💀 V125 SWARM CONNECTOR");
console.log("📡 SCANNING CORES:", cores.length);
console.log("🌐 MASTER PORT:", MASTER_PORT);
console.log("🔗 SWARM PORT:", SWARM_PORT);
console.log("");

// ===============================
// ЗАПУСК WORKERS (без конфликтов)
// ===============================
for (const file of cores) {
  // Определяем свободный порт для каждого ядра
  const basePort = 4000;
  const workerPort = basePort + workers.length;
  
  console.log(`🚀 starting: ${file} on port ${workerPort}`);
  
  const p = spawn("node", [file], {
    env: {
      ...process.env,
      PORT: workerPort,
      SWARM_WORKER: "true",
      PARENT_PID: process.pid
    },
    stdio: "pipe",
    detached: false
  });
  
  // Логирование ошибок
  p.stderr.on("data", (data) => {
    const msg = data.toString();
    if (!msg.includes("EADDRINUSE") && !msg.includes("deprecated")) {
      console.log(`   ⚠️ [${file}]: ${msg.slice(0, 100)}`);
    }
  });
  
  p.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg && !msg.includes("listening")) {
      // console.log(`   📡 [${file}]: ${msg.slice(0, 80)}`);
    }
  });
  
  workers.push({
    file,
    process: p,
    port: workerPort,
    status: "starting",
    lastTick: 0,
    lastSeen: Date.now()
  });
  
  workerStatus.set(file, { status: "starting", port: workerPort });
}

console.log(`\n✅ ЗАПУЩЕНО WORKERS: ${workers.length}\n`);

// ===============================
// SWARM STATE
// ===============================
let swarmState = {
  tick: 0,
  entropy: 0.5,
  nodes: cores.length,
  activeWorkers: 0,
  workers: [],
  startTime: Date.now(),
  lastSync: null
};

// ===============================
// СИНХРОНИЗАЦИЯ С ВОРКЕРАМИ
// ===============================
async function syncWorkers() {
  let activeCount = 0;
  let totalTick = 0;
  let totalEntropy = 0;
  
  for (const worker of workers) {
    try {
      const result = await pingWorker(worker.port);
      if (result) {
        activeCount++;
        worker.status = "active";
        worker.lastTick = result.tick || 0;
        worker.lastSeen = Date.now();
        totalTick += worker.lastTick;
        totalEntropy += result.entropy || 0.5;
        
        workerStatus.set(worker.file, {
          status: "active",
          port: worker.port,
          tick: worker.lastTick,
          lastSeen: new Date(worker.lastSeen).toISOString()
        });
      } else {
        worker.status = "inactive";
        workerStatus.set(worker.file, { status: "inactive", port: worker.port });
      }
    } catch(e) {
      worker.status = "error";
    }
  }
  
  swarmState.activeWorkers = activeCount;
  swarmState.lastSync = new Date().toISOString();
  
  if (activeCount > 0) {
    swarmState.tick = Math.round(totalTick / activeCount);
    swarmState.entropy = totalEntropy / activeCount;
  }
  
  swarmState.workers = Array.from(workerStatus.entries()).map(([name, data]) => ({
    name: name.replace(".js", ""),
    ...data
  }));
}

function pingWorker(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/ping`, (res) => {
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
}

// ===============================
// SWARM LOOP
// ===============================
setInterval(() => {
  swarmState.tick++;
  swarmState.entropy = Math.max(0, Math.min(1,
    swarmState.entropy + (Math.random() - 0.5) * 0.01
  ));
  
  // Синхронизация каждые 5 секунд
  if (swarmState.tick % 5 === 0) {
    syncWorkers();
  }
  
  // Логирование каждые 20 тиков
  if (swarmState.tick % 20 === 0) {
    console.log(`🌌 SWARM TICK: ${swarmState.tick} | Workers: ${swarmState.activeWorkers}/${swarmState.nodes} | Entropy: ${swarmState.entropy.toFixed(3)}`);
  }
}, 1000);

// ===============================
// SWARM API (ОТДЕЛЬНЫЙ СЕРВЕР)
// ===============================
const express = require("express");
const swarmApp = express();
const cors = require("cors");
swarmApp.use(cors());
swarmApp.use(express.json());

// Статус swarm
swarmApp.get("/", (req, res) => {
  res.json({
    status: "💀 V125 SWARM CONNECTOR",
    version: "1.0",
    swarmState: {
      tick: swarmState.tick,
      entropy: swarmState.entropy.toFixed(4),
      activeWorkers: swarmState.activeWorkers,
      totalWorkers: swarmState.nodes,
      uptime: Math.floor((Date.now() - swarmState.startTime) / 1000)
    },
    workers: swarmState.workers
  });
});

// Детальный статус
swarmApp.get("/api/swarm/status", (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    swarm: {
      tick: swarmState.tick,
      entropy: swarmState.entropy,
      activeWorkers: swarmState.activeWorkers,
      totalWorkers: swarmState.nodes
    },
    workers: swarmState.workers,
    lastSync: swarmState.lastSync
  });
});

// Принудительная синхронизация
swarmApp.post("/api/swarm/sync", async (req, res) => {
  await syncWorkers();
  res.json({ synced: true, activeWorkers: swarmState.activeWorkers });
});

// Получить конкретного воркера
swarmApp.get("/api/swarm/worker/:name", (req, res) => {
  const worker = workers.find(w => w.file === req.params.name || w.file.includes(req.params.name));
  if (worker) {
    res.json({
      file: worker.file,
      port: worker.port,
      status: worker.status,
      lastTick: worker.lastTick,
      lastSeen: worker.lastSeen
    });
  } else {
    res.status(404).json({ error: "Worker not found" });
  }
});

// Запуск swarm API сервера
swarmApp.listen(SWARM_PORT, () => {
  console.log(`🔗 SWARM API: http://127.0.0.1:${SWARM_PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${SWARM_PORT}/api/swarm/status`);
});

// ===============================
// ПОДКЛЮЧЕНИЕ К MASTER (core.js)
// ===============================
async function connectToMaster() {
  try {
    const result = await pingWorker(MASTER_PORT);
    if (result) {
      console.log(`🔗 СВЯЗЬ С MASTER (${MASTER_PORT}) УСТАНОВЛЕНА`);
      return true;
    }
  } catch(e) {}
  console.log(`⚠️ MASTER (${MASTER_PORT}) НЕ ДОСТУПЕН`);
  return false;
}

setTimeout(() => {
  connectToMaster();
}, 2000);

// ===============================
// GRACEFUL SHUTDOWN
// ===============================
process.on("SIGINT", () => {
  console.log("\n💀 ОСТАНОВКА SWARM...");
  for (const worker of workers) {
    try {
      worker.process.kill();
    } catch(e) {}
  }
  setTimeout(() => process.exit(), 1000);
});

console.log("💀 V125 SWARM CONNECTOR ONLINE");
console.log(`   Workers: ${workers.length}`);
console.log(`   Swarm API: http://127.0.0.1:${SWARM_PORT}`);
console.log("");

// Периодический вывод статуса
setInterval(() => {
  console.log(`💀 SWARM: ${swarmState.activeWorkers}/${swarmState.nodes} active | Tick: ${swarmState.tick} | Entropy: ${swarmState.entropy.toFixed(3)}`);
}, 10000);
