const Agent = require('./agent');

class UIAX extends Agent {
    constructor() {
        super('uiax', 0.4);
    }

    act(state) {
        // UIA-X анализирует и предлагает баланс
        const wars = state.world?.wars || 0;
        const alliances = state.world?.alliances || 0;
        let signal = 0.3;
        
        if (wars > alliances + 1) signal = -0.5; // слишком много войн
        if (alliances > wars) signal = 0.6;       // дипломатия работает
        
        return {
            agent: this.name,
            weight: this.weight,
            signal: signal,
            confidence: 0.65,
            recommendation: wars > alliances ? 'diplomacy' : 'maintain'
        };
    }
}

module.exports = UIAX;
