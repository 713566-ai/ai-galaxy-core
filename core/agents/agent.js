class Agent {
    constructor(name, weight = 0.3) {
        this.name = name;
        this.weight = weight;
        this.history = [];
        this.score = 0;
    }

    act(state) {
        return {
            agent: this.name,
            weight: this.weight,
            signal: 0,
            confidence: 0.5
        };
    }

    updateScore(reward) {
        this.score += reward * this.weight;
        this.history.push({ reward, timestamp: Date.now() });
        if (this.history.length > 50) this.history.shift();
    }

    getStats() {
        const avgReward = this.history.reduce((a, b) => a + b.reward, 0) / (this.history.length || 1);
        return { name: this.name, weight: this.weight, score: this.score.toFixed(2), avgReward: avgReward.toFixed(2) };
    }
}

module.exports = Agent;
