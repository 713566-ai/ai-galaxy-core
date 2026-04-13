// =========================
// 👑 V101 — MULTI-GOD UNIVERSE CORE
// Конкурирующие боги, конфликт правил, аномалии
// =========================

const express = require("express");
const app = express();

// =========================
// 👑 GOD ENTITY
// =========================

class God {
  constructor(name, style) {
    this.name = name;
    this.style = style; // "war", "order", "chaos", "nature", "knowledge"
    this.power = 1;
    this.influence = 0;
    this.rules = this.generateRules();
    this.history = [];
  }

  generateRules() {
    const baseRules = {
      warChance: 0.3,
      collapseRate: 0.3,
      entropyBias: 0,
      expansionRate: 0.3,
      migrationRate: 0.2,
    };
    
    if (this.style === "war") {
      return { ...baseRules, warChance: 0.7, collapseRate: 0.4, entropyBias: 0.2, expansionRate: 0.5 };
    }
    if (this.style === "order") {
      return { ...baseRules, warChance: 0.15, collapseRate: 0.1, entropyBias: -0.2, expansionRate: 0.2 };
    }
    if (this.style === "chaos") {
      return { ...baseRules, warChance: 0.6, collapseRate: 0.6, entropyBias: 0.5, expansionRate: 0.4 };
    }
    if (this.style === "nature") {
      return { ...baseRules, warChance: 0.2, collapseRate: 0.15, entropyBias: -0.1, expansionRate: 0.35 };
    }
    // knowledge
    return { ...baseRules, warChance: 0.25, collapseRate: 0.2, entropyBias: -0.05, expansionRate: 0.45 };
  }

  mutate(worldScore) {
    const previousPower = this.power;
    this.power += worldScore * 0.02;
    this.power = Math.max(0.2, Math.min(5, this.power));
    
    // Дрейф правил
    for (let k in this.rules) {
      const drift = (Math.random() - 0.5) * 0.03;
      this.rules[k] += drift * (this.style === "chaos" ? 1.5 : 1);
      this.rules[k] = Math.max(0.05, Math.min(0.9, this.rules[k]));
    }
    
    this.history.push({ tick: worldScore, power: this.power });
    if (this.history.length > 50) this.history.shift();
    
    return { changed: previousPower !== this.power };
  }
}

// =========================
// 🌍 WORLD
// =========================

class World {
  constructor(gods) {
    this.tick = 0;
    this.entropy = 0.35;
    this.gods = gods;
    this.empires = [];
    this.agents = [];
    
    this.history = {
      wars: 0,
      collapses: 0,
      anomalies: 0,
      expansions: 0,
    };
    
    this.finalRules = {
      warChance: 0.3,
      collapseRate: 0.3,
      entropyBias: 0,
      expansionRate: 0.3,
      migrationRate: 0.2,
    };
    
    this.activeAnomaly = null;
  }

  // =========================
  // ⚖️ MERGE GOD RULES (конфликт законов)
  // =========================
  mergeRules() {
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
    
    this.finalRules = {
      warChance: war,
      collapseRate: collapse,
      entropyBias: entropy,
      expansionRate: expansion,
      migrationRate: migration,
    };
  }

  // =========================
  // 💥 CONFLICT & ANOMALIES
  // =========================
  resolveConflicts() {
    const warVsOrder = Math.abs(this.finalRules.warChance - this.finalRules.collapseRate);
    const chaosVsStability = Math.abs(this.finalRules.entropyBias);
    
    let anomalyTriggered = false;
    
    if (warVsOrder > 0.4 || chaosVsStability > 0.5) {
      this.history.anomalies++;
      anomalyTriggered = true;
      
      // Тип аномалии зависит от конфликта
      if (warVsOrder > chaosVsStability) {
        this.activeAnomaly = { type: "reality_fracture", intensity: warVsOrder };
        this.entropy += 0.08;
      } else {
        this.activeAnomaly = { type: "entropy_spike", intensity: chaosVsStability };
        this.entropy += 0.12;
      }
      
      // Влияние на империи
      for (let e of this.empires) {
        e.cohesion -= this.activeAnomaly.intensity * 0.1;
        e.cohesion = Math.max(0.1, e.cohesion);
      }
    } else {
      this.activeAnomaly = null;
    }
    
    return anomalyTriggered;
  }

  // =========================
  // 🏛️ EMPIRE MANAGEMENT
  // =========================
  addEmpire(empire) {
    this.empires.push(empire);
  }
  
  addAgent(agent, empire) {
    agent.loyalty = empire.id;
    empire.agents.push(agent);
    this.agents.push(agent);
  }
  
  updateEmpires() {
    for (let e of this.empires) {
      // Динамика территории
      e.territory += (Math.random() - 0.5) * this.finalRules.expansionRate;
      e.territory = Math.max(0, Math.min(150, e.territory));
      
      // Изменение cohesion
      e.cohesion += (Math.random() - 0.5) * 0.02;
      e.cohesion = Math.max(0.1, Math.min(1, e.cohesion));
      
      // Сила от агентов
      e.strength = e.agents.reduce((s, a) => s + a.fitness, 0) / Math.max(1, e.agents.length);
      e.strength = Math.min(1, e.strength);
      
      // Коллапс по правилам богов
      if (Math.random() < this.finalRules.collapseRate || e.cohesion < 0.2) {
        if (e.state !== "collapsing") {
          e.state = "collapsing";
          this.history.collapses++;
        }
      }
      
      if (e.state === "collapsing" && e.territory < 10) {
        e.state = "dead";
      }
    }
    
    // Удаление мёртвых империй
    const deadEmpires = this.empires.filter(e => e.state === "dead");
    for (let e of deadEmpires) {
      // Миграция агентов
      for (let a of e.agents) {
        if (Math.random() < this.finalRules.migrationRate) {
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
  // ⚔️ WARS
  // =========================
  simulateWars() {
    if (this.empires.length < 2) return;
    
    for (let i = 0; i < this.empires.length; i++) {
      if (Math.random() < this.finalRules.warChance) {
        const attacker = this.empires[i];
        let defender = this.empires[Math.floor(Math.random() * this.empires.length)];
        if (defender === attacker) continue;
        
        const powerA = attacker.strength + Math.random() * 0.3;
        const powerB = defender.strength + Math.random() * 0.3;
        
        const winner = powerA > powerB ? attacker : defender;
        const loser = winner === attacker ? defender : attacker;
        
        winner.territory += 3;
        loser.territory -= 5;
        this.history.wars++;
      }
    }
  }

  // =========================
  // 🔁 MAIN STEP
  // =========================
  step() {
    this.tick++;
    
    // Боги конкурируют за реальность
    this.mergeRules();
    this.resolveConflicts();
    
    // Мир живёт по смешанным правилам
    this.updateEmpires();
    this.simulateWars();
    
    // Энтропия
    this.entropy += this.finalRules.entropyBias * 0.015;
    this.entropy += (Math.random() - 0.5) * 0.01;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    // Боги эволюционируют на основе успеха мира
    const worldScore = 1 - this.entropy;
    for (let g of this.gods) {
      g.mutate(worldScore);
    }
    
    if (this.tick % 20 === 0) {
      console.log(`\n👑 V101 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Wars:${this.history.wars} | Collapses:${this.history.collapses} | Anomalies:${this.history.anomalies}`);
      console.log(`   Rules: war=${this.finalRules.warChance.toFixed(2)} collapse=${this.finalRules.collapseRate.toFixed(2)} entropyBias=${this.finalRules.entropyBias.toFixed(2)}`);
      for (let g of this.gods) {
        console.log(`   👑 ${g.name} (${g.style}) power=${g.power.toFixed(2)}`);
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
// 👑 INIT GODS
// =========================

const gods = [
  new God("Ares", "war"),
  new God("Athena", "order"),
  new God("Nyx", "chaos"),
  new God("Gaia", "nature"),
];

const world = new World(gods);

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
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    rules: world.finalRules,
    history: world.history,
    anomaly: world.activeAnomaly,
    empires: world.empires.map(e => ({
      name: e.name,
      state: e.state,
      strength: e.strength.toFixed(2),
      territory: e.territory.toFixed(1),
      agents: e.agents.length,
    })),
    gods: world.gods.map(g => ({
      name: g.name,
      style: g.style,
      power: g.power.toFixed(2),
    })),
  });
});

app.get("/api/gods", (req, res) => {
  res.json(world.gods.map(g => ({
    name: g.name,
    style: g.style,
    power: g.power.toFixed(2),
    rules: g.rules,
  })));
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("👑 V101 MULTI-GOD UNIVERSE CORE ONLINE :3000");
  console.log("🔥 Боги конкурируют за законы реальности!");
});
