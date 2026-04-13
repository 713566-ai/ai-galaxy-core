require("./core/lock");

const Memory = require("./core/memory");
const Adaptive = require("./core/adaptive");
const Loop = require("./core/loop");
const API = require("./core/api");
const EvolutionaryBrain = require("./core/evolution/evolutionaryBrain");

const memory = new Memory();
const adaptive = new Adaptive(memory);
const evolutionaryBrain = new EvolutionaryBrain(memory);

// Добавляем начальных агентов
const defaultAgents = [
    { name: 'codey', weight: 0.4, strategy: 'growth', mutationRate: 0.2 },
    { name: 'uiax', weight: 0.4, strategy: 'balance', mutationRate: 0.2 },
    { name: 'garlic', weight: 0.2, strategy: 'safety', mutationRate: 0.2 }
];

for (const agent of defaultAgents) {
    evolutionaryBrain.addAgent(agent);
}

const ctx = { memory, adaptive, evolutionaryBrain };

const loop = new Loop(ctx);
ctx.loop = loop;
loop.start(4000);

API.start(ctx);

console.log("🔥 V74 FULL CORE STARTED");
console.log(`🧠 Initial agents: ${evolutionaryBrain.agents.length}`);
