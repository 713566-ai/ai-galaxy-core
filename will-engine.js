class WillEngine {
    constructor() {
        this.bias = {
            growth: Math.random(),
            stability: Math.random(),
            efficiency: Math.random()
        };
    }

    choose(goals, conflicts) {
        if (!goals.length) return null;

        return goals.reduce((best, goal) => {
            let score = goal.priority;

            if (goal.type === 'expand_system') score *= this.bias.growth;
            if (goal.type === 'increase_stability') score *= this.bias.stability;
            if (goal.type === 'improve_performance') score *= this.bias.efficiency;

            return score > (best?.score || 0)
                ? { ...goal, score }
                : best;
        }, null);
    }
}

module.exports = WillEngine;
