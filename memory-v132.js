const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "memory.json");

// Структура памяти
let memory = {
  history: [],
  learnings: [],
  stats: {
    totalDecisions: 0,
    successfulDecisions: 0,
    failedDecisions: 0
  },
  patterns: {}
};

function loadMemory() {
  try {
    if (fs.existsSync(FILE)) {
      const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      memory = { ...memory, ...data };
    }
  } catch (e) {
    console.log("⚠️ Memory load error, using fresh memory");
  }
  return memory;
}

function saveMemory() {
  try {
    fs.writeFileSync(FILE, JSON.stringify(memory, null, 2));
  } catch (e) {
    console.log("⚠️ Memory save error");
  }
}

function remember(state) {
  memory.history.push({
    timestamp: Date.now(),
    tick: state.tick,
    alive: state.alive,
    entropy: state.entropy,
    consciousness: state.consciousness,
    health: state.health,
    action: state.action,
    success: state.success
  });
  
  // Ограничиваем историю
  if (memory.history.length > 100) {
    memory.history.shift();
  }
  
  memory.stats.totalDecisions++;
  if (state.success === true) {
    memory.stats.successfulDecisions++;
  } else if (state.success === false) {
    memory.stats.failedDecisions++;
  }
  
  // Анализ паттернов
  if (state.action) {
    const key = `${state.action}_${state.entropy > 0.5 ? 'high' : 'low'}`;
    memory.patterns[key] = (memory.patterns[key] || 0) + 1;
  }
  
  saveMemory();
}

function getMemory() {
  return memory;
}

function getBestAction(currentState) {
  // Анализ истории для выбора лучшего действия
  const similarStates = memory.history.filter(h => 
    Math.abs(h.entropy - currentState.entropy) < 0.1 &&
    Math.abs(h.alive - currentState.alive) < 2
  );
  
  if (similarStates.length === 0) return null;
  
  // Оцениваем успешность каждого действия
  const actionSuccess = {};
  for (const state of similarStates) {
    if (state.action && state.success !== undefined) {
      if (!actionSuccess[state.action]) {
        actionSuccess[state.action] = { total: 0, success: 0 };
      }
      actionSuccess[state.action].total++;
      if (state.success) actionSuccess[state.action].success++;
    }
  }
  
  // Выбираем действие с наивысшим процентом успеха
  let bestAction = null;
  let bestRate = 0;
  for (const [action, data] of Object.entries(actionSuccess)) {
    const rate = data.success / data.total;
    if (rate > bestRate) {
      bestRate = rate;
      bestAction = action;
    }
  }
  
  return bestAction;
}

function clearMemory() {
  memory = {
    history: [],
    learnings: [],
    stats: { totalDecisions: 0, successfulDecisions: 0, failedDecisions: 0 },
    patterns: {}
  };
  saveMemory();
  console.log("🧠 Memory cleared");
}

// Загружаем память при старте
loadMemory();

module.exports = { remember, getMemory, getBestAction, clearMemory };
