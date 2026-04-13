class WillEngine {
    constructor() {
        this.internalBias = { growth: 0.4, stability: 0.3, efficiency: 0.3 };
        this.decisions = [];
    }
    
    choose(goals, conflicts) {
        if (!goals.length) return null;
        if (conflicts.length > 0) console.log(`⚔️ Конфликт: ${conflicts[0].reason}`);
        
        const scored = goals.map(goal => {
            let score = goal.priority;
            if (goal.type === 'expand_system') score *= this.internalBias.growth;
            if (goal.type === 'increase_stability') score *= this.internalBias.stability;
            if (goal.type === 'improve_performance') score *= this.internalBias.efficiency;
            return { ...goal, finalScore: score };
        });
        
        scored.sort((a, b) => b.finalScore - a.finalScore);
        this.decisions.push({ timestamp: Date.now(), chosen: scored[0]?.description });
        return scored[0];
    }
    
    updateBias(reward) {
        Object.keys(this.internalBias).forEach(k => {
            this.internalBias[k] *= reward > 0 ? 1.05 : 0.95;
        });
        const sum = Object.values(this.internalBias).reduce((a, b) => a + b, 0);
        Object.keys(this.internalBias).forEach(k => this.internalBias[k] /= sum);
    }
    
    getStats() { return { internalBias: this.internalBias, decisionsCount: this.decisions.length }; }
}

module.exports = WillEngine;
