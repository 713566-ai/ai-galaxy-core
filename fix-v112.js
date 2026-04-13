const fs = require("fs");

const file = "/data/data/com.termux/files/home/ai-galaxy-core/core-v106.js";

let code = fs.readFileSync(file, "utf-8");

// =========================
// ❌ УДАЛЯЕМ СЛОМАННЫЙ ПАТЧ
// =========================
code = code.replace(/for \(let e of this\.empires\)[\s\S]*?this\.history/g, "this.history");

// =========================
// ✅ ДОБАВЛЯЕМ В CONSTRUCTOR
// =========================
code = code.replace(
  /constructor\(\)\s*{/,
  `constructor() {
    this.empires = this.empires || [];
    this.agents = this.agents || [];
`
);

// =========================
// ✅ ВСТАВЛЯЕМ В step()
// =========================
code = code.replace(
  /step\(\)\s*{([\s\S]*?)this\.tick\+\+;/,
  `step() {
    this.tick++;

    // ===== V112 FIX =====
    this.empires = this.empires || [];
    this.agents = this.agents || [];

    for (let e of this.empires) {
      if (e.update) e.update();
    }

    for (let a of this.agents) {
      if (a.act) a.act(this);
    }

    if (this.empires.length > 1 && Math.random() < this.rules.warChance) {
      const a = this.empires[Math.floor(Math.random() * this.empires.length)];
      const b = this.empires[Math.floor(Math.random() * this.empires.length)];

      if (a !== b) {
        const winner = Math.random() > 0.5 ? a : b;
        const loser = winner === a ? b : a;

        winner.territory += 3;
        loser.territory -= 5;

        this.history.wars++;
      }
    }
`
);

fs.writeFileSync(file, code);

console.log("💀 V112 FIX APPLIED CLEAN");
