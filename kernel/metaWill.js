class MetaWill {
    analyze(world) {
        return {
            stagnation: world.tick > 50 && world.entropy < 0.3,
            chaos: world.entropy > 0.7,
            imbalance: world.wars > world.alliances,
            overload: world.entities > 1000
        };
    }

    decide(signal) {
        if (signal.stagnation) return "OPTIMIZE_STRUCTURE";
        if (signal.chaos) return "STABILIZE";
        if (signal.imbalance) return "REBALANCE";
        if (signal.overload) return "REDUCE_COMPLEXITY";
        return "NO_ACTION";
    }
}

module.exports = MetaWill;
