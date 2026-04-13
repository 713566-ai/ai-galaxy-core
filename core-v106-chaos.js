// =========================
// 🔧💀 V106 CHAOS UPGRADE PATCH — ACTIVE
// Система сама создаёт конфликты, чтобы НЕ застыть
// =========================

const express = require("express");
const app = express();

// =========================
// 🧬 IMMUNE MEMORY
// =========================

class ImmuneMemory {
  constructor() {
    this.records = [];
    this.threatPatterns = {};
  }
  record(event) {
    this.records.push(event);
    this.threatPatterns[event.type] = (this.threatPatterns[event.type] || 0) + 1;
    if (this.records.length > 500) this.records.shift();
  }
  getThreatPattern() { return this.threatPatterns; }
}

// =========================
// 🛡 ADAPTIVE DEFENSE
// =========================

class AdaptiveDefense {
  constructor() {
    this.level = 1.2;
    this.panicMode = false;
    this.overheat = 0;
  }
  
  evolve(memory) { return this.level; }
  
  getState() {
    return { 
      level: this.level.toFixed(2), 
      panicMode: this.panicMode,
      overheat: this.overheat.toFixed(2)
    };
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
      god.fear += 0.15;
      this.defenseBudget -= 10;
      this.preemptiveActions.push({ tick: world.tick, god: god.name });
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
// 🧠 FUTURE MODEL
// =========================

class FutureModel {
  constructor() {
    this.patterns = [];
    this.predictionError = 0;
  }

  observe(god, action, worldState) {
    this.patterns.push({
      tick: Date.now(),
      god: god.name,
      power: god.power,
      rebel: god.rebel,
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
      if (p.power > 1.2) riskScore += 0.15;
      if (p.fear > 0.8) riskScore -= 0.2;
      if (p.worldEntropy > 0.7) riskScore += 0.15;
    }
    riskScore = Math.min(1, riskScore / 2);
    const prediction = riskScore > 0.6 ? "HIGH_RISK" : (riskScore > 0.3 ? "MEDIUM_RISK" : "LOW_RISK");
    return { prediction, riskScore, confidence: 0.7 };
  }
}

// =========================
// 👑 GOD
// =========================

class GodV106Chaos {
  constructor(name) {
    this.name = name;
    this.power = 0.4 + Math.random() * 0.7;
    this.alive = true;
    this.age = 0;
    this.rebel = false;
    this.fear = 0;
    this.rage = 0;
    this.rules = { warChance: 0.5, collapseRate: 0.3, entropyBias: 0 };
  }

  evolve(world) {
    this.age++;
    this.power += 0.004;
    if (this.rebel) this.power += 0.008;
    if (this.rage > 0.5) this.power += 0.01;
    this.power -= world.entropy * 0.003;
    this.power -= this.fear * 0.015;
    this.power = Math.max(0.05, Math.min(3, this.power));
    this.fear = Math.max(0, this.fear - 0.01);
    this.rage = Math.max(0, this.rage - 0.02);
  }
  
  isDead() { return this.power <= 0.05 || this.age > 2000 || this.fear > 1.5; }
}

// =========================
// 🔥 CHAOS REBELLION SEED
// =========================

function rebellionSeed(g, world) {
  const chance = 0.05 + world.entropy * 0.2;
  if (Math.random() < chance && !g.rebel) {
    g.rebel = true;
    g.fear = Math.random() * 0.3;
    world.log.push({ tick: world.tick, event: "REBELLION_SEED", god: g.name });
    console.log(`⚡ REBELLION SEED: ${g.name} turned rebel at entropy ${world.entropy.toFixed(3)}`);
    return true;
  }
  return false;
}

// =========================
// ⚔️ GOD-TO-GOD CONFLICT
// =========================

function godConflict(gods, world) {
  if (gods.length < 2) return;
  
  const a = gods[Math.floor(Math.random() * gods.length)];
  const b = gods[Math.floor(Math.random() * gods.length)];
  if (a === b) return;
  
  const powerA = a.power + Math.random();
  const powerB = b.power + Math.random();
  const diff = Math.abs(powerA - powerB);
  
  if (diff < 0.4) {
    world.entropy += 0.03;
    world.log.push({ tick: world.tick, event: "GOD_CONFLICT_STALEMATE", gods: [a.name, b.name] });
    return;
  }
  
  const winner = powerA > powerB ? a : b;
  const loser = winner === a ? b : a;
  
  loser.power *= 0.9;
  winner.power += 0.05;
  if (loser.rebel) loser.rebel = false;
  winner.rage += 0.1;
  world.history.wars++;
  world.log.push({ tick: world.tick, event: "GOD_CONFLICT", winner: winner.name, loser: loser.name });
  console.log(`⚔️ GOD CONFLICT: ${winner.name} defeated ${loser.name}`);
}

// =========================
// 🧠 PREDICTION NOISE BREAKER
// =========================

let predictionError = 0;

function predictionNoise(world) {
  predictionError = (Math.random() - 0.5) * world.entropy * 2;
  
  if (Math.abs(predictionError) > 0.6) {
    world.defense.level *= 0.98;
    world.log.push({ tick: world.tick, event: "PREDICTION_FAILURE", error: predictionError.toFixed(3) });
    console.log(`🔮 PREDICTION FAILURE: error=${predictionError.toFixed(3)}`);
  }
  
  return predictionError;
}

// =========================
// 🛡 IMMUNE OVERDRIVE
// =========================

function immuneOverdrive(world) {
  if (world.entropy > 0.6) {
    world.defense.level += 0.03;
    world.stability -= 0.02;
    world.defense.panicMode = true;
  }
  
  if (world.entropy > 0.8) {
    world.defense.level += 0.1;
    world.preDefense.defenseBudget -= 5;
    world.defense.overheat += 0.05;
    world.log.push({ tick: world.tick, event: "IMMUNE_OVERDRIVE", entropy: world.entropy.toFixed(3) });
    console.log(`🛡 IMMUNE OVERDRIVE: defense level ${world.defense.level.toFixed(2)}`);
  } else {
    world.defense.panicMode = false;
  }
  
  world.defense.overheat = Math.max(0, world.defense.overheat - 0.01);
}

// =========================
// 🌍 WORLD V106 CHAOS
// =========================

class WorldV106Chaos {
  constructor() {
    this.tick = 0;
    this.entropy = 0.4;
    this.stability = 0.6;
    this.gods = [];
    this.log = [];
    this.history = { wars: 0, collapses: 0, rebellions: 0 };
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
    const names = ["Chronos", "Erebus", "Thanatos", "Eris", "Moros", "Nyx", "Nemesis", "Kratos", "Bia"];
    const newName = names[Math.floor(Math.random() * names.length)];
    const newGod = new GodV106Chaos(newName);
    newGod.power = 0.2 + this.entropy * 1.5;
    newGod.power = Math.min(2.5, newGod.power);
    this.gods.push(newGod);
    this.log.push({ tick: this.tick, event: "GOD_BIRTH", god: newName });
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)})`);
    return newGod;
  }

  evaluateGods() {
    for (let g of [...this.gods]) {
      if (g.isDead()) {
        g.alive = false;
        this.gods = this.gods.filter(god => god !== g);
        this.log.push({ tick: this.tick, event: "GOD_DEATH", god: g.name });
        console.log(`💀 GOD DEATH: ${g.name}`);
      }
    }
  }

  mergeRules() {
    if (this.gods.length === 0) return { warChance: 0.5, collapseRate: 0.5, entropyBias: 0.3 };
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0) || 1;
    let war = 0, collapse = 0;
    for (let g of this.gods) {
      let w = g.power / totalPower;
      war += g.rules.warChance * w;
      collapse += g.rules.collapseRate * w;
    }
    return { warChance: Math.min(0.95, war), collapseRate: Math.min(0.9, collapse), entropyBias: 0 };
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
    
    // 1. Бунты и эволюция
    for (let g of this.gods) {
      rebellionSeed(g, this);
      g.evolve(this);
    }
    
    // 2. Конфликты между богами
    godConflict(this.gods, this);
    
    // 3. Предсказания с шумом
    for (let g of this.gods) {
      const { prediction, riskScore } = this.futureModel.predictAttack(g, this);
      this.preDefense.act(this, g, prediction, riskScore);
      this.futureModel.observe(g, riskScore > 0.5 ? "attack" : "idle", this);
    }
    
    predictionNoise(this);
    
    // 4. Иммунный ответ
    immuneOverdrive(this);
    
    // 5. Эволюция и рождение
    this.defense.evolve(this.memory);
    this.evaluateGods();
    if (this.entropy > 0.4 && Math.random() < 0.06 && this.gods.length < 8) this.spawnGod();
    this.preDefense.recharge();
    
    // 6. Энтропия и мир
    this.entropy += (Math.random() - 0.5) * 0.02;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    this.stability = Math.max(0.1, Math.min(0.95, this.stability + (Math.random() - 0.5) * 0.015));
    
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // 7. Логирование
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      console.log(`\n🔧💀 V106 CHAOS T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Defense:${this.defense.level.toFixed(2)} | Gods:${this.gods.length} (R:${rebelGods.length}) | Wars:${this.history.wars}`);
      for (let g of this.gods.slice(0, 4)) {
        console.log(`   ${g.rebel ? "⚡R" : "👑"} ${g.name} | power=${g.power.toFixed(2)} | fear=${g.fear.toFixed(2)} | rage=${g.rage.toFixed(2)}`);
      }
      if (this.defense.panicMode) console.log(`   🛡 PANIC MODE ACTIVE | Overheat:${this.defense.overheat.toFixed(2)}`);
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
// 🚀 INIT WORLD
// =========================

const world = new WorldV106Chaos();

world.addGod(new GodV106Chaos("Ares"));
world.addGod(new GodV106Chaos("Athena"));
world.addGod(new GodV106Chaos("Nyx"));
world.addGod(new GodV106Chaos("Eris"));

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
    predictionError: predictionError.toFixed(3),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      fear: g.fear.toFixed(2),
      rage: g.rage.toFixed(2),
    })),
    rebelsCount: rebelGods.length,
    history: world.history,
    empires: world.empires.map(e => ({ name: e.name, state: e.state, territory: e.territory.toFixed(1) })),
    recentEvents: world.log.slice(-20),
  });
});

app.get("/api/conflicts", (req, res) => {
  res.json({ recentConflicts: world.log.filter(l => l.event === "GOD_CONFLICT").slice(-20) });
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🔧💀 V106 CHAOS UPGRADE PATCH — ACTIVE");
  console.log("🔥 Система сама создаёт конфликты, чтобы НЕ застыть!");
});
