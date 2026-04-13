// =========================
// 💀 V99 — CIVILIZATION COLLAPSE ENGINE
// =========================

const express = require("express");
const app = express();

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

  update() {
    this.age++;
    
    // Динамика территории
    if (this.state === "rising") {
      this.territory += Math.random() * 1.5;
      this.cohesion += 0.01;
    } else if (this.state === "collapsing") {
      this.territory -= Math.random() * 2;
      this.cohesion -= 0.02;
    } else if (this.state === "stable") {
      this.territory += (Math.random() - 0.5) * 0.5;
    }
    
    // Давление войны растёт с размером
    this.warPressure += (this.territory / 100) * 0.02 + Math.random() * 0.03;
    
    // Проверка коллапса
    if (this.warPressure > this.cohesion && this.state !== "collapsing") {
      this.state = "collapsing";
      console.log(`💀 ${this.name} начинает коллапс!`);
    }
    
    if (this.state === "collapsing" && this.territory <= 10) {
      this.state = "dead";
      console.log(`🏛️ ${this.name} пала!`);
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
  // ⚔️ WAR ENGINE
  // =========================
  war(attacker, defender) {
    const powerA = attacker.strength + Math.random() * 0.3;
    const powerB = defender.strength + Math.random() * 0.3;
    
    const winner = powerA > powerB ? attacker : defender;
    const loser = winner === attacker ? defender : attacker;
    
    // Последствия войны
    winner.territory += 5;
    loser.territory -= 8;
    winner.strength += 0.05;
    loser.strength -= 0.07;
    winner.history.warsWon++;
    loser.history.warsLost++;
    
    // Влияние на агентов
    for (let a of loser.agents) {
      a.energy -= 0.2;
      a.emotion.fear += 0.1;
      if (Math.random() < 0.3 && a.loyalty === loser.id) {
        a.loyalty = winner.id;
        winner.agents.push(a);
        loser.agents = loser.agents.filter(ag => ag !== a);
      }
    }
    
    this.history.wars++;
    this.globalMemory.push({
      tick: this.tick,
      type: "war",
      winner: winner.name,
      loser: loser.name,
      territoryChange: 5,
    });
    
    console.log(`⚔️ ВОЙНА: ${winner.name} победил ${loser.name}!`);
    return { winner, loser };
  }

  // =========================
  // 💀 COLLAPSE ENGINE
  // =========================
  collapse(empire) {
    empire.state = "dead";
    this.history.collapses++;
    
    this.globalMemory.push({
      tick: this.tick,
      type: "collapse",
      empire: empire.name,
      territory: empire.territory,
    });
    
    console.log(`💀 ${empire.name} КОЛЛАПСИРОВАЛА! Остатки: ${empire.territory.toFixed(1)} территории`);
    
    // Миграция агентов
    const survivors = [];
    for (let a of empire.agents) {
      if (Math.random() < 0.7) {
        const targets = this.empires.filter(e => e !== empire && e.state !== "dead");
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          a.loyalty = target.id;
          target.agents.push(a);
          survivors.push(a.name);
        }
      }
    }
    
    empire.agents = [];
    if (survivors.length > 0) {
      console.log(`🌍 Миграция: ${survivors.join(", ")} перешли в другие империи`);
    }
  }

  // =========================
  // 🌱 EMPIRE RISE
  // =========================
  tryRise() {
    if (Math.random() < 0.05 && this.empires.length < 5) {
      const newId = `E${this.empires.length + 1}`;
      const names = ["Helios", "Nova", "Terra", "Aether", "Chronos"];
      const newName = names[Math.floor(Math.random() * names.length)];
      const newEmpire = new Empire(newId, newName, "neutral");
      this.addEmpire(newEmpire);
      
      // Создание агента для новой империи
      const newAgent = new Agent(`${newName.toLowerCase()}_leader`);
      this.addAgent(newAgent, newEmpire);
      
      console.log(`🌟 НОВАЯ ИМПЕРИЯ: ${newName} восстала!`);
    }
  }

  // =========================
  // 🔁 STEP LOOP
  // =========================
  step() {
    this.tick++;
    
    // Обновление империй
    for (let e of this.empires) {
      e.update();
      
      if (e.state === "collapsing" && e.territory <= 15) {
        this.collapse(e);
      }
    }
    
    // Удаление мёртвых империй
    this.empires = this.empires.filter(e => e.state !== "dead");
    
    // Войны между империями
    if (this.empires.length >= 2 && Math.random() < 0.25) {
      const a = this.empires[Math.floor(Math.random() * this.empires.length)];
      let b = this.empires[Math.floor(Math.random() * this.empires.length)];
      while (b === a) b = this.empires[Math.floor(Math.random() * this.empires.length)];
      this.war(a, b);
    }
    
    // Появление новых империй
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
    
    // Логирование
    if (this.tick % 20 === 0) {
      console.log(`\n💀 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Empires:${this.empires.length} | Wars:${this.history.wars} | Collapses:${this.history.collapses}`);
      for (let e of this.empires) {
        console.log(`   🏛️ ${e.name} | ${e.state} | Terr:${e.territory.toFixed(1)} | Coh:${e.cohesion.toFixed(2)} | Agents:${e.agents.length}`);
      }
      console.log("");
    }
  }
}

// =========================
// 🌍 INIT WORLD
// =========================
const world = new World();

const E1 = new Empire("E1", "Aurora", "harmony");
const E2 = new Empire("E2", "Obsidian", "dominion");
const E3 = new Empire("E3", "Helios", "balance");

world.addEmpire(E1);
world.addEmpire(E2);
world.addEmpire(E3);

// Агенты
world.addAgent(new Agent("codey"), E1);
world.addAgent(new Agent("uiax"), E1);
world.addAgent(new Agent("garlic"), E2);
world.addAgent(new Agent("neo"), E3);

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
      warPressure: e.warPressure.toFixed(2),
      age: e.age,
    })),
    history: world.history,
    agents: world.agents.map(a => ({
      name: a.name,
      fitness: a.fitness.toFixed(2),
      energy: a.energy.toFixed(2),
      loyalty: a.loyalty,
    })),
  });
});

app.get("/api/history", (req, res) => {
  res.json({ memory: world.globalMemory.slice(-50), total: world.globalMemory.length });
});

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("💀 V99 CIVILIZATION COLLAPSE ENGINE ONLINE :3000");
});
