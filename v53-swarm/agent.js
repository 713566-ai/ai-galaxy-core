const axios = require('axios');

class SwarmAgent {
    constructor(genome, id) {
        this.id = id;
        this.genome = genome;
        this.score = 0;
        this.history = [];
        this.experience = 0;
        this.pendingRewards = [];
        this.actionCount = {};
    }

    calculateFitness(result) {
        let score = 0;
        
        // 1. Успех действия
        if (result.success) score += 1.0;
        
        // 2. Влияние на энтропию (снижение = хорошо)
        if (result.entropyChange !== undefined) {
            if (result.entropyChange < 0) score += 0.5;
            if (result.entropyChange > 0.1) score -= 0.3;
        }
        
        // 3. Рост существ
        if (result.entitiesGrowth !== undefined) {
            if (result.entitiesGrowth > 0) score += 0.5;
            if (result.entitiesGrowth < -0.1) score -= 0.5;
        }
        
        // 4. Стабильность системы
        if (result.stable === true) score += 0.7;
        
        // 5. Штраф за ошибки
        if (result.errors > 0) score -= result.errors * 0.3;
        
        // 6. Бонус за инновации
        if (result.innovation === true) score += 0.4;
        
        return Math.max(-2, Math.min(3, score));
    }

    penaltyForSpam() {
        const lastActions = this.history.slice(-5).map(h => h.details?.action);
        if (lastActions.length < 5) return 0;
        
        const uniqueActions = new Set(lastActions);
        if (uniqueActions.size === 1) {
            console.log(`⚠️ Агент ${this.id} заспамил действием ${lastActions[0]}`);
            return -1.0;
        }
        return 0;
    }

    updateScore(result) {
        // Основная награда
        let reward = this.calculateFitness(result);
        
        // Штраф за спам
        reward += this.penaltyForSpam();
        
        // Бонус за разнообразие
        const uniqueActions = new Set(this.history.slice(-20).map(h => h.details?.action));
        reward += uniqueActions.size * 0.05;
        
        this.score += reward;
        this.experience++;
        
        // Счётчик действий
        const action = result.action || 'unknown';
        this.actionCount[action] = (this.actionCount[action] || 0) + 1;
        
        this.history.push({
            timestamp: Date.now(),
            success: result.success,
            details: result,
            reward: reward.toFixed(2),
            score: this.score.toFixed(2)
        });
        
        if (this.history.length > 100) this.history.shift();
        
        return reward;
    }

    addPendingReward(action, timestamp) {
        this.pendingRewards.push({
            action,
            timestamp,
            pending: true
        });
    }

    resolvePendingRewards(result, delayMs) {
        let totalBonus = 0;
        const now = Date.now();
        
        this.pendingRewards = this.pendingRewards.filter(pr => {
            if (now - pr.timestamp >= delayMs) {
                // Отложенная награда
                const delayedReward = result.success ? 0.3 : -0.2;
                totalBonus += delayedReward;
                return false;
            }
            return true;
        });
        
        if (totalBonus !== 0) {
            this.score += totalBonus;
            console.log(`⏰ Отложенная награда для агента ${this.id}: ${totalBonus.toFixed(2)}`);
        }
        
        return totalBonus;
    }

    async act(context) {
        const { genome } = this;
        
        const decisions = [];
        
        // Анализ энтропии
        if (context.entropy > 0.7 && genome.traits.stability > 0.5) {
            decisions.push({ action: 'stabilize', priority: genome.traits.stability });
        }
        
        // Экспансия при хороших условиях
        if (context.entities < 800 && genome.traits.risk > 0.4) {
            decisions.push({ action: 'expand', priority: genome.traits.risk });
        }
        
        // Исследования
        if (genome.traits.creativity > 0.5) {
            decisions.push({ action: 'research', priority: genome.traits.creativity });
        }
        
        // Война (только при высоком риске)
        if (context.wars < 10 && genome.traits.risk > 0.7 && genome.traits.stability < 0.4) {
            decisions.push({ action: 'war', priority: genome.traits.risk * 0.8 });
        }
        
        // Альянс
        if (context.wars > 5 && genome.traits.stability > 0.6) {
            decisions.push({ action: 'alliance', priority: genome.traits.stability });
        }
        
        const best = decisions.sort((a, b) => b.priority - a.priority)[0];
        
        return {
            action: best?.action || 'wait',
            confidence: best?.priority || 0.2,
            agentId: this.id,
            traits: genome.traits
        };
    }

    getStats() {
        const recentSuccess = this.history.slice(-10).filter(h => h.success).length / 10;
        const totalActions = Object.values(this.actionCount).reduce((a, b) => a + b, 0);
        
        return {
            id: this.id,
            score: this.score.toFixed(2),
            experience: this.experience,
            recentSuccess: (recentSuccess * 100).toFixed(0) + '%',
            actionDistribution: this.actionCount,
            totalActions,
            traits: this.genome.traits
        };
    }
}

module.exports = SwarmAgent;
