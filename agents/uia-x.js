class UIAX {
    constructor() {
        this.name = "UIA-X";
        this.version = "1.0";
        this.modules = ["perception", "reasoning", "action", "memory"];
        this.context = {};
        console.log(`🧠 ${this.name} initialized`);
    }

    async perceive(input) {
        return {
            type: typeof input,
            complexity: input.length > 100 ? 'high' : 'low',
            entities: this.extractEntities(input),
            timestamp: Date.now()
        };
    }

    extractEntities(text) {
        const entities = [];
        const patterns = {
            code: /function|class|const|let/g,
            data: /[0-9]+/g,
            command: /start|stop|restart|status/g
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = text.match(pattern);
            if (matches) entities.push(...matches.map(m => ({ type, value: m })));
        }
        return entities;
    }

    async reason(perception, goals) {
        const analysis = {
            understanding: perception.complexity === 'low' ? 0.9 : 0.6,
            confidence: 0.7,
            suggestedActions: []
        };
        
        if (perception.entities.some(e => e.type === 'command')) {
            analysis.suggestedActions.push({ action: 'execute_command', priority: 'high' });
        }
        
        if (perception.entities.some(e => e.type === 'code')) {
            analysis.suggestedActions.push({ action: 'analyze_code', priority: 'medium' });
        }
        
        this.context.lastAnalysis = analysis;
        return analysis;
    }

    async act(action, params) {
        const result = {
            action,
            status: 'executed',
            timestamp: Date.now()
        };
        
        switch(action) {
            case 'execute_command':
                result.output = `Command executed: ${params.command || 'unknown'}`;
                break;
            case 'analyze_code':
                result.output = `Code analysis completed, found ${params.complexity || 0} issues`;
                break;
            default:
                result.output = `Action ${action} completed`;
        }
        
        return result;
    }

    learn(feedback) {
        this.context.lastFeedback = feedback;
        this.context.adaptationLevel = (this.context.adaptationLevel || 0) + 1;
        return { learned: true, adaptation: this.context.adaptationLevel };
    }

    getState() {
        return {
            name: this.name,
            modules: this.modules,
            contextSize: Object.keys(this.context).length,
            lastAnalysis: this.context.lastAnalysis
        };
    }
}

module.exports = UIAX;
