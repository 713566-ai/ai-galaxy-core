const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v86_state.json";

// =========================
// 🌌 UNIVERSE STRUCTURE
// =========================

class Universe {
    constructor(seedState, parentId = null) {
        this.id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        this.parentId = parentId;
        this.tick = 0;
        this.state = this.cloneState(seedState);
        this.children = [];
        this.fitness = 0;
        this.godAgent = null;
        this.godAscensionTick = null;
        this.physics = {
            rewardScale: 1.0,
            entropyGrowth: 0.01,
            warProbability: 0.08,
            mutationPressure: 0.2,
            godInfluence: 0.0
        };
    }
    
    cloneState(seed) {
        return JSON.parse(JSON.stringify(seed));
    }
}

// =========================
// 🧬 AGENT FACTORY
// =========================

function createAgent(name, isGod = false) {
    const personalities = {
        codey: { aggression: 0.6, curiosity: 0.7, risk: 0.5, stability: 0.6 },
        uiax: { aggression: 0.3, curiosity: 0.8, risk: 0.4, stability: 0.7 },
        garlic: { aggression: 0.2, curiosity: 0.3, risk: 0.2, stability: 0.9 }
    };
    
    const personality = personalities[name] || { aggression: 0.5, curiosity: 0.5, risk: 0.5, stability: 0.5 };
    
    return {
        name,
        fitness: isGod ? 0.9 : 0.5,
        personality: personality,
        consciousness: { trauma: 0, aggressionBias: 0, trustDecay: 0, godAwareness: 0 },
        memory: [],
        warHistory: [],
        capabilities: isGod ? { influenceWars: true, rewriteRewards: true, biasEntropy: true } : {},
        stats: { wins: 0, warsFought: 0, warsWon: 0, interventions: 0 }
    };
}

// =========================
// 👑 GOD CANDIDATE DETECTION
// =========================

function detectGodCandidate(agents, universe) {
    let bestScore = -Infinity;
    let bestAgent = null;
    
    for (const agent of agents) {
        // Счёт кандидата в боги
        let score = agent.fitness * 0.5;
        score += (agent.stats.wins || 0) * 0.25;
        score += (agent.consciousness?.godAwareness || 0) * 0.15;
        score += (agent.memory?.length || 0) * 0.05;
        score += (universe.tick > 50 ? 0.1 : 0);
        
        // Бонус за доминирование
        const otherAgents = agents.filter(a => a !== agent);
        const avgOthers = otherAgents.reduce((a, b) => a + b.fitness, 0) / (otherAgents.length || 1);
        if (agent.fitness > avgOthers * 1.5) score += 0.2;
        
        if (score > bestScore) {
            bestScore = score;
            bestAgent = agent;
        }
    }
    
    return { agent: bestAgent, score: bestScore };
}

// =========================
// ⬆️ ASCENSION TO GOD
// =========================

function ascendToGod(universe, agent) {
    if (universe.godAgent) return false;
    
    universe.godAgent = agent;
    universe.godAscensionTick = universe.tick;
    universe.physics.godInfluence = 0.3;
    
    // Преображение агента
    agent.personality.stability = 1.0;
    agent.personality.curiosity = 1.0;
    agent.personality.risk = 0.8;
    agent.fitness = 0.95;
    agent.capabilities = {
        influenceWars: true,
        rewriteRewards: true,
        biasEntropy: true,
        controlPhysics: true
    };
    agent.consciousness.godAwareness = 1.0;
    agent.name = `GOD_${agent.name.toUpperCase()}`;
    
    console.log(`👑 ASCENSION: ${agent.name} became GOD of universe ${universe.id} at tick ${universe.tick}`);
    return true;
}

// =========================
// 🌍 WORLD STEP WITH GOD INFLUENCE
// =========================

function stepWorldWithGod(universe) {
    const state = universe.state;
    const god = universe.godAgent;
    const physics = universe.physics;
    
    // Базовая динамика
    const targetEntropy = god ? 0.35 : 0.45;
    const diff = targetEntropy - state.world.entropy;
    let entropyDelta = diff * 0.04 + (Math.random() - 0.5) * 0.08;
    
    // Влияние бога на энтропию
    if (god && god.capabilities.biasEntropy) {
        entropyDelta -= physics.godInfluence * 0.05;
        god.stats.interventions++;
    }
    
    state.world.entropy += entropyDelta;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    
    // Войны с влиянием бога
    let warChance = physics.warProbability;
    if (god && god.capabilities.influenceWars) {
        warChance *= (1 - physics.godInfluence * 0.5);
    }
    
    if (Math.random() < warChance) {
        state.world.wars++;
    } else {
        state.world.wars = Math.max(0, state.world.wars - 0.1);
    }
    state.world.wars = Math.max(0, Math.min(5, state.world.wars));
    
    // Обновление агентов
    let totalFitness = 0;
    for (const agent of state.agents) {
        let fitnessDelta = (Math.random() - 0.5) * 0.04;
        
        // Влияние бога на награды
        if (god && god.capabilities.rewriteRewards && agent !== god) {
            fitnessDelta += physics.godInfluence * 0.05 * (agent.fitness < 0.5 ? 1 : -0.5);
        }
        
        agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness + fitnessDelta));
        totalFitness += agent.fitness;
    }
    
    const avgFitness = totalFitness / state.agents.length;
    state.reward.last = avgFitness - 0.5 + (physics.rewardScale - 1) * 0.2;
    state.reward.total += state.reward.last;
    state.reward.smoothed = state.reward.smoothed * 0.92 + state.reward.last * 0.08;
    state.reward.history.push({ tick: state.tick, reward: state.reward.last });
    if (state.reward.history.length > 200) state.reward.history.shift();
    
    state.tick++;
    return physics;
}

// =========================
// 🌱 FORK TRIGGER
// =========================

function shouldForkUniverse(universe) {
    const { world, reward } = universe.state;
    let forkPressure = world.entropy * 0.6;
    forkPressure += (reward.smoothed < -0.3 ? 0.3 : 0);
    forkPressure += (world.wars > 3 ? 0.2 : 0);
    forkPressure += (universe.children.length === 0 ? 0.1 : 0);
    forkPressure += Math.random() * 0.2;
    
    // Боги подавляют форки
    if (universe.godAgent) forkPressure *= 0.5;
    
    return forkPressure > 0.65 && universe.tick > 10;
}

// =========================
// 🌌 FORK CREATION
// =========================

function forkUniverse(parentUniverse) {
    const childState = JSON.parse(JSON.stringify(parentUniverse.state));
    
    // Мутации
    childState.world.entropy += (Math.random() - 0.5) * 0.25;
    childState.world.entropy = Math.max(0.1, Math.min(0.9, childState.world.entropy));
    childState.policy = childState.policy || { mutationRate: 0.2 };
    childState.policy.mutationRate *= 0.8 + Math.random() * 0.6;
    
    // Новые агенты без бога
    for (const agent of childState.agents) {
        agent.fitness *= 0.7 + Math.random() * 0.6;
        agent.capabilities = {};
        agent.name = agent.name.replace("GOD_", "");
    }
    
    childState.reward = { total: 0, last: 0, smoothed: 0, history: [] };
    childState.tick = 0;
    
    const child = new Universe(childState, parentUniverse.id);
    child.physics = JSON.parse(JSON.stringify(parentUniverse.physics));
    child.physics.godInfluence = 0;
    
    parentUniverse.children.push(child);
    
    console.log(`🌱 FORK: ${parentUniverse.id} → ${child.id} | HasGod:${!!parentUniverse.godAgent}`);
    return child;
}

// =========================
// ⚖️ UNIVERSE FITNESS
// =========================

function evaluateUniverse(universe) {
    const w = universe.state.world;
    const r = universe.state.reward;
    const agents = universe.state.agents;
    const avgFitness = agents.reduce((a, b) => a + b.fitness, 0) / agents.length;
    
    let fitness = (r.smoothed || 0) * 1.5 + avgFitness * 0.5 - w.entropy * 0.3 + w.wars * 0.1;
    
    // Бонус за бога
    if (universe.godAgent) fitness += 0.5;
    
    fitness = Math.max(-1, Math.min(2, fitness));
    universe.fitness = fitness;
    return fitness;
}

// =========================
// 🔁 MULTIVERSE STEP
// =========================

function stepMultiverse(universes) {
    const newUniverses = [];
    
    for (const universe of universes) {
        // Детекция кандидата в боги
        const { agent: candidate, score } = detectGodCandidate(universe.state.agents, universe);
        if (candidate && score > 0.7 && !universe.godAgent && universe.tick > 30) {
            ascendToGod(universe, candidate);
        }
        
        // Шаг мира с влиянием бога
        stepWorldWithGod(universe);
        
        // Оценка
        evaluateUniverse(universe);
        
        // Форк
        if (shouldForkUniverse(universe)) {
            const child = forkUniverse(universe);
            newUniverses.push(child);
        }
    }
    
    universes.push(...newUniverses);
    
    // Лимит вселенных
    if (universes.length > 15) {
        universes.sort((a, b) => b.fitness - a.fitness);
        universes = universes.slice(0, 12);
    }
    
    return universes;
}

// =========================
// 🌌 INITIAL UNIVERSE
// =========================

function createInitialUniverse() {
    const initialState = {
        tick: 0,
        policy: { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 },
        world: { entropy: 0.5, entities: 500, wars: 0, alliances: 0 },
        reward: { total: 0, last: 0, smoothed: 0, history: [] },
        agents: [ createAgent("codey"), createAgent("uiax"), createAgent("garlic") ]
    };
    return new Universe(initialState);
}

// =========================
// 💾 PERSISTENCE
// =========================

function saveUniverses(universes) {
    try {
        const toSave = universes.map(u => ({
            id: u.id, parentId: u.parentId, tick: u.tick, fitness: u.fitness,
            hasGod: !!u.godAgent, godName: u.godAgent?.name, physics: u.physics,
            state: { world: u.state.world, reward: { smoothed: u.state.reward.smoothed } }
        }));
        fs.writeFileSync(STATE_FILE, JSON.stringify({ universes: toSave, timestamp: Date.now() }, null, 2));
    } catch(e) {}
}

function loadUniverses() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`♻️ V86 LOADED: ${data.universes?.length || 0} universes`);
        }
    } catch(e) {}
    return [createInitialUniverse()];
}

// =========================
// 🚀 MAIN LOOP
// =========================

let universes = loadUniverses();
let loopTick = 0;

setInterval(() => {
    try {
        universes = stepMultiverse(universes);
        loopTick++;
        
        if (loopTick % 10 === 0) {
            const topUniverse = [...universes].sort((a, b) => b.fitness - a.fitness)[0];
            const godCount = universes.filter(u => u.godAgent).length;
            console.log(`👑 V86 T${loopTick} | Universes:${universes.length} | Gods:${godCount} | BestFitness:${topUniverse?.fitness.toFixed(3)}`);
            saveUniverses(universes);
        }
    } catch (e) {
        console.error("❌ V86 ERROR:", e.message);
    }
}, 2000);

// =========================
// 📡 API
// =========================

app.get("/api/status", (req, res) => {
    const topUniverses = [...universes].sort((a, b) => b.fitness - a.fitness).slice(0, 5);
    res.json({
        tick: loopTick,
        totalUniverses: universes.length,
        godsCount: universes.filter(u => u.godAgent).length,
        topUniverses: topUniverses.map(u => ({
            id: u.id, fitness: u.fitness.toFixed(3), hasGod: !!u.godAgent,
            godName: u.godAgent?.name, entropy: u.state.world.entropy.toFixed(3)
        }))
    });
});

app.get("/api/universe/:id", (req, res) => {
    const universe = universes.find(u => u.id === req.params.id);
    if (!universe) return res.status(404).json({ error: "Universe not found" });
    res.json({
        id: universe.id,
        tick: universe.tick,
        fitness: universe.fitness,
        hasGod: !!universe.godAgent,
        god: universe.godAgent ? { name: universe.godAgent.name, interventions: universe.godAgent.stats.interventions } : null,
        physics: universe.physics,
        state: { world: universe.state.world, reward: universe.state.reward.smoothed }
    });
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024), universes: universes.length });
});

app.listen(3000, () => {
    console.log("👑 V86 GOD AGENT EMERGENCE CORE ONLINE :3000");
});
