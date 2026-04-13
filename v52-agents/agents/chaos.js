class ChaosAgent {
    constructor() {
        this.name = 'Chaos';
        this.attacks = [];
    }

    async stressTest(system) {
        const tests = [];
        
        // Тест 1: Высокая нагрузка
        tests.push({ type: 'LOAD', intensity: 100 });
        
        // Тест 2: Параллельные запросы
        tests.push({ type: 'CONCURRENT', threads: 50 });
        
        // Тест 3: Некорректные данные
        tests.push({ type: 'INVALID_DATA', payload: { invalid: true } });
        
        const results = [];
        for (const test of tests) {
            const start = Date.now();
            // Симуляция теста
            const passed = Math.random() > 0.2;
            results.push({
                ...test,
                passed,
                duration: Date.now() - start
            });
        }
        
        const attack = {
            timestamp: Date.now(),
            results,
            passed: results.every(r => r.passed)
        };
        
        this.attacks.push(attack);
        return attack;
    }

    getStats() {
        return {
            name: this.name,
            attacksCount: this.attacks.length,
            lastAttack: this.attacks[this.attacks.length - 1]
        };
    }
}

module.exports = ChaosAgent;
