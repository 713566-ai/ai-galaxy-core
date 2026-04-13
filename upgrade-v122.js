const fs = require("fs");

const file = "core.js";
let code = fs.readFileSync(file, "utf8");

// =====================
// 💀 V122 SAFE PATCH LAYER
// =====================

// 1. GLOBAL SNAPSHOT API
if (!code.includes("/api/snapshot")) {
  code += `

// 💀 V122 SNAPSHOT API
app.get("/api/snapshot", (req, res) => {
  res.json({
    version: "V122",
    world: global.worldState || null,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
`;
}

// 2. SAFE SAVE STATE LOOP
if (!code.includes("AUTO_SAVE_V122")) {
  code += `

// 💀 AUTO SAVE V122
setInterval(() => {
  if (!global.worldState) return;

  fs.writeFileSync(
    "./world_snapshot.json",
    JSON.stringify(global.worldState, null, 2)
  );
}, 5000);
`;
}

// 3. VERSION LOCK (чтобы ты не ломал ядро случайно)
if (!code.includes("CORE_LOCK_V122")) {
  code += `

// 💀 CORE LOCK V122
global.CORE_VERSION = "V122_STABLE_LOCKED";
`;
}

fs.writeFileSync(file, code);

console.log("💀 V122 INSTALLED SAFELY");
