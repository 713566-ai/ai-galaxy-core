// =========================
// 🔮 V107 — PREDICTIVE IMMUNITY CORE (FIXED)
// =========================

const express = require("express");
const app = express();

// =========================
// 🧠 FUTURE MODEL
// =========================

class FutureModel {
  constructor() {
    this.patterns = [];
    this.predictions = new Map();
  }

  observe(god, action, worldState) {
    this.patterns.push({
      tick: Date.now(),
      god: god.name,
      power: god.power,
      rebel: god.rebel,
      corrupted: god.corrupted,
      fear: god.fear,
      action,
      worldEntropy: worldState.entropy,
    });
    if (this.patterns.length > 500) this.patterns.shift();
  }

  predictAttack(god, worldState) {
    const recent = this.patterns.filter(p => p.god === god.name).slice(-30);
    let riskScore = 0;
    
    for (let p of recent) {
      if (p.rebel) riskScore += 0.25;
      if (p.corrupted) riskScore += 0.2;
      if (p.power > 1.2) riskScore += 0.15;
      if (p.fear > 0.8) riskScore -= 0.2;
      if (p.worldEntropy > 0.7) riskScore += 0.15;
      if (p.action === "attack") riskScore += 0.3;
    }
    
    riskScore = Math.min(1, riskScore / 2);
    const prediction = riskScore > 0.6 ? "HIGH_RISK" : (riskScore > 0.3 ? "MEDIUM_RISK" : "LOW_RISK");
    
    return { prediction, riskScore, confidence: 0.7 };
  }
  
  getState() {
    return { patternsCount: this.patterns.length };
  }
}

// =========================
// 🛡 PRE-DEFENSE ENGINE
// =========================

class PreDefense {
  constructor() {
    this.lockedTargets = new Set();
    this.preemptiveActions = [];
    this.defenseBudget = 100;
  }

  act(world, god, prediction, riskScore) {
    if (prediction === "HIGH_RISK" && this.defenseBudget > 0 && !this.lockedTargets.has(god.name)) {
      this.lockedTargets.add(god.name);
      god.power *= 0.8;
      if (god.rebel) god.rebel = false;
      if (god.corrupted) god.corrupted = false;
      god.fear += 0.15;
      this.defenseBudget -= 10;
      this.preemptiveActions.push({ tick: world.tick, god: god.name, action: "PREVENTIVE_LOCK" });
      world.log.push({ tick: world.tick, event: "PREVENTIVE_LOCK", god: god.name });
      return true;
    }
    return false;
  }
  
  recharge() { this.defenseBudget = Math.min(100, this.defenseBudget + 2); }
  
  getState() {
    return { lockedTargets: Array.from(this.lockedTargets), defenseBudget: this.defenseBudget };
  }
}

// =========================
// 🧬 IMMUNE MEMORY
// =========================

class ImmuneMemory {
  constructor() {
    this.records = [];
    this.threatPatterns = {};
  }
  record(event) { this.records.push(event); this.threatPatterns[event.type] = (this.threatPatterns[event.type] || 0) + 1; }
  getThreatPattern() { return this.threatPatterns; }
}

// =========================
// 🛡 ADAPTIVE DEFENSE
// =========================

class AdaptiveDefense {
  constructor() { this.level = 1.2; }
  evolve(memory) { return this.level; }
  getState() { return { level: this.level.toFixed(2) }; }
}

// =========================
// 👑 GOD
// =========================

class GodV107 {
  constructor(name) {
    this.name = name;
    this.power = 0.4 + Math.random() * 0.7;
    this.alive = true;
    this.age = 0;
    this.rebel = false;
    this.corrupted = false;
    this.fear = 0;
    this.rules = { warChance: 0.5, collapseRate: 0.3, entropyBias: 0 };
    this.history = [];
  }

  evolve(world) {
    this.age++;
    if (!this.rebel && !this.corrupted && this.age > 35 && world.entropy > 0.55 && Math.random() < 0.035) {
      this.rebel = true;
      world.log.push({ tick: world.tick, event: "REBELLION", god: this.name });
    }
    let growth = 0.004 + (this.rebel ? 0.012 : 0);
    this.power += growth - world.entropy * 0.003 - this.fear * 0.015;
    this.power = Math.max(0.05, Math.min(3, this.power));
    this.fear = Math.max(0, this.fear - 0.015);
    this.history.push({ tick: world.tick, power: this.power });
  }
  
  isDead() { return this.power <= 0.05 || this.age > 2000 || this.fear > 1.5; }
}

// =========================
// 🌍 WORLD
// =========================

class WorldV107 {
  constructor() {
    this.tick = 0;
    this.entropy = 0.4;
    this.stability = 0.6;
    this.gods = [];
    this.log = [];
    this.history = { wars: 0, collapses: 0 };
    this.empires = [];
    this.agents = [];
    this.memory = new ImmuneMemory();
    this.futureModel = new FutureModel();
    this.preDefense = new PreDefense();
    this.defense = new AdaptiveDefense();
  }

  addGod(g) { this.gods.push(g); }
  addEmpire(e) { this.empires.push(e); }
  addAgent(a, e) { a.loyalty = e.id; e.agents.push(a); this.agents.push(a); }

  spawnGod() {
    const names = ["Chronos", "Erebus", "Thanatos", "Eris", "Moros", "Nyx", "Nemesis"];
    const newName = names[Math.floor(Math.random() * names.length)];
    const newGod = new GodV107(newName);
    newGod.power = 0.2 + this.entropy * 1.4;
    this.gods.push(newGod);
    this.log.push({ tick: this.tick, event: "GOD_BIRTH", god: newName });
    return newGod;
  }

  evaluateGods() {
    for (let g of [...this.gods]) {
      if (g.isDead()) {
        g.alive = false;
        this.gods = this.gods.filter(god => god !== g);
        this.log.push({ tick: this.tick, event: "GOD_DEATH", god: g.name });
      }
    }
  }

  mergeRules() {
    if (this.gods.length === 0) return { warChance: 0.5, collapseRate: 0.5, entropyBias: 0.3 };
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0) || 1;
    let war = 0, collapse = 0, entropy = 0;
    for (let g of this.gods) {
      let w = g.power / totalPower;
      war += g.rules.warChance * w;
      collapse += g.rules.collapseRate * w;
      entropy += g.rules.entropyBias * w;
    }
    return { warChance: Math.min(0.95, war), collapseRate: Math.min(0.9, collapse), entropyBias: entropy };
  }

  updateEmpires(rules) {
    for (let e of this.empires) {
      e.territory += (Math.random() - 0.5) * 0.5;
      e.territory = Math.max(5, Math.min(120, e.territory));
      e.cohesion += (Math.random() - 0.5) * 0.02;
      e.cohesion = Math.max(0.1, Math.min(1, e.cohesion));
      e.strength = e.agents.reduce((s, a) => s + a.fitness, 0) / Math.max(1, e.agents.length);
      if (Math.random() < rules.collapseRate || e.cohesion < 0.2) {
        e.state = e.state === "collapsing" ? "dead" : "collapsing";
      }
    }
    this.empires = this.empires.filter(e => e.state !== "dead");
  }

  simulateWars(rules) {
    if (this.empires.length < 2) return;
    for (let i = 0; i < this.empires.length; i++) {
      if (Math.random() < rules.warChance) {
        const attacker = this.empires[i];
        let defender = this.empires[Math.floor(Math.random() * this.empires.length)];
        if (defender === attacker) continue;
        const powerA = attacker.strength + Math.random() * 0.3;
        const powerB = defender.strength + Math.random() * 0.3;
        const winner = powerA > powerB ? attacker : defender;
        const loser = winner === attacker ? defender : attacker;
        winner.territory += 2;
        loser.territory -= 4;
        this.history.wars++;
      }
    }
  }

  step() {
    this.tick++;
    for (let g of this.gods) g.evolve(this);
    
    // Prediction loop
    for (let g of this.gods) {
      const { prediction, riskScore } = this.futureModel.predictAttack(g, this);
      this.preDefense.act(this, g, prediction, riskScore);
      this.futureModel.observe(g, riskScore > 0.5 ? "attack" : "idle", this);
    }
    
    this.defense.evolve(this.memory);
    this.evaluateGods();
    if (this.entropy > 0.45 && Math.random() < 0.05 && this.gods.length < 9) this.spawnGod();
    this.preDefense.recharge();
    this.entropy += (Math.random() - 0.5) * 0.012;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    this.stability = Math.max(0.1, Math.min(0.95, this.stability + (Math.random() - 0.5) * 0.01));
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      console.log(`\n🔮 V107 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Gods:${this.gods.length} (R:${rebelGods.length}) | PreLocked:${this.preDefense.lockedTargets.size}`);
      for (let g of this.gods.slice(0, 4)) {
        console.log(`   ${g.rebel ? "⚡R" : "👑"} ${g.name} | power=${g.power.toFixed(2)} | fear=${g.fear.toFixed(2)}`);
      }
      console.log("");
    }
  }
}

// =========================
// 🏛️ EMPIRE & AGENT
// =========================

class Empire {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.state = "stable";
    this.strength = 0.6;
    this.territory = 50;
    this.cohesion = 0.6;
    this.agents = [];
  }
}

class Agent {
  constructor(name) {
    this.name = name;
    this.fitness = 0.5;
    this.energy = 1;
    this.loyalty = null;
  }
}

// =========================
// 🚀 INIT
// =========================

const world = new WorldV107();
world.addGod(new GodV107("Ares"));
world.addGod(new GodV107("Athena"));
world.addGod(new GodV107("Nyx"));
world.addGod(new GodV107("Eris"));

const E1 = new Empire("E1", "Aurora");
const E2 = new Empire("E2", "Obsidian");
world.addEmpire(E1);
world.addEmpire(E2);
world.addAgent(new Agent("codey"), E1);
world.addAgent(new Agent("uiax"), E1);
world.addAgent(new Agent("garlic"), E2);

// =========================
// 🚀 API
// =========================

app.use(express.json());

app.get("/api/status", (req, res) => {
  const rules = world.mergeRules();
  const rebelGods = world.gods.filter(g => g.rebel);
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    stability: world.stability.toFixed(3),
    defense: world.defense.getState(),
    preDefense: world.preDefense.getState(),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
    },
    gods: world.gods.map(g => ({ name: g.name, power: g.power.toFixed(3), rebel: g.rebel, fear: g.fear.toFixed(2) })),
    rebelsCount: rebelGods.length,
    history: world.history,
    empires: world.empires.map(e => ({ name: e.name, state: e.state, territory: e.territory.toFixed(1) })),
    recentEvents: world.log.slice(-20),
  });
});

app.get("/api/predictions", (req, res) => {
  const predictions = [];
  for (let g of world.gods) {
    const { prediction, riskScore } = world.futureModel.predictAttack(g, world);
    predictions.push({ god: g.name, risk: riskScore.toFixed(3), prediction });
  }
  res.json({ predictions, accuracy: 0.7 });
});

app.get("/api/predefense", (req, res) => {
  res.json(world.preDefense.getState());
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🔮 V107 PREDICTIVE IMMUNITY CORE ONLINE :3000");
});
