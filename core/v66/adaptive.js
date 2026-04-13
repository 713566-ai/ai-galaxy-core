class AdaptiveIntelligence {
    constructor() {
        this.experience = [];
        this.longMemory = [];
        this.bestPool = [];
        this.policy = { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 };
        this.totalReward = 0;
        this.learnCount = 0;
        this.avgReward = 0;
    }

    computeReward(prev, current) {
        if (!prev) return 0;
        let reward = 0;
        if (current.entropy < 0.4) reward += 2;
        else if (current.entropy > 0.7) reward -= 2;
        const growth = (current.entities || 500) - (prev.entities || 500);
        if (growth > 20) reward += 3;
        else if (growth < -20) reward -= 2;
        else reward += 0.5;
        reward -= (current.wars || 0) * 1.5;
        reward += (current.alliances || 0) * 1;
        const entropyImprovement = (prev.entropy || 0.5) - (current.entropy || 0.5);
        if (entropyImprovement > 0) reward += entropyImprovement * 2;
        return Math.max(-5, Math.min(5, reward));
    }

    learn(prev, current, rules) {
        this.learnCount++;
        const reward = this.computeReward(prev, current);
        this.totalReward += reward;
        this.avgReward = this.totalReward / this.learnCount;
        const exp = { id: this.learnCount, reward, state: current, rules: { ...rules }, policy: { ...this.policy } };
        this.experience.push(exp);
        if (this.experience.length > 200) this.experience.shift();
        this.longMemory.push(exp);
        if (this.longMemory.length > 1000) this.longMemory.shift();
        if (reward > 2) {
            this.bestPool.push(exp);
            this.bestPool.sort((a, b) => b.reward - a.reward);
            this.bestPool = this.bestPool.slice(0, 50);
        }
        this.evolve();
        if (this.learnCount % 10 === 0) {
            console.log(`🧬 V68 | R:${reward.toFixed(2)} Avg:${this.avgReward.toFixed(2)} MR:${this.policy.mutationRate.toFixed(3)} Pool:${this.bestPool.length}`);
        }
        return { reward, policy: this.policy };
    }

    evolve() {
        const recent = this.experience.slice(-20);
        if (recent.length < 5) return;
        const avg = recent.reduce((s, e) => s + e.reward, 0) / recent.length;
        if (avg < -1 && this.bestPool.length > 0) {
            const best = this.bestPool[Math.floor(Math.random() * this.bestPool.length)];
            this.policy = { ...best.policy };
            console.log("🔁 ROLLBACK → BEST POLICY");
            return;
        }
        if (avg < -2) {
            this.policy.mutationRate = 0.28;
            this.policy.explorationBias = 0.7;
            console.log("💥 EXPLORATION SPIKE");
            return;
        }
        if (avg > 1) {
            this.policy.mutationRate *= 0.97;
            this.policy.selectionPressure *= 1.03;
        } else {
            this.policy.mutationRate *= 0.995;
        }
        this.clamp();
    }

    clamp() {
        this.policy.mutationRate = Math.max(0.08, Math.min(0.28, this.policy.mutationRate));
        this.policy.selectionPressure = Math.max(0.4, Math.min(0.9, this.policy.selectionPressure));
        this.policy.explorationBias = Math.max(0.3, Math.min(0.7, this.policy.explorationBias));
    }

    getState() {
        return {
            policy: this.policy,
            experienceSize: this.experience.length,
            longMemory: this.longMemory.length,
            bestPool: this.bestPool.length,
            avgReward: this.avgReward.toFixed(3),
            totalReward: this.totalReward.toFixed(2),
            learnCount: this.learnCount
        };
    }
}

module.exports = AdaptiveIntelligence;
