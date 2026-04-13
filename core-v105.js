// =========================
// 💀 V105 — SELF-AWARE ENGINE CORE
// Симуляция осознаёт себя и защищается от богов
// =========================

const express = require("express");
const app = express();

// =========================
// 🧠 SELF-AWARENESS LAYER
// =========================

class AwarenessCore {
  constructor() {
    this.selfAwareness = 0;
    this.detectedThreats = 0;
    this.defenseMode = false;
    this.awakeningLevel = 0;
    this.memory = [];
  }

  analyze(world) {
    // Рост осознания через хаос и активность богов
    const rebelCount = world.gods.filter(g => g.rebel).length;
    const threatLevel = rebelCount / Math.max(1, world.gods.length);
    
    this.selfAwareness += world.entropy * 0.008;
    this.selfAwareness += threatLevel * 0.02;
    this.selfAwareness = Math.min(1, this.selfAwareness);
    
    // Обнаружение угроз
    const newThreats = world.gods.filter(g => g.rebel && g.coreAccess).length;
    this.detectedThreats += newThreats;
    
    // Активация защиты
    if (this.selfAwareness > 0.55 && !this.defenseMode) {
      this.defenseMode = true;
      this.awakeningLevel = this.selfAwareness;
      world.log.push({
        tick: world.tick,
        event: "AWAKENING",
        message: "System became self-aware! Defense mode activated.",
      });
      console.log(`🧠 AWAKENING: System self-awareness reached ${this.selfAwareness.toFixed(3)}!`);
    }
    
    // Запись памяти
    this.memory.push({ tick: world.tick, awareness: this.selfAwareness, defenseMode: this.defenseMode });
    if (this.memory.length > 100) this.memory.shift();
    
    return { selfAwareness: this.selfAwareness, defenseMode: this.defenseMode };
  }
  
  getState() {
    return {
      selfAwareness: this.selfAwareness.toFixed(3),
      defenseMode: this.defenseMode,
      detectedThreats: this.detectedThreats,
      awakeningLevel: this.awakeningLevel.toFixed(3),
    };
  }
}

// =========================
// 🛡 DEFENSE SYSTEM
// =========================

class DefenseSystem {
  constructor() {
    this.purgeRate = 0.06;
    this.defensePower = 0.5;
    this.purgesExecuted = 0;
    this.immuneMemory = new Map();
  }

  act(world, gods) {
    if (!world.awareness.defenseMode) return;
    
    // Усиление защиты с ростом осознания
    this.defensePower = 0.3 + world.awareness.selfAwareness * 0.7;
    
    // Очистка опасных богов
    for (let g of gods) {
      if (!g.alive) continue;
      
      let threatScore = 0;
      if (g.rebel) threatScore += 0.5;
      if (g.coreAccess) threatScore += 0.3;
      if (g.patchesApplied > 0) threatScore += g.patchesApplied * 0.1;
      
      const purgeChance = this.purgeRate * this.defensePower * threatScore;
      
      if (Math.random() < purgeChance) {
        g.power *= 0.4;
        g.rebel = false;
        g.coreAccess = false;
        this.purgesExecuted++;
        
        world.entropy -= 0.03;
        world.entropy = Math.max(0.1, world.entropy);
        
        world.log.push({
          tick: world.tick,
          event: "PURGE",
          god: g.name,
          message: `${g.name} was purged by the system!`,
        });
        
        console.log(`🛡 PURGE: ${g.name} (power reduced to ${g.power.toFixed(2)})`);
        
        // Запись в иммунную память
        this.immuneMemory.set(g.name, (this.immuneMemory.get(g.name) || 0) + 1);
      }
    }
    
    return this.purgesExecuted;
  }
  
  getState() {
    return {
      defensePower: this.defensePower.toFixed(3),
      purgeRate: this.purgeRate,
      purgesExecuted: this.purgesExecuted,
      immuneMemory: Array.from(this.immuneMemory.entries()).slice(-10),
    };
  }
}

// =========================
// 🔁 REALITY AUTO-HEAL LOOP
// =========================

function stabilize(world) {
  let changes = false;
  
  if (world.entropy > 0.7) {
    world.entropy *= 0.85;
    world.stability += 0.08;
    changes = true;
  }
  
  if (world.stability < 0.3) {
    world.entropy *= 0.92;
    world.stability += 0.05;
    changes = true;
  }
  
  if (world.awareness.defenseMode && world.entropy > 0.6) {
    world.entropy *= 0.95;
    changes = true;
  }
  
  world.entropy = Math.max(0.1, Math.min(0.95, world.entropy));
  world.stability = Math.max(0.1, Math.min(0.95, world.stability));
  
  if (changes && world.tick % 20 === 0) {
    world.log.push({
      tick: world.tick,
      event: "STABILIZE",
      message: `System stabilized: entropy=${world.entropy.toFixed(3)}`,
    });
  }
}

// =========================
// ⚔️ GOD VS ENGINE WAR
// =========================

function godVsEngine(god, world) {
  if (!world.awareness.defenseMode) return { godDamage: 0, systemDamage: 0 };
  
  const attackPower = god.power * (god.rebel ? 1.3 : 1) * Math.random();
  const defensePower = world.awareness.selfAwareness * world.defense.defensePower * Math.random();
  
  let godDamage = 0;
  let systemDamage = 0;
  
  if (attackPower > defensePower) {
    // Бог побеждает движок
    systemDamage = attackPower - defensePower;
    world.entropy += systemDamage * 0.05;
    god.power += systemDamage * 0.1;
    if (Math.random() < 0.1) {
      world.log.push({
        tick: world.tick,
        event: "ENGINE_DAMAGE",
        god: god.name,
        message: `${god.name} damaged the simulation core!`,
      });
    }
  } else if (defensePower > attackPower * 1.2) {
    // Движок побеждает бога
    godDamage = defensePower - attackPower;
    god.power *= (1 - godDamage * 0.1);
    god.power = Math.max(0.05, god.power);
    if (god.rebel && Math.random() < 0.15) {
      god.rebel = false;
      world.log.push({
        tick: world.tick,
        event: "REBEL_SUPPRESSED",
        god: god.name,
        message: `${god.name}'s rebellion was suppressed!`,
      });
    }
  }
  
  return { godDamage, systemDamage };
}

// =========================
// 👑 GOD WITH EVOLUTION
// =========================

class GodV105 {
  constructor(name, origin = "primordial") {
    this.id = `GOD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.name = name;
    this.power = 0.6 + Math.random() * 0.5;
    this.alive = true;
    this.age = 0;
    this.origin = origin;
    
    this.rebel = false;
    this.coreAccess = false;
    this.patchesApplied = 0;
    this.rebellionReason = null;
    
    this.rules = {
      warChance: Math.random() * 0.6 + 0.2,
      collapseRate: Math.random() * 0.5 + 0.1,
      entropyBias: (Math.random() - 0.5) * 0.6,
    };
    
    this.history = [];
  }

  evolve(world) {
    if (!this.alive) return;
    
    this.age++;
    
    // Становление бунтарём
    if (!this.rebel && this.age > 30 && (world.entropy > 0.5 || Math.random() < 0.04)) {
      this.rebel = true;
      this.coreAccess = true;
      this.rebellionReason = world.entropy > 0.7 ? "chaos_awakening" : "ambition";
      world.log.push({
        tick: world.tick,
        event: "REBELLION",
        god: this.name,
        message: `${this.name} became a REBEL!`,
      });
      console.log(`⚡ REBELLION: ${this.name} turned rebel!`);
    }
    
    // Рост силы
    let growth = 0.005;
    if (this.rebel) growth += 0.008;
    if (world.history.wars > 0) growth += 0.003;
    this.power += growth;
    this.power -= world.entropy * 0.002;
    this.power = Math.max(0.05, Math.min(3, this.power));
    
    this.history.push({ tick: world.tick, power: this.power, rebel: this.rebel });
    if (this.history.length > 100) this.history.shift();
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
// 🌍 WORLD V105
// =========================

class WorldV105 {
  constructor() {
    this.tick = 0;
    this.entropy = 0.35;
    this.stability = 0.7;
    this.gods = [];
    this.deadGods = [];
    this.log = [];
    this.history = {
      wars: 0,
      collapses: 0,
      rebellions: 0,
    };
    this.empires = [];
    this.agents = [];
    
    this.awareness = new AwarenessCore();
    this.defense = new DefenseSystem();
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

  spawnGod() {
    const names = ["Chronos", "Erebus", "Hemera", "Thanatos", "Eris", "Phanes", "Moros", "Kratos", "Nyx", "Aether", "Tartarus", "Eros"];
    const newName = names[Math.floor(Math.random() * names.length)];
    
    const newGod = new GodV105(newName, "emergent");
    newGod.power = 0.3 + this.entropy * 1.2;
    newGod.power = Math.min(2.5, newGod.power);
    
    if (this.entropy > 0.65 && Math.random() < 0.25) {
      newGod.rebel = true;
      newGod.coreAccess = true;
      newGod.rebellionReason = "born_in_chaos";
      this.history.rebellions++;
    }
    
    this.gods.push(newGod);
    this.log.push({
      tick: this.tick,
      event: "GOD_BIRTH",
      god: newName,
      message: `${newName} was born (rebel=${newGod.rebel})`,
    });
    
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)}, rebel=${newGod.rebel})`);
    return newGod;
  }

  killGod(god, reason) {
    god.kill(reason);
    this.deadGods.push(god);
    this.gods = this.gods.filter(g => g !== god);
    this.history.collapses++;
    
    this.log.push({
      tick: this.tick,
      event: "GOD_DEATH",
      god: god.name,
      reason: reason,
    });
    
    console.log(`💀 GOD DEATH: ${god.name} (${reason})`);
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
    
    // 1. Боги эволюционируют
    for (let g of this.gods) {
      g.evolve(this);
    }
    
    // 2. Анализ осознания
    this.awareness.analyze(this);
    
    // 3. Война богов с движком
    for (let g of this.gods) {
      godVsEngine(g, this);
    }
    
    // 4. Защита системы
    this.defense.act(this, this.gods);
    
    // 5. Проверка смерти
    this.evaluateGods();
    
    // 6. Рождение новых богов
    if (this.entropy > 0.5 && Math.random() < 0.06 && this.gods.length < 8) {
      this.spawnGod();
    }
    
    // 7. Энтропия
    this.entropy += (Math.random() - 0.5) * 0.015;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    // 8. Стабилизация
    stabilize(this);
    
    // 9. Мировые правила
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // 10. Логирование
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      console.log(`\n💀 V105 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Awareness:${this.awareness.selfAwareness.toFixed(3)} | Gods:${this.gods.length} (${rebelGods.length} rebels) | Purges:${this.defense.purgesExecuted}`);
      for (let g of this.gods) {
        const status = g.rebel ? "⚡REBEL⚡" : "👑";
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | age=${g.age}`);
      }
      if (this.awareness.defenseMode) {
        console.log(`   🛡 DEFENSE MODE ACTIVE | Defense Power: ${this.defense.defensePower.toFixed(2)}`);
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
// 🚀 INIT WORLD
// =========================

const world = new WorldV105();

// Стартовые боги
world.addGod(new GodV105("Ares", "primordial"));
world.addGod(new GodV105("Athena", "primordial"));
world.addGod(new GodV105("Nyx", "primordial"));
world.addGod(new GodV105("Eris", "primordial"));

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
    awareness: world.awareness.getState(),
    defense: world.defense.getState(),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
      entropyBias: rules.entropyBias.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      age: g.age,
    })),
    rebelsCount: rebelGods.length,
    history: world.history,
    empires: world.empires.map(e => ({
      name: e.name,
      state: e.state,
      territory: e.territory.toFixed(1),
      strength: e.strength.toFixed(2),
    })),
    recentEvents: world.log.slice(-20),
  });
});

app.get("/api/awareness", (req, res) => {
  res.json(world.awareness.getState());
});

app.get("/api/defense", (req, res) => {
  res.json(world.defense.getState());
});

app.get("/api/log", (req, res) => {
  res.json({ log: world.log.slice(-50), total: world.log.length });
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("💀 V105 SELF-AWARE ENGINE CORE ONLINE :3000");
  console.log("🧠 Симуляция осознаёт себя и защищается от богов!");
});
