class BugHunterAgent {
    constructor() {
        this.name = 'BugHunter';
        this.bugs = [];
    }

    scanCode(code, filePath) {
        const bugs = [];
        
        // Паттерны багов
        const patterns = [
            { pattern: /console\.log/g, severity: 'low', message: 'Оставлен console.log' },
            { pattern: /TODO|FIXME/g, severity: 'medium', message: 'Незавершённый код' },
            { pattern: /catch\s*\(\s*\)/g, severity: 'high', message: 'Пустой catch блок' },
            { pattern: /eval\s*\(/g, severity: 'critical', message: 'Использование eval()' },
            { pattern: /var\s+\w+\s*=\s*\w+\s*=\s*\w+/g, severity: 'medium', message: 'Цепное присваивание' }
        ];
        
        patterns.forEach(p => {
            if (p.pattern.test(code)) {
                bugs.push({
                    file: filePath,
                    severity: p.severity,
                    message: p.message
                });
            }
        });
        
        this.bugs.push({ timestamp: Date.now(), bugs, file: filePath });
        return bugs;
    }

    getStats() {
        return {
            name: this.name,
            bugsFound: this.bugs.reduce((sum, b) => sum + b.bugs.length, 0),
            lastScan: this.bugs[this.bugs.length - 1]
        };
    }
}

module.exports = BugHunterAgent;
