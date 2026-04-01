const express = require('express');
const fs = require('fs');
const net = require('net');
const axios = require('axios');
const readline = require('readline');
const app = express();
const PORT = 3005;

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║   🎮 AI GALAXY CORE - DIRECT FLHOOK CONNECTOR                               ║
║   🔌 Real-time Game Integration | 🤖 AI NPCs | 💰 Dynamic Economy           ║
║   ⚡ Live Events | 📡 Console Commands | 🌌 Living Universe                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// ========== КОНФИГУРАЦИЯ ВАШЕГО СЕРВЕРА ==========
const SERVER_CONFIG = {
  // FLHook настройки - ИЗМЕНИТЕ НА ВАШИ!
  flhookHost: process.env.FLHOOK_HOST || 'localhost',
  flhookPort: parseInt(process.env.FLHOOK_PORT) || 2302,
  flhookPassword: process.env.FLHOOK_PASSWORD || 'your_password',
  
  // Ваш Freelancer сервер
  serverName: process.env.SERVER_NAME || 'AI Galaxy Freelancer',
  serverIp: process.env.SERVER_IP || '127.0.0.1',
  
  // AI Core настройки
  aiCoreUrl: process.env.AI_CORE_URL || 'http://localhost:3000',
  
  // Синхронизация
  syncInterval: 10000, // 10 секунд
  spawnInterval: 30000, // Спавн NPC каждые 30 секунд
  maxNPCs: 50,
  
  // Игровые настройки
  startSystem: 'Li01', // Liberty Space
  factions: {
    'liberty': { rep: 0, color: '#00FF00', name: 'Liberty Navy' },
    'rheinland': { rep: 0, color: '#FF0000', name: 'Rheinland Military' },
    'bretonia': { rep: 0, color: '#0000FF', name: 'Bretonia Armed Forces' },
    'kusari': { rep: 0, color: '#FFFF00', name: 'Kusari Naval Forces' },
    'outcasts': { rep: -50, color: '#FF00FF', name: 'Outcasts' },
    'corsairs': { rep: -50, color: '#FF6600', name: 'Corsairs' }
  }
};

// ========== FLHook КЛИЕНТ ==========
class FLHookClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnecting = false;
    this.messageQueue = [];
    this.players = new Map();
    this.npcs = new Map();
    this.eventHandlers = new Map();
  }
  
  connect() {
    console.log(`🔌 Connecting to FLHook at ${SERVER_CONFIG.flhookHost}:${SERVER_CONFIG.flhookPort}...`);
    
    this.socket = net.createConnection(SERVER_CONFIG.flhookPort, SERVER_CONFIG.flhookHost, () => {
      console.log('✅ Connected to FLHook!');
      this.connected = true;
      this.reconnecting = false;
      
      // Авторизация
      if (SERVER_CONFIG.flhookPassword) {
        this.sendCommand(`auth ${SERVER_CONFIG.flhookPassword}`);
      }
      
      // Запрос списка игроков
      setTimeout(() => {
        this.sendCommand('getplayers');
        this.sendCommand('getnpcs');
      }, 1000);
    });
    
    this.socket.on('data', (data) => {
      this.handleData(data.toString());
    });
    
    this.socket.on('error', (err) => {
      console.error('❌ FLHook error:', err.message);
      this.connected = false;
      this.reconnect();
    });
    
    this.socket.on('close', () => {
      console.log('🔌 FLHook connection closed');
      this.connected = false;
      this.reconnect();
    });
  }
  
  reconnect() {
    if (this.reconnecting) return;
    this.reconnecting = true;
    
    console.log('🔄 Reconnecting to FLHook in 5 seconds...');
    setTimeout(() => {
      this.connect();
    }, 5000);
  }
  
  sendCommand(command) {
    if (!this.connected) {
      this.messageQueue.push(command);
      return false;
    }
    
    try {
      this.socket.write(command + '\n');
      console.log(`📤 CMD: ${command}`);
      return true;
    } catch (err) {
      console.error('Failed to send command:', err);
      return false;
    }
  }
  
  handleData(data) {
    const lines = data.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      console.log(`📨 ${line}`);
      
      // Парсим различные типы сообщений
      if (line.startsWith('PLAYER:')) {
        this.handlePlayerData(line);
      } else if (line.startsWith('NPC:')) {
        this.handleNPCData(line);
      } else if (line.startsWith('MSG:')) {
        this.handleChatMessage(line);
      } else if (line.startsWith('REP:')) {
        this.handleReputation(line);
      } else if (line.startsWith('ECON:')) {
        this.handleEconomy(line);
      }
    }
  }
  
  handlePlayerData(line) {
    const match = line.match(/PLAYER: (\d+) (.*?) (.*)/);
    if (match) {
      const [, id, name, data] = match;
      if (!this.players.has(id)) {
        this.players.set(id, { id, name, data: {} });
        console.log(`👤 New player connected: ${name}`);
        this.onPlayerConnect(id, name);
      }
    }
  }
  
  handleNPCData(line) {
    const match = line.match(/NPC: (\d+) (.*?) (.*)/);
    if (match) {
      const [, id, type, system] = match;
      console.log(`🤖 NPC spawned: ${type} in ${system}`);
    }
  }
  
  handleChatMessage(line) {
    const match = line.match(/MSG: (.*?) says: (.*)/);
    if (match) {
      const [, player, message] = match;
      console.log(`💬 [${player}]: ${message}`);
      this.processPlayerCommand(player, message);
    }
  }
  
  handleReputation(line) {
    const match = line.match(/REP: (.*?) (.*?) (.*)/);
    if (match) {
      console.log(`📊 Reputation update: ${match[1]} -> ${match[2]}`);
    }
  }
  
  handleEconomy(line) {
    const match = line.match(/ECON: (.*?) (.*)/);
    if (match) {
      console.log(`💰 Economy update: ${match[1]} = ${match[2]}`);
    }
  }
  
  processPlayerCommand(player, message) {
    const cmd = message.toLowerCase();
    
    if (cmd === '!economy' || cmd === '!econ') {
      this.showEconomy(player);
    } else if (cmd === '!agents' || cmd === '!ai') {
      this.showAIAgents(player);
    } else if (cmd === '!market') {
      this.showMarket(player);
    } else if (cmd.startsWith('!spawn')) {
      const parts = cmd.split(' ');
      const agentType = parts[1] || 'random';
      this.spawnAINPC(player, agentType);
    } else if (cmd === '!help') {
      this.showHelp(player);
    } else if (cmd === '!stats') {
      this.showStats(player);
    } else if (cmd === '!factions') {
      this.showFactions(player);
    }
  }
  
  showEconomy(player) {
    this.sendCommand(`msg ${player} ==============================`);
    this.sendCommand(`msg ${player} 📊 AI GALAXY ECONOMY REPORT`);
    this.sendCommand(`msg ${player} ==============================`);
    
    // Здесь получаем данные из AI Core
    axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/market`).then(response => {
      const market = response.data;
      for (const [resource, price] of Object.entries(market.prices)) {
        this.sendCommand(`msg ${player} ${resource}: $${Math.floor(price)} (volatility: ${market.volatility[resource].toFixed(2)})`);
      }
    }).catch(err => {
      this.sendCommand(`msg ${player} ❌ Cannot connect to AI Core`);
    });
  }
  
  showAIAgents(player) {
    axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/status`).then(response => {
      const status = response.data;
      this.sendCommand(`msg ${player} 🤖 AI AGENTS STATUS`);
      this.sendCommand(`msg ${player} Active agents: ${status.population}`);
      this.sendCommand(`msg ${player} Generation: ${status.generation}`);
      this.sendCommand(`msg ${player} Avg wealth: ${status.stats.avgWealth}`);
      this.sendCommand(`msg ${player} Avg tech level: ${status.stats.avgTech.toFixed(1)}`);
    }).catch(err => {
      this.sendCommand(`msg ${player} ❌ AI Core offline`);
    });
  }
  
  showMarket(player) {
    this.sendCommand(`msg ${player} 💰 MARKET PRICES`);
    axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/market`).then(response => {
      const market = response.data;
      let msg = '';
      for (const [resource, price] of Object.entries(market.prices)) {
        msg += `${resource}: $${Math.floor(price)} `;
      }
      this.sendCommand(`msg ${player} ${msg}`);
    });
  }
  
  spawnAINPC(player, agentType) {
    axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/agents`).then(response => {
      const agents = response.data.agents;
      let agent;
      
      if (agentType === 'random' || !agentType) {
        agent = agents[Math.floor(Math.random() * agents.length)];
      } else {
        agent = agents.find(a => a.role === agentType);
        if (!agent) agent = agents[0];
      }
      
      if (agent) {
        const shipType = this.getShipByRole(agent.role);
        const system = SERVER_CONFIG.startSystem;
        
        this.sendCommand(`spawn ${shipType} ${system} 0 0 0`);
        this.sendCommand(`msg ${player} ✨ Spawned AI NPC: ${agent.role.toUpperCase()} (Wealth: ${agent.wealth})`);
        this.sendCommand(`msg ${player} 🤖 Role: ${agent.role} | Techs: ${agent.techs.length}`);
        
        // Сохраняем NPC
        const npcId = Date.now();
        this.npcs.set(npcId, {
          id: npcId,
          agent: agent,
          ship: shipType,
          system: system,
          spawnedBy: player,
          spawnedAt: Date.now()
        });
      }
    });
  }
  
  getShipByRole(role) {
    const ships = {
      explorer: 'li_elite',
      trader: 'li_bulk',
      warrior: 'li_fighter',
      collector: 'li_miner',
      scientist: 'li_science',
      diplomat: 'li_cruiser'
    };
    return ships[role] || 'li_fighter';
  }
  
  showHelp(player) {
    this.sendCommand(`msg ${player} 🎮 AI GALAXY COMMANDS:`);
    this.sendCommand(`msg ${player} !economy - Show economy status`);
    this.sendCommand(`msg ${player} !agents - Show AI agents info`);
    this.sendCommand(`msg ${player} !market - Show market prices`);
    this.sendCommand(`msg ${player} !spawn [type] - Spawn AI NPC`);
    this.sendCommand(`msg ${player} !factions - Show faction status`);
    this.sendCommand(`msg ${player} !stats - Show server stats`);
  }
  
  showFactions(player) {
    this.sendCommand(`msg ${player} 👑 FACTION STATUS`);
    for (const [faction, data] of Object.entries(SERVER_CONFIG.factions)) {
      const rep = data.rep;
      const status = rep >= 0 ? 'Friendly' : rep > -50 ? 'Neutral' : 'Hostile';
      this.sendCommand(`msg ${player} ${data.name}: ${rep} (${status})`);
    }
  }
  
  showStats(player) {
    this.sendCommand(`msg ${player} 📊 SERVER STATS`);
    this.sendCommand(`msg ${player} Players online: ${this.players.size}`);
    this.sendCommand(`msg ${player} AI NPCs active: ${this.npcs.size}`);
    this.sendCommand(`msg ${player} Uptime: ${Math.floor(process.uptime() / 60)} minutes`);
  }
  
  onPlayerConnect(id, name) {
    // Приветственное сообщение
    this.sendCommand(`msg ${name} 🌌 Welcome to ${SERVER_CONFIG.serverName}!`);
    this.sendCommand(`msg ${name} 🤖 This server is powered by AI Galaxy Core`);
    this.sendCommand(`msg ${name} 💡 Type !help for available commands`);
    
    // Добавляем стартовые деньги
    this.sendCommand(`addcash ${name} 10000`);
    
    // Устанавливаем репутацию
    this.sendCommand(`setrep ${name} li_grp 0`);
  }
  
  processQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const cmd = this.messageQueue.shift();
      this.sendCommand(cmd);
    }
  }
}

// ========== AI CORE КЛИЕНТ ==========
class AICoreClient {
  constructor() {
    this.agents = [];
    this.market = {};
    this.status = {};
    this.lastSync = null;
  }
  
  async sync() {
    try {
      const [agents, market, status] = await Promise.all([
        axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/agents`),
        axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/market`),
        axios.get(`${SERVER_CONFIG.aiCoreUrl}/api/status`)
      ]);
      
      this.agents = agents.data.agents;
      this.market = market.data;
      this.status = status.data;
      this.lastSync = Date.now();
      
      console.log(`🔄 Synced with AI Core: ${this.agents.length} agents, ${Object.keys(this.market.prices).length} resources`);
      return true;
    } catch (error) {
      console.error('❌ AI Core sync failed:', error.message);
      return false;
    }
  }
  
  getAgents() {
    return this.agents;
  }
  
  getRandomAgent() {
    return this.agents[Math.floor(Math.random() * this.agents.length)];
  }
  
  getMarketPrice(resource) {
    return this.market.prices?.[resource] || 100;
  }
}

// ========== NPC ПОВЕДЕНИЕ ==========
class NPCBehavior {
  constructor(flhook, aiCore) {
    this.flhook = flhook;
    this.aiCore = aiCore;
    this.activeNPCs = new Map();
  }
  
  async updateNPCs() {
    for (const [npcId, npc] of this.flhook.npcs) {
      const agent = npc.agent;
      if (!agent) continue;
      
      // Поведение на основе роли агента
      switch(agent.role) {
        case 'trader':
          await this.traderBehavior(npc);
          break;
        case 'warrior':
          await this.warriorBehavior(npc);
          break;
        case 'explorer':
          await this.explorerBehavior(npc);
          break;
        case 'collector':
          await this.collectorBehavior(npc);
          break;
      }
      
      // Обновляем богатство агента
      if (Math.random() < 0.1) {
        agent.wealth += Math.floor(Math.random() * 100);
      }
    }
  }
  
  async traderBehavior(npc) {
    // Торговец перемещается между станциями
    const stations = ['Li01_01', 'Li01_02', 'Li01_03'];
    const targetStation = stations[Math.floor(Math.random() * stations.length)];
    
    this.flhook.sendCommand(`flyto ${npc.id} ${targetStation}`);
    
    // Торговые сообщения
    if (Math.random() < 0.3) {
      this.flhook.sendCommand(`msg * 🤖 AI Trader: Moving to ${targetStation}`);
    }
  }
  
  async warriorBehavior(npc) {
    // Воин патрулирует систему
    const waypoints = [
      { x: 5000, y: 5000, z: 0 },
      { x: -5000, y: 5000, z: 0 },
      { x: -5000, y: -5000, z: 0 },
      { x: 5000, y: -5000, z: 0 }
    ];
    const target = waypoints[Math.floor(Math.random() * waypoints.length)];
    
    this.flhook.sendCommand(`flyto ${npc.id} ${target.x} ${target.y} ${target.z}`);
    
    // Поиск врагов
    if (Math.random() < 0.2) {
      this.flhook.sendCommand(`msg * ⚔️ AI Warrior: Scanning for enemies`);
    }
  }
  
  async explorerBehavior(npc) {
    // Исследователь открывает новые системы
    const systems = ['Li01', 'Li02', 'Li03', 'Br01', 'Rh01', 'Ku01'];
    const newSystem = systems[Math.floor(Math.random() * systems.length)];
    
    if (Math.random() < 0.1) {
      this.flhook.sendCommand(`jump ${npc.id} ${newSystem}`);
      this.flhook.sendCommand(`msg * 🔭 AI Explorer: Discovered ${newSystem}!`);
    }
  }
  
  async collectorBehavior(npc) {
    // Коллектор собирает ресурсы
    const resources = ['asteroid', 'debris', 'cargo'];
    const target = resources[Math.floor(Math.random() * resources.length)];
    
    this.flhook.sendCommand(`collect ${npc.id} ${target}`);
    
    if (Math.random() < 0.2) {
      const resource = Object.keys(this.aiCore.market.prices)[0];
      const amount = Math.floor(Math.random() * 50) + 10;
      npc.agent.inventory[resource] = (npc.agent.inventory[resource] || 0) + amount;
    }
  }
}

// ========== ЭКОНОМИЧЕСКАЯ СИСТЕМА ==========
class GameEconomy {
  constructor(flhook, aiCore) {
    this.flhook = flhook;
    this.aiCore = aiCore;
    this.prices = {
      food: 100,
      ore: 150,
      equipment: 500,
      weapons: 1000,
      ships: 10000
    };
  }
  
  async update() {
    // Обновляем цены на основе AI Core
    const aiMarket = this.aiCore.market;
    if (aiMarket.prices) {
      this.prices.food = aiMarket.prices.food || 100;
      this.prices.ore = aiMarket.prices.minerals || 150;
      this.prices.weapons = aiMarket.prices.tech || 500;
    }
    
    // Отправляем обновления в FLHook
    for (const [item, price] of Object.entries(this.prices)) {
      this.flhook.sendCommand(`setmarket ${item} ${Math.floor(price)}`);
    }
    
    // Анонсируем изменения
    if (Math.random() < 0.1) {
      this.flhook.sendCommand(`msg * 💰 Market update: Food $${Math.floor(this.prices.food)} | Ore $${Math.floor(this.prices.ore)}`);
    }
  }
  
  getPrice(item) {
    return this.prices[item] || 100;
  }
}

// ========== СОБЫТИЙНАЯ СИСТЕМА ==========
class EventSystem {
  constructor(flhook, aiCore) {
    this.flhook = flhook;
    this.aiCore = aiCore;
    this.activeEvents = [];
  }
  
  async checkForEvent() {
    if (Math.random() < 0.05 && this.activeEvents.length === 0) {
      const events = [
        this.pirateAttack.bind(this),
        this.tradeFleet.bind(this),
        this.solarFlare.bind(this),
        this.artifactFound.bind(this)
      ];
      
      const event = events[Math.floor(Math.random() * events.length)];
      await event();
    }
  }
  
  async pirateAttack() {
    this.flhook.sendCommand(`msg * 🏴‍☠️ ALERT! Pirate attack in ${SERVER_CONFIG.startSystem}!`);
    this.flhook.sendCommand(`spawn li_fighter ${SERVER_CONFIG.startSystem} 2000 2000 0`);
    this.flhook.sendCommand(`spawn li_fighter ${SERVER_CONFIG.startSystem} -2000 2000 0`);
    
    this.activeEvents.push({
      type: 'pirate_attack',
      startTime: Date.now(),
      duration: 300000 // 5 минут
    });
    
    setTimeout(() => {
      this.flhook.sendCommand(`msg * ✅ Pirates defeated! System secure.`);
      this.activeEvents = this.activeEvents.filter(e => e.type !== 'pirate_attack');
    }, 300000);
  }
  
  async tradeFleet() {
    this.flhook.sendCommand(`msg * 🚢 Trade fleet arriving in ${SERVER_CONFIG.startSystem}!`);
    this.flhook.sendCommand(`spawn li_bulk ${SERVER_CONFIG.startSystem} 1000 1000 0`);
    this.flhook.sendCommand(`spawn li_bulk ${SERVER_CONFIG.startSystem} -1000 1000 0`);
    this.flhook.sendCommand(`spawn li_elite ${SERVER_CONFIG.startSystem} 0 1000 0`);
    
    setTimeout(() => {
      this.flhook.sendCommand(`msg * 💰 Trade fleet departed. Market prices updated!`);
    }, 180000);
  }
  
  async solarFlare() {
    this.flhook.sendCommand(`msg * 🌞 SOLAR FLARE! Energy systems damaged!`);
    this.flhook.sendCommand(`msg * ⚡ All shields reduced by 50% for 2 minutes`);
    
    setTimeout(() => {
      this.flhook.sendCommand(`msg * ✅ Solar flare ended. Systems恢复正常.`);
    }, 120000);
  }
  
  async artifactFound() {
    this.flhook.sendCommand(`msg * ✨ Ancient artifact discovered in ${SERVER_CONFIG.startSystem}!`);
    this.flhook.sendCommand(`msg * 💎 Special rewards for finding it!`);
    
    // Спавн артефакта
    this.flhook.sendCommand(`spawn artifact ${SERVER_CONFIG.startSystem} 3000 3000 0`);
  }
}

// ========== КОНСОЛЬ УПРАВЛЕНИЯ ==========
class ConsoleManager {
  constructor(flhook, aiCore, economy, events) {
    this.flhook = flhook;
    this.aiCore = aiCore;
    this.economy = economy;
    this.events = events;
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.on('line', async (input) => {
      await this.processCommand(input);
      rl.prompt();
    });
    
    rl.setPrompt('FLHook> ');
    rl.prompt();
  }
  
  async processCommand(input) {
    const [cmd, ...args] = input.split(' ');
    
    switch(cmd.toLowerCase()) {
      case 'players':
        console.log(`👥 Players online: ${this.flhook.players.size}`);
        for (const [id, player] of this.flhook.players) {
          console.log(`   - ${player.name} (ID: ${id})`);
        }
        break;
        
      case 'npcs':
        console.log(`🤖 NPCs active: ${this.flhook.npcs.size}`);
        for (const [id, npc] of this.flhook.npcs) {
          console.log(`   - ${npc.agent.role} (Ship: ${npc.ship})`);
        }
        break;
        
      case 'sync':
        await this.aiCore.sync();
        console.log('✅ Synced with AI Core');
        break;
        
      case 'spawn':
        const agent = this.aiCore.getRandomAgent();
        if (agent) {
          const ship = this.getShipByRole(agent.role);
          this.flhook.sendCommand(`spawn ${ship} ${SERVER_CONFIG.startSystem} 0 0 0`);
          console.log(`✨ Spawned ${agent.role} NPC`);
        }
        break;
        
      case 'msg':
        const message = args.join(' ');
        this.flhook.sendCommand(`msg * ${message}`);
        break;
        
      case 'economy':
        console.log('💰 Current prices:');
        for (const [item, price] of Object.entries(this.economy.prices)) {
          console.log(`   ${item}: $${Math.floor(price)}`);
        }
        break;
        
      case 'event':
        await this.events.pirateAttack();
        break;
        
      case 'help':
        console.log(`
Available commands:
  players   - Show online players
  npcs      - Show active NPCs
  sync      - Sync with AI Core
  spawn     - Spawn random AI NPC
  msg [text] - Send global message
  economy   - Show economy status
  event     - Trigger random event
  status    - Show system status
  help      - Show this help
        `);
        break;
        
      case 'status':
        console.log(`
📊 SYSTEM STATUS:
  FLHook: ${this.flhook.connected ? '🟢 Connected' : '🔴 Disconnected'}
  AI Core: ${this.aiCore.lastSync ? '🟢 Online' : '🔴 Offline'}
  Players: ${this.flhook.players.size}
  NPCs: ${this.flhook.npcs.size}
  AI Agents: ${this.aiCore.agents.length}
  Uptime: ${Math.floor(process.uptime() / 60)} minutes
        `);
        break;
        
      default:
        // Отправляем команду напрямую в FLHook
        if (input.trim()) {
          this.flhook.sendCommand(input);
        }
    }
  }
  
  getShipByRole(role) {
    const ships = {
      explorer: 'li_elite',
      trader: 'li_bulk',
      warrior: 'li_fighter',
      collector: 'li_miner',
      scientist: 'li_science'
    };
    return ships[role] || 'li_fighter';
  }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
const flhook = new FLHookClient();
const aiCore = new AICoreClient();
const economy = new GameEconomy(flhook, aiCore);
const npcBehavior = new NPCBehavior(flhook, aiCore);
const events = new EventSystem(flhook, aiCore);

// ========== ЗАПУСК ==========
async function start() {
  console.log('\n🚀 Starting AI Galaxy Core - FLHook Direct Connector\n');
  
  // Подключаемся к FLHook
  flhook.connect();
  
  // Первая синхронизация с AI Core
  await aiCore.sync();
  
  // Запускаем консоль управления
  const consoleManager = new ConsoleManager(flhook, aiCore, economy, events);
  
  // Периодические задачи
  setInterval(async () => {
    await aiCore.sync();
  }, SERVER_CONFIG.syncInterval);
  
  setInterval(async () => {
    await economy.update();
  }, 15000);
  
  setInterval(async () => {
    await npcBehavior.updateNPCs();
  }, 20000);
  
  setInterval(async () => {
    await events.checkForEvent();
  }, 60000);
  
  // Спавн новых NPC
  setInterval(() => {
    if (flhook.npcs.size < SERVER_CONFIG.maxNPCs && Math.random() < 0.3) {
      const agent = aiCore.getRandomAgent();
      if (agent) {
        const ship = npcBehavior.getShipByRole?.(agent.role) || 'li_fighter';
        flhook.sendCommand(`spawn ${ship} ${SERVER_CONFIG.startSystem} ${Math.random() * 10000 - 5000} ${Math.random() * 10000 - 5000} 0`);
        
        const npcId = Date.now();
        flhook.npcs.set(npcId, {
          id: npcId,
          agent: agent,
          ship: ship,
          system: SERVER_CONFIG.startSystem,
          spawnedAt: Date.now()
        });
      }
    }
  }, SERVER_CONFIG.spawnInterval);
  
  console.log('\n✅ System ready!');
  console.log(`📡 Connected to FLHook at ${SERVER_CONFIG.flhookHost}:${SERVER_CONFIG.flhookPort}`);
  console.log(`🤖 AI Core at ${SERVER_CONFIG.aiCoreUrl}`);
  console.log(`🎮 Server: ${SERVER_CONFIG.serverName}\n`);
}

start();

// ========== WEB ИНТЕРФЕЙС ДЛЯ МОНИТОРИНГА ==========
app.get('/status', (req, res) => {
  res.json({
    flhook: {
      connected: flhook.connected,
      players: flhook.players.size,
      npcs: flhook.npcs.size
    },
    aiCore: {
      connected: aiCore.lastSync !== null,
      agents: aiCore.agents.length,
      lastSync: aiCore.lastSync
    },
    economy: economy.prices,
    uptime: process.uptime()
  });
});

app.get('/players', (req, res) => {
  res.json(Array.from(flhook.players.values()));
});

app.get('/npcs', (req, res) => {
  res.json(Array.from(flhook.npcs.values()).map(npc => ({
    role: npc.agent.role,
    wealth: npc.agent.wealth,
    ship: npc.ship,
    spawnedAt: npc.spawnedAt
  })));
});

app.listen(3006, () => {
  console.log(`📊 Web monitor: http://localhost:3006/status`);
});
