// ============================================
// 🏭 V148 - GENRE FACTORY
// ============================================
// ✅ Создание жанров из видов
// ✅ Случайный дрейф жанров
// ✅ Эволюция жанровых ДНК
// ============================================

const GenreDNA = require("./genreDNA");

class GenreFactory {
  constructor() {
    this.genreHistory = [];
    this.genrePool = new Map();
  }

  createFrom(speciesA, speciesB) {
    const genre = new GenreDNA();
    genre.mutateFrom(speciesA, speciesB);
    
    this.genreHistory.push({
      id: genre.identity,
      parents: genre.parents,
      generation: genre.generation,
      createdAt: Date.now(),
      rules: genre.rules
    });
    
    this.genrePool.set(genre.identity, genre);
    
    if (this.genreHistory.length > 100) this.genreHistory.shift();
    
    console.log(`🎭 [NEW GENRE] ${genre.identity} (gen ${genre.generation})`);
    return genre;
  }

  randomDriftGenre() {
    const genre = new GenreDNA();
    genre.rules = [
      "chaos-driven progression",
      "unstable reward system",
      "self-modifying mechanics",
      "emergent narrative generation"
    ];
    genre.identity = `drift-${Math.random().toString(36).slice(2, 10)}`;
    genre.stability = 0.2 + Math.random() * 0.3;
    genre.popularity = 0.1 + Math.random() * 0.4;
    
    this.genrePool.set(genre.identity, genre);
    
    console.log(`🌊 [DRIFT GENRE] ${genre.identity} (experimental)`);
    return genre;
  }

  getGenre(identity) {
    return this.genrePool.get(identity);
  }

  getTrendingGenres(limit = 10) {
    return Array.from(this.genrePool.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
      .map(g => g.getDescription());
  }

  getDeadGenres() {
    // Жанры, которые потеряли популярность
    return Array.from(this.genrePool.values())
      .filter(g => g.popularity < 0.15 || g.stability < 0.1)
      .map(g => g.getDescription());
  }

  getStats() {
    return {
      totalGenres: this.genrePool.size,
      historySize: this.genreHistory.length,
      trendingCount: this.getTrendingGenres(5).length
    };
  }
}

module.exports = new GenreFactory();
