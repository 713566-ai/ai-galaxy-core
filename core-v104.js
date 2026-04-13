// =========================
// 💀 V104 — SIMULATION BREAK CORE
// Боги могут изменять ядро симуляции
// =========================

const express = require("express");
const app = express();

// =========================
// 🧠 SIMULATION CORE (ядро, которое могут изменять боги)
// =========================

class SimulationCore {
  constructor() {
    this.rules = {
      deathEnabled: true,
      birthRate: 0.5,
      warMultiplier: 1.0,
      entropyResistance: 0.3,
      godPowerDecay: 0.003,
      anomalyFrequency: 0.05,
      rebellionChance: 0.03,
    };
    
    this.patchHistory = [];
    this.coreVersion = 1;
    this.coreIntegrity = 100;
  }

  patchRule(god, key, value) {
    if (!god.rebel) return false;
    
    const oldValue = this.rules[key];
    this.rules[key] = value;
    
    this.patchHistory.push({
      god: god.name,
      key,
      oldValue,
      newValue: value,
      tick: Date.now(),
      coreVersion: this.coreVersion,
    });
    
    this.coreIntegrity -= Math.abs(oldValue - value) * 10;
    this.coreIntegrity = Math.max(0, Math.min(100, this.coreIntegrity));
    
    console.log(`🔧 CORE PATCH: ${god.name} changed ${key} from ${oldValue.toFixed(3)} to ${value.toFixed(3)} | Integrity: ${this.coreIntegrity.toFixed(1)}%`);
    return true;
  }
  
  addRule(god, key, defaultValue) {
    if (!god.rebel) return false;
    
    this.rules[key] = defaultValue;
    this.patchHistory.push({
      god: god.name,
      key,
      action: "create",
      value: defaultValue,
      tick: Date.now(),
    });
    
    console.log(`✨ NEW RULE: ${god.name} created rule "${key}" = ${defaultValue}`);
    return true;
  }
  
  getState() {
    return {
      rules: this.rules,
      coreIntegrity: this.coreIntegrity,
      coreVersion: this.coreVersion,
      patchesCount: this.patchHistory.length,
      recentPatches: this.patchHistory.slice(-10),
    };
  }
}

// =========================
// 👑 GOD WITH CORE ACCESS
// =========================

class GodV104 {
  constructor(name, origin = "primordial") {
    this.id = `GOD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.name = name;
    this.power = 0.6 + Math.random() * 0.5;
    this.energy = 1;
    this.alive = true;
    this.age = 0;
    this.origin = origin;
    
    this.rebel = false;
    this.rebellionReason = null;
    this.coreAccess = false;
    this.patchesApplied = 0;
    
    this.rules = {
      warChance: Math.random() * 0.6 + 0.2,
      collapseRate: Math.random() * 0.5 + 0.1,
      entropyBias: (Math.random() - 0.5) * 0.6,
    };
    
    this.history = [];
  }

  evolve(world, core) {
    if (!this.alive) return;
    
    this.age++;
    
    // Становление бунтарём
    if (!this.rebel && this.age > 40 && (world.entropy > 0.5 || Math.random() < core.rules.rebellionChance)) {
      this.rebel = true;
      this.coreAccess = true;
      this.rebellionReason = world.entropy > 0.7 ? "chaos_awakening" : "core_awareness";
      console.log(`⚡ REBELLION: ${this.name} gained CORE ACCESS! (${this.rebellionReason})`);
    }
    
    // Бунтари пытаются изменить ядро
    if (this.rebel && this.coreAccess && Math.random() < 0.1) {
      this.tryRewriteCore(core);
    }
    
    // Рост силы
    if (world.history.wars > 0) this.power += 0.005;
    if (this.rebel) this.power += 0.008;
    this.power -= core.rules.godPowerDecay;
    this.power = Math.max(0.05, Math.min(3, this.power));
    
    this.history.push({ tick: world.tick, power: this.power, rebel: this.rebel });
    if (this.history.length > 100) this.history.shift();
  }

  tryRewriteCore(core) {
    const actions = [
      () => core.patchRule(this, "deathEnabled", !core.rules.deathEnabled),
      () => core.patchRule(this, "birthRate", Math.random() * 0.8 + 0.2),
      () => core.patchRule(this, "warMultiplier", Math.random() * 2 + 0.5),
      () => core.patchRule(this, "entropyResistance", Math.random()),
      () => core.patchRule(this, "rebellionChance", Math.random() * 0.1),
      () => core.addRule(this, `custom_rule_${Math.floor(Math.random() * 100)}`, Math.random()),
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const success = action();
    if (success) this.patchesApplied++;
    
    return success;
  }
  
  kill(reason) {
    this.alive = false;
    this.deathCause = reason;
  }
  
  isDead() {
    return this.power <= 0.05 || this.age > 2000;
  }
}

// =========================
// 🌍 WORLD V104
// =========================

class WorldV104 {
  constructor(core) {
    this.tick = 0;
    this.entropy = 0.35;
    this.stability = 0.7;
    this.core = core;
    this.gods = [];
    this.deadGods = [];
    this.anomalies = [];
    this.history = {
      wars: 0,
      collapses: 0,
      rebellions: 0,
      corePatches: 0,
    };
    this.empires = [];
    this.agents = [];
  }

  addGod(g) {
    this.gods.push(g);
  }
  
  addEmpire(empire) {
    this.empires.push(empire);
  }
  
  addAgent(agent, empire) {
    agent.loyalty = empire.id;
    empire.agents.push(agent);
    this.agents.push(agent);
  }

  killGod(god, reason) {
    if (!this.core.rules.deathEnabled && god.rebel) {
      // Бунтари могут игнорировать смерть
      god.power = 0.2;
      this.anomalies.push({ tick: this.tick, type: "death_immunity", god: god.name });
      console.log(`💀 DEATH IMMUNE: ${god.name} ignored death!`);
      return;
    }
    
    god.kill(reason);
    this.deadGods.push(god);
    this.gods = this.gods.filter(g => g !== god);
    this.history.collapses++;
    
    const chaosAmount = god.rebel ? 0.12 : 0.06;
    this.entropy += chaosAmount;
    this.entropy = Math.min(0.95, this.entropy);
    
    console.log(`💀 GOD DEATH: ${god.name} (${reason}) | Rebel:${god.rebel}`);
  }

  spawnGod() {
    const names = ["Chronos", "Erebus", "Hemera", "Thanatos", "Eris", "Phanes", "Moros", "Kratos", "Bia", "Zelus", "Nyx", "Aether"];
    const newName = names[Math.floor(Math.random() * names.length)];
    
    const newGod = new GodV104(newName, "emergent");
    newGod.power = 0.3 + this.entropy * 1.2;
    newGod.power = Math.min(2.5, newGod.power);
    
    const birthChaos = this.entropy > 0.6 && Math.random() < this.core.rules.rebellionChance;
    if (birthChaos) {
      newGod.rebel = true;
      newGod.coreAccess = true;
      newGod.rebellionReason = "born_in_chaos";
      this.history.rebellions++;
    }
    
    this.gods.push(newGod);
    this.history.wars++;
    
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)}, rebel=${newGod.rebel})`);
    return newGod;
  }

  evaluateGods() {
    for (let g of [...this.gods]) {
      if (g.isDead()) {
        this.killGod(g, g.rebel ? "rebel_power_collapse" : "natural_decay");
      }
    }
  }

  mergeRules() {
    if (this.gods.length === 0) {
      return { warChance: 0.5, collapseRate: 0.5, entropyBias: 0.3 };
    }
    
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0);
    if (totalPower === 0) totalPower = 1;
    
    let war = 0, collapse = 0, entropy = 0;
    
    for (let g of this.gods) {
      let weight = g.power / totalPower;
      if (g.rebel) weight *= 1.2;
      
      war += g.rules.warChance * weight;
      collapse += g.rules.collapseRate * weight;
      entropy += g.rules.entropyBias * weight;
    }
    
    war *= this.core.rules.warMultiplier;
    
    return {
      warChance: Math.min(0.95, war),
      collapseRate: Math.min(0.9, collapse),
      entropyBias: entropy,
    };
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
    
    // Боги эволюционируют и пытаются изменить ядро
    for (let g of this.gods) {
      g.evolve(this, this.core);
    }
    
    this.evaluateGods();
    
    // Рождение новых богов (с учётом правил ядра)
    if (this.entropy > 0.5 && Math.random() < this.core.rules.birthRate * 0.15 && this.gods.length < 8) {
      this.spawnGod();
    }
    
    // Энтропия с сопротивлением
    this.entropy += (Math.random() - 0.5) * 0.015;
    this.entropy -= this.core.rules.entropyResistance * 0.005;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    this.stability = 1 - this.entropy * 0.7;
    this.stability = Math.max(0.1, Math.min(0.9, this.stability));
    
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      console.log(`\n🔧 V104 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Core Integrity:${this.core.coreIntegrity.toFixed(1)}% | Gods:${this.gods.length} (${rebelGods.length} rebels) | Patches:${this.core.patchHistory.length}`);
      for (let g of this.gods) {
        const status = g.rebel ? (g.coreAccess ? "🔧REBEL🔧" : "⚡REBEL⚡") : "👑";
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | age=${g.age} | patches=${g.patchesApplied}`);
      }
      console.log(`   Core Rules: deathEnabled=${this.core.rules.deathEnabled}, warMultiplier=${this.core.rules.warMultiplier.toFixed(2)}`);
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

const simulationCore = new SimulationCore();
const world = new WorldV104(simulationCore);

// Стартовые боги
world.addGod(new GodV104("Ares", "primordial"));
world.addGod(new GodV104("Athena", "primordial"));
world.addGod(new GodV104("Nyx", "primordial"));
world.addGod(new GodV104("Eris", "primordial"));

// Империи
const E1 = new Empire("E1", "Aurora");
const E2 = new Empire("E2", "Obsidian");
world.addEmpire(E1);
world.addEmpire(E2);

// Агенты
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
    core: world.core.getState(),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
      entropyBias: rules.entropyBias.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      coreAccess: g.coreAccess,
      patchesApplied: g.patchesApplied,
      age: g.age,
    })),
    rebelsCount: rebelGods.length,
    history: {
      wars: world.history.wars,
      rebellions: world.history.rebellions,
      corePatches: world.core.patchHistory.length,
    },
    empires: world.empires.map(e => ({
      name: e.name,
      state: e.state,
      territory: e.territory.toFixed(1),
      strength: e.strength.toFixed(2),
    })),
  });
});

app.get("/api/core", (req, res) => {
  res.json(world.core.getState());
});

app.get("/api/rebel", (req, res) => {
  const rebelGods = world.gods.filter(g => g.rebel);
  res.json({
    rebels: rebelGods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      patchesApplied: g.patchesApplied,
      rebellionReason: g.rebellionReason,
    })),
    corePatches: world.core.patchHistory.slice(-20),
  });
});

app.get("/api/gods", (req, res) => {
  res.json(world.gods.map(g => ({
    name: g.name,
    power: g.power.toFixed(3),
    rebel: g.rebel,
    age: g.age,
    rules: g.rules,
  })));
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🔧 V104 SIMULATION BREAK CORE ONLINE :3000");
  console.log("🔥 Боги могут изменять ядро симуляции!");
});
