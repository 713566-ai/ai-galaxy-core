// ============================================
// ⚔️ V146 - GAME CIVILIZATION WITH DNA
// ============================================
// ✅ Игры как живые организмы
// ✅ Естественный отбор
// ✅ Размножение и гибридизация
// ============================================

const MutationEngine = require("./mutationEngine");

class GameCivilizationV146 {
  constructor(game, dna) {
    this.id = game.name || `Game_${Date.now()}`;
    this.genre = game.genre;
    this.dna = dna;
    
    // Цивилизационные метрики
    this.population = 100 + Math.random() * 400;
    this.funIndex = dna.fun || 0.5;
    this.age = 0;
    this.generation = 1;
    
    // Эволюционная история
    this.evolutionHistory = [];
    this.mutationHistory = [];
    
    // Статус
    this.alive = true;
    this.bornAt = Date.now();
    this.lastEvolution = Date.now();
  }
  
  tick() {
    if (!this.alive) return;
    
    this.age++;
    
    // 📈 Рост/падение популяции
    const growthRate = (this.funIndex - 0.5) * 0.15;
    this.population += this.population * growthRate;
    this.population = Math.max(0, Math.min(10000, this.population));
    
    // 💀 Условия вымирания
    if (this.population <= 10 || this.funIndex < 0.15 || this.dna.stability < 0.1) {
      this.alive = false;
      this.deathReason = this.population <= 10 ? "extinction" : 
                        this.funIndex < 0.15 ? "boring" : "unstable";
      return;
    }
    
    // 🧬 Естественное эволюционное давление
    const evolutionPressure = Math.min(0.5, (1 - this.funIndex) * 0.5);
    
    if (this.funIndex > 0.7 && Math.random() < 0.2) {
      this.evolve();
    }
    
    if (this.funIndex < 0.35 && Math.random() < 0.3) {
      this.mutate(evolutionPressure);
    }
    
    // Естественная деградация стабильности
    this.dna.stability *= 0.999;
    
    // Сохраняем историю
    if (this.age % 10 === 0) {
      this.evolutionHistory.push({
        age: this.age,
        population: Math.floor(this.population),
        funIndex: this.funIndex.toFixed(3),
        complexity: this.dna.complexity.toFixed(2),
        chaos: this.dna.chaos.toFixed(2)
      });
      if (this.evolutionHistory.length > 50) this.evolutionHistory.shift();
    }
    
    this.lastEvolution = Date.now();
  }
  
  evolve() {
    this.generation++;
    this.funIndex = Math.min(1, this.funIndex + 0.03);
    this.population += 10;
    this.dna.stability = Math.min(1, this.dna.stability + 0.02);
    
    this.evolutionHistory.push({
      age: this.age,
      event: "evolution",
      newFun: this.funIndex.toFixed(3)
    });
  }
  
  mutate(pressure) {
    const oldFun = this.funIndex;
    this.dna = MutationEngine.mutate(this.dna, pressure);
    
    // Влияние мутации на интересность
    const mutationImpact = (Math.random() - 0.3) * 0.15;
    this.funIndex = Math.min(1, Math.max(0, this.funIndex + mutationImpact));
    
    this.mutationHistory.push({
      age: this.age,
      oldFun: oldFun.toFixed(3),
      newFun: this.funIndex.toFixed(3),
      impact: mutationImpact.toFixed(3)
    });
    
    if (this.mutationHistory.length > 20) this.mutationHistory.shift();
  }
  
  breed(other) {
    // 🧬 Скрещивание двух игр
    const childDNA = MutationEngine.crossbreed(this.dna, other.dna);
    
    const childGame = {
      name: `${this.id}_x_${other.id}_${Date.now()}`,
      genre: Math.random() > 0.5 ? this.genre : other.genre
    };
    
    const child = new GameCivilizationV146(childGame, childDNA);
    child.generation = Math.max(this.generation, other.generation) + 1;
    
    return child;
  }
  
  getStats() {
    return {
      id: this.id,
      genre: this.genre,
      population: Math.floor(this.population),
      funIndex: this.funIndex.toFixed(3),
      age: this.age,
      generation: this.generation,
      alive: this.alive,
      dna: this.dna.getSummary(),
      mutationsCount: this.mutationHistory.length,
      evolutionSteps: this.evolutionHistory.length
    };
  }
}

module.exports = GameCivilizationV146;
