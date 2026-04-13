class Coordinator {
    constructor(agents) {
        this.agents = agents;
        this.history = [];
        this.consensusThreshold = 0.3;
    }

    step(state) {
        const results = [];
        let totalWeight = 0;
        let weightedSignal = 0;
        let anyBlock = false;

        for (const agent of Object.values(this.agents)) {
            const result = agent.act(state);
            results.push(result);
            weightedSignal += result.signal * result.weight;
            totalWeight += result.weight;
            if (result.block) anyBlock = true;
        }

        const consensus = totalWeight > 0 ? weightedSignal / totalWeight : 0;
        const decision = this.makeDecision(consensus, anyBlock, results);

        this.history.push({
            timestamp: Date.now(),
            tick: state.tick,
            consensus,
            decision,
            agentSignals: results.map(r => ({ agent: r.agent, signal: r.signal, recommendation: r.recommendation }))
        });
        
        if (this.history.length > 100) this.history.shift();

        return { consensus, decision, agents: results, anyBlock };
    }

    makeDecision(consensus, anyBlock, results) {
        if (anyBlock) {
            const blocker = results.find(r => r.block);
            return { action: 'blocked', reason: `${blocker?.agent} blocked`, consensus };
        }
        
        if (consensus > 0.5) return { action: 'expand', confidence: consensus, consensus };
        if (consensus < -0.3) return { action: 'stabilize', confidence: -consensus, consensus };
        return { action: 'monitor', confidence: 0.5, consensus };
    }

    getStats() {
        const lastDecision = this.history[this.history.length - 1];
        return {
            historyLength: this.history.length,
            lastDecision,
            agents: Object.values(this.agents).map(a => a.getStats())
        };
    }
}

module.exports = Coordinator;
