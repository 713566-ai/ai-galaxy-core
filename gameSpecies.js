// ============================================
// 🧬 V147 - GAME SPECIES MODEL
// ============================================
// ✅ Игры как биологические виды
// ✅ Естественный отбор
// ✅ Эволюция жанров
// ============================================

class GameSpecies {
  constructor(dna, meta = {}) {
    this.id = meta.id || `species_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.dna = dna;
    
    // Популяционные метрики
    this.population = meta.population || 10 + Math.random() * 40;
    this.fitness = meta.fitness || 0.3 + Math.random() * 0.5;
    this.age = 0;
    this.generation = 1;
    
    // Генетические черты
    this.genreCluster = this.detectGenre();
    this.dominantGenes = this.extractDominantGenes();
    
    // Эволюционная история
    this.evolutionHistory = [];
    this.mutations = [];
    
    // Статус
    this.extinct = false;
    this.extinctionReason = null;
    this.bornAt = Date.now();
  }
  
  detectGenre() {
    const mechanics = this.dna.mechanics || [];
    const mechanicsStr = mechanics.join(",");
    
    if (mechanicsStr.includes("combat") && mechanicsStr.includes("economy")) return "4x_strategy";
    if (mechanicsStr.includes("combat")) return "action";
    if (mechanicsStr.includes("economy") || mechanicsStr.includes("trade")) return "strategy";
    if (mechanicsStr.includes("exploration") || mechanicsStr.includes("crafting")) return "adventure";
    if (mechanicsStr.includes("survival") || mechanicsStr.includes("resource_decay")) return "survival";
    if (mechanicsStr.includes("ai_agents") || mechanicsStr.includes("diplomacy")) return "simulation";
    if (mechanicsStr.includes("magic") || mechanicsStr.includes("technology_tree")) return "fantasy";
    
    return "hybrid";
  }
  
  extractDominantGenes() {
    const genes = {};
    for (const mechanic of (this.dna.mechanics || [])) {
      genes[mechanic] = (genes[mechanic] || 0) + 1;
    }
    const sorted = Object.entries(genes).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(g => g[0]);
  }
  
  tick(environmentPressure, globalEntropy) {
    if (this.extinct) return;
    
    this.age++;
    
    // 🌡 Влияние окружающей среды на выживаемость
    const pressureEffect = (environmentPressure - 0.5) * 0.2;
    const entropyEffect = (globalEntropy - 0.5) * 0.15;
    
    this.fitness += pressureEffect + entropyEffect + (Math.random() - 0.5) * 0.05;
    this.fitness = Math.max(0.05, Math.min(0.95, this.fitness));
    
    // 📈 Размножение (при высокой приспособленности)
    if (this.fitness > 0.65 && Math.random() < 0.3) {
      const birthRate = Math.floor(this.fitness * 3 + Math.random() * 5);
      this.population += birthRate;
      this.generation++;
    }
    
    // 📉 Естественная смертность
    const mortality = 0.05 + (1 - this.fitness) * 0.1;
    this.population -= this.population * mortality;
    
    // 💀 Вымирание
    if (this.population <= 1 || this.fitness < 0.12) {
      this.extinct = true;
      this.extinctionReason = this.population <= 1 ? "population_collapse" : "low_fitness";
      return;
    }
    
    // 🧬 Эволюционная адаптация
    if (this.fitness > 0.7 && Math.random() < 0.15) {
      this.evolve();
    }
    
    // Сохраняем историю
    if (this.age % 10 === 0) {
      this.evolutionHistory.push({
        age: this.age,
        population: Math.floor(this.population),
        fitness: this.fitness.toFixed(3),
        generation: this.generation
      });
      if (this.evolutionHistory.length > 50) this.evolutionHistory.shift();
    }
  }
  
  evolve() {
    // Эволюция: улучшение характеристик
    this.fitness = Math.min(0.95, this.fitness + 0.03);
    this.population += 5;
    
    // Возможное изменение жанра
    const newGenre = this.detectGenre();
    if (newGenre !== this.genreCluster) {
      this.mutations.push({
        age: this.age,
        from: this.genreCluster,
        to: newGenre,
        type: "genre_shift"
      });
      this.genreCluster = newGenre;
    }
  }
  
  compete(other) {
    // ⚔️ Конкуренция между видами
    const powerA = this.fitness * this.population;
    const powerB = other.fitness * other.population;
    const totalPower = powerA + powerB;
    
    if (totalPower === 0) return { winner: null, loser: null };
    
    const winChanceA = powerA / totalPower;
    const winner = Math.random() < winChanceA ? this : other;
    const loser = winner === this ? other : this;
    
    // Победитель получает преимущество
    winner.population += 2;
    winner.fitness = Math.min(0.95, winner.fitness + 0.01);
    
    // Проигравший теряет
    loser.population -= 3;
    loser.fitness = Math.max(0.05, loser.fitness - 0.01);
    
    return { winner: winner.id, loser: loser.id };
  }
  
  crossbreed(other) {
    // 🧬 Скрещивание видов для создания нового
    const childDNA = {
      mechanics: [...new Set([...(this.dna.mechanics || []), ...(other.dna.mechanics || [])])],
      loop: [...new Set([...(this.dna.loop || []), ...(other.dna.loop || [])])],
      rules: [...new Set([...(this.dna.rules || []), ...(other.dna.rules || [])])],
      complexity: (this.dna.complexity + other.dna.complexity) / 2,
      chaos: (this.dna.chaos + other.dna.chaos) / 2,
      fun: (this.dna.fun + other.dna.fun) / 2
    };
    
    const childMeta = {
      population: Math.floor((this.population + other.population) / 4),
      fitness: (this.fitness + other.fitness) / 2
    };
    
    return new GameSpecies(childDNA, childMeta);
  }
  
  getStats() {
    return {
      id: this.id,
      genre: this.genreCluster,
      population: Math.floor(this.population),
      fitness: this.fitness.toFixed(3),
      age: this.age,
      generation: this.generation,
      extinct: this.extinct,
      extinctionReason: this.extinctionReason,
      dominantGenes: this.dominantGenes,
      mutationsCount: this.mutations.length,
      evolutionSteps: this.evolutionHistory.length
    };
  }
}

module.exports = GameSpecies;
