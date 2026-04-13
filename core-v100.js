// =========================
// 👑 V100 — META GOD CORE
// Self-Writing Civilization Engine
// =========================

const express = require("express");
const app = express();

// =========================
// 👑 GOD CORE (редактор реальности)
// =========================

class GodCore {
  constructor(world) {
    this.world = world;
    this.rules = [
      { id: "warIntensity", value: 0.3, min: 0.1, max: 0.8 },
      { id: "collapseThreshold", value: 0.5, min: 0.2, max: 0.9 },
      { id: "migrationRate", value: 0.2, min: 0.1, max: 0.5 },
      { id: "expansionRate", value: 0.4, min: 0.2, max: 0.7 },
      { id: "cohesionDecay", value: 0.05, min: 0.01, max: 0.15 },
    ];
    this.mutations = 0;
    this.godAwareness = 0;
    this.decrees = [];
  }

  // =========================
  // 🧬 ANALYZE WORLD
  // =========================
  analyze() {
    const w = this.world;
    const instability = w.history.wars * 0.015 + w.history.collapses * 0.03 + w.entropy;
    const prosperity = w.empires.reduce((s, e) => s + e.strength, 0) / Math.max(1, w.empires.length);
    
    this.godAwareness = Math.min(1, instability * 0.8 + (1 - prosperity) * 0.5);
    
    return { instability, prosperity, godAwareness: this.godAwareness };
  }

  // =========================
  // 💀 MUTATE RULES
  // =========================
  mutate() {
    const { instability, prosperity } = this.analyze();
    
    // Хаотичный мир → снижаем интенсивность войн
    if (instability > 1.2) {
      const rule = this.rules.find(r => r.id === "warIntensity");
      rule.value *= 0.92;
      this.decrees.push({ tick: this.world.tick, type: "pacify", rule: "warIntensity", value: rule.value });
    }
    
    // Слишком стабильный мир → добавляем хаоса
    if (instability < 0.5 && prosperity > 0.6) {
      const rule = this.rules.find(r => r.id === "warIntensity");
      rule.value *= 1.08;
      this.decrees.push({ tick: this.world.tick, type: "chaos", rule: "warIntensity", value: rule.value });
    }
    
    // Эволюция порога коллапса
    const collapseRule = this.rules.find(r => r.id === "collapseThreshold");
    const oldValue = collapseRule.value;
    collapseRule.value += (Math.random() - 0.5) * 0.04;
    collapseRule.value = Math.max(collapseRule.min, Math.min(collapseRule.max, collapseRule.value));
    
    if (Math.abs(oldValue - collapseRule.value) > 0.03) {
      this.decrees.push({ tick: this.world.tick, type: "adjust", rule: "collapseThreshold", old: oldValue, new: collapseRule.value });
    }
    
    // Мутация скорости распада cohesion
    const cohesionRule = this.rules.find(r => r.id === "cohesionDecay");
    cohesionRule.value += (Math.random() - 0.5) * 0.01;
    cohesionRule.value = Math.max(cohesionRule.min, Math.min(cohesionRule.max, cohesionRule.value));
    
    this.mutations++;
  }

  // =========================
  // ⚙️ APPLY RULES TO WORLD
  // =========================
  apply(world) {
    world.warChance = this.rules.find(r => r.id === "warIntensity").value;
    world.collapseThreshold = this.rules.find(r => r.id === "collapseThreshold").value;
    world.migrationRate = this.rules.find(r => r.id === "migrationRate").value;
    world.expansionRate = this.rules.find(r => r.id === "expansionRate").value;
    world.cohesionDecay = this.rules.find(r => r.id === "cohesionDecay").value;
  }
  
  getState() {
    return {
      rules: this.rules,
      mutations: this.mutations,
      godAwareness: this.godAwareness.toFixed(3),
      recentDecrees: this.decrees.slice(-10),
    };
  }
}

// =========================
// 🏛️ EMPIRE
// =========================

class Empire {
  constructor(id, name, ideology = "neutral") {
    this.id = id;
    this.name = name;
    this.ideology = ideology;
    this.strength = Math.random() * 0.6 + 0.4;
    this.territory = Math.random() * 50 + 20;
    this.cohesion = Math.random() * 0.5 + 0.3;
    this.warPressure = Math.random() * 0.2;
    this.state = "rising";
    this.agents = [];
    this.age = 0;
    this.history = { warsWon: 0, warsLost: 0, expansions: 0 };
  }

  update(worldRules) {
    this.age++;
    
    // Динамика территории с учётом правил мира
    if (this.state === "rising") {
      this.territory += Math.random() * worldRules.expansionRate;
      this.cohesion += 0.01;
    } else if (this.state === "collapsing") {
      this.territory -= Math.random() * 2;
      this.cohesion -= worldRules.cohesionDecay;
    } else if (this.state === "stable") {
      this.territory += (Math.random() - 0.5) * worldRules.expansionRate;
    }
    
    // Давление войны
    this.warPressure += (this.territory / 100) * 0.02 + Math.random() * 0.03;
    
    // Проверка коллапса по правилам мира
    if (this.warPressure > this.cohesion * (1 + worldRules.collapseThreshold) && this.state !== "collapsing") {
      this.state = "collapsing";
    }
    
    if (this.state === "collapsing" && this.territory <= 10) {
      this.state = "dead";
    }
    
    // Сила от агентов
    this.strength = this.agents.reduce((s, a) => s + a.fitness, 0) / Math.max(1, this.agents.length);
    this.strength = Math.min(1, this.strength);
    
    // Ограничения
    this.territory = Math.max(0, Math.min(200, this.territory));
    this.cohesion = Math.max(0.1, Math.min(1, this.cohesion));
  }
}

class Agent {
  constructor(name) {
    this.name = name;
    this.fitness = Math.random() * 0.5 + 0.3;
    this.energy = 1;
    this.loyalty = null;
    this.memory = [];
    this.emotion = { fear: 0.1, greed: 0.3, trust: 0.5, revenge: 0 };
  }
}

// =========================
// 🌍 WORLD
// =========================

class World {
  constructor() {
    this.tick = 0;
    this.entropy = 0.3;
    this.empires = [];
    this.agents = [];
    this.history = {
      wars: 0,
      collapses: 0,
      expansions: 0,
      empireRises: 0,
    };
    this.globalMemory = [];
    
    // Правила (будут переопределены GodCore)
    this.warChance = 0.3;
    this.collapseThreshold = 0.5;
    this.migrationRate = 0.2;
    this.expansionRate = 0.4;
    this.cohesionDecay = 0.05;
  }

  addEmpire(e) {
    this.empires.push(e);
    this.history.empireRises++;
  }

  addAgent(a, empire) {
    a.loyalty = empire.id;
    empire.agents.push(a);
    this.agents.push(a);
  }

  // =========================
  // ⚔️ WAR ENGINE (использует правила бога)
  // =========================
  war(attacker, defender) {
    const powerA = attacker.strength + Math.random() * 0.3;
    const powerB = defender.strength + Math.random() * 0.3;
    
    const winner = powerA > powerB ? attacker : defender;
    const loser = winner === attacker ? defender : attacker;
    
    winner.territory += 5;
    loser.territory -= 8;
    winner.strength += 0.05;
    loser.strength -= 0.07;
    
    // Миграция агентов по правилам
    for (let a of loser.agents) {
      a.energy -= 0.2;
      if (Math.random() < this.migrationRate && a.loyalty === loser.id) {
        a.loyalty = winner.id;
        winner.agents.push(a);
        loser.agents = loser.agents.filter(ag => ag !== a);
      }
    }
    
    this.history.wars++;
    return { winner, loser };
  }

  // =========================
  // 💀 COLLAPSE
  // =========================
  collapse(empire) {
    empire.state = "dead";
    this.history.collapses++;
    
    // Миграция выживших
    for (let a of empire.agents) {
      if (Math.random() < this.migrationRate) {
        const targets = this.empires.filter(e => e !== empire && e.state !== "dead");
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          a.loyalty = target.id;
          target.agents.push(a);
        }
      }
    }
    empire.agents = [];
  }

  // =========================
  // 🌱 EMPIRE RISE
  // =========================
  tryRise() {
    if (Math.random() < 0.05 && this.empires.length < 6) {
      const names = ["Helios", "Nova", "Terra", "Aether", "Chronos", "Elysium"];
      const newName = names[Math.floor(Math.random() * names.length)];
      const newEmpire = new Empire(`E${this.empires.length + 1}`, newName);
      this.addEmpire(newEmpire);
      
      const newAgent = new Agent(`${newName.toLowerCase()}_leader`);
      this.addAgent(newAgent, newEmpire);
    }
  }

  // =========================
  // 🔁 STEP LOOP
  // =========================
  step() {
    this.tick++;
    
    // Обновление империй с правилами бога
    for (let e of this.empires) {
      e.update({
        expansionRate: this.expansionRate,
        cohesionDecay: this.cohesionDecay,
        collapseThreshold: this.collapseThreshold,
      });
      
      if (e.state === "collapsing" && e.territory <= 15) {
        this.collapse(e);
      }
    }
    
    // Удаление мёртвых
    this.empires = this.empires.filter(e => e.state !== "dead");
    
    // Войны
    if (this.empires.length >= 2 && Math.random() < this.warChance) {
      const a = this.empires[Math.floor(Math.random() * this.empires.length)];
      let b = this.empires[Math.floor(Math.random() * this.empires.length)];
      while (b === a) b = this.empires[Math.floor(Math.random() * this.empires.length)];
      this.war(a, b);
    }
    
    this.tryRise();
    
    // Эволюция агентов
    for (let a of this.agents) {
      a.energy += 0.02;
      a.energy = Math.min(1, a.energy);
      a.fitness += (Math.random() - 0.5) * 0.02;
      a.fitness = Math.max(0.1, Math.min(0.95, a.fitness));
    }
    
    // Энтропия
    this.entropy += (Math.random() - 0.5) * 0.01;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    if (this.tick % 20 === 0) {
      console.log(`\n👑 V100 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Empires:${this.empires.length} | Wars:${this.history.wars} | Collapses:${this.history.collapses}`);
      for (let e of this.empires) {
        console.log(`   🏛️ ${e.name} | ${e.state} | Terr:${e.territory.toFixed(1)} | Coh:${e.cohesion.toFixed(2)} | Agents:${e.agents.length}`);
      }
      console.log("");
    }
  }
}

// =========================
// 🚀 INIT
// =========================

const world = new World();
const god = new GodCore(world);

// Империи
const E1 = new Empire("E1", "Aurora", "harmony");
const E2 = new Empire("E2", "Obsidian", "dominion");
world.addEmpire(E1);
world.addEmpire(E2);

// Агенты
world.addAgent(new Agent("codey"), E1);
world.addAgent(new Agent("uiax"), E1);
world.addAgent(new Agent("garlic"), E2);

// Применяем начальные правила
god.apply(world);

// =========================
// 🚀 API
// =========================

app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    empires: world.empires.map(e => ({
      name: e.name,
      state: e.state,
      strength: e.strength.toFixed(2),
      territory: e.territory.toFixed(1),
      cohesion: e.cohesion.toFixed(2),
      agents: e.agents.length,
    })),
    history: world.history,
    god: god.getState(),
    activeRules: {
      warChance: world.warChance.toFixed(3),
      collapseThreshold: world.collapseThreshold.toFixed(3),
      migrationRate: world.migrationRate.toFixed(3),
    },
  });
});

app.get("/api/god", (req, res) => {
  res.json(god.getState());
});

app.get("/api/history", (req, res) => {
  res.json({ memory: world.globalMemory.slice(-50), total: world.globalMemory.length });
});

// =========================
// 🔁 SIMULATION LOOP
// =========================

setInterval(() => {
  world.step();
  
  // GOD МЕНЯЕТ ПРАВИЛА (каждые 10 тиков)
  if (world.tick % 10 === 0 && world.tick > 0) {
    god.mutate();
    god.apply(world);
  }
  
  if (world.tick % 50 === 0) {
    console.log(`👑 GOD AWARENESS: ${god.godAwareness.toFixed(3)} | Mutations: ${god.mutations}`);
  }
  
}, 1000);

app.listen(3000, () => {
  console.log("👑 V100 META GOD CORE ONLINE :3000");
  console.log("🔥 Система может переписывать свои собственные правила!");
});
