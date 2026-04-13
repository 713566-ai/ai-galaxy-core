const fs = require("fs");

const file = "core-v106.js"; // 👈 если у тебя другой — поменяй

let code = fs.readFileSync(file, "utf-8");

// =========================
// 🧩 ADD CLASSES
// =========================
const classes = `

// ===== V112 PATCH =====

// 🏛 EMPIRE
class Empire {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.territory = 50;
    this.cohesion = 0.6;
    this.power = 0.5;
    this.state = "stable";
    this.agents = [];
  }

  update() {
    this.territory += (Math.random() - 0.5) * 2;
    this.territory = Math.max(5, Math.min(120, this.territory));

    this.cohesion += (Math.random() - 0.5) * 0.05;
    this.cohesion = Math.max(0.1, Math.min(1, this.cohesion));

    this.power = this.agents.reduce((s, a) => s + a.fitness, 0) / Math.max(1, this.agents.length);

    if (this.cohesion < 0.2) this.state = "collapsing";
  }
}

// 👤 AGENT
class Agent {
  constructor(name) {
    this.name = name;
    this.fitness = 0.5;
    this.energy = 1;
    this.loyalty = null;
  }

  act() {
    this.energy -= 0.05;
    if (this.energy <= 0.2) this.fitness -= 0.02;
    else this.fitness += 0.01;

    this.fitness = Math.max(0.1, Math.min(1.5, this.fitness));
    this.energy = Math.max(0.1, Math.min(1, this.energy));
  }
}
`;

// =========================
// 🌍 INSERT INTO WORLD
// =========================
if (!code.includes("this.empires")) {
  code = code.replace("constructor() {", `constructor() {
    this.empires = [];
    this.agents = [];
`);
}

// =========================
// ➕ ADD FUNCTIONS
// =========================
if (!code.includes("addEmpire")) {
  code += `

World.prototype.addEmpire = function(e) {
  this.empires.push(e);
};

World.prototype.addAgent = function(a, empire) {
  a.loyalty = empire.id;
  empire.agents.push(a);
  this.agents.push(a);
};
`;
}

// =========================
// 🚀 INIT INSERT
// =========================
if (!code.includes("Aurora")) {
  code = code.replace("const world = new World();", `
const world = new World();

const E1 = new Empire("E1", "Aurora");
const E2 = new Empire("E2", "Obsidian");

world.addEmpire(E1);
world.addEmpire(E2);

world.addAgent(new Agent("codey"), E1);
world.addAgent(new Agent("uiax"), E1);
world.addAgent(new Agent("garlic"), E2);
`);
}

// =========================
// 🔁 STEP PATCH
// =========================
if (!code.includes("EMPIRE UPDATE")) {
  code = code.replace("this.history", `
// ===== V112 RUNTIME =====
for (let e of this.empires) e.update();
for (let a of this.agents) a.act();

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

this.history`);
}

// =========================
// 🧾 ADD CLASSES TOP
// =========================
if (!code.includes("class Empire")) {
  code = classes + code;
}

fs.writeFileSync(file, code);
console.log("💀 V112 PATCH APPLIED");
