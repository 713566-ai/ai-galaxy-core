// ============================================
// 🧬 V143 - CREATIVE LOOP ENGINE
// ============================================
// ✅ Генерация игровых концептов
// ✅ Механики и core loop
// ✅ FUN DNA (генетический код игры)
// ============================================

class CreativeLoop {
  constructor() {
    this.genres = ["sandbox", "strategy", "roguelike", "simulation", "chaos", "survival", "rpg", "puzzle"];
    this.coreLoops = [
      "collect → upgrade → dominate",
      "explore → adapt → survive",
      "build → defend → expand",
      "mutate → evolve → conquer",
      "harvest → process → sell",
      "research → develop → innovate",
      "survive → adapt → evolve",
      "craft → battle → loot"
    ];
    this.mechanicsPool = [
      "dynamic economy drift", "AI faction diplomacy", "procedural events system",
      "entropy-based difficulty", "resource mutation", "random tech corruption",
      "emergent alliances", "territory control", "supply chain management",
      "weather effects", "day/night cycle", "faction reputation system",
      "skill tree progression", "crafting recipes", "market price fluctuation",
      "quest generation", "event chains", "morale system", "technology tree"
    ];
  }

  generateConcept() {
    return {
      genre: this.pickGenre(),
      coreLoop: this.generateCoreLoop(),
      mechanics: this.generateMechanics(),
      funDNA: this.generateFunDNA(),
      generatedAt: Date.now()
    };
  }

  pickGenre() {
    return this.genres[Math.floor(Math.random() * this.genres.length)];
  }

  generateCoreLoop() {
    return this.coreLoops[Math.floor(Math.random() * this.coreLoops.length)];
  }

  generateMechanics() {
    const shuffled = [...this.mechanicsPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4 + Math.floor(Math.random() * 3));
  }

  generateFunDNA() {
    return {
      risk: Math.random(),
      chaos: Math.random(),
      progression: Math.random(),
      playerFreedom: Math.random(),
      conflict: Math.random(),
      exploration: Math.random()
    };
  }

  evaluateConcept(concept) {
    const score = 
      concept.funDNA.risk * 0.2 +
      concept.funDNA.chaos * 0.15 +
      concept.funDNA.progression * 0.2 +
      concept.funDNA.playerFreedom * 0.15 +
      concept.funDNA.conflict * 0.15 +
      concept.funDNA.exploration * 0.15;
    
    const verdict = score > 0.7 ? "excellent" : score > 0.5 ? "good" : score > 0.3 ? "average" : "poor";
    
    return { score, verdict };
  }

  mutateConcept(concept) {
    const mutated = { ...concept, funDNA: { ...concept.funDNA } };
    
    // Мутация параметров
    mutated.funDNA.risk = Math.min(1, mutated.funDNA.risk + (Math.random() - 0.5) * 0.2);
    mutated.funDNA.chaos = Math.min(1, mutated.funDNA.chaos + (Math.random() - 0.5) * 0.2);
    mutated.funDNA.progression = Math.min(1, mutated.funDNA.progression + (Math.random() - 0.5) * 0.2);
    mutated.funDNA.playerFreedom = Math.min(1, mutated.funDNA.playerFreedom + (Math.random() - 0.5) * 0.2);
    mutated.funDNA.conflict = Math.min(1, mutated.funDNA.conflict + (Math.random() - 0.5) * 0.2);
    mutated.funDNA.exploration = Math.min(1, mutated.funDNA.exploration + (Math.random() - 0.5) * 0.2);
    
    // Иногда меняем механику
    if (Math.random() < 0.3) {
      const newMechanic = this.mechanicsPool[Math.floor(Math.random() * this.mechanicsPool.length)];
      mutated.mechanics = [...mutated.mechanics, newMechanic].slice(0, 6);
    }
    
    mutated.mutated = true;
    mutated.parentConcept = concept.genre;
    
    return mutated;
  }
}

module.exports = new CreativeLoop();
