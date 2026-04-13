class SpeciesSystem {
    constructor() {
        this.species = [];
        this.nextId = 1;
    }

    classify(agent) {
        // Кластеризация по стратегии и mutationRate
        const found = this.species.find(s =>
            Math.abs(s.signature.mutationRate - (agent.mutationRate || 0.2)) < 0.05 &&
            s.signature.strategy === (agent.strategy || 'balance')
        );

        if (found) {
            found.members.push(agent);
            return found.id;
        }

        const newSpecies = {
            id: this.nextId++,
            signature: {
                mutationRate: agent.mutationRate || 0.2,
                strategy: agent.strategy || 'balance',
                weight: agent.weight || 0.3
            },
            fitness: 0,
            members: [agent],
            generations: 0,
            wins: 0
        };

        this.species.push(newSpecies);
        return newSpecies.id;
    }

    evaluate() {
        for (const s of this.species) {
            const avgFitness = s.members.reduce((a, b) => a + (b.fitness || 0), 0) / (s.members.length || 1);
            const avgStability = s.members.reduce((a, b) => a + (b.stability || 0), 0) / (s.members.length || 1);
            s.fitness = avgFitness * 0.7 + avgStability * 0.3;
        }
        this.species.sort((a, b) => b.fitness - a.fitness);
    }

    getLeader() {
        return this.species[0] || null;
    }

    evolveSpecies() {
        for (const s of this.species) {
            if (s.fitness < -0.3) {
                s.signature.mutationRate = Math.min(0.35, s.signature.mutationRate * 1.1);
                console.log(`🧬 Species ${s.id} (fitness=${s.fitness.toFixed(2)}) → increased mutation`);
            } else if (s.fitness > 0.5) {
                s.signature.mutationRate = Math.max(0.12, s.signature.mutationRate * 0.96);
                console.log(`🧬 Species ${s.id} (fitness=${s.fitness.toFixed(2)}) → stabilized`);
            }
            s.generations++;
        }
    }

    cleanup() {
        // Удаляем виды без членов
        this.species = this.species.filter(s => s.members.length > 0);
    }

    getStats() {
        return {
            speciesCount: this.species.length,
            dominantSpecies: this.getLeader(),
            species: this.species.map(s => ({
                id: s.id,
                fitness: s.fitness.toFixed(3),
                members: s.members.length,
                signature: s.signature,
                generations: s.generations
            }))
        };
    }
}

module.exports = SpeciesSystem;
