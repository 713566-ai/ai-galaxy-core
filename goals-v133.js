// ============================================
// 🎯 V133 GOALS SYSTEM — СИСТЕМА ЦЕЛЕЙ
// ============================================
// ✅ Авто-создание целей
// ✅ Приоритеты
// ✅ Отслеживание прогресса
// ✅ Авто-завершение
// ============================================

let goals = [];
let completedGoals = [];
let goalHistory = [];

function createGoal(type, priority = 1, target = null) {
  const goal = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
    type,
    priority,
    target,
    progress: 0,
    status: "active",
    createdAt: Date.now(),
    lastUpdate: Date.now()
  };
  
  goals.push(goal);
  console.log(`🎯 [GOAL CREATED] ${type} (priority: ${priority})`);
  return goal;
}

function updateGoals(state) {
  if (goals.length === 0) {
    // Создаём базовые цели при старте
    createGoal("stabilize_swarm", 3);
    createGoal("increase_consciousness", 2);
    createGoal("evolve_system", 1);
    createGoal("keep_nodes_alive", 4);
  }
  
  for (const goal of goals) {
    if (goal.status !== "active") continue;
    
    let oldProgress = goal.progress;
    
    switch (goal.type) {
      case "stabilize_swarm":
        // Стабилизация — энтропия должна быть в норме
        if (state.entropy >= 0.4 && state.entropy <= 0.6) {
          goal.progress += 0.05;
        } else if (state.entropy > 0.55 || state.entropy < 0.45) {
          goal.progress += 0.02;
        }
        break;
        
      case "increase_consciousness":
        // Сознание растёт
        goal.progress += state.consciousness * 0.03;
        break;
        
      case "evolve_system":
        // Эволюция с течением времени
        goal.progress += 0.01;
        break;
        
      case "keep_nodes_alive":
        // Держим узлы живыми
        const survivalRate = state.alive / state.total;
        goal.progress += survivalRate * 0.05;
        break;
        
      case "achieve_perfect_stability":
        // Все узлы живы и стабильны
        if (state.alive === state.total && state.health === "stable") {
          goal.progress += 0.1;
        }
        break;
        
      case "boost_entropy_to_target":
        // Целевая энтропия
        if (goal.target && state.entropy >= goal.target) {
          goal.progress += 0.1;
        }
        break;
        
      default:
        goal.progress += 0.01;
    }
    
    goal.progress = Math.min(1, goal.progress);
    goal.lastUpdate = Date.now();
    
    // Завершение цели
    if (goal.progress >= 1) {
      goal.status = "completed";
      goal.completedAt = Date.now();
      completedGoals.push(goal);
      goalHistory.push({
        type: goal.type,
        completedAt: goal.completedAt,
        duration: goal.completedAt - goal.createdAt
      });
      console.log(`✅ [GOAL COMPLETED] ${goal.type} (${Math.floor(goal.duration / 1000)}s)`);
      
      // Создаём новую, более сложную цель
      createNextGoal(goal.type, state);
    }
  }
  
  // Ограничиваем историю
  if (goalHistory.length > 50) goalHistory.shift();
  if (completedGoals.length > 20) completedGoals.shift();
}

function createNextGoal(completedType, state) {
  switch (completedType) {
    case "stabilize_swarm":
      createGoal("increase_consciousness", 2);
      break;
    case "increase_consciousness":
      if (state.consciousness > 0.7) {
        createGoal("evolve_system", 1);
      } else {
        createGoal("keep_nodes_alive", 3);
      }
      break;
    case "evolve_system":
      createGoal("achieve_perfect_stability", 4);
      break;
    case "keep_nodes_alive":
      if (state.alive === state.total) {
        createGoal("boost_entropy_to_target", 2, 0.55);
      }
      break;
    default:
      createGoal("stabilize_swarm", 3);
  }
}

function getActiveGoal() {
  return goals
    .filter(g => g.status === "active")
    .sort((a, b) => b.priority - a.priority)[0];
}

function getAllGoals() {
  return {
    active: goals.filter(g => g.status === "active"),
    completed: completedGoals,
    history: goalHistory
  };
}

function getGoalStats() {
  const active = goals.filter(g => g.status === "active").length;
  const completed = completedGoals.length;
  const avgCompletionTime = goalHistory.length > 0 
    ? goalHistory.reduce((sum, g) => sum + g.duration, 0) / goalHistory.length 
    : 0;
  
  return {
    active,
    completed,
    total: active + completed,
    avgCompletionTime: Math.floor(avgCompletionTime / 1000),
    mostCompleted: getMostCompletedGoal()
  };
}

function getMostCompletedGoal() {
  const counts = {};
  for (const goal of goalHistory) {
    counts[goal.type] = (counts[goal.type] || 0) + 1;
  }
  
  let best = null;
  let bestCount = 0;
  for (const [type, count] of Object.entries(counts)) {
    if (count > bestCount) {
      bestCount = count;
      best = type;
    }
  }
  return { type: best, count: bestCount };
}

function resetGoals() {
  goals = [];
  completedGoals = [];
  goalHistory = [];
  console.log("🎯 Goals system reset");
}

module.exports = {
  goals,
  updateGoals,
  getActiveGoal,
  getAllGoals,
  getGoalStats,
  createGoal,
  resetGoals
};
