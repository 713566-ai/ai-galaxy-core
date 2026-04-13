// =========================
// 🌍 CORE V96 — GIFT + NFT SYSTEM
// =========================

const express = require("express");
const app = express();

class World {
  constructor() {
    this.agents = [];
    this.gifts = [];
    this.nfts = [];
    this.tick = 0;
    this.entropy = 0.3;
    this.history = { gifts: 0, nfts: 0, transfers: 0 };
  }

  addAgent(agent) {
    this.agents.push(agent);
  }

  createGift(from, to, type = "energy") {
    const value = Math.random() * 0.2 + 0.05;
    if (from.energy <= value * 1.1) return null;
    from.energy -= value * 1.1;
    to.energy += value;
    if (!to.trust[from.name]) to.trust[from.name] = 0;
    to.trust[from.name] += 0.1;
    to.trust[from.name] = Math.min(1, to.trust[from.name]);
    from.giftsGiven++;
    to.giftsReceived++;
    const gift = {
      id: `gift_${this.tick}_${from.name}_${to.name}`,
      tick: this.tick,
      from: from.name,
      to: to.name,
      type,
      value: value.toFixed(3),
    };
    this.gifts.push(gift);
    this.history.gifts++;
    if (this.gifts.length > 200) this.gifts.shift();
    return gift;
  }

  mintNFT(owner, metadata = null) {
    const power = Math.random() * 0.5 + 0.2;
    const nft = {
      id: `NFT_${this.tick}_${Math.random().toString(36).slice(2, 8)}`,
      owner: owner.name,
      power: power,
      metadata: metadata || {
        type: "memory-fragment",
        entropy: this.entropy,
        emotion: Math.random(),
        createdAt: this.tick,
      },
      createdAt: this.tick,
      transferHistory: [],
    };
    owner.nfts.push(nft);
    this.nfts.push(nft);
    this.history.nfts++;
    return nft;
  }

  transferNFT(nftId, from, to) {
    const nft = this.nfts.find(n => n.id === nftId);
    if (!nft || nft.owner !== from.name) return false;
    from.nfts = from.nfts.filter(n => n.id !== nftId);
    to.nfts.push(nft);
    nft.owner = to.name;
    nft.transferHistory.push({ from: from.name, to: to.name, tick: this.tick });
    this.history.transfers++;
    return true;
  }

  applyNFTEffects() {
    for (const agent of this.agents) {
      let totalPower = 0;
      for (const nft of agent.nfts) totalPower += nft.power;
      agent.nftPower = totalPower;
      agent.fitness += totalPower * 0.01;
      agent.fitness = Math.min(1, agent.fitness);
    }
  }

  evolveGiftTendency() {
    for (const agent of this.agents) {
      if (agent.giftsReceived > agent.giftsGiven) agent.giftTendency += 0.02;
      else if (agent.giftsGiven > agent.giftsReceived * 2) agent.giftTendency -= 0.01;
      agent.giftTendency = Math.max(0.1, Math.min(0.9, agent.giftTendency));
    }
  }

  updateAgents() {
    for (const agent of this.agents) {
      agent.energy += 0.02;
      agent.energy = Math.min(1, agent.energy);
      agent.reputation = (agent.giftsGiven + agent.giftsReceived) / (agent.giftsGiven + agent.giftsReceived + 1);
      if (Math.random() < agent.giftTendency * 0.3) {
        const possibleTargets = this.agents.filter(a => a.name !== agent.name);
        if (possibleTargets.length > 0) {
          const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          this.createGift(agent, target, "energy");
        }
      }
      if (Math.random() < 0.08) this.mintNFT(agent);
    }
  }

  step() {
    this.tick++;
    this.updateAgents();
    this.applyNFTEffects();
    this.evolveGiftTendency();
    this.entropy += (Math.random() - 0.5) * 0.01;
    this.entropy = Math.max(0.1, Math.min(0.9, this.entropy));
    if (this.tick % 20 === 0) {
      console.log(`🎁 T${this.tick} | Entropy:${this.entropy.toFixed(3)} | Gifts:${this.history.gifts} | NFTs:${this.history.nfts} | Transfers:${this.history.transfers}`);
    }
  }
}

class Agent {
  constructor(name) {
    this.name = name;
    this.energy = 1;
    this.fitness = 0.5;
    this.giftTendency = 0.5 + Math.random() * 0.3;
    this.trust = {};
    this.reputation = 0.5;
    this.nfts = [];
    this.giftsGiven = 0;
    this.giftsReceived = 0;
    this.nftPower = 0;
  }
}

const world = new World();
world.addAgent(new Agent("codey"));
world.addAgent(new Agent("uiax"));
world.addAgent(new Agent("garlic"));

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
      reputation: a.reputation.toFixed(2),
      nfts: a.nfts.length,
      nftPower: a.nftPower.toFixed(2),
      giftsGiven: a.giftsGiven,
      giftsReceived: a.giftsReceived,
      trust: a.trust,
    })),
    nfts: world.nfts.slice(-10).map(n => ({ id: n.id, owner: n.owner, power: n.power.toFixed(2) })),
    gifts: world.gifts.slice(-10),
  });
});

app.post("/api/gift", (req, res) => {
  const { from, to, type } = req.body;
  const fromAgent = world.agents.find(a => a.name === from);
  const toAgent = world.agents.find(a => a.name === to);
  if (!fromAgent || !toAgent) return res.status(404).json({ error: "Agent not found" });
  const gift = world.createGift(fromAgent, toAgent, type || "energy");
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

app.post("/api/nft/transfer", (req, res) => {
  const { nftId, from, to } = req.body;
  const fromAgent = world.agents.find(a => a.name === from);
  const toAgent = world.agents.find(a => a.name === to);
  if (!fromAgent || !toAgent) return res.status(404).json({ error: "Agent not found" });
  const success = world.transferNFT(nftId, fromAgent, toAgent);
  if (success) res.json({ success: true, nftId, from, to });
  else res.status(400).json({ error: "Transfer failed" });
});

app.get("/api/gifts", (req, res) => {
  res.json({ gifts: world.gifts.slice(-50), total: world.history.gifts });
});

app.get("/api/nfts", (req, res) => {
  res.json({ nfts: world.nfts.slice(-50), total: world.history.nfts });
});

setInterval(() => world.step(), 1000);

app.listen(3000, () => {
  console.log("🎁🖼 V96 GIFT + NFT ECONOMY CORE ONLINE :3000");
});
