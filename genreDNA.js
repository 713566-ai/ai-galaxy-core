// ============================================
// 🧬 V148 - GENRE DNA ENGINE
// ============================================
// ✅ Генерация новых жанров
// ✅ Комбинация механик
// ✅ Эволюция жанровых правил
// ============================================

class GenreDNA {
  constructor() {
    this.components = [];
    this.rules = [];
    this.identity = this.generateIdentity();
    this.stability = 0.5 + Math.random() * 0.3;
    this.popularity = 0.3 + Math.random() * 0.5;
    this.age = 0;
    this.generation = 1;
    this.parents = [];
  }

  generateIdentity() {
    const prefixes = ["neo", "post", "hyper", "micro", "mega", "ultra", "dark", "light", "chaos", "order"];
    const cores = ["strategy", "action", "simulation", "adventure", "puzzle", "survival", "rpg", "sandbox"];
    const suffixes = ["fusion", "drift", "shift", "flux", "core", "verse", "scape", "zone"];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const core = cores[Math.floor(Math.random() * cores.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix}-${core}-${suffix}`;
  }

  mutateFrom(speciesA, speciesB) {
    // 🧬 Слияние механик двух видов
    const mechanicsA = speciesA.dna?.mechanics || [];
    const mechanicsB = speciesB.dna?.mechanics || [];
    
    const combined = [...new Set([...mechanicsA, ...mechanicsB])];
    this.components = combined.slice(0, 6);
    this.parents = [speciesA.id, speciesB.id];
    this.generation = Math.max(speciesA.generation || 1, speciesB.generation || 1) + 1;
    
    // 🎲 Абстракция в жанровые правила
    this.rules = this.compressToRules(combined);
    
    // Начальная популярность
    this.popularity = (speciesA.fitness + speciesB.fitness) / 2;
    this.stability = 0.4 + Math.random() * 0.4;
  }

  compressToRules(mechanics) {
    const rules = [];
    
    if (mechanics.includes("combat") && mechanics.includes("economy")) {
      rules.push("conflict-driven economy loop");
    }
    if (mechanics.includes("combat") && mechanics.includes("exploration")) {
      rules.push("risk-reward exploration system");
    }
    if (mechanics.includes("economy") && mechanics.includes("diplomacy")) {
      rules.push("trade-based progression");
    }
    if (mechanics.includes("survival") && mechanics.includes("crafting")) {
      rules.push("resource management with creativity");
    }
    if (mechanics.includes("ai_agents") && mechanics.includes("diplomacy")) {
      rules.push("emergent faction relationships");
    }
    if (mechanics.includes("magic") && mechanics.includes("technology_tree")) {
      rules.push("tech vs magic progression");
    }
    if (mechanics.includes("stealth") && mechanics.includes("combat")) {
      rules.push("tactical positioning system");
    }
    if (mechanics.includes("territory_control") && mechanics.includes("economy")) {
      rules.push("land-based economic simulation");
    }
    
    if (rules.length === 0) {
      rules.push("emergent undefined behavior");
      rules.push("self-modifying mechanics");
    }
    
    return rules;
  }

  tick(environmentPressure) {
    this.age++;
    
    // Эволюция популярности
    this.popularity += (Math.random() - 0.5) * 0.05;
    this.popularity = Math.max(0.05, Math.min(0.95, this.popularity));
    
    // Стабильность жанра
    this.stability += (Math.random() - 0.5) * 0.03;
    this.stability = Math.max(0.1, Math.min(0.9, this.stability));
    
    // Умирание жанра
    return this.popularity > 0.15 && this.stability > 0.1;
  }

  getDescription() {
    let type = "emergent";
    if (this.rules.some(r => r.includes("conflict"))) type = "competitive";
    if (this.rules.some(r => r.includes("exploration"))) type = "discovery";
    if (this.rules.some(r => r.includes("economy"))) type = "economic";
    if (this.rules.some(r => r.includes("survival"))) type = "survival";
    
    return {
      identity: this.identity,
      type: type,
      rules: this.rules,
      popularity: this.popularity.toFixed(2),
      stability: this.stability.toFixed(2),
      generation: this.generation
    };
  }
}

module.exports = GenreDNA;
