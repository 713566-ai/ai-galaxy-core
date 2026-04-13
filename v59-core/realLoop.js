class RealLoop {
    constructor(core) {
        this.core = core;
        this.tick = 0;
        this.running = false;
        this.interval = null;
        this.history = [];
    }

    start(intervalMs = 2000) {
        if (this.running) return;
        this.running = true;
        console.log("🔥 V59 REAL LOOP STARTED");
        this.interval = setInterval(() => {
            try {
                this.step();
            } catch (e) {
                console.error("💀 LOOP CRASH:", e.message);
            }
        }, intervalMs);
    }

    step() {
        this.tick++;
        const state = this.core.getState?.() || {};
        const world = {
            entropy: state.entropy || 0.5,
            wars: state.wars || 0,
            entities: state.entities || 500,
            alliances: state.alliances || 0
        };
        if (this.core.metaWill) {
            const signal = this.core.metaWill.analyze(world);
            this.core.metaWill.evolveRules(signal);
        }
        this.history.push({ tick: this.tick, entropy: world.entropy });
        if (this.history.length > 100) this.history.shift();
        console.log(`🧬 TICK ${this.tick} | entropy=${world.entropy}`);
    }

    stop() {
        clearInterval(this.interval);
        this.running = false;
        console.log("🛑 V59 LOOP STOPPED");
    }

    getStats() {
        return { running: this.running, tick: this.tick, historyLength: this.history.length };
    }
}

module.exports = RealLoop;
