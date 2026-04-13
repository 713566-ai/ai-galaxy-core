require("./core/lock");

const Memory = require("./core/memory");
const Adaptive = require("./core/adaptive");
const Loop = require("./core/loop");
const API = require("./core/api");
const Coordinator = require("./core/coordinator");
const Codey = require("./core/agents/codey");
const UIAX = require("./core/agents/uiax");
const Garlic = require("./core/agents/garlic");

const memory = new Memory();
const adaptive = new Adaptive(memory);

// Создаём агентов
const agents = {
    codey: new Codey(),
    uiax: new UIAX(),
    garlic: new Garlic()
};

const coordinator = new Coordinator(agents);
const ctx = { memory, adaptive, coordinator };

const loop = new Loop(ctx);
ctx.loop = loop;
loop.start(4000);

API.start(ctx);

console.log("🔥 V72 MULTI-AGENT EVOLUTION STARTED");
console.log("🤖 Agents: Codey, UIA-X, Garlic");
