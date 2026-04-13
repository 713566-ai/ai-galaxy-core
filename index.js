const ConflictDetector = require('./conflict-detector');
const WillEngine = require('./will-engine');
const PriorityEvolution = require('./priority-evolution');

class WillSystem {
    constructor() {
        this.conflict = new ConflictDetector();
        this.will = new WillEngine();
        this.evolution = new PriorityEvolution();
        this.totalReward = 0;
    }

    process(goals, reward) {
        const conflicts = this.conflict.detect(goals);
        const chosen = this.will.choose(goals, conflicts);

        this.totalReward += reward;

        this.will.bias = this.evolution.update(this.will.bias, reward);

        return {
            goals,
            conflicts,
            chosen,
            will: this.will.bias,
            totalReward: this.totalReward
        };
    }
}

module.exports = WillSystem;
