// =========================
// 🔮💀 V107 — PREDICTIVE CHAOS IMMUNITY CORE (FINAL BUILD)
// Предсказание внутри хаоса, который сам себя ломает
// =========================

const express = require("express");
const app = express();

// =========================
// 🧠 FUTURE SIMULATION ENGINE
// =========================

class FutureEngine {
  constructor() {
    this.timeline = [];
    this.accuracyHistory = [];
  }

  simulate(world, god) {
    let risk = 0;
    
    // Базовые факторы будущего
    if (god.rebel) risk += 0.4;
    if (god.corrupted) risk += 0.3;
    if (god.power > 1.2) risk += 0.25;
    if (world.entropy > 0.65) risk += 0.2;
    if (god.fear > 0.7) risk -= 0.2;
    if (god.rage > 0.6) risk += 0.15;
    
    // Хаотический шум (ВАЖНО — непредсказуемость)
    const chaosNoise = (Math.random() - 0.5) * 0.4;
    risk += chaosNoise;
    
    // История предсказаний
    const pastPredictions = this.timeline.filter(p => p.god === god.name).slice(-10);
    const avgPastRisk = pastPredictions.reduce((s, p) => s + p.risk, 0) / (pastPredictions.length || 1);
    risk = risk * 0.7 + avgPastRisk * 0.3;
    
    risk = Math.max(0, Math.min(1, risk));
    
    const prediction = {
      god: god.name,
      risk: risk.toFixed(3),
      rawRisk: risk,
      predicted: risk > 0.55,
      timestamp: world.tick,
      chaosNoise: chaosNoise.toFixed(3),
    };
    
    this.timeline.push(prediction);
    if (this.timeline.length > 500) this.timeline.shift();
    
    return prediction;
  }
  
  getAccuracy() {
    if (this.timeline.length < 20) return 0.5;
    const recent = this.timeline.slice(-50);
    // Симуляция точности (чем выше хаос, тем ниже точность)
    const avgRisk = recent.reduce((s, p) => s + p.rawRisk, 0) / recent.length;
    return Math.max(0.3, Math.min(0.85, 0.7 - avgRisk * 0.3));
  }
  
  getState() {
    return {
      predictionsCount: this.timeline.length,
      accuracy: this.getAccuracy().toFixed(3),
      recentPredictions: this.timeline.slice(-10),
    };
  }
}

// =========================
// 🛡 PRE-IMMUNE INTERVENTION
// =========================

class PreImmune {
  constructor() {
    this.interventions = [];
    this.suppressionPower = 0.88;
  }

  act(world, prediction, god) {
    if (!prediction.predicted) return false;
    
    // Блокировка эволюции бога
    const oldPower = god.power;
    god.power *= this.suppressionPower;
    god.power = Math.max(0.1, god.power);
    
    // Подавление бунта
    const wasRebel = god.rebel;
    god.rebel = false;
    god.corrupted = false;
    god.fear += 0.1;
    
    // Цена вмешательства
    world.entropy += 0.015;
    world.stability -= 0.01;
    
    world.history.interventions = (world.history.interventions || 0) + 1;
    
    this.interventions.push({
      tick: world.tick,
      god: god.name,
      risk: prediction.risk,
      powerReduction: (oldPower - god.power).toFixed(3),
      wasRebel,
    });
    
    if (this.interventions.length > 100) this.interventions.shift();
    
    world.log.push({
      tick: world.tick,
      event: "PRE_IMMUNE",
      god: god.name,
      risk: prediction.risk,
      message: `${god.name} suppressed (risk=${prediction.risk})`,
    });
    
    console.log(`🛡 PRE-IMMUNE: ${god.name} suppressed (risk=${prediction.risk}, power ${oldPower.toFixed(2)}→${god.power.toFixed(2)})`);
    
    return true;
  }
  
  getState() {
    return {
      interventionsCount: this.interventions.length,
      suppressionPower: this.suppressionPower,
      recentInterventions: this.interventions.slice(-10),
    };
  }
}

// =========================
// 🧬 CHAOS FEEDBACK LOOP
// =========================

function chaosLoop(world) {
  let chaosGenerated = 0;
  
  for (let g of world.gods) {
    // Естественный рост
    g.power += 0.008;
    if (g.rebel) g.power += 0.01;
    if (g.rage > 0.5) g.power += 0.008;
    
    // Случайный бунт даже после подавления
    const rebellionChance = 0.03 + world.entropy * 0.12;
    if (!g.rebel && Math.random() < rebellionChance) {
      g.rebel = true;
      g.rage += 0.1;
      world.entropy += 0.02;
      chaosGenerated++;
      world.log.push({
        tick: world.tick,
        event: "CHAOS_REBELLION",
        god: g.name,
        message: `${g.name} rebelled against prediction!`,
      });
      console.log(`⚡ CHAOS REBELLION: ${g.name} rebelled at entropy ${world.entropy.toFixed(3)}`);
    }
    
    // Коррупция
    const corruptionChance = 0.02 + world.entropy * 0.08;
    if (!g.corrupted && !g.rebel && Math.random() < corruptionChance) {
      g.corrupted = true;
      world.entropy += 0.015;
      chaosGenerated++;
      console.log(`💀 CORRUPTION: ${g.name} became corrupted`);
    }
    
    // Эволюция страха и ярости
    g.fear = Math.max(0, g.fear - 0.01);
    g.rage = Math.max(0, g.rage - 0.015);
    
    // Ограничения
    g.power = Math.max(0.05, Math.min(3, g.power));
  }
  
  // Мир сам усиливает нестабильность
  world.entropy += (Math.random() - 0.5) * 0.02;
  world.entropy += chaosGenerated * 0.01;
  
  return chaosGenerated;
}

// =========================
// 🔮 PREDICTIVE STEP (ядро V107)
// =========================

function predictiveStep(world) {
  const predictions = [];
  
  for (let g of world.gods) {
    const prediction = world.futureEngine.simulate(world, g);
    predictions.push(prediction);
    
    // Вмешательство ДО будущего
    world.preImmune.act(world, prediction, g);
    
    // Обучение через результат
    world.memory.push({
      tick: world.tick,
      god: g.name,
      risk: prediction.risk,
      action: prediction.predicted ? "suppressed" : "ignored",
      actualRebel: g.rebel,
    });
  }
  
  if (world.memory.length > 1000) world.memory.shift();
  
  return predictions;
}

// =========================
// 👑 GOD
// =========================

class GodV107Final {
  constructor(name) {
    this.name = name;
    this.power = 0.4 + Math.random() * 0.7;
    this.alive = true;
    this.age = 0;
    this.rebel = false;
    this.corrupted = false;
    this.fear = 0;
    this.rage = 0;
    this.rules = { warChance: 0.5, collapseRate: 0.3 };
  }

  evolve(world) {
    this.age++;
    this.power += 0.005;
    if (this.rebel) this.power += 0.008;
    if (this.corrupted) this.power += 0.006;
    if (this.rage > 0.5) this.power += 0.005;
    this.power -= world.entropy * 0.003;
    this.power -= this.fear * 0.01;
    this.power = Math.max(0.05, Math.min(3, this.power));
  }
  
  isDead() { return this.power <= 0.05 || this.age > 2000 || this.fear > 1.5; }
}

// =========================
// 🌍 WORLD V107 FINAL
// =========================

class WorldV107Final {
  constructor() {
    this.tick = 0;
    this.entropy = 0.4;
    this.stability = 0.6;
    this.gods = [];
    this.log = [];
    this.memory = [];
    this.history = {
      wars: 0,
      collapses: 0,
      rebellions: 0,
      interventions: 0,
    };
    this.empires = [];
    this.agents = [];
    
    this.futureEngine = new FutureEngine();
    this.preImmune = new PreImmune();
  }

  addGod(g) { this.gods.push(g); }
  addEmpire(e) { this.empires.push(e); }
  addAgent(a, e) { a.loyalty = e.id; e.agents.push(a); this.agents.push(a); }

  spawnGod() {
    const names = ["Chronos", "Erebus", "Thanatos", "Eris", "Moros", "Nyx", "Nemesis", "Kratos", "Bia", "Zelus"];
    const newName = names[Math.floor(Math.random() * names.length)];
    const newGod = new GodV107Final(newName);
    newGod.power = 0.2 + this.entropy * 1.5;
    newGod.power = Math.min(2.5, newGod.power);
    if (this.entropy > 0.65 && Math.random() < 0.25) newGod.rebel = true;
    this.gods.push(newGod);
    this.log.push({ tick: this.tick, event: "GOD_BIRTH", god: newName, rebel: newGod.rebel });
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)}, rebel=${newGod.rebel})`);
    return newGod;
  }

  evaluateGods() {
    for (let g of [...this.gods]) {
      if (g.isDead()) {
        this.gods = this.gods.filter(god => god !== g);
        this.log.push({ tick: this.tick, event: "GOD_DEATH", god: g.name });
        console.log(`💀 GOD DEATH: ${g.name}`);
      }
    }
  }

  mergeRules() {
    if (this.gods.length === 0) return { warChance: 0.5, collapseRate: 0.5 };
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0) || 1;
    let war = 0, collapse = 0;
    for (let g of this.gods) {
      let w = g.power / totalPower;
      war += g.rules.warChance * w;
      collapse += g.rules.collapseRate * w;
    }
    return { warChance: Math.min(0.95, war), collapseRate: Math.min(0.9, collapse) };
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
    for (let g of this.gods) g.evolve(this);
    
    // 2. ПРЕДСКАТЕЛЬНЫЙ ШАГ (вмешательство ДО событий)
    const predictions = predictiveStep(this);
    
    // 3. Хаос-петля (боги сопротивляются предсказаниям)
    const chaosGenerated = chaosLoop(this);
    
    // 4. Проверка смерти и рождение
    this.evaluateGods();
    if (this.entropy > 0.4 && Math.random() < 0.05 && this.gods.length < 8) this.spawnGod();
    
    // 5. Балансировка
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    this.stability = Math.max(0.1, Math.min(0.95, this.stability + (Math.random() - 0.5) * 0.015));
    
    // 6. Мировые правила
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // 7. Логирование
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      const corruptedGods = this.gods.filter(g => g.corrupted);
      const accuracy = this.futureEngine.getAccuracy();
      
      console.log(`\n🔮💀 V107 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Stability:${this.stability.toFixed(3)} | Gods:${this.gods.length} (R:${rebelGods.length} C:${corruptedGods.length})`);
      console.log(`   Prediction Accuracy: ${(accuracy * 100).toFixed(1)}% | Interventions: ${this.history.interventions} | Chaos Gen: ${chaosGenerated}`);
      for (let g of this.gods.slice(0, 4)) {
        const status = g.rebel ? "⚡R" : (g.corrupted ? "💀C" : "👑");
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | fear=${g.fear.toFixed(2)} | rage=${g.rage.toFixed(2)}`);
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

const world = new WorldV107Final();

world.addGod(new GodV107Final("Ares"));
world.addGod(new GodV107Final("Athena"));
world.addGod(new GodV107Final("Nyx"));
world.addGod(new GodV107Final("Eris"));

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
  const corruptedGods = world.gods.filter(g => g.corrupted);
  
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    stability: world.stability.toFixed(3),
    futureEngine: world.futureEngine.getState(),
    preImmune: world.preImmune.getState(),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      corrupted: g.corrupted,
      fear: g.fear.toFixed(2),
      rage: g.rage.toFixed(2),
      age: g.age,
    })),
    rebelsCount: rebelGods.length,
    corruptedCount: corruptedGods.length,
    history: world.history,
    empires: world.empires.map(e => ({ name: e.name, state: e.state, territory: e.territory.toFixed(1) })),
    recentEvents: world.log.slice(-20),
  });
});

app.get("/api/predictions", (req, res) => {
  const predictions = [];
  for (let g of world.gods) {
    const pred = world.futureEngine.simulate(world, g);
    predictions.push(pred);
  }
  res.json({ predictions, accuracy: world.futureEngine.getAccuracy() });
});

app.get("/api/interventions", (req, res) => {
  res.json(world.preImmune.getState());
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🔮💀 V107 PREDICTIVE CHAOS IMMUNITY CORE ONLINE :3000");
  console.log("🔥 Система предсказывает хаос и вмешивается ДО событий!");
});
