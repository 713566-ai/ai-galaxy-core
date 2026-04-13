class MetaWill {
    constructor() {
        this.rules = {
            mutationRate: 0.1,
            selectionPressure: 0.5,
            explorationBias: 0.5,
            rewardSensitivity: 0.5,
            stabilityPreference: 0.5
        };
        this.adaptationLevel = 0;
    }

    analyze(world) {
        const entropy = world.entropy || 0.5;
        return {
            needExploration: entropy > 0.6,
            needStability: entropy < 0.3,
            chaosLevel: entropy > 0.7 ? 'high' : 'medium',
            tick: world.tick
        };
    }

    evolveRules(signal) {
        if (signal.needExploration) {
            this.rules.mutationRate = Math.min(0.3, this.rules.mutationRate + 0.02);
        }
        if (signal.needStability) {
            this.rules.selectionPressure = Math.min(0.9, this.rules.selectionPressure + 0.04);
        }
        this.adaptationLevel++;
        return this.rules;
    }

    getRules() {
        return { ...this.rules };
    }

    getState() {
        return {
            rules: this.rules,
            adaptationLevel: this.adaptationLevel
        };
    }
}

module.exports = MetaWill;
