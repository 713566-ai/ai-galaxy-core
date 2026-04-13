const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v78_state.json";

// =========================
// 🧠 CAUSAL MEMORY
// =========================

const causalMap = new Map(); // agent -> { action -> { rewardSum, count, lastReward } }

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
        stability: personalities[name]?.stability || 0.6,
        personality: personalities[name] || {
            aggression: Math.random(),
            curiosity: Math.random(),
            risk: Math.random(),
            stability: 0.5 + Math.random() * 0.4
        },
        goals: {
            survive: 1.0,
            grow: 1.0,
            interact: 1.0,
            stabilize: 1.0
        },
        memory: [],
        strategyCache: {
            bestAction: null,
            worstAction: null,
            mode: "neutral",
            confidence: 0.5
        },
        stats: {
            wins: 0,
            actions: { expand: 0, diplomacy: 0, monitor: 0, stabilize: 0 }
        }
    };
}

// =========================
// 🧠 CAUSAL UPDATE
// =========================

function updateCausal(agent, action, reward) {
    if (!causalMap.has(agent.name)) {
        causalMap.set(agent.name, {});
    }
    
    const map = causalMap.get(agent.name);
    if (!map[action]) {
        map[action] = { sum: 0, count: 0, lastReward: 0, trend: 0 };
    }
    
    map[action].sum += reward;
    map[action].count++;
    map[action].lastReward = reward;
    
    // Вычисляем тренд (последние 5 наград)
    if (!map[action].recent) map[action].recent = [];
    map[action].recent.push(reward);
    if (map[action].recent.length > 5) map[action].recent.shift();
    
    if (map[action].recent.length >= 3) {
        const avg = map[action].recent.reduce((a, b) => a + b, 0) / map[action].recent.length;
        map[action].trend = avg;
    }
}

// =========================
// 🧠 STRATEGY EXTRACTION
// =========================

function updateStrategy(agent) {
    const map = causalMap.get(agent.name);
    if (!map || Object.keys(map).length < 3) return;
    
    let best = null;
    let worst = null;
    let bestScore = -Infinity;
    let worstScore = Infinity;
    
    for (const action in map) {
        const avg = map[action].sum / map[action].count;
        const trend = map[action].trend || avg;
        const score = avg * 0.7 + trend * 0.3;
        
        if (score > bestScore) {
            bestScore = score;
            best = action;
        }
        if (score < worstScore) {
            worstScore = score;
            worst = action;
        }
    }
    
    agent.strategyCache.bestAction = best;
    agent.strategyCache.worstAction = worst;
    agent.strategyCache.confidence = Math.min(0.9, (bestScore - worstScore) / 2);
    
    // Определение режима
    if (bestScore > 0.6) {
        agent.strategyCache.mode = "growth";
        agent.goals.grow = Math.min(1.5, agent.goals.grow + 0.05);
    } else if (worstScore < -0.5) {
        agent.strategyCache.mode = "defensive";
        agent.goals.survive = Math.min(1.5, agent.goals.survive + 0.05);
    } else if (bestScore > 0.2 && worstScore > -0.2) {
        agent.strategyCache.mode = "exploration";
        agent.goals.interact = Math.min(1.5, agent.goals.interact + 0.03);
    } else {
        agent.strategyCache.mode = "neutral";
    }
    
    // Нормализация целей
    const total = agent.goals.survive + agent.goals.grow + agent.goals.interact + agent.goals.stabilize;
    for (const g in agent.goals) {
        agent.goals[g] /= total;
    }
}

// =========================
// 🧠 DECISION WITH STRATEGY
// =========================

function decideAction(agent, world) {
    const strategy = agent.strategyCache;
    const goals = agent.goals;
    const personality = agent.personality;
    const entropy = world.entropy;
    
    let action = 'monitor';
    let scores = { expand: 0, diplomacy: 0, monitor: 0, stabilize: 0 };
    
    // На основе лучшей стратегии
    if (strategy.bestAction && strategy.confidence > 0.3) {
        scores[strategy.bestAction] += 0.5 + strategy.confidence;
    }
    
    // На основе целей
    scores.expand += goals.grow * 0.5 * personality.aggression;
    scores.diplomacy += goals.interact * 0.5 * personality.curiosity;
    scores.stabilize += goals.stabilize * 0.5 * personality.stability;
    scores.monitor += goals.survive * 0.3 * (1 - personality.risk);
    
    // На основе состояния мира
    if (entropy < 0.3) scores.expand += 0.4;
    if (entropy > 0.6) scores.stabilize += 0.5;
    if (world.wars > 2) scores.diplomacy += 0.4;
    if (world.alliances > 3) scores.monitor += 0.3;
    
    // Выбор действия
    action = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    
    return { action, confidence: scores[action], scores };
}

// =========================
// 💾 PERSISTENCE
// =========================

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`♻️ V78 STATE LOADED: tick=${raw.tick || 0}`);
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
            reward: state.reward,
            agents: state.agents.map(a => ({
                name: a.name,
                strategy: a.strategy,
                fitness: a.fitness,
                personality: a.personality,
                goals: a.goals,
                strategyCache: a.strategyCache,
                stats: a.stats
            }))
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
    world: { entropy: 0.5, entities: 500, wars: 0, alliances: 0 },
    reward: { total: 0, last: 0, smoothed: 0, history: [] },
    agents: [
        createAgent("codey", "growth"),
        createAgent("uiax", "balance"),
        createAgent("garlic", "safety")
    ]
};

// =========================
// 🔁 EVOLUTION STEP
// =========================

function step() {
    state.tick++;
    
    // Мировая динамика
    const targetEntropy = 0.35;
    const diff = targetEntropy - state.world.entropy;
    state.world.entropy += diff * 0.04 + (Math.random() - 0.5) * 0.05;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    state.world.wars = Math.max(0, Math.min(5, state.world.wars + (Math.random() > 0.9 ? 1 : -1)));
    state.world.alliances = Math.max(0, Math.min(5, state.world.alliances + (Math.random() > 0.9 ? 1 : -1)));
    
    let totalReward = 0;
    
    for (const agent of state.agents) {
        // Обновление стратегии на основе причинности
        updateStrategy(agent);
        
        // Принятие решения
        const { action, confidence } = decideAction(agent, state.world);
        
        // Вычисление награды на основе действия и стратегии
        let reward = 0;
        const p = agent.personality;
        
        switch(action) {
            case 'expand':
                reward = (state.world.entropy < 0.4 ? 1.2 : -0.6) * p.aggression;
                break;
            case 'stabilize':
                reward = (state.world.entropy > 0.6 ? 1.0 : -0.4) * p.stability;
                break;
            case 'diplomacy':
                reward = (state.world.wars < 2 ? 0.9 : -0.5) * p.curiosity;
                break;
            default:
                reward = 0.2 * p.stability;
        }
        
        reward += (Math.random() - 0.5) * 0.25;
        reward = Math.max(-2, Math.min(2, reward));
        
        // Обновление агента
        agent.fitness = agent.fitness * 0.95 + reward * 0.05;
        agent.fitness = Math.max(0.1, Math.min(0.9, agent.fitness));
        
        if (reward > 0.3) agent.stats.wins++;
        agent.stats.actions[action] = (agent.stats.actions[action] || 0) + 1;
        
        // Причинное обучение
        updateCausal(agent, action, reward);
        
        // Память
        agent.memory.push({ tick: state.tick, action, reward });
        if (agent.memory.length > 100) agent.memory.shift();
        
        totalReward += reward;
        
        // Логирование
        if (state.tick % 20 === 0 && agent.name === state.agents[0]?.name) {
            console.log(`💀 ${agent.name}: ${action} | R:${reward.toFixed(2)} | Mode:${agent.strategyCache.mode} | Best:${agent.strategyCache.bestAction}`);
        }
    }
    
    // Глобальная награда
    const avgReward = totalReward / state.agents.length;
    state.reward.last = avgReward;
    state.reward.total += avgReward;
    state.reward.smoothed = state.reward.smoothed * 0.9 + avgReward * 0.1;
    state.reward.history.push({ tick: state.tick, reward: avgReward });
    if (state.reward.history.length > 300) state.reward.history.shift();
    
    if (state.tick % 20 === 0) saveState(state);
    
    if (state.tick % 10 === 0) {
        console.log(`💀 V78 T${state.tick} | E:${state.world.entropy.toFixed(3)} | R:${avgReward.toFixed(2)}`);
    }
}

// =========================
// 🚀 MAIN LOOP
// =========================

setInterval(() => {
    try {
        step();
    } catch (e) {
        console.error("❌ V78 ERROR:", e.message);
    }
}, 2000);

// =========================
// 📡 API
// =========================

app.get("/api/status", (req, res) => {
    res.json({
        tick: state.tick,
        world: state.world,
        reward: { total: state.reward.total.toFixed(2), last: state.reward.last.toFixed(2), smoothed: state.reward.smoothed.toFixed(3) },
        agents: state.agents.map(a => ({
            name: a.name,
            fitness: a.fitness.toFixed(3),
            mode: a.strategyCache.mode,
            bestAction: a.strategyCache.bestAction,
            worstAction: a.strategyCache.worstAction,
            confidence: a.strategyCache.confidence.toFixed(2),
            goals: a.goals,
            stats: a.stats
        }))
    });
});

app.get("/api/agent/:name", (req, res) => {
    const agent = state.agents.find(a => a.name === req.params.name);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    
    const causal = causalMap.get(agent.name) || {};
    res.json({
        agent: {
            name: agent.name,
            fitness: agent.fitness,
            mode: agent.strategyCache.mode,
            bestAction: agent.strategyCache.bestAction,
            worstAction: agent.strategyCache.worstAction,
            goals: agent.goals,
            stats: agent.stats
        },
        causal: causal,
        recentMemory: agent.memory.slice(-20)
    });
});

app.get("/api/causal", (req, res) => {
    const result = {};
    for (const [name, map] of causalMap.entries()) {
        result[name] = {};
        for (const [action, data] of Object.entries(map)) {
            result[name][action] = {
                avgReward: (data.sum / data.count).toFixed(3),
                count: data.count,
                trend: data.trend?.toFixed(3) || 0
            };
        }
    }
    res.json(result);
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024) });
});

app.post("/api/reset", (req, res) => {
    causalMap.clear();
    state = {
        tick: 0,
        world: { entropy: 0.5, entities: 500, wars: 0, alliances: 0 },
        reward: { total: 0, last: 0, smoothed: 0, history: [] },
        agents: [
            createAgent("codey", "growth"),
            createAgent("uiax", "balance"),
            createAgent("garlic", "safety")
        ]
    };
    saveState(state);
    res.json({ ok: true, reset: true });
});

app.listen(3000, () => {
    console.log("💀 V78 MAX SWING CORE ONLINE :3000");
});
