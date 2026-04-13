// =========================
// 💀 V103 — GOD REBELLION CORE
// Боги, которые сопротивляются правилам мира
// =========================

const express = require("express");
const app = express();

// =========================
// 👑 GOD ENTITY WITH REBELLION
// =========================

class God {
  constructor(name, origin = "primordial") {
    this.id = `GOD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.name = name;
    this.power = 0.5 + Math.random() * 0.5;
    this.energy = 1;
    this.alive = true;
    this.age = 0;
    this.origin = origin;
    
    // Rebellion stats
    this.rebel = false;
    this.ruleBend = 0;
    this.rebellionReason = null;
    this.corruption = 0;
    
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
    
    // Шанс стать бунтарём
    if (!this.rebel && this.age > 30 && world.entropy > 0.5 && Math.random() < 0.03) {
      this.rebel = true;
      this.rebellionReason = world.entropy > 0.7 ? "chaos_corruption" : "power_thirst";
      console.log(`⚡ REBELLION: ${this.name} has turned REBEL! (${this.rebellionReason})`);
    }
    
    // Рост силы через конфликт
    if (world.history.wars > 0) {
      this.power += 0.008;
    }
    
    // Бунтари растут быстрее
    if (this.rebel) {
      this.power += 0.005;
      this.corruption += 0.01;
    }
    
    // Деградация от энтропии
    this.power -= world.entropy * 0.003;
    this.power = Math.max(0.05, Math.min(3, this.power));
    
    // Запись истории
    this.history.push({ tick: world.tick, power: this.power, rebel: this.rebel });
    if (this.history.length > 100) this.history.shift();
  }

  overrideRules(world) {
    if (!this.rebel || !this.alive) return;
    
    // REBEL GOD ломает правила мира
    this.ruleBend += 0.005;
    
    // Разные эффекты в зависимости от типа бунта
    if (Math.random() < 0.08) {
      world.entropy += 0.03;
      world.anomalies.push({
        tick: world.tick,
        type: "rebel_entropy_spike",
        god: this.name,
      });
    }
    
    if (Math.random() < 0.05) {
      world.rulesChaos += 0.05;
      world.anomalies.push({
        tick: world.tick,
        type: "rebel_rule_break",
        god: this.name,
      });
    }
    
    // Бунтарь может временно игнорировать смерть
    if (this.power < 0.1 && Math.random() < 0.3) {
      this.power = 0.2;
      world.anomalies.push({
        tick: world.tick,
        type: "rebel_undying",
        god: this.name,
      });
    }
    
    this.ruleBend = Math.min(1, this.ruleBend);
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
// 🌍 WORLD V103
// =========================

class WorldV103 {
  constructor() {
    this.tick = 0;
    this.entropy = 0.35;
    this.stability = 0.7;
    this.rulesChaos = 0.2;
    this.gods = [];
    this.deadGods = [];
    this.anomalies = [];
    this.history = {
      wars: 0,
      collapses: 0,
      rebellions: 0,
      anomalies: 0,
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

  // =========================
  // ☠️ GOD DEATH
  // =========================
  killGod(god, reason) {
    god.kill(reason);
    this.deadGods.push(god);
    this.gods = this.gods.filter(g => g !== god);
    this.history.collapses++;
    
    // Смерть бунтаря вызывает больший хаос
    const chaosAmount = god.rebel ? 0.15 : 0.08;
    this.entropy += chaosAmount;
    this.entropy = Math.min(0.95, this.entropy);
    
    console.log(`💀 GOD DEATH: ${god.name} (${reason}) | Rebel:${god.rebel} | Chaos +${chaosAmount}`);
    return god;
  }

  // =========================
  // 🌱 GOD BIRTH
  // =========================
  spawnGod() {
    const names = ["Chronos", "Erebus", "Hemera", "Thanatos", "Eris", "Phanes", "Moros", "Kratos", "Bia", "Zelus"];
    const newName = names[Math.floor(Math.random() * names.length)];
    
    const newGod = new God(newName, "emergent");
    newGod.power = 0.3 + this.entropy * 1.2;
    newGod.power = Math.min(2.5, newGod.power);
    
    // Шанс, что новый бог родится бунтарём
    if (this.entropy > 0.7 && Math.random() < 0.3) {
      newGod.rebel = true;
      newGod.rebellionReason = "born_in_chaos";
      this.history.rebellions++;
    }
    
    this.gods.push(newGod);
    this.history.wars++;
    
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)}, rebel=${newGod.rebel})`);
    return newGod;
  }

  // =========================
  // ⚖️ CHECK GOD STATUS
  // =========================
  evaluateGods() {
    for (let g of [...this.gods]) {
      if (g.isDead()) {
        this.killGod(g, g.rebel ? "rebel_power_collapse" : "natural_decay");
      }
    }
  }

  // =========================
  // ⚖️ MERGE GOD RULES (с учётом бунтарей)
  // =========================
  mergeRules() {
    if (this.gods.length === 0) {
      return { warChance: 0.5, collapseRate: 0.5, entropyBias: 0.3 };
    }
    
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0);
    if (totalPower === 0) totalPower = 1;
    
    let war = 0, collapse = 0, entropy = 0;
    
    for (let g of this.gods) {
      let weight = g.power / totalPower;
      // Бунтари имеют больший вес в правилах
      if (g.rebel) weight *= (1 + g.ruleBend);
      
      war += g.rules.warChance * weight;
      collapse += g.rules.collapseRate * weight;
      entropy += g.rules.entropyBias * weight;
    }
    
    // Добавляем хаос от правил
    war += this.rulesChaos * 0.1;
    collapse += this.rulesChaos * 0.1;
    
    return {
      warChance: Math.min(0.9, war),
      collapseRate: Math.min(0.9, collapse),
      entropyBias: entropy,
    };
  }

  // =========================
  // 🏛️ UPDATE EMPIRES
  // =========================
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

  // =========================
  // ⚔️ WARS
  // =========================
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

  // =========================
  // 🔁 MAIN STEP
  // =========================
  step() {
    this.tick++;
    
    // Боги эволюционируют и бунтуют
    for (let g of this.gods) {
      g.evolve(this);
      g.overrideRules(this);
    }
    
    // Проверка смерти
    this.evaluateGods();
    
    // Рождение новых богов
    if (this.entropy > 0.55 && Math.random() < 0.06 && this.gods.length < 7) {
      this.spawnGod();
    }
    
    // Энтропия
    const rebelCount = this.gods.filter(g => g.rebel).length;
    this.entropy += (Math.random() - 0.5) * 0.015;
    this.entropy += rebelCount * 0.005;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    // Стабильность
    this.stability = 1 - this.entropy * 0.7;
    this.stability = Math.max(0.1, Math.min(0.9, this.stability));
    
    // Правила
    const rules = this.mergeRules();
    
    // Обновление мира
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // Аномалии от бунтарей
    const newAnomalies = this.anomalies.filter(a => a.tick > this.tick - 10);
    this.history.anomalies = this.anomalies.length;
    
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      console.log(`\n⚡ V103 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Stability:${this.stability.toFixed(3)} | Gods:${this.gods.length} (${rebelGods.length} rebels) | Wars:${this.history.wars}`);
      for (let g of this.gods) {
        const status = g.rebel ? `⚡REBEL⚡` : `👑`;
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | age=${g.age} | bend=${g.ruleBend.toFixed(2)}`);
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

const world = new WorldV103();

// Стартовые боги (один может быть бунтарём)
world.addGod(new God("Ares", "primordial"));
world.addGod(new God("Athena", "primordial"));
world.addGod(new God("Nyx", "primordial"));
world.addGod(new God("Eris", "primordial")); // Eris — богиня раздора, может взбунтоваться

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
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
      entropyBias: rules.entropyBias.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      ruleBend: g.ruleBend.toFixed(3),
      age: g.age,
      alive: g.alive,
    })),
    rebelsCount: rebelGods.length,
    history: {
      wars: world.history.wars,
      rebellions: world.history.rebellions,
      anomalies: world.anomalies.length,
    },
    empires: world.empires.map(e => ({
      name: e.name,
      state: e.state,
      territory: e.territory.toFixed(1),
      strength: e.strength.toFixed(2),
    })),
  });
});

app.get("/api/rebel", (req, res) => {
  const rebelGods = world.gods.filter(g => g.rebel);
  res.json({
    rebels: rebelGods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      ruleBend: g.ruleBend.toFixed(3),
      rebellionReason: g.rebellionReason,
      corruption: g.corruption.toFixed(3),
    })),
    anomalies: world.anomalies.slice(-20),
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
  console.log("⚡ V103 GOD REBELLION CORE ONLINE :3000");
  console.log("🔥 Некоторые боги могут восстать против правил!");
});
