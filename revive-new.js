#!/usr/bin/env node
const { spawn } = require("child_process");
const http = require("http");

const cores = [];
for (let i = 0; i <= 10; i++) {
  const port = 3100 + i;
  cores.push({
    name: `warfare-${port}`,
    file: `warfare-core-${port}.js`,
    port: port
  });
}

const processes = new Map();

function startCore(core) {
  if (processes.has(core.name)) {
    return;
  }

  console.log(`🧬 [START] ${core.name} on port ${core.port}`);
  
  const child = spawn("node", [core.file], {
    stdio: "pipe"
  });
  
  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("Warfare core")) {
      console.log(`   ✅ ${msg}`);
    }
  });
  
  child.stderr.on("data", (data) => {
    // Игнорируем
  });
  
  processes.set(core.name, child);
  
  child.on("exit", (code) => {
    console.log(`💀 [DEATH] ${core.name} exited`);
    processes.delete(core.name);
    setTimeout(() => startCore(core), 2000);
  });
}

console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   🔁 AUTO-REVIVE V2 — СОВМЕСТИМЫЕ ЯДРА                                    ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝\n");

for (const core of cores) {
  startCore(core);
}

process.on("SIGINT", () => {
  console.log("\n💀 Stopping...");
  for (const proc of processes.values()) {
    proc.kill();
  }
  process.exit();
});
