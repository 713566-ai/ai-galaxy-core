const AgentGenome = require('./genome');
const SwarmAgent = require('./agent');
const axios = require('axios');

class SwarmManager {
    constructor(size = 8) {
        this.agents = [];
        this.generation = 0;
        this.bestScore = -Infinity;
        
        this.environmentMemory = {
            lastState: null,
            history: []
        };
        
        for (let i = 0; i < size; i++) {
            this.agents.push(new SwarmAgent(new AgentGenome(), i));
        }
    }

    async getUniverseState() {
        try {
            const response = await axios.get('http://localhost:5400/status', { timeout: 2000 });
            return response.data;
        } catch(e) {
            return { entropy: 0.5, entities: 500, wars: 5, alliances: 3 };
        }
    }

    calculateEnvironmentChanges(current, previous) {
        if (!previous) return { entropyChange: 0, entitiesGrowth: 0, stable: true };
        const entropyChange = current.entropy - previous.entropy;
        const entitiesGrowth = (current.entities - previous.entities) / previous.entities;
        const stable = Math.abs(entropyChange) < 0.05;
        return { entropyChange, entitiesGrowth, stable };
    }

    async evaluate() {
        console.log('📊 Оценка агентов...');
        const currentState = await this.getUniverseState();
        const changes = this.calculateEnvironmentChanges(currentState, this.environmentMemory.lastState);
        
        this.environmentMemory.lastState = currentState;
        this.environmentMemory.history.push({ timestamp: Date.now(), state: currentState, changes });
        if (this.environmentMemory.history.length > 50) this.environmentMemory.history.shift();
        
        for (const agent of this.agents) {
            const decision = await agent.act(currentState);
            let success = false;
            let result = { success: false, action: decision.action, errors: 0 };
            
            if (decision.action !== 'wait') {
                try {
                    const response = await axios.post(`http://localhost:5400/action/${decision.action}`);
                    success = response.data?.success || false;
                    result.success = success;
                    result.action = decision.action;
                    result.entropyChange = changes.entropyChange;
                    result.entitiesGrowth = changes.entitiesGrowth;
                    result.stable = changes.stable;
                    result.errors = 0;
                    const lastActions = agent.history.slice(-3).map(h => h.details?.action);
                    result.innovation = !lastActions.includes(decision.action);
                } catch(e) {
                    result.errors = 1;
                }
            } else {
                result = { success: true, action: 'wait', errors: 0 };
            }
            
            agent.updateScore(result);
            agent.addPendingReward(decision.action, Date.now());
        }
        
        for (const agent of this.agents) {
            agent.resolvePendingRewards({ success: true }, 5000);
        }
        
        this.agents.sort((a, b) => b.score - a.score);
        this.bestScore = this.agents[0]?.score || 0;
        const avgScore = this.agents.reduce((a, b) => a + b.score, 0) / this.agents.length;
        console.log(`🏆 Лучший агент: ${this.agents[0]?.getStats().recentSuccess}`);
        console.log(`📊 Средний счёт: ${avgScore.toFixed(2)}`);
    }

    select() {
        const keepCount = Math.max(3, Math.floor(this.agents.length * 0.6));
        this.agents = this.agents.slice(0, keepCount);
        console.log(`✅ Отобрано ${this.agents.length} агентов`);
    }

    reproduce() {
        const newAgents = [];
        const targetSize = 10;
        
        while (newAgents.length < targetSize - this.agents.length) {
            const parent1 = this.agents[Math.floor(Math.random() * this.agents.length)];
            const parent2 = this.agents[Math.floor(Math.random() * this.agents.length)];
            const childGenome = parent1.genome.crossover(parent2.genome);
            childGenome.mutate();
            const newId = Date.now() + newAgents.length;
            newAgents.push(new SwarmAgent(childGenome, newId));
        }
        
        this.agents.push(...newAgents);
        console.log(`🧬 Создано ${newAgents.length} новых агентов`);
    }

    async evolve() {
        console.log(`\n🧬 ПОКОЛЕНИЕ ${this.generation}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        await this.evaluate();
        this.select();
        this.reproduce();
        this.generation++;
        return {
            generation: this.generation,
            agentsCount: this.agents.length,
            bestScore: this.bestScore,
            avgScore: this.agents.reduce((a, b) => a + b.score, 0) / this.agents.length,
            topAgent: this.agents[0]?.getStats()
        };
    }

    getStats() {
        return {
            generation: this.generation,
            agentsCount: this.agents.length,
            bestScore: this.bestScore,
            environmentMemory: {
                lastState: this.environmentMemory.lastState,
                historyLength: this.environmentMemory.history.length
            },
            agents: this.agents.slice(0, 3).map(a => a.getStats())
        };
    }

    updateRules(rules) {
        if (rules.mutationRate) {
            this.agents.forEach(agent => {
                agent.genome.mutationRate = rules.mutationRate;
            });
            console.log(`🧬 Swarm: mutationRate обновлён на ${rules.mutationRate}`);
        }
        if (rules.selectionPressure) {
            console.log(`⚖️ Swarm: selectionPressure обновлён на ${rules.selectionPressure}`);
        }
        return this;
    }
}

module.exports = SwarmManager;
