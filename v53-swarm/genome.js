class AgentGenome {
    constructor() {
        this.traits = {
            // Влияние на принятие решений
            risk: Math.random(),           // склонность к риску
            creativity: Math.random(),     // креативность
            stability: Math.random(),      // стабильность
            speed: Math.random(),          // скорость реакции
            memory: Math.random()          // память
        };
        
        this.mutationRate = 0.15;
    }

    mutate() {
        Object.keys(this.traits).forEach(key => {
            if (Math.random() < this.mutationRate) {
                this.traits[key] += (Math.random() - 0.5) * 0.25;
                this.traits[key] = Math.max(0.1, Math.min(0.9, this.traits[key]));
            }
        });
        
        // Мутация скорости мутации
        if (Math.random() < 0.1) {
            this.mutationRate += (Math.random() - 0.5) * 0.05;
            this.mutationRate = Math.max(0.05, Math.min(0.3, this.mutationRate));
        }
    }

    crossover(other) {
        const child = new AgentGenome();
        Object.keys(this.traits).forEach(key => {
            child.traits[key] = Math.random() > 0.5 ? this.traits[key] : other.traits[key];
        });
        child.mutationRate = (this.mutationRate + other.mutationRate) / 2;
        return child;
    }
}

module.exports = AgentGenome;
