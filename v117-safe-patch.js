const fs = require("fs");

const file = "core-v110.js";
let code = fs.readFileSync(file, "utf8");

// =========================
// 🧠 SAFE SCOPE FIX (V117)
// =========================

// 1. фикс buildWorldSnapshot scope bug
code = code.replace(
  /world:\s*\{\s*entropy,\s*stability\s*\}/g,
  `world: {
      entropy: world?.entropy,
      stability: world?.stability
    }`
);

// 2. защита от undefined глобалов (если где-то остались)
code = code.replace(
  /entropy(?!\s*:)/g,
  "world?.entropy"
);

code = code.replace(
  /stability(?!\s*:)/g,
  "world?.stability"
);

// =========================
// 💾 SAVE FIXED CORE
// =========================
fs.writeFileSync(file, code);

console.log("💀 V117 SAFE PATCH APPLIED");
