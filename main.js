const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║   🚀 AI GALAXY CORE v4.0 - ULTIMATE EDITION                                ║
║   🤖 500 Agents | 📈 Market | 💎 Resources | 🎭 Factions | 🌳 Tech Tree     ║
║   ⚔️ Diplomacy | 🌍 Events | 💾 Multi-Save | 📊 Advanced Analytics          ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
  AGENT_COUNT: 500,
  SAVE_INTERVAL: 30,
  EVOLVE_INTERVAL: 10,
  UPDATE_INTERVAL: 3000,
  MAX_HISTORY: 200,
  MAX_GENERATIONS: 100
};

// ========== РЕСУРСЫ ==========
const RESOURCES = {
  energy: { name: '⚡ Energy', basePrice: 10, volatility: 0.3, rarity: 1 },
  minerals: { name: '⛏️ Minerals', basePrice: 15, volatility: 0.4, rarity: 0.8 },
  food: { name: '🌾 Food', basePrice: 8, volatility: 0.2, rarity: 1.2 },
  tech: { name: '🔬 Tech', basePrice: 50, volatility: 0.5, rarity: 0.5 },
  crystals: { name: '💎 Crystals', basePrice: 100, volatility: 0.7, rarity: 0.3 },
  uranium: { name: '☢️ Uranium', basePrice: 200, volatility: 0.9, rarity: 0.2 },
  antimatter: { name: '✨ Antimatter', basePrice: 1000, volatility: 1.2, rarity: 0.05 }
};

// ========== ТЕХНОЛОГИЧЕСКОЕ ДЕРЕВО ==========
const TECH_TREE = {
  mining: { name: '⛏️ Advanced Mining', cost: 500, effect: { miningBonus: 1.5 } },
  farming: { name: '🌾 Hydroponics', cost: 300, effect: { foodBonus: 1.5 } },
  energy: { name: '⚡ Fusion Power', cost: 800, effect: { energyBonus: 2.0 } },
  trade: { name: '💰 Interstellar Trade', cost: 1000, effect: { tradeBonus: 1.3 } },
  warfare: { name: '⚔️ Plasma Weapons', cost: 1500, effect: { combatBonus: 1.5 } },
  ai: { name: '🤖 Neural Networks', cost: 2000, effect: { efficiency: 1.2 } },
  terraforming: { name: '🌍 Terraforming', cost: 3000, effect: { populationBonus: 1.3 } },
  quantum: { name: '🔮 Quantum Computing', cost: 5000, effect: { techBonus: 2.0 } }
};

// ========== ФРАКЦИИ ==========
const FACTIONS = {
  federation: { name: '🌍 Federation', ideology: 'peaceful', bonus: { trade: 1.2, diplomacy: 1.3 } },
  empire: { name: '👑 Empire', ideology: 'militaristic', bonus: { combat: 1.3, wealth: 1.1 } },
  collective: { name: '🤝 Collective', ideology: 'cooperative', bonus: { production: 1.2, research: 1.1 } },
  cult: { name: '🌀 Tech Cult', ideology: 'technocratic', bonus: { tech: 1.4, energy: 0.9 } },
  syndicate: { name: '💼 Syndicate', ideology: 'capitalist', bonus: { trade: 1.4, wealth: 1.2 } }
};

// ========== ГЛОБАЛЬНЫЕ СОБЫТИЯ ==========
const GLOBAL_EVENTS = [
  { name: '🌞 Solar Flare', effect: { energy: 0.7, tech: 0.9 }, probability: 0.05 },
  { name: '💎 Crystal Rain', effect: { crystals: 1.5 }, probability: 0.03 },
  { name: '🦠 Space Plague', effect: { population: 0.8 }, probability: 0.04 },
  { name: '🤖 AI Breakthrough', effect: { tech: 2.0, efficiency: 1.2 }, probability: 0.02 },
  { name: '🌍 First Contact', effect: { tech: 1.5, wealth: 1.3 }, probability: 0.01 },
  { name: '💥 Market Crash', effect: { wealth: 0.6 }, probability: 0.03 },
  { name: '✨ Golden Age', effect: { all: 1.2 }, probability: 0.02 }
];

// ========== АГЕНТ С РАСШИРЕННЫМИ ВОЗМОЖНОСТЯМИ ==========
class Agent {
  constructor(id, fromSave = false) {
    this.id = id;
    if (!fromSave) {
      this.role = ['explorer', 'builder', 'trader', 'warrior', 'collector', 'scientist', 'diplomat'][Math.floor(Math.random() * 7)];
      this.energy = 50 + Math.random() * 50;
      this.level = 1;
      this.wealth = 100;
      this.age = 0;
      this.isAlive = true;
      this.faction = Object.keys(FACTIONS)[Math.floor(Math.random() * Object.keys(FACTIONS).length)];
      this.techs = [];
      this.skills = {
        mining: 1 + Math.random() * 2,
        trading: 1 + Math.random() * 2,
        combat: 1 + Math.random() * 2,
        research: 1 + Math.random() * 2,
        diplomacy: 1 + Math.random() * 2
      };
      this.inventory = {
        energy: 100,
        minerals: 50,
        food: 100,
        tech: 10,
        crystals: 5,
        uranium: 2,
        antimatter: 0
      };
      this.karma = 0;
      this.allies = [];
      this.enemies = [];
    }
  }
  
  act(globalEvent) {
    if (!this.isAlive) return;
    this.age++;
    this.energy -= 2;
    if (this.energy < 0) this.energy = 0;
    
    // Применяем эффекты технологий
    let actionBonus = 1;
    for (let tech of this.techs) {
      if (TECH_TREE[tech].effect.efficiency) actionBonus *= TECH_TREE[tech].effect.efficiency;
    }
    
    let action = this.decideAction();
    this.executeAction(action, actionBonus);
    
    // Применяем глобальные события
    if (globalEvent) this.applyGlobalEvent(globalEvent);
    
    // Старение и смерть
    if (this.age > 70 && Math.random() < 0.01) {
      this.isAlive = false;
    }
  }
  
  decideAction() {
    if (this.energy < 30) return 'search';
    
    const roleActions = {
      explorer: () => Math.random() < 0.5 ? 'explore' : 'idle',
      builder: () => Math.random() < 0.4 ? 'build' : 'idle',
      trader: () => 'trade',
      warrior: () => Math.random() < 0.3 ? 'fight' : 'idle',
      collector: () => 'collect',
      scientist: () => Math.random() < 0.6 ? 'research' : 'idle',
      diplomat: () => Math.random() < 0.4 ? 'diplomacy' : 'idle'
    };
    
    return roleActions[this.role] ? roleActions[this.role]() : 'idle';
  }
  
  executeAction(action, bonus = 1) {
    switch(action) {
      case 'search':
        this.energy += 10 * bonus;
        break;
      case 'explore':
        this.energy += Math.random() * 20;
        if (Math.random() < 0.3 * bonus) {
          const resources = Object.keys(RESOURCES);
          const res = resources[Math.floor(Math.random() * resources.length)];
          const amount = Math.floor(Math.random() * 10) + 5;
          this.inventory[res] += amount * (this.skills.mining || 1);
        }
        break;
      case 'collect':
        this.energy += 8;
        const amount = Math.floor(Math.random() * 15) + 5;
        this.inventory.energy += amount * (this.skills.mining || 1);
        break;
      case 'trade':
        this.performTrade();
        break;
      case 'build':
        this.energy -= 5;
        this.wealth += 20 * (this.skills.trading || 1);
        break;
      case 'fight':
        this.performCombat();
        break;
      case 'research':
        this.performResearch();
        break;
      case 'diplomacy':
        this.performDiplomacy();
        break;
      default:
        this.energy += 2;
    }
    
    this.energy = Math.min(100, Math.max(0, this.energy));
    this.wealth = Math.max(0, this.wealth);
  }
  
  performTrade() {
    const resources = Object.keys(RESOURCES);
    const res = resources[Math.floor(Math.random() * resources.length)];
    const amount = Math.floor(Math.random() * 10) + 1;
    
    if (Math.random() < 0.5) {
      // Продажа
      if (this.inventory[res] >= amount) {
        const price = market.getPrice(res);
        const bonus = this.skills.trading * (this.factionBonus?.trade || 1);
        const earned = amount * price * bonus;
        this.inventory[res] -= amount;
        this.wealth += earned;
      }
    } else {
      // Покупка
      const price = market.getPrice(res);
      const cost = amount * price;
      if (this.wealth >= cost) {
        this.wealth -= cost;
        this.inventory[res] += amount;
      }
    }
  }
  
  performCombat() {
    const enemies = agents.filter(a => a.isAlive && a.faction !== this.faction && Math.random() < 0.1);
    if (enemies.length > 0) {
      const enemy = enemies[0];
      const combatPower = this.skills.combat * (this.factionBonus?.combat || 1);
      const enemyPower = enemy.skills.combat;
      
      if (combatPower > enemyPower * 0.8) {
        const loot = Math.min(enemy.wealth * 0.3, 100);
        this.wealth += loot;
        enemy.wealth -= loot;
        this.karma -= 1;
      } else {
        this.energy -= 20;
        this.karma += 1;
      }
    }
  }
  
  performResearch() {
    const availableTechs = Object.keys(TECH_TREE).filter(t => !this.techs.includes(t));
    if (availableTechs.length > 0 && this.wealth > TECH_TREE[availableTechs[0]].cost) {
      const tech = availableTechs[0];
      this.wealth -= TECH_TREE[tech].cost;
      this.techs.push(tech);
      this.skills.research += 0.2;
      console.log(`🔬 Agent ${this.id} researched ${TECH_TREE[tech].name}`);
    }
  }
  
  performDiplomacy() {
    const potentialAllies = agents.filter(a => a.isAlive && a.faction === this.faction && a.id !== this.id);
    if (potentialAllies.length > 0 && Math.random() < 0.3) {
      const ally = potentialAllies[0];
      if (!this.allies.includes(ally.id)) {
        this.allies.push(ally.id);
        this.karma += 1;
      }
    }
  }
  
  applyGlobalEvent(event) {
    for (let [resource, multiplier] of Object.entries(event.effect)) {
      if (resource === 'all') {
        for (let res in this.inventory) {
          this.inventory[res] *= multiplier;
        }
        this.wealth *= multiplier;
      } else if (this.inventory[resource]) {
        this.inventory[resource] *= multiplier;
      }
    }
  }
  
  get factionBonus() {
    return FACTIONS[this.faction]?.bonus || {};
  }
  
  toJSON() {
    return {
      id: this.id, role: this.role, energy: this.energy, level: this.level,
      wealth: this.wealth, age: this.age, isAlive: this.isAlive,
      faction: this.faction, techs: this.techs, skills: this.skills,
      inventory: this.inventory, karma: this.karma, allies: this.allies, enemies: this.enemies
    };
  }
  
  static fromJSON(data) {
    const agent = new Agent(data.id, true);
    Object.assign(agent, data);
    return agent;
  }
  
  getStatus() {
    return {
      id: this.id, role: this.role, faction: this.faction, level: this.level,
      energy: Math.floor(this.energy), wealth: Math.floor(this.wealth), age: this.age,
      techs: this.techs.length, karma: this.karma, allies: this.allies.length,
      inventory: Object.fromEntries(Object.entries(this.inventory).map(([k,v]) => [k, Math.floor(v)]))
    };
  }
}

// ========== РЫНОК С ПРОГНОЗАМИ ==========
class Market {
  constructor() {
    this.prices = {};
    this.history = [];
    this.volatility = {};
    for (let res in RESOURCES) {
      this.prices[res] = RESOURCES[res].basePrice;
      this.volatility[res] = RESOURCES[res].volatility;
    }
  }
  
  getPrice(resource) {
    return Math.floor(this.prices[resource] || 10);
  }
  
  updatePrices() {
    for (let res in this.prices) {
      let change = (Math.random() - 0.5) * this.volatility[res];
      this.prices[res] *= (1 + change);
      this.prices[res] = Math.max(1, Math.min(500, this.prices[res]));
      this.volatility[res] += (Math.random() - 0.5) * 0.05;
      this.volatility[res] = Math.max(0.1, Math.min(2, this.volatility[res]));
    }
    this.history.push({ ...this.prices, timestamp: Date.now() });
    if (this.history.length > CONFIG.MAX_HISTORY) this.history.shift();
  }
  
  predictPrice(resource, steps = 10) {
    const recent = this.history.slice(-steps).map(h => h[resource]);
    if (recent.length < 2) return this.prices[resource];
    const trend = recent[recent.length - 1] - recent[0];
    return Math.max(1, this.prices[resource] + trend / steps);
  }
  
  getStats() {
    return { prices: this.prices, volatility: this.volatility };
  }
}

// ========== МИРОВЫЕ СОБЫТИЯ ==========
class EventManager {
  constructor() {
    this.activeEvent = null;
    this.eventHistory = [];
  }
  
  checkForEvent() {
    if (Math.random() < 0.02 && !this.activeEvent) {
      const event = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];
      this.activeEvent = event;
      console.log(`\n🌍 GLOBAL EVENT: ${event.name}`);
      return event;
    }
    return null;
  }
  
  clearEvent() {
    if (this.activeEvent) {
      this.eventHistory.push({ event: this.activeEvent, timestamp: Date.now() });
      this.activeEvent = null;
    }
  }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
const market = new Market();
const eventManager = new EventManager();
let agents = [];
let generation = 0;
let step = 0;
let history = {
  population: [], avgWealth: [], market: [], roles: {}, factions: {},
  techs: [], events: [], gini: [], generations: []
};

function addToHistory() {
  const alive = agents.filter(a => a.isAlive);
  const roles = {}, factions = {};
  for (let agent of alive) {
    roles[agent.role] = (roles[agent.role] || 0) + 1;
    factions[agent.faction] = (factions[agent.faction] || 0) + 1;
  }
  
  const wealths = alive.map(a => a.wealth);
  const total = wealths.reduce((s, w) => s + w, 0);
  const avg = total / wealths.length;
  const gini = wealths.reduce((sum, w) => sum + Math.abs(w - avg), 0) / (2 * total);
  
  history.population.push({ step, value: alive.length });
  history.avgWealth.push({ step, value: avg });
  history.market.push({ step, prices: { ...market.prices } });
  history.roles[generation] = roles;
  history.factions[generation] = factions;
  history.gini.push({ step, value: gini });
  history.generations.push({ generation, step, population: alive.length });
  if (eventManager.activeEvent) history.events.push({ step, event: eventManager.activeEvent.name });
  
  for (let key of Object.keys(history)) {
    if (Array.isArray(history[key]) && history[key].length > CONFIG.MAX_HISTORY) {
      history[key] = history[key].slice(-CONFIG.MAX_HISTORY);
    }
  }
}

function evolve() {
  generation++;
  const alive = agents.filter(a => a.isAlive);
  alive.sort((a, b) => (b.wealth + b.energy + b.techs.length * 100) - (a.wealth + a.energy + a.techs.length * 100));
  const survivors = alive.slice(0, Math.floor(alive.length * 0.4));
  const newAgents = [];
  
  for (let parent of survivors) {
    const children = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < children; i++) {
      const child = new Agent(Date.now() + newAgents.length);
      child.role = parent.role;
      child.faction = parent.faction;
      child.wealth = parent.wealth * 0.5;
      child.energy = parent.energy * 0.5 + Math.random() * 30;
      child.techs = [...parent.techs];
      child.skills = Object.fromEntries(Object.entries(parent.skills).map(([k,v]) => [k, v + (Math.random() - 0.5) * 0.2]));
      child.inventory = Object.fromEntries(Object.entries(parent.inventory).map(([k,v]) => [k, v * 0.5]));
      newAgents.push(child);
    }
  }
  
  agents = [...survivors, ...newAgents];
  addToHistory();
}

function saveWorld(slot = 'auto') {
  const saveData = {
    version: '4.0', timestamp: Date.now(), generation, step,
    agents: agents.map(a => a.toJSON()), market: market.prices,
    marketVolatility: market.volatility, history, config: CONFIG
  };
  fs.writeFileSync(`save_${slot}.json`, JSON.stringify(saveData, null, 2));
  console.log(`💾 Saved to slot: ${slot}`);
}

function loadWorld(slot = 'auto') {
  try {
    const data = JSON.parse(fs.readFileSync(`save_${slot}.json`, 'utf8'));
    generation = data.generation || 0;
    step = data.step || 0;
    agents = data.agents.map(a => Agent.fromJSON(a));
    if (data.market) market.prices = data.market;
    if (data.marketVolatility) market.volatility = data.marketVolatility;
    history = data.history || { population: [], avgWealth: [], market: [], roles: {}, factions: {}, techs: [], events: [], gini: [], generations: [] };
    console.log(`📂 Loaded from slot: ${slot} | Gen ${generation} | Step ${step}`);
    return true;
  } catch(e) {
    console.log(`Slot ${slot} not found`);
    return false;
  }
}

if (!loadWorld('auto')) {
  console.log(`📦 Creating ${CONFIG.AGENT_COUNT} new agents...`);
  for (let i = 0; i < CONFIG.AGENT_COUNT; i++) {
    agents.push(new Agent(i));
  }
}

// ========== ИГРОВОЙ ЦИКЛ ==========
let evolveCounter = 0, saveCounter = 0;

setInterval(() => {
  step++;
  
  const globalEvent = eventManager.checkForEvent();
  for (let agent of agents) {
    agent.act(globalEvent);
  }
  if (globalEvent) eventManager.clearEvent();
  
  market.updatePrices();
  
  evolveCounter++;
  if (evolveCounter >= CONFIG.EVOLVE_INTERVAL) {
    evolveCounter = 0;
    evolve();
  }
  
  saveCounter++;
  if (saveCounter >= CONFIG.SAVE_INTERVAL) {
    saveCounter = 0;
    saveWorld('auto');
  }
  
  const alive = agents.filter(a => a.isAlive);
  if (step % 20 === 0) {
    const avgWealth = Math.floor(alive.reduce((s, a) => s + a.wealth, 0) / alive.length);
    const avgTech = alive.reduce((s, a) => s + a.techs.length, 0) / alive.length;
    console.log(`📊 Step ${step} | Gen ${generation} | Pop: ${alive.length} | Wealth: ${avgWealth} | Tech: ${avgTech.toFixed(1)}`);
  }
}, CONFIG.UPDATE_INTERVAL);

// ========== ВЕБ-СЕРВЕР С РАСШИРЕННЫМИ API ==========
app.use(express.json());
app.use(express.static('public'));

app.get('/api/status', (req, res) => {
  const alive = agents.filter(a => a.isAlive);
  res.json({
    generation, step, population: alive.length, totalAgents: agents.length,
    stats: {
      avgWealth: Math.floor(alive.reduce((s, a) => s + a.wealth, 0) / alive.length),
      avgEnergy: Math.floor(alive.reduce((s, a) => s + a.energy, 0) / alive.length),
      avgTech: alive.reduce((s, a) => s + a.techs.length, 0) / alive.length,
      activeEvent: eventManager.activeEvent?.name || null
    },
    market: market.getStats()
  });
});

app.get('/api/top/:criteria', (req, res) => {
  const alive = agents.filter(a => a.isAlive);
  const criteria = req.params.criteria;
  let sorted = [...alive];
  if (criteria === 'wealth') sorted.sort((a,b) => b.wealth - a.wealth);
  else if (criteria === 'tech') sorted.sort((a,b) => b.techs.length - a.techs.length);
  else if (criteria === 'karma') sorted.sort((a,b) => b.karma - a.karma);
  res.json({ agents: sorted.slice(0, 20).map(a => a.getStatus()) });
});

app.get('/api/roles', (req, res) => {
  const alive = agents.filter(a => a.isAlive);
  const roles = {};
  for (let agent of alive) roles[agent.role] = (roles[agent.role] || 0) + 1;
  res.json({ roles, total: alive.length });
});

app.get('/api/factions', (req, res) => {
  const alive = agents.filter(a => a.isAlive);
  const factions = {};
  for (let agent of alive) factions[agent.faction] = (factions[agent.faction] || 0) + 1;
  res.json({ factions, total: alive.length });
});

app.get('/api/inequality', (req, res) => {
  const alive = agents.filter(a => a.isAlive);
  const wealths = alive.map(a => a.wealth).sort((a,b) => a-b);
  const total = wealths.reduce((s, w) => s + w, 0);
  const avg = total / wealths.length;
  const gini = wealths.reduce((sum, w) => sum + Math.abs(w - avg), 0) / (2 * total);
  res.json({
    gini: gini.toFixed(3),
    wealthPercentiles: {
      p10: wealths[Math.floor(wealths.length * 0.1)],
      p50: wealths[Math.floor(wealths.length * 0.5)],
      p90: wealths[Math.floor(wealths.length * 0.9)]
    }
  });
});

app.get('/api/techs', (req, res) => {
  const allTechs = {};
  for (let agent of agents) {
    for (let tech of agent.techs) {
      allTechs[tech] = (allTechs[tech] || 0) + 1;
    }
  }
  res.json({ techs: allTechs, total: agents.length });
});

app.get('/api/history', (req, res) => {
  res.json(history);
});

app.get('/api/market', (req, res) => {
  res.json(market.getStats());
});

app.get('/api/market/predict/:resource', (req, res) => {
  const prediction = market.predictPrice(req.params.resource);
  res.json({ resource: req.params.resource, current: market.getPrice(req.params.resource), prediction });
});

app.get('/api/system', (req, res) => {
  const used = process.memoryUsage();
  res.json({
    uptime: process.uptime(),
    memory: {
      rss: Math.round(used.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(used.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(used.heapUsed / 1024 / 1024) + ' MB'
    },
    nodeVersion: process.version,
    platform: process.platform,
    config: CONFIG
  });
});

app.post('/api/save/:slot', (req, res) => {
  saveWorld(req.params.slot);
  res.json({ success: true, slot: req.params.slot });
});

app.post('/api/load/:slot', (req, res) => {
  const success = loadWorld(req.params.slot);
  res.json({ success });
});

app.post('/api/reset', (req, res) => {
  const { confirm } = req.body;
  if (confirm === 'YES_RESET') {
    generation = 0; step = 0; agents = [];
    for (let i = 0; i < CONFIG.AGENT_COUNT; i++) agents.push(new Agent(i));
    market.prices = {}; market.volatility = {};
    for (let res in RESOURCES) {
      market.prices[res] = RESOURCES[res].basePrice;
      market.volatility[res] = RESOURCES[res].volatility;
    }
    history = { population: [], avgWealth: [], market: [], roles: {}, factions: {}, techs: [], events: [], gini: [], generations: [] };
    saveWorld('auto');
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Reset not confirmed' });
  }
});

app.post('/api/give', (req, res) => {
  const { agentId, resource, amount } = req.body;
  const agent = agents.find(a => a.id == agentId);
  if (agent && agent.isAlive && agent.inventory[resource] !== undefined) {
    agent.inventory[resource] += amount;
    res.json({ success: true, newAmount: agent.inventory[resource] });
  } else {
    res.json({ success: false });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ AI GALAXY CORE v4.0 RUNNING!`);
  console.log(`📱 Local: http://localhost:${PORT}`);
  console.log(`\n🤖 ${agents.filter(a => a.isAlive).length}/${CONFIG.AGENT_COUNT} agents`);
  console.log(`🎭 ${Object.keys(FACTIONS).length} factions | 🌳 ${Object.keys(TECH_TREE).length} technologies`);
  console.log(`💰 ${Object.keys(RESOURCES).length} resources | 🌍 ${GLOBAL_EVENTS.length} events`);
  console.log(`💾 Auto-save every ${CONFIG.SAVE_INTERVAL} steps\n`);
});

process.on('SIGINT', () => {
  console.log('\n💾 Saving before exit...');
  saveWorld('auto');
  process.exit(0);
});
