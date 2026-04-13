const GoalSystem = require('./goals');
const ConflictDetector = require('./conflict-detector');
const WillEngine = require('./will-engine');

class GoalController {
    constructor(swarm, metaEngine) {
        this.goalSystem = new GoalSystem();
        this.conflictDetector = new ConflictDetector();
        this.will = new WillEngine();
        this.swarm = swarm;
        this.metaEngine = metaEngine;
        this.currentGoal = null;
        this.history = [];
    }
    
    async step(state) {
        console.log('\n🎯 ЦЕЛЕПОЛАГАНИЕ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 1. Генерация целей на основе состояния
        const goals = this.goalSystem.generate(state);
        console.log(`📋 Сгенерировано целей: ${goals.length}`);
        goals.forEach(g => console.log(`   - ${g.description} (приоритет: ${g.priority})`));
        
        // 2. Поиск конфликтов
        const conflicts = this.conflictDetector.detect(goals);
        if (conflicts.length > 0) {
            console.log(`\n⚔️ КОНФЛИКТЫ:`);
            conflicts.forEach(c => console.log(`   - ${c.reason}: ${c.goalA} vs ${c.goalB}`));
        }
        
        // 3. ВЫБОР (воля)
        const chosen = this.will.choose(goals, conflicts);
        this.currentGoal = chosen;
        
        // 4. Выполнение действий цели
        if (chosen && chosen.actions) {
            for (const action of chosen.actions) {
                await this.executeAction(action);
            }
        }
        
        // 5. Оценка результата и обновление приоритетов
        const reward = this.evaluateReward(state);
        this.will.updateBias(reward);
        
        const result = {
            goals: goals.length,
            conflicts: conflicts.length,
            chosen: chosen?.description || 'none',
            actions: chosen?.actions || [],
            reward,
            willState: this.will.internalBias
        };
        
        this.history.push(result);
        return result;
    }
    
    async executeAction(action) {
        console.log(`⚙️ Выполнение действия: ${action}`);
        
        switch(action) {
            case 'spawn_agents':
                // Создание новых агентов
                const newAgents = [];
                for (let i = 0; i < 2; i++) {
                    // newAgents.push(new SwarmAgent(new AgentGenome(), Date.now() + i));
                }
                // this.swarm.agents.push(...newAgents);
                break;
                
            case 'increase_mutation':
                if (this.metaEngine?.meta?.metaAgents) {
                    this.metaEngine.meta.metaAgents.forEach(m => {
                        m.genome.rules.mutationRate = Math.min(0.3, m.genome.rules.mutationRate * 1.05);
                    });
                }
                break;
                
            case 'reduce_mutation':
                if (this.metaEngine?.meta?.metaAgents) {
                    this.metaEngine.meta.metaAgents.forEach(m => {
                        m.genome.rules.mutationRate = Math.max(0.05, m.genome.rules.mutationRate * 0.95);
                    });
                }
                break;
        }
    }
    
    evaluateReward(state) {
        // Простая метрика награды
        let reward = 0;
        if (state.bestScore > 0) reward += state.bestScore * 0.1;
        if (state.stability > 0.5) reward += 0.2;
        if (state.agentsCount > 10) reward += 0.1;
        return Math.min(1.0, reward);
    }
    
    getStats() {
        return {
            currentGoal: this.currentGoal?.description || 'none',
            willState: this.will.getStats(),
            history: this.history.slice(-5)
        };
    }
}

module.exports = GoalController;
