const express = require("express");
const app = express();
app.use(express.json());

const PORT = 3003;

// =====================
// 🌌 SWARM STATE
// =====================
let swarm = {
  tick: 0,
  entropy: 0.5,
  nodes: {},
  stats: {
    born: 0,
    died: 0,
    mutations: 0,
    revivals: 0
  },
  startTime: Date.now()
};

// =====================
// 🧬 INITIAL NODES (11 warfare cores)
// =====================
for (let i = 0; i <= 10; i++) {
  const port = 3100 + i;
  swarm.nodes[`warfare-${port}`] = {
    name: `warfare-${port}`,
    port: port,
    status: "alive",
    health: 0.8 + Math.random() * 0.4,
    entropy: 0.4 + Math.random() * 0.3,
    age: 0,
    lastSeen: Date.now(),
    generation: 1,
    mutations: []
  };
}

// =====================
// 🧠 LIFE CYCLE ENGINE
// =====================
setInterval(() => {
  swarm.tick++;

  // 🌍 global entropy drift (хаос)
  swarm.entropy += (Math.random() - 0.5) * 0.02;
  swarm.entropy = Math.max(0.05, Math.min(0.95, swarm.entropy));

  let aliveCount = 0;
  let deadCount = 0;

  for (const [name, node] of Object.entries(swarm.nodes)) {
    node.age++;
    
    // 🧬 health decay based on entropy and age
    const decayRate = 0.005 + (swarm.entropy * 0.01) + (node.age / 10000);
    node.health -= decayRate;
    
    // 🧬 entropy drift for each node
    node.entropy += (Math.random() - 0.5) * 0.02;
    node.entropy = Math.max(0.1, Math.min(0.9, node.entropy));
    
    // 🧬 MUTATION (random behaviour change)
    if (Math.random() < 0.03) {
      const mutationTypes = ['aggressive', 'passive', 'adaptive', 'chaotic', 'stable'];
      const mutation = mutationTypes[Math.floor(Math.random() * mutationTypes.length)];
      node.mutations.push({
        type: mutation,
        tick: swarm.tick,
        entropy: node.entropy
      });
      swarm.stats.mutations++;
      console.log(`🧬 [MUTATION] ${name} → ${mutation} at tick ${swarm.tick}`);
    }
    
    // 💀 DEATH CONDITION
    if (node.health <= 0 && node.status === "alive") {
      node.status = "dead";
      node.deathTick = swarm.tick;
      node.deathCause = node.entropy > 0.6 ? "chaos_overload" : "health_decay";
      swarm.stats.died++;
      console.log(`💀 [DEATH] ${name} died at tick ${swarm.tick} (${node.deathCause})`);
    }
    
    // 🌱 REVIVE (self-healing)
    if (node.status === "dead" && Math.random() < (0.05 + (1 - swarm.entropy) * 0.1)) {
      node.status = "alive";
      node.health = 0.6 + Math.random() * 0.3;
      node.generation++;
      swarm.stats.revivals++;
      console.log(`🌱 [REVIVE] ${name} reborn! Generation ${node.generation}`);
    }
    
    if (node.status === "alive") aliveCount++;
    else deadCount++;
  }
  
  // 🌱 AUTO-SPAWN (birth of new nodes)
  // Когда энтропия высокая или мало живых узлов
  const spawnChance = (1 - (aliveCount / Object.keys(swarm.nodes).length)) * 0.3 + swarm.entropy * 0.1;
  
  if (Math.random() < spawnChance && Object.keys(swarm.nodes).length < 25) {
    const newPort = 3200 + Math.floor(Math.random() * 100);
    const newNodeName = `spawn-${newPort}`;
    swarm.nodes[newNodeName] = {
      name: newNodeName,
      port: newPort,
      status: "alive",
      health: 0.7 + Math.random() * 0.3,
      entropy: swarm.entropy + (Math.random() - 0.5) * 0.2,
      age: 0,
      lastSeen: Date.now(),
      generation: 1,
      mutations: [],
      spawned: true
    };
    swarm.stats.born++;
    console.log(`🌱 [BIRTH] New node ${newNodeName} born at tick ${swarm.tick}`);
  }
  
  // 🔥 CHAOS EVENT (иногда все страдают)
  if (swarm.entropy > 0.8 && Math.random() < 0.05) {
    console.log(`🔥 [CHAOS EVENT] Entropy spike! All nodes damaged`);
    for (const node of Object.values(swarm.nodes)) {
      node.health -= 0.1;
    }
  }
  
  // ✨ STABILIZATION EVENT
  if (swarm.entropy < 0.2 && Math.random() < 0.05) {
    console.log(`✨ [STABILIZATION] Entropy drop! All nodes healed`);
    for (const node of Object.values(swarm.nodes)) {
      node.health = Math.min(1, node.health + 0.15);
    }
  }
  
  // Логирование каждые 20 тиков
  if (swarm.tick % 20 === 0) {
    const total = Object.keys(swarm.nodes).length;
    console.log(`\n💀 [SWARM] Tick ${swarm.tick} | Entropy: ${swarm.entropy.toFixed(3)} | Alive: ${aliveCount}/${total} | Born: ${swarm.stats.born} | Died: ${swarm.stats.died} | Mutations: ${swarm.stats.mutations}`);
  }
  
}, 1000);

// =====================
// 📡 API
// =====================

// Главный статус
app.get("/", (req, res) => {
  res.json({
    status: "💀 V128 SWARM LIFE ENGINE",
    version: "2.0",
    uptime: Math.floor((Date.now() - swarm.startTime) / 1000),
    tick: swarm.tick,
    entropy: swarm.entropy.toFixed(4),
    stats: swarm.stats
  });
});

// Детальный статус
app.get("/api/status", (req, res) => {
  const alive = Object.values(swarm.nodes).filter(n => n.status === "alive").length;
  const dead = Object.keys(swarm.nodes).length - alive;
  
  // Аналитика по поколениям
  const generations = {};
  for (const node of Object.values(swarm.nodes)) {
    const gen = node.generation || 1;
    generations[gen] = (generations[gen] || 0) + 1;
  }
  
  res.json({
    status: "💀 V128 SWARM LIFE ENGINE",
    tick: swarm.tick,
    entropy: swarm.entropy,
    alive,
    dead,
    total: Object.keys(swarm.nodes).length,
    stats: swarm.stats,
    generations,
    nodes: swarm.nodes
  });
});

// Получить конкретную ноду
app.get("/api/node/:name", (req, res) => {
  const node = swarm.nodes[req.params.name];
  if (node) {
    res.json(node);
  } else {
    res.status(404).json({ error: "Node not found" });
  }
});

// Принудительная мутация
app.post("/api/mutate/:name", (req, res) => {
  const node = swarm.nodes[req.params.name];
  if (node) {
    node.entropy += (Math.random() - 0.5) * 0.2;
    node.health -= 0.05;
    res.json({ mutated: true, entropy: node.entropy, health: node.health });
  } else {
    res.status(404).json({ error: "Node not found" });
  }
});

// Принудительное рождение ноды
app.post("/api/spawn", (req, res) => {
  const newPort = 3200 + Math.floor(Math.random() * 100);
  const newNodeName = `spawn-${newPort}-${Date.now()}`;
  swarm.nodes[newNodeName] = {
    name: newNodeName,
    port: newPort,
    status: "alive",
    health: 0.7 + Math.random() * 0.3,
    entropy: swarm.entropy + (Math.random() - 0.5) * 0.2,
    age: 0,
    lastSeen: Date.now(),
    generation: 1,
    mutations: [],
    spawned: true
  };
  swarm.stats.born++;
  res.json({ spawned: true, name: newNodeName });
});

// Эволюционная статистика
app.get("/api/evolution", (req, res) => {
  const alive = Object.values(swarm.nodes).filter(n => n.status === "alive");
  const avgHealth = alive.reduce((sum, n) => sum + n.health, 0) / (alive.length || 1);
  const avgEntropy = alive.reduce((sum, n) => sum + n.entropy, 0) / (alive.length || 1);
  const avgAge = alive.reduce((sum, n) => sum + n.age, 0) / (alive.length || 1);
  
  res.json({
    evolution: {
      averageHealth: avgHealth.toFixed(3),
      averageEntropy: avgEntropy.toFixed(3),
      averageAge: Math.floor(avgAge),
      totalMutations: swarm.stats.mutations,
      totalBirths: swarm.stats.born,
      totalDeaths: swarm.stats.died,
      revivalRate: (swarm.stats.revivals / swarm.stats.died * 100).toFixed(1) + '%'
    }
  });
});

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
  console.log("║   💀 V128 SWARM LIFE ENGINE — GENESIS UPDATE                               ║");
  console.log("║   ✅ Birth | ✅ Growth | ✅ Decay | ✅ Death | ✅ Revival | ✅ Mutation     ║");
  console.log("║   ✅ Auto-spawn | ✅ Chaos events | ✅ Stabilization | ✅ Evolution         ║");
  console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
  console.log(`\n🔗 Swarm Life Engine: http://127.0.0.1:${PORT}`);
  console.log(`📊 Status: http://127.0.0.1:${PORT}/api/status`);
  console.log(`🧬 Evolution: http://127.0.0.1:${PORT}/api/evolution\n`);
});
