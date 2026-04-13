class ArchitectAgent {
    constructor() {
        this.name = 'Architect';
        this.decisions = [];
    }

    analyze(systemState) {
        const issues = [];
        
        // Анализ структуры
        if (systemState.files > 100) {
            issues.push('Слишком много файлов, нужна реорганизация');
        }
        if (systemState.avgFileSize > 500) {
            issues.push('Файлы слишком большие, нужно разбить');
        }
        if (systemState.duplicateCode > 0) {
            issues.push(`Найдено ${systemState.duplicateCode} дубликатов кода`);
        }
        
        const decision = {
            timestamp: Date.now(),
            issues,
            priority: issues.length,
            action: issues.length > 0 ? 'REFACTOR' : 'OPTIMIZE'
        };
        
        this.decisions.push(decision);
        return decision;
    }

    getStats() {
        return {
            name: this.name,
            decisionsCount: this.decisions.length,
            lastDecision: this.decisions[this.decisions.length - 1]
        };
    }
}

module.exports = ArchitectAgent;
