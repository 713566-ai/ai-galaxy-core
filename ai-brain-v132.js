const axios = require("axios");
const { remember, getMemory, getBestAction } = require("./memory-v132");

const SWARM_URL = "http://127.0.0.1:3003/api/status";
const SWARM_DECISION_URL = "http://127.0.0.1:3003/api/brain";

let brain = {
  tick: 0,
  decisions: [],
  mood: "neutral",
  startTime: Date.now(),
  stats: {
    decisionsMade: 0,
    actionsTaken: 0,
    learningRate: 0
  },
  lastAction: null,
  lastState: null
};

async function think() {
  try {
    const { data } = await axios.get(SWARM_URL);
    
    brain.tick++;
    
    // Анализируем результат предыдущего действия
    if (brain.lastAction && brain.lastState) {
      const improvement = data.alive - brain.lastState.alive;
      const success = improvement > 0 || (improvement === 0 && data.entropy < 0.55);
      
      // Запоминаем результат
      remember({
        tick: brain.lastState.tick,
        alive: brain.lastState.alive,
        entropy: brain.lastState.entropy,
        consciousness: brain.lastState.consciousness,
        health: brain.lastState.health,
        action: brain.lastAction.type,
        success: success
      });
      
      if (success) {
        brain.mood = "learning-positive";
        brain.stats.learningRate = Math.min(1, brain.stats.learningRate + 0.01);
      } else {
        brain.mood = "learning-negative";
        brain.stats.learningRate = Math.max(0, brain.stats.learningRate - 0.005);
      }
    }
    
    // Получаем обученное лучшее действие
    let action = null;
    const bestAction = getBestAction(data);
    
    if (bestAction && Math.random() < brain.stats.learningRate + 0.3) {
      // Используем обученное действие
      action = { type: bestAction, priority: "learned", source: "memory" };
      brain.mood = "using-memory";
    } else {
      // Используем базовую логику
      const survivalRate = data.alive / data.total;
      
      if (data.alive === 0) {
        action = { type: "revive_all", priority: "critical" };
        brain.mood = "panic";
      }
      else if (survivalRate < 0.3) {
        action = { type: "revive_all", priority: "high" };
        brain.mood = "worried";
      }
      else if (data.consciousness > 0.9) {
        action = { type: "evolve", priority: "medium" };
        brain.mood = "evolving";
      }
      else if (data.entropy > 0.65) {
        action = { type: "stabilize", priority: "medium" };
        brain.mood = "balancing";
      }
      else if (data.entropy < 0.35) {
        action = { type: "boost_entropy", priority: "low" };
        brain.mood = "energetic";
      }
      else {
        action = { type: "balance", priority: "low" };
        brain.mood = "neutral";
      }
    }
    
    brain.stats.decisionsMade++;
    brain.stats.actionsTaken++;
    
    // Запоминаем текущее состояние
    brain.lastState = {
      tick: data.tick,
      alive: data.alive,
      entropy: data.entropy,
      consciousness: data.consciousness,
      health: data.health
    };
    brain.lastAction = action;
    
    // Отправляем решение в swarm
    await axios.post(SWARM_DECISION_URL, action);
    
    brain.decisions.push({
      tick: brain.tick,
      mood: brain.mood,
      action: action.type,
      source: action.source || "logic",
      learningRate: brain.stats.learningRate.toFixed(3),
      swarmState: {
        alive: data.alive,
        total: data.total,
        entropy: data.entropy.toFixed(3),
        consciousness: data.consciousness.toFixed(3),
        health: data.health
      }
    });
    
    if (brain.decisions.length > 30) brain.decisions.shift();
    
    // Логирование
    console.log(`\n🧠 [AI BRAIN V132] tick:${brain.tick} | mood:${brain.mood} | learning:${brain.stats.learningRate.toFixed(3)}`);
    console.log(`   📊 Swarm: ${data.alive}/${data.total} alive | entropy:${data.entropy.toFixed(3)} | health:${data.health}`);
    console.log(`   🎯 Decision: ${action.type} (${action.source || 'logic'})`);
    
  } catch (error) {
    console.log(`🧠 [AI BRAIN] ERROR: ${error.message}`);
  }
}

// Запускаем цикл мышления (каждые 3 секунды)
setInterval(think, 3000);

// Вывод статистики памяти каждые 30 секунд
setInterval(() => {
  const memory = require("./memory-v132").getMemory();
  console.log(`\n📚 [MEMORY] Stats: ${memory.stats.totalDecisions} decisions | ${memory.stats.successfulDecisions} successful | Patterns: ${Object.keys(memory.patterns).length}`);
}, 30000);

console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   🧠 AI BRAIN V132 — MEMORY + LEARNING CORE                               ║");
console.log("║   ✅ Память | ✅ Обучение | ✅ Адаптация | ✅ Анализ паттернов            ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
console.log(`\n🧠 AI Brain V132 active | Thinking every 3 seconds | Memory file: memory.json\n`);

process.on("SIGINT", () => {
  console.log("\n💀 AI Brain V132 stopped");
  process.exit();
});
