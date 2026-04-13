// =========================
// 💀 V96 GIFT SYSTEM — ЭКОНОМИКА ДОВЕРИЯ
// =========================

const express = require("express");
const app = express();

// =========================
// 📊 НАЧАЛЬНОЕ СОСТОЯНИЕ
// =========================

let state = {
  tick: 0,

  world: {
    entropy: 0.55,
    trustLevel: 0.5,
    giftEconomy: 0.3,
  },

  empires: [
    {
      id: "E1",
      name: "Aurora",
      ideology: "harmony",
      economy: { wealth: 120, production: 10, consumption: 8 },
      strength: 0.7,
      territory: 60,
      cohesion: 0.8,
      status: "stable",
    },
    {
      id: "E2",
      name: "Obsidian",
      ideology: "dominion",
      economy: { wealth: 80, production: 7, consumption: 9 },
      strength: 0.6,
      territory: 40,
      cohesion: 0.6,
      status: "stable",
    },
  ],

  agents: [
    { name: "codey", loyalty: "E1", fitness: 0.6, energy: 1, productivity: 1.2,
      giftTendency: 0.7, trust: {}, reputation: 0.5, giftsGiven: 0, giftsReceived: 0 },
    { name: "uiax", loyalty: "E1", fitness: 0.55, energy: 1, productivity: 1.0,
      giftTendency: 0.5, trust: {}, reputation: 0.5, giftsGiven: 0, giftsReceived: 0 },
    { name: "garlic", loyalty: "E2", fitness: 0.4, energy: 1, productivity: 0.8,
      giftTendency: 0.3, trust: {}, reputation: 0.5, giftsGiven: 0, giftsReceived: 0 },
  ],

  gifts: [],  // История подарков
  history: { wars: 0, collapses: 0, gifts: 0, giftValue: 0 },
};

// =========================
// 🎁 ФУНКЦИЯ СОЗДАНИЯ ПОДАРКА
// =========================

function createGift(fromAgent, toAgent, type = "energy", value = null) {
  if (!value) value = 0.05 + Math.random() * 0.15;
  
  // Проверка, есть ли у дарителя достаточно энергии
  if (type === "energy" && fromAgent.energy < value) return null;
  
  const gift = {
    id: `gift_${state.tick}_${fromAgent.name}_${toAgent.name}`,
    tick: state.tick,
    from: fromAgent.name,
    to: toAgent.name,
    type: type,
    value: value,
    reason: "trust",
  };
  
  // Применение эффекта
  if (type === "energy") {
    fromAgent.energy -= value * 1.1; // Стоимость альтруизма
    toAgent.energy += value;
  } else if (type === "influence") {
    fromAgent.fitness -= value * 0.5;
    toAgent.fitness += value * 0.8;
  }
  
  // Обновление доверия
  if (!toAgent.trust[fromAgent.name]) toAgent.trust[fromAgent.name] = 0;
  toAgent.trust[fromAgent.name] += value * 0.5;
  toAgent.trust[fromAgent.name] = Math.min(1, toAgent.trust[fromAgent.name]);
  
  // Обновление репутации
  fromAgent.reputation += value * 0.1;
  fromAgent.reputation = Math.min(1, fromAgent.reputation);
  
  fromAgent.giftsGiven++;
  toAgent.giftsReceived++;
  
  state.gifts.push(gift);
  if (state.gifts.length > 200) state.gifts.shift();
  
  state.history.gifts++;
  state.history.giftValue += value;
  
  return gift;
}

// =========================
// 🎁 АВТОМАТИЧЕСКИЕ ПОДАРКИ (НА ОСНОВЕ TENDENCY)
// =========================

function autoGifts() {
  for (let i = 0; i < state.agents.length; i++) {
    const fromAgent = state.agents[i];
    
    // Шанс сделать подарок
    if (Math.random() < fromAgent.giftTendency * 0.3) {
      // Выбор получателя (не сам себе)
      const possibleTargets = state.agents.filter(a => a.name !== fromAgent.name);
      if (possibleTargets.length === 0) continue;
      
      const toAgent = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
      
      // Агенты чаще дарят тем, кому доверяют
      const trustBonus = (toAgent.trust[fromAgent.name] || 0) * 0.5;
      if (Math.random() < fromAgent.giftTendency + trustBonus) {
        createGift(fromAgent, toAgent, "energy");
      }
    }
  }
}

// =========================
// 🧠 ВЛИЯНИЕ ДОВЕРИЯ НА СИСТЕМУ
// =========================

function trustEffects() {
  // Доверие внутри империй увеличивает сплочённость
  state.empires.forEach(empire => {
    const empireAgents = state.agents.filter(a => a.loyalty === empire.id);
    let avgTrust = 0;
    for (const agent of empireAgents) {
      for (const [target, trust] of Object.entries(agent.trust)) {
        const targetAgent = state.agents.find(a => a.name === target);
        if (targetAgent && targetAgent.loyalty === empire.id) {
          avgTrust += trust;
        }
      }
    }
    avgTrust = avgTrust / (empireAgents.length || 1);
    empire.cohesion += avgTrust * 0.02;
    empire.cohesion = Math.min(1, empire.cohesion);
  });
  
  // Глобальный уровень доверия
  let totalTrust = 0;
  let trustCount = 0;
  for (const agent of state.agents) {
    for (const trust of Object.values(agent.trust)) {
      totalTrust += trust;
      trustCount++;
    }
  }
  state.world.trustLevel = trustCount > 0 ? totalTrust / trustCount : 0.5;
  
  // Высокое доверие снижает энтропию
  state.world.entropy -= state.world.trustLevel * 0.01;
  state.world.entropy = Math.max(0.1, Math.min(0.95, state.world.entropy));
}

// =========================
// 💀 КОЛЛАПС ОТ НЕДОВЕРИЯ
// =========================

function distrustCollapse() {
  state.empires.forEach(empire => {
    const empireAgents = state.agents.filter(a => a.loyalty === empire.id);
    let distrustSum = 0;
    for (const agent of empireAgents) {
      for (const [target, trust] of Object.entries(agent.trust)) {
        if (trust < 0.2) distrustSum += (0.2 - trust);
      }
    }
    if (distrustSum > 1.5 && empire.cohesion < 0.4) {
      empire.status = "trust_collapse";
      state.history.collapses++;
      console.log(`💀 TRUST COLLAPSE in ${empire.name}`);
    }
  });
}

// =========================
// 🧬 ЭВОЛЮЦИЯ GIFT TENDENCY
// =========================

function evolveGiftTendency() {
  state.agents.forEach(agent => {
    // Агенты, которые получают много подарков, становятся щедрее
    if (agent.giftsReceived > agent.giftsGiven) {
      agent.giftTendency += 0.02;
    } else if (agent.giftsGiven > agent.giftsReceived * 2) {
      // Слишком щедрые становятся более эгоистичными
      agent.giftTendency -= 0.01;
    }
    agent.giftTendency = Math.max(0.1, Math.min(0.9, agent.giftTendency));
  });
}

// =========================
// 📊 ЭКОНОМИЧЕСКОЕ ВЛИЯНИЕ ПОДАРКОВ
// =========================

function giftEconomyEffect() {
  let totalGiftValue = state.history.giftValue;
  state.world.giftEconomy = Math.min(0.8, totalGiftValue / 100);
  
  // Слишком много подарков может ослабить экономику
  if (state.world.giftEconomy > 0.5) {
    state.empires.forEach(empire => {
      empire.economy.wealth -= state.world.giftEconomy * 5;
    });
  }
}

// =========================
// 🔁 MAIN STEP (V96)
// =========================

function step() {
  state.tick++;
  
  autoGifts();
  trustEffects();
  distrustCollapse();
  evolveGiftTendency();
  giftEconomyEffect();
  
  // Базовая экономика
  state.empires.forEach(empire => {
    empire.economy.wealth += empire.economy.production;
    empire.economy.wealth -= empire.economy.consumption;
    if (empire.economy.wealth < 0) empire.strength -= 0.02;
    empire.strength = Math.max(0.1, Math.min(1, empire.strength));
  });
  
  // Энтропия
  state.world.entropy += (Math.random() - 0.5) * 0.01;
  state.world.entropy = Math.max(0.1, Math.min(0.95, state.world.entropy));
  
  if (state.tick % 20 === 0) {
    console.log(`🎁 V96 T${state.tick} | Gifts:${state.history.gifts} | Trust:${state.world.trustLevel.toFixed(2)} | Entropy:${state.world.entropy.toFixed(2)}`);
  }
}

// =========================
// 🚀 API
// =========================

app.get("/api/status", (req, res) => {
  res.json({
    tick: state.tick,
    world: { entropy: state.world.entropy, trustLevel: state.world.trustLevel, giftEconomy: state.world.giftEconomy },
    empires: state.empires.map(e => ({ name: e.name, strength: e.strength.toFixed(2), cohesion: e.cohesion.toFixed(2), status: e.status })),
    agents: state.agents.map(a => ({ name: a.name, giftTendency: a.giftTendency.toFixed(2), reputation: a.reputation.toFixed(2), trust: a.trust })),
    history: { gifts: state.history.gifts, giftValue: state.history.giftValue.toFixed(0), wars: state.history.wars, collapses: state.history.collapses }
  });
});

app.post("/api/gift", (req, res) => {
  const { from, to, type, value } = req.body;
  const fromAgent = state.agents.find(a => a.name === from);
  const toAgent = state.agents.find(a => a.name === to);
  if (!fromAgent || !toAgent) return res.status(404).json({ error: "Agent not found" });
  const gift = createGift(fromAgent, toAgent, type || "energy", value);
  if (gift) res.json(gift);
  else res.status(400).json({ error: "Not enough energy" });
});

app.get("/api/gifts", (req, res) => {
  res.json({ gifts: state.gifts.slice(-50), total: state.history.gifts });
});

// =========================
// 🔁 LOOP
// =========================
setInterval(step, 500);

app.listen(3000, () => {
  console.log("🎁 V96 GIFT SYSTEM — ЭКОНОМИКА ДОВЕРИЯ ONLINE :3000");
});
