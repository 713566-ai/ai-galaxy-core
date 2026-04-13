// ============================================
// 🧠 V148 - TREND PREDICTION BRAIN
// ============================================
// ✅ Выбор следующего жанра
// ✅ Прогнозирование трендов
// ✅ Адаптация к рынку
// ============================================

class BrainV148 {
  constructor() {
    this.predictions = [];
    this.decisionHistory = [];
  }

  decideNextGenre(biosphere, industry) {
    const pressure = biosphere.globalEntropy;
    const trends = industry.getTrending();
    
    let selectedGenre = null;
    
    // 📈 Выбор на основе трендов
    if (trends.length > 0 && Math.random() < 0.7) {
      // Выбираем популярный или растущий жанр
      const topTrends = trends.slice(0, 3);
      selectedGenre = topTrends[Math.floor(Math.random() * topTrends.length)];
    } else {
      // Иногда экспериментируем с новым
      selectedGenre = { id: "emergent-experimental", popularity: 0.3 };
    }
    
    this.decisionHistory.push({
      timestamp: Date.now(),
      selected: selectedGenre.id,
      pressure: pressure.toFixed(3)
    });
    
    if (this.decisionHistory.length > 50) this.decisionHistory.shift();
    
    return selectedGenre.id;
  }

  getTrendPrediction() {
    return {
      recentDecisions: this.decisionHistory.slice(-10),
      confidence: 0.6 + Math.random() * 0.3
    };
  }
}

module.exports = new BrainV148();
