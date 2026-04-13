const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v82_state.json";

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
        consciousness: { trauma: 0, aggressionBias: 0, trustDecay: 0, warMemories: [] },
        memory: [],
        warHistory: [],
        civilization: null,
        stats: { wins: 0, warsFought: 0, warsWon: 0 }
    };
}

// =========================
// 🏛️ CIVILIZATION LAYER
// =========================

function formCivilizations(agents) {
    const civs = new Map();
    
    for (const agent of agents) {
        // Определяем тип цивилизации по личности
        let civType = "neutral";
        if (agent.personality.aggression > 0.6) civType = "military";
        else if (agent.personality.curiosity > 0.7) civType = "research";
        else if (agent.personality.stability > 0.7) civType = "theocratic";
        else if (agent.personality.risk > 0.6) civType = "nomadic";
        
        if (!civs.has(civType)) {
            civs.set(civType, { type: civType, members: [], power: 0, age: 0, stability: 0.8 });
        }
        civs.get(civType).members.push(agent);
        agent.civilization = civType;
    }
    
    // Вычисляем силу цивилизаций
    for (const [type, civ] of civs.entries()) {
        let totalPower = 0;
        for (const member of civ.members) {
            totalPower += member.fitness * (1 + (member.stats?.wins || 0) * 0.1);
        }
        civ.power = totalPower / (civ.members.length || 1);
        civ.age++;
    }
    
    return civs;
}

// =========================
// 💥 COLLAPSE MECHANISM
// =========================

function checkCollapse(civ, worldEntropy, tick) {
    // Нестабильность от энтропии и силы империи
    const instability = worldEntropy + (civ.power * 0.15);
    
    // Дополнительная нестабильность от возраста
    const agePenalty = Math.min(0.3, civ.age / 100);
    
    const collapseThreshold = 0.9 + agePenalty;
    
    if (instability > collapseThreshold) {
        const survivors = Math.max(1, Math.floor(civ.members.length * (0.3 + Math.random() * 0.3)));
        const shock = instability;
        
        return {
            collapsed: true,
            type: civ.type,
            shock: shock.toFixed(2),
            survivors: survivors,
            message: `💀 ${civ.type.toUpperCase()} CIVILIZATION COLLAPSED! Instability: ${shock.toFixed(2)}`
        };
    }
    
    return { collapsed: false };
}

// =========================
// ⚔️ WAR GENERATION (усиленная)
// =========================

function maybeTriggerWar(civs, worldEntropy, chaos, tick) {
    const civList = Array.from(civs.entries());
    if (civList.length < 2) return null;
    
    // Шанс войны между цивилизациями
    const warChance = 0.1 + chaos * 0.3 + worldEntropy * 0.2;
    if (Math.random() > warChance) return null;
    
    const attackerIdx = Math.floor(Math.random() * civList.length);
    let defenderIdx = Math.floor(Math.random() * civList.length);
    while (defenderIdx === attackerIdx) defenderIdx = Math.floor(Math.random() * civList.length);
    
    const attackerCiv = civList[attackerIdx][1];
    const defenderCiv = civList[defenderIdx][1];
    
    // Сила цивилизаций
    const attackerPower = attackerCiv.power * (0.8 + Math.random() * 0.5);
    const defenderPower = defenderCiv.power * (0.8 + Math.random() * 0.5);
    const totalPower = attackerPower + defenderPower;
    
    const attackerWinChance = attackerPower / totalPower * (0.6 + chaos * 0.3);
    const winner = Math.random() < attackerWinChance ? attackerCiv.type : defenderCiv.type;
    
    return {
        id: `war_${tick}_${Date.now()}`,
        tick: tick,
        attacker: attackerCiv.type,
        defender: defenderCiv.type,
        intensity: 0.5 + chaos * 0.5,
        winner: winner,
        participants: [attackerCiv.type, defenderCiv.type]
    };
}

// =========================
// 🧠 CONSCIOUSNESS UPDATE
// =========================

function updateConsciousness(agent, warEvent, outcome) {
    if (!warEvent) return;
    
    agent.consciousness = agent.consciousness || { trauma: 0, aggressionBias: 0, trustDecay: 0, warMemories: [] };
    
    if (outcome === "loss") {
        agent.consciousness.trauma += warEvent.intensity * 0.3;
        agent.consciousness.aggressionBias += 0.05;
        agent.consciousness.trustDecay += 0.03;
    } else if (outcome === "win") {
        agent.consciousness.trauma = Math.max(0, agent.consciousness.trauma - 0.1);
        agent.consciousness.aggressionBias += 0.02;
    }
    
    // Clamp
    agent.consciousness.trauma = Math.min(1.0, agent.consciousness.trauma);
    agent.consciousness.aggressionBias = Math.min(0.8, agent.consciousness.aggressionBias);
    agent.consciousness.trustDecay = Math.min(0.5, agent.consciousness.trustDecay);
    
    agent.consciousness.warMemories.push({
        tick: warEvent.tick,
        outcome: outcome,
        intensity: warEvent.intensity
    });
    if (agent.consciousness.warMemories.length > 20) agent.consciousness.warMemories.shift();
}

// =========================
// 🧬 PERSONALITY DRIFT
// =========================

function updatePersonality(agent) {
    const c = agent.consciousness;
    const p = agent.personality;
    
    // Травма делает агрессивнее и нестабильнее
    p.aggression = Math.min(0.95, p.aggression + c.aggressionBias * 0.02);
    p.stability = Math.max(0.2, p.stability - c.trauma * 0.02);
    p.risk = Math.min(0.9, p.risk + c.trauma * 0.01);
    
    // Естественный дрейф
    p.curiosity += (Math.random() - 0.5) * 0.01;
    
    // Clamp
    for (let key in p) {
        p[key] = Math.max(0.1, Math.min(0.95, p[key]));
    }
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
            console.log(`♻️ V82 STATE LOADED: tick=${raw.tick || 0}`);
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
                name: a.name, fitness: a.fitness, personality: a.personality,
                consciousness: a.consciousness, stats: a.stats, civilization: a.civilization
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
    
    // Формируем цивилизации
    const civilizations = formCivilizations(state.agents);
    const collapseEvents = [];
    
    // Проверяем коллапс цивилизаций
    for (const [type, civ] of civilizations.entries()) {
        const collapse = checkCollapse(civ, state.world.entropy, state.tick);
        if (collapse.collapsed) {
            collapseEvents.push(collapse);
            console.log(collapse.message);
            
            // Обновляем выживших агентов
            const survivors = civ.members.slice(0, collapse.survivors);
            for (const agent of civ.members) {
                if (!survivors.includes(agent)) {
                    agent.fitness = Math.max(0.1, agent.fitness * 0.6);
                    agent.consciousness.trauma += 0.3;
                }
            }
        }
    }
    
    // Генерация войны между цивилизациями
    const war = maybeTriggerWar(civilizations, state.world.entropy, chaos, state.tick);
    if (war) {
        state.world.wars++;
        state.warHistory.push(war);
        if (state.warHistory.length > 100) state.warHistory.shift();
        
        // Обновляем агентов в соответствии с войной
        for (const agent of state.agents) {
            const isInWar = agent.civilization === war.attacker || agent.civilization === war.defender;
            if (isInWar) {
                const outcome = agent.civilization === war.winner ? "win" : "loss";
                updateConsciousness(agent, war, outcome);
                
                if (outcome === "win") {
                    agent.fitness = Math.min(0.95, agent.fitness + 0.08);
                    agent.stats.warsWon++;
                    agent.stats.wins++;
                } else {
                    agent.fitness = Math.max(0.1, agent.fitness - 0.05);
                }
                agent.stats.warsFought++;
            }
        }
    }
    
    // Обновление личностей на основе сознания
    for (const agent of state.agents) {
        updatePersonality(agent);
        
        // Естественная эволюция fitness
        agent.fitness = agent.fitness * 0.99 + (Math.random() - 0.5) * 0.03;
        agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness));
    }
    
    // Глобальная награда
    const avgFitness = state.agents.reduce((a, b) => a + b.fitness, 0) / state.agents.length;
    state.reward.last = avgFitness - 0.5;
    state.reward.total += state.reward.last;
    state.reward.smoothed = state.reward.smoothed * 0.92 + state.reward.last * 0.08;
    state.reward.history.push({ tick: state.tick, reward: state.reward.last });
    if (state.reward.history.length > 300) state.reward.history.shift();
    
    if (state.tick % 20 === 0) saveState(state);
    
    if (state.tick % 10 === 0) {
        const civCount = civilizations.size;
        const collapseCount = collapseEvents.length;
        console.log(`💀 V82 T${state.tick} | Civs:${civCount} | Collapses:${collapseCount} | Wars:${state.warHistory.slice(-20).length} | E:${state.world.entropy.toFixed(3)}`);
    }
}

// =========================
// 🚀 MAIN LOOP
// =========================

setInterval(() => {
    try {
        step();
    } catch (e) {
        console.error("❌ V82 ERROR:", e.message);
    }
}, 2000);

// =========================
// 📡 API
// =========================

app.get("/api/status", (req, res) => {
    const chaos = computeChaosLevel(state);
    const civilizations = formCivilizations(state.agents);
    const civStats = Array.from(civilizations.entries()).map(([type, civ]) => ({
        type, power: civ.power.toFixed(2), members: civ.members.length, age: civ.age
    }));
    
    res.json({
        tick: state.tick,
        chaos: { level: chaos.toFixed(3), interpretation: chaos > 0.6 ? "HIGH" : chaos < 0.35 ? "LOW" : "NORMAL" },
        world: { entropy: state.world.entropy.toFixed(3), wars: state.world.wars },
        civilizations: civStats,
        warStats: { total: state.warHistory.length, recent: state.warHistory.slice(-5) },
        agents: state.agents.map(a => ({
            name: a.name,
            fitness: a.fitness.toFixed(3),
            civilization: a.civilization,
            trauma: a.consciousness.trauma.toFixed(2),
            aggressionBias: a.consciousness.aggressionBias.toFixed(2),
            warsFought: a.stats.warsFought,
            warsWon: a.stats.warsWon
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
    console.log("💀 V82 CIVILIZATION COLLAPSE CORE ONLINE :3000");
});
