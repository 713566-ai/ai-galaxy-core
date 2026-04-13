class Evolution {
    constructor(memory) {
        this.memory = memory;
        this.population = [];
        this.generation = 0;
    }

    rank(pop) {
        return [...pop].sort((a, b) => b.fitness - a.fitness);
    }

    evolve(population) {
        const ranked = this.rank(population);
        const eliteCount = Math.max(1, Math.floor(ranked.length * 0.2));
        const mutateCount = Math.floor(ranked.length * 0.5);
        const elites = ranked.slice(0, eliteCount);
        
        // Сохраняем элиту в память
        if (!this.memory.state.evolution.eliteArchive) {
            this.memory.state.evolution.eliteArchive = [];
        }
        this.memory.state.evolution.eliteArchive.push(...elites);
        if (this.memory.state.evolution.eliteArchive.length > 100) {
            this.memory.state.evolution.eliteArchive.shift();
        }
        
        const newPop = [];
        
        // 1. Элиты выживают
        newPop.push(...elites.map(e => ({ ...e })));
        
        // 2. Мутированные потомки
        for (let i = 0; i < mutateCount; i++) {
            const base = elites[i % elites.length];
            newPop.push(this.mutate(base));
        }
        
        // 3. Случайные исследователи
        while (newPop.length < population.length) {
            newPop.push(this.randomAgent());
        }
        
        this.generation++;
        this.memory.state.evolution.generation = this.generation;
        
        console.log(`🧬 EVOLUTION: gen=${this.generation}, pop=${newPop.length}, bestFitness=${ranked[0]?.fitness?.toFixed(3) || 0}`);
        
        return newPop;
    }

    mutate(agent) {
        return {
            ...agent,
            fitness: 0,
            mutationRate: (agent.mutationRate || 0.2) * (0.85 + Math.random() * 0.3),
            mutated: true
        };
    }

    randomAgent() {
        return {
            name: "agent_" + Math.floor(Math.random() * 9999),
            fitness: 0,
            mutationRate: 0.15 + Math.random() * 0.2,
            random: true
        };
    }
}

module.exports = Evolution;
