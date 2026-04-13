// ============================================
// 🧠⚖️ V138 AI GOVERNMENT SYSTEM
// ============================================
// ✅ Правительства и лидеры
// ✅ Политические решения
// ✅ Дипломатия и альянсы
// ✅ Стабильность мира
// ============================================

function pickLeader(empires) {
  // Лидер = самая сильная империя с учётом технологий и богатства
  return empires.reduce((best, e) => {
    const score = e.strength * 0.4 + (e.tech / 2) * 0.3 + (e.wealth / 5000) * 0.3;
    const bestScore = best.strength * 0.4 + (best.tech / 2) * 0.3 + (best.wealth / 5000) * 0.3;
    return score > bestScore ? e : best;
  });
}

function makeDecision(empire, world, tick) {
  const oldPolicy = empire.policy;
  
  // Анализ ситуации
  const isWeak = empire.strength < 0.4;
  const isRich = empire.wealth > 2000;
  const hasEnemies = empire.enemies && empire.enemies.length > 0;
  const hasAllies = empire.allies && empire.allies.length > 0;
  const worldUnstable = world.stability < 0.4;
  
  // Принятие решения на основе ситуации
  let decision = { type: "BALANCE", reason: "stability" };
  
  if (isWeak && !hasAllies) {
    decision = { type: "SEEK_ALLIANCES", reason: "weakness", priority: "high" };
  } 
  else if (isRich && worldUnstable) {
    decision = { type: "INVEST_DEFENSE", reason: "wealth_protection", priority: "high" };
  }
  else if (hasEnemies && empire.strength > 0.6) {
    decision = { type: "PREPARE_WAR", reason: "retaliation", priority: "medium" };
  }
  else if (empire.wealth < 500) {
    decision = { type: "BOOST_ECONOMY", reason: "poverty", priority: "critical" };
  }
  else if (empire.tech < 0.8) {
    decision = { type: "RESEARCH", reason: "technological_gap", priority: "medium" };
  }
  else if (Math.random() < 0.2) {
    const strategies = ["EXPANSION", "DIPLOMACY", "MILITARY", "ECONOMY", "CULTURE"];
    decision = { type: strategies[Math.floor(Math.random() * strategies.length)], reason: "random" };
  }
  
  // Применение решения
  switch (decision.type) {
    case "BOOST_ECONOMY":
      empire.policy = "ECONOMY";
      empire.wealth += 50 + Math.random() * 30;
      empire.strength *= 0.98;
      break;
      
    case "PREPARE_WAR":
      empire.policy = "WAR";
      empire.strength += 0.03;
      empire.wealth -= 30;
      empire.aggression = (empire.aggression || 0) + 0.1;
      break;
      
    case "INVEST_DEFENSE":
      empire.policy = "DEFENSE";
      empire.strength += 0.05;
      empire.wealth -= 40;
      empire.defense = (empire.defense || 0) + 0.1;
      break;
      
    case "RESEARCH":
      empire.policy = "TECHNOLOGY";
      empire.tech += 0.05;
      empire.wealth -= 50;
      break;
      
    case "SEEK_ALLIANCES":
      empire.policy = "DIPLOMACY";
      empire.diplomacyActive = true;
      break;
      
    case "EXPANSION":
      empire.policy = "EXPANSION";
      empire.territory += 2;
      empire.strength += 0.02;
      empire.aggression = (empire.aggression || 0) + 0.05;
      break;
      
    case "CULTURE":
      empire.policy = "CULTURE";
      empire.stability = Math.min(1, (empire.stability || 0.5) + 0.05);
      break;
      
    default:
      empire.policy = "BALANCE";
  }
  
  // Логирование смены политики
  if (oldPolicy !== empire.policy) {
    console.log(`🏛️ [GOVERNMENT] ${empire.name} switched to ${empire.policy} (${decision.reason})`);
  }
  
  empire.lastDecision = decision;
  empire.lastDecisionTick = tick;
  
  return decision;
}

function diplomacy(empires, world, tick) {
  if (empires.length < 2) return;
  
  // Случайная дипломатия между империями
  for (let i = 0; i < empires.length; i++) {
    for (let j = i + 1; j < empires.length; j++) {
      const a = empires[i];
      const b = empires[j];
      
      // Проверка на существующие отношения
      const areAllies = a.allies && a.allies.includes(b.id);
      const areEnemies = a.enemies && a.enemies.includes(b.id);
      
      // Шанс на альянс
      const allianceChance = 0.03 + (a.policy === "DIPLOMACY" ? 0.05 : 0) + (b.policy === "DIPLOMACY" ? 0.05 : 0);
      if (!areAllies && !areEnemies && Math.random() < allianceChance) {
        if (!a.allies) a.allies = [];
        if (!b.allies) b.allies = [];
        a.allies.push(b.id);
        b.allies.push(a.id);
        
        world.events.push({
          type: "alliance",
          a: a.name,
          b: b.name,
          tick: tick
        });
        
        console.log(`🤝 [DIPLOMACY] ${a.name} and ${b.name} formed an alliance!`);
      }
      
      // Шанс на конфликт
      const conflictChance = 0.02 + (a.aggression || 0) * 0.1 + (b.aggression || 0) * 0.1;
      if (!areAllies && !areEnemies && Math.random() < conflictChance) {
        if (!a.enemies) a.enemies = [];
        if (!b.enemies) b.enemies = [];
        a.enemies.push(b.id);
        b.enemies.push(a.id);
        
        world.events.push({
          type: "conflict",
          a: a.name,
          b: b.name,
          tick: tick
        });
        
        console.log(`⚔️ [DIPLOMACY] ${a.name} and ${b.name} became enemies!`);
      }
      
      // Предательство альянса
      if (areAllies && Math.random() < 0.02 && (a.policy === "WAR" || b.policy === "WAR")) {
        a.allies = a.allies.filter(id => id !== b.id);
        b.allies = b.allies.filter(id => id !== a.id);
        
        world.events.push({
          type: "betrayal",
          a: a.name,
          b: b.name,
          tick: tick
        });
        
        console.log(`💔 [DIPLOMACY] ${a.name} betrayed ${b.name}!`);
      }
    }
  }
}

function applyGovernment(world, tick) {
  if (!world || !world.empires || world.empires.length === 0) return;
  
  // 👑 Выбираем мирового лидера
  const leader = pickLeader(world.empires);
  world.government = {
    leader: leader.name,
    leaderStrength: leader.strength,
    leaderWealth: leader.wealth,
    leaderTech: leader.tech,
    ideology: leader.policy || "BALANCED",
    lastUpdated: tick
  };
  
  // 🧠 Решения каждой империи
  for (const empire of world.empires) {
    makeDecision(empire, world, tick);
  }
  
  // 🤝 Дипломатия
  diplomacy(world.empires, world, tick);
  
  // 📊 Стабильность мира
  world.stability = world.stability || 0.7;
  
  // Факторы стабильности
  const avgStrength = world.empires.reduce((sum, e) => sum + e.strength, 0) / world.empires.length;
  const totalWealth = world.empires.reduce((sum, e) => sum + e.wealth, 0);
  const warCount = world.events?.filter(e => e.type === "war" || e.type === "conflict").length || 0;
  
  world.stability += (avgStrength - 0.5) * 0.02;
  world.stability += (totalWealth / 10000) * 0.01;
  world.stability -= warCount * 0.005;
  world.stability += (Math.random() - 0.5) * 0.02;
  
  world.stability = Math.max(0.1, Math.min(1, world.stability));
  
  // Мировой уровень агрессии
  world.aggressionLevel = world.empires.reduce((sum, e) => sum + (e.aggression || 0), 0) / world.empires.length;
  
  // Логирование каждые 20 тиков
  if (tick % 20 === 0) {
    console.log(`\n🏛️ [WORLD GOVERNMENT] Tick ${tick}`);
    console.log(`   👑 Leader: ${world.government.leader} (${world.government.ideology})`);
    console.log(`   📊 Stability: ${world.stability.toFixed(2)} | Aggression: ${world.aggressionLevel.toFixed(2)}`);
    console.log(`   🤝 Alliances: ${countAlliances(world.empires)} | ⚔️ Conflicts: ${countConflicts(world.empires)}`);
  }
}

function countAlliances(empires) {
  let count = 0;
  for (const e of empires) {
    count += e.allies?.length || 0;
  }
  return count / 2;
}

function countConflicts(empires) {
  let count = 0;
  for (const e of empires) {
    count += e.enemies?.length || 0;
  }
  return count / 2;
}

function getGovernmentStats(world) {
  if (!world || !world.empires) return null;
  
  const policies = {};
  for (const empire of world.empires) {
    const policy = empire.policy || "BALANCE";
    policies[policy] = (policies[policy] || 0) + 1;
  }
  
  return {
    leader: world.government?.leader || null,
    stability: world.stability || 0.5,
    aggressionLevel: world.aggressionLevel || 0.5,
    policies: policies,
    alliances: countAlliances(world.empires),
    conflicts: countConflicts(world.empires),
    totalEmpires: world.empires.length
  };
}

module.exports = {
  applyGovernment,
  getGovernmentStats,
  pickLeader,
  makeDecision
};
