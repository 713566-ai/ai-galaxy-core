const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v80_state.json";

// =========================
// 🧠 CHAOS CONTROLLER
// =========================

function computeChaosLevel(state) {
    const {
        world: { entropy, wars, entities },
        reward: { smoothed },
        tick
    } = state;
    
    let chaos = 0.5; // базовый уровень
    
    // 📉 если награда падает → больше хаоса
    if (smoothed < -0.2) chaos += 0.25;
    if (smoothed < -0.5) chaos += 0.2;
    
    // 🌍 если мир слишком стабильный → встряска
    if (entropy < 0.35) chaos += 0.2;
    if (entropy < 0.25) chaos += 0.15;
    
    // 💥 если есть войны → усилить нестабильность
    if (wars > 2) chaos += 0.15;
    if (wars > 4) chaos += 0.2;
    
    // 🧊 если слишком хаотично → стабилизация
    if (entropy > 0.75) chaos -= 0.25;
    if (entropy > 0.85) chaos -= 0.3;
    
    // 📈 если мало сущностей → стимулировать рост
    if (entities < 400) chaos += 0.1;
    if (entities > 700) chaos -= 0.1;
    
    // ⏳ со временем лёгкий дрейф
    chaos += Math.sin(tick / 100) * 0.05;
    
    // Ограничения
    return Math.max(0.1, Math.min(0.9, chaos));
}

// =========================
// 🔧 SELF-MODIFYING POLICY
// =========================

function adaptPolicy(policy, chaosLevel) {
    const newPolicy = { ...policy };
    
    // mutation self-tuning
    newPolicy.mutationRate = 0.12 + chaosLevel * 0.28;
    
    // exploration auto-balance
    newPolicy.explorationBias = 0.25 + chaosLevel * 0.65;
    
    // selection pressure weakens in chaos
    newPolicy.selectionPressure = 0.85 - chaosLevel * 0.45;
    
    // clamping
    newPolicy.mutationRate = Math.max(0.1, Math.min(0.35, newPolicy.mutationRate));
    newPolicy.explorationBias = Math.max(0.25, Math.min(0.85, newPolicy.explorationBias));
    newPolicy.selectionPressure = Math.max(0.4, Math.min(0.85, newPolicy.selectionPressure));
    
    return newPolicy;
}

// =========================
// 🎲 CHAOS REWARD ENGINE
// =========================

function computeReward(lastReward, chaosLevel, actionReward) {
    // Шум на основе хаоса
    const noise = (Math.random() - 0.5) * chaosLevel * 0.8;
    
    // Swing-эффект (усиление колебаний)
    const swing = actionReward * (1 + chaosLevel * 0.5);
    
    // Мемори-эффект (последняя награда влияет)
    const memoryEffect = lastReward * 0.1;
    
    let finalReward = swing + noise + memoryEffect;
    
    // Ограничения
    return Math.max(-2.5, Math.min(2.5, finalReward));
}

// =========================
// 🧬 AGENT FACTORY
// =========================

function createAgent(name, strategy = "balance") {
    const personalities = {
        codey: { aggression: 0.6, curiosity: 0.7, risk: 0.5, stability: 0.6 },
        uiax: { aggression: 0.3, curiosity: 0.8, risk: 0.4, stability: 0.7 },
        garlic: { aggression: 0.2, curiosity: 0.3, risk: 0.2, stability: 0.9 }
    };
    
    return {
        name,
        strategy,
        fitness: 0.5,
        personality: personalities[name] || {
            aggression: Math.random(),
            curiosity: Math.random(),
            risk: Math.random(),
            stability: 0.5 + Math.random() * 0.4
        },
        goals: { survive: 1.0, grow: 1.0, interact: 1.0, stabilize: 1.0 },
        memory: [],
        strategyCache: { bestAction: null, worstAction: null, mode: "neutral", confidence: 0.5 },
        stats: { wins: 0, actions: { expand: 0, diplomacy: 0, monitor: 0, stabilize: 0 } }
    };
}

// =========================
// 🧠 CAUSAL MEMORY
// =========================

const causalMap = new Map();

function updateCausal(agent, action, reward) {
    if (!causalMap.has(agent.name)) causalMap.set(agent.name, {});
    const map = causalMap.get(agent.name);
    if (!map[action]) map[action] = { sum: 0, count: 0, recent: [] };
    map[action].sum += reward;
    map[action].count++;
    map[action].recent.push(reward);
    if (map[action].recent.length > 10) map[action].recent.shift();
    if (map[action].recent.length >= 3) {
        map[action].trend = map[action].recent.reduce((a, b) => a + b, 0) / map[action].recent.length;
    }
}

function updateStrategy(agent) {
    const map = causalMap.get(agent.name);
    if (!map || Object.keys(map).length < 3) return;
    
    let best = null, worst = null, bestScore = -Infinity, worstScore = Infinity;
    for (const action in map) {
        const avg = map[action].sum / map[action].count;
        const trend = map[action].trend || avg;
        const score = avg * 0.6 + trend * 0.4;
        if (score > bestScore) { bestScore = score; best = action; }
        if (score < worstScore) { worstScore = score; worst = action; }
    }
    agent.strategyCache.bestAction = best;
    agent.strategyCache.worstAction = worst;
    agent.strategyCache.confidence = Math.min(0.9, (bestScore - worstScore) / 2);
    
    if (bestScore > 0.5) agent.strategyCache.mode = "growth";
    else if (worstScore < -0.4) agent.strategyCache.mode = "defensive";
    else if (bestScore > 0.1) agent.strategyCache.mode = "exploration";
    else agent.strategyCache.mode = "neutral";
}

function decideAction(agent, world) {
    const strategy = agent.strategyCache;
    const goals = agent.goals;
    const p = agent.personality;
    const entropy = world.entropy;
    
    let scores = { expand: 0, diplomacy: 0, monitor: 0, stabilize: 0 };
    
    if (strategy.bestAction && strategy.confidence > 0.3) {
        scores[strategy.bestAction] += 0.5 + strategy.confidence;
    }
    
    scores.expand += goals.grow * 0.5 * p.aggression;
    scores.diplomacy += goals.interact * 0.5 * p.curiosity;
    scores.stabilize += goals.stabilize * 0.5 * p.stability;
    scores.monitor += goals.survive * 0.3 * (1 - p.risk);
    
    if (entropy < 0.35) scores.expand += 0.4;
    if (entropy > 0.65) scores.stabilize += 0.5;
    if (world.wars > 2) scores.diplomacy += 0.4;
    
    const action = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    return { action, confidence: scores[action] };
}

// =========================
// 💾 PERSISTENCE
// =========================

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`♻️ V80 STATE LOADED: tick=${raw.tick || 0}`);
            return raw;
        }
    } catch(e) {}
    return null;
}

function saveState(state) {
    try {
        const toSave = {
            tick: state.tick,
            world: state.world,
            policy: state.policy,
            reward: { total: state.reward.total, last: state.reward.last, smoothed: state.reward.smoothed, history: state.reward.history.slice(-200) },
            agents: state.agents.map(a => ({ name: a.name, strategy: a.strategy, fitness: a.fitness, personality: a.personality, goals: a.goals, strategyCache: a.strategyCache, stats: a.stats }))
        };
        fs.writeFileSync(STATE_FILE, JSON.stringify(toSave, null, 2));
    } catch(e) {}
}

// =========================
// 🧠 CORE STATE
// =========================

let loaded = loadState();
let state = loaded || {
    tick: 0,
    policy: { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 },
    world: { entropy: 0.5, entities: 500, wars: 0, alliances: 0 },
    reward: { total: 0, last: 0, smoothed: 0, history: [] },
    agents: [ createAgent("codey", "growth"), createAgent("uiax", "balance"), createAgent("garlic", "safety") ]
};

// =========================
// 🔁 EVOLUTION STEP
// =========================

function step() {
    state.tick++;
    
    // 1. Вычисляем уровень хаоса
    const chaosLevel = computeChaosLevel(state);
    
    // 2. Адаптируем политику под хаос
    state.policy = adaptPolicy(state.policy, chaosLevel);
    
    // 3. Мировая динамика с учётом хаоса
    const targetEntropy = 0.4;
    const diff = targetEntropy - state.world.entropy;
    state.world.entropy += diff * 0.03 + (Math.random() - 0.5) * chaosLevel * 0.08;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    
    state.world.entities += Math.floor(Math.random() * 3) - 1 + (chaosLevel > 0.6 ? 1 : -1);
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    state.world.wars = Math.max(0, Math.min(5, state.world.wars + (Math.random() > 0.85 ? 1 : -1)));
    
    let totalReward = 0;
    
    for (const agent of state.agents) {
        updateStrategy(agent);
        const { action, confidence } = decideAction(agent, state.world);
        
        let baseReward = 0;
        const p = agent.personality;
        switch(action) {
            case 'expand': baseReward = (state.world.entropy < 0.4 ? 1.0 : -0.5) * p.aggression; break;
            case 'stabilize': baseReward = (state.world.entropy > 0.6 ? 0.9 : -0.4) * p.stability; break;
            case 'diplomacy': baseReward = (state.world.wars < 2 ? 0.8 : -0.5) * p.curiosity; break;
            default: baseReward = 0.15 * p.stability;
        }
        
        // Награда с учётом хаоса
        const reward = computeReward(state.reward.last, chaosLevel, baseReward);
        
        agent.fitness = agent.fitness * 0.95 + reward * 0.05;
        agent.fitness = Math.max(0.1, Math.min(0.9, agent.fitness));
        if (reward > 0.2) agent.stats.wins++;
        agent.stats.actions[action] = (agent.stats.actions[action] || 0) + 1;
        
        updateCausal(agent, action, reward);
        agent.memory.push({ tick: state.tick, action, reward });
        if (agent.memory.length > 100) agent.memory.shift();
        
        totalReward += reward;
    }
    
    const avgReward = totalReward / state.agents.length;
    state.reward.last = avgReward;
    state.reward.total += avgReward;
    state.reward.smoothed = state.reward.smoothed * 0.92 + avgReward * 0.08;
    state.reward.history.push({ tick: state.tick, reward: avgReward });
    if (state.reward.history.length > 300) state.reward.history.shift();
    
    if (state.tick % 20 === 0) saveState(state);
    
    if (state.tick % 10 === 0) {
        console.log(`💀 V80 T${state.tick} | Chaos:${chaosLevel.toFixed(2)} | E:${state.world.entropy.toFixed(3)} | R:${avgReward.toFixed(2)} | MR:${state.policy.mutationRate.toFixed(3)}`);
    }
}

// =========================
// 🚀 MAIN LOOP
// =========================

setInterval(() => {
    try {
        step();
    } catch (e) {
        console.error("❌ V80 ERROR:", e.message);
    }
}, 2000);

// =========================
// 📡 API
// =========================

app.get("/api/status", (req, res) => {
    const chaos = computeChaosLevel(state);
    res.json({
        tick: state.tick,
        chaos: { level: chaos.toFixed(3), interpretation: chaos > 0.6 ? "HIGH" : chaos < 0.35 ? "LOW" : "NORMAL" },
        policy: state.policy,
        world: state.world,
        reward: { total: state.reward.total.toFixed(2), last: state.reward.last.toFixed(2), smoothed: state.reward.smoothed.toFixed(3) },
        agents: state.agents.map(a => ({ name: a.name, fitness: a.fitness.toFixed(3), mode: a.strategyCache.mode, bestAction: a.strategyCache.bestAction, stats: a.stats }))
    });
});

app.get("/api/causal", (req, res) => {
    const result = {};
    for (const [name, map] of causalMap.entries()) {
        result[name] = {};
        for (const [action, data] of Object.entries(map)) {
            result[name][action] = { avgReward: (data.sum / data.count).toFixed(3), count: data.count, trend: data.trend?.toFixed(3) || 0 };
        }
    }
    res.json(result);
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024) });
});

app.listen(3000, () => {
    console.log("💀 V80 SELF-MODIFYING CHAOS CORE ONLINE :3000");
});
