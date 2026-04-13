// ============================================
// ⚙️ V146 - MUTATION ENGINE
// ============================================
// ✅ Мутация механик, правил, наград
// ✅ Эволюционное давление
// ✅ Генетический дрейф
// ============================================

class MutationEngine {
  constructor() {
    this.mutationHistory = [];
    this.mechanicsPool = [
      "combat", "economy", "crafting", "exploration", 
      "survival", "ai_agents", "diplomacy", "stealth",
      "magic", "technology_tree", "resource_management", "territory_control"
    ];
    
    this.loopsPool = [
      "collect → upgrade → fight", 
      "explore → build → survive", 
      "trade → expand → dominate",
      "research → develop → innovate",
      "survive → adapt → evolve",
      "craft → battle → loot"
    ];
    
    this.rulesPool = [
      "permadeath", "random_events", "resource_decay", 
      "ai_rebellion", "dynamic_difficulty", "fog_of_war",
      "limited_lives", "time_pressure", "chain_reactions"
    ];
    
    this.rewardsPool = [
      "xp", "territory", "evolution_points", "mutation_chance",
      "loot_boxes", "achievements", "skill_points", "currency"
    ];
  }
  
  mutate(dna, pressure = 0.3) {
    const mutated = dna.clone();
    const roll = Math.random();
    
    // 🎲 Выбор типа мутации
    if (roll < 0.25) {
      this.mutateMechanics(mutated, pressure);
    } 
    else if (roll < 0.5) {
      this.mutateLoop(mutated, pressure);
    } 
    else if (roll < 0.75) {
      this.mutateRules(mutated, pressure);
    } 
    else {
      this.mutateRewardSystem(mutated, pressure);
    }
    
    // 🌪 Эволюционный дрейф
    mutated.chaos = Math.min(1, Math.max(0, mutated.chaos + (Math.random() - 0.5) * 0.15 * pressure));
    mutated.complexity = Math.min(1, Math.max(0, mutated.complexity + (Math.random() - 0.5) * 0.1 * pressure));
    mutated.fun = Math.min(1, Math.max(0, mutated.fun + (Math.random() - 0.5) * 0.08 * pressure));
    
    mutated.generation++;
    mutated.lastMutated = Date.now();
    mutated.mutations.push({
      type: this.getMutationType(roll),
      timestamp: Date.now(),
      pressure: pressure
    });
    
    this.mutationHistory.push({
      dnaId: mutated.createdAt,
      changes: mutated.mutations[mutated.mutations.length - 1],
      newComplexity: mutated.complexity,
      newChaos: mutated.chaos
    });
    
    if (this.mutationHistory.length > 100) this.mutationHistory.shift();
    
    return mutated;
  }
  
  mutateMechanics(dna, pressure) {
    const newMechanic = this.mechanicsPool[Math.floor(Math.random() * this.mechanicsPool.length)];
    if (!dna.mechanics.includes(newMechanic)) {
      dna.mechanics.push(newMechanic);
    }
    // Иногда удаляем механику
    if (Math.random() < pressure * 0.3 && dna.mechanics.length > 2) {
      const removed = dna.mechanics.splice(Math.floor(Math.random() * dna.mechanics.length), 1)[0];
      dna.mutations.push({ type: "removed_mechanic", value: removed });
    }
  }
  
  mutateLoop(dna, pressure) {
    const newLoop = this.loopsPool[Math.floor(Math.random() * this.loopsPool.length)];
    if (!dna.loop.includes(newLoop)) {
      dna.loop.push(newLoop);
    }
    if (dna.loop.length > 3) dna.loop.shift();
  }
  
  mutateRules(dna, pressure) {
    const newRule = this.rulesPool[Math.floor(Math.random() * this.rulesPool.length)];
    if (!dna.rules.includes(newRule)) {
      dna.rules.push(newRule);
    }
    if (dna.rules.length > 5) dna.rules.shift();
  }
  
  mutateRewardSystem(dna, pressure) {
    const newReward = this.rewardsPool[Math.floor(Math.random() * this.rewardsPool.length)];
    if (!dna.rewardSystem.includes(newReward)) {
      dna.rewardSystem.push(newReward);
    }
  }
  
  getMutationType(roll) {
    if (roll < 0.25) return "mechanics";
    if (roll < 0.5) return "loop";
    if (roll < 0.75) return "rules";
    return "rewards";
  }
  
  crossbreed(dna1, dna2) {
    const childDNA = dna1.clone();
    
    // 🧬 Генетический кроссовер
    childDNA.mechanics = [...new Set([...dna1.mechanics, ...dna2.mechanics])];
    childDNA.loop = [...new Set([...dna1.loop, ...dna2.loop])];
    childDNA.rules = [...new Set([...dna1.rules, ...dna2.rules])];
    childDNA.rewardSystem = [...new Set([...dna1.rewardSystem, ...dna2.rewardSystem])];
    
    // Усреднение параметров
    childDNA.complexity = (dna1.complexity + dna2.complexity) / 2;
    childDNA.chaos = (dna1.chaos + dna2.chaos) / 2;
    childDNA.fun = (dna1.fun + dna2.fun) / 2;
    childDNA.stability = (dna1.stability + dna2.stability) / 2;
    
    childDNA.generation = Math.max(dna1.generation, dna2.generation) + 1;
    childDNA.parents = [dna1.createdAt, dna2.createdAt];
    
    return childDNA;
  }
  
  getStats() {
    return {
      totalMutations: this.mutationHistory.length,
      mechanicsPool: this.mechanicsPool.length,
      loopsPool: this.loopsPool.length,
      rulesPool: this.rulesPool.length,
      rewardsPool: this.rewardsPool.length
    };
  }
}

module.exports = new MutationEngine();
