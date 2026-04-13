const axios = require("axios");

const SWARM_URL = "http://127.0.0.1:3003/api/status";
const SWARM_DECISION_URL = "http://127.0.0.1:3003/api/brain";

let brain = {
  tick: 0,
  decisions: [],
  mood: "neutral",
  startTime: Date.now(),
  stats: {
    decisionsMade: 0,
    actionsTaken: 0
  }
};

async function think() {
  try {
    const { data } = await axios.get(SWARM_URL);
    
    brain.tick++;
    
    let action = null;
    let mood = brain.mood;
    
    // 🧠 АНАЛИЗ СОСТОЯНИЯ
    const survivalRate = data.alive / data.total;
    
    if (data.alive === 0) {
      action = { type: "revive_all", priority: "critical" };
      mood = "panic";
      brain.stats.actionsTaken++;
    }
    else if (survivalRate < 0.3) {
      action = { type: "revive_all", priority: "high" };
      mood = "worried";
      brain.stats.actionsTaken++;
    }
    else if (data.consciousness > 0.9) {
      action = { type: "evolve", priority: "medium" };
      mood = "evolving";
      brain.stats.actionsTaken++;
    }
    else if (data.entropy > 0.65) {
      action = { type: "stabilize", priority: "medium" };
      mood = "balancing";
      brain.stats.actionsTaken++;
    }
    else if (data.entropy < 0.35) {
      action = { type: "boost_entropy", priority: "low" };
      mood = "energetic";
      brain.stats.actionsTaken++;
    }
    else {
      action = { type: "balance", priority: "low" };
      mood = "neutral";
    }
    
    brain.mood = mood;
    brain.stats.decisionsMade++;
    
    // Отправляем решение в swarm
    if (action) {
      await axios.post(SWARM_DECISION_URL, action);
    }
    
    brain.decisions.push({
      tick: brain.tick,
      mood: brain.mood,
      action: action.type,
      swarmState: {
        alive: data.alive,
        total: data.total,
        entropy: data.entropy,
        consciousness: data.consciousness,
        health: data.health
      }
    });
    
    if (brain.decisions.length > 20) brain.decisions.shift();
    
    // Логирование
    console.log(`\n🧠 [AI BRAIN] tick:${brain.tick} | mood:${brain.mood} | decisions:${brain.stats.decisionsMade}`);
    console.log(`   📊 Swarm: ${data.alive}/${data.total} alive | entropy:${data.entropy.toFixed(3)} | health:${data.health}`);
    console.log(`   🎯 Decision: ${action.type} (${action.priority})`);
    
  } catch (error) {
    console.log(`🧠 [AI BRAIN] ERROR: ${error.message}`);
  }
}

// Запускаем цикл мышления (каждые 3 секунды)
setInterval(think, 3000);

console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   🧠 AI BRAIN V131 — ПЕРВОЕ СОЗНАНИЕ                                      ║");
console.log("║   ✅ Наблюдение | ✅ Анализ | ✅ Принятие решений | ✅ Влияние на Swarm    ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
console.log(`\n🧠 AI Brain active | Thinking every 3 seconds\n`);

process.on("SIGINT", () => {
  console.log("\n💀 AI Brain stopped");
  process.exit();
});
