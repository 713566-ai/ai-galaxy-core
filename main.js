const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// ========== P2P ОБНАРУЖЕНИЕ ==========
let p2p = null;
try {
    p2p = require('./p2p-discovery.js');
    console.log('✅ P2P Discovery загружен');
} catch(e) {
    console.log('⚠️ P2P Discovery не загружен');
}

// ========== КЭШИРОВАНИЕ ==========
class SimpleCache {
    constructor() {
        this.cache = new Map();
    }
    get(key) {
        const item = this.cache.get(key);
        if (item && Date.now() < item.expires) return item.value;
        return null;
    }
    set(key, value, ttl = 5000) {
        this.cache.set(key, { value, expires: Date.now() + ttl });
    }
    clear() { this.cache.clear(); }
}
const cache = new SimpleCache();

// ========== ПАКЕТНАЯ ОБРАБОТКА ==========
class BatchProcessor {
    constructor(batchSize = 100) {
        this.batchSize = batchSize;
    }
    async processAgents(agents, callback) {
        for (let i = 0; i < agents.length; i += this.batchSize) {
            const batch = agents.slice(i, i + this.batchSize);
            await Promise.all(batch.map(callback));
            await this.delay(5);
        }
    }
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
}
const batchProcessor = new BatchProcessor(100);

// ========== АНАЛИТИЧЕСКИЙ ДВИЖОК ==========
class AnalyticsEngine {
    constructor() {
        this.history = [];
    }
    calculateGrowthRate() {
        if (this.history.length < 10) return 0.02;
        const recent = this.history.slice(-10);
        const start = recent[0];
        const end = recent[recent.length - 1];
        if (start === 0) return 0.02;
        return (end - start) / start / 10;
    }
    predictPopulation(days = 7) {
        const growth = this.calculateGrowthRate();
        const predictions = [];
        let current = this.history[this.history.length - 1] || 500;
        if (current === 0) current = 500;
        for (let i = 0; i < days; i++) {
            current = current * (1 + growth);
            predictions.push(Math.floor(Math.max(0, current)));
        }
        return predictions;
    }
    calculateGini(agents) {
        const wealths = agents.filter(a => a.isAlive).map(a => a.wealth).sort((a,b) => a-b);
        if (wealths.length === 0) return 0;
        const n = wealths.length;
        let sum = 0;
        for (let i = 0; i < n; i++) sum += (i + 1) * wealths[i];
        const total = wealths.reduce((a,b) => a+b, 0);
        if (total === 0) return 0;
        return (2 * sum) / (n * total) - (n + 1)/n;
    }
    getActivityHeatmap(agents) {
        const roles = {}, factions = {};
        agents.filter(a => a.isAlive).forEach(a => {
            roles[a.role] = (roles[a.role] || 0) + 1;
            factions[a.faction] = (factions[a.faction] || 0) + 1;
        });
        return { roles, factions };
    }
}
const analytics = new AnalyticsEngine();

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

const JWT_SECRET = 'ai-galaxy-core-secret-key-2024';

// ========== RATE LIMITING ==========
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Rate limit exceeded. Please try again in an hour.' }
});
app.use('/api/', limiter);
app.use('/api/auth/', strictLimiter);

// ========== WEBSOCKET ==========
const wss = new WebSocket.Server({ port: 3001 });
const clients = new Set();
wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});
function broadcastUpdate(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

process.setMaxListeners(0);

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║   🚀 AI GALAXY CORE v7.0 - ULTIMATE EDITION                                ║
║   🤖 500 Agents | 📈 Market | 💰 Платежи | ⚡ WebSocket | 🔒 JWT             ║
║   🌐 P2P Discovery | 🧠 Self-Learning | 🔗 Cross-Core Communication         ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
    AGENT_COUNT: 500,
    SAVE_INTERVAL: 30,
    EVOLVE_INTERVAL: 10,
    UPDATE_INTERVAL: 3000,
    MAX_HISTORY: 100,
    MAX_AGENTS: 50000
};

// ========== РЕСУРСЫ ==========
const RESOURCES = {
    energy: { name: '⚡ Energy', basePrice: 10, volatility: 0.3 },
    minerals: { name: '⛏️ Minerals', basePrice: 15, volatility: 0.4 },
    food: { name: '🌾 Food', basePrice: 8, volatility: 0.2 },
    tech: { name: '🔬 Tech', basePrice: 50, volatility: 0.5 },
    crystals: { name: '💎 Crystals', basePrice: 100, volatility: 0.7 },
    weapons: { name: '⚔️ Weapons', basePrice: 200, volatility: 0.8 },
    ships: { name: '🚀 Ships', basePrice: 1000, volatility: 0.6 },
    research: { name: '🔭 Research', basePrice: 500, volatility: 0.4 },
    medicine: { name: '💊 Medicine', basePrice: 150, volatility: 0.5 },
    luxury: { name: '💎 Luxury', basePrice: 300, volatility: 0.9 }
};

// ========== ФРАКЦИИ ==========
const FACTIONS = {
    federation: { name: '🌍 Federation', bonus: { trade: 1.2, diplomacy: 1.3 } },
    empire: { name: '👑 Empire', bonus: { combat: 1.3, production: 1.1 } },
    collective: { name: '🤝 Collective', bonus: { production: 1.2, research: 1.1 } },
    cult: { name: '🌀 Tech Cult', bonus: { tech: 1.4, research: 1.2 } },
    syndicate: { name: '💼 Syndicate', bonus: { trade: 1.4, wealth: 1.1 } }
};

// ========== ГЛОБАЛЬНЫЕ СОБЫТИЯ ==========
const GLOBAL_EVENTS = [
    { name: "💥 Экономический кризис", probability: 0.03, effect: (market) => {
        for (let res in market.prices) market.prices[res] *= 0.6;
        console.log("💥 Экономический кризис! Цены упали на 40%");
    }},
    { name: "🚀 Технологический бум", probability: 0.02, effect: (market) => {
        market.prices.tech *= 1.5;
        console.log("🚀 Технологический бум! Технологии развиваются");
    }},
    { name: "🦠 Пандемия", probability: 0.02, effect: (market) => {
        market.prices.medicine *= 2;
        console.log("🦠 Пандемия! Медицина стала дороже");
    }},
    { name: "⚔️ Межфракционная война", probability: 0.02, effect: (market) => {
        market.prices.weapons *= 1.8;
        market.prices.ships *= 1.5;
        console.log("⚔️ Война! Оружие и корабли подорожали");
    }},
    { name: "✨ Золотая эра", probability: 0.01, effect: (market) => {
        for (let res in market.prices) market.prices[res] *= 1.2;
        console.log("✨ Золотая эра! Процветание и рост");
    }}
];

// ========== ПЛАТЕЖНЫЕ ДАННЫЕ ==========
const BANK_DETAILS = {
    card: '4441 1110 8473 8792',
    cardName: 'KADUKOV HLIB',
    usdt: 'TEK5PUb2fzyr7V3gHHVDChBaLaJfTy6P8h',
    btc: '15JqhF9EvgTezhJRpz1uB1BPo8eARudH5G',
    eth: '0xf3ae67498bb2c15974be610fba3e16746f53de10',
    ton: 'UQBwWL-KEqr2sz3gsSGvRolJ37m9-P6wxVuq5Eaf2--ENzOB',
    phone: '+380987979381'
};

const users = new Map();
const activeSubscriptions = new Map();

// ========== АГЕНТ ==========
class Agent {
    constructor(id, fromSave = false) {
        this.id = id;
        if (!fromSave) {
            this.role = ['explorer', 'builder', 'trader', 'warrior', 'collector', 'scientist'][Math.floor(Math.random() * 6)];
            this.energy = 50 + Math.random() * 50;
            this.level = 1;
            this.wealth = 100 + Math.random() * 200;
            this.age = 0;
            this.isAlive = true;
            this.faction = Object.keys(FACTIONS)[Math.floor(Math.random() * Object.keys(FACTIONS).length)];
            this.techs = [];
            this.skills = { mining: 1 + Math.random() * 2, trading: 1 + Math.random() * 2, combat: 1 + Math.random() * 2, research: 1 + Math.random() * 2 };
            this.inventory = { energy: 100, minerals: 50, food: 100, tech: 10, crystals: 5, weapons: 5, ships: 1, research: 2, medicine: 10, luxury: 3 };
            this.personality = { aggressiveness: Math.random(), greed: Math.random(), generosity: Math.random(), intelligence: Math.random() };
            this.emotions = { happiness: 50, fear: 0, anger: 0, trust: 50 };
            this.friends = [];
            this.enemies = [];
            this.reputation = 0;
            this.experience = 0;
        } else {
            if (!this.personality) this.personality = { aggressiveness: Math.random(), greed: Math.random(), generosity: Math.random(), intelligence: Math.random() };
            if (!this.emotions) this.emotions = { happiness: 50, fear: 0, anger: 0, trust: 50 };
            if (!this.friends) this.friends = [];
            if (!this.enemies) this.enemies = [];
            if (this.reputation === undefined) this.reputation = 0;
            if (this.experience === undefined) this.experience = 0;
        }
    }
    
    act() {
        if (!this.isAlive) return;
        this.age++;
        this.energy -= 1;
        if (this.energy < 0) this.energy = 0;
        
        let action = 'idle';
        if (this.energy < 30) action = 'search';
        else if (this.emotions && this.emotions.fear > 60) action = 'hide';
        else if (this.role === 'explorer') action = Math.random() < 0.5 ? 'explore' : 'idle';
        else if (this.role === 'trader') action = 'trade';
        else if (this.role === 'warrior') action = Math.random() < 0.3 ? 'fight' : 'idle';
        else if (this.role === 'collector') action = 'collect';
        else if (this.role === 'builder') action = 'build';
        else if (this.role === 'scientist') action = 'research';
        
        this.executeAction(action);
        
        if (this.age > 100 && Math.random() < 0.003) this.isAlive = false;
    }
    
    executeAction(action) {
        switch(action) {
            case 'search': this.energy += 15; break;
            case 'hide': this.energy += 5; if (this.emotions) this.emotions.fear -= 10; break;
            case 'explore':
                this.energy += Math.random() * 20;
                if (Math.random() < 0.3) {
                    const resources = Object.keys(RESOURCES);
                    const res = resources[Math.floor(Math.random() * resources.length)];
                    this.inventory[res] += Math.floor(Math.random() * 10) + 5;
                }
                break;
            case 'collect': this.energy += 10; this.inventory.energy += Math.floor(Math.random() * 15) + 5; break;
            case 'trade': this.performTrade(); break;
            case 'build': this.energy -= 3; this.wealth += 25; break;
            case 'research':
                this.energy -= 5;
                this.experience += 10;
                if (this.experience > 100 && this.techs.length < 10) {
                    this.techs.push(`tech_${this.techs.length}`);
                    this.experience = 0;
                }
                break;
            case 'fight':
                if (Math.random() < 0.5) { this.wealth += 40; if (this.emotions) this.emotions.anger += 10; }
                else { this.energy -= 15; if (this.emotions) this.emotions.fear += 20; }
                break;
            default: this.energy += 3;
        }
        this.energy = Math.min(100, Math.max(0, this.energy));
        this.wealth = Math.max(0, this.wealth);
        if (this.emotions) {
            this.emotions.happiness = Math.max(0, Math.min(100, this.emotions.happiness));
            this.emotions.fear = Math.max(0, Math.min(100, this.emotions.fear));
            this.emotions.anger = Math.max(0, Math.min(100, this.emotions.anger));
        }
    }
    
    performTrade() {
        const resources = Object.keys(RESOURCES);
        const res = resources[Math.floor(Math.random() * resources.length)];
        const amount = Math.floor(Math.random() * 10) + 1;
        const priceMod = (this.personality && this.personality.greed > 0.7) ? 1.2 : 0.9;
        if (Math.random() < 0.5) {
            if (this.inventory[res] >= amount) {
                const price = market.getPrice(res) * priceMod;
                this.inventory[res] -= amount;
                this.wealth += amount * price;
            }
        } else {
            const price = market.getPrice(res) * ((this.personality && this.personality.generosity > 0.7) ? 0.8 : 1);
            if (this.wealth >= amount * price) {
                this.wealth -= amount * price;
                this.inventory[res] += amount;
            }
        }
    }
    
    toJSON() {
        return {
            id: this.id, role: this.role, energy: this.energy, wealth: this.wealth,
            age: this.age, isAlive: this.isAlive, faction: this.faction,
            techs: this.techs, skills: this.skills, inventory: this.inventory,
            personality: this.personality, emotions: this.emotions,
            friends: this.friends, enemies: this.enemies, reputation: this.reputation,
            experience: this.experience
        };
    }
    
    static fromJSON(data) {
        const agent = new Agent(data.id, true);
        Object.assign(agent, data);
        return agent;
    }
    
    getStatus() {
        return {
            id: this.id, role: this.role, faction: this.faction,
            energy: Math.floor(this.energy), wealth: Math.floor(this.wealth), age: this.age,
            techs: this.techs.length,
            happiness: this.emotions ? this.emotions.happiness : 50,
            reputation: this.reputation || 0,
            friends: this.friends ? this.friends.length : 0
        };
    }
}

// ========== РЫНОК ==========
class Market {
    constructor() {
        this.prices = {};
        this.history = [];
        for (let res in RESOURCES) this.prices[res] = RESOURCES[res].basePrice;
    }
    getPrice(resource) { return Math.floor(this.prices[resource] || 10); }
    updatePrices() {
        for (let res in RESOURCES) {
            if (RESOURCES[res]) {
                let change = (Math.random() - 0.5) * RESOURCES[res].volatility;
                this.prices[res] *= (1 + change);
                this.prices[res] = Math.max(1, Math.min(500, this.prices[res]));
            }
        }
        this.history.push({ ...this.prices, timestamp: Date.now() });
        if (this.history.length > 100) this.history.shift();
    }
    getStats() { return this.prices; }
}

const market = new Market();
let agents = [];
let generation = 0;
let step = 0;
let history = { population: [], avgWealth: [], market: [], roles: {}, generations: [], gini: [] };
let lastEventTime = Date.now();

function addToHistory() {
    const alive = agents.filter(a => a.isAlive);
    const roles = {};
    for (let agent of alive) roles[agent.role] = (roles[agent.role] || 0) + 1;
    history.population.push({ step, value: alive.length });
    history.avgWealth.push({ step, value: alive.reduce((s, a) => s + a.wealth, 0) / (alive.length || 1) });
    history.market.push({ step, prices: { ...market.prices } });
    history.roles[generation] = roles;
    history.generations.push({ generation, step, population: alive.length });
    history.gini.push({ step, value: analytics.calculateGini(agents) });
    analytics.history.push(alive.length);
    if (analytics.history.length > 100) analytics.history.shift();
    if (history.population.length > CONFIG.MAX_HISTORY) history.population.shift();
    if (history.avgWealth.length > CONFIG.MAX_HISTORY) history.avgWealth.shift();
    if (history.market.length > CONFIG.MAX_HISTORY) history.market.shift();
    if (history.gini.length > CONFIG.MAX_HISTORY) history.gini.shift();
}

function saveWorld(slot = 'auto') {
    try {
        const aliveAgents = agents.filter(a => a.isAlive);
        const saveData = {
            version: '7.0', timestamp: Date.now(), generation, step,
            agents: aliveAgents.slice(0, 500).map(a => a.toJSON()),
            market: market.prices,
            history: { population: history.population.slice(-50), avgWealth: history.avgWealth.slice(-50), gini: history.gini.slice(-50) }
        };
        fs.writeFileSync(`save_${slot}.json`, JSON.stringify(saveData, null, 2));
        console.log(`💾 Saved to slot: ${slot}`);
    } catch(e) { console.log('❌ Save failed:', e.message); }
}

function loadWorld(slot = 'auto') {
    try {
        if (fs.existsSync(`save_${slot}.json`)) {
            const data = JSON.parse(fs.readFileSync(`save_${slot}.json`, 'utf8'));
            generation = data.generation || 0;
            step = data.step || 0;
            agents = data.agents.map(a => Agent.fromJSON(a));
            if (data.market) market.prices = data.market;
            console.log(`📂 Loaded: Gen ${generation} | ${agents.filter(a => a.isAlive).length} agents`);
            return true;
        }
    } catch(e) {}
    return false;
}

if (!loadWorld('auto')) {
    console.log(`📦 Creating ${CONFIG.AGENT_COUNT} new agents...`);
    for (let i = 0; i < CONFIG.AGENT_COUNT; i++) agents.push(new Agent(i));
}

function checkGlobalEvent() {
    if (Date.now() - lastEventTime < 60000) return;
    for (const event of GLOBAL_EVENTS) {
        if (Math.random() < event.probability) {
            event.effect(market);
            lastEventTime = Date.now();
            broadcastUpdate({ type: 'event', event: event.name });
            break;
        }
    }
}

function evolve() {
    generation++;
    let alive = agents.filter(a => a.isAlive);
    if (alive.length > CONFIG.MAX_AGENTS) {
        alive.sort((a, b) => (b.wealth + b.energy + b.techs.length * 100) - (a.wealth + a.energy + a.techs.length * 100));
        agents = alive.slice(0, CONFIG.MAX_AGENTS);
        addToHistory();
        return;
    }
    if (alive.length < 50) {
        for (let i = 0; i < 200; i++) agents.push(new Agent(Date.now() + i));
        addToHistory();
        return;
    }
    alive.sort((a, b) => (b.wealth + b.energy + b.techs.length * 100) - (a.wealth + a.energy + a.techs.length * 100));
    const survivors = alive.slice(0, Math.floor(alive.length * 0.7));
    const newAgents = [];
    for (let parent of survivors) {
        const children = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < children; i++) {
            const child = new Agent(Date.now() + newAgents.length);
            child.role = parent.role;
            child.faction = parent.faction;
            child.wealth = Math.max(50, parent.wealth * (0.5 + Math.random() * 0.3));
            child.energy = Math.max(30, parent.energy * 0.6 + Math.random() * 40);
            child.techs = [...parent.techs];
            if (parent.personality) {
                child.personality = { ...parent.personality };
                for (let trait in child.personality) {
                    child.personality[trait] += (Math.random() - 0.5) * 0.1;
                    child.personality[trait] = Math.max(0, Math.min(1, child.personality[trait]));
                }
            }
            newAgents.push(child);
        }
    }
    agents = [...survivors, ...newAgents];
    addToHistory();
    console.log(`🧬 Gen ${generation}: ${survivors.length} → ${agents.length} agents`);
}

let evolveCounter = 0, saveCounter = 0;
setInterval(() => {
    step++;
    batchProcessor.processAgents(agents, async (agent) => { agent.act(); });
    market.updatePrices();
    checkGlobalEvent();
    evolveCounter++;
    if (evolveCounter >= CONFIG.EVOLVE_INTERVAL) { evolveCounter = 0; evolve(); }
    saveCounter++;
    if (saveCounter >= CONFIG.SAVE_INTERVAL) { saveCounter = 0; saveWorld('auto'); }
    const alive = agents.filter(a => a.isAlive);
    const predictions = analytics.predictPopulation(5);
    const heatmap = analytics.getActivityHeatmap(agents);
    broadcastUpdate({
        type: 'stats', step, generation,
        population: alive.length,
        avgWealth: Math.floor(alive.reduce((s, a) => s + a.wealth, 0) / (alive.length || 1)),
        avgTech: alive.reduce((s, a) => s + a.techs.length, 0) / (alive.length || 1),
        gini: analytics.calculateGini(agents),
        market: market.prices,
        predictions, heatmap
    });
    if (step % 100 === 0) cache.clear();
    if (step % 20 === 0) {
        const avgWealth = Math.floor(alive.reduce((s, a) => s + a.wealth, 0) / (alive.length || 1));
        const gini = analytics.calculateGini(agents);
        console.log(`📊 Step ${step} | Gen ${generation} | Pop: ${alive.length} | Wealth: ${avgWealth} | Gini: ${gini.toFixed(3)}`);
    }
}, CONFIG.UPDATE_INTERVAL);

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token required' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

app.use(express.json());
app.use(express.static('public'));

app.get('/api/status', (req, res) => {
    const cached = cache.get('status');
    if (cached) return res.json(cached);
    const alive = agents.filter(a => a.isAlive);
    const data = {
        generation, step, population: alive.length,
        stats: {
            avgWealth: Math.floor(alive.reduce((s, a) => s + a.wealth, 0) / (alive.length || 1)),
            avgEnergy: Math.floor(alive.reduce((s, a) => s + a.energy, 0) / (alive.length || 1)),
            avgTech: alive.reduce((s, a) => s + a.techs.length, 0) / (alive.length || 1),
            gini: analytics.calculateGini(agents)
        },
        market: market.getStats(),
        predictions: analytics.predictPopulation(7),
        heatmap: analytics.getActivityHeatmap(agents)
    };
    cache.set('status', data);
    res.json(data);
});

app.get('/api/market', (req, res) => {
    const cached = cache.get('market');
    if (cached) return res.json(cached);
    cache.set('market', market.getStats());
    res.json(market.getStats());
});

app.get('/api/agents', authenticateToken, (req, res) => {
    const alive = agents.filter(a => a.isAlive);
    res.json({ agents: alive.slice(0, 30).map(a => a.getStatus()) });
});

app.get('/api/analytics', (req, res) => {
    res.json({
        gini: analytics.calculateGini(agents),
        predictions: analytics.predictPopulation(10),
        heatmap: analytics.getActivityHeatmap(agents),
        growthRate: analytics.calculateGrowthRate()
    });
});

app.get('/api/export/csv', (req, res) => {
    let csv = 'step,population,avgWealth,gini\n';
    for (let i = 0; i < history.population.length; i++) {
        const pop = history.population[i];
        const wealth = history.avgWealth.find(w => w.step === pop.step);
        const gini = history.gini.find(g => g.step === pop.step);
        csv += `${pop.step},${pop.value},${wealth?.value || 0},${gini?.value || 0}\n`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=ai-galaxy-export.csv');
    res.send(csv);
});

app.get('/api/export/json', (req, res) => {
    res.json({
        agents: agents.filter(a => a.isAlive).slice(0, 100).map(a => a.getStatus()),
        market: market.prices,
        history: history,
        analytics: {
            gini: analytics.calculateGini(agents),
            predictions: analytics.predictPopulation(10),
            heatmap: analytics.getActivityHeatmap(agents)
        }
    });
});

app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (users.has(username)) return res.status(409).json({ error: 'Username exists' });
    const hashedPassword = hashPassword(password);
    const user = { id: users.size + 1, username, email, password: hashedPassword, createdAt: Date.now(), role: 'user' };
    users.set(username, user);
    const token = jwt.sign({ id: user.id, username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, username, email } });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const user = users.get(username);
    if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, username, email: user.email } });
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

app.post('/api/create-payment', strictLimiter, express.json(), (req, res) => {
    const { plan, paymentMethod, clientEmail } = req.body;
    const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
    const prices = { basic: 29, pro: 99, enterprise: 299 };
    const pricesUAH = { basic: 1200, pro: 4000, enterprise: 12000 };
    const instructions = {
        card: `💳 Карта: ${BANK_DETAILS.card}\nСумма: ${pricesUAH[plan]} грн\nID: ${paymentId}`,
        usdt: `💎 USDT TRC20: ${BANK_DETAILS.usdt}\nСумма: $${prices[plan]}\nID: ${paymentId}`,
        btc: `₿ BTC: ${BANK_DETAILS.btc}\nСумма: ${(prices[plan] / 50000).toFixed(6)} BTC`,
        eth: `🔷 ETH: ${BANK_DETAILS.eth}\nСумма: ${(prices[plan] / 2000).toFixed(4)} ETH`,
        ton: `📱 TON: ${BANK_DETAILS.ton}\nСумма: ${(prices[plan] / 5).toFixed(2)} TON`
    };
    res.json({ success: true, paymentId, instructions: instructions[paymentMethod] || instructions.card, supportPhone: BANK_DETAILS.phone });
});

app.post('/api/confirm-payment', strictLimiter, express.json(), (req, res) => {
    const { plan, method, email, paymentId } = req.body;
    const apiKey = 'ak_' + Math.random().toString(36).substr(2, 32);
    activeSubscriptions.set(apiKey, { plan, email, method, paymentId, createdAt: Date.now(), expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 });
    console.log(`✅ NEW SUBSCRIPTION: ${email} | ${plan} | ${method}`);
    res.json({ success: true, apiKey, plan, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), supportPhone: BANK_DETAILS.phone });
});

app.get('/api/verify/:apiKey', (req, res) => {
    const sub = activeSubscriptions.get(req.params.apiKey);
    if (!sub) return res.json({ valid: false });
    if (sub.expiresAt < Date.now()) {
        activeSubscriptions.delete(req.params.apiKey);
        return res.json({ valid: false, message: 'Expired' });
    }
    res.json({ valid: true, plan: sub.plan, daysLeft: Math.ceil((sub.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)) });
});

app.get('/', (req, res) => res.sendFile(__dirname + '/public/landing.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/public/dashboard.html'));
app.get('/payment', (req, res) => res.sendFile(__dirname + '/public/payment.html'));

app.listen(PORT, '0.0.0.0', () => {
    const alive = agents.filter(a => a.isAlive).length;
    console.log(`\n✅ AI GALAXY CORE v7.0 RUNNING!`);
    console.log(`📱 HTTP: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:3001`);
    console.log(`🤖 ${alive} agents`);
    console.log(`💰 ${Object.keys(RESOURCES).length} resources`);
    console.log(`🎭 ${Object.keys(FACTIONS).length} factions`);
    console.log(`🌍 ${GLOBAL_EVENTS.length} global events`);
    console.log(`🔒 JWT | ⚡ Rate Limit | 🧠 Emotions | 📊 Analytics\n`);
});

process.on('SIGINT', () => {
    console.log('\n💾 Saving before exit...');
    saveWorld('auto');
    process.exit(0);
});
