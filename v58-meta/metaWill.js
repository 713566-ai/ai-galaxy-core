class MetaWill {
    constructor() {
        this.rules = {
            mutationRate: 0.1,
            selectionPressure: 0.5,
            explorationBias: 0.5,
            rewardSensitivity: 0.5,
            stabilityPreference: 0.5
        };

        this.metaMemory = [];
        this.adaptationLevel = 0;
        this.history = [];
    }

    analyze(world) {
        const entropy = world.entropy || 0.5;
        const wars = world.wars || 0;
        const entities = world.entities || 500;
        const alliances = world.alliances || 0;
        
        return {
            needExploration: entropy > 0.6,
            needStability: entropy < 0.3,
            needAggression: wars > 5,
            needDiplomacy: alliances < 2 && wars > 3,
            chaosLevel: entropy > 0.7 ? 'high' : entropy > 0.4 ? 'medium' : 'low',
            growthRate: entities > 1000 ? 'fast' : 'slow'
        };
    }

    evolveRules(signal) {
        const previousRules = { ...this.rules };
        
        if (signal.needExploration) {
            this.rules.mutationRate = Math.min(0.3, this.rules.mutationRate + 0.02);
            this.rules.explorationBias = Math.min(0.9, this.rules.explorationBias + 0.03);
        }
        
        if (signal.needStability) {
            this.rules.selectionPressure = Math.min(0.9, this.rules.selectionPressure + 0.04);
            this.rules.mutationRate = Math.max(0.05, this.rules.mutationRate - 0.02);
        }
        
        if (signal.needAggression) {
            this.rules.rewardSensitivity = Math.min(0.95, this.rules.rewardSensitivity + 0.05);
        }
        
        if (signal.needDiplomacy) {
            this.rules.stabilityPreference = Math.min(0.9, this.rules.stabilityPreference + 0.03);
        }
        
        if (signal.chaosLevel === 'low') {
            this.rules.mutationRate = Math.max(0.05, this.rules.mutationRate - 0.01);
        }
        
        Object.keys(this.rules).forEach(k => {
            this.rules[k] = Math.max(0.05, Math.min(0.95, this.rules[k]));
        });
        
        this.adaptationLevel++;
        this.metaMemory.push({ 
            timestamp: Date.now(),
            previous: previousRules,
            new: { ...this.rules },
            signal
        });
        
        if (this.metaMemory.length > 50) this.metaMemory.shift();
        
        return { changed: true, previous: previousRules, current: { ...this.rules } };
    }

    applyToSwarm(swarm) {
        return {
            ...swarm,
            mutationRate: this.rules.mutationRate,
            selectionPressure: this.rules.selectionPressure,
            explorationBias: this.rules.explorationBias,
            rewardSensitivity: this.rules.rewardSensitivity,
            stabilityPreference: this.rules.stabilityPreference
        };
    }
    
    getRules() {
        return { ...this.rules };
    }

    getState() {
        return {
            rules: this.rules,
            adaptationLevel: this.adaptationLevel,
            recentAdaptations: this.metaMemory.slice(-5),
            historyLength: this.history.length
        };
    }
}

module.exports = MetaWill;
