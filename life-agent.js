#!/usr/bin/env node
// ============================================================
// 🧬 LIFE AGENT — подключает любое ядро к Swarm Master
// ============================================================

const http = require("http");

const SWARM_URL = "http://127.0.0.1:3003";
const CORE_NAME = process.argv[2] || `core-${process.pid}`;
const CORE_PORT = process.argv[3] || 0;

let lastTick = 0;
let lastEntropy = 0.5;

async function register() {
  return new Promise((resolve) => {
    const data = JSON.stringify({ name: CORE_NAME, port: CORE_PORT, type: "core" });
    const req = http.request(`${SWARM_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function sendHeartbeat(tick, entropy) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ name: CORE_NAME, tick, entropy });
    const req = http.request(`${SWARM_URL}/api/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function start() {
  await register();
  console.log(`❤️ [LIFE] ${CORE_NAME} registered to swarm`);
  
  setInterval(async () => {
    lastTick++;
    lastEntropy = 0.4 + Math.random() * 0.3;
    await sendHeartbeat(lastTick, lastEntropy);
  }, 2000);
}

start();

module.exports = { register, sendHeartbeat };
