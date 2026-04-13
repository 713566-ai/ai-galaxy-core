const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v81_state.json";

// =========================
// 🧠 WAR SIGNAL ENGINE
// =========================

function computeWarReward(agent, warEvent, tick) {
    if (!warEvent) {
        // Голод без войны → деградация
        return -0.15;
    }
    
    const winBonus = warEvent.winner === agent.name ? 2.5 : -1.5;
    const participationBonus = warEvent.participants.includes(agent.name) ? 0.5 : -0.3;
    const intensityFactor = warEvent.intensity || 1;
    
    let reward = (winBonus + participationBonus) * intensityFactor;
    
    // Дополнительный бонус за победу над сильным противником
    if (warEvent.winner === agent.name && warEvent.defenderFitness > agent.fitness) {
        reward += 1.0;
    }
    
    return Math.max(-2.5, Math.min(3.0, reward));
}

// =========================
// ⚔️ WAR GENERATION SYSTEM
// =========================

function maybeTriggerWar(world, agents, chaos, tick) {
    // Шанс войны зависит от хаоса, энтропии и количества агентов
    let warChance = 0.08 + chaos * 0.3 + world.entropy * 0.15;
    if (agents.length < 2) warChance = 0;
    
    if (Math.random() > warChance) return null;
    
    // Выбираем участников
    const shuffled = [...agents].sort(() => Math.random() - 0.5);
    const attacker = shuffled[0];
    const defender = shuffled[1];
    
    if (!attacker || !defender || attacker.name === defender.name) return null;
    
    // Вычисляем силу участников
    const attackerPower = attacker.fitness + (attacker.personality?.aggression || 0.5);
    const defenderPower = defender.fitness + (defender.personality?.stability || 0.5);
    const totalPower = attackerPower + defenderPower;
    
    // Определяем победителя с учётом силы
    const attackerWinChance = attackerPower / totalPower * (0.6 + chaos * 0.3);
    const winner = Math.random() < attackerWinChance ? attacker.name : defender.name;
    
    return {
        id: `war_${tick}_${Date.now()}`,
        tick: tick,
        attacker: attacker.name,
        defender: defender.name,
        attackerPower: attackerPower.toFixed(2),
        defenderPower: defenderPower.toFixed(2),
        intensity: 0.5 + chaos * 0.5 + Math.random() * 0.3,
        participants: [attacker.name, defender.name],
        winner: winner,
        defenderFitness: defender.fitness
    };
}

// =========================
// 💾 WAR MEMORY SYSTEM
// =========================

function recordWarMemory(agent, warEvent) {
    if (!warEvent) return;
    
    agent.memory = agent.memory || [];
    agent.warHistory = agent.warHistory || [];
    
    const isAttacker = warEvent.attacker === agent.name;
    const isWinner = warEvent.winner === agent.name;
    
    agent.warHistory.push({
        tick: warEvent.tick,
        role: isAttacker ? "attacker" : "defender",
        outcome: isWinner ? "win" : "loss",
        intensity: warEvent.intensity,
        opponent: isAttacker ? warEvent.defender : warEvent.attacker
    });
    
    if (agent.warHistory.length > 30) agent.warHistory.shift();
    
    // Сохраняем в общую память
    agent.memory.push({
        tick: warEvent.tick,
        type: "war",
        outcome: isWinner ? "victory" : "defeat",
        intensity: warEvent.intensity
    });
    if (agent.memory.length > 100) agent.memory.shift();
}

// =========================
// 🧬 WAR-BASED SELECTION PRESSURE
// =========================

function evolveAgentsThroughWar(agents, warHistory, chaos) {
    const recentWars = warHistory.slice(-20);
    
    return agents.map(agent => {
        const agentWars = recentWars.filter(w => w.participants.includes(agent.name));
        const wins = agentWars.filter(w => w.winner === agent.name).length;
        const losses = agentWars.length - wins;
        
        let fitnessDelta = 0;
        
        if (agentWars.length > 0) {
            // Победы → сильный рост
            fitnessDelta += wins * 0.25;
            // Поражения → слабый штраф
            fitnessDelta -= losses * 0.15;
            
            // Бонус за участие
            fitnessDelta += agentWars.length * 0.05;
        } else {
            // Нет войн → деградация
            fitnessDelta -= 0.05;
        }
        
        agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness + fitnessDelta));
        
        // 🧬 Мутации после поражений
        if (losses > wins && agentWars.length > 0) {
            const p = agent.personality;
            if (p) {
                p.aggression = Math.min(0.9, p.aggression + 0.05 * chaos);
                p.risk = Math.min(0.8, p.risk + 0.03 * chaos);
                p.stability = Math.max(0.3, p.stability - 0.04);
            }
            if (agent.strategyCache) {
                agent.strategyCache.mode = "war_adaptive";
            }
        }
        
        return agent;
    });
}

// =========================
// 🧠 AGENT DECISION WITH WAR AWARENESS
// =========================

function decideWarAction(agent, world, warHistory) {
    const p = agent.personality;
    const recentWars = warHistory.slice(-10);
    const agentWars = recentWars.filter(w => w.participants.includes(agent.name));
    const winRate = agentWars.length > 0 ? agentWars.filter(w => w.winner === agent.name).length / agentWars.length : 0.5;
    
    let scores = { expand: 0, diplomacy: 0, monitor: 0, prepare_war: 0 };
    
    // Агрессивные агенты склонны к войне
    scores.prepare_war += (p?.aggression || 0.5) * 0.6;
    scores.expand += (p?.aggression || 0.5) * 0.3;
    
    // Если win rate высокий → продолжаем воевать
    if (winRate > 0.6) scores.prepare_war += 0.4;
    
    // Если проигрываем → дипломатия
    if (winRate < 0.3) scores.diplomacy += 0.5;
    
    // Энтропия влияет
    if (world.entropy < 0.35) scores.expand += 0.3;
    if (world.entropy > 0.65) scores.prepare_war += 0.2;
    
    const action = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    return { action, confidence: scores[action] };
}

// =========================
// 🧬 AGENT FACTORY
// =========================

function createAgent(name) {
    const personalities = {
        codey: { aggression: 0.6, curiosity: 0.7, risk: 0.5, stability: 0.6 },
        uiax: { aggression: 0.3, curiosity: 0.8, risk: 0.4, stability: 0.7 },
        garlic: { aggression: 0.2, curiosity: 0.3, risk: 0.2, stability: 0.9 }
    };
    
    return {
        name,
        fitness: 0.5,
        personality: personalities[name] || { aggression: 0.5, curiosity: 0.5, risk: 0.5, stability: 0.5 },
        memory: [],
        warHistory: [],
        strategyCache: { mode: "neutral", bestAction: null, confidence: 0.5 },
        stats: { wins: 0, warsFought: 0, warsWon: 0, actions: { expand: 0, diplomacy: 0, monitor: 0, prepare_war: 0 } }
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
// 💾 PERSISTENCE
// =========================

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            console.log(`♻️ V81 STATE LOADED: tick=${raw.tick || 0}`);
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
            reward: state.reward,
            agents: state.agents.map(a => ({
                name: a.name, fitness: a.fitness, personality: a.personality,
                stats: a.stats, warHistory: a.warHistory?.slice(-20)
            })),
            warHistory: state.warHistory?.slice(-50)
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
    agents: [ createAgent("codey"), createAgent("uiax"), createAgent("garlic") ],
    warHistory: []
};

// =========================
// 🔁 EVOLUTION STEP
// =========================

function step() {
    state.tick++;
    const chaos = computeChaosLevel(state);
    
    // Мировая динамика
    const targetEntropy = 0.45;
    const diff = targetEntropy - state.world.entropy;
    state.world.entropy += diff * 0.04 + (Math.random() - 0.5) * chaos * 0.08;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    
    // 💣 Генерация войны
    const war = maybeTriggerWar(state.world, state.agents, chaos, state.tick);
    if (war) {
        state.world.wars++;
        state.warHistory.push(war);
        if (state.warHistory.length > 100) state.warHistory.shift();
    }
    
    let totalReward = 0;
    
    for (const agent of state.agents) {
        // War reward
        const warReward = computeWarReward(agent, war, state.tick);
        
        // Обычное действие
        const { action } = decideWarAction(agent, state.world, state.warHistory);
        
        let actionReward = 0;
        const p = agent.personality;
        switch(action) {
            case 'expand': actionReward = (state.world.entropy < 0.45 ? 0.6 : -0.3) * (p?.aggression || 0.5); break;
            case 'prepare_war': actionReward = (chaos > 0.5 ? 0.7 : -0.2) * (p?.aggression || 0.5); break;
            case 'diplomacy': actionReward = (state.world.wars < 2 ? 0.5 : -0.4) * (p?.curiosity || 0.5); break;
            default: actionReward = 0.1;
        }
        
        const totalAgentReward = warReward + actionReward;
        totalReward += totalAgentReward;
        
        // Обновление агента
        agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness + totalAgentReward * 0.05));
        
        if (war && war.participants.includes(agent.name)) {
            agent.stats.warsFought++;
            if (war.winner === agent.name) {
                agent.stats.warsWon++;
                agent.stats.wins++;
            }
        }
        
        agent.stats.actions[action] = (agent.stats.actions[action] || 0) + 1;
        
        // Запись памяти о войне
        recordWarMemory(agent, war);
    }
    
    // Эволюция через войны
    state.agents = evolveAgentsThroughWar(state.agents, state.warHistory, chaos);
    
    const avgReward = totalReward / state.agents.length;
    state.reward.last = avgReward;
    state.reward.total += avgReward;
    state.reward.smoothed = state.reward.smoothed * 0.92 + avgReward * 0.08;
    state.reward.history.push({ tick: state.tick, reward: avgReward });
    if (state.reward.history.length > 300) state.reward.history.shift();
    
    if (state.tick % 20 === 0) saveState(state);
    
    if (state.tick % 10 === 0) {
        const warCount = state.warHistory.slice(-20).length;
        console.log(`💀 V81 T${state.tick} | Wars:${warCount} | E:${state.world.entropy.toFixed(3)} | R:${avgReward.toFixed(2)} | Chaos:${chaos.toFixed(2)}`);
    }
}

// =========================
// 🚀 MAIN LOOP
// =========================

setInterval(() => {
    try {
        step();
    } catch (e) {
        console.error("❌ V81 ERROR:", e.message);
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
        world: { entropy: state.world.entropy.toFixed(3), wars: state.world.wars, entities: state.world.entities },
        reward: { total: state.reward.total.toFixed(2), last: state.reward.last.toFixed(2), smoothed: state.reward.smoothed.toFixed(3) },
        warStats: { total: state.warHistory.length, recent: state.warHistory.slice(-5) },
        agents: state.agents.map(a => ({
            name: a.name,
            fitness: a.fitness.toFixed(3),
            warsFought: a.stats?.warsFought || 0,
            warsWon: a.stats?.warsWon || 0,
            winRate: a.stats?.warsFought > 0 ? ((a.stats.warsWon / a.stats.warsFought) * 100).toFixed(0) + '%' : '0%',
            mode: a.strategyCache?.mode || 'neutral'
        }))
    });
});

app.get("/api/wars", (req, res) => {
    res.json({ wars: state.warHistory.slice(-30), count: state.warHistory.length });
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024) });
});

app.listen(3000, () => {
    console.log("💀 V81 WAR-DRIVEN EVOLUTION CORE ONLINE :3000");
});
