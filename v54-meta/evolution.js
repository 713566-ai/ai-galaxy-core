const SwarmManager = require('../v53-swarm/swarm');
const MetaController = require('./meta-controller');

class MetaEvolutionEngine {
    constructor() {
        this.swarm = new SwarmManager(8);
        this.meta = new MetaController();
        this.history = [];
        this.generation = 0;
    }

    async step() {
        console.log('\n🧬 META EVOLUTION CYCLE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        this.generation++;
        
        // Получаем текущего лучшего мета-агента
        const bestMeta = this.meta.getBestMeta();
        const activeRules = bestMeta.genome.rules;
        
        console.log('🧠 Активные правила эволюции:');
        console.log(`   📊 Mutation Rate: ${activeRules.mutationRate.toFixed(3)}`);
        console.log(`   ⚖️ Selection Pressure: ${activeRules.selectionPressure.toFixed(3)}`);
        console.log(`   🔍 Exploration Bias: ${activeRules.explorationBias.toFixed(3)}`);
        console.log(`   🎯 Reward Sensitivity: ${activeRules.rewardSensitivity.toFixed(3)}`);
        console.log(`   📏 Population Size: ${activeRules.populationSize}`);
        
        // 1. Применяем правила к рою
        this.meta.applyRules(this.swarm, bestMeta);
        
        // 2. Эволюция нижнего уровня
        const swarmResult = await this.swarm.evolve();
        
        // 3. Оценка всех мета-агентов
        this.meta.metaAgents.forEach(metaAgent => {
            this.meta.evaluate(metaAgent, swarmResult, metaAgent.genome.rules);
        });
        
        // 4. Эволюция мета-уровня (эволюция правил эволюции!)
        const metaResult = this.meta.evolve();
        
        const cycleResult = {
            generation: this.generation,
            swarm: {
                generation: swarmResult.generation,
                bestScore: swarmResult.bestScore,
                avgScore: swarmResult.avgScore,
                agentsCount: swarmResult.agentsCount
            },
            meta: metaResult,
            activeRules: activeRules
        };
        
        this.history.push(cycleResult);
        
        console.log(`\n🏆 РЕЗУЛЬТАТ ЦИКЛА ${this.generation}:`);
        console.log(`   🐝 Swarm: поколение ${swarmResult.generation}, лучший счёт ${swarmResult.bestScore}`);
        console.log(`   🧠 Meta: поколение ${metaResult.generation}, лучший счёт ${metaResult.bestScore?.toFixed(2)}`);
        
        return cycleResult;
    }

    getStats() {
        return {
            generation: this.generation,
            historyLength: this.history.length,
            currentSwarm: {
                generation: this.swarm.generation,
                agentsCount: this.swarm.agents.length,
                bestScore: this.swarm.bestScore
            },
            currentMeta: this.meta.getStats(),
            history: this.history.slice(-5)
        };
    }
}

module.exports = MetaEvolutionEngine;
