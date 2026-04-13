require("./core/lock");

const Memory = require("./core/memory");
const Adaptive = require("./core/adaptive");
const Loop = require("./core/loop");
const API = require("./core/api");

const memory = new Memory();
const adaptive = new Adaptive(memory);
const ctx = { memory, adaptive };

const loop = new Loop(ctx);
ctx.loop = loop;
loop.start(4000);

API.start(ctx);

console.log("🔥 V71 STB STABILITY LAYER STARTED");
