const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v77_state.json";

// =========================
// 🧠 MEMORY SYSTEM
// =========================

const memory = {
    global: [],
    agent: new Map()
};

// =========================
// 🧬 AGENT FACTORY
// =========================

function createAgent(name, strategy = "balance") {
    const personalities = {
        codey: { aggression: 0.6, curiosity: 0.7, risk: 0.5, stability: 0.6 },
        uiax: { aggression: 0.3, curiosity: 0.8, risk: 0.4, stability: 0.7 },
        garlic: { aggression: 0.2, curiosity: 0.3, risk: 0.2, stability: 0.9 }
    };
    
    const personality = personalities[name] || {
        aggression: Math.random(),
        curiosity: Math.random(),
        risk: Math.random(),
        stability: 0.5 + Math.random() * 0.4
    };
    
    return {
        name,
        strategy,
        fitness: 0.5,
        stability: personality.stability,
        personality: personality,
        memory: {
            events: [],
            rewardTrace: [],
            lifetimeReward: 0,
            lastActions: []
        },
        stats: {
            wins: 0,
            actions: { expand: 0, stabilize: 0, monitor: 0, diplomacy: 0 }
        }
    };
}

// =========================
// 🧠 MEMORY MANAGEMENT
// =========================

function rememberAgent(agent, event) {
    const m = memory.agent.get(agent.name) || [];
    m.push({
        tick: event.tick,
        reward: event.reward,
        action: event.action,
        context: event.context || "unknown",
        timestamp: Date.now()
    });
    
    const trimmed = m.slice(-100);
    memory.agent.set(agent.name, trimmed);
    
    // Также сохраняем в память агента
    agent.memory.events.push(event);
    if (agent.memory.events.length > 50) agent.memory.events.shift();
}

function rememberGlobal(event) {
    memory.global.push({
        tick: event.tick,
        agent: event.agent,
        reward: event.reward,
        action: event.action,
        timestamp: Date.now()
    });
    if (memory.global.length > 500) memory.global.shift();
}

// =========================
// 🧠 PERSONALITY UPDATE
// =========================

function updatePersonality(agent, reward, action) {
    const p = agent.personality;
    const oldRisk = p.risk;
    
    if (reward > 0.5) {
        // Положительная награда → усиливаем текущее поведение
        p.curiosity = Math.min(0.95, p.curiosity + 0.02);
        if (action === 'expand') p.aggression = Math.min(0.9, p.aggression + 0.01);
        if (action === 'stabilize') p.stability = Math.min(0.95, p.stability + 0.01);
    } else if (reward < -0.5) {
        // Отрицательная награда → меняем стратегию
        p.risk = Math.max(0.1, p.risk - 0.03);
        p.curiosity = Math.max(0.2, p.curiosity - 0.02);
        if (action === 'expand') p.aggression = Math.max(0.1, p.aggression - 0.02);
    } else {
        // Небольшая стабилизация
        p.stability = Math.min(0.9, p.stability + 0.005);
    }
    
    // Нормализация
    for (const k in p) {
        p[k] = Math.max(0.05, Math.min(0.95, p[k]));
    }
    
    if (Math.abs(oldRisk - p.risk) > 0.05) {
        console.log(`🧠 ${agent.name}: risk changed from ${oldRisk.toFixed(3)} to ${p.risk.toFixed(3)}`);
    }
}

// =========================
// 🧠 ACTION DECISION
// =========================

function decideAction(agent, world) {
    const p = agent.personality;
    const entropy = world.entropy;
    
    let action = 'monitor';
    let confidence = 0.5;
    
    if (entropy < 0.3 && p.aggression > 0.4) {
        action = 'expand';
        confidence = p.aggression;
    } else if (entropy > 0.6 && p.stability > 0.5) {
        action = 'stabilize';
        confidence = p.stability;
    } else if (p.curiosity > 0.6 && entropy > 0.3 && entropy < 0.7) {
        action = 'diplomacy';
        confidence = p.curiosity;
    } else if (p.risk < 0.3) {
        action = 'monitor';
        confidence = 0.7;
    }
    
    // Учитываем память (повторяем успешные действия)
    const recentSuccess = agent.memory.events.slice(-5).filter(e => e.reward > 0);
    if (recentSuccess.length > 2) {
        const mostCommon = recentSuccess.reduce((acc, e) => {
            acc[e.action] = (acc[e.action] || 0) + 1;
            return acc;
        }, {});
        const bestAction = Object.entries(mostCommon).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (bestAction && Math.random() < 0.6) action = bestAction;
    }
    
    agent.stats.actions[action] = (agent.stats.actions[action] || 0) + 1;
    return { action, confidence };
}

// =========================
// 💾 PERSISTENCE
// =========================

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`♻️ V77 STATE LOADED: tick=${raw.tick || 0}`);
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
            reward: {
                total: state.reward.total,
                last: state.reward.last,
                smoothed: state.reward.smoothed,
                history: state.reward.history.slice(-200)
            },
            agents: state.agents.map(a => ({
                name: a.name,
                strategy: a.strategy,
                fitness: a.fitness,
                stability: a.stability,
                personality: a.personality,
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
    state.world.entropy += diff * 0.03 + (Math.random() - 0.5) * 0.04;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    
    // Агенты действуют
    let totalReward = 0;
    
    for (const agent of state.agents) {
        const { action, confidence } = decideAction(agent, state.world);
        
        // Вычисление награды на основе действия и личности
        let reward = 0;
        if (action === 'expand') {
            reward = (state.world.entropy < 0.4 ? 1 : -0.5) * agent.personality.aggression;
        } else if (action === 'stabilize') {
            reward = (state.world.entropy > 0.6 ? 1 : -0.3) * agent.personality.stability;
        } else if (action === 'diplomacy') {
            reward = (state.world.wars < 2 ? 0.8 : -0.4) * agent.personality.curiosity;
        } else {
            reward = 0.1 * agent.personality.stability;
        }
        
        reward += (Math.random() - 0.5) * 0.3;
        reward = Math.max(-2, Math.min(2, reward));
        
        // Обновление агента
        agent.fitness = agent.fitness * 0.95 + reward * 0.05;
        agent.fitness = Math.max(0.1, Math.min(0.9, agent.fitness));
        
        agent.memory.lifetimeReward += reward;
        agent.memory.rewardTrace.push({ tick: state.tick, reward, action });
        if (agent.memory.rewardTrace.length > 30) agent.memory.rewardTrace.shift();
        
        if (reward > 0.5) agent.stats.wins++;
        
        // Обновление личности
        updatePersonality(agent, reward, action);
        
        // Память
        const event = { tick: state.tick, reward, action, context: action };
        rememberAgent(agent, event);
        rememberGlobal({ tick: state.tick, agent: agent.name, reward, action });
        
        totalReward += reward;
        
        // Логирование действий
        if (state.tick % 20 === 0 && agent.name === state.agents[0]?.name) {
            console.log(`🧠 ${agent.name}: ${action} | R:${reward.toFixed(2)} | Cur:${agent.personality.curiosity.toFixed(2)} | Risk:${agent.personality.risk.toFixed(2)}`);
        }
    }
    
    // Глобальная награда
    const avgReward = totalReward / state.agents.length;
    state.reward.last = avgReward;
    state.reward.total += avgReward;
    state.reward.smoothed = state.reward.smoothed * 0.9 + avgReward * 0.1;
    state.reward.history.push({ tick: state.tick, reward: avgReward });
    if (state.reward.history.length > 300) state.reward.history.shift();
    
    // Сохранение
    if (state.tick % 20 === 0) saveState(state);
    
    if (state.tick % 10 === 0) {
        console.log(`🧬 V77 T${state.tick} | E:${state.world.entropy.toFixed(3)} | R:${avgReward.toFixed(2)} | Mem:${memory.global.length}`);
    }
}

// =========================
// 🚀 MAIN LOOP
// =========================

setInterval(() => {
    try {
        step();
    } catch (e) {
        console.error("❌ V77 ERROR:", e.message);
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
            personality: a.personality,
            stats: a.stats,
            memorySize: a.memory.events.length
        })),
        memorySummary: {
            globalEvents: memory.global.length,
            agentMemories: Array.from(memory.agent.entries()).map(([k, v]) => ({ agent: k, events: v.length }))
        }
    });
});

app.get("/api/agent/:name", (req, res) => {
    const agent = state.agents.find(a => a.name === req.params.name);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    
    const agentMemory = memory.agent.get(agent.name) || [];
    res.json({
        agent: {
            name: agent.name,
            fitness: agent.fitness,
            personality: agent.personality,
            stats: agent.stats,
            lifetimeReward: agent.memory.lifetimeReward,
            recentRewards: agent.memory.rewardTrace.slice(-10)
        },
        memory: agentMemory.slice(-20)
    });
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024), globalMemorySize: memory.global.length });
});

app.post("/api/reset", (req, res) => {
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
    memory.global = [];
    memory.agent.clear();
    saveState(state);
    res.json({ ok: true, reset: true });
});

app.listen(3000, () => {
    console.log("🧠 V77 MEMORY + PERSONALITY CORE ONLINE :3000");
});
