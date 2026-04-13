const fs = require("fs");

class SelfRewriter {
    constructor(metaWill) {
        this.metaWill = metaWill;
        this.rewrites = 0;
        this.history = [];
    }

    analyzePerformance(history) {
        if (!history || history.length < 5) return null;

        const last = history.slice(-10);
        
        const avgEntropy = last.reduce((a, b) => a + (b.entropy || 0.5), 0) / last.length;
        const avgScore = last.reduce((a, b) => a + (b.swarmScore || 0), 0) / last.length;
        const improvement = last[last.length - 1]?.swarmScore - last[0]?.swarmScore || 0;

        return { avgEntropy, avgScore, improvement, samples: last.length };
    }

    decideRewrite(metrics) {
        if (!metrics) return null;

        // 🧠 если система "застряла" (нет прогресса)
        if (metrics.avgScore < 0.1 && metrics.improvement === 0) {
            return { type: "BOOST_EXPLORATION", reason: "Застой системы" };
        }

        // 🧠 если слишком хаотично (энтропия высокая)
        if (metrics.avgEntropy > 0.7) {
            return { type: "FORCE_STABILITY", reason: "Высокая энтропия" };
        }

        // 🧠 если прогресс есть — поощряем текущее поведение
        if (metrics.improvement > 0.1) {
            return { type: "REWARD_PROGRESS", reason: "Положительная динамика" };
        }

        return null;
    }

    applyRewrite(decision) {
        if (!decision) return { changed: false };

        let rules = this.metaWill.rules;
        const oldRules = { ...rules };

        switch (decision.type) {
            case "BOOST_EXPLORATION":
                rules.mutationRate = Math.min(0.35, rules.mutationRate + 0.05);
                rules.explorationBias = Math.min(0.95, rules.explorationBias + 0.1);
                console.log(`🧠 SELF-REWRITE: BOOST_EXPLORATION (mutationRate=${rules.mutationRate.toFixed(3)})`);
                break;
                
            case "FORCE_STABILITY":
                rules.selectionPressure = Math.min(0.95, rules.selectionPressure + 0.1);
                rules.mutationRate = Math.max(0.05, rules.mutationRate - 0.05);
                console.log(`🧠 SELF-REWRITE: FORCE_STABILITY (selectionPressure=${rules.selectionPressure.toFixed(3)})`);
                break;
                
            case "REWARD_PROGRESS":
                rules.rewardSensitivity = Math.min(0.9, rules.rewardSensitivity + 0.05);
                console.log(`🧠 SELF-REWRITE: REWARD_PROGRESS (rewardSensitivity=${rules.rewardSensitivity.toFixed(3)})`);
                break;
                
            default:
                return { changed: false };
        }

        this.rewrites++;
        this.history.push({
            timestamp: Date.now(),
            decision: decision.type,
            reason: decision.reason,
            oldRules,
            newRules: { ...rules }
        });

        return {
            changed: true,
            type: decision.type,
            reason: decision.reason,
            rules
        };
    }

    run(history) {
        const metrics = this.analyzePerformance(history);
        const decision = this.decideRewrite(metrics);
        return this.applyRewrite(decision);
    }

    getStats() {
        return {
            rewritesCount: this.rewrites,
            recentRewrites: this.history.slice(-5),
            currentRules: this.metaWill?.rules || null
        };
    }
}

module.exports = SelfRewriter;
