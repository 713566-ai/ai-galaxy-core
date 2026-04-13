// ============================================
// 🌍 V147 - GAME BIOSPHERE
// ============================================
// ✅ Экосистема игровых видов
// ✅ Глобальная энтропия
// ✅ Естественный отбор
// ============================================

class GameBiosphere {
  constructor() {
    this.species = [];
    this.globalEntropy = 0.5;
    this.stability = 1.0;
    this.biodiversity = 0;
    this.history = [];
    this.extinctionEvents = [];
    this.speciationEvents = [];
  }
  
  add(species) {
    this.species.push(species);
    this.speciationEvents.push({
      id: species.id,
      genre: species.genreCluster,
      timestamp: Date.now(),
      population: species.population
    });
    console.log(`🌱 [SPECIATION] New species: ${species.id} (${species.genreCluster})`);
  }
  
  tick() {
    // 🌪 Глобальная энтропия меняется
    this.globalEntropy += (Math.random() - 0.5) * 0.03;
    this.globalEntropy = Math.max(0.1, Math.min(0.9, this.globalEntropy));
    
    const pressure = this.calculateEnvironmentPressure();
    
    // 🧬 Обновление всех видов
    for (const species of this.species) {
      species.tick(pressure, this.globalEntropy);
    }
    
    // 💀 Удаление вымерших видов
    const extinctSpecies = this.species.filter(s => s.extinct);
    for (const species of extinctSpecies) {
      this.extinctionEvents.push({
        id: species.id,
        genre: species.genreCluster,
        reason: species.extinctionReason,
        age: species.age,
        timestamp: Date.now()
      });
      console.log(`💀 [EXTINCTION] ${species.id} (${species.genreCluster}) - ${species.extinctionReason}`);
    }
    
    this.species = this.species.filter(s => !s.extinct);
    
    // 📊 Биоразнообразие
    const genres = [...new Set(this.species.map(s => s.genreCluster))];
    this.biodiversity = genres.length;
    
    // 🌍 Стабильность экосистемы
    this.stability = Math.min(1, this.species.length / 15);
    
    // 📜 История
    if (this.species.length > 0) {
      this.history.push({
        timestamp: Date.now(),
        speciesCount: this.species.length,
        biodiversity: this.biodiversity,
        globalEntropy: this.globalEntropy.toFixed(3),
        stability: this.stability.toFixed(3)
      });
      if (this.history.length > 100) this.history.shift();
    }
    
    return {
      speciesCount: this.species.length,
      biodiversity: this.biodiversity,
      globalEntropy: this.globalEntropy,
      stability: this.stability
    };
  }
  
  calculateEnvironmentPressure() {
    // Давление среды = энтропия + (1 - стабильность)
    return this.globalEntropy * 0.6 + (1 - this.stability) * 0.4;
  }
  
  getDominantSpecies() {
    if (this.species.length === 0) return null;
    return this.species.sort((a, b) => b.population - a.population)[0];
  }
  
  getStats() {
    const genres = {};
    for (const species of this.species) {
      genres[species.genreCluster] = (genres[species.genreCluster] || 0) + 1;
    }
    
    return {
      totalSpecies: this.species.length,
      biodiversity: this.biodiversity,
      globalEntropy: this.globalEntropy.toFixed(3),
      stability: this.stability.toFixed(3),
      dominantGenre: this.getDominantSpecies()?.genreCluster || "none",
      genreDistribution: genres,
      totalExtinctions: this.extinctionEvents.length,
      totalSpeciations: this.speciationEvents.length
    };
  }
}

module.exports = new GameBiosphere();
