// =========================
// 🧠 V98 — MEMORY-DRIVEN PERSONALITY CORE
// =========================

const express = require("express");
const app = express();

class World {
  constructor() {
    this.agents = [];
    this.nfts = [];
    this.gifts = [];
    this.betrayals = [];
    this.tick = 0;
    this.entropy = 0.35;
    this.history = { gifts: 0, nfts: 0, betrayals: 0, wars: 0 };
  }

  addAgent(a) {
    this.agents.push(a);
  }

  // =========================
  // 🧠 MEMORY LOG FUNCTION
  // =========================
  logMemory(agent, type, data) {
    agent.memory.push({
      tick: this.tick,
      type,
      data,
      timestamp: Date.now(),
    });
    if (agent.memory.length > 50) agent.memory.shift();
  }

  // =========================
  // 💀 PERSONALITY UPDATE ENGINE
  // =========================
  updatePersonality(agent) {
    const recent = agent.memory.slice(-15);
    
    // Сброс временных эмоций
    agent.emotion = agent.emotion || { fear: 0.1, greed: 0.3, trust: 0.5, revenge: 0 };
    
    for (let e of recent) {
      if (e.type === "betrayal") {
        agent.emotion.revenge += 0.1;
        agent.emotion.trust -= 0.08;
        if (e.data.victim === agent.name) agent.emotion.fear += 0.05;
      }
      if (e.type === "gift") {
        agent.emotion.trust += 0.05;
        agent.emotion.greed -= 0.02;
      }
      if (e.type === "war") {
        agent.emotion.fear += 0.08;
        agent.emotion.greed += 0.05;
        if (e.data.winner === agent.name) agent.emotion.revenge -= 0.05;
        else agent.emotion.revenge += 0.1;
      }
      if (e.type === "nft_loss") {
        agent.emotion.revenge += 0.15;
        agent.emotion.fear += 0.1;
        agent.emotion.greed += 0.08;
      }
      if (e.type === "nft_gain") {
        agent.emotion.greed += 0.1;
        agent.emotion.trust += 0.03;
      }
    }
    
    // Clamp
    for (let k in agent.emotion) {
      agent.emotion[k] = Math.max(0, Math.min(1, agent.emotion[k]));
    }
    
    // Эволюция gift tendency от эмоций
    agent.giftTendency = 0.3 + agent.emotion.trust * 0.5 - agent.emotion.revenge * 0.3;
    agent.giftTendency = Math.max(0.1, Math.min(0.8, agent.giftTendency));
  }

  // =========================
  // 🎁 GIFT
  // =========================
  gift(from, to) {
    const value = Math.random() * 0.2 + 0.05;
    if (from.energy <= value) return null;
    from.energy -= value;
    to.energy += value;
    if (!to.trust[from.name]) to.trust[from.name] = 0;
    to.trust[from.name] += 0.1;
    this.history.gifts++;
    
    this.logMemory(from, "gift", { to: to.name, value });
    this.logMemory(to, "gift", { from: from.name, value });
    
    return { from: from.name, to: to.name, value: value.toFixed(3) };
  }

  // =========================
  // 🖼 NFT MINT
  // =========================
  mintNFT(owner) {
    const nft = {
      id: `NFT_${this.tick}_${Math.random().toString(36).slice(2, 8)}`,
      owner: owner.name,
      power: Math.random() * 0.8 + 0.2,
      corrupted: false,
      influence: Math.random() * 0.5,
      createdAt: this.tick,
    };
    owner.nfts.push(nft);
    this.nfts.push(nft);
    this.history.nfts++;
    this.logMemory(owner, "nft_gain", { nftId: nft.id, power: nft.power });
    return nft;
  }

  // =========================
  // 💀 BETRAYAL
  // =========================
  betray(agent) {
    const possibleTargets = this.agents.filter(a => a !== agent && a.nfts.length > 0);
    if (possibleTargets.length === 0) return null;
    
    const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    const stolen = target.nfts.pop();
    
    if (stolen) {
      stolen.owner = agent.name;
      stolen.corrupted = Math.random() < 0.3;
      agent.nfts.push(stolen);
      
      const betrayal = {
        id: `betrayal_${this.tick}_${agent.name}_${target.name}`,
        tick: this.tick,
        thief: agent.name,
        victim: target.name,
        nft: stolen.id,
      };
      
      this.betrayals.push(betrayal);
      this.history.betrayals++;
      
      target.trust[agent.name] = -0.5;
      agent.energy += 0.2;
      target.energy -= 0.3;
      target.energy = Math.max(0.1, target.energy);
      
      this.logMemory(agent, "betrayal", { victim: target.name, nft: stolen.id });
      this.logMemory(target, "betrayal", { thief: agent.name, nft: stolen.id });
      
      if (Math.random() < 0.2 && agent.loyalty !== target.loyalty) {
        agent.loyalty = target.loyalty;
      }
      
      return betrayal;
    }
    return null;
  }

  // =========================
  // ⚔️ NFT WAR
  // =========================
  nftWar() {
    const a = this.agents[Math.floor(Math.random() * this.agents.length)];
    const b = this.agents[Math.floor(Math.random() * this.agents.length)];
    if (!a || !b || a === b) return;
    
    const powerA = a.nfts.reduce((s, n) => s + n.power, 0) + a.energy;
    const powerB = b.nfts.reduce((s, n) => s + n.power, 0) + b.energy;
    const powerDiff = Math.abs(powerA - powerB);
    
    if (powerDiff < 0.3) return;
    
    this.history.wars++;
    const winner = powerA > powerB ? a : b;
    const loser = winner === a ? b : a;
    
    if (loser.nfts.length > 0) {
      const stolen = loser.nfts.pop();
      if (stolen) {
        stolen.owner = winner.name;
        winner.nfts.push(stolen);
        this.logMemory(winner, "nft_gain", { nftId: stolen.id, from: "war" });
        this.logMemory(loser, "nft_loss", { nftId: stolen.id, to: winner.name });
      }
    }
    
    loser.energy -= 0.4;
    winner.energy += 0.2;
    loser.energy = Math.max(0.1, loser.energy);
    winner.energy = Math.min(1, winner.energy);
    
    this.logMemory(winner, "war", { opponent: loser.name, result: "win" });
    this.logMemory(loser, "war", { opponent: winner.name, result: "loss" });
    
    this.entropy += 0.02;
    this.entropy = Math.min(0.9, this.entropy);
    
    return { winner: winner.name, loser: loser.name, powerDiff: powerDiff.toFixed(2) };
  }

  // =========================
  // 🧠 DECISION ENGINE (основана на эмоциях)
  // =========================
  makeDecision(agent) {
    const e = agent.emotion;
    
    // Месть
    if (e.revenge > 0.6 && Math.random() < 0.5) {
      return { action: "betray", reason: "revenge" };
    }
    // Доверие
    if (e.trust > 0.6 && Math.random() < 0.4) {
      return { action: "gift", reason: "trust" };
    }
    // Жадность
    if (e.greed > 0.6 && Math.random() < 0.4) {
      return { action: "mint_nft", reason: "greed" };
    }
    // Страх
    if (e.fear > 0.7 && Math.random() < 0.3) {
      return { action: "hide", reason: "fear" };
    }
    // Случайное действие
    return { action: "random", reason: "neutral" };
  }

  // =========================
  // 🔁 STEP LOOP
  // =========================
  step() {
    this.tick++;
    
    for (let a of this.agents) {
      a.energy += 0.02;
      a.energy = Math.min(1, a.energy);
      
      // Обновление личности на основе памяти
      this.updatePersonality(a);
      
      // Принятие решения на основе эмоций
      const decision = this.makeDecision(a);
      
      switch (decision.action) {
        case "betray":
          this.betray(a);
          break;
        case "gift":
          const target = this.agents[Math.floor(Math.random() * this.agents.length)];
          if (target !== a) this.gift(a, target);
          break;
        case "mint_nft":
          this.mintNFT(a);
          break;
        case "hide":
          a.energy += 0.05;
          break;
        default:
          // Случайное действие
          if (Math.random() < 0.05) this.betray(a);
          else if (Math.random() < 0.08) this.mintNFT(a);
          else if (Math.random() < 0.1) {
            const t = this.agents[Math.floor(Math.random() * this.agents.length)];
            if (t !== a) this.gift(a, t);
          }
          break;
      }
    }
    
    // NFT войны
    if (Math.random() < 0.1) {
      const war = this.nftWar();
      if (war) console.log(`⚔️ WAR: ${war.winner} defeated ${war.loser}`);
    }
    
    this.entropy += (Math.random() - 0.5) * 0.01;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    if (this.tick % 20 === 0) {
      console.log(`🧠 V98 T${this.tick} | Memory:${this.agents.reduce((s,a)=>s+a.memory.length,0)} | Betrayals:${this.history.betrayals} | Wars:${this.history.wars}`);
    }
  }
}

// =========================
// 👤 AGENT WITH MEMORY & EMOTION
// =========================
class Agent {
  constructor(name, loyalty = "E1") {
    this.name = name;
    this.energy = 1;
    this.fitness = 0.5;
    this.giftTendency = 0.5;
    this.trust = {};
    this.nfts = [];
    this.loyalty = loyalty;
    this.memory = [];
    this.emotion = { fear: 0.1, greed: 0.3, trust: 0.5, revenge: 0 };
    this.stats = { betrayals: 0, gifts: 0, wars: 0 };
  }
}

// =========================
// 🚀 INIT WORLD
// =========================
const world = new World();

world.addAgent(new Agent("codey", "E1"));
world.addAgent(new Agent("uiax", "E1"));
world.addAgent(new Agent("garlic", "E2"));

// =========================
// 🚀 API
// =========================
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    history: world.history,
    agents: world.agents.map(a => ({
      name: a.name,
      energy: a.energy.toFixed(2),
      fitness: a.fitness.toFixed(2),
      loyalty: a.loyalty,
      emotion: a.emotion,
      memorySize: a.memory.length,
      nfts: a.nfts.length,
      nftPower: a.nfts.reduce((s, n) => s + n.power, 0).toFixed(2),
      recentMemories: a.memory.slice(-5).map(m => ({ type: m.type, tick: m.tick })),
    })),
    nfts: world.nfts.slice(-10),
    betrayals: world.betrayals.slice(-10),
  });
});

app.get("/api/agent/:name/memory", (req, res) => {
  const agent = world.agents.find(a => a.name === req.params.name);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  res.json({ name: agent.name, memory: agent.memory.slice(-30), emotion: agent.emotion });
});

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🧠 V98 MEMORY-DRIVEN PERSONALITY CORE ONLINE :3000");
});
