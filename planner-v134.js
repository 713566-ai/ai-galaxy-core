// ============================================
// 🧠 V134 PLANNER SYSTEM — СИСТЕМА ПЛАНИРОВАНИЯ
// ============================================
// ✅ Разбивка целей на шаги
// ✅ Пошаговое выполнение
// ✅ Адаптация планов
// ✅ История выполнения
// ============================================

let plans = [];
let planHistory = [];
let executionLog = [];

function createPlan(goal, context = {}) {
  let steps = [];
  
  switch (goal.type) {
    case "stabilize_swarm":
      steps = [
        { action: "analyze_current_state", description: "Анализ текущего состояния роя" },
        { action: "check_nodes_health", description: "Проверка здоровья узлов" },
        { action: "revive_dead_nodes", description: "Воскрешение мёртвых узлов" },
        { action: "balance_entropy", description: "Балансировка энтропии" },
        { action: "verify_stability", description: "Проверка стабильности" }
      ];
      break;
      
    case "increase_consciousness":
      steps = [
        { action: "analyze_state", description: "Анализ текущего состояния" },
        { action: "optimize_agents", description: "Оптимизация агентов" },
        { action: "boost_signal", description: "Усиление сигналов" },
        { action: "measure_consciousness", description: "Измерение сознания" }
      ];
      break;
      
    case "evolve_system":
      steps = [
        { action: "mutate_parameters", description: "Мутация параметров" },
        { action: "spawn_new_logic", description: "Создание новой логики" },
        { action: "test_evolution", description: "Тестирование эволюции" },
        { action: "apply_evolution", description: "Применение эволюции" }
      ];
      break;
      
    case "keep_nodes_alive":
      steps = [
        { action: "scan_all_nodes", description: "Сканирование всех узлов" },
        { action: "identify_weak_nodes", description: "Выявление слабых узлов" },
        { action: "heal_weak_nodes", description: "Лечение слабых узлов" },
        { action: "verify_nodes_health", description: "Проверка здоровья узлов" }
      ];
      break;
      
    case "achieve_perfect_stability":
      steps = [
        { action: "measure_current_stability", description: "Измерение текущей стабильности" },
        { action: "optimize_entropy", description: "Оптимизация энтропии" },
        { action: "synchronize_nodes", description: "Синхронизация узлов" },
        { action: "verify_perfect_stability", description: "Проверка идеальной стабильности" }
      ];
      break;
      
    case "boost_entropy_to_target":
      steps = [
        { action: "measure_current_entropy", description: "Измерение текущей энтропии" },
        { action: "calculate_boost_needed", description: "Расчёт необходимого усиления" },
        { action: "apply_entropy_boost", description: "Применение усиления энтропии" },
        { action: "verify_target_reached", description: "Проверка достижения цели" }
      ];
      break;
      
    default:
      steps = [
        { action: "analyze_situation", description: "Анализ ситуации" },
        { action: "execute_action", description: "Выполнение действия" },
        { action: "verify_result", description: "Проверка результата" }
      ];
  }
  
  const plan = {
    id: goal.id,
    goal: goal.type,
    goalPriority: goal.priority,
    steps: steps.map((step, idx) => ({
      ...step,
      stepIndex: idx,
      status: "pending",
      executedAt: null
    })),
    currentStep: 0,
    status: "active",
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
    executionTimes: []
  };
  
  plans.push(plan);
  console.log(`🧠 [PLAN CREATED] for goal: ${goal.type} (${steps.length} steps)`);
  return plan;
}

function executePlan(plan, state) {
  if (plan.status !== "active") return false;
  
  // Запуск плана
  if (plan.startedAt === null) {
    plan.startedAt = Date.now();
    console.log(`🚀 [PLAN STARTED] ${plan.goal}`);
  }
  
  const currentStepObj = plan.steps[plan.currentStep];
  if (!currentStepObj) {
    completePlan(plan);
    return true;
  }
  
  // Выполнение текущего шага
  if (currentStepObj.status === "pending") {
    const startTime = Date.now();
    currentStepObj.status = "executing";
    
    const result = executeStep(currentStepObj, state);
    
    const executionTime = Date.now() - startTime;
    plan.executionTimes.push(executionTime);
    currentStepObj.executedAt = Date.now();
    currentStepObj.status = "completed";
    
    executionLog.push({
      planId: plan.id,
      goal: plan.goal,
      step: currentStepObj.action,
      stepIndex: plan.currentStep,
      executionTime,
      timestamp: Date.now()
    });
    
    console.log(`   📋 [STEP ${plan.currentStep + 1}/${plan.steps.length}] ${currentStepObj.description} (${executionTime}ms)`);
    
    // Переход к следующему шагу
    plan.currentStep++;
  }
  
  return false;
}

function executeStep(step, state) {
  switch (step.action) {
    case "analyze_current_state":
    case "analyze_state":
    case "analyze_situation":
    case "measure_current_stability":
    case "measure_current_entropy":
      state.lastAnalysis = Date.now();
      state.analysis = {
        timestamp: Date.now(),
        entropy: state.entropy,
        consciousness: state.consciousness,
        alive: state.alive
      };
      break;
      
    case "check_nodes_health":
    case "scan_all_nodes":
      state.nodesChecked = true;
      state.lastHealthCheck = Date.now();
      break;
      
    case "revive_dead_nodes":
    case "heal_weak_nodes":
      if (state.alive < state.total) {
        console.log(`   🔁 Reviving nodes... (${state.alive}/${state.total})`);
        state.reviveTriggered = true;
      }
      break;
      
    case "balance_entropy":
    case "optimize_entropy":
      const target = 0.5;
      const delta = target - state.entropy;
      state.entropy += delta * 0.1;
      console.log(`   ⚖️ Balancing entropy: ${state.entropy.toFixed(3)}`);
      break;
      
    case "verify_stability":
    case "verify_perfect_stability":
    case "verify_target_reached":
    case "verify_result":
    case "verify_nodes_health":
      state.verified = true;
      break;
      
    case "optimize_agents":
      state.consciousness = Math.min(1, state.consciousness + 0.02);
      break;
      
    case "boost_signal":
    case "apply_entropy_boost":
      state.signalBoost = true;
      state.entropy = Math.min(0.7, state.entropy + 0.01);
      break;
      
    case "measure_consciousness":
      state.consciousnessMeasured = state.consciousness;
      break;
      
    case "mutate_parameters":
      state.mutation = Math.random();
      state.mutationApplied = true;
      console.log(`   🧬 Parameters mutated`);
      break;
      
    case "spawn_new_logic":
      state.newLogic = true;
      console.log(`   🧬 New logic emerging...`);
      break;
      
    case "test_evolution":
    case "apply_evolution":
      state.tested = true;
      state.evolutionStep = true;
      break;
      
    case "identify_weak_nodes":
      state.weakNodes = state.total - state.alive;
      break;
      
    case "calculate_boost_needed":
      state.boostNeeded = (state.targetEntropy || 0.55) - state.entropy;
      break;
      
    case "synchronize_nodes":
      state.synced = true;
      break;
      
    case "execute_action":
      state.actionExecuted = true;
      break;
      
    default:
      state.lastAction = step.action;
  }
  
  return true;
}

function completePlan(plan) {
  plan.status = "completed";
  plan.completedAt = Date.now();
  
  const duration = plan.completedAt - plan.startedAt;
  const avgStepTime = plan.executionTimes.reduce((a, b) => a + b, 0) / plan.executionTimes.length;
  
  planHistory.push({
    id: plan.id,
    goal: plan.goal,
    duration,
    stepsCount: plan.steps.length,
    avgStepTime,
    completedAt: plan.completedAt
  });
  
  console.log(`✅ [PLAN COMPLETED] ${plan.goal} (${duration}ms, avg step: ${Math.floor(avgStepTime)}ms)`);
  
  // Ограничиваем историю
  if (planHistory.length > 50) planHistory.shift();
  if (executionLog.length > 200) executionLog.shift();
}

function ensurePlan(goal) {
  // Проверяем, есть ли уже активный план для этой цели
  const existingPlan = plans.find(p => p.goal === goal.type && p.status === "active");
  if (!existingPlan) {
    return createPlan(goal);
  }
  return existingPlan;
}

function getActivePlan() {
  return plans.find(p => p.status === "active");
}

function getAllPlans() {
  return {
    active: plans.filter(p => p.status === "active"),
    completed: planHistory,
    total: plans.length + planHistory.length
  };
}

function getPlanStats() {
  const activeCount = plans.filter(p => p.status === "active").length;
  const completedCount = planHistory.length;
  const avgDuration = planHistory.length > 0 
    ? planHistory.reduce((sum, p) => sum + p.duration, 0) / planHistory.length 
    : 0;
  const avgSteps = planHistory.length > 0
    ? planHistory.reduce((sum, p) => sum + p.stepsCount, 0) / planHistory.length
    : 0;
  
  return {
    activePlans: activeCount,
    completedPlans: completedCount,
    totalPlans: activeCount + completedCount,
    averagePlanDuration: Math.floor(avgDuration),
    averageStepsPerPlan: avgSteps.toFixed(1),
    totalStepsExecuted: executionLog.length
  };
}

function resetPlans() {
  plans = [];
  planHistory = [];
  executionLog = [];
  console.log("🧠 Planner system reset");
}

module.exports = {
  createPlan,
  executePlan,
  ensurePlan,
  getActivePlan,
  getAllPlans,
  getPlanStats,
  resetPlans,
  plans,
  executionLog
};
