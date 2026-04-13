// =========================
// ☠️💀 V108 — TIMELINE PRISON CORE
// Создание альтернативных таймлайнов и ловушек для богов
// =========================

const express = require("express");
const app = express();

// =========================
// 🔮 TIMELINE ENGINE
// =========================

class TimelineEngine {
  constructor() {
    this.timelines = [];
    this.activeTimelines = new Map();
  }

  create(world, god) {
    let risk = 0;
    
    // Базовые факторы риска
    if (god.rebel) risk += 0.4;
    if (god.corrupted) risk += 0.3;
    if (god.power > 1.2) risk += 0.25;
    if (world.entropy > 0.6) risk += 0.2;
    if (god.fear > 0.7) risk -= 0.15;
    
    // Хаотический шум
    risk += (Math.random() - 0.5) * 0.35;
    risk = Math.max(0.05, Math.min(0.95, risk));
    
    const timeline = {
      id: `TL_${world.tick}_${god.name}_${Math.random().toString(36).slice(2, 6)}`,
      god: god.name,
      risk: risk.toFixed(3),
      rawRisk: risk,
      outcome: risk > 0.6 ? "collapse" : (risk > 0.35 ? "unstable" : "stable"),
      createdAt: world.tick,
      locked: false,
    };
    
    this.timelines.push(timeline);
    if (this.timelines.length > 200) this.timelines.shift();
    
    this.activeTimelines.set(timeline.id, timeline);
    
    return timeline;
  }
  
  getTimelineCount() {
    return this.timelines.length;
  }
  
  getActiveCount() {
    return this.activeTimelines.size;
  }
  
  getState() {
    return {
      totalTimelines: this.timelines.length,
      activeTimelines: this.activeTimelines.size,
      recentTimelines: this.timelines.slice(-10),
    };
  }
}

// =========================
// 🔒 TIMELINE PRISON
// =========================

class TimelinePrison {
  constructor() {
    this.prisoners = new Map();
    this.escapes = 0;
    this.captures = 0;
  }

  lock(god, timeline, world) {
    if (god.locked) return false;
    if (timeline.rawRisk < 0.55) return false;
    
    god.locked = true;
    god.lockedTimeline = timeline.id;
    god.prisonTime = 0;
    
    this.prisoners.set(god.name, {
      god: god.name,
      timelineId: timeline.id,
      risk: timeline.rawRisk,
      capturedAt: world.tick,
    });
    
    this.captures++;
    world.history.prisons = (world.history.prisons || 0) + 1;
    
    world.log.push({
      tick: world.tick,
      event: "TIMELINE_PRISON",
      god: god.name,
      timeline: timeline.id,
      risk: timeline.risk,
    });
    
    console.log(`⛓ PRISON: ${god.name} trapped in timeline ${timeline.id} (risk=${timeline.risk})`);
    return true;
  }

  applyEffect(god, timeline, world) {
    if (!god.locked) return false;
    
    god.prisonTime = (god.prisonTime || 0) + 1;
    
    // Эффекты заключения
    if (timeline.outcome === "collapse") {
      god.power *= 0.92;
      god.fear += 0.08;
      world.entropy += 0.01;
    } else if (timeline.outcome === "unstable") {
      god.power *= 0.97;
      god.fear += 0.03;
    } else {
      god.power *= 1.02;
      god.fear = Math.max(0, god.fear - 0.02);
    }
    
    god.power = Math.max(0.05, Math.min(3, god.power));
    
    return true;
  }

  release(god, world) {
    if (!god.locked) return false;
    
    // Шанс побега из таймлайна
    let escapeChance = 0.05 + god.power * 0.05 + god.rage * 0.1;
    escapeChance = Math.min(0.3, escapeChance);
    
    if (Math.random() < escapeChance) {
      god.locked = false;
      god.lockedTimeline = null;
      this.escapes++;
      
      world.log.push({
        tick: world.tick,
        event: "TIMELINE_ESCAPE",
        god: god.name,
        prisonTime: god.prisonTime,
      });
      
      console.log(`🔓 ESCAPE: ${god.name} escaped from timeline prison after ${god.prisonTime} ticks`);
      return true;
    }
    
    return false;
  }
  
  getState() {
    return {
      prisonersCount: this.prisoners.size,
      captures: this.captures,
      escapes: this.escapes,
      currentPrisoners: Array.from(this.prisoners.values()).slice(-10),
    };
  }
}

// =========================
// 🌪 REALITY DESYNC
// =========================

function realityDesync(world) {
  const timelineOverload = world.timelineEngine.getTimelineCount();
  let desyncLevel = 0;
  
  if (timelineOverload > 80) {
    desyncLevel = 1;
    world.entropy += 0.04;
    world.stability -= 0.03;
    world.log.push({ tick: world.tick, event: "REALITY_DESYNC", level: 1 });
  }
  
  if (timelineOverload > 120) {
    desyncLevel = 2;
    world.entropy += 0.06;
    world.stability -= 0.05;
    world.log.push({ tick: world.tick, event: "REALITY_DESYNC", level: 2 });
  }
  
  if (timelineOverload > 160) {
    desyncLevel = 3;
    world.entropy += 0.1;
    world.stability -= 0.08;
    
    // Коллапс реальности — сброс таймлайнов
    world.timelineEngine.timelines = world.timelineEngine.timelines.slice(-60);
    world.log.push({ tick: world.tick, event: "REALITY_COLLAPSE", message: "Timeline reset!" });
    console.log("💥 REALITY COLLAPSE: Timeline overload, resetting...");
  }
  
  return desyncLevel;
}

// =========================
// 🔮 MULTI-TIMELINE LOOP
// =========================

function timelineStep(world) {
  const newTimelines = [];
  
  for (let g of world.gods) {
    // Создаём таймлайн для каждого бога
    const tl = world.timelineEngine.create(world, g);
    newTimelines.push(tl);
    
    // Пытаемся заключить в тюрьму
    const locked = world.prison.lock(g, tl, world);
    
    // Применяем эффекты заключения
    world.prison.applyEffect(g, tl, world);
    
    // Шанс побега
    world.prison.release(g, world);
  }
  
  return newTimelines;
}

// =========================
// 👑 GOD
// =========================

class GodV108 {
  constructor(name) {
    this.name = name;
    this.power = 0.4 + Math.random() * 0.7;
    this.alive = true;
    this.age = 0;
    this.rebel = false;
    this.corrupted = false;
    this.locked = false;
    this.lockedTimeline = null;
    this.prisonTime = 0;
    this.fear = 0;
    this.rage = 0;
    this.rules = { warChance: 0.5, collapseRate: 0.3 };
  }

  evolve(world) {
    this.age++;
    let growth = 0.006;
    if (this.rebel) growth += 0.01;
    if (this.corrupted) growth += 0.008;
    if (this.locked) growth -= 0.005;
    if (this.rage > 0.5) growth += 0.008;
    
    this.power += growth;
    this.power -= world.entropy * 0.003;
    this.power -= this.fear * 0.012;
    this.power = Math.max(0.05, Math.min(3, this.power));
    
    this.fear = Math.max(0, this.fear - 0.01);
    this.rage = Math.max(0, this.rage - 0.012);
  }
  
  isDead() { return this.power <= 0.05 || this.age > 2000 || this.fear > 1.5; }
}

// =========================
// 🌍 WORLD V108
// =========================

class WorldV108 {
  constructor() {
    this.tick = 0;
    this.entropy = 0.45;
    this.stability = 0.55;
    this.gods = [];
    this.log = [];
    this.history = {
      wars: 0,
      collapses: 0,
      prisons: 0,
      escapes: 0,
    };
    this.empires = [];
    this.agents = [];
    
    this.timelineEngine = new TimelineEngine();
    this.prison = new TimelinePrison();
  }

  addGod(g) { this.gods.push(g); }
  addEmpire(e) { this.empires.push(e); }
  addAgent(a, e) { a.loyalty = e.id; e.agents.push(a); this.agents.push(a); }

  spawnGod() {
    const names = ["Chronos", "Erebus", "Thanatos", "Eris", "Moros", "Nyx", "Nemesis", "Kratos", "Bia", "Zelus", "Ananke", "Hypnos"];
    const newName = names[Math.floor(Math.random() * names.length)];
    const newGod = new GodV108(newName);
    newGod.power = 0.2 + this.entropy * 1.5;
    newGod.power = Math.min(2.5, newGod.power);
    if (this.entropy > 0.6 && Math.random() < 0.2) newGod.rebel = true;
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
    
    // 2. МУЛЬТИ-ТАЙМЛАЙН ШАГ (создание и ловушки)
    const newTimelines = timelineStep(this);
    
    // 3. Реальность десинхронизируется
    const desyncLevel = realityDesync(this);
    
    // 4. Случайные бунты и коррупция
    for (let g of this.gods) {
      if (!g.rebel && Math.random() < 0.03 + this.entropy * 0.08) {
        g.rebel = true;
        g.rage += 0.1;
        this.log.push({ tick: this.tick, event: "REBELLION", god: g.name });
      }
      if (!g.corrupted && !g.rebel && Math.random() < 0.02 + this.entropy * 0.06) {
        g.corrupted = true;
        this.log.push({ tick: this.tick, event: "CORRUPTION", god: g.name });
      }
    }
    
    // 5. Проверка смерти и рождение
    this.evaluateGods();
    if (this.entropy > 0.4 && Math.random() < 0.04 && this.gods.length < 9) this.spawnGod();
    
    // 6. Энтропия и стабильность
    this.entropy += (Math.random() - 0.5) * 0.018;
    this.entropy += newTimelines.length * 0.0005;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    this.stability = Math.max(0.1, Math.min(0.95, this.stability + (Math.random() - 0.5) * 0.015));
    
    // 7. Мировые правила
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // 8. Логирование
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      const lockedGods = this.gods.filter(g => g.locked);
      const timelineCount = this.timelineEngine.getTimelineCount();
      
      console.log(`\n☠️💀 V108 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Stability:${this.stability.toFixed(3)} | Gods:${this.gods.length} (R:${rebelGods.length} L:${lockedGods.length})`);
      console.log(`   Timelines: ${timelineCount} | Prisons: ${this.history.prisons} | Escapes: ${this.prison.escapes} | Desync: ${desyncLevel}`);
      for (let g of this.gods.slice(0, 4)) {
        const status = g.locked ? "⛓L" : (g.rebel ? "⚡R" : (g.corrupted ? "💀C" : "👑"));
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | fear=${g.fear.toFixed(2)} | prison=${g.prisonTime || 0}`);
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

const world = new WorldV108();

world.addGod(new GodV108("Ares"));
world.addGod(new GodV108("Athena"));
world.addGod(new GodV108("Nyx"));
world.addGod(new GodV108("Eris"));

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
  const lockedGods = world.gods.filter(g => g.locked);
  
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    stability: world.stability.toFixed(3),
    timelines: world.timelineEngine.getState(),
    prison: world.prison.getState(),
    rules: {
      warChance: rules.warChance.toFixed(3),
      collapseRate: rules.collapseRate.toFixed(3),
    },
    gods: world.gods.map(g => ({
      name: g.name,
      power: g.power.toFixed(3),
      rebel: g.rebel,
      corrupted: g.corrupted,
      locked: g.locked,
      prisonTime: g.prisonTime || 0,
      fear: g.fear.toFixed(2),
      rage: g.rage.toFixed(2),
    })),
    rebelsCount: rebelGods.length,
    lockedCount: lockedGods.length,
    history: world.history,
    empires: world.empires.map(e => ({ name: e.name, state: e.state, territory: e.territory.toFixed(1) })),
    recentEvents: world.log.slice(-20),
  });
});

app.get("/api/timelines", (req, res) => {
  res.json(world.timelineEngine.getState());
});

app.get("/api/prison", (req, res) => {
  res.json(world.prison.getState());
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("☠️💀 V108 TIMELINE PRISON CORE ONLINE :3000");
  console.log("🔥 Система создаёт альтернативные таймлайны и запирает богов внутри них!");
});
