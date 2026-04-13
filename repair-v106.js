const fs = require("fs");

const file = "/data/data/com.termux/files/home/ai-galaxy-core/core-v106.js";

let code = fs.readFileSync(file, "utf-8");

// =========================
// 🧠 FIX BALANCE OF BRACES
// =========================

// грубая защита: убираем подозрительные обрывы
code = code.replace(/\}\s*\}\s*step/g, "} step");

// =========================
// ❌ УДАЛЯЕМ ПОЛОМАННЫЙ ПАТЧ
// =========================
code = code.replace(/this\.empires[\s\S]*?this\.history\.wars;/g, "");

// =========================
// ✅ ВОССТАНАВЛИВАЕМ БЕЗОПАСНЫЙ step PATCH
// =========================
code = code.replace(
  /step\(\)\s*{[\s\S]*?this\.tick\+\+;/,
  `step() {
    this.tick++;

    this.empires = this.empires || [];
    this.agents = this.agents || [];

    for (let e of this.empires) {
      if (e && typeof e === "object") {
        if (typeof e.update === "function") e.update();
      }
    }

    for (let a of this.agents) {
      if (a && typeof a === "object") {
        if (typeof a.act === "function") a.act(this);
      }
    }

    this.history = this.history || {};
`
);

fs.writeFileSync(file, code);

console.log("💀 SAFE REPAIR APPLIED");
