class EvolutionV75 {
    constructor(memory, speciesSystem) {
        this.memory = memory;
        this.species = speciesSystem;
        this.generation = 0;
        
        // Гарантируем наличие species в memory
        if (!this.memory.state.species) {
            this.memory.state.species = { list: [], dominantSpecies: null, history: [] };
        }
    }

    evolve(population) {
        for (const agent of population) {
            agent.speciesId = this.species.classify(agent);
        }

        this.species.evaluate();
        this.species.evolveSpecies();

        const leaderSpecies = this.species.getLeader();
        
        const newPop = [];

        for (const s of this.species.species) {
            const survivalRate = s.fitness > 0.3 ? 0.7 : 0.3;
            const keepCount = Math.max(1, Math.floor(s.members.length * survivalRate));
            const sorted = [...s.members].sort((a, b) => b.fitness - a.fitness);
            
            for (let i = 0; i < keepCount; i++) {
                newPop.push(sorted[i]);
            }
            
            for (let i = keepCount; i < s.members.length; i++) {
                newPop.push(this.mutate(sorted[i]));
            }
        }

        if (leaderSpecies && this.memory.state.species) {
            this.memory.state.species.dominantSpecies = leaderSpecies;
            this.memory.state.species.list = this.species.species.map(s => ({
                id: s.id,
                fitness: s.fitness,
                signature: s.signature,
                membersCount: s.members.length
            }));
        }
        
        this.generation++;
        if (this.memory.state.evolution) {
            this.memory.state.evolution.generation = this.generation;
        }
        
        console.log(`🧬 EVOLUTION V75: gen=${this.generation}, species=${this.species.species.length}, dominant=species_${leaderSpecies?.id || 'none'}`);
        
        return newPop;
    }

    mutate(agent) {
        return {
            ...agent,
            mutationRate: (agent.mutationRate || 0.2) * (0.85 + Math.random() * 0.3),
            fitness: 0,
            rewards: [],
            mutated: true
        };
    }
}

module.exports = EvolutionV75;
