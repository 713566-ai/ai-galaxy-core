// =========================
// 🔮 V107 — PREDICTIVE IMMUNITY CORE
// Система предугадывает атаки богов до их совершения
// =========================

const express = require("express");
const app = express();

// =========================
// 🧠 FUTURE MODEL (предсказатель поведения)
// =========================

class FutureModel {
  constructor() {
    this.patterns = [];
    this.predictions = new Map();
    this.accuracyHistory = [];
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
    let confidence = 0.5;
    
    for (let p of recent) {
      if (p.rebel) riskScore += 0.25;
      if (p.corrupted) riskScore += 0.2;
      if (p.power > 1.2) riskScore += 0.15;
      if (p.fear > 0.8) riskScore -= 0.2;
      if (p.worldEntropy > 0.7) riskScore += 0.15;
      if (p.action === "attack") riskScore += 0.3;
    }
    
    // Нормализация
    riskScore = Math.min(1, riskScore / 2);
    confidence = 0.5 + Math.min(0.4, recent.length / 100);
    
    const prediction = riskScore > 0.6 ? "HIGH_RISK" : (riskScore > 0.3 ? "MEDIUM_RISK" : "LOW_RISK");
    
    this.predictions.set(god.name, { risk: riskScore, prediction, confidence, timestamp: Date.now() });
    
    return { prediction, riskScore, confidence };
  }
  
  getAccuracy() {
    // Анализ точности предсказаний
    const recent = this.patterns.slice(-100);
    let correct = 0;
    for (let p of recent) {
      const pred = this.predictions.get(p.god);
      if (pred && p.action === "attack" && pred.prediction === "HIGH_RISK") correct++;
      if (pred && p.action !== "attack" && pred.prediction === "LOW_RISK") correct++;
    }
    const accuracy = recent.length > 0 ? correct / Math.min(100, recent.length) : 0.5;
    this.accuracyHistory.push({ tick: Date.now(), accuracy });
    if (this.accuracyHistory.length > 50) this.accuracyHistory.shift();
    return accuracy;
  }
  
  getState() {
    return {
      patternsCount: this.patterns.length,
      predictionsCount: this.predictions.size,
      accuracy: this.getAccuracy().toFixed(3),
    };
  }
}

// =========================
// 🛡 PRE-DEFENSE ENGINE (защита ДО атаки)
// =========================

class PreDefense {
  constructor() {
    this.lockedTargets = new Set();
    this.preemptiveActions = [];
    this.defenseBudget = 100;
  }

  act(world, god, prediction, riskScore) {
    if (prediction === "HIGH_RISK" && this.defenseBudget > 0) {
      if (!this.lockedTargets.has(god.name)) {
        this.lockedTargets.add(god.name);
        
        // Превентивное ослабление
        const powerLoss = god.power * 0.2;
        god.power *= 0.8;
        if (god.rebel) god.rebel = false;
        if (god.corrupted) god.corrupted = false;
        god.fear += 0.15;
        
        this.defenseBudget -= 10;
        this.preemptiveActions.push({
          tick: world.tick,
          god: god.name,
          action: "PREVENTIVE_LOCK",
          powerLoss: powerLoss.toFixed(2),
        });
        
        world.entropy = Math.max(0.1, world.entropy - 0.02);
        world.log.push({
          tick: world.tick,
          event: "PREVENTIVE_LOCK",
          god: god.name,
          message: `${god.name} was preemptively neutralized!`,
        });
        
        console.log(`🛡 PREVENTIVE LOCK: ${god.name} (power reduced by ${(powerLoss * 100).toFixed(0)}%)`);
        
        return true;
      }
    } else if (prediction === "MEDIUM_RISK" && this.defenseBudget > 0) {
      // Мягкое превентивное действие
      god.power *= 0.95;
      this.defenseBudget -= 3;
      return true;
    }
    
    return false;
  }
  
  recharge() {
    this.defenseBudget = Math.min(100, this.defenseBudget + 2);
  }
  
  getState() {
    return {
      lockedTargets: Array.from(this.lockedTargets),
      defenseBudget: this.defenseBudget,
      preemptiveActions: this.preemptiveActions.slice(-20),
      totalActions: this.preemptiveActions.length,
    };
  }
}

// =========================
// 🔮 SIMULATED FUTURE ENGINE
// =========================

function simulateFuture(world, god) {
  let risk = 0;
  
  // Факторы риска
  if (god.rebel) risk += 0.35;
  if (god.corrupted) risk += 0.25;
  if (god.power > 1.2) risk += 0.2;
  if (world.entropy > 0.65) risk += 0.15;
  if (god.fear < 0.3) risk += 0.1;
  if (god.age > 100 && god.power > 1) risk += 0.1;
  
  // Исторические факторы
  const recentHistory = world.futureModel.patterns.filter(p => p.god === god.name).slice(-20);
  const attackHistory = recentHistory.filter(p => p.action === "attack").length;
  risk += attackHistory * 0.03;
  
  return Math.min(0.95, risk);
}

// =========================
// 🧬 ADAPTIVE PREDICTION LOOP
// =========================

function predictionLoop(world) {
  let totalRisk = 0;
  let predictions = [];
  
  for (let g of world.gods) {
    const risk = simulateFuture(world, g);
    totalRisk += risk;
    
    const { prediction, riskScore, confidence } = world.memory.predictAttack(g, world);
    
    predictions.push({
      god: g.name,
      risk: risk.toFixed(3),
      prediction,
      confidence: confidence.toFixed(2),
    });
    
    // Защита ДО атаки
    world.preDefense.act(world, g, prediction, riskScore);
    
    // Наблюдение для обучения модели
    world.memory.observe(g, risk > 0.5 ? "attack" : "idle", world);
  }
  
  // Глобальная корректировка
  const avgRisk = totalRisk / Math.max(1, world.gods.length);
  
  if (avgRisk > 0.6) {
    world.defense.level += 0.02;
    world.memory.record({ type: "high_risk_period", avgRisk });
  }
  
  return predictions;
}

// =========================
// 🧬 IMMUNE MEMORY (дополнение)
// =========================

class ImmuneMemoryV107 {
  constructor() {
    this.records = [];
    this.threatPatterns = {};
  }

  record(event) {
    this.records.push({ ...event, tick: Date.now() });
    this.threatPatterns[event.type] = (this.threatPatterns[event.type] || 0) + 1;
    if (this.records.length > 500) this.records.shift();
  }

  getThreatPattern() {
    return { ...this.threatPatterns };
  }
  
  getStats() {
    return {
      totalRecords: this.records.length,
      patterns: this.threatPatterns,
    };
  }
}

// =========================
// 🛡 ADAPTIVE DEFENSE
// =========================

class AdaptiveDefenseV107 {
  constructor() {
    this.level = 1.2;
    this.evolutionHistory = [];
  }

  evolve(memory) {
    const patterns = memory.getThreatPattern();
    let oldLevel = this.level;
    
    if (patterns.rebellion > 15) this.level += 0.1;
    if (patterns.corruption > 10) this.level += 0.08;
    if (patterns.war > 20) this.level += 0.12;
    
    this.level = Math.min(5, Math.max(0.5, this.level));
    
    if (oldLevel !== this.level) {
      this.evolutionHistory.push({ tick: Date.now(), oldLevel, newLevel: this.level });
    }
    
    return this.level;
  }
  
  getState() {
    return {
      level: this.level.toFixed(2),
      evolutionCount: this.evolutionHistory.length,
    };
  }
}

// =========================
// 👑 GOD WITH EVOLUTION
// =========================

class GodV107 {
  constructor(name, origin = "primordial") {
    this.id = `GOD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.name = name;
    this.power = 0.4 + Math.random() * 0.7;
    this.alive = true;
    this.age = 0;
    this.origin = origin;
    
    this.rebel = false;
    this.corrupted = false;
    this.fear = 0;
    this.lastSuppressed = null;
    this.unpredictability = Math.random() * 0.5;
    
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
    
    // Становление угрозой
    if (!this.rebel && !this.corrupted) {
      if (this.age > 35 && world.entropy > 0.55 && Math.random() < 0.035) {
        this.rebel = true;
        world.memory.record({ type: "rebellion", god: this.name });
        world.log.push({ tick: world.tick, event: "REBELLION", god: this.name });
        console.log(`⚡ REBELLION: ${this.name} turned rebel!`);
      } else if (this.age > 30 && world.entropy > 0.7 && Math.random() < 0.04) {
        this.corrupted = true;
        world.memory.record({ type: "corruption", god: this.name });
        console.log(`💀 CORRUPTION: ${this.name} became corrupted!`);
      }
    }
    
    // Рост силы
    let growth = 0.004;
    if (this.rebel) growth += 0.012;
    if (this.corrupted) growth += 0.01;
    if (world.history.wars > 0) growth += 0.003;
    
    this.power += growth;
    this.power -= world.entropy * 0.003;
    this.power -= this.fear * 0.015;
    this.power = Math.max(0.05, Math.min(3, this.power));
    
    // Непредсказуемость растёт с мощью
    this.unpredictability = Math.min(0.9, this.unpredictability + 0.002);
    
    // Страх убывает
    this.fear = Math.max(0, this.fear - 0.015);
    
    this.history.push({ tick: world.tick, power: this.power, rebel: this.rebel, fear: this.fear });
    if (this.history.length > 100) this.history.shift();
  }
  
  kill(reason) {
    this.alive = false;
    this.deathCause = reason;
  }
  
  isDead() {
    return this.power <= 0.05 || this.age > 2000 || this.fear > 1.5;
  }
}

// =========================
// 🌍 WORLD V107
// =========================

class WorldV107 {
  constructor() {
    this.tick = 0;
    this.entropy = 0.4;
    this.stability = 0.6;
    this.gods = [];
    this.deadGods = [];
    this.log = [];
    this.history = {
      wars: 0,
      collapses: 0,
      rebellions: 0,
      preemptiveStrikes: 0,
    };
    this.empires = [];
    this.agents = [];
    
    this.memory = new ImmuneMemoryV107();
    this.futureModel = new FutureModel();
    this.preDefense = new PreDefense();
    this.defense = new AdaptiveDefenseV107();
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
    const names = ["Chronos", "Erebus", "Hemera", "Thanatos", "Eris", "Phanes", "Moros", "Kratos", "Nyx", "Aether", "Tartarus", "Eros", "Ananke", "Hypnos", "Nemesis"];
    const newName = names[Math.floor(Math.random() * names.length)];
    
    const newGod = new GodV107(newName, "emergent");
    newGod.power = 0.2 + this.entropy * 1.4;
    newGod.power = Math.min(2.5, newGod.power);
    
    if (this.entropy > 0.6) {
      if (Math.random() < 0.18) newGod.rebel = true;
      if (Math.random() < 0.12) newGod.corrupted = true;
    }
    
    this.gods.push(newGod);
    this.log.push({
      tick: this.tick,
      event: "GOD_BIRTH",
      god: newName,
      rebel: newGod.rebel,
      corrupted: newGod.corrupted,
    });
    
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)}, rebel=${newGod.rebel}, corrupted=${newGod.corrupted})`);
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
        this.killGod(g, g.rebel ? "rebel_power_collapse" : (g.corrupted ? "corruption_decay" : "natural_decay"));
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
      if (g.corrupted) weight *= 0.9;
      
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
        this.memory.record({ type: "war", participants: [attacker.name, defender.name] });
      }
    }
  }

  step() {
    this.tick++;
    
    // 1. Боги эволюционируют
    for (let g of this.gods) {
      g.evolve(this);
    }
    
    // 2. Предсказательный цикл (защита ДО атаки)
    const predictions = predictionLoop(this);
    
    // 3. Эволюция защиты
    this.defense.evolve(this.memory);
    
    // 4. Проверка смерти
    this.evaluateGods();
    
    // 5. Рождение новых богов
    if (this.entropy > 0.45 && Math.random() < 0.05 && this.gods.length < 9) {
      this.spawnGod();
    }
    
    // 6. Перезарядка защиты
    this.preDefense.recharge();
    
    // 7. Энтропия
    this.entropy += (Math.random() - 0.5) * 0.012;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    // 8. Стабильность
    this.stability = Math.max(0.1, Math.min(0.95, this.stability + (Math.random() - 0.5) * 0.01));
    
    // 9. Мировые правила
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // 10. Логирование
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      const corruptedGods = this.gods.filter(g => g.corrupted);
      const accuracy = this.futureModel.getAccuracy();
      
      console.log(`\n🔮 V107 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Defense:${this.defense.level.toFixed(2)} | Gods:${this.gods.length} (R:${rebelGods.length} C:${corruptedGods.length})`);
      console.log(`   Prediction Accuracy: ${(accuracy * 100).toFixed(1)}% | Preemptive Strikes: ${this.preDefense.preemptiveActions.length} | Budget: ${this.preDefense.defenseBudget}`);
      for (let g of this.gods.slice(0, 4)) {
        const status = g.rebel ? "⚡R" : (g.corrupted ? "💀C" : "👑");
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | fear=${g.fear.toFixed(2)} | unpredict=${g.unpredictability.toFixed(2)}`);
      }
      if (this.preDefense.lockedTargets.size > 0) {
        console.log(`   🛡 PRE-LOCKED: ${Array.from(this.preDefense.lockedTargets).join(", ")}`);
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

const world = new WorldV107();

// Стартовые боги
world.addGod(new GodV107("Ares", "primordial"));
world.addGod(new GodV107("Athena", "primordial"));
world.addGod(new GodV107("Nyx", "primordial"));
world.addGod(new GodV107("Eris", "primordial"));

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
  const corruptedGods = world.gods.filter(g => g.corrupted);
  
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    stability: world.stability.toFixed(3),
    defense: world.defense.getState(),
    preDefense: world.preDefense.getState(),
    futureModel: world.futureModel.getState(),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
      entropyBias: rules.entropyBias.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      corrupted: g.corrupted,
      fear: g.fear.toFixed(2),
      unpredictability: g.unpredictability.toFixed(2),
      age: g.age,
    })),
    rebelsCount: rebelGods.length,
    corruptedCount: corruptedGods.length,
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

app.get("/api/predictions", (req, res) => {
  const predictions = [];
  for (let g of world.gods) {
    const risk = simulateFuture(world, g);
    const { prediction, confidence } = world.futureModel.predictAttack(g, world);
    predictions.push({
      god: g.name,
      risk: risk.toFixed(3),
      prediction,
      confidence: confidence.toFixed(2),
    });
  }
  res.json({ predictions, accuracy: world.futureModel.getAccuracy() });
});

app.get("/api/predefense", (req, res) => {
  res.json(world.preDefense.getState());
});

app.get("/api/log", (req, res) => {
  res.json({ log: world.log.slice(-50), total: world.log.length });
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🔮 V107 PREDICTIVE IMMUNITY CORE ONLINE :3000");
  console.log("🔥 Система предугадывает атаки богов до их совершения!");
});
