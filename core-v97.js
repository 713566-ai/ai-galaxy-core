// =========================
// 💀 V97 — BETRAYAL NFT WAR CORE
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
  // 🎁 GIFT (V96 legacy)
  // =========================
  gift(from, to) {
    const value = Math.random() * 0.2 + 0.05;
    if (from.energy <= value) return null;
    from.energy -= value;
    to.energy += value;
    if (!to.trust[from.name]) to.trust[from.name] = 0;
    to.trust[from.name] += 0.1;
    this.history.gifts++;
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
    return nft;
  }

  // =========================
  // 💀 BETRAYAL SYSTEM
  // =========================
  betray(agent) {
    const possibleTargets = this.agents.filter(a => a !== agent && a.nfts.length > 0);
    if (possibleTargets.length === 0) return null;
    
    const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
    
    // Кража NFT
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
      
      // Trust collapse
      target.trust[agent.name] = -0.5;
      agent.energy += 0.2;
      target.energy -= 0.3;
      target.energy = Math.max(0.1, target.energy);
      
      // Возможная смена лояльности
      if (Math.random() < 0.2 && agent.loyalty !== target.loyalty) {
        agent.loyalty = target.loyalty;
      }
      
      return betrayal;
    }
    return null;
  }

  // =========================
  // ⚔️ NFT WAR ENGINE
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
    
    // Кража NFT у проигравшего
    if (loser.nfts.length > 0) {
      const stolen = loser.nfts.pop();
      if (stolen) {
        stolen.owner = winner.name;
        winner.nfts.push(stolen);
      }
    }
    
    loser.energy -= 0.4;
    winner.energy += 0.2;
    loser.energy = Math.max(0.1, loser.energy);
    winner.energy = Math.min(1, winner.energy);
    
    this.entropy += 0.02;
    this.entropy = Math.min(0.9, this.entropy);
    
    return { winner: winner.name, loser: loser.name, powerDiff: powerDiff.toFixed(2) };
  }

  // =========================
  // 🔁 STEP LOOP
  // =========================
  step() {
    this.tick++;
    
    for (let a of this.agents) {
      a.energy += 0.02;
      a.energy = Math.min(1, a.energy);
      
      // Gift
      if (Math.random() < (a.giftTendency || 0.5) * 0.3) {
        const t = this.agents[Math.floor(Math.random() * this.agents.length)];
        if (t !== a) this.gift(a, t);
      }
      
      // NFT mint
      if (Math.random() < 0.05) {
        this.mintNFT(a);
      }
      
      // Betrayal
      if (Math.random() < 0.08) {
        this.betray(a);
      }
    }
    
    // NFT war events
    if (Math.random() < 0.12) {
      const war = this.nftWar();
      if (war) console.log(`⚔️ WAR: ${war.winner} defeated ${war.loser}`);
    }
    
    this.entropy += (Math.random() - 0.5) * 0.01;
    this.entropy = Math.max(0.1, Math.min(0.95, this.entropy));
    
    if (this.tick % 20 === 0) {
      console.log(`💀 T${this.tick} | NFTs:${this.nfts.length} | Betrayals:${this.history.betrayals} | Wars:${this.history.wars} | Entropy:${this.entropy.toFixed(3)}`);
    }
  }
}

// =========================
// 👤 AGENTS
// =========================
class Agent {
  constructor(name, loyalty = "E1") {
    this.name = name;
    this.energy = 1;
    this.fitness = 0.5;
    this.giftTendency = 0.4 + Math.random() * 0.4;
    this.trust = {};
    this.nfts = [];
    this.loyalty = loyalty;
    this.betrayals = 0;
    this.wins = 0;
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
      giftTendency: a.giftTendency.toFixed(2),
      loyalty: a.loyalty,
      nfts: a.nfts.length,
      nftPower: a.nfts.reduce((s, n) => s + n.power, 0).toFixed(2),
      trust: a.trust,
    })),
    nfts: world.nfts.slice(-10).map(n => ({ id: n.id, owner: n.owner, power: n.power.toFixed(2), corrupted: n.corrupted })),
    betrayals: world.betrayals.slice(-10),
  });
});

app.post("/api/betray", (req, res) => {
  const { agentName } = req.body;
  const agent = world.agents.find(a => a.name === agentName);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  const betrayal = world.betray(agent);
  if (betrayal) res.json(betrayal);
  else res.status(400).json({ error: "No target to betray" });
});

app.post("/api/gift", (req, res) => {
  const { from, to } = req.body;
  const fromAgent = world.agents.find(a => a.name === from);
  const toAgent = world.agents.find(a => a.name === to);
  if (!fromAgent || !toAgent) return res.status(404).json({ error: "Agent not found" });
  const gift = world.gift(fromAgent, toAgent);
  if (gift) res.json(gift);
  else res.status(400).json({ error: "Not enough energy" });
});

app.post("/api/nft/mint", (req, res) => {
  const { owner } = req.body;
  const agent = world.agents.find(a => a.name === owner);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  const nft = world.mintNFT(agent);
  res.json(nft);
});

app.get("/api/nfts", (req, res) => {
  res.json({ nfts: world.nfts.slice(-30), total: world.history.nfts });
});

app.get("/api/betrayals", (req, res) => {
  res.json({ betrayals: world.betrayals.slice(-30), total: world.history.betrayals });
});

// =========================
// 🔁 LOOP
// =========================
setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("💀 V97 BETRAYAL NFT WAR CORE ONLINE :3000");
});
