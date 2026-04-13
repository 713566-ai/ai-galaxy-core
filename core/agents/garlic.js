const Agent = require('./agent');

class Garlic extends Agent {
    constructor() {
        super('garlic', 0.2);
    }

    act(state) {
        // Garlic — безопасность, может блокировать
        const entropy = state.world?.entropy || 0.5;
        const entities = state.world?.entities || 500;
        let signal = 0.1;
        let block = false;
        
        if (entropy > 0.8) {
            signal = -0.8;
            block = true;
        }
        if (entities > 800) {
            signal = -0.3;
        }
        
        return {
            agent: this.name,
            weight: this.weight,
            signal: signal,
            confidence: 0.8,
            recommendation: block ? 'block' : 'proceed',
            block: block
        };
    }
}

module.exports = Garlic;
