const fs = require("fs");

const file = "core-v110.js";
let code = fs.readFileSync(file, "utf8");

// =========================
// 💀 GLOBAL FIX PATCH
// =========================

// 1. entropy / stability GLOBAL FIX
code = code.replace(/\bentropy\b/g, "world.entropy");
code = code.replace(/\bstability\b/g, "world.stability");

// 2. убираем optional chaining (если остался)
code = code.replace(/\?\./g, ".");

// =========================
// 💾 SAVE
// =========================
fs.writeFileSync(file, code);

console.log("💀 CORE REPAIR COMPLETE (V110 FIXED)");
