class GatekeeperAgent {
    constructor() {
        this.name = 'Gatekeeper';
        this.decisions = [];
    }

    async validate(change) {
        const checks = [];
        
        // Проверка 1: Безопасность
        const dangerous = ['eval', 'child_process', 'require("fs")', 'process.exit'];
        for (const d of dangerous) {
            if (change.code?.includes(d)) {
                checks.push({ check: 'security', passed: false, reason: `Обнаружен опасный код: ${d}` });
                break;
            }
        }
        
        // Проверка 2: Размер изменения
        if (change.code && change.code.length > 10000) {
            checks.push({ check: 'size', passed: false, reason: 'Изменение слишком большое' });
        } else {
            checks.push({ check: 'size', passed: true });
        }
        
        // Проверка 3: Тесты пройдены
        if (change.testsPassed === false) {
            checks.push({ check: 'tests', passed: false, reason: 'Тесты не пройдены' });
        } else {
            checks.push({ check: 'tests', passed: true });
        }
        
        const decision = {
            approved: checks.every(c => c.passed),
            checks,
            timestamp: Date.now()
        };
        
        this.decisions.push(decision);
        return decision;
    }

    getStats() {
        return {
            name: this.name,
            decisionsCount: this.decisions.length,
            approvalRate: (this.decisions.filter(d => d.approved).length / this.decisions.length * 100).toFixed(1) + '%',
            lastDecision: this.decisions[this.decisions.length - 1]
        };
    }
}

module.exports = GatekeeperAgent;
