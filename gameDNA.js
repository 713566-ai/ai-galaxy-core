// ============================================
// 🧬 V146 - GAME DNA STRUCTURE
// ============================================
// ✅ Механики, правила, система наград
// ✅ Эволюционные параметры
// ✅ Клонирование и наследование
// ============================================

class GameDNA {
  constructor(seed = {}) {
    // Основные компоненты
    this.mechanics = seed.mechanics || [];
    this.loop = seed.loop || [];
    this.rules = seed.rules || [];
    this.rewardSystem = seed.rewardSystem || [];
    
    // Эволюционные параметры
    this.complexity = seed.complexity || 0.5;
    this.chaos = seed.chaos || 0.3;
    this.fun = seed.fun || 0.5;
    this.stability = seed.stability || 1.0;
    this.aggression = seed.aggression || 0.4;
    this.survivalRate = seed.survivalRate || 0.7;
    
    // Генетические маркеры
    this.generation = seed.generation || 1;
    this.parents = seed.parents || [];
    this.mutations = seed.mutations || [];
    
    // Метаданные
    this.createdAt = Date.now();
    this.lastMutated = Date.now();
  }
  
  clone() {
    return new GameDNA(JSON.parse(JSON.stringify(this)));
  }
  
  getSummary() {
    return {
      mechanics: this.mechanics.length,
      loop: this.loop.length,
      rules: this.rules.length,
      rewardSystem: this.rewardSystem.length,
      complexity: this.complexity.toFixed(2),
      chaos: this.chaos.toFixed(2),
      fun: this.fun.toFixed(2),
      stability: this.stability.toFixed(2),
      generation: this.generation,
      mutations: this.mutations.length
    };
  }
}

module.exports = GameDNA;
