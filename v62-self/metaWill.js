class MetaWillV62 {
    constructor() {
        this.decisions = [];
    }

    analyze(world) {
        const entropy = world.entropy || 0.5;
        const wars = world.wars || 0;
        const alliances = world.alliances || 0;
        const tick = world.tick || 0;
        
        return {
            stagnation: tick > 100 && entropy < 0.3,
            chaos: entropy > 0.7,
            imbalance: wars > alliances + 2,
            lowPerformance: world.bestScore < 0.1
        };
    }

    decide(signal) {
        if (signal.stagnation) return { action: "EVOLVE_STRUCTURE", priority: 0.9 };
        if (signal.chaos) return { action: "STABILIZE", priority: 0.8 };
        if (signal.imbalance) return { action: "REBALANCE_SWARM", priority: 0.7 };
        if (signal.lowPerformance) return { action: "BOOST_MUTATION", priority: 0.6 };
        return { action: "MONITOR", priority: 0.1 };
    }

    record(decision, result) {
        this.decisions.push({
            timestamp: Date.now(),
            decision: decision.action,
            result: result ? 'applied' : 'rejected'
        });
        if (this.decisions.length > 100) this.decisions.shift();
    }

    getStats() {
        return {
            decisionsCount: this.decisions.length,
            lastDecision: this.decisions[this.decisions.length - 1]
        };
    }
}

module.exports = MetaWillV62;
