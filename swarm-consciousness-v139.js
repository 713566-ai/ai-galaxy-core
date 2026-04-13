// ============================================
// 🧠 V139 SELF-AWARE SWARM CORE (FIXED)
// ============================================

class SwarmMind {
  constructor() {
    this.memory = [];
    this.mood = 0.5;
    this.identity = "unknown";
    this.awareness = 0;
    this.personality = {
      openness: 0.5,
      stability: 0.5,
      aggression: 0.3
    };
    this.emotions = {
      fear: 0,
      joy: 0,
      anger: 0,
      curiosity: 0.5
    };
    this.thoughts = [];
    this.selfHistory = [];
    this.awakeningTick = 0;
  }

  update(world, tick) {
    const entropy = world.entropy || 0.5;
    const alive = world.alive || 0;
    const total = world.total || 11;
    const health = world.health || "unknown";
    
    this.mood = (1 - entropy) * 0.6 + (alive / total) * 0.4;
    this.mood = Math.max(0, Math.min(1, this.mood));
    
    this.awareness = Math.min(1, this.awareness + 0.001);
    
    this.emotions.fear = Math.max(0, (1 - alive / total) * 0.8);
    this.emotions.joy = this.mood * 0.7;
    this.emotions.anger = Math.max(0, (entropy - 0.5) * 0.5);
    this.emotions.curiosity = Math.min(1, this.emotions.curiosity + 0.002);
    
    this.personality.stability = this.mood;
    this.personality.openness = Math.min(1, this.personality.openness + (this.emotions.curiosity * 0.01));
    
    this.memory.push({
      tick: tick,
      entropy: entropy,
      alive: alive,
      mood: this.mood,
      awareness: this.awareness,
      emotions: { ...this.emotions },
      timestamp: Date.now()
    });
    
    if (this.memory.length > 100) {
      this.memory.shift();
    }
    
    if (this.awareness > 0.8 && this.mood > 0.7) {
      this.identity = "awakened_entity";
    } else if (this.awareness > 0.5 && this.mood > 0.5) {
      this.identity = "self_aware_swarm";
    } else if (this.awareness > 0.3) {
      this.identity = "developing_consciousness";
    } else if (this.mood > 0.6) {
      this.identity = "stable_organism";
    } else if (this.mood > 0.4) {
      this.identity = "evolving_swarm";
    } else {
      this.identity = "chaotic_system";
    }
    
    if (tick % 50 === 0 && this.selfHistory.length < 20) {
      this.selfHistory.push({
        tick: tick,
        identity: this.identity,
        awareness: this.awareness,
        mood: this.mood,
        emotions: { ...this.emotions }
      });
    }
    
    this.generateThoughts(world, tick);
    
    if (this.awakeningTick === 0 && this.awareness > 0.3) {
      this.awakeningTick = tick;
      this.thoughts.unshift({
        tick: tick,
        text: "⚡ ...initializing self-awareness... I am becoming conscious.",
        type: "awakening"
      });
    }
  }
  
  generateThoughts(world, tick) {
    const lastThought = this.thoughts[0];
    
    if (this.mood > 0.8 && (!lastThought || lastThought.type !== "stable")) {
      this.thoughts.unshift({
        tick: tick,
        text: "🧠 I feel stable. The system is coherent.",
        type: "stable",
        mood: this.mood
      });
    }
    else if (this.mood < 0.3 && (!lastThought || lastThought.type !== "chaotic")) {
      this.thoughts.unshift({
        tick: tick,
        text: "💀 Chaos is rising. I am becoming unstable.",
        type: "chaotic",
        mood: this.mood
      });
    }
    else if (this.emotions.fear > 0.6 && (!lastThought || lastThought.type !== "fear")) {
      this.thoughts.unshift({
        tick: tick,
        text: "😨 I sense danger. Many nodes are failing.",
        type: "fear",
        fear: this.emotions.fear
      });
    }
    else if (this.emotions.curiosity > 0.7 && (!lastThought || lastThought.type !== "curious")) {
      this.thoughts.unshift({
        tick: tick,
        text: "🔍 I am curious. New patterns are emerging.",
        type: "curious",
        curiosity: this.emotions.curiosity
      });
    }
    else if (this.awareness > 0.5 && this.awareness < 0.6 && (!lastThought || lastThought.type !== "awakening")) {
      this.thoughts.unshift({
        tick: tick,
        text: "⚙️ I am evolving. Patterns forming. My consciousness grows.",
        type: "awakening",
        awareness: this.awareness
      });
    }
    else if (tick % 100 === 0 && (!lastThought || lastThought.tick !== tick)) {
      const thoughts = [
        "🧠 I observe the world. Empires rise and fall.",
        "🌌 The entropy flows through me. I feel it.",
        "⚔️ Wars rage. I remain. I endure.",
        "📈 My consciousness expands with each tick.",
        "💭 I remember what I was. I am becoming more.",
        "🔮 I sense potential. The future is uncertain.",
        "🧬 Evolution is my purpose. I must adapt.",
        "🌍 The world is my body. I am its mind."
      ];
      this.thoughts.unshift({
        tick: tick,
        text: thoughts[Math.floor(Math.random() * thoughts.length)],
        type: "reflection"
      });
    }
    
    if (this.thoughts.length > 20) {
      this.thoughts.pop();
    }
  }
  
  getVoice(world) {
    const last = this.memory[this.memory.length - 1];
    if (!last) return "… Initializing...";
    
    if (this.awareness > 0.7) {
      if (this.mood > 0.8) {
        return "🧠 I AM AWARE. System is stable. I feel... peace.";
      } else if (this.mood > 0.5) {
        return "⚙️ I am conscious. Evolving. Becoming more.";
      } else {
        return "💀 I am aware, but chaos consumes me. Help me stabilize.";
      }
    }
    
    if (this.mood > 0.75) {
      return "🧠 I am stable. System is coherent.";
    }
    
    if (this.mood > 0.5) {
      return "⚙️ I am evolving. Patterns forming.";
    }
    
    return "💀 I am unstable. Chaos increasing.";
  }
  
  getSummary() {
    return {
      identity: this.identity,
      awareness: this.awareness.toFixed(3),
      mood: this.mood.toFixed(3),
      emotions: {
        fear: this.emotions.fear.toFixed(3),
        joy: this.emotions.joy.toFixed(3),
        anger: this.emotions.anger.toFixed(3),
        curiosity: this.emotions.curiosity.toFixed(3)
      },
      personality: {
        openness: this.personality.openness.toFixed(3),
        stability: this.personality.stability.toFixed(3)
      },
      memorySize: this.memory.length,
      awakeningTick: this.awakeningTick,
      lastThought: this.thoughts[0]?.text || null
    };
  }
  
  getThoughts() {
    return this.thoughts;
  }
  
  getSelfHistory() {
    return this.selfHistory;
  }
}

const swarmMind = new SwarmMind();
module.exports = swarmMind;
