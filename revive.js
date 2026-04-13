#!/usr/bin/env node
// ============================================================
// 🔁 AUTO-REVIVE ENGINE — самовосстановление мёртвых ядер
// ============================================================

const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

// Список ядер для мониторинга
const coresToWatch = [
  { name: "core-v100", file: "core-v100.js", port: 3100 },
  { name: "core-v101", file: "core-v101.js", port: 3101 },
  { name: "core-v102", file: "core-v102.js", port: 3102 },
  { name: "core-v103", file: "core-v103.js", port: 3103 },
  { name: "core-v104", file: "core-v104.js", port: 3104 },
  { name: "core-v105", file: "core-v105.js", port: 3105 },
  { name: "core-v106", file: "core-v106.js", port: 3106 },
  { name: "core-v107", file: "core-v107.js", port: 3107 },
  { name: "core-v108", file: "core-v108.js", port: 3108 },
  { name: "core-v109", file: "core-v109.js", port: 3109 },
  { name: "core-v110", file: "core-v110.js", port: 3110 }
];

const processes = new Map();

function startCore(core) {
  if (processes.has(core.name)) {
    console.log(`⚠️ ${core.name} already running`);
    return;
  }

  console.log(`🧬 [REVIVE] Starting ${core.name} on port ${core.port}...`);
  
  // Запускаем ядро с life-agent интеграцией
  const child = spawn("node", [core.file], {
    env: { ...process.env, PORT: core.port, CORE_NAME: core.name },
    stdio: "pipe"
  });
  
  processes.set(core.name, child);
  
  child.on("exit", (code) => {
    console.log(`💀 [DEATH] ${core.name} exited with code ${code}`);
    processes.delete(core.name);
    
    // Авто-ревайв через 2 секунды
    setTimeout(() => startCore(core), 2000);
  });
  
  return child;
}

async function checkSwarmAndRevive() {
  try {
    const res = await new Promise((resolve) => {
      const req = http.get("http://127.0.0.1:3003/api/nodes", (res) => {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => resolve(JSON.parse(data)));
      });
      req.setTimeout(2000, () => { req.destroy(); resolve(null); });
      req.on("error", () => resolve(null));
    });
    
    if (res) {
      for (const core of coresToWatch) {
        const node = res[core.name];
        if (!node || node.status === "dead") {
          if (!processes.has(core.name)) {
            console.log(`🔍 [DETECT] ${core.name} is dead, reviving...`);
            startCore(core);
          }
        }
      }
    }
  } catch(e) {}
}

console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   🔁 AUTO-REVIVE ENGINE — САМОВОССТАНОВЛЕНИЕ                               ║");
console.log("║   ✅ Мониторинг мёртвых ядер | ✅ Автоматический перезапуск                ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝\n");

// Запускаем все ядра
for (const core of coresToWatch) {
  startCore(core);
}

// Проверяем swarm каждые 5 секунд
setInterval(checkSwarmAndRevive, 5000);

process.on("SIGINT", () => {
  console.log("\n💀 Stopping all cores...");
  for (const [name, proc] of processes) {
    proc.kill();
  }
  process.exit();
});
