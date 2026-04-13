// ============================================
// 🧬 V143 CREATIVE LOOP ENGINE
// ============================================
// ✅ Генерация механик
// ✅ Оценка "интересности"
// ✅ Симуляция до сборки
// ✅ Эволюция идей
// ============================================

class CreativeLoopEngine {
  constructor() {
    this.mechanicsLibrary = [];
    this.successfulPatterns = [];
    this.failedPatterns = [];
    this.evolutionMemory = [];
    this.generation = 0;
  }

  // ===============================
  // 🧠 1. MECHANIC GENERATOR
  // ===============================
  generateMechanics() {
    const coreLoops = [
      "collect → upgrade → dominate",
      "explore → exploit → expand",
      "build → trade → conquer",
      "survive → adapt → evolve",
      "craft → battle → loot",
      "research → develop → innovate",
      "recruit → train → deploy",
      "harvest → process → sell"
    ];
    
    const mechanicPool = [
      "resource mutation", "AI faction diplomacy drift", "random tech corruption",
      "dynamic difficulty scaling", "emergent alliances", "territory control",
      "supply chain management", "weather effects", "day/night cycle",
      "faction reputation system", "skill tree progression", "crafting recipes",
      "market price fluctuation", "quest generation", "event chains",
      "morale system", "technology tree", "research branches"
    ];
    
    // Выбираем случайный core loop
    const coreLoop = coreLoops[Math.floor(Math.random() * coreLoops.length)];
    
    // Выбираем 3-5 механик
    const shuffled = [...mechanicPool].sort(() => 0.5 - Math.random());
    const mechanics = shuffled.slice(0, 3 + Math.floor(Math.random() * 3));
    
    return {
      core_loop: coreLoop,
      mechanics: mechanics,
      generatedAt: Date.now(),
      generation: this.generation
    };
  }

  // ===============================
  // 🎯 2. FUN EVALUATOR
  // ===============================
  evaluateFun(mechanics, simulationResult) {
    let score = 0;
    let feedback = [];
    
    // Фактор 1: Разнообразие механик
    const varietyScore = Math.min(1, mechanics.mechanics.length / 6);
    score += varietyScore * 25;
    feedback.push(`Разнообразие: ${(varietyScore * 100).toFixed(0)}%`);
    
    // Фактор 2: Конфликтность (есть ли вражда/конкуренция)
    const hasConflict = mechanics.mechanics.some(m => 
      m.includes("war") || m.includes("combat") || m.includes("enemy") || 
      m.includes("conflict") || m.includes("attack") || m.includes("battle")
    );
    const conflictScore = hasConflict ? 0.8 : 0.3;
    score += conflictScore * 25;
    feedback.push(`Конфликтность: ${(conflictScore * 100).toFixed(0)}%`);
    
    // Фактор 3: Эволюция (есть ли прогресс/развитие)
    const hasEvolution = mechanics.mechanics.some(m =>
      m.includes("evolve") || m.includes("upgrade") || m.includes("tech") ||
      m.includes("research") || m.includes("level") || m.includes("tree")
    );
    const evolutionScore = hasEvolution ? 0.85 : 0.4;
    score += evolutionScore * 25;
    feedback.push(`Эволюция: ${(evolutionScore * 100).toFixed(0)}%`);
    
    // Фактор 4: Непредсказуемость (случайные элементы)
    const hasRandomness = mechanics.mechanics.some(m =>
      m.includes("random") || m.includes("drift") || m.includes("chaos") ||
      m.includes("dynamic") || m.includes("fluctuation")
    );
    const randomScore = hasRandomness ? 0.7 : 0.4;
    score += randomScore * 25;
    feedback.push(`Непредсказуемость: ${(randomScore * 100).toFixed(0)}%`);
    
    // Фактор 5: Результаты симуляции (если есть)
    if (simulationResult) {
      const balanceScore = 1 - Math.abs(simulationResult.winnerDominance - 0.5) * 2;
      score += balanceScore * 10;
      feedback.push(`Баланс: ${(balanceScore * 100).toFixed(0)}%`);
      
      const stabilityScore = 1 - simulationResult.collapseRate;
      score += stabilityScore * 10;
      feedback.push(`Стабильность: ${(stabilityScore * 100).toFixed(0)}%`);
    }
    
    const finalScore = Math.min(100, Math.max(0, score));
    const verdict = finalScore > 70 ? "excellent" : finalScore > 50 ? "good" : finalScore > 30 ? "average" : "poor";
    
    return {
      score: finalScore,
      verdict: verdict,
      feedback: feedback,
      isFun: finalScore > 50
    };
  }

  // ===============================
  // 🧪 3. SIMULATION PREVIEW ENGINE
  // ===============================
  simulateGame(mechanics, ticks = 100) {
    let state = {
      tick: 0,
      players: 3,
      resources: { player1: 100, player2: 100, player3: 100 },
      power: { player1: 0.5, player2: 0.5, player3: 0.5 },
      events: []
    };
    
    // Симуляция на основе механик
    for (let i = 0; i < ticks; i++) {
      state.tick++;
      
      // Эффекты механик
      if (mechanics.mechanics.includes("resource mutation")) {
        for (let p in state.resources) {
          state.resources[p] *= (0.9 + Math.random() * 0.2);
        }
      }
      
      if (mechanics.mechanics.includes("dynamic difficulty scaling")) {
        const avgPower = (state.power.player1 + state.power.player2 + state.power.player3) / 3;
        for (let p in state.power) {
          if (state.power[p] > avgPower * 1.2) {
            state.power[p] *= 0.98;
          } else if (state.power[p] < avgPower * 0.8) {
            state.power[p] *= 1.02;
          }
        }
      }
      
      // Рост силы от ресурсов
      for (let p in state.power) {
        const resourceKey = p;
        state.power[p] += (state.resources[resourceKey] / 1000) * 0.01;
        state.power[p] = Math.min(1, Math.max(0.1, state.power[p]));
      }
      
      // Случайные события
      if (Math.random() < 0.05) {
        const eventTypes = ["conflict", "alliance", "discovery", "crisis"];
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        state.events.push({ tick: state.tick, type: event });
      }
    }
    
    // Определяем победителя
    const players = Object.keys(state.power);
    const winner = players.reduce((a, b) => state.power[a] > state.power[b] ? a : b);
    const winnerDominance = state.power[winner];
    
    // Определяем коллапсы (когда ресурс упал ниже 10)
    let collapseCount = 0;
    for (let p in state.resources) {
      if (state.resources[p] < 10) collapseCount++;
    }
    const collapseRate = collapseCount / 3;
    
    return {
      ticksSimulated: ticks,
      finalState: state,
      winner: winner,
      winnerDominance: winnerDominance,
      collapseRate: collapseRate,
      eventsCount: state.events.length
    };
  }

  // ===============================
  // 🔁 4. CREATIVE FEEDBACK LOOP
  // ===============================
  creativeLoop(iterations = 5) {
    console.log(`\n🧬 [CREATIVE LOOP] Generation ${this.generation + 1}`);
    console.log(`   Iterations: ${iterations}\n`);
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      console.log(`   🎲 Iteration ${i + 1}/${iterations}...`);
      
      // 1. GENERATE
      const mechanics = this.generateMechanics();
      
      // 2. SIMULATE
      const simulation = this.simulateGame(mechanics);
      
      // 3. EVALUATE
      const evaluation = this.evaluateFun(mechanics, simulation);
      
      // 4. RECORD
      const result = {
        mechanics,
        simulation,
        evaluation,
        timestamp: Date.now()
      };
      
      results.push(result);
      
      // 5. LEARN
      if (evaluation.isFun) {
        this.successfulPatterns.push({
          core_loop: mechanics.core_loop,
          mechanics: mechanics.mechanics,
          score: evaluation.score,
          timestamp: Date.now()
        });
        console.log(`      ✅ FUN SCORE: ${evaluation.score.toFixed(0)}% - ${evaluation.verdict}`);
      } else {
        this.failedPatterns.push({
          core_loop: mechanics.core_loop,
          mechanics: mechanics.mechanics,
          score: evaluation.score,
          timestamp: Date.now()
        });
        console.log(`      ❌ FUN SCORE: ${evaluation.score.toFixed(0)}% - ${evaluation.verdict}`);
      }
      
      // Ограничиваем историю
      if (this.successfulPatterns.length > 50) this.successfulPatterns.shift();
      if (this.failedPatterns.length > 50) this.failedPatterns.shift();
    }
    
    // Эволюция памяти
    this.evolutionMemory.push({
      generation: this.generation,
      timestamp: Date.now(),
      results: results,
      bestScore: Math.max(...results.map(r => r.evaluation.score)),
      avgScore: results.reduce((sum, r) => sum + r.evaluation.score, 0) / results.length
    });
    
    this.generation++;
    
    // Находим лучший результат
    const best = results.sort((a, b) => b.evaluation.score - a.evaluation.score)[0];
    
    console.log(`\n   🏆 BEST SCORE: ${best.evaluation.score.toFixed(0)}% (${best.evaluation.verdict})`);
    console.log(`   📊 AVG SCORE: ${(results.reduce((s, r) => s + r.evaluation.score, 0) / results.length).toFixed(0)}%`);
    console.log(`   🧬 Successful patterns: ${this.successfulPatterns.length}`);
    console.log(`   💀 Failed patterns: ${this.failedPatterns.length}`);
    
    return best;
  }

  // ===============================
  // 🎮 ГЕНЕРАЦИЯ ИГРЫ НА ОСНОВЕ ЛУЧШИХ МЕХАНИК
  // ===============================
  generateBestGame() {
    if (this.successfulPatterns.length === 0) {
      return this.creativeLoop(10);
    }
    
    // Берём лучшие успешные паттерны
    const bestPatterns = this.successfulPatterns
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    // Комбинируем лучшие механики
    const combinedMechanics = [...new Set(bestPatterns.flatMap(p => p.mechanics))];
    const bestCoreLoop = bestPatterns[0].core_loop;
    
    const bestGame = {
      core_loop: bestCoreLoop,
      mechanics: combinedMechanics.slice(0, 6),
      sourceGenerations: bestPatterns.map(p => p.generation),
      score: bestPatterns[0].score,
      generatedAt: Date.now()
    };
    
    return bestGame;
  }

  // ===============================
  // 📊 СТАТИСТИКА
  // ===============================
  getStats() {
    return {
      generation: this.generation,
      successfulPatterns: this.successfulPatterns.length,
      failedPatterns: this.failedPatterns.length,
      averageSuccessScore: this.successfulPatterns.length > 0 
        ? (this.successfulPatterns.reduce((s, p) => s + p.score, 0) / this.successfulPatterns.length).toFixed(0)
        : 0,
      evolutionMemorySize: this.evolutionMemory.length
    };
  }
  
  getBestPatterns() {
    return this.successfulPatterns.slice(0, 10);
  }
}

module.exports = new CreativeLoopEngine();
