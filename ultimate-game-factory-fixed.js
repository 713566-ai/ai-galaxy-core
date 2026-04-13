#!/usr/bin/env node
// ============================================================
// 🎮🌌 ULTIMATE GAME FACTORY v4.1 — ИСПРАВЛЕННАЯ
// ============================================================

const express = require("express");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const crypto = require("crypto");
const WebSocket = require("ws");
const http = require("http");

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ===============================
// 📊 СОСТОЯНИЕ ВСЕЛЕННОЙ
// ===============================
let universe = {
  tick: 0,
  version: "4.1.0",
  startTime: Date.now(),
  
  world: { entropy: 0.45, stability: 0.65, consciousness: 0.3 },
  
  empires: [
    { id: "E1", name: "Aurora", strength: 0.75, wealth: 150, tech: 1.2, status: "stable", god: null, allies: [], color: "#667eea" },
    { id: "E2", name: "Obsidian", strength: 0.55, wealth: 100, tech: 0.8, status: "unstable", god: null, allies: [], color: "#764ba2" },
    { id: "E3", name: "Nexus", strength: 0.65, wealth: 120, tech: 1.0, status: "stable", god: null, allies: [], color: "#48c6ef" }
  ],
  
  agents: [
    { name: "codey", loyalty: "E1", fitness: 0.88, isGod: false, consciousness: 0.7 },
    { name: "uiax", loyalty: "E1", fitness: 0.65, isGod: false, consciousness: 0.4 },
    { name: "garlic", loyalty: "E2", fitness: 0.45, isGod: false, consciousness: 0.2 },
    { name: "nova", loyalty: "E3", fitness: 0.70, isGod: false, consciousness: 0.5 }
  ],
  
  history: { wars: 0, godAscensions: 0, technologies: 0, alliances: 0, mods: 0 },
  mods: [],
  evolutionLog: []
};

// ===============================
// 🧠 ИГРОВАЯ МЕХАНИКА
// ===============================
function gameTick() {
  universe.tick++;
  
  universe.empires.forEach(empire => {
    empire.strength += (Math.random() - 0.5) * 0.01;
    empire.strength = Math.max(0.3, Math.min(0.95, empire.strength));
    empire.wealth += empire.strength * 5;
    if (empire.tech) empire.tech += (Math.random() - 0.5) * 0.02;
    empire.tech = Math.max(0.5, Math.min(2.0, empire.tech));
  });
  
  universe.agents.forEach(agent => {
    const empire = universe.empires.find(e => e.id === agent.loyalty);
    if (empire) {
      agent.fitness += (Math.random() - 0.5) * 0.01;
      agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness));
      agent.consciousness += (Math.random() - 0.5) * 0.02;
      agent.consciousness = Math.max(0, Math.min(1, agent.consciousness));
    }
  });
  
  universe.empires.forEach(empire => {
    if (empire.god) return;
    const agents = universe.agents.filter(a => a.loyalty === empire.id);
    const bestAgent = agents.sort((a, b) => b.fitness - a.fitness)[0];
    if (bestAgent && bestAgent.fitness > 0.85 && empire.strength > 0.7 && bestAgent.consciousness > 0.6) {
      empire.god = bestAgent.name;
      bestAgent.isGod = true;
      universe.history.godAscensions++;
      broadcast({ type: "event", message: `👑 ${bestAgent.name} СТАЛ БОГОМ ${empire.name}!` });
      console.log(`👑 БОГ: ${bestAgent.name} (${empire.name})`);
    }
  });
  
  universe.world.entropy += (0.45 - universe.world.entropy) * 0.03;
  universe.world.stability = 1 - universe.world.entropy;
  universe.world.consciousness = universe.agents.reduce((sum, a) => sum + a.consciousness, 0) / universe.agents.length;
  
  if (universe.tick % 20 === 0) {
    const gods = universe.empires.filter(e => e.god).length;
    console.log(`🌌 ТИК ${universe.tick} | Энтропия:${universe.world.entropy.toFixed(3)} | Боги:${gods}`);
  }
}

// ===============================
// 🎮 ГЕНЕРАТОР WEB КЛИЕНТА
// ===============================
function generateWebClient() {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌌 Galaxy Universe Online</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #0a0a2a 0%, #1a1a3a 50%, #2a1a4a 100%); min-height: 100vh; color: #fff; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 30px 0; background: rgba(0,0,0,0.3); border-radius: 30px; margin-bottom: 30px; }
        .header h1 { font-size: 48px; background: linear-gradient(45deg, #ffd89b, #c7e9fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; margin-top: 10px; }
        .empires-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .empire-card { background: rgba(0,0,0,0.5); border-radius: 20px; padding: 20px; cursor: pointer; transition: all 0.3s; border: 2px solid transparent; }
        .empire-card:hover { transform: translateY(-5px); border-color: #ffd89b; }
        .empire-card.selected { border-color: #4CAF50; background: rgba(76,175,80,0.1); }
        .empire-name { font-size: 24px; margin-bottom: 15px; }
        .progress-bar { background: rgba(255,255,255,0.2); border-radius: 10px; height: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; border-radius: 10px; transition: width 0.3s; }
        .agents-list { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
        .agent-tag { background: rgba(255,255,255,0.1); border-radius: 20px; padding: 8px 16px; font-size: 14px; }
        .agent-god { background: linear-gradient(45deg, #ffd700, #ff8c00); color: #000; font-weight: bold; }
        .actions { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-bottom: 30px; }
        .action-btn { background: linear-gradient(45deg, #667eea, #764ba2); border: none; color: white; padding: 15px 30px; border-radius: 30px; font-size: 16px; cursor: pointer; transition: transform 0.2s; font-weight: bold; }
        .action-btn:hover { transform: scale(1.05); }
        .events { background: rgba(0,0,0,0.5); border-radius: 20px; padding: 20px; height: 200px; overflow-y: auto; }
        .event-item { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 14px; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .toast { position: fixed; bottom: 20px; right: 20px; background: #4CAF50; padding: 12px 24px; border-radius: 30px; animation: slideIn 0.3s; z-index: 1000; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @media (max-width: 768px) { .header h1 { font-size: 28px; } .stat-value { font-size: 24px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌌 GALAXY UNIVERSE ONLINE</h1>
            <p style="margin-top: 10px;">v${universe.version} | Мультивселенная стратегия</p>
        </div>
        
        <div class="stats">
            <div class="stat-card"><div>🌍 Энтропия</div><div class="stat-value" id="entropy">0.45</div></div>
            <div class="stat-card"><div>⚡ Стабильность</div><div class="stat-value" id="stability">0.65</div></div>
            <div class="stat-card"><div>👑 Боги</div><div class="stat-value" id="gods">0</div></div>
            <div class="stat-card"><div>⚔️ Войны</div><div class="stat-value" id="wars">0</div></div>
            <div class="stat-card"><div>🧠 Сознание</div><div class="stat-value" id="consciousness">0.30</div></div>
        </div>
        
        <h2 style="margin-bottom: 15px;">🏛️ ИМПЕРИИ</h2>
        <div class="empires-grid" id="empires"></div>
        
        <h2 style="margin-bottom: 15px;">🧬 АГЕНТЫ</h2>
        <div class="agents-list" id="agents"></div>
        
        <div class="actions">
            <button class="action-btn" onclick="sendAction('attack')">⚔️ АТАКОВАТЬ</button>
            <button class="action-btn" onclick="sendAction('upgrade')">🔬 ИССЛЕДОВАТЬ</button>
            <button class="action-btn" onclick="sendAction('trade')">💎 ТОРГОВЛЯ</button>
            <button class="action-btn" onclick="sendAction('pray')">🙏 МОЛИТЬСЯ</button>
            <button class="action-btn" onclick="sendAction('alliance')">🤝 АЛЬЯНС</button>
        </div>
        
        <h2 style="margin-bottom: 15px;">📜 СОБЫТИЯ</h2>
        <div class="events" id="events"></div>
    </div>
    
    <script>
        let selectedEmpire = null;
        let ws = null;
        
        function connectWebSocket() {
            ws = new WebSocket(\`ws://\${window.location.host}\`);
            ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                if (data.type === 'event') addEvent(data.message);
                if (data.type === 'state') updateUI(data.state);
            };
            ws.onclose = () => setTimeout(connectWebSocket, 1000);
        }
        
        async function fetchState() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                updateUI(data);
            } catch(e) { console.error(e); }
        }
        
        function updateUI(data) {
            document.getElementById('entropy').textContent = data.world?.entropy?.toFixed(3) || '0.45';
            document.getElementById('stability').textContent = data.world?.stability?.toFixed(3) || '0.65';
            document.getElementById('gods').textContent = data.empires?.filter(e => e.god).length || 0;
            document.getElementById('wars').textContent = data.history?.wars || 0;
            document.getElementById('consciousness').textContent = data.world?.consciousness?.toFixed(3) || '0.30';
            
            const empiresDiv = document.getElementById('empires');
            empiresDiv.innerHTML = (data.empires || []).map(e => \`
                <div class="empire-card \${selectedEmpire === e.id ? 'selected' : ''}" onclick="selectEmpire('\${e.id}')">
                    <div class="empire-name">\${e.name}</div>
                    <div>💪 Сила: \${(e.strength * 100).toFixed(0)}%</div>
                    <div class="progress-bar"><div class="progress-fill" style="width: \${e.strength * 100}%; background: \${e.color || '#667eea'}"></div></div>
                    <div>💰 Богатство: \${Math.floor(e.wealth)}</div>
                    <div>🔬 Технологии: \${e.tech?.toFixed(1) || 1}</div>
                    <div>👑 Бог: \${e.god || 'нет'}</div>
                    <div>🤝 Союзники: \${e.allies?.length || 0}</div>
                </div>
            \`).join('');
            
            const agentsDiv = document.getElementById('agents');
            agentsDiv.innerHTML = (data.agents || []).map(a => \`
                <div class="agent-tag \${a.isGod ? 'agent-god' : ''}">
                    \${a.name} | 🎯 \${a.loyalty} | ⚡ \${(a.fitness * 100).toFixed(0)}% \${a.isGod ? '👑' : ''}
                </div>
            \`).join('');
        }
        
        function selectEmpire(id) {
            selectedEmpire = id;
            showToast(\`✅ Выбрана империя\`);
            fetchState();
        }
        
        async function sendAction(action) {
            if (!selectedEmpire) { showToast('❌ Сначала выберите империю!'); return; }
            try {
                const res = await fetch(\`/api/game/\${action}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ empireId: selectedEmpire })
                });
                const data = await res.json();
                showToast(data.message);
                fetchState();
            } catch(e) { showToast('❌ Ошибка!'); }
        }
        
        function addEvent(message) {
            const eventsDiv = document.getElementById('events');
            eventsDiv.innerHTML = \`<div class="event-item">[\${new Date().toLocaleTimeString()}] \${message}</div>\` + eventsDiv.innerHTML;
            if (eventsDiv.children.length > 20) eventsDiv.removeChild(eventsDiv.lastChild);
        }
        
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
        
        connectWebSocket();
        fetchState();
        setInterval(fetchState, 2000);
    </script>
</body>
</html>`;
}

// ===============================
// 📦 ГЕНЕРАТОР ПОЛНОЙ ИГРЫ (ИСПРАВЛЕННЫЙ)
// ===============================
function generateFullGame() {
  const outputDir = path.join(process.cwd(), 'game-build');
  
  // Создаём все необходимые директории
  const dirs = ['public', 'client', 'server', 'installers'];
  dirs.forEach(d => {
    const dirPath = path.join(outputDir, d);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  });
  
  // Генерируем Web клиент
  const webClient = generateWebClient();
  fs.writeFileSync(path.join(outputDir, 'public', 'index.html'), webClient);
  
  // Генерируем сервер
  const serverCode = `const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

let universe = ${JSON.stringify(universe, null, 2)};

function broadcast(data) {
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data)); });
}

app.get('/api/status', (req, res) => res.json(universe));

app.post('/api/game/attack', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire) {
    const target = universe.empires.find(e => e.id !== req.body.empireId);
    if (target) {
      const damage = empire.strength * 10;
      target.wealth -= damage;
      universe.history.wars++;
      broadcast({ type: 'event', message: \`⚔️ \${empire.name} атакует \${target.name}!\` });
      res.json({ message: \`Атака! Урон: \${damage.toFixed(0)}\` });
    } else res.json({ message: 'Нет цели' });
  } else res.json({ message: 'Империя не найдена' });
});

app.post('/api/game/upgrade', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.wealth >= 50) {
    empire.wealth -= 50;
    empire.tech = (empire.tech || 1) + 0.1;
    universe.history.technologies++;
    broadcast({ type: 'event', message: \`🔬 \${empire.name} улучшил технологии!\` });
    res.json({ message: \`Технологии: \${empire.tech.toFixed(1)}\` });
  } else res.json({ message: 'Не хватает ресурсов!' });
});

app.post('/api/game/trade', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire) {
    const profit = empire.strength * 20;
    empire.wealth += profit;
    res.json({ message: \`Торговля: +\${profit.toFixed(0)}\` });
  } else res.json({ message: 'Ошибка' });
});

app.post('/api/game/pray', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.god) {
    empire.strength += 0.05;
    res.json({ message: \`🙏 \${empire.god} благословляет!\` });
  } else res.json({ message: 'Нет бога' });
});

app.post('/api/game/alliance', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.wealth >= 100) {
    const target = universe.empires.find(e => e.id !== empire.id && !empire.allies.includes(e.id));
    if (target) {
      empire.allies.push(target.id);
      target.allies.push(empire.id);
      empire.wealth -= 100;
      universe.history.alliances++;
      broadcast({ type: 'event', message: \`🤝 \${empire.name} + \${target.name}!\` });
      res.json({ message: \`Альянс с \${target.name}!\` });
    } else res.json({ message: 'Нет доступных союзников' });
  } else res.json({ message: 'Не хватает ресурсов' });
});

setInterval(() => {
  universe.tick++;
  universe.empires.forEach(e => {
    e.strength += (Math.random() - 0.5) * 0.01;
    e.strength = Math.max(0.3, Math.min(0.95, e.strength));
    e.wealth += e.strength * 5;
  });
  universe.world.entropy += (0.45 - universe.world.entropy) * 0.03;
}, 500);

const PORT = 3000;
server.listen(PORT, () => console.log(\`🎮 Game server on http://localhost:\${PORT}\`));`;
  
  fs.writeFileSync(path.join(outputDir, 'server.js'), serverCode);
  
  // Package.json
  const packageJson = {
    name: "galaxy-universe-online",
    version: "1.0.0",
    description: "🌌 Galaxy Universe Online - Multiplayer Strategy Game",
    main: "server.js",
    scripts: { start: "node server.js" },
    dependencies: { express: "^4.18.0", ws: "^8.14.0" }
  };
  fs.writeFileSync(path.join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // README
  const readme = `# 🌌 Galaxy Universe Online

## 🚀 Быстрый старт
\`\`\`bash
npm install
npm start
# Открыть http://localhost:3000
\`\`\`

## 🎮 Возможности
- 3 уникальные империи
- Система богов
- Технологии и торговля
- PvP сражения
- Реальное время

## 📄 Лицензия
MIT — полностью юридически чистая коммерческая игра

---
*Создано автоматически Ultimate Game Factory v4.1*`;
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
  
  console.log(`\n✅ ИГРА СОЗДАНА: ${outputDir}`);
  console.log(`📁 Файлы: server.js, public/index.html, package.json`);
  console.log(`🚀 Запуск: cd ${outputDir} && npm install && npm start`);
  
  return outputDir;
}

// ===============================
// 🚀 API
// ===============================
function broadcast(data) { 
  wss.clients.forEach(c => { 
    if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data)); 
  }); 
}

app.get("/", (req, res) => res.send(generateWebClient()));
app.get("/api/status", (req, res) => res.json(universe));

app.post("/api/game/attack", (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire) {
    const target = universe.empires.find(e => e.id !== req.body.empireId);
    if (target) {
      const damage = empire.strength * 10;
      target.wealth -= damage;
      universe.history.wars++;
      broadcast({ type: "event", message: `⚔️ ${empire.name} атакует ${target.name}!` });
      res.json({ message: `Атака! Урон: ${damage.toFixed(0)}` });
    } else res.json({ message: "Нет цели" });
  } else res.json({ message: "Империя не найдена" });
});

app.post("/api/game/upgrade", (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.wealth >= 50) {
    empire.wealth -= 50;
    empire.tech = (empire.tech || 1) + 0.1;
    universe.history.technologies++;
    broadcast({ type: "event", message: `🔬 ${empire.name} улучшил технологии!` });
    res.json({ message: `Технологии: ${empire.tech.toFixed(1)}` });
  } else res.json({ message: "Не хватает ресурсов!" });
});

app.post("/api/game/trade", (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire) {
    const profit = empire.strength * 20;
    empire.wealth += profit;
    res.json({ message: `Торговля: +${profit.toFixed(0)}` });
  } else res.json({ message: "Ошибка" });
});

app.post("/api/game/pray", (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.god) {
    empire.strength += 0.05;
    res.json({ message: `🙏 ${empire.god} благословляет!` });
  } else res.json({ message: "Нет бога" });
});

app.post("/api/game/alliance", (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.wealth >= 100) {
    const target = universe.empires.find(e => e.id !== empire.id && !empire.allies.includes(e.id));
    if (target) {
      empire.allies.push(target.id);
      target.allies.push(empire.id);
      empire.wealth -= 100;
      universe.history.alliances++;
      broadcast({ type: "event", message: `🤝 ${empire.name} + ${target.name}!` });
      res.json({ message: `Альянс с ${target.name}!` });
    } else res.json({ message: "Нет доступных союзников" });
  } else res.json({ message: "Не хватает ресурсов" });
});

app.post("/api/build/game", (req, res) => {
  try {
    const gameDir = generateFullGame();
    res.json({ success: true, message: "Игра создана!", path: gameDir });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// WebSocket
wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "state", state: universe }));
});

// ===============================
// 🔁 ЗАПУСК
// ===============================
setInterval(gameTick, 500);

const PORT = 3000;
server.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   🎮🌌 ULTIMATE GAME FACTORY v4.1 — ИГРА ЗАПУЩЕНА                         ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🌐 ИГРА: http://localhost:${PORT}`);
  console.log(`\n🎮 КОМАНДЫ: Атака | Исследование | Торговля | Молитва | Альянс`);
  console.log(`\n📦 СОЗДАТЬ УСТАНОВОЧНЫЙ ПАКЕТ: curl -X POST http://localhost:${PORT}/api/build/game`);
  console.log(`\n👑 codey скоро станет богом Aurora!\n`);
});

process.on("SIGINT", () => {
  console.log("\n💀 Остановка...");
  process.exit();
});
