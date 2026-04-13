// ============================================
// 🧠 V147 - BRAIN CLIMATE ENGINE
// ============================================
// ✅ Эволюционный климат
// ✅ Давление отбора
// ✅ Адаптация системы
// ============================================

class BrainClimate {
  constructor() {
    this.aggression = 0.5;
    this.innovation = 0.5;
    this.instability = 0.5;
    this.diversityPressure = 0.5;
    this.history = [];
  }
  
  tick(biosphere) {
    const chaos = biosphere.globalEntropy;
    const speciesCount = biosphere.species.length;
    
    // 🌍 Реакция на состояние экосистемы
    this.innovation += chaos * 0.02;
    this.aggression += (speciesCount < 3 ? 0.03 : -0.01);
    this.instability = chaos;
    this.diversityPressure = Math.min(1, (5 - speciesCount) / 5);
    
    // Ограничения
    this.innovation = Math.max(0, Math.min(1, this.innovation));
    this.aggression = Math.max(0, Math.min(1, this.aggression));
    this.instability = Math.max(0, Math.min(1, this.instability));
    
    // Сохраняем историю
    this.history.push({
      timestamp: Date.now(),
      aggression: this.aggression.toFixed(3),
      innovation: this.innovation.toFixed(3),
      instability: this.instability.toFixed(3),
      diversityPressure: this.diversityPressure.toFixed(3)
    });
    if (this.history.length > 100) this.history.shift();
  }
  
  getPressure() {
    return (
      this.innovation * 0.3 +
      this.aggression * 0.25 +
      this.instability * 0.25 +
      this.diversityPressure * 0.2
    );
  }
  
  getClimate() {
    let description = "balanced";
    if (this.aggression > 0.7) description = "competitive";
    if (this.innovation > 0.7) description = "innovative";
    if (this.instability > 0.7) description = "chaotic";
    if (this.diversityPressure > 0.7) description = "diverse";
    
    return {
      aggression: this.aggression.toFixed(3),
      innovation: this.innovation.toFixed(3),
      instability: this.instability.toFixed(3),
      diversityPressure: this.diversityPressure.toFixed(3),
      description: description
    };
  }
  
  getStats() {
    return {
      current: this.getClimate(),
      history: this.history.slice(-20)
    };
  }
}

module.exports = new BrainClimate();
