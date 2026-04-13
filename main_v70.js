require("./core/lock");

const Memory = require("./core/memory");
const Adaptive = require("./core/adaptive");
const Agents = require("./core/agents");
const Loop = require("./core/loop");
const API = require("./core/api");

// Инициализация
const memory = new Memory();
const adaptive = new Adaptive();
const agents = new Agents();

const ctx = { memory, adaptive, agents };

// Запуск
const loop = new Loop(ctx);
ctx.loop = loop;
loop.start(4000);

API.start(ctx);

console.log("🔥 V70 STABLE CORE STARTED");
