class LoopManager {
    constructor() {
        this.activeLoops = new Map();
    }

    register(name, loop) {
        if (this.activeLoops.has(name)) {
            console.log(`⛔ LOOP "${name}" already exists → ignored`);
            return false;
        }

        this.activeLoops.set(name, loop);
        console.log(`✅ LOOP "${name}" registered`);
        return true;
    }

    unregister(name) {
        this.activeLoops.delete(name);
    }

    stopAll() {
        for (const [name, loop] of this.activeLoops) {
            if (loop.stop) {
                loop.stop();
                console.log(`🛑 LOOP "${name}" stopped`);
            }
        }
        this.activeLoops.clear();
    }

    getActiveCount() {
        return this.activeLoops.size;
    }
}

module.exports = LoopManager;
