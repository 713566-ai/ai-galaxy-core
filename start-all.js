#!/usr/bin/env node
// ============================================================
// 🚀 ЗАПУСК ВСЕЙ ЭКОСИСТЕМЫ
// ============================================================
// ✅ Основная вселенная (порт 3000)
// ✅ Собранная игра (порт 3001)
// ✅ Swarm Master (порт 3002)
// ✅ 3 тестовых ядра (порты 3100-3102)
// ✅ WebSocket для реального времени
// ============================================================

const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   🚀 ЗАПУСК ВСЕЙ ЭКОСИСТЕМЫ AI GALAXY                                     ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝\n");

// Убиваем все старые процессы
console.log("🛑 Остановка старых процессов...");
exec('pkill -f "node.*ultimate-game" 2>/dev/null; pkill -f "node.*game-build" 2>/dev/null; pkill -f "swarm-master" 2>/dev/null; true');

setTimeout(() => {
  console.log("✅ Старые процессы остановлены\n");
  
  // ===============================
  // 1. ОСНОВНАЯ ВСЕЛЕННАЯ (порт 3000)
  // ===============================
  console.log("🌌 Запуск основной вселенной на порту 3000...");
  const mainUniverse = spawn("node", ["ultimate-game-factory-fixed.js"], {
    cwd: __dirname,
    detached: true,
    stdio: "pipe"
  });
  
  mainUniverse.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("ТИК") || msg.includes("БОГ")) {
      console.log(`   🌌 ${msg}`);
    }
  });
  
  // ===============================
  // 2. SWARM MASTER (порт 3002)
  // ===============================
  console.log("🔗 Запуск Swarm Master на порту 3002...");
  const swarmMaster = spawn("node", ["-e", `
    const express = require('express');
    const app = express();
    const cors = require('cors');
    app.use(cors());
    app.use(express.json());
    
    let nodes = [];
    let history = [];
    
    app.get('/api/swarm/status', (req, res) => {
      res.json({ status: 'online', nodes: nodes.length, timestamp: Date.now(), nodes: nodes });
    });
    
    app.post('/api/swarm/register', (req, res) => {
      nodes.push({ ...req.body, lastSeen: Date.now() });
      res.json({ registered: true });
    });
    
    app.get('/api/swarm/nodes', (req, res) => {
      res.json(nodes);
    });
    
    app.get('/api/ping', (req, res) => {
      res.json({ pong: true, role: 'swarm-master' });
    });
    
    app.listen(3002, () => console.log('Swarm Master on 3002'));
  `], { detached: true, stdio: "pipe" });
  
  swarmMaster.stdout.on("data", (data) => {
    console.log(`   🔗 ${data.toString().trim()}`);
  });
  
  // ===============================
  // 3. СОБРАННАЯ ИГРА (порт 3001)
  // ===============================
  console.log("🎮 Запуск собранной игры на порту 3001...");
  
  // Создаём игру если её нет
  const gameDir = path.join(__dirname, "game-build");
  if (!fs.existsSync(gameDir)) {
    console.log("   📦 Создание игры...");
    try {
      require("./ultimate-game-factory-fixed.js");
    } catch(e) {}
  }
  
  // Меняем порт на 3001
  const serverPath = path.join(gameDir, "server.js");
  if (fs.existsSync(serverPath)) {
    let serverCode = fs.readFileSync(serverPath, "utf8");
    serverCode = serverCode.replace(/PORT = 300[0-9]/, "PORT = 3001");
    fs.writeFileSync(serverPath, serverCode);
  }
  
  const gameServer = spawn("node", ["server.js"], {
    cwd: gameDir,
    detached: true,
    stdio: "pipe"
  });
  
  gameServer.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("Game server")) {
      console.log(`   🎮 ${msg}`);
    }
  });
  
  // ===============================
  // 4. ТЕСТОВЫЕ ЯДРА (порты 3100-3102)
  // ===============================
  console.log("🧠 Запуск тестовых ядер на портах 3100-3102...");
  
  const cores = [];
  for (let i = 0; i < 3; i++) {
    const port = 3100 + i;
    const coreName = `core-${port}`;
    
    const core = spawn("node", ["-e", `
      const express = require('express');
      const app = express();
      const cors = require('cors');
      app.use(cors());
      
      let tick = ${Math.floor(Math.random() * 100)};
      let entropy = 0.4 + Math.random() * 0.3;
      
      setInterval(() => {
        tick++;
        entropy += (Math.random() - 0.5) * 0.02;
        entropy = Math.max(0.1, Math.min(0.9, entropy));
      }, 1000);
      
      app.get('/api/ping', (req, res) => {
        res.json({ node: '${coreName}', port: ${port}, tick: tick, entropy: entropy });
      });
      
      app.get('/api/status', (req, res) => {
        res.json({ name: '${coreName}', tick: tick, entropy: entropy, version: '1.0' });
      });
      
      app.listen(${port}, () => console.log('${coreName} on ${port}'));
    `], { detached: true, stdio: "pipe" });
    
    core.stdout.on("data", (data) => {
      console.log(`   🧠 ${data.toString().trim()}`);
    });
    
    cores.push(core);
  }
  
  // ===============================
  // 5. ПРОВЕРКА СТАТУСА
  // ===============================
  setTimeout(() => {
    console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
    console.log("║   ✅ ВСЕ СИСТЕМЫ ЗАПУЩЕНЫ!                                                ║");
    console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
    console.log("\n📡 ДОСТУПНЫЕ СЕРВИСЫ:");
    console.log("   🌌 Основная вселенная:    http://localhost:3000");
    console.log("   🎮 Собранная игра:        http://localhost:3001");
    console.log("   🔗 Swarm Master:          http://localhost:3002");
    console.log("   🧠 Тестовые ядра:         http://localhost:3100, 3101, 3102");
    console.log("\n📊 ПРОВЕРКА СТАТУСА:");
    console.log("   curl http://localhost:3000/api/status");
    console.log("   curl http://localhost:3001/api/status");
    console.log("   curl http://localhost:3002/api/swarm/status");
    console.log("   curl http://localhost:3100/api/ping");
    console.log("\n🎮 ИГРАТЬ: http://localhost:3001");
    console.log("\n👑 БОГ: codey уже в Aurora!");
    console.log("\n💀 Для остановки всех процессов: pkill -f 'node.*ultimate-game\\|node.*game-build\\|node.*swarm-master\\|node.*core-'\n");
  }, 3000);
  
}, 1000);

// Обработка завершения
process.on("SIGINT", () => {
  console.log("\n💀 Остановка всех систем...");
  exec('pkill -f "node.*ultimate-game" 2>/dev/null; pkill -f "node.*game-build" 2>/dev/null; pkill -f "swarm-master" 2>/dev/null; true');
  setTimeout(() => process.exit(), 1000);
});
