class RealLoop {
    constructor(core) {
        this.core = core;
        this.tick = 0;
        this.timer = null;
        this.running = false;
    }

    getWorld() {
        const god = this.core.godCore?.getState?.() || {};
        const swarm = this.core.swarm?.getStats?.() || {};

        return {
            entropy: god.entropy ?? 0.5,
            wars: god.wars ?? 0,
            entities: god.entities ?? swarm.agentsCount ?? 0,
            alliances: god.alliances ?? 0
        };
    }

    start(interval = 2000) {
        if (this.timer) {
            console.log("⚠️ Loop already running");
            return;
        }
        this.running = true;
        this.timer = setInterval(() => this.step(), interval);
        console.log("🧬 V62 REAL LOOP RUNNING");
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.running = false;
        console.log("🛑 V62 REAL LOOP STOPPED");
    }

    step() {
        this.tick++;
        const world = this.getWorld();
        
        if (this.core.metaWill) {
            const signal = this.core.metaWill.analyze(world);
            this.core.metaWill.evolveRules(signal);
        }
        
        console.log(`🧬 T${this.tick} | E:${world.entropy.toFixed(3)} W:${world.wars} N:${world.entities}`);
    }

    getStats() {
        return { running: this.running, tick: this.tick };
    }
}

module.exports = RealLoop;
