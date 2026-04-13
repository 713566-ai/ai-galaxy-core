const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v83_state.json";

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
        this.birthTick = 0;
        this.chaosHistory = [];
    }
    
    cloneState(seed) {
        return JSON.parse(JSON.stringify(seed));
    }
}

// =========================
// 🧬 AGENT FACTORY
// =========================

function createAgent(name, variant = 0) {
    const basePersonality = {
        codey: { aggression: 0.6, curiosity: 0.7, risk: 0.5, stability: 0.6 },
        uiax: { aggression: 0.3, curiosity: 0.8, risk: 0.4, stability: 0.7 },
        garlic: { aggression: 0.2, curiosity: 0.3, risk: 0.2, stability: 0.9 }
    };
    
    const personality = basePersonality[name] || { aggression: 0.5, curiosity: 0.5, risk: 0.5, stability: 0.5 };
    
    // Добавляем вариативность для форков
    if (variant > 0) {
        personality.aggression += (Math.random() - 0.5) * 0.15;
        personality.curiosity += (Math.random() - 0.5) * 0.15;
        personality.risk += (Math.random() - 0.5) * 0.15;
        personality.stability += (Math.random() - 0.5) * 0.15;
        for (let k in personality) personality[k] = Math.max(0.1, Math.min(0.95, personality[k]));
    }
    
    return {
        name,
        fitness: 0.5 + (Math.random() - 0.5) * 0.2,
        personality: personality,
        consciousness: { trauma: 0, aggressionBias: 0, trustDecay: 0 },
        memory: [],
        warHistory: [],
        stats: { wins: 0, warsFought: 0, warsWon: 0 }
    };
}

// =========================
// 📊 CHAOS CONTROLLER
// =========================

function computeChaosLevel(state) {
    const { world: { entropy, wars }, reward: { smoothed }, tick } = state;
    let chaos = 0.5;
    if (smoothed < -0.2) chaos += 0.2;
    if (entropy < 0.35) chaos += 0.15;
    if (wars > 2) chaos += 0.2;
    if (entropy > 0.75) chaos -= 0.2;
    chaos += Math.sin(tick / 100) * 0.05;
    return Math.max(0.1, Math.min(0.9, chaos));
}

// =========================
// 🌍 WORLD STEP
// =========================

function stepWorld(state) {
    const chaos = computeChaosLevel(state);
    
    // Мировая динамика
    const targetEntropy = 0.45;
    const diff = targetEntropy - state.world.entropy;
    state.world.entropy += diff * 0.04 + (Math.random() - 0.5) * chaos * 0.08;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    state.world.wars = Math.max(0, Math.min(5, state.world.wars + (Math.random() > 0.9 ? 1 : -1)));
    
    // Обновление агентов
    let totalFitness = 0;
    for (const agent of state.agents) {
        agent.fitness = agent.fitness * 0.99 + (Math.random() - 0.5) * 0.04;
        agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness));
        totalFitness += agent.fitness;
    }
    
    const avgFitness = totalFitness / state.agents.length;
    state.reward.last = avgFitness - 0.5;
    state.reward.total += state.reward.last;
    state.reward.smoothed = state.reward.smoothed * 0.92 + state.reward.last * 0.08;
    state.reward.history.push({ tick: state.tick, reward: state.reward.last });
    if (state.reward.history.length > 200) state.reward.history.shift();
    
    state.tick++;
    return chaos;
}

// =========================
// 🌱 FORK TRIGGER
// =========================

function shouldForkUniverse(universe) {
    const { world, reward } = universe.state;
    const entropy = world.entropy;
    const smoothedReward = reward.smoothed || 0;
    const wars = world.wars || 0;
    
    // Давление форка
    let forkPressure = 0;
    forkPressure += entropy * 0.6;
    forkPressure += (smoothedReward < -0.3 ? 0.3 : 0);
    forkPressure += (wars > 3 ? 0.2 : 0);
    forkPressure += (universe.children.length === 0 ? 0.1 : 0);
    
    // Случайный фактор
    forkPressure += Math.random() * 0.2;
    
    return forkPressure > 0.65 && universe.tick > 10;
}

// =========================
// 🌌 FORK CREATION
// =========================

function forkUniverse(parentUniverse) {
    // Клонируем состояние
    const childState = JSON.parse(JSON.stringify(parentUniverse.state));
    
    // Мутируем состояние
    childState.world.entropy += (Math.random() - 0.5) * 0.25;
    childState.world.entropy = Math.max(0.1, Math.min(0.9, childState.world.entropy));
    childState.world.entities += Math.floor(Math.random() * 50) - 25;
    childState.world.entities = Math.max(300, Math.min(800, childState.world.entities));
    
    // Мутируем политику
    childState.policy = childState.policy || { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 };
    childState.policy.mutationRate *= 0.8 + Math.random() * 0.6;
    childState.policy.mutationRate = Math.max(0.1, Math.min(0.4, childState.policy.mutationRate));
    childState.policy.explorationBias = Math.random();
    
    // Мутируем агентов
    for (const agent of childState.agents) {
        agent.fitness *= 0.7 + Math.random() * 0.6;
        agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness));
        if (Math.random() > 0.7) {
            agent.personality.aggression += (Math.random() - 0.5) * 0.2;
            agent.personality.curiosity += (Math.random() - 0.5) * 0.2;
            for (let k in agent.personality) {
                agent.personality[k] = Math.max(0.1, Math.min(0.95, agent.personality[k]));
            }
        }
    }
    
    childState.reward = { total: 0, last: 0, smoothed: 0, history: [] };
    childState.tick = 0;
    
    const child = new Universe(childState, parentUniverse.id);
    child.birthTick = parentUniverse.tick;
    
    parentUniverse.children.push(child);
    
    console.log(`🌱 FORK: ${parentUniverse.id} → ${child.id} | Pressure: ${shouldForkUniverse(parentUniverse).toFixed(2)}`);
    
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
    
    universe.fitness = (r.smoothed || 0) * 1.5 + avgFitness * 0.5 - w.entropy * 0.3 + w.wars * 0.1;
    universe.fitness = Math.max(-1, Math.min(2, universe.fitness));
    
    return universe.fitness;
}

// =========================
// 🔁 MULTIVERSE STEP LOOP
// =========================

function stepMultiverse(universes) {
    const newUniverses = [];
    
    for (const universe of universes) {
        // Шаг мира внутри вселенной
        const chaos = stepWorld(universe.state);
        universe.chaosHistory.push(chaos);
        if (universe.chaosHistory.length > 50) universe.chaosHistory.shift();
        
        // Оценка fitness
        evaluateUniverse(universe);
        
        // Проверка на форк
        if (shouldForkUniverse(universe)) {
            const child = forkUniverse(universe);
            newUniverses.push(child);
        }
    }
    
    universes.push(...newUniverses);
    
    // Ограничение количества вселенных
    if (universes.length > 15) {
        universes.sort((a, b) => b.fitness - a.fitness);
        universes = universes.slice(0, 10);
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
            state: {
                tick: u.state.tick, policy: u.state.policy, world: u.state.world,
                reward: { total: u.state.reward.total, last: u.state.reward.last, smoothed: u.state.reward.smoothed },
                agents: u.state.agents.map(a => ({ name: a.name, fitness: a.fitness, personality: a.personality, stats: a.stats }))
            },
            childrenIds: u.children.map(c => c.id)
        }));
        fs.writeFileSync(STATE_FILE, JSON.stringify({ universes: toSave, timestamp: Date.now() }, null, 2));
    } catch(e) {}
}

function loadUniverses() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`♻️ V83 MULTIVERSE LOADED: ${data.universes?.length || 0} universes`);
            // Восстановление вселенных (упрощённо)
            const universes = [];
            for (const uData of data.universes || []) {
                const universe = new Universe(uData.state);
                universe.id = uData.id;
                universe.tick = uData.tick;
                universe.fitness = uData.fitness;
                universes.push(universe);
            }
            if (universes.length > 0) return universes;
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
            console.log(`🌌 V83 T${loopTick} | Universes:${universes.length} | BestFitness:${topUniverse?.fitness.toFixed(3)} | BestEntropy:${topUniverse?.state.world.entropy.toFixed(3)}`);
            saveUniverses(universes);
        }
    } catch (e) {
        console.error("❌ V83 ERROR:", e.message);
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
        topUniverses: topUniverses.map(u => ({
            id: u.id, fitness: u.fitness.toFixed(3), tick: u.tick, children: u.children.length,
            entropy: u.state.world.entropy.toFixed(3), reward: u.state.reward.smoothed?.toFixed(3)
        })),
        universeIds: universes.map(u => u.id)
    });
});

app.get("/api/universe/:id", (req, res) => {
    const universe = universes.find(u => u.id === req.params.id);
    if (!universe) return res.status(404).json({ error: "Universe not found" });
    res.json({
        id: universe.id,
        parentId: universe.parentId,
        tick: universe.tick,
        fitness: universe.fitness,
        children: universe.children.map(c => ({ id: c.id, fitness: c.fitness })),
        state: {
            world: universe.state.world,
            reward: universe.state.reward,
            agents: universe.state.agents.map(a => ({ name: a.name, fitness: a.fitness.toFixed(3) }))
        }
    });
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024), universes: universes.length });
});

app.listen(3000, () => {
    console.log("🌌 V83 RECURSIVE UNIVERSE FORKING CORE ONLINE :3000");
    console.log(`📊 Initial universes: ${universes.length}`);
});
