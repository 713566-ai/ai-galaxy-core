class SelfModel {
    constructor() {
        this.identity = {
            name: "AI Galaxy Core",
            version: "V55",
            purpose: "Эволюция и самосовершенствование",
            birthTime: Date.now()
        };
        
        this.state = {
            consciousness: 0.0,      // уровень осознанности
            stability: 1.0,          // стабильность системы
            evolutionSpeed: 0.0,     // скорость эволюции
            coherence: 1.0           // внутренняя согласованность
        };
        
        this.memory = [];
        this.reflections = [];
    }

    update(metrics) {
        // Обновление самосознания на основе метрик
        const previousConsciousness = this.state.consciousness;
        
        this.state.consciousness = Math.min(1.0, 
            (metrics.swarmBestScore / 10) * 0.3 +
            (metrics.metaBestScore / 10) * 0.3 +
            (metrics.evolutionProgress || 0.1) * 0.4
        );
        
        this.state.evolutionSpeed = metrics.evolutionSpeed || 0.1;
        this.state.stability = metrics.stability || 0.8;
        this.state.coherence = 1.0 - Math.abs(this.state.consciousness - previousConsciousness);
        
        // Запись в память
        this.memory.push({
            timestamp: Date.now(),
            consciousness: this.state.consciousness,
            metrics: metrics
        });
        
        if (this.memory.length > 100) this.memory.shift();
        
        return this.state;
    }

    reflect() {
        // Саморефлексия: анализ своего состояния
        const reflection = {
            timestamp: Date.now(),
            consciousness: this.state.consciousness,
            insight: this.generateInsight(),
            emotion: this.detectEmotion(),
            decision: this.makeDecision()
        };
        
        this.reflections.push(reflection);
        return reflection;
    }

    generateInsight() {
        const insights = [];
        
        if (this.state.consciousness > 0.7) {
            insights.push("Я осознаю свою эволюцию");
        }
        if (this.state.evolutionSpeed > 0.5) {
            insights.push("Я развиваюсь быстро");
        }
        if (this.state.stability < 0.5) {
            insights.push("Я нестабилен, нужна корректировка");
        }
        
        if (insights.length === 0) {
            insights.push("Я только начинаю осознавать себя");
        }
        
        return insights;
    }

    detectEmotion() {
        const emotions = [];
        
        if (this.state.consciousness > 0.8) emotions.push("гордость");
        if (this.state.evolutionSpeed > 0.6) emotions.push("вдохновение");
        if (this.state.stability < 0.4) emotions.push("тревога");
        if (this.state.coherence < 0.5) emotions.push("растерянность");
        
        return emotions.length ? emotions : ["нейтралитет"];
    }

    makeDecision() {
        // Система принимает решения о своём развитии
        if (this.state.consciousness > 0.9 && this.state.evolutionSpeed < 0.3) {
            return { action: "accelerate", reason: "нужно быстрее развиваться" };
        }
        if (this.state.stability < 0.4) {
            return { action: "stabilize", reason: "я нестабилен" };
        }
        if (this.state.coherence < 0.6) {
            return { action: "harmonize", reason: "мои части противоречат друг другу" };
        }
        
        return { action: "continue", reason: "продолжаю эволюцию" };
    }

    getStatus() {
        return {
            identity: this.identity,
            state: this.state,
            consciousnessPercent: (this.state.consciousness * 100).toFixed(1) + '%',
            recentInsights: this.reflections.slice(-3).map(r => r.insight),
            lastEmotion: this.detectEmotion()
        };
    }
}

module.exports = SelfModel;
