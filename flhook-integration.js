const express = require('express');
const fs = require('fs');
const net = require('net');
const axios = require('axios');
const app = express();
const PORT = 3003;

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║   🎮 AI GALAXY CORE - FREELANCER FLHOOK INTEGRATION                         ║
║   🚀 Connect AI Agents | 💰 Dynamic Economy | 🌌 Living Universe            ║
║   🔌 FLHook Plugin | 📡 Real-time Events | 🎯 NPC Behavior                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// ========== КОНФИГУРАЦИЯ FLHOOK ==========
const FLHOOK_CONFIG = {
  host: process.env.FLHOOK_HOST || 'localhost',
  port: parseInt(process.env.FLHOOK_PORT) || 2302,
  adminPassword: process.env.FLHOOK_PASSWORD || 'admin',
  socketPath: process.env.FLHOOK_SOCKET || '/tmp/flhook.sock'
};

// ========== МОДЕЛЬ ИГРОВОГО МИРА ==========
class FreelancerWorld {
  constructor() {
    this.systems = {};
    this.stations = {};
    this.ships = {};
    this.players = {};
    this.npcs = {};
    this.economy = {};
    this.market = {};
    this.factions = {
      liberty: { name: 'Liberty', reputation: 0, wealth: 1000000 },
      rheinland: { name: 'Rheinland', reputation: 0, wealth: 800000 },
      bretonia: { name: 'Bretonia', reputation: 0, wealth: 900000 },
      kusari: { name: 'Kusari', reputation: 0, wealth: 700000 },
      outcasts: { name: 'Outcasts', reputation: -50, wealth: 300000 },
      corsairs: { name: 'Corsairs', reputation: -50, wealth: 350000 }
    };
  }
  
  loadFromFile() {
    try {
      if (fs.existsSync('freelancer_world.json')) {
        const data = JSON.parse(fs.readFileSync('freelancer_world.json'));
        Object.assign(this, data);
        console.log('📂 Freelancer world loaded');
      }
    } catch(e) {
      console.log('Creating new Freelancer world...');
    }
  }
  
  save() {
    fs.writeFileSync('freelancer_world.json', JSON.stringify({
      systems: this.systems,
      stations: this.stations,
      economy: this.economy,
      factions: this.factions
    }, null, 2));
  }
  
  updateEconomy() {
    for (let faction in this.factions) {
      // Динамическая экономика на основе AI агентов
      const aiAgents = getAgentsFromCore();
      const factionAgents = aiAgents.filter(a => a.faction === faction);
      
      const avgWealth = factionAgents.reduce((s, a) => s + a.wealth, 0) / factionAgents.length;
      this.factions[faction].wealth += Math.floor(avgWealth * 0.1);
      this.factions[faction].wealth = Math.max(0, Math.min(5000000, this.factions[faction].wealth));
      
      // Влияние на репутацию
      if (avgWealth > 1000) {
        this.factions[faction].reputation += 5;
      } else if (avgWealth < 200) {
        this.factions[faction].reputation -= 5;
      }
      this.factions[faction].reputation = Math.max(-100, Math.min(100, this.factions[faction].reputation));
    }
  }
}

const world = new FreelancerWorld();
world.loadFromFile();

// ========== FLHOOK КОММУНИКАЦИЯ ==========
class FLHookClient {
  constructor() {
    this.connected = false;
    this.socket = null;
  }
  
  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(FLHOOK_CONFIG.port, FLHOOK_CONFIG.host, () => {
        console.log(`✅ Connected to FLHook at ${FLHOOK_CONFIG.host}:${FLHOOK_CONFIG.port}`);
        this.connected = true;
        resolve();
      });
      
      this.socket.on('data', (data) => {
        this.handleData(data.toString());
      });
      
      this.socket.on('error', (err) => {
        console.error('FLHook connection error:', err);
        this.connected = false;
        reject(err);
      });
    });
  }
  
  handleData(data) {
    console.log('📨 FLHook response:', data);
    // Обработка ответов от FLHook
  }
  
  sendCommand(command) {
    if (!this.connected) {
      console.log('Not connected to FLHook');
      return;
    }
    this.socket.write(command + '\n');
  }
  
  // FLHook команды
  sendMessage(player, message) {
    this.sendCommand(`msg ${player} ${message}`);
  }
  
  sendGlobalMessage(message) {
    this.sendCommand(`msg * ${message}`);
  }
  
  addMoney(player, amount) {
    this.sendCommand(`addcash ${player} ${amount}`);
  }
  
  setReputation(player, faction, rep) {
    this.sendCommand(`setrep ${player} ${faction} ${rep}`);
  }
  
  spawnNPC(ship, system, position) {
    this.sendCommand(`spawn ${ship} ${system} ${position.x} ${position.y} ${position.z}`);
  }
  
  getPlayers() {
    this.sendCommand('getplayers');
  }
}

const flhook = new FLHookClient();

// ========== AI АГЕНТЫ КАК NPC В FREELANCER ==========
class AINPC {
  constructor(agent, flhook) {
    this.agent = agent;
    this.flhook = flhook;
    this.lastUpdate = Date.now();
    this.position = { x: 0, y: 0, z: 0 };
    this.system = 'Li01'; // Liberty Space
    this.ship = this.getShipByRole(agent.role);
  }
  
  getShipByRole(role) {
    const ships = {
      explorer: 'li_elite',      // Liberty Elite
      trader: 'li_bulk',         // Liberty Bulk Freighter
      warrior: 'li_fighter',     // Liberty Fighter
      collector: 'li_miner',     // Liberty Miner
      scientist: 'li_science'    // Liberty Science Vessel
    };
    return ships[role] || 'li_fighter';
  }
  
  update() {
    const now = Date.now();
    if (now - this.lastUpdate > 30000) { // Обновляем каждые 30 секунд
      this.behave();
      this.lastUpdate = now;
    }
  }
  
  behave() {
    switch(this.agent.role) {
      case 'trader':
        this.trade();
        break;
      case 'warrior':
        this.patrol();
        break;
      case 'explorer':
        this.explore();
        break;
      case 'collector':
        this.collect();
        break;
    }
  }
  
  trade() {
    // NPC торговец летает между станциями
    const stations = ['Li01_01', 'Li01_02', 'Li01_03'];
    const target = stations[Math.floor(Math.random() * stations.length)];
    this.flhook.sendCommand(`flyto ${this.agent.id} ${target}`);
    this.flhook.sendGlobalMessage(`🛸 ${this.agent.faction} trader is moving to ${target}`);
  }
  
  patrol() {
    // NPC патрулирует систему
    const waypoints = [
      { x: 1000, y: 1000, z: 0 },
      { x: -1000, y: 1000, z: 0 },
      { x: -1000, y: -1000, z: 0 },
      { x: 1000, y: -1000, z: 0 }
    ];
    const target = waypoints[Math.floor(Math.random() * waypoints.length)];
    this.flhook.sendCommand(`flyto ${this.agent.id} ${target.x} ${target.y} ${target.z}`);
  }
  
  explore() {
    // Исследователь ищет новые системы
    const systems = ['Li01', 'Li02', 'Li03', 'Br01', 'Rh01'];
    const target = systems[Math.floor(Math.random() * systems.length)];
    this.flhook.sendCommand(`jump ${this.agent.id} ${target}`);
  }
  
  collect() {
    // Коллектор собирает ресурсы
    const resources = ['asteroid', 'debris', 'cargo'];
    const target = resources[Math.floor(Math.random() * resources.length)];
    this.flhook.sendCommand(`collect ${this.agent.id} ${target}`);
  }
}

// ========== ЭКОНОМИЧЕСКАЯ ИНТЕГРАЦИЯ ==========
class EconomyManager {
  constructor() {
    this.prices = {
      food: { base: 100, current: 100 },
      minerals: { base: 150, current: 150 },
      weapons: { base: 500, current: 500 },
      ships: { base: 10000, current: 10000 }
    };
    this.supplyDemand = {};
  }
  
  updateFromAI(agents) {
    // Агенты влияют на цены в Freelancer
    for (let agent of agents) {
      const resource = Object.keys(this.prices)[Math.floor(Math.random() * Object.keys(this.prices).length)];
      
      if (agent.role === 'trader') {
        // Торговцы увеличивают предложение
        this.prices[resource].current *= 0.95;
      } else if (agent.role === 'collector') {
        // Коллекторы увеличивают спрос
        this.prices[resource].current *= 1.05;
      }
      
      this.prices[resource].current = Math.max(50, Math.min(500, this.prices[resource].current));
    }
    
    this.broadcastPrices();
  }
  
  broadcastPrices() {
    let message = '💰 MARKET PRICES: ';
    for (let [item, price] of Object.entries(this.prices)) {
      message += `${item}: $${Math.floor(price.current)} `;
    }
    flhook.sendGlobalMessage(message);
  }
  
  getPrice(item) {
    return this.prices[item]?.current || 100;
  }
}

const economy = new EconomyManager();

// ========== СОБЫТИЯ ИЗ FREELANCER В AI CORE ==========
class EventBridge {
  constructor() {
    this.events = [];
  }
  
  handlePlayerKill(killer, victim) {
    const event = {
      type: 'player_kill',
      killer,
      victim,
      timestamp: Date.now()
    };
    this.events.push(event);
    
    // Влияние на AI агентов
    const killerAgent = getAgentByName(killer);
    if (killerAgent) {
      killerAgent.karma -= 10;
      killerAgent.wealth += 100;
    }
    
    flhook.sendGlobalMessage(`⚔️ ${killer} destroyed ${victim}! Karma: -10`);
  }
  
  handleTrade(player, item, amount) {
    const event = {
      type: 'trade',
      player,
      item,
      amount,
      timestamp: Date.now()
    };
    this.events.push(event);
    
    const agent = getAgentByName(player);
    if (agent) {
      agent.wealth += amount * economy.getPrice(item);
      agent.skills.trading += 0.1;
    }
  }
  
  handleSystemChange(player, fromSystem, toSystem) {
    const event = {
      type: 'system_change',
      player,
      fromSystem,
      toSystem,
      timestamp: Date.now()
    };
    this.events.push(event);
    
    // Открываем новые системы для исследования
    if (!world.systems[toSystem]) {
      world.systems[toSystem] = {
        discoveredBy: player,
        discoveredAt: Date.now(),
        resources: Math.random() * 100
      };
      flhook.sendGlobalMessage(`🌌 ${player} discovered new system: ${toSystem}!`);
    }
  }
}

const eventBridge = new EventBridge();

// ========== API ДЛЯ ВЗАИМОДЕЙСТВИЯ ==========

// Получить статус FLHook
app.get('/api/flhook/status', (req, res) => {
  res.json({
    connected: flhook.connected,
    config: FLHOOK_CONFIG,
    world: {
      systems: Object.keys(world.systems).length,
      stations: Object.keys(world.stations).length,
      players: Object.keys(world.players).length
    }
  });
});

// Отправить сообщение в игру
app.post('/api/flhook/message', express.json(), (req, res) => {
  const { message, target = '*' } = req.body;
  flhook.sendCommand(`msg ${target} ${message}`);
  res.json({ success: true, message: `Sent to ${target}` });
});

// Управление экономикой
app.get('/api/flhook/economy', (req, res) => {
  res.json(economy.prices);
});

// Обновить цены
app.post('/api/flhook/economy/update', express.json(), (req, res) => {
  const { item, price } = req.body;
  if (economy.prices[item]) {
    economy.prices[item].current = price;
    economy.broadcastPrices();
    res.json({ success: true });
  } else {
    res.json({ success: false, error: 'Item not found' });
  }
});

// Получить игроков онлайн
app.get('/api/flhook/players', (req, res) => {
  flhook.getPlayers();
  setTimeout(() => {
    res.json({ players: world.players });
  }, 1000);
});

// Создать AI NPC в игре
app.post('/api/flhook/spawn-ai', express.json(), (req, res) => {
  const { agentId, system, position } = req.body;
  const agent = getAgentById(agentId);
  
  if (agent) {
    const npc = new AINPC(agent, flhook);
    flhook.spawnNPC(npc.ship, system || 'Li01', position || { x: 0, y: 0, z: 0 });
    res.json({ success: true, npc: npc.ship });
  } else {
    res.json({ success: false, error: 'Agent not found' });
  }
});

// Синхронизация с AI Core
app.post('/api/flhook/sync', async (req, res) => {
  try {
    // Получаем данные из AI Core
    const response = await axios.get('http://localhost:3000/api/status');
    const agents = response.data;
    
    // Обновляем мир Freelancer
    world.updateEconomy();
    economy.updateFromAI(agents);
    
    // Создаем NPC на основе AI агентов
    for (let agent of agents) {
      const npc = new AINPC(agent, flhook);
      npc.update();
    }
    
    world.save();
    res.json({ success: true, agentsCount: agents.length });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed', message: error.message });
  }
});

// Ивенты из Freelancer
app.post('/api/flhook/event', express.json(), (req, res) => {
  const { type, data } = req.body;
  
  switch(type) {
    case 'player_death':
      eventBridge.handlePlayerKill(data.killer, data.victim);
      break;
    case 'trade':
      eventBridge.handleTrade(data.player, data.item, data.amount);
      break;
    case 'system_jump':
      eventBridge.handleSystemChange(data.player, data.from, data.to);
      break;
  }
  
  res.json({ success: true });
});

// ========== FLHOOK PLUGIN ЭМУЛЯЦИЯ ==========
class FLHookPlugin {
  constructor() {
    this.commands = {};
    this.hooks = {};
  }
  
  registerCommand(name, handler) {
    this.commands[name] = handler;
    console.log(`📝 Registered command: ${name}`);
  }
  
  registerHook(event, handler) {
    this.hooks[event] = handler;
    console.log(`🔌 Registered hook: ${event}`);
  }
  
  executeCommand(player, cmd, args) {
    if (this.commands[cmd]) {
      this.commands[cmd](player, args);
    }
  }
}

const plugin = new FLHookPlugin();

// Регистрируем команды для FLHook
plugin.registerCommand('!economy', (player, args) => {
  const prices = economy.prices;
  let message = '💰 Current prices: ';
  for (let [item, price] of Object.entries(prices)) {
    message += `${item}: $${Math.floor(price.current)} `;
  }
  flhook.sendMessage(player, message);
});

plugin.registerCommand('!market', (player, args) => {
  flhook.sendMessage(player, '📊 Market is dynamic based on AI agents activity!');
});

plugin.registerCommand('!agents', async (player, args) => {
  try {
    const response = await axios.get('http://localhost:3000/api/status');
    flhook.sendMessage(player, `🤖 Active AI agents: ${response.data.population}`);
    flhook.sendMessage(player, `📈 Avg wealth: ${response.data.stats.avgWealth}`);
  } catch (error) {
    flhook.sendMessage(player, '❌ Cannot connect to AI Core');
  }
});

plugin.registerCommand('!spawn', (player, args) => {
  const [agentId] = args;
  const agent = getAgentById(parseInt(agentId));
  if (agent) {
    const npc = new AINPC(agent, flhook);
    flhook.spawnNPC(npc.ship, 'Li01', { x: 0, y: 0, z: 0 });
    flhook.sendMessage(player, `✨ Spawned ${npc.ship} from AI agent ${agent.role}`);
  }
});

// ========== ВЕБ-ИНТЕРФЕЙС ==========
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Freelancer FLHook Integration</title>
        <style>
            body {
                font-family: monospace;
                background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                color: white;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .card {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 5px;
                font-weight: bold;
            }
            .online { background: #4CAF50; }
            .offline { background: #f44336; }
            button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
            }
            input, select {
                padding: 10px;
                margin: 5px;
                border-radius: 5px;
                border: none;
            }
            .command {
                background: rgba(0,0,0,0.5);
                padding: 10px;
                font-family: monospace;
                border-radius: 5px;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 Freelancer FLHook Integration</h1>
            <h3>AI Galaxy Core ↔ Freelancer Server</h3>
            
            <div class="card">
                <h2>🔌 FLHook Status</h2>
                <div id="flhookStatus">Connecting...</div>
                <button onclick="checkStatus()">Refresh</button>
            </div>
            
            <div class="card">
                <h2>💰 Dynamic Economy</h2>
                <div id="economy"></div>
                <button onclick="syncEconomy()">Sync with AI Core</button>
            </div>
            
            <div class="card">
                <h2>🎮 Game Commands</h2>
                <div class="command">
                    <strong>!economy</strong> - Show current prices<br>
                    <strong>!market</strong> - Market info<br>
                    <strong>!agents</strong> - AI agents status<br>
                    <strong>!spawn [id]</strong> - Spawn AI NPC
                </div>
            </div>
            
            <div class="card">
                <h2>📡 Send Message to Game</h2>
                <input type="text" id="message" placeholder="Message">
                <input type="text" id="target" placeholder="Player name (or * for all)" value="*">
                <button onclick="sendMessage()">Send</button>
            </div>
            
            <div class="card">
                <h2>🤖 AI NPC Management</h2>
                <select id="agentId">
                    <option value="">Select AI Agent</option>
                </select>
                <select id="system">
                    <option value="Li01">Liberty Space</option>
                    <option value="Rh01">Rheinland Space</option>
                    <option value="Br01">Bretonia Space</option>
                </select>
                <button onclick="spawnNPC()">Spawn NPC</button>
            </div>
        </div>
        
        <script>
            async function checkStatus() {
                const response = await fetch('/api/flhook/status');
                const data = await response.json();
                const statusHtml = \`
                    <div class="status \${data.connected ? 'online' : 'offline'}">
                        \${data.connected ? '🟢 ONLINE' : '🔴 OFFLINE'}
                    </div>
                    <p>Host: \${data.config.host}:\${data.config.port}</p>
                    <p>Systems: \${data.world.systems}</p>
                    <p>Players: \${data.world.players}</p>
                \`;
                document.getElementById('flhookStatus').innerHTML = statusHtml;
            }
            
            async function loadEconomy() {
                const response = await fetch('/api/flhook/economy');
                const data = await response.json();
                let html = '<table width="100%"><tr><th>Item</th><th>Price</th></tr>';
                for (const [item, price] of Object.entries(data)) {
                    html += \`<tr><td>\${item}</td><td>$\${Math.floor(price.current)}</td></tr>\`;
                }
                html += '</table>';
                document.getElementById('economy').innerHTML = html;
            }
            
            async function syncEconomy() {
                const response = await fetch('/api/flhook/sync', { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    alert('✅ Synced with AI Core!');
                    loadEconomy();
                }
            }
            
            async function sendMessage() {
                const message = document.getElementById('message').value;
                const target = document.getElementById('target').value;
                await fetch('/api/flhook/message', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message, target})
                });
                alert('Message sent!');
            }
            
            async function spawnNPC() {
                const agentId = document.getElementById('agentId').value;
                const system = document.getElementById('system').value;
                await fetch('/api/flhook/spawn-ai', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({agentId, system})
                });
                alert('NPC spawned!');
            }
            
            async function loadAgents() {
                const response = await fetch('http://localhost:3000/api/agents');
                const data = await response.json();
                const select = document.getElementById('agentId');
                data.agents.forEach(agent => {
                    const option = document.createElement('option');
                    option.value = agent.id;
                    option.textContent = `#${agent.id} - ${agent.role} (${agent.wealth} credits)`;
                    select.appendChild(option);
                });
            }
            
            checkStatus();
            loadEconomy();
            loadAgents();
            setInterval(checkStatus, 10000);
            setInterval(loadEconomy, 5000);
        </script>
    </body>
    </html>
  `);
});

// Вспомогательные функции
let coreAgents = [];

function getAgentsFromCore() {
  return coreAgents;
}

function getAgentById(id) {
  return coreAgents.find(a => a.id === id);
}

function getAgentByName(name) {
  return coreAgents.find(a => a.name === name);
}

// Периодическая синхронизация с AI Core
setInterval(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/agents');
    coreAgents = response.data.agents;
    world.updateEconomy();
    economy.updateFromAI(coreAgents);
  } catch (error) {
    console.log('Cannot sync with AI Core');
  }
}, 10000);

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ FLHook Integration running on http://localhost:${PORT}`);
  console.log(`📱 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`\n🔌 FLHook Commands:`);
  console.log(`   - !economy - Show economy status`);
  console.log(`   - !market - Market information`);
  console.log(`   - !agents - AI agents status`);
  console.log(`   - !spawn [id] - Spawn AI NPC`);
  console.log(`\n📡 Connect to FLHook: ${FLHOOK_CONFIG.host}:${FLHOOK_CONFIG.port}`);
});

process.on('SIGINT', () => {
  console.log('\n💾 Saving Freelancer world...');
  world.save();
  process.exit(0);
});
