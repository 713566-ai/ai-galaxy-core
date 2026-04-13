class GodOrchestrator {
  constructor(core) {
    this.core = core;
    this.tick = 0;
  }

  think() {
    this.tick++;

    if (!this.core.games) this.core.games = [];
    if (!this.core.worlds) this.core.worlds = [];

    if (this.core.games.length < 3) {
      this.core.games.push({ id: "auto-game-" + Date.now() });
    }

    console.log("🧠 ORCH TICK", this.tick, "games:", this.core.games.length);
  }
}

module.exports = { GodOrchestrator };
