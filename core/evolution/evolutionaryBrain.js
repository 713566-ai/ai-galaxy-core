const EvolutionV75 = require("../v75/evolution");
const SpeciesSystem = require("../v75/species");

class EvolutionaryBrain {
    constructor(memory) {
        this.memory = memory;
        this.speciesSystem = new SpeciesSystem();
        this.evolution = new EvolutionV75(memory, this.speciesSystem);
        this.agents = [];
        this.generation = 0;
        this.leader = null;
    }

    addAgent(agent) {
        this.agents.push({
            name: agent.name,
            weight: agent.weight || 0.3,
            strategy: agent.strategy || 'balance',
            mutationRate: agent.mutationRate || 0.2,
            fitness: 0,
            rewards: [],
            stability: 0,
            wins: 0
        });
    }

    variance(arr) {
        if (arr.length === 0) return 0;
        const m = arr.reduce((a, b) => a + b, 0) / arr.length;
        return arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
    }

    evaluateAgent(agent, reward) {
        if (!agent.rewards) agent.rewards = [];
        agent.rewards.push(reward);
        if (agent.rewards.length > 30) agent.rewards.shift();
        
        const avg = agent.rewards.reduce((a, b) => a + b, 0) / agent.rewards.length;
        const variance = this.variance(agent.rewards);
        const stability = Math.max(0, 1 - variance);
        
        agent.fitness = avg * 0.6 + stability * 0.4;
        agent.stability = stability;
        return agent.fitness;
    }

    selectLeader() {
        const leaderSpecies = this.speciesSystem.getLeader();
        if (leaderSpecies && leaderSpecies.members.length > 0) {
            this.leader = leaderSpecies.members[0];
        } else {
            this.leader = this.agents.reduce((best, a) => 
                (!best || a.fitness > best.fitness) ? a : best, null);
        }
        return this.leader;
    }

    step(worldState, rewards) {
        if (!this.agents.length) return { leader: null, generation: 0, population: 0, bestFitness: 0 };
        
        for (const agent of this.agents) {
            const reward = rewards[agent.name] || 0;
            this.evaluateAgent(agent, reward);
        }
        
        const leader = this.selectLeader();
        if (leader) leader.wins = (leader.wins || 0) + 1;
        
        if (worldState.tick % 10 === 0 && worldState.tick > 0 && this.agents.length > 0) {
            this.agents = this.evolution.evolve(this.agents);
            for (const agent of this.agents) {
                if (!agent.rewards) agent.rewards = [];
            }
        }
        
        this.generation = this.evolution.generation;
        const bestFitness = this.agents[0]?.fitness || 0;
        if (this.memory.state.evolution) {
            this.memory.state.evolution.bestFitness = bestFitness;
        }
        
        return {
            leader,
            generation: this.generation,
            population: this.agents.length,
            bestFitness,
            speciesCount: this.speciesSystem.species.length,
            dominantSpecies: this.speciesSystem.getLeader()?.id
        };
    }

    getState() {
        return {
            generation: this.generation,
            population: this.agents.length,
            leader: this.leader?.name,
            leaderFitness: this.leader?.fitness || 0,
            species: this.speciesSystem.getStats(),
            agents: this.agents.map(a => ({
                name: a.name,
                fitness: a.fitness.toFixed(3),
                stability: a.stability.toFixed(3),
                wins: a.wins || 0,
                mutationRate: a.mutationRate
            }))
        };
    }
}

module.exports = EvolutionaryBrain;
