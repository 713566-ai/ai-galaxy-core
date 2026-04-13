// =========================
// 💀🌀 V109 — PARADOX ENGINE CORE
// Один бог существует в нескольких реальностях и конфликтует с собой
// =========================

const express = require("express");
const app = express();

// =========================
// 🔮 TIMELINE ENGINE (V108 base)
// =========================

class TimelineEngine {
  constructor() {
    this.timelines = [];
  }

  create(world, god) {
    let risk = 0;
    if (god.rebel) risk += 0.4;
    if (god.corrupted) risk += 0.3;
    if (god.power > 1.2) risk += 0.25;
    if (world.entropy > 0.6) risk += 0.2;
    risk += (Math.random() - 0.5) * 0.35;
    risk = Math.max(0.05, Math.min(0.95, risk));
    
    const timeline = {
      id: `TL_${world.tick}_${god.name}_${Math.random().toString(36).slice(2, 6)}`,
      god: god.name,
      risk: risk.toFixed(3),
      rawRisk: risk,
      outcome: risk > 0.6 ? "collapse" : (risk > 0.35 ? "unstable" : "stable"),
      createdAt: world.tick,
    };
    
    this.timelines.push(timeline);
    if (this.timelines.length > 300) this.timelines.shift();
    return timeline;
  }
  
  getTimelinesForGod(godName) {
    return this.timelines.filter(t => t.god === godName);
  }
  
  getState() {
    return { totalTimelines: this.timelines.length };
  }
}

// =========================
// 🔒 TIMELINE PRISON
// =========================

class TimelinePrison {
  constructor() {
    this.prisoners = new Map();
  }

  lock(god, timeline, world) {
    if (god.locked) return false;
    if (timeline.rawRisk < 0.55) return false;
    
    god.locked = true;
    god.lockedTimeline = timeline.id;
    this.prisoners.set(god.name, { timelineId: timeline.id, risk: timeline.rawRisk });
    world.history.prisons = (world.history.prisons || 0) + 1;
    return true;
  }

  applyEffect(god, timeline) {
    if (!god.locked) return;
    if (timeline.outcome === "collapse") god.power *= 0.92;
    else if (timeline.outcome === "unstable") god.power *= 0.97;
    else god.power *= 1.02;
    god.power = Math.max(0.05, Math.min(3, god.power));
  }

  release(god) {
    if (!god.locked) return false;
    const escapeChance = 0.05 + god.power * 0.05;
    if (Math.random() < escapeChance) {
      god.locked = false;
      this.prisoners.delete(god.name);
      return true;
    }
    return false;
  }
  
  getState() {
    return { prisonersCount: this.prisoners.size };
  }
}

// =========================
// 🌀 PARADOX ENGINE
// =========================

class ParadoxEngine {
  constructor() {
    this.instances = [];
    this.paradoxEvents = [];
  }

  createInstance(god, timeline) {
    const instance = {
      id: `PX_${god.name}_${timeline.id}_${Date.now()}`,
      original: god.name,
      timeline: timeline.id,
      power: god.power * (0.7 + Math.random() * 0.6),
      unstable: false,
      createdAt: Date.now(),
      timelineRisk: timeline.rawRisk,
    };
    
    this.instances.push(instance);
    return instance;
  }

  detectConflicts() {
    const conflicts = [];
    const instancesByGod = new Map();
    
    for (const inst of this.instances) {
      if (!instancesByGod.has(inst.original)) instancesByGod.set(inst.original, []);
      instancesByGod.get(inst.original).push(inst);
    }
    
    for (const [godName, instances] of instancesByGod.entries()) {
      if (instances.length > 1) {
        for (let i = 0; i < instances.length; i++) {
          for (let j = i + 1; j < instances.length; j++) {
            if (instances[i].timeline !== instances[j].timeline) {
              conflicts.push([instances[i], instances[j]]);
            }
          }
        }
      }
    }
    
    return conflicts;
  }
  
  resolveConflict(conflict, world) {
    const [a, b] = conflict;
    const powerDiff = Math.abs(a.power - b.power);
    
    if (powerDiff < 0.15) {
      // Взаимное уничтожение
      a.unstable = true;
      b.unstable = true;
      world.entropy += 0.04;
      this.paradoxEvents.push({
        tick: world.tick,
        type: "MUTUAL_ANNIHILATION",
        god: a.original,
        powerA: a.power,
        powerB: b.power,
      });
      console.log(`💥 PARADOX: ${a.original} versions annihilated each other!`);
    } else {
      // Доминирование более сильной версии
      const winner = a.power > b.power ? a : b;
      const loser = winner === a ? b : a;
      loser.unstable = true;
      winner.power += 0.08;
      this.paradoxEvents.push({
        tick: world.tick,
        type: "DOMINANCE",
        god: a.original,
        winner: winner.id,
        loser: loser.id,
      });
      console.log(`⚔️ PARADOX DOMINANCE: ${a.original} version ${winner.id} dominates`);
    }
    
    world.history.paradoxes = (world.history.paradoxes || 0) + 1;
    return true;
  }
  
  decay(world) {
    const before = this.instances.length;
    this.instances = this.instances.filter(inst => {
      if (inst.unstable && Math.random() < 0.35) {
        world.entropy += 0.02;
        return false;
      }
      return true;
    });
    if (before !== this.instances.length) {
      console.log(`🌀 PARADOX DECAY: ${before - this.instances.length} instances collapsed`);
    }
  }
  
  getState() {
    const instancesByGod = new Map();
    for (const inst of this.instances) {
      instancesByGod.set(inst.original, (instancesByGod.get(inst.original) || 0) + 1);
    }
    return {
      totalInstances: this.instances.length,
      instancesPerGod: Object.fromEntries(instancesByGod),
      recentParadoxes: this.paradoxEvents.slice(-10),
    };
  }
}

// =========================
// 👑 GOD
// =========================

class GodV109 {
  constructor(name) {
    this.name = name;
    this.power = 0.4 + Math.random() * 0.7;
    this.alive = true;
    this.age = 0;
    this.rebel = false;
    this.corrupted = false;
    this.locked = false;
    this.lockedTimeline = null;
    this.fear = 0;
    this.rage = 0;
    this.paradoxInstances = 0;
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
// 🌍 WORLD V109
// =========================

class WorldV109 {
  constructor() {
    this.tick = 0;
    this.entropy = 0.5;
    this.stability = 0.5;
    this.gods = [];
    this.log = [];
    this.history = {
      wars: 0,
      prisons: 0,
      paradoxes: 0,
      realityBreaks: 0,
    };
    this.empires = [];
    this.agents = [];
    
    this.timelineEngine = new TimelineEngine();
    this.prison = new TimelinePrison();
    this.paradox = new ParadoxEngine();
  }

  addGod(g) { this.gods.push(g); }
  addEmpire(e) { this.empires.push(e); }
  addAgent(a, e) { a.loyalty = e.id; e.agents.push(a); this.agents.push(a); }

  spawnGod() {
    const names = ["Chronos", "Erebus", "Thanatos", "Eris", "Moros", "Nyx", "Nemesis", "Kratos", "Ananke", "Hypnos", "Phanes", "Tartarus"];
    const newName = names[Math.floor(Math.random() * names.length)];
    const newGod = new GodV109(newName);
    newGod.power = 0.2 + this.entropy * 1.5;
    newGod.power = Math.min(2.5, newGod.power);
    if (this.entropy > 0.6 && Math.random() < 0.2) newGod.rebel = true;
    this.gods.push(newGod);
    this.log.push({ tick: this.tick, event: "GOD_BIRTH", god: newName });
    console.log(`🌱 GOD BIRTH: ${newName} (power=${newGod.power.toFixed(2)})`);
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

  timelineStep() {
    for (let g of this.gods) {
      const tl = this.timelineEngine.create(this, g);
      this.prison.lock(g, tl, this);
      this.prison.applyEffect(g, tl);
      this.prison.release(g);
    }
  }

  paradoxStep() {
    // Создаём парадоксальные копии богов из разных таймлайнов
    for (let g of this.gods) {
      const godTimelines = this.timelineEngine.getTimelinesForGod(g.name);
      const recentTimelines = godTimelines.slice(-3);
      for (let tl of recentTimelines) {
        if (Math.random() < 0.4) {
          this.paradox.createInstance(g, tl);
          g.paradoxInstances++;
        }
      }
    }
    
    // Обнаруживаем и разрешаем конфликты
    const conflicts = this.paradox.detectConflicts();
    for (let c of conflicts) {
      this.paradox.resolveConflict(c, this);
    }
    
    // Распад нестабильных парадоксов
    this.paradox.decay(this);
  }

  realityInstability() {
    const paradoxCount = this.paradox.instances.length;
    let breakLevel = 0;
    
    if (paradoxCount > 25) {
      this.stability -= 0.04;
      this.entropy += 0.03;
      breakLevel = 1;
    }
    
    if (paradoxCount > 45) {
      this.stability -= 0.06;
      this.entropy += 0.05;
      breakLevel = 2;
      this.history.realityBreaks++;
      this.log.push({ tick: this.tick, event: "CAUSALITY_BREAK", level: breakLevel });
      console.log(`🌀 CAUSALITY BREAK: Reality destabilized at level ${breakLevel}`);
    }
    
    if (paradoxCount > 70) {
      this.stability -= 0.1;
      this.entropy += 0.08;
      breakLevel = 3;
      this.log.push({ tick: this.tick, event: "REALITY_FRACTURE", level: breakLevel });
      console.log(`💥 REALITY FRACTURE: Multiple paradoxes collapsing reality!`);
    }
    
    return breakLevel;
  }

  mergeRules() {
    if (this.gods.length === 0) return { warChance: 0.5, collapseRate: 0.5 };
    let totalPower = this.gods.reduce((s, g) => s + g.power, 0) || 1;
    let war = 0, collapse = 0;
    for (let g of this.gods) {
      let w = g.power / totalPower;
      war += g.rules?.warChance || 0.5 * w;
      collapse += g.rules?.collapseRate || 0.3 * w;
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
    
    // 1. Эволюция богов
    for (let g of this.gods) g.evolve(this);
    
    // 2. Таймлайн шаг (V108)
    this.timelineStep();
    
    // 3. ПАРАДОКСАЛЬНЫЙ ШАГ (V109 — ключевой)
    this.paradoxStep();
    
    // 4. Нестабильность реальности
    const breakLevel = this.realityInstability();
    
    // 5. Случайные бунты
    for (let g of this.gods) {
      if (!g.rebel && Math.random() < 0.03 + this.entropy * 0.08) {
        g.rebel = true;
        g.rage += 0.1;
      }
      if (!g.corrupted && !g.rebel && Math.random() < 0.02 + this.entropy * 0.06) {
        g.corrupted = true;
      }
    }
    
    // 6. Проверка смерти и рождение
    this.evaluateGods();
    if (this.entropy > 0.4 && Math.random() < 0.04 && this.gods.length < 9) this.spawnGod();
    
    // 7. Энтропия и стабильность
    this.entropy += (Math.random() - 0.5) * 0.02;
    this.entropy += this.paradox.instances.length * 0.0005;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    this.stability = Math.max(0.1, Math.min(0.95, this.stability + (Math.random() - 0.5) * 0.015));
    
    // 8. Мировые правила
    const rules = this.mergeRules();
    this.updateEmpires(rules);
    this.simulateWars(rules);
    
    // 9. Логирование
    if (this.tick % 20 === 0) {
      const rebelGods = this.gods.filter(g => g.rebel);
      const lockedGods = this.gods.filter(g => g.locked);
      const paradoxCount = this.paradox.instances.length;
      
      console.log(`\n💀🌀 V109 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Stability:${this.stability.toFixed(3)} | Gods:${this.gods.length} (R:${rebelGods.length} L:${lockedGods.length})`);
      console.log(`   Paradox Instances: ${paradoxCount} | Conflicts: ${this.history.paradoxes} | Reality Breaks: ${this.history.realityBreaks}`);
      for (let g of this.gods.slice(0, 4)) {
        const status = g.locked ? "⛓L" : (g.rebel ? "⚡R" : (g.corrupted ? "💀C" : "👑"));
        console.log(`   ${status} ${g.name} | power=${g.power.toFixed(2)} | paradoxes=${g.paradoxInstances || 0}`);
      }
      if (breakLevel > 0) console.log(`   🌪 REALITY INSTABILITY: Level ${breakLevel}`);
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

const world = new WorldV109();

world.addGod(new GodV109("Ares"));
world.addGod(new GodV109("Athena"));
world.addGod(new GodV109("Nyx"));
world.addGod(new GodV109("Eris"));

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
    paradox: world.paradox.getState(),
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
      paradoxInstances: g.paradoxInstances || 0,
    })),
    rebelsCount: rebelGods.length,
    lockedCount: lockedGods.length,
    history: world.history,
    empires: world.empires.map(e => ({ name: e.name, state: e.state, territory: e.territory.toFixed(1) })),
    recentEvents: world.log.slice(-20),
  });
});

app.get("/api/paradox", (req, res) => {
  res.json(world.paradox.getState());
});

app.get("/api/timelines", (req, res) => {
  res.json(world.timelineEngine.getState());
});

// =========================
// 🔁 LOOP
// =========================

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("💀🌀 V109 PARADOX ENGINE CORE ONLINE :3000");
  console.log("🔥 Один бог может существовать в нескольких реальностях и конфликтовать с собой!");
});
