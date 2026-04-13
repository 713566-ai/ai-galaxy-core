const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v90_state.json";

// =========================
// 🌌 UNIVERSE NODE (для графа)
// =========================

class UniverseNode {
    constructor(universe) {
        this.id = universe.id;
        this.universe = universe;
        this.connections = [];
        this.activity = 0;
        this.consciousness = 0;
        this.influence = 0;
    }
}

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
        this.birthTick = Date.now();
        this.deleted = false;
        this.physics = {
            rewardScale: 1.0,
            entropyGrowth: 0.01,
            warProbability: 0.08,
            mutationPressure: 0.2,
            godInfluence: 0.0,
            consciousnessFlow: 0.0
        };
    }
    
    cloneState(seed) {
        return JSON.parse(JSON.stringify(seed));
    }
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
    
    const personality = personalities[name] || { aggression: 0.5, curiosity: 0.5, risk: 0.5, stability: 0.5 };
    
    return {
        name,
        fitness: 0.5,
        personality: personality,
        consciousness: { trauma: 0, aggressionBias: 0, trustDecay: 0, godAwareness: 0 },
        memory: [],
        warHistory: [],
        capabilities: {},
        stats: { wins: 0, warsFought: 0, warsWon: 0, interventions: 0 }
    };
}

// =========================
// 🔗 CONNECTIVITY
// =========================

function connectUniverses(nodes) {
    for (const node of nodes) node.connections = [];
    
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const u1 = nodes[i].universe;
            const u2 = nodes[j].universe;
            
            const entropyDiff = Math.abs(u1.state.world.entropy - u2.state.world.entropy);
            const rewardDiff = Math.abs((u1.state.reward.smoothed || 0) - (u2.state.reward.smoothed || 0));
            const godDiff = (u1.godAgent ? 1 : 0) - (u2.godAgent ? 1 : 0);
            
            let similarity = 1 - (entropyDiff * 0.5 + rewardDiff * 0.3 + Math.abs(godDiff) * 0.2);
            similarity = Math.max(0, Math.min(1, similarity));
            
            if (similarity > 0.6) {
                nodes[i].connections.push({ id: nodes[j].id, similarity });
                nodes[j].connections.push({ id: nodes[i].id, similarity });
            }
        }
    }
    return nodes;
}

// =========================
// 🧠 CONSCIOUSNESS SCORE
// =========================

function computeMultiverseConsciousness(nodes) {
    let totalActivity = 0;
    
    for (const node of nodes) {
        const reward = node.universe.state.reward.smoothed || 0;
        const entropy = node.universe.state.world.entropy;
        const hasGod = node.universe.godAgent ? 0.3 : 0;
        
        node.activity = Math.max(0, reward + hasGod - entropy * 0.5);
        node.consciousness = node.activity * (node.connections.length / (nodes.length || 1));
        
        let influenceSum = 0;
        for (const conn of node.connections) {
            const targetNode = nodes.find(n => n.id === conn.id);
            if (targetNode) influenceSum += targetNode.activity * conn.similarity;
        }
        node.influence = influenceSum / (node.connections.length || 1);
        totalActivity += node.activity;
    }
    
    const totalConsciousness = totalActivity / (nodes.length || 1);
    return { totalConsciousness, nodes };
}

// =========================
// 💀 SELF-DELETION CHECK
// =========================

function shouldDeleteUniverse(node, globalConsciousness, nodes) {
    const u = node.universe;
    if (u.deleted) return false;
    
    // Слабость
    const weakness = u.fitness < 0.2 || node.activity < globalConsciousness * 0.3;
    
    // Нестабильность
    const instability = u.state.world.entropy > 0.85;
    
    // Изоляция (нет связей)
    const isolation = node.connections.length === 0 && nodes.length > 3;
    
    // Возраст (слишком старые без прогресса)
    const ageWeakness = u.tick > 100 && u.fitness < 0.3;
    
    return (weakness && instability) || isolation || ageWeakness;
}

// =========================
// 💀 SELF-ERASURE
// =========================

function deleteUniverse(nodes, node, reason) {
    const u = node.universe;
    u.deleted = true;
    u.deletionReason = reason;
    u.deletionTick = u.tick;
    
    console.log(`💀 DELETION: ${u.id} | Reason: ${reason} | Fitness:${u.fitness.toFixed(2)} | Entropy:${u.state.world.entropy.toFixed(2)}`);
    
    // Удаляем из массива
    const index = nodes.findIndex(n => n.id === node.id);
    if (index !== -1) nodes.splice(index, 1);
    
    return nodes;
}

// =========================
// 👑 GOD CANDIDATE
// =========================

function detectGodCandidate(agents, universe) {
    let bestScore = -Infinity;
    let bestAgent = null;
    
    for (const agent of agents) {
        let score = agent.fitness * 0.5;
        score += (agent.stats.wins || 0) * 0.25;
        score += (agent.consciousness?.godAwareness || 0) * 0.15;
        
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

function ascendToGod(universe, agent) {
    if (universe.godAgent) return false;
    
    universe.godAgent = agent;
    universe.godAscensionTick = universe.tick;
    universe.physics.godInfluence = 0.3;
    
    agent.personality.stability = 1.0;
    agent.personality.curiosity = 1.0;
    agent.fitness = 0.95;
    agent.capabilities = { influenceWars: true, rewriteRewards: true, biasEntropy: true };
    agent.consciousness.godAwareness = 1.0;
    agent.name = `GOD_${agent.name.toUpperCase()}`;
    
    console.log(`👑 ASCENSION: ${agent.name} in ${universe.id}`);
    return true;
}

// =========================
// 🌍 WORLD STEP
// =========================

function stepWorldWithConsciousness(universe, globalConsciousness) {
    const state = universe.state;
    const god = universe.godAgent;
    const physics = universe.physics;
    
    physics.consciousnessFlow = globalConsciousness * 0.1;
    
    const targetEntropy = god ? 0.35 : 0.45;
    const diff = targetEntropy - state.world.entropy;
    let entropyDelta = diff * 0.04 + (Math.random() - 0.5) * 0.08;
    entropyDelta -= physics.consciousnessFlow * 0.05;
    
    if (god && god.capabilities.biasEntropy) {
        entropyDelta -= physics.godInfluence * 0.05;
        god.stats.interventions++;
    }
    
    state.world.entropy += entropyDelta;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(300, Math.min(800, state.world.entities));
    
    let warChance = physics.warProbability;
    if (god && god.capabilities.influenceWars) warChance *= (1 - physics.godInfluence * 0.5);
    if (Math.random() < warChance) state.world.wars++;
    else state.world.wars = Math.max(0, state.world.wars - 0.1);
    state.world.wars = Math.max(0, Math.min(5, state.world.wars));
    
    let totalFitness = 0;
    for (const agent of state.agents) {
        let fitnessDelta = (Math.random() - 0.5) * 0.04;
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
}

// =========================
// 🌱 FORK
// =========================

function shouldForkUniverse(universe) {
    const { world, reward } = universe.state;
    let forkPressure = world.entropy * 0.6;
    forkPressure += (reward.smoothed < -0.3 ? 0.3 : 0);
    forkPressure += (world.wars > 3 ? 0.2 : 0);
    forkPressure += Math.random() * 0.2;
    if (universe.godAgent) forkPressure *= 0.5;
    return forkPressure > 0.65 && universe.tick > 10;
}

function forkUniverse(parentUniverse) {
    const childState = JSON.parse(JSON.stringify(parentUniverse.state));
    childState.world.entropy += (Math.random() - 0.5) * 0.25;
    childState.world.entropy = Math.max(0.1, Math.min(0.9, childState.world.entropy));
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
    return child;
}

// =========================
// ⚖️ FITNESS
// =========================

function evaluateUniverse(universe, globalConsciousness) {
    const w = universe.state.world;
    const r = universe.state.reward;
    const agents = universe.state.agents;
    const avgFitness = agents.reduce((a, b) => a + b.fitness, 0) / agents.length;
    
    let fitness = (r.smoothed || 0) * 1.5 + avgFitness * 0.5 - w.entropy * 0.3 + w.wars * 0.1;
    if (universe.godAgent) fitness += 0.5;
    fitness += globalConsciousness * 0.2;
    universe.fitness = Math.max(-1, Math.min(2, fitness));
    return fitness;
}

// =========================
// 🔁 MULTIVERSE STEP
// =========================

function stepMultiverse(universes) {
    let nodes = universes.map(u => new UniverseNode(u));
    nodes = connectUniverses(nodes);
    const { totalConsciousness, nodes: updatedNodes } = computeMultiverseConsciousness(nodes);
    
    for (let i = 0; i < universes.length; i++) {
        universes[i].consciousness = updatedNodes[i].consciousness;
        universes[i].connections = updatedNodes[i].connections;
    }
    
    const newUniverses = [];
    const toDelete = [];
    
    for (const node of updatedNodes) {
        const universe = node.universe;
        
        // Проверка на удаление
        if (shouldDeleteUniverse(node, totalConsciousness, updatedNodes)) {
            toDelete.push(node);
            continue;
        }
        
        const { agent: candidate, score } = detectGodCandidate(universe.state.agents, universe);
        if (candidate && score > 0.7 && !universe.godAgent && universe.tick > 30) {
            ascendToGod(universe, candidate);
        }
        
        stepWorldWithConsciousness(universe, totalConsciousness);
        evaluateUniverse(universe, totalConsciousness);
        
        if (shouldForkUniverse(universe)) {
            const child = forkUniverse(universe);
            newUniverses.push(child);
        }
    }
    
    // Удаление слабых миров
    for (const node of toDelete) {
        const reason = [];
        if (node.universe.fitness < 0.2) reason.push("low_fitness");
        if (node.activity < totalConsciousness * 0.3) reason.push("low_activity");
        if (node.universe.state.world.entropy > 0.85) reason.push("high_entropy");
        if (node.connections.length === 0 && universes.length > 3) reason.push("isolated");
        deleteUniverse(updatedNodes, node, reason.join(","));
    }
    
    const remainingUniverses = updatedNodes.map(n => n.universe);
    remainingUniverses.push(...newUniverses);
    
    // Лимит
    if (remainingUniverses.length > 20) {
        remainingUniverses.sort((a, b) => b.fitness - a.fitness);
        const toKeep = remainingUniverses.slice(0, 15);
        const deleted = remainingUniverses.slice(15);
        for (const u of deleted) {
            console.log(`💀 PRUNED: ${u.id} (fitness=${u.fitness.toFixed(2)})`);
        }
        return toKeep;
    }
    
    return remainingUniverses;
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
// 🚀 MAIN LOOP
// =========================

let universes = [createInitialUniverse()];
let loopTick = 0;

setInterval(() => {
    try {
        universes = stepMultiverse(universes);
        loopTick++;
        
        if (loopTick % 10 === 0) {
            const topUniverse = [...universes].sort((a, b) => b.fitness - a.fitness)[0];
            const godCount = universes.filter(u => u.godAgent).length;
            const deletedCount = universes.filter(u => u.deleted).length;
            console.log(`💀 V90 T${loopTick} | Universes:${universes.length} | Gods:${godCount} | Deleted:${deletedCount} | BestFitness:${topUniverse?.fitness.toFixed(3)}`);
        }
    } catch (e) {
        console.error("❌ V90 ERROR:", e.message);
    }
}, 2000);

// =========================
// 📡 API
// =========================

app.get("/api/status", (req, res) => {
    const topUniverses = [...universes].sort((a, b) => b.fitness - a.fitness).slice(0, 5);
    const totalConsciousness = universes.reduce((sum, u) => sum + (u.consciousness || 0), 0) / (universes.length || 1);
    
    res.json({
        tick: loopTick,
        totalUniverses: universes.length,
        godsCount: universes.filter(u => u.godAgent).length,
        multiverseConsciousness: totalConsciousness.toFixed(4),
        topUniverses: topUniverses.map(u => ({
            id: u.id, fitness: u.fitness.toFixed(3), hasGod: !!u.godAgent,
            consciousness: (u.consciousness || 0).toFixed(4),
            connections: u.connections?.length || 0,
            entropy: u.state.world.entropy.toFixed(3)
        }))
    });
});

app.get("/api/deleted", (req, res) => {
    const deleted = universes.filter(u => u.deleted).map(u => ({
        id: u.id, reason: u.deletionReason, tick: u.deletionTick
    }));
    res.json({ deleted: deleted.slice(-20), total: deleted.length });
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024), universes: universes.length });
});

app.listen(3000, () => {
    console.log("💀 V90 SELF-DELETING REALITIES ONLINE :3000");
});
