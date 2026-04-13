// =========================
// 💀 V102 — GOD DEATH + GOD BIRTH CORE
// Смерть богов и рождение новых из энтропии
// =========================

const express = require("express");
const app = express();

// =========================
// 👑 GOD ENTITY
// =========================

class God {
  constructor(name, origin = "spawned") {
    this.id = `GOD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.name = name;
    this.power = 1;
    this.age = 0;
    this.alive = true;
    this.origin = origin;
    this.influence = 0;
    this.deathCause = null;

    this.rules = {
      warChance: Math.random() * 0.6 + 0.2,
      collapseRate: Math.random() * 0.5 + 0.1,
      entropyBias: (Math.random() - 0.5) * 0.6,
      expansionRate: Math.random() * 0.5 + 0.2,
      migrationRate: Math.random() * 0.3 + 0.1,
    };
    
    this.history = [];
  }

  mutate(entropy, tick) {
    if (!this.alive) return;

    this.age++;
    
    // Деградация при высокой энтропии
    this.power -= entropy * 0.003;
    
    // Случайная эволюция правил
    for (let k in this.rules) {
      const drift = (Math.random() - 0.5) * entropy * 0.08;
      this.rules[k] += drift;
      this.rules[k] = Math.max(0.05, Math.min(0.95, this.rules[k]));
    }
    
    // Запись истории
    this.history.push({ tick, power: this.power, entropy });
    if (this.history.length > 100) this.history.shift();
    
    this.power = Math.max(0, Math.min(10, this.power));
  }

  isDead() {
    return this.power <= 0.05 || this.age > 3000;
  }
  
  kill(reason) {
    this.alive = false;
    this.deathCause = reason;
  }
}

// =========================
// 🌌 WORLD CORE
// =========================

class World {
  constructor() {
    this.tick = 0;
    this.entropy = 0.35;
    this.gods = [];
    this.deadGods = [];
    this.empires = [];
    this.agents = [];
    
    this.history = {
      births: 0,
      deaths: 0,
      anomalies: 0,
      powerShifts: 0,
    };
    
    this.activeAnomaly = null;
  }

  // =========================
  // 📊 ADD EMPIRE & AGENTS
  // =========================
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
  killGod(god, reason = "power_decay") {
    god.kill(reason);
    this.deadGods.push(god);
    this.gods = this.gods.filter(g => g !== god);
    this.history.deaths++;
    
    // Смерть бога вызывает хаос
    this.entropy += 0.12;
    this.entropy = Math.min(0.95, this.entropy);
    
    console.log(`💀 GOD DEATH: ${god.name} (${reason}) after ${god.age} ticks | Entropy +0.12`);
    return god;
  }

  // =========================
  // 🌱 GOD BIRTH
  // =========================
  spawnGod() {
    const names = ["Chronos", "Erebus", "Hemera", "Thanatos", "Eris", "Phanes", "Ananke", "Moros"];
    const newName = names[Math.floor(Math.random() * names.length)];
    
    const newGod = new God(newName, "emergent");
    
    // Новый бог наследует хаос мира
    newGod.power = 0.3 + this.entropy * 1.5;
    newGod.power = Math.min(3, newGod.power);
    
    // Новый бог имеет правила, отражающие текущее состояние
    newGod.rules.warChance = 0.3 + this.entropy * 0.5;
    newGod.rules.collapseRate = 0.2 + this.entropy * 0.4;
    newGod.rules.entropyBias = (this.entropy - 0.5) * 0.8;
    
    this.gods.push(newGod);
    this.history.births++;
    
    console.log(`🌱 GOD BIRTH: ${newGod.name} (power=${newGod.power.toFixed(2)}) from entropy ${this.entropy.toFixed(3)}`);
    return newGod;
  }

  // =========================
  // ⚖️ CHECK GOD STATUS
  // =========================
  evaluateGods() {
    const deadGods = [];
    
    for (let g of [...this.gods]) {
      let reason = null;
      if (g.power <= 0.05) reason = "power_collapse";
      else if (g.age > 2000) reason = "ancient_decay";
      else if (g.power < 0.1 && this.entropy > 0.7) reason = "entropy_overwhelm";
      
      if (reason) {
        this.killGod(g, reason);
      }
    }
    
    return deadGods.length;
  }

  // =========================
  // ⚖️ MERGE GOD RULES
  // =========================
  mergeRules() {
    if (this.gods.length === 0) {
      // Без богов — чистый хаос
      return {
        warChance: 0.5,
        collapseRate: 0.5,
        entropyBias: 0.3,
        expansionRate: 0.4,
        migrationRate: 0.3,
      };
    }
    
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0);
    if (totalPower === 0) totalPower = 1;
    
    let war = 0, collapse = 0, entropy = 0, expansion = 0, migration = 0;
    
    for (let g of this.gods) {
      const weight = g.power / totalPower;
      war += g.rules.warChance * weight;
      collapse += g.rules.collapseRate * weight;
      entropy += g.rules.entropyBias * weight;
      expansion += g.rules.expansionRate * weight;
      migration += g.rules.migrationRate * weight;
    }
    
    return { warChance: war, collapseRate: collapse, entropyBias: entropy, expansionRate: expansion, migrationRate: migration };
  }

  // =========================
  // 💥 CONFLICT & ANOMALIES
  // =========================
  resolveConflicts(rules) {
    const conflictLevel = Math.abs(rules.warChance - rules.collapseRate) + Math.abs(rules.entropyBias);
    
    if (conflictLevel > 0.6) {
      this.history.anomalies++;
      this.activeAnomaly = { type: "divine_conflict", intensity: conflictLevel, tick: this.tick };
      this.entropy += 0.05;
      return true;
    }
    
    this.activeAnomaly = null;
    return false;
  }

  // =========================
  // 🏛️ UPDATE EMPIRES
  // =========================
  updateEmpires(rules) {
    for (let e of this.empires) {
      // Территория
      e.territory += (Math.random() - 0.5) * rules.expansionRate;
      e.territory = Math.max(5, Math.min(120, e.territory));
      
      // Cohesion
      e.cohesion += (Math.random() - 0.5) * 0.02;
      e.cohesion = Math.max(0.1, Math.min(1, e.cohesion));
      
      // Strength от агентов
      e.strength = e.agents.reduce((s, a) => s + a.fitness, 0) / Math.max(1, e.agents.length);
      e.strength = Math.min(1, e.strength);
      
      // Коллапс
      if (Math.random() < rules.collapseRate || e.cohesion < 0.2) {
        if (e.state !== "collapsing") {
          e.state = "collapsing";
        }
      }
      
      if (e.state === "collapsing" && e.territory < 10) {
        e.state = "dead";
      }
    }
    
    // Удаление мёртвых
    const deadEmpires = this.empires.filter(e => e.state === "dead");
    for (let e of deadEmpires) {
      for (let a of e.agents) {
        if (Math.random() < rules.migrationRate) {
          const targets = this.empires.filter(t => t !== e && t.state !== "dead");
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            a.loyalty = target.id;
            target.agents.push(a);
          }
        }
      }
    }
    
    this.empires = this.empires.filter(e => e.state !== "dead");
  }

  // =========================
  // ⚔️ SIMULATE WARS
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
        
        winner.territory += 3;
        loser.territory -= 5;
        this.history.wars = (this.history.wars || 0) + 1;
      }
    }
  }

  // =========================
  // 🔁 MAIN STEP
  // =========================
  step() {
    this.tick++;
    
    // Боги эволюционируют
    for (let g of this.gods) {
      g.mutate(this.entropy, this.tick);
    }
    
    // Проверка смерти
    this.evaluateGods();
    
    // Рождение новых богов из энтропии
    if (this.entropy > 0.6 && Math.random() < 0.08 && this.gods.length < 6) {
      this.spawnGod();
    }
    
    // Эволюция энтропии
    const avgGodPower = this.gods.reduce((s, g) => s + g.power, 0) / Math.max(1, this.gods.length);
    this.entropy += (Math.random() - 0.5) * 0.02;
    if (this.gods.length === 0) this.entropy += 0.03;
    if (avgGodPower > 2) this.entropy -= 0.01;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    // Смешивание правил богов
    const rules = this.mergeRules();
    
    // Конфликты и аномалии
    this.resolveConflicts(rules);
    
    // Обновление мира
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    if (this.tick % 20 === 0) {
      console.log(`\n💀 V102 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Gods:${this.gods.length} | Births:${this.history.births} | Deaths:${this.history.deaths} | Anomalies:${this.history.anomalies}`);
      for (let g of this.gods) {
        console.log(`   👑 ${g.name} | power=${g.power.toFixed(2)} | age=${g.age} | origin=${g.origin}`);
      }
      if (this.activeAnomaly) {
        console.log(`   💥 ANOMALY: ${this.activeAnomaly.type} intensity=${this.activeAnomaly.intensity.toFixed(2)}`);
      }
      console.log("");
    }
  }
}

// =========================
// 🏛️ EMPIRE CLASS
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

const world = new World();

// Стартовые боги
world.gods.push(new God("Ares", "primordial"));
world.gods.push(new God("Athena", "primordial"));
world.gods.push(new God("Nyx", "primordial"));

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
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
      entropyBias: rules.entropyBias.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      age: g.age,
      origin: g.origin,
      alive: g.alive,
    })),
    deadGodsCount: world.deadGods.length,
    history: world.history,
    anomaly: world.activeAnomaly,
    empires: world.empires.map(e => ({
      name: e.name,
      state: e.state,
      territory: e.territory.toFixed(1),
      strength: e.strength.toFixed(2),
      agents: e.agents.length,
    })),
  });
});

app.get("/api/gods", (req, res) => {
  res.json({
    alive: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      age: g.age,
      rules: g.rules,
    })),
    dead: world.deadGods.slice(-10).map(g => ({
      name: g.name,
      deathCause: g.deathCause,
      age: g.age,
    })),
  });
});

app.get("/api/history", (req, res) => {
  res.json(world.history);
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("💀 V102 GOD DEATH + GOD BIRTH CORE ONLINE :3000");
  console.log("🔥 Боги умирают, новые рождаются из хаоса!");
});
