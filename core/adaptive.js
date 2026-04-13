const RewardSmoother = require("./rewardSmoother");

class Adaptive {
    constructor(memory) {
        this.memory = memory;
        this.smoother = new RewardSmoother(15);
        this.policy = memory?.getPolicy() || {
            mutationRate: 0.2,
            selectionPressure: 0.6,
            explorationBias: 0.5
        };
        this.learnCount = 0;
        this.totalReward = 0;
        this.experience = [];
    }

    computeReward(prev, current, leaderAction) {
        if (!prev) return 0;
        let reward = 0;
        
        if (leaderAction === 'expand' && current.entities > prev.entities) reward += 2;
        if (leaderAction === 'stabilize' && current.entropy < prev.entropy) reward += 1.5;
        
        if (current.entropy < 0.4) reward += 2;
        else if (current.entropy > 0.7) reward -= 2;
        
        const growth = (current.entities || 500) - (prev.entities || 500);
        if (growth > 20) reward += 3;
        else if (growth < -20) reward -= 2;
        
        reward -= (current.wars || 0) * 1.5;
        reward += (current.alliances || 0) * 1;
        
        return Math.max(-3, Math.min(3, reward));
    }

    applyRewardAdaptation(reward) {
        const smoothed = this.memory.state.reward.smoothed;
        
        if (smoothed < -1) {
            this.memory.updatePolicy({
                mutationRate: Math.min(0.35, this.memory.state.policy.mutationRate * 1.05),
                explorationBias: Math.min(0.8, this.memory.state.policy.explorationBias + 0.02)
            });
        }
        
        if (smoothed > 1) {
            this.memory.updatePolicy({
                mutationRate: Math.max(0.12, this.memory.state.policy.mutationRate * 0.97)
            });
        }
        
        this.policy = this.memory.getPolicy();
    }

    clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

    learn(prev, current, leaderAction) {
        this.learnCount++;
        const reward = this.computeReward(prev, current, leaderAction);
        this.smoother.add(reward);
        const smoothReward = this.smoother.avg();
        this.totalReward += reward;
        
        this.memory.addReward(reward);
        this.applyRewardAdaptation(reward);
        
        this.experience.push({ reward, smoothReward, leaderAction, policy: { ...this.policy } });
        if (this.experience.length > 100) this.experience.shift();
        
        if (this.learnCount % 10 === 0) {
            console.log(`🧬 V74 | R:${reward.toFixed(2)} S:${smoothReward.toFixed(2)} MR:${this.policy.mutationRate.toFixed(3)}`);
        }
        
        return { reward, smoothReward, policy: this.policy };
    }

    getState() {
        return {
            policy: this.policy,
            learnCount: this.learnCount,
            totalReward: this.totalReward.toFixed(2),
            smoothedReward: this.smoother.avg().toFixed(3)
        };
    }
}

module.exports = Adaptive;
