// ============================================
// 📊 V148 - GAME INDUSTRY ENGINE
// ============================================
// ✅ Тренды жанров
// ✅ Умирание жанров
// ✅ Конкуренция жанров
// ============================================

class GameIndustry {
  constructor() {
    this.trendingGenres = [];
    this.deadGenres = [];
    this.genreHistory = [];
    this.marketCycles = 0;
  }

  update(biosphere, genreFactory) {
    const species = biosphere.species;
    this.marketCycles++;
    
    // ⚡ Создание новых жанров из случайных пар видов
    if (species.length > 1 && Math.random() < 0.4) {
      const idx1 = Math.floor(Math.random() * species.length);
      let idx2;
      do { idx2 = Math.floor(Math.random() * species.length); } while (idx1 === idx2);
      
      const speciesA = species[idx1];
      const speciesB = species[idx2];
      
      const newGenre = genreFactory.createFrom(speciesA, speciesB);
      this.trendingGenres.push({
        genre: newGenre,
        popularity: newGenre.popularity,
        addedAt: Date.now()
      });
    }
    
    // Случайное появление дрейфующего жанра
    if (Math.random() < 0.1 && species.length > 0) {
      const driftGenre = genreFactory.randomDriftGenre();
      this.trendingGenres.push({
        genre: driftGenre,
        popularity: driftGenre.popularity,
        addedAt: Date.now()
      });
    }
    
    // 📈 Эволюция трендов
    for (const trend of this.trendingGenres) {
      const alive = trend.genre.tick(biosphere.globalEntropy);
      trend.popularity = trend.genre.popularity;
      
      // Влияние глобальной энтропии
      if (biosphere.globalEntropy > 0.7) {
        trend.popularity *= 0.95;
      }
    }
    
    // 💀 Смерть жанров
    const stillAlive = [];
    for (const trend of this.trendingGenres) {
      if (trend.genre.popularity > 0.12 && trend.genre.stability > 0.08) {
        stillAlive.push(trend);
      } else {
        this.deadGenres.push({
          genre: trend.genre.getDescription(),
          diedAt: Date.now(),
          lifespan: trend.genre.age
        });
        console.log(`💀 [GENRE DEATH] ${trend.genre.identity}`);
      }
    }
    
    this.trendingGenres = stillAlive;
    
    // Ограничение истории
    if (this.deadGenres.length > 100) this.deadGenres.shift();
    if (this.genreHistory.length > 200) this.genreHistory.shift();
  }

  getTrending() {
    return this.trendingGenres
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map(t => ({
        id: t.genre.identity,
        popularity: t.popularity.toFixed(3),
        rules: t.genre.rules,
        generation: t.genre.generation
      }));
  }

  getStats() {
    return {
      trendingGenres: this.trendingGenres.length,
      deadGenres: this.deadGenres.length,
      marketCycles: this.marketCycles,
      totalGenresEver: this.trendingGenres.length + this.deadGenres.length
    };
  }
}

module.exports = new GameIndustry();
