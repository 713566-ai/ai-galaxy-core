class RealLoop {
    constructor() {
        this.tick = 0;
        this.running = false;
        this.interval = null;
        this.core = null;
    }

    init(core) {
        this.core = core;
        return this;
    }

    start(interval = 2000) {
        if (this.running) return;
        this.running = true;
        console.log("🔥 V62 REAL LOOP STARTED");
        this.interval = setInterval(() => this.step(), interval);
    }

    step() {
        this.tick++;
        const world = this.core.world();
        const signal = this.core.metaWill.analyze(world);
        const decision = this.core.metaWill.decide(signal);
        const patches = this.core.swarm.propose(signal);
        
        for (const p of patches) {
            this.core.patchEngine.apply(p);
        }
        
        console.log(`🧬 V62 T${this.tick} | ${decision} | entropy=${world.entropy.toFixed(3)}`);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.running = false;
    }

    getStats() {
        return { running: this.running, tick: this.tick };
    }
}

module.exports = RealLoop;
