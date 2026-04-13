const MetaGenome = require('./meta-genome');

class MetaController {
    constructor() {
        this.metaAgents = [];
        this.generation = 0;
        this.history = [];

        // Создаём популяцию мета-агентов (каждый со своей стратегией эволюции)
        for (let i = 0; i < 5; i++) {
            this.metaAgents.push({
                id: i,
                genome: new MetaGenome(),
                score: 0,
                history: []
            });
        }
    }

    applyRules(swarm, metaAgent) {
        // Применяем правила конкретного мета-агента к рою
        const rules = metaAgent.genome.rules;
        
        // Регулируем размер популяции
        if (swarm.agents.length !== rules.populationSize) {
            console.log(`📏 Регулировка популяции: ${swarm.agents.length} → ${rules.populationSize}`);
        }
        
        // Регулируем скорость мутации агентов
        swarm.agents.forEach(agent => {
            agent.genome.mutationRate = rules.mutationRate;
        });
        
        return rules;
    }

    evaluate(metaAgent, swarmStats, rules) {
        let score = 0;
        
        // 1. Качество эволюции (улучшение лучшего агента)
        if (swarmStats.bestScore) score += swarmStats.bestScore * 2;
        
        // 2. Разнообразие популяции (штраф за одинаковых агентов)
        const uniqueTraits = new Set(swarmStats.agents?.map(a => JSON.stringify(a.traits))).size;
        score += uniqueTraits / swarmStats.agentsCount * 0.5;
        
        // 3. Эффективность (средний счёт)
        if (swarmStats.avgScore) score += swarmStats.avgScore * 0.5;
        
        // 4. Штраф за слишком агрессивные правила
        if (rules.mutationRate > 0.3) score -= 0.2;
        if (rules.selectionPressure > 0.9) score -= 0.2;
        
        // 5. Бонус за стабильность
        const recentScores = metaAgent.history.slice(-3).map(h => h.score);
        if (recentScores.length === 3 && recentScores[2] > recentScores[0]) {
            score += 0.3; // Прогресс
        }
        
        metaAgent.score = score;
        metaAgent.history.push({
            timestamp: Date.now(),
            score,
            rules: rules
        });
        
        if (metaAgent.history.length > 20) metaAgent.history.shift();
        
        return score;
    }

    evolve() {
        // Сортировка по успеху
        this.metaAgents.sort((a, b) => b.score - a.score);
        
        // Выживают лучшие 40%
        const keepCount = Math.max(2, Math.floor(this.metaAgents.length * 0.4));
        const survivors = this.metaAgents.slice(0, keepCount);
        
        // Размножение
        const children = [];
        const targetSize = 5;
        
        while (children.length < targetSize - survivors.length) {
            const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
            const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
            
            const childGenome = parent1.genome.crossover(parent2.genome);
            childGenome.mutate();
            
            children.push({
                id: Date.now() + children.length,
                genome: childGenome,
                score: 0,
                history: []
            });
        }
        
        this.metaAgents = [...survivors, ...children];
        this.generation++;
        
        return {
            generation: this.generation,
            agentsCount: this.metaAgents.length,
            bestScore: this.metaAgents[0]?.score,
            bestRules: this.metaAgents[0]?.genome.getSummary()
        };
    }

    getBestMeta() {
        return this.metaAgents.sort((a, b) => b.score - a.score)[0];
    }

    getStats() {
        return {
            metaGeneration: this.generation,
            metaAgentsCount: this.metaAgents.length,
            bestMetaAgent: this.getBestMeta()?.genome.getSummary(),
            allMetaAgents: this.metaAgents.map(m => ({
                id: m.id,
                score: m.score.toFixed(2),
                rules: m.genome.getSummary()
            }))
        };
    }
}

module.exports = MetaController;
