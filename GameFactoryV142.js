// ===============================
// 🏭 V142 GAME FACTORY ENGINE
// ===============================
// 4 этапа: DESIGN → COMPOSE → BUILD → RUN
// ===============================

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class GameFactoryV142 {
  constructor(core) {
    this.core = core;
    this.projectPath = path.join(__dirname, "generated-game");
    this.currentGame = null;
    this.gameProcess = null;
  }

  // ===============================
  // 1. DESIGN PHASE (генерация структуры)
  // ===============================
  designGame(worldState, swarmState) {
    const entropy = worldState?.entropy || 0.5;
    const stability = worldState?.stability || 0.5;
    const aliveNodes = swarmState?.aliveNodes || 11;
    
    // Выбор жанра на основе состояния
    let genre = "sandbox-strategy";
    let mechanics = ["combat", "economy", "ai-agents"];
    
    if (entropy > 0.7) {
      genre = "survival-roguelike";
      mechanics = ["random-events", "permadeath", "resource-scarcity"];
    } else if (stability > 0.7) {
      genre = "empire-builder";
      mechanics = ["diplomacy", "trade", "expansion"];
    } else if (aliveNodes < 5) {
      genre = "post-apocalyptic";
      mechanics = ["scavenging", "alliances", "defense"];
    }
    
    this.currentGame = {
      id: `game_${Date.now()}`,
      name: `AutoGame_${Date.now().toString().slice(-6)}`,
      genre: genre,
      mechanics: mechanics,
      tickRate: 1000,
      difficulty: entropy,
      systems: ["combat", "economy", "ai-agents", "world-sim"],
      version: "1.0.0",
      createdAt: new Date().toISOString()
    };
    
    console.log(`📐 [DESIGN] Game: ${this.currentGame.name} (${genre})`);
    return this.currentGame;
  }

  // ===============================
  // 2. COMPOSE PHASE (сборка модулей)
  // ===============================
  composeModules() {
    return {
      server: this.generateServerModule(),
      world: this.generateWorldModule(),
      agents: this.generateAgentsModule(),
      combat: this.generateCombatModule(),
      economy: this.generateEconomyModule(),
      package: this.generatePackageJson()
    };
  }

  generateServerModule() {
    return `
// 🎮 AUTO-GENERATED GAME SERVER
// Game: ${this.currentGame?.name}
// Genre: ${this.currentGame?.genre}

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static("public"));

let gameState = {
  tick: 0,
  players: 0,
  world: require("./world"),
  agents: require("./agents"),
  combat: require("./combat"),
  economy: require("./economy")
};

// API
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    game: "${this.currentGame?.name}",
    tick: gameState.tick,
    players: gameState.players,
    genre: "${this.currentGame?.genre}"
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ pong: true, tick: gameState.tick });
});

// WebSocket для реального времени
wss.on("connection", (ws) => {
  gameState.players++;
  ws.on("close", () => { gameState.players--; });
  ws.send(JSON.stringify({ type: "connected", message: "Welcome to the game!" }));
});

// Игровой цикл
setInterval(() => {
  gameState.tick++;
  gameState.world.evolve();
  
  // Отправляем состояние всем клиентам
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "state",
        tick: gameState.tick,
        world: gameState.world.getState(),
        economy: gameState.economy.getStats()
      }));
    }
  });
  
  if (gameState.tick % 20 === 0) {
    console.log(\`🎮 [GAME] tick \${gameState.tick} | players: \${gameState.players}\`);
  }
  
}, ${this.currentGame?.tickRate || 1000});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(\`🎮 GAME SERVER RUNNING ON http://localhost:\${PORT}\`);
  console.log(\`📊 API: http://localhost:\${PORT}/api/status\`);
});
`;
  }

  generateWorldModule() {
    return `
// 🌍 WORLD MODULE
let world = {
  tick: 0,
  entropy: ${this.currentGame?.difficulty || 0.5},
  stability: ${1 - (this.currentGame?.difficulty || 0.5)},
  events: []
};

function evolve() {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.02;
  world.entropy = Math.max(0.1, Math.min(0.9, world.entropy));
  world.stability = 1 - world.entropy;
  
  // Генерация случайных событий
  if (Math.random() < 0.1) {
    const events = ["storm", "discovery", "conflict", "trade", "celebration"];
    const event = events[Math.floor(Math.random() * events.length)];
    world.events.unshift({ type: event, tick: world.tick });
    if (world.events.length > 20) world.events.pop();
  }
}

function getState() {
  return {
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    stability: world.stability.toFixed(3),
    recentEvents: world.events.slice(0, 5)
  };
}

module.exports = { evolve, getState };
`;
  }

  generateAgentsModule() {
    return `
// 🤖 AGENTS MODULE
const agents = [];

// Генерация начальных агентов
for (let i = 0; i < 5; i++) {
  agents.push({
    id: \`agent_\${i}\`,
    name: \`Agent-\${String.fromCharCode(65 + i)}\`,
    power: 0.3 + Math.random() * 0.5,
    loyalty: null,
    experience: 0
  });
}

function getAll() {
  return agents;
}

function update() {
  for (const agent of agents) {
    agent.experience++;
    agent.power += (Math.random() - 0.5) * 0.02;
    agent.power = Math.max(0.1, Math.min(0.95, agent.power));
  }
}

function getStrongest() {
  return agents.sort((a, b) => b.power - a.power)[0];
}

module.exports = { getAll, update, getStrongest };
`;
  }

  generateCombatModule() {
    return `
// ⚔️ COMBAT MODULE
function fight(attacker, defender) {
  const attackPower = attacker.power * (0.5 + Math.random() * 0.5);
  const defendPower = defender.power * (0.3 + Math.random() * 0.7);
  
  if (attackPower > defendPower) {
    const damage = (attackPower - defendPower) * 10;
    return { winner: attacker, loser: defender, damage: damage.toFixed(1) };
  } else {
    const damage = (defendPower - attackPower) * 5;
    return { winner: defender, loser: attacker, damage: damage.toFixed(1) };
  }
}

function simulateBattle(teamA, teamB) {
  const results = [];
  for (let i = 0; i < Math.min(teamA.length, teamB.length); i++) {
    results.push(fight(teamA[i], teamB[i]));
  }
  return results;
}

module.exports = { fight, simulateBattle };
`;
  }

  generateEconomyModule() {
    return `
// 💰 ECONOMY MODULE
let resources = {
  gold: 1000,
  wood: 500,
  stone: 300,
  food: 800
};

const prices = {
  wood: 2,
  stone: 3,
  food: 1
};

function getStats() {
  return { ...resources };
}

function trade(resource, amount, direction) {
  const price = (prices[resource] || 2) * amount;
  
  if (direction === "buy") {
    if (resources.gold >= price) {
      resources.gold -= price;
      resources[resource] += amount;
      return { success: true, message: \`Bought \${amount} \${resource}\` };
    }
    return { success: false, message: "Not enough gold" };
  }
  
  if (direction === "sell") {
    if (resources[resource] >= amount) {
      resources.gold += price;
      resources[resource] -= amount;
      return { success: true, message: \`Sold \${amount} \${resource}\` };
    }
    return { success: false, message: \`Not enough \${resource}\` };
  }
  
  return { success: false, message: "Invalid direction" };
}

function produce(resource, amount) {
  resources[resource] = (resources[resource] || 0) + amount;
}

module.exports = { getStats, trade, produce };
`;
  }

  generatePackageJson() {
    return {
      name: this.currentGame?.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: "1.0.0",
      description: `Auto-generated game - ${this.currentGame?.genre}`,
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "nodemon server.js"
      },
      dependencies: {
        express: "^4.18.0",
        ws: "^8.14.0"
      },
      devDependencies: {
        nodemon: "^3.0.0"
      }
    };
  }

  // ===============================
  // 3. BUILD PHASE (сборка проекта)
  // ===============================
  build() {
    // Создаём директорию проекта
    if (!fs.existsSync(this.projectPath)) {
      fs.mkdirSync(this.projectPath, { recursive: true });
    }
    
    // Создаём поддиректории
    const publicPath = path.join(this.projectPath, "public");
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
    }
    
    // Генерируем все модули
    const modules = this.composeModules();
    
    fs.writeFileSync(path.join(this.projectPath, "server.js"), modules.server);
    fs.writeFileSync(path.join(this.projectPath, "world.js"), modules.world);
    fs.writeFileSync(path.join(this.projectPath, "agents.js"), modules.agents);
    fs.writeFileSync(path.join(this.projectPath, "combat.js"), modules.combat);
    fs.writeFileSync(path.join(this.projectPath, "economy.js"), modules.economy);
    fs.writeFileSync(path.join(this.projectPath, "package.json"), JSON.stringify(modules.package, null, 2));
    
    // Генерация простого HTML клиента
    const htmlClient = `
<!DOCTYPE html>
<html>
<head>
    <title>${this.currentGame?.name}</title>
    <style>
        body { font-family: monospace; background: #0a0a2a; color: #fff; padding: 20px; }
        .status { background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; }
        .info { margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🎮 ${this.currentGame?.name}</h1>
    <div class="status">
        <div>Status: <span id="status">connecting...</span></div>
        <div>Tick: <span id="tick">0</span></div>
        <div>Players: <span id="players">0</span></div>
    </div>
    <div class="info" id="info"></div>
    <script>
        const ws = new WebSocket('ws://' + location.host);
        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === 'connected') {
                document.getElementById('status').textContent = 'online';
            }
            if (data.type === 'state') {
                document.getElementById('tick').textContent = data.tick;
                document.getElementById('info').innerHTML = '<pre>' + JSON.stringify(data.world, null, 2) + '</pre>';
            }
        };
        setInterval(() => {
            fetch('/api/status').then(r => r.json()).then(d => {
                document.getElementById('players').textContent = d.players;
            });
        }, 2000);
    </script>
</body>
</html>
`;
    fs.writeFileSync(path.join(publicPath, "index.html"), htmlClient);
    
    console.log(`🔨 [BUILD] Game built at ${this.projectPath}`);
    return "BUILD COMPLETE";
  }

  // ===============================
  // 4. RUN PHASE (автозапуск)
  // ===============================
  run() {
    // Останавливаем предыдущий процесс если есть
    if (this.gameProcess) {
      this.gameProcess.kill();
    }
    
    console.log("🚀 [RUN] Starting game server...");
    
    // Устанавливаем зависимости
    const { exec } = require("child_process");
    exec(`cd ${this.projectPath} && npm install --silent 2>/dev/null`, (err) => {
      if (err) {
        console.log("⚠️ [RUN] npm install warning:", err.message);
      }
      
      // Запускаем игру
      this.gameProcess = spawn("node", [path.join(this.projectPath, "server.js")], {
        detached: false,
        stdio: "pipe"
      });
      
      this.gameProcess.stdout.on("data", (data) => {
        const msg = data.toString().trim();
        if (msg.includes("GAME SERVER RUNNING")) {
          console.log(`✅ [RUN] ${msg}`);
        } else if (!msg.includes("npm") && msg.length > 0) {
          console.log(`   ${msg}`);
        }
      });
      
      this.gameProcess.stderr.on("data", (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes("deprecated")) {
          console.log(`   ⚠️ ${msg.slice(0, 100)}`);
        }
      });
      
      this.gameProcess.on("exit", (code) => {
        if (code !== 0) {
          console.log(`💀 [RUN] Game process exited with code ${code}, restarting...`);
          setTimeout(() => this.run(), 2000);
        }
      });
    });
    
    return "GAME STARTED";
  }

  // ===============================
  // FULL PIPELINE
  // ===============================
  deploy(worldState, swarmState) {
    console.log("\n🏭 ===== GAME FACTORY V142 DEPLOY =====");
    this.designGame(worldState, swarmState);
    this.build();
    this.run();
    console.log("🏭 ===== DEPLOY COMPLETE =====\n");
    return this.currentGame;
  }
  
  getStatus() {
    return {
      currentGame: this.currentGame,
      projectPath: this.projectPath,
      isRunning: this.gameProcess !== null
    };
  }
}

module.exports = GameFactoryV142;
