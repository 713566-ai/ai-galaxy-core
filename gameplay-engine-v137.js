// ============================================
// ⚔️ V137 GAMEPLAY ENGINE — ЖИВАЯ ИГРА
// ============================================
// ✅ Войны между империями
// ✅ Экономика
// ✅ Рост/падение сил
// ✅ Баланс мира
// ✅ Игровые события
// ============================================

function calculateBattle(attacker, defender, tick) {
  const atkPower = attacker.strength * (0.5 + Math.random() * 0.8);
  const defPower = defender.strength * (0.5 + Math.random() * 0.8);
  
  const attackerLoss = Math.random() * 0.3;
  const defenderLoss = Math.random() * 0.3;
  
  let result = {};
  
  if (atkPower > defPower) {
    // Победа атакующего
    const spoils = Math.floor(defender.wealth * 0.2);
    attacker.wealth += spoils;
    defender.wealth -= spoils;
    
    attacker.strength *= (1 - attackerLoss * 0.2);
    defender.strength *= (1 - defenderLoss * 0.4);
    
    // Захват территории
    const territoryGain = Math.min(defender.territory * 0.1, 10);
    attacker.territory += territoryGain;
    defender.territory -= territoryGain;
    
    result = {
      winner: attacker.name,
      loser: defender.name,
      spoils: spoils,
      territoryGain: territoryGain,
      type: "victory"
    };
    
    console.log(`⚔️ [BATTLE] ${attacker.name} победил ${defender.name}! +${spoils}💰 +${territoryGain.toFixed(1)}🏰`);
  } else {
    // Победа защищающегося
    const spoils = Math.floor(attacker.wealth * 0.15);
    defender.wealth += spoils;
    attacker.wealth -= spoils;
    
    attacker.strength *= (1 - attackerLoss * 0.4);
    defender.strength *= (1 - defenderLoss * 0.2);
    
    result = {
      winner: defender.name,
      loser: attacker.name,
      spoils: spoils,
      territoryGain: 0,
      type: "defense"
    };
    
    console.log(`⚔️ [BATTLE] ${defender.name} отразил атаку ${attacker.name}! +${spoils}💰`);
  }
  
  // Ограничиваем значения
  attacker.strength = Math.max(0.1, Math.min(1, attacker.strength));
  defender.strength = Math.max(0.1, Math.min(1, defender.strength));
  attacker.territory = Math.max(5, Math.min(100, attacker.territory));
  defender.territory = Math.max(5, Math.min(100, defender.territory));
  attacker.wealth = Math.max(0, attacker.wealth);
  defender.wealth = Math.max(0, defender.wealth);
  
  return result;
}

function economyTick(empire, tick) {
  // Базовый рост экономики
  let growth = (empire.strength * 20) + (Math.random() - 0.5) * 30;
  
  // Бонус от технологий
  growth *= (0.8 + empire.tech * 0.3);
  
  // Штраф за большие территории
  growth *= (1 - (empire.territory / 200));
  
  empire.wealth += Math.floor(growth);
  
  // Расходы на содержание
  const upkeep = Math.floor(empire.territory * 2);
  empire.wealth -= upkeep;
  
  // Налоги
  const taxes = Math.floor(empire.wealth * 0.05);
  empire.wealth -= taxes;
  
  empire.wealth = Math.max(0, empire.wealth);
  
  return { growth, upkeep, taxes };
}

function calculateDiplomacy(empire1, empire2, tick) {
  // Проверка на альянс
  const ideologyBonus = empire1.ideology === empire2.ideology ? 0.3 : 0;
  const strengthDiff = Math.abs(empire1.strength - empire2.strength);
  const allianceChance = 0.05 + ideologyBonus - strengthDiff * 0.1;
  
  if (Math.random() < allianceChance && !empire1.allies.includes(empire2.id)) {
    empire1.allies.push(empire2.id);
    empire2.allies.push(empire1.id);
    console.log(`🤝 [DIPLOMACY] Альянс заключён: ${empire1.name} 🤝 ${empire2.name}`);
    return { type: "alliance", empires: [empire1.name, empire2.name] };
  }
  
  // Проверка на вражду
  const rivalryChance = 0.03 + (1 - ideologyBonus) * 0.1;
  if (Math.random() < rivalryChance && !empire1.enemies.includes(empire2.id)) {
    empire1.enemies.push(empire2.id);
    empire2.enemies.push(empire1.id);
    console.log(`⚔️ [DIPLOMACY] Вражда началась: ${empire1.name} ⚔️ ${empire2.name}`);
    return { type: "rivalry", empires: [empire1.name, empire2.name] };
  }
  
  return null;
}

function generateWorldEvent(world, tick) {
  const eventTypes = [
    { name: "economic_boom", chance: 0.05, effect: (e) => { e.wealth *= 1.2; } },
    { name: "economic_crisis", chance: 0.05, effect: (e) => { e.wealth *= 0.8; } },
    { name: "technological_breakthrough", chance: 0.03, effect: (e) => { e.tech += 0.1; } },
    { name: "natural_disaster", chance: 0.04, effect: (e) => { e.territory *= 0.9; e.wealth *= 0.85; } },
    { name: "golden_age", chance: 0.02, effect: (e) => { e.strength *= 1.1; e.wealth *= 1.15; } },
    { name: "rebellion", chance: 0.04, effect: (e) => { e.strength *= 0.85; e.wealth *= 0.9; } }
  ];
  
  for (const empire of world.empires) {
    for (const event of eventTypes) {
      if (Math.random() < event.chance) {
        const oldStrength = empire.strength;
        const oldWealth = empire.wealth;
        const oldTech = empire.tech;
        
        event.effect(empire);
        
        // Ограничения
        empire.strength = Math.max(0.1, Math.min(1, empire.strength));
        empire.wealth = Math.max(0, empire.wealth);
        empire.tech = Math.min(2, empire.tech);
        
        console.log(`📜 [EVENT] ${empire.name}: ${event.name}`);
        
        world.events.push({
          type: event.name,
          empire: empire.name,
          tick: tick,
          changes: {
            strength: (empire.strength - oldStrength).toFixed(2),
            wealth: Math.floor(empire.wealth - oldWealth),
            tech: (empire.tech - oldTech).toFixed(2)
          }
        });
        
        return event;
      }
    }
  }
  return null;
}

function simulateWorld(world, tick) {
  if (!world || !world.empires) return;
  
  const events = [];
  
  // 💰 Экономика
  for (const empire of world.empires) {
    const eco = economyTick(empire, tick);
    if (Math.abs(eco.growth) > 30) {
      events.push({
        type: "economy",
        empire: empire.name,
        growth: Math.floor(eco.growth),
        upkeep: eco.upkeep,
        taxes: eco.taxes
      });
    }
  }
  
  // 🤝 Дипломатия
  for (let i = 0; i < world.empires.length; i++) {
    for (let j = i + 1; j < world.empires.length; j++) {
      const diplo = calculateDiplomacy(world.empires[i], world.empires[j], tick);
      if (diplo) events.push(diplo);
    }
  }
  
  // ⚔️ Войны
  const warChance = 0.3;
  if (Math.random() < warChance && world.empires.length > 1) {
    // Выбираем враждующие пары
    const enemies = [];
    for (const empire of world.empires) {
      if (empire.enemies.length > 0) {
        for (const enemyId of empire.enemies) {
          const enemy = world.empires.find(e => e.id === enemyId);
          if (enemy && Math.random() < 0.5) {
            enemies.push([empire, enemy]);
          }
        }
      }
    }
    
    if (enemies.length === 0) {
      // Случайная война
      const a = world.empires[Math.floor(Math.random() * world.empires.length)];
      let b;
      do {
        b = world.empires[Math.floor(Math.random() * world.empires.length)];
      } while (a === b);
      
      const battle = calculateBattle(a, b, tick);
      events.push({ type: "war", battle });
    } else {
      for (const [attacker, defender] of enemies.slice(0, 2)) {
        const battle = calculateBattle(attacker, defender, tick);
        events.push({ type: "war", battle });
      }
    }
  }
  
  // 📜 Мировые события
  const worldEvent = generateWorldEvent(world, tick);
  if (worldEvent) events.push({ type: "world_event", event: worldEvent.name, empire: worldEvent.empire });
  
  // 📊 Статистика мира
  if (tick % 20 === 0) {
    const totalWealth = world.empires.reduce((sum, e) => sum + e.wealth, 0);
    const avgStrength = world.empires.reduce((sum, e) => sum + e.strength, 0) / world.empires.length;
    const mostPowerful = world.empires.sort((a, b) => b.strength - a.strength)[0];
    
    console.log(`\n📊 [WORLD STATS] Tick ${tick}`);
    console.log(`   💰 Total Wealth: ${totalWealth}`);
    console.log(`   ⚔️ Avg Strength: ${avgStrength.toFixed(2)}`);
    console.log(`   👑 Most Powerful: ${mostPowerful.name} (${mostPowerful.strength.toFixed(2)})`);
    console.log(`   🤝 Alliances: ${world.empires.reduce((sum, e) => sum + e.allies.length, 0) / 2}`);
  }
  
  return events;
}

function getGameplayStats(world) {
  if (!world || !world.empires) return null;
  
  const totalWealth = world.empires.reduce((sum, e) => sum + e.wealth, 0);
  const avgStrength = world.empires.reduce((sum, e) => sum + e.strength, 0) / world.empires.length;
  const mostPowerful = world.empires.sort((a, b) => b.strength - a.strength)[0];
  const richest = world.empires.sort((a, b) => b.wealth - a.wealth)[0];
  
  return {
    totalWealth,
    avgStrength: avgStrength.toFixed(2),
    mostPowerful: mostPowerful ? { name: mostPowerful.name, strength: mostPowerful.strength.toFixed(2) } : null,
    richest: richest ? { name: richest.name, wealth: richest.wealth } : null,
    totalAlliances: world.empires.reduce((sum, e) => sum + e.allies.length, 0) / 2,
    warsCount: world.events?.filter(e => e.type === "war" || e.type === "battle").length || 0
  };
}

module.exports = {
  simulateWorld,
  getGameplayStats,
  calculateBattle,
  economyTick
};
