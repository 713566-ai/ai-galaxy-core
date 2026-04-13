// ============================================
// 🧠 V144 - GAME AUTONOMY BRAIN
// ============================================
// ✅ Принятие решений о создании игр
// ✅ Эволюция концептов
// ✅ Обучение на результатах
// ============================================

const creativeLoop = require("./creativeLoop");

class GameBrain {
  constructor(factory) {
    this.factory = factory;
    this.memory = [];
    this.evolutionHistory = [];
    this.bestGames = [];
    this.generation = 0;
  }

  decideNextGame(worldState) {
    let concept = creativeLoop.generateConcept();
    
    // Оценка концепта
    const evaluation = creativeLoop.evaluateConcept(concept);
    
    // Если концепт плохой — мутируем
    if (evaluation.score < 0.4) {
      concept = creativeLoop.mutateConcept(concept);
      concept.mutatedFrom = "low_score";
    }
    
    // Адаптация под состояние мира
    if (worldState.entropy > 0.6) {
      concept.funDNA.chaos += 0.1;
      concept.funDNA.chaos = Math.min(1, concept.funDNA.chaos);
      concept.mechanics.push("chaos-adaptation-system");
    }
    
    if (worldState.stability < 0.4) {
      concept.funDNA.conflict += 0.15;
      concept.funDNA.conflict = Math.min(1, concept.funDNA.conflict);
      concept.mechanics.push("stability-crisis-system");
    }
    
    // Выбор жанра на основе состояния
    if (worldState.entropy > 0.7) {
      concept.genre = "survival";
    } else if (worldState.stability > 0.7) {
      concept.genre = "strategy";
    }
    
    return concept;
  }

  evaluateConcept(concept) {
    return creativeLoop.evaluateConcept(concept);
  }

  mutate(concept) {
    return creativeLoop.mutateConcept(concept);
  }

  learn(gameResult) {
    this.memory.push({
      ...gameResult,
      timestamp: Date.now(),
      generation: this.generation
    });
    
    if (this.memory.length > 100) {
      this.memory.shift();
    }
    
    // Запоминаем лучшие игры
    if (gameResult.successScore > 0.7) {
      this.bestGames.push({
        concept: gameResult.concept,
        score: gameResult.successScore,
        timestamp: Date.now()
      });
      this.bestGames = this.bestGames.sort((a, b) => b.score - a.score).slice(0, 10);
    }
    
    // Эволюция поколения
    if (this.memory.length % 10 === 0 && this.memory.length > 0) {
      this.generation++;
      this.evolutionHistory.push({
        generation: this.generation,
        avgScore: this.memory.slice(-10).reduce((s, r) => s + (r.successScore || 0), 0) / 10,
        timestamp: Date.now()
      });
    }
  }

  getBestConcept() {
    if (this.bestGames.length === 0) {
      return creativeLoop.generateConcept();
    }
    
    const best = this.bestGames[0];
    return creativeLoop.mutateConcept(best.concept);
  }

  getStats() {
    const recentScores = this.memory.slice(-20).map(r => r.successScore).filter(s => s !== undefined);
    const avgScore = recentScores.length > 0 
      ? recentScores.reduce((s, v) => s + v, 0) / recentScores.length 
      : 0;
    
    return {
      generation: this.generation,
      memorySize: this.memory.length,
      bestGamesCount: this.bestGames.length,
      averageRecentScore: avgScore.toFixed(2),
      evolutionHistory: this.evolutionHistory.slice(-10)
    };
  }
}

module.exports = GameBrain;
