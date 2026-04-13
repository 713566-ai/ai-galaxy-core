class RealLoop {
    constructor(core) {
        this.core = core;
        this.tickCount = 0;
        this.running = false;
        this.interval = null;
    }

    inject(core) {
        this.core = core;
        return this;
    }

    tick() {
        this.tickCount++;
        const world = {
            entropy: this.core?.godCore?.entropy || 0.5,
            wars: this.core?.godCore?.wars || 0,
            entities: this.core?.swarm?.size || 0
        };
        
        if (this.core?.metaWill) {
            const signal = this.core.metaWill.analyze(world);
            this.core.metaWill.evolveRules(signal);
        }
        
        console.log(`🧬 V61 TICK ${this.tickCount} | entropy=${world.entropy.toFixed(3)}`);
    }

    start(intervalMs = 2000) {
        if (this.running) return;
        this.running = true;
        console.log("🔥 V61 REAL LOOP STARTED");
        this.interval = setInterval(() => this.tick(), intervalMs);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.running = false;
    }

    getStats() {
        return { running: this.running, tick: this.tickCount };
    }
}

module.exports = {
    name: 'realLoop',
    init: (core) => new RealLoop(core)
};
