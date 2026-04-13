class MetaGenome {
    constructor() {
        this.rules = {
            mutationRate: Math.random() * 0.2 + 0.05,    // скорость мутации агентов
            selectionPressure: Math.random(),            // жёсткость отбора (0-1)
            explorationBias: Math.random(),              // склонность к новым стратегиям
            rewardSensitivity: Math.random(),            // чувствительность к награде
            crossoverRate: Math.random() * 0.3 + 0.5,    // частота скрещивания
            populationSize: Math.floor(Math.random() * 10 + 5)  // размер популяции
        };
    }

    mutate() {
        Object.keys(this.rules).forEach(key => {
            if (Math.random() < 0.25) {
                const change = (Math.random() - 0.5) * 0.15;
                if (key === 'populationSize') {
                    this.rules[key] = Math.max(3, Math.min(20, this.rules[key] + Math.floor(change * 5)));
                } else {
                    this.rules[key] = Math.max(0.01, Math.min(1, this.rules[key] + change));
                }
            }
        });
    }

    crossover(other) {
        const child = new MetaGenome();
        Object.keys(this.rules).forEach(key => {
            child.rules[key] = Math.random() > 0.5 ? this.rules[key] : other.rules[key];
        });
        return child;
    }

    getSummary() {
        return {
            mutationRate: this.rules.mutationRate.toFixed(3),
            selectionPressure: this.rules.selectionPressure.toFixed(3),
            explorationBias: this.rules.explorationBias.toFixed(3),
            rewardSensitivity: this.rules.rewardSensitivity.toFixed(3),
            populationSize: this.rules.populationSize
        };
    }
}

module.exports = MetaGenome;
