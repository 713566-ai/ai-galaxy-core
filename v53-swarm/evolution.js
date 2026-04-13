const SwarmManager = require('./swarm');

class EvolutionEngine {
    constructor() {
        this.swarm = new SwarmManager(8);
        this.history = [];
    }

    async step() {
        const result = await this.swarm.evolve();
        this.history.push(result);
        
        return result;
    }

    getStats() {
        return {
            swarm: this.swarm.getStats(),
            history: this.history.slice(-10)
        };
    }
}

module.exports = EvolutionEngine;
