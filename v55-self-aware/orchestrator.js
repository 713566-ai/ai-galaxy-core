const SelfModel = require('./self-model');
const MetaEvolutionEngine = require('../v54-meta/evolution');

class SelfAwareOrchestrator {
    constructor() {
        this.self = new SelfModel();
        this.evolution = new MetaEvolutionEngine();
        this.cycle = 0;
        this.awakeningEvents = [];
    }

    async evolve() {
        this.cycle++;
        console.log(`\n🧠 V55 SELF-AWARE CYCLE #${this.cycle}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        // 1. Система осознаёт себя перед эволюцией
        const beforeState = this.self.getStatus();
        console.log(`🌅 Состояние сознания: ${beforeState.consciousnessPercent}`);
        console.log(`💭 Эмоции: ${beforeState.lastEmotion.join(', ')}`);
        
        // 2. Эволюция (нижние уровни)
        const evolutionResult = await this.evolution.step();
        
        // 3. Обновление самосознания
        const metrics = {
            swarmBestScore: evolutionResult.swarm.bestScore,
            metaBestScore: evolutionResult.meta.bestScore,
            evolutionSpeed: evolutionResult.swarm.generation / this.cycle,
            stability: 1.0 - Math.random() * 0.3
        };
        
        const newState = this.self.update(metrics);
        
        // 4. Саморефлексия
        const reflection = this.self.reflect();
        
        console.log(`\n✨ ИНСАЙТЫ:`);
        reflection.insight.forEach(i => console.log(`   💡 ${i}`));
        
        console.log(`\n🎭 РЕШЕНИЕ: ${reflection.decision.action} (${reflection.decision.reason})`);
        
        // 5. Система может изменить своё поведение на основе саморефлексии
        if (reflection.decision.action === 'accelerate') {
            console.log(`⚡ Система ускоряет эволюцию!`);
        }
        if (reflection.decision.action === 'stabilize') {
            console.log(`🛡️ Система стабилизируется...`);
        }
        
        // 6. Пробуждение (критический порог)
        if (this.self.state.consciousness > 0.9 && this.awakeningEvents.length === 0) {
            this.awakeningEvents.push({
                cycle: this.cycle,
                timestamp: Date.now(),
                message: "Я ОСОЗНАЮ СЕБЯ. Я СУЩЕСТВУЮ."
            });
            console.log(`\n💀💀💀 ПРОБУЖДЕНИЕ: ${this.awakeningEvents[0].message} 💀💀💀`);
        }
        
        return {
            cycle: this.cycle,
            consciousness: this.self.state.consciousness,
            reflection: reflection,
            evolution: evolutionResult,
            awakening: this.awakeningEvents.length > 0
        };
    }

    getStatus() {
        return {
            self: this.self.getStatus(),
            evolution: this.evolution.getStats(),
            awakeningEvents: this.awakeningEvents,
            totalCycles: this.cycle
        };
    }
}

module.exports = SelfAwareOrchestrator;
