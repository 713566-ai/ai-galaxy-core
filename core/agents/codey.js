const Agent = require('./agent');

class Codey extends Agent {
    constructor() {
        super('codey', 0.4);
    }

    act(state) {
        // Codey предпочитает рост и расширение
        const entropy = state.world?.entropy || 0.5;
        let signal = 0.5;
        
        if (entropy < 0.3) signal = 0.8;  // стабильно → расти
        if (entropy > 0.7) signal = -0.3; // хаос → осторожно
        
        return {
            agent: this.name,
            weight: this.weight,
            signal: signal,
            confidence: 0.7,
            recommendation: entropy < 0.4 ? 'expand' : 'stabilize'
        };
    }
}

module.exports = Codey;
