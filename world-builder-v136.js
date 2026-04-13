// ============================================
// 🌍 V136 WORLD BUILDER SYSTEM
// ============================================
// ✅ Генерация фракций
// ✅ Генерация агентов
// ✅ Генерация событий
// ✅ Синхронизация с игрой
// ============================================

const empireNames = ["Nova", "Zenith", "Orion", "Vortex", "Helix", "Aether", "Eclipse", "Fusion", "Nexus", "Quantum"];
const agentNames = ["alpha", "beta", "gamma", "delta", "omega", "sigma", "tau", "phi", "psi", "zeta"];
const eventTypes = ["conflict", "alliance", "discovery", "crisis", "evolution", "rebellion", "trade", "war", "peace", "miracle"];
const ideologyTypes = ["harmony", "dominion", "balance", "chaos", "order"];

function generateEmpire(id, tick) {
  const name = empireNames[Math.floor(Math.random() * empireNames.length)];
  const ideology = ideologyTypes[Math.floor(Math.random() * ideologyTypes.length)];
  
  return {
    id: `E${id}`,
    name: `${name}-${id}`,
    strength: 0.3 + Math.random() * 0.6,
    wealth: 500 + Math.floor(Math.random() * 1500),
    tech: 0.5 + Math.random() * 0.5,
    territory: 20 + Math.floor(Math.random() * 80),
    ideology: ideology,
    god: null,
    allies: [],
    enemies: [],
    createdAt: tick,
    status: "active"
  };
}

function generateAgent(id, tick, empireId) {
  const name = agentNames[Math.floor(Math.random() * agentNames.length)];
  
  return {
    id: `A${id}`,
    name: `${name}-${id}`,
    loyalty: empireId,
    fitness: 0.3 + Math.random() * 0.6,
    energy: 0.5 + Math.random() * 0.5,
    consciousness: 0.1 + Math.random() * 0.3,
    isGod: false,
    createdAt: tick,
    experience: 0
  };
}

function generateEvent(tick, worldState) {
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const empires = worldState.empires || [];
  const targetEmpire = empires.length > 0 ? empires[Math.floor(Math.random() * empires.length)] : null;
  
  const event = {
    id: `EV${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: type,
    severity: Math.random(),
    tick: tick,
    timestamp: Date.now(),
    description: generateEventDescription(type, targetEmpire),
    affectedEmpire: targetEmpire?.id || null,
    processed: false
  };
  
  return event;
}

function generateEventDescription(type, empire) {
  const empireName = empire?.name || "unknown";
  
  switch(type) {
    case "conflict":
      return `Конфликт в империи ${empireName}`;
    case "alliance":
      return `Новый альянс с участием ${empireName}`;
    case "discovery":
      return `Технологическое открытие в ${empireName}`;
    case "crisis":
      return `Кризис в империи ${empireName}`;
    case "evolution":
      return `Эволюция агентов в ${empireName}`;
    case "rebellion":
      return `Восстание в ${empireName}`;
    case "trade":
      return `Торговый путь открыт через ${empireName}`;
    case "war":
      return `Война с участием ${empireName}`;
    case "peace":
      return `Мирные переговоры в ${empireName}`;
    case "miracle":
      return `Чудо произошло в ${empireName}!`;
    default:
      return `Событие в ${empireName}`;
  }
}

function buildWorld(state) {
  if (!state.world) {
    state.world = {
      empires: [],
      agents: [],
      events: [],
      lastUpdate: Date.now(),
      generation: 1
    };
    console.log("🌍 [WORLD BUILDER] Initializing new world...");
  }
  
  // Создаём империи (минимум 3, максимум 8)
  if (state.world.empires.length < 3) {
    const needed = 3 - state.world.empires.length;
    for (let i = 0; i < needed; i++) {
      const empire = generateEmpire(state.world.empires.length + 1, state.tick);
      state.world.empires.push(empire);
      console.log(`🌍 [NEW EMPIRE] ${empire.name} (${empire.ideology})`);
    }
  }
  
  // Создаём агентов (минимум 5, максимум 20)
  if (state.world.agents.length < 5 && state.world.empires.length > 0) {
    const needed = Math.min(5 - state.world.agents.length, 3);
    for (let i = 0; i < needed; i++) {
      const randomEmpire = state.world.empires[Math.floor(Math.random() * state.world.empires.length)];
      const agent = generateAgent(state.world.agents.length + 1, state.tick, randomEmpire.id);
      state.world.agents.push(agent);
      console.log(`🤖 [NEW AGENT] ${agent.name} (loyalty: ${agent.loyalty})`);
    }
  }
  
  // Генерируем события (10% шанс каждый тик)
  if (Math.random() < 0.1 && state.world.empires.length > 0) {
    const event = generateEvent(state.tick, state.world);
    state.world.events.push(event);
    console.log(`⚔️ [EVENT] ${event.type}: ${event.description}`);
  }
  
  // Очищаем старые события (оставляем последние 50)
  if (state.world.events.length > 50) {
    state.world.events = state.world.events.slice(-50);
  }
  
  // Эволюция империй
  for (const empire of state.world.empires) {
    // Случайное изменение силы
    empire.strength += (Math.random() - 0.5) * 0.02;
    empire.strength = Math.max(0.1, Math.min(1, empire.strength));
    
    // Рост богатства
    empire.wealth += Math.floor(Math.random() * 50);
    empire.wealth = Math.min(5000, empire.wealth);
    
    // Эволюция технологий
    if (Math.random() < 0.05) {
      empire.tech += 0.05;
      empire.tech = Math.min(2, empire.tech);
    }
  }
  
  // Эволюция агентов
  for (const agent of state.world.agents) {
    agent.fitness += (Math.random() - 0.5) * 0.02;
    agent.fitness = Math.max(0.1, Math.min(0.95, agent.fitness));
    agent.experience++;
    
    // Вознесение в боги
    if (!agent.isGod && agent.fitness > 0.85 && agent.experience > 50) {
      agent.isGod = true;
      agent.consciousness = 0.9;
      console.log(`👑 [GOD ASCENSION] ${agent.name} became a god!`);
      
      // Находим империю агента и отмечаем бога
      const empire = state.world.empires.find(e => e.id === agent.loyalty);
      if (empire) {
        empire.god = agent.name;
      }
    }
  }
  
  state.world.lastUpdate = Date.now();
  state.world.generation = Math.floor(state.tick / 100) + 1;
  
  return state.world;
}

function getWorldStats(world) {
  if (!world) return null;
  
  return {
    empires: world.empires.length,
    agents: world.agents.length,
    events: world.events.length,
    gods: world.empires.filter(e => e.god).length,
    generation: world.generation,
    lastUpdate: world.lastUpdate
  };
}

module.exports = { 
  buildWorld, 
  getWorldStats,
  generateEmpire,
  generateAgent,
  generateEvent
};
