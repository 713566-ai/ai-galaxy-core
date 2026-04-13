// ============================================
// 🌍🧬 V145 - GAME CIVILIZATION MODEL
// ============================================
// ✅ Популяция игроков
// ✅ Эволюция механик
// ✅ Войны между играми
// ✅ Естественный отбор жанров
// ============================================

class GameCivilization {
  constructor(game, index) {
    this.id = game.name || `Game_${Date.now()}_${index}`;
    this.genre = game.genre;
    this.coreLoop = game.coreLoop;
    this.mechanics = [...game.mechanics];
    this.dna = { ...game.dna };
    
    // Цивилизационные метрики
    this.population = 100 + Math.random() * 400;  // начальные "игроки"
    this.funIndex = 0.4 + Math.random() * 0.4;    // насколько интересная
    this.stability = 0.6 + Math.random() * 0.3;   // стабильность игры
    this.evolutionLevel = 1;
    this.generation = 1;
    
    // История
    this.history = [];
    this.warsWon = 0;
    this.warsLost = 0;
    this.mutations = [];
    
    // Статус
    this.status = "alive";
    this.bornAt = Date.now();
    this.lastUpdate = Date.now();
  }
  
  tick() {
    if (this.status !== "alive") return;
    
    // Рост/падение популяции на основе funIndex
    const growthRate = (this.funIndex - 0.5) * 0.1;
    this.population += this.population * growthRate;
    
    // Ограничения
    this.population = Math.max(0, Math.min(10000, this.population));
    
    // Естественная деградация со временем
    const age = (Date.now() - this.bornAt) / 1000;
    const agePenalty = Math.min(0.3, age / 10000);
    
    // Эволюция или деградация
    if (this.funIndex > 0.65) {
      this.evolve();
    } else if (this.funIndex < 0.35 || this.population < 50) {
      this.degrade();
    }
    
    // Стабильность
    this.stability += (this.funIndex - 0.5) * 0.02;
    this.stability = Math.max(0.1, Math.min(1, this.stability));
    
    // Смерть игры
    if (this.population < 10 || this.stability < 0.15) {
      this.status = "dead";
      this.deathReason = this.population < 10 ? "extinction" : "collapse";
    }
    
    // Сохраняем историю
    this.history.push({
      tick: this.history.length,
      population: Math.floor(this.population),
      funIndex: this.funIndex.toFixed(3),
      stability: this.stability.toFixed(3),
      evolutionLevel: this.evolutionLevel
    });
    
    if (this.history.length > 100) this.history.shift();
    
    this.lastUpdate = Date.now();
  }
  
  evolve() {
    this.evolutionLevel++;
    this.funIndex = Math.min(1, this.funIndex + 0.02);
    
    // Мутация механик
    if (Math.random() < 0.3) {
      const mutations = [
        "improved_combat", "better_economy", "enhanced_ai",
        "new_quest_system", "dynamic_difficulty", "social_features"
      ];
      const mutation = mutations[Math.floor(Math.random() * mutations.length)];
      if (!this.mutations.includes(mutation)) {
        this.mutations.push(mutation);
        this.mechanics.push(mutation);
      }
    }
    
    // Мутация DNA
    this.dna.risk = Math.min(1, this.dna.risk + 0.03);
    this.dna.progression = Math.min(1, this.dna.progression + 0.02);
    this.dna.conflict = Math.min(1, this.dna.conflict + 0.02);
  }
  
  degrade() {
    this.funIndex = Math.max(0, this.funIndex - 0.02);
    this.stability -= 0.01;
    this.population *= 0.95;
  }
  
  warWith(enemy) {
    // Сила игры для войны
    const myPower = this.population * this.funIndex * this.stability;
    const enemyPower = enemy.population * enemy.funIndex * enemy.stability;
    
    const myChance = myPower / (myPower + enemyPower);
    const result = Math.random() < myChance;
    
    if (result) {
      // Победа
      this.warsWon++;
      enemy.warsLost++;
      this.population += enemy.population * 0.1;
      enemy.population *= 0.7;
      this.funIndex = Math.min(1, this.funIndex + 0.05);
      enemy.funIndex = Math.max(0, enemy.funIndex - 0.05);
      
      return { winner: this.id, loser: enemy.id, reason: "victory" };
    } else {
      // Поражение
      this.warsLost++;
      enemy.warsWon++;
      this.population *= 0.7;
      enemy.population += this.population * 0.1;
      this.funIndex = Math.max(0, this.funIndex - 0.05);
      enemy.funIndex = Math.min(1, enemy.funIndex + 0.05);
      
      return { winner: enemy.id, loser: this.id, reason: "defeat" };
    }
  }
  
  crossbreedWith(enemy) {
    // Скрещивание двух игр для создания потомка
    const childGenre = Math.random() > 0.5 ? this.genre : enemy.genre;
    const childCoreLoop = Math.random() > 0.5 ? this.coreLoop : enemy.coreLoop;
    
    // Смешиваем механики
    const combinedMechanics = [...new Set([...this.mechanics, ...enemy.mechanics])];
    const childMechanics = combinedMechanics.slice(0, 5);
    
    // Смешиваем DNA
    const childDNA = {
      risk: (this.dna.risk + enemy.dna.risk) / 2,
      chaos: (this.dna.chaos + enemy.dna.chaos) / 2,
      progression: (this.dna.progression + enemy.dna.progression) / 2,
      playerFreedom: (this.dna.playerFreedom + enemy.dna.playerFreedom) / 2,
      conflict: (this.dna.conflict + enemy.dna.conflict) / 2,
      exploration: (this.dna.exploration + enemy.dna.exploration) / 2
    };
    
    const childGame = {
      name: `${this.id}_x_${enemy.id}`,
      genre: childGenre,
      coreLoop: childCoreLoop,
      mechanics: childMechanics,
      dna: childDNA
    };
    
    return childGame;
  }
  
  getStats() {
    return {
      id: this.id,
      genre: this.genre,
      population: Math.floor(this.population),
      funIndex: this.funIndex.toFixed(3),
      stability: this.stability.toFixed(3),
      evolutionLevel: this.evolutionLevel,
      warsWon: this.warsWon,
      warsLost: this.warsLost,
      status: this.status,
      mutations: this.mutations,
      age: Math.floor((Date.now() - this.bornAt) / 1000)
    };
  }
}

module.exports = GameCivilization;
