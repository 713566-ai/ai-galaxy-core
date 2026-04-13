const { spawn } = require("child_process");

const PORTS = [3100,3101,3102,3103,3104,3105,3106,3107,3108,3109,3110];
let processes = {};
let restartCount = {};

function startNode(port) {
  if (processes[port]) {
    console.log(`⚠️ warfare-${port} already running`);
    return;
  }

  console.log(`🧬 START warfare-${port}`);
  
  const proc = spawn("node", ["warfare-core.js", port], {
    stdio: "pipe"
  });
  
  processes[port] = proc;
  restartCount[port] = (restartCount[port] || 0) + 1;
  
  proc.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg.includes("started")) {
      console.log(`   ✅ warfare-${port} online`);
    }
  });
  
  proc.stderr.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log(`   ⚠️ warfare-${port}: ${msg.slice(0, 80)}`);
  });
  
  proc.on("exit", (code) => {
    console.log(`💀 warfare-${port} died (code ${code}) → reviving...`);
    delete processes[port];
    
    // Авто-воскрешение через 1 секунду
    setTimeout(() => startNode(port), 1000);
  });
  
  return proc;
}

// Запускаем все ядра
console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   ⚔️ WARFARE PROCESS MANAGER V130                                          ║");
console.log("║   ✅ Auto-revive | ✅ Process tracking | ✅ Stable spawn                   ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝\n");

for (const port of PORTS) {
  startNode(port);
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n💀 Stopping all warfare nodes...");
  for (const [port, proc] of Object.entries(processes)) {
    proc.kill();
  }
  process.exit();
});
