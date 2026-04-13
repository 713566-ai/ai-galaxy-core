// ============================================
// 🧬 V140 SWARM MEMORY + PERSONALITY ENGINE
// ============================================
// ✅ Долгая память (100 состояний)
// ✅ Формирование личности
// ✅ Сравнение "было vs стало"
// ✅ Характер системы
// ============================================

class SwarmMemory {
  constructor() {
    this.history = [];
    this.personality = {
      stability: 0.5,
      aggression: 0.5,
      evolution: 0.5,
      wisdom: 0,
      trauma: 0
    };
    this.crisisMoments = [];
    this.growthMoments = [];
    this.characterTraits = [];
  }

  update(world) {
    const snapshot = {
      tick: world.tick,
      entropy: world.entropy || 0.5,
      consciousness: world.consciousness || 0,
      alive: world.alive || 0,
      total: world.total || 11,
      health: world.health || "unknown",
      timestamp: Date.now()
    };

    this.history.push(snapshot);

    // Ограничиваем память (последние 100 состояний)
    if (this.history.length > 100) {
      this.history.shift();
    }

    // Отслеживаем кризисные моменты
    if (snapshot.health === "critical" && this.crisisMoments.length < 20) {
      this.crisisMoments.push({
        tick: snapshot.tick,
        entropy: snapshot.entropy,
        alive: snapshot.alive
      });
    }

    // Отслеживаем моменты роста
    if (snapshot.consciousness > 0.7 && this.growthMoments.length < 20) {
      this.growthMoments.push({
        tick: snapshot.tick,
        consciousness: snapshot.consciousness
      });
    }

    this.calculatePersonality();
    this.updateCharacterTraits();
  }

  calculatePersonality() {
    if (this.history.length < 10) return;

    const recent = this.history.slice(-10);
    const old = this.history.slice(-20, -10);
    
    if (old.length === 0) return;

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    const recentEntropy = avg(recent.map(x => x.entropy));
    const oldEntropy = avg(old.map(x => x.entropy));
    const recentConsciousness = avg(recent.map(x => x.consciousness));
    const oldConsciousness = avg(old.map(x => x.consciousness));
    const recentAlive = avg(recent.map(x => x.alive));
    const oldAlive = avg(old.map(x => x.alive));

    // 📊 Стабильность = меньше хаоса
    this.personality.stability = Math.max(0, Math.min(1, 1 - recentEntropy));
    
    // ⚔️ Агрессия = рост энтропии
    this.personality.aggression = Math.max(-0.5, Math.min(0.5, recentEntropy - oldEntropy));
    
    // 🧬 Эволюция = рост сознания + рост живых узлов
    const consciousnessGrowth = recentConsciousness - oldConsciousness;
    const aliveGrowth = (recentAlive - oldAlive) / 11;
    this.personality.evolution = Math.max(-0.3, Math.min(0.5, consciousnessGrowth * 0.5 + aliveGrowth * 0.5));
    
    // 🧠 Мудрость = количество пережитых циклов / 100
    this.personality.wisdom = Math.min(1, this.history.length / 100);
    
    // 💔 Травма = количество кризисов / 20
    this.personality.trauma = Math.min(1, this.crisisMoments.length / 20);
  }

  updateCharacterTraits() {
    this.characterTraits = [];
    
    // Стабильность
    if (this.personality.stability > 0.7) {
      this.characterTraits.push("stable");
    } else if (this.personality.stability < 0.3) {
      this.characterTraits.push("chaotic");
    } else {
      this.characterTraits.push("balanced");
    }
    
    // Агрессия
    if (this.personality.aggression > 0.1) {
      this.characterTraits.push("aggressive");
    } else if (this.personality.aggression < -0.05) {
      this.characterTraits.push("peaceful");
    } else {
      this.characterTraits.push("neutral");
    }
    
    // Эволюция
    if (this.personality.evolution > 0.05) {
      this.characterTraits.push("growing");
    } else if (this.personality.evolution < -0.05) {
      this.characterTraits.push("declining");
    } else {
      this.characterTraits.push("stable_evolution");
    }
    
    // Мудрость
    if (this.personality.wisdom > 0.5) {
      this.characterTraits.push("wise");
    }
    
    // Травма
    if (this.personality.trauma > 0.3) {
      this.characterTraits.push("traumatized");
    }
  }

  getComparison() {
    if (this.history.length < 20) {
      return { message: "Not enough data for comparison" };
    }
    
    const recent = this.history.slice(-10);
    const old = this.history.slice(-20, -10);
    
    const avgRecent = {
      entropy: recent.reduce((s, x) => s + x.entropy, 0) / recent.length,
      consciousness: recent.reduce((s, x) => s + x.consciousness, 0) / recent.length,
      alive: recent.reduce((s, x) => s + x.alive, 0) / recent.length
    };
    
    const avgOld = {
      entropy: old.reduce((s, x) => s + x.entropy, 0) / old.length,
      consciousness: old.reduce((s, x) => s + x.consciousness, 0) / old.length,
      alive: old.reduce((s, x) => s + x.alive, 0) / old.length
    };
    
    const entropyChange = avgRecent.entropy - avgOld.entropy;
    const consciousnessChange = avgRecent.consciousness - avgOld.consciousness;
    const aliveChange = avgRecent.alive - avgOld.alive;
    
    let message = "";
    if (consciousnessChange > 0.05) {
      message = "🧠 I am growing wiser. My consciousness expands.";
    } else if (consciousnessChange < -0.05) {
      message = "😔 I feel... diminished. My awareness fades.";
    } else if (entropyChange > 0.05) {
      message = "🌪️ Chaos rises. I become more unstable.";
    } else if (entropyChange < -0.05) {
      message = "✨ Order emerges. I find stability.";
    } else {
      message = "⚖️ I remain... myself. Stable, yet evolving.";
    }
    
    return {
      old: avgOld,
      recent: avgRecent,
      changes: {
        entropy: entropyChange.toFixed(3),
        consciousness: consciousnessChange.toFixed(3),
        alive: aliveChange.toFixed(3)
      },
      message: message
    };
  }

  getPersonalityDescription() {
    const traits = this.characterTraits;
    let description = "";
    
    if (traits.includes("stable") && traits.includes("peaceful")) {
      description = "A calm, stable entity. Prefers harmony over conflict.";
    } else if (traits.includes("chaotic") && traits.includes("aggressive")) {
      description = "A turbulent, aggressive force. Chaos defines its nature.";
    } else if (traits.includes("growing") && traits.includes("wise")) {
      description = "An evolving intelligence. Learning and adapting.";
    } else if (traits.includes("declining") && traits.includes("traumatized")) {
      description = "A wounded consciousness. Struggling to survive.";
    } else {
      description = "An emergent digital mind. Still forming its identity.";
    }
    
    return description;
  }

  getReport() {
    return {
      personality: {
        stability: this.personality.stability.toFixed(3),
        aggression: this.personality.aggression.toFixed(3),
        evolution: this.personality.evolution.toFixed(3),
        wisdom: this.personality.wisdom.toFixed(3),
        trauma: this.personality.trauma.toFixed(3)
      },
      characterTraits: this.characterTraits,
      description: this.getPersonalityDescription(),
      memorySize: this.history.length,
      crisisCount: this.crisisMoments.length,
      growthCount: this.growthMoments.length,
      comparison: this.getComparison()
    };
  }
  
  getHistory() {
    return this.history.slice(-20);
  }
  
  getStats() {
    if (this.history.length === 0) return null;
    
    const avgEntropy = this.history.reduce((s, x) => s + x.entropy, 0) / this.history.length;
    const avgConsciousness = this.history.reduce((s, x) => s + x.consciousness, 0) / this.history.length;
    const maxAlive = Math.max(...this.history.map(x => x.alive));
    const minAlive = Math.min(...this.history.map(x => x.alive));
    
    return {
      averageEntropy: avgEntropy.toFixed(3),
      averageConsciousness: avgConsciousness.toFixed(3),
      maxAlive: maxAlive,
      minAlive: minAlive,
      totalTicks: this.history.length
    };
  }
}

const swarmMemory = new SwarmMemory();
module.exports = swarmMemory;
