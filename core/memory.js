const fs = require('fs');
const path = require('path');

class Memory {
    constructor(stateFile = "./state/snapshot.json") {
        this.stateFile = stateFile;
        this.ensureDir();
        this.load();
    }

    ensureDir() {
        const dir = path.dirname(this.stateFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    load() {
        try {
            if (fs.existsSync(this.stateFile)) {
                this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf-8'));
                console.log(`♻️ MEMORY LOADED: tick=${this.state.tick || 0}`);
                return;
            }
        } catch (e) {}

        this.state = {
            tick: 0,
            policy: { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 },
            world: { entropy: 0.5, entities: 500, wars: 0, alliances: 0 },
            reward: { total: 0, last: 0, smoothed: 0, history: [] },
            evolution: { generation: 0, eliteArchive: [], bestFitness: 0 },
            species: { list: [], dominantSpecies: null, history: [] }
        };
    }

    save() {
        this.state.timestamp = Date.now();
        fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    }

    getPolicy() { return this.state.policy; }
    updatePolicy(p) { this.state.policy = { ...this.state.policy, ...p }; this.save(); }
    updateWorld(w) { this.state.world = { ...this.state.world, ...w }; }
    
    addReward(r) {
        this.state.reward.last = r;
        this.state.reward.total += r;
        this.state.reward.smoothed = this.state.reward.smoothed * 0.9 + r * 0.1;
        this.state.reward.history.push({ reward: r, tick: this.state.tick });
        if (this.state.reward.history.length > 200) this.state.reward.history.shift();
    }
    
    incrementTick() { this.state.tick++; }
    getState() { return this.state; }
}

module.exports = Memory;
