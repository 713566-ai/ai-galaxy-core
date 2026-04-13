class GarlicAgent {
    constructor() {
        this.name = "Garlic";
        this.version = "1.0";
        this.protection = {
            threats: 0,
            blocks: 0,
            optimizations: 0
        };
        console.log(`🧄 ${this.name} initialized`);
    }

    async scan(input) {
        const threats = [];
        
        // Обнаружение угроз
        const threatPatterns = [
            { pattern: /rm -rf/, severity: 'critical', type: 'destructive_command' },
            { pattern: /DROP TABLE/i, severity: 'critical', type: 'sql_injection' },
            { pattern: /eval\(/, severity: 'high', type: 'code_injection' },
            { pattern: /process\.exit/, severity: 'medium', type: 'process_termination' },
            { pattern: /require\(['"]fs['"]\)/, severity: 'low', type: 'filesystem_access' }
        ];
        
        for (const threat of threatPatterns) {
            if (threat.pattern.test(input)) {
                threats.push(threat);
                this.protection.threats++;
            }
        }
        
        return { safe: threats.length === 0, threats };
    }

    async sanitize(input) {
        let sanitized = input;
        
        // Очистка опасных конструкций
        sanitized = sanitized.replace(/eval\s*\(/g, '/* blocked by Garlic */');
        sanitized = sanitized.replace(/rm -rf/g, '/* blocked */');
        sanitized = sanitized.replace(/DROP TABLE/gi, '/* blocked */');
        
        return sanitized;
    }

    async optimize(code) {
        const optimizations = [];
        let optimized = code;
        
        // Оптимизация 1: удаление console.log в production
        if (code.includes('console.log') && this.isProduction()) {
            optimized = optimized.replace(/console\.log\([^)]*\);/g, '// removed by Garlic');
            optimizations.push({ type: 'remove_console_logs', impact: 'performance' });
        }
        
        // Оптимизация 2: упрощение условий
        if (code.includes('if (true)')) {
            optimized = optimized.replace(/if\s*\(\s*true\s*\)/g, 'if (true) /* optimized */');
            optimizations.push({ type: 'simplify_conditions', impact: 'readability' });
        }
        
        this.protection.optimizations += optimizations.length;
        return { optimized, optimizations };
    }

    isProduction() {
        return process.env.NODE_ENV === 'production';
    }

    block(threat) {
        this.protection.blocks++;
        return { blocked: true, threat, timestamp: Date.now() };
    }

    getStats() {
        return {
            name: this.name,
            threatsDetected: this.protection.threats,
            blocksExecuted: this.protection.blocks,
            optimizationsApplied: this.protection.optimizations
        };
    }
}

module.exports = GarlicAgent;
