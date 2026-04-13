require("./core/lock");

const Memory = require("./core/memory");
const Adaptive = require("./core/adaptive");
const Loop = require("./core/loop");
const API = require("./core/api");
const EvolutionaryBrain = require("./core/evolution/evolutionaryBrain");
const defaultAgents = require("./core/evolution/agents");

const memory = new Memory();
const adaptive = new Adaptive(memory);

// Создаём эволюционный мозг
const evolutionaryBrain = new EvolutionaryBrain();

// Добавляем агентов
for (const agent of defaultAgents) {
    evolutionaryBrain.addAgent(agent);
}

const ctx = { memory, adaptive, evolutionaryBrain };

const loop = new Loop(ctx);
ctx.loop = loop;
loop.start(4000);

API.start(ctx);

console.log("🔥 V73 EVOLUTIONARY BRAIN CORE STARTED");
console.log(`🧠 Initial agents: ${evolutionaryBrain.agents.length}`);
