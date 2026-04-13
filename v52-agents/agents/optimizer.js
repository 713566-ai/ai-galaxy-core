class OptimizerAgent {
    constructor() {
        this.name = 'Optimizer';
        this.optimizations = [];
    }

    analyze(code) {
        const optimizations = [];
        const lines = code.split('\n');
        
        // Длинные функции
        const longFunctions = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[^}]{500,}/g);
        if (longFunctions) {
            optimizations.push({
                type: 'split_function',
                count: longFunctions.length,
                suggestion: 'Разбить длинные функции'
            });
        }
        
        // Повторяющийся код
        const linesCount = {};
        lines.forEach(line => {
            if (line.trim()) {
                linesCount[line.trim()] = (linesCount[line.trim()] || 0) + 1;
            }
        });
        
        const duplicates = Object.entries(linesCount).filter(([_, count]) => count > 3);
        if (duplicates.length) {
            optimizations.push({
                type: 'duplicate_code',
                count: duplicates.length,
                suggestion: 'Вынести повторяющийся код в функции'
            });
        }
        
        this.optimizations.push({ timestamp: Date.now(), optimizations });
        return optimizations;
    }

    getStats() {
        return {
            name: this.name,
            optimizationsCount: this.optimizations.length,
            lastOptimization: this.optimizations[this.optimizations.length - 1]
        };
    }
}

module.exports = OptimizerAgent;
