const fs = require("fs");

const BRAIN_FILE = "./global-brain.json";

// =========================
// 🧠 GLOBAL BRAIN MEMORY
// =========================

class GlobalBrain {
  constructor() {
    this.state = this.load();
  }

  load() {
    if (fs.existsSync(BRAIN_FILE)) {
      return JSON.parse(fs.readFileSync(BRAIN_FILE, "utf8"));
    }
    return {
      tick: 0,
      worlds: [],
      mutations: 0,
      history: [],
      lastRun: Date.now()
    };
  }

  save() {
    fs.writeFileSync(BRAIN_FILE, JSON.stringify(this.state, null, 2));
  }

  sync(worlds, mutations = 0) {
    this.state.tick++;
    this.state.worlds = worlds;
    this.state.mutations += mutations;

    this.state.history.push({
      tick: this.state.tick,
      worlds: worlds.length,
      mutations,
      time: Date.now()
    });

    if (this.state.history.length > 200) {
      this.state.history.shift();
    }

    this.save();
  }

  log() {
    console.log("🧠 V161 GLOBAL BRAIN");
    console.log({
      tick: this.state.tick,
      worlds: this.state.worlds.length,
      mutations: this.state.mutations
    });
  }
}

module.exports = new GlobalBrain();
