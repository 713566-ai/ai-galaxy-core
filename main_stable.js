const express = require('express');
const app = express();
const PORT = 3000;

// ========== V69.1 STABLE MEMORY ==========
class AdaptiveIntelligence {
    constructor() {
        this.experience = [];
        this.longMemory = [];
        this.bestPool = [];
        this.policy = { mutationRate: 0.2, selectionPressure: 0.6 };
        this.totalReward = 0;
        this.learnCount = 0;
    }

    computeReward(prev, current) {
        if (!prev) return 0;
        let reward = 0;
        if (current.entropy < 0.4) reward += 2;
        else if (current.entropy > 0.7) reward -= 2;
        const growth = (current.entities || 500) - (prev.entities || 500);
        if (growth > 20) reward += 3;
        else if (growth < -20) reward -= 2;
        reward -= (current.wars || 0) * 1.5;
        reward += (current.alliances || 0) * 1;
        return Math.max(-3, Math.min(3, reward));
    }

    learn(prev, current) {
        this.learnCount = (this.learnCount || 0) + 1;
        const reward = this.computeReward(prev, current);
        this.totalReward = (this.totalReward || 0) + reward;
        
        const exp = { reward, policy: { ...this.policy } };
        
        // ✅ ЖЁСТКИЕ ЛИМИТЫ ПАМЯТИ
        this.experience.push(exp);
        if (this.experience.length > 150) this.experience.splice(0, 50);
        
        this.longMemory.push(exp);
        if (this.longMemory.length > 250) this.longMemory.splice(0, 100);
        
        if (reward > 1.5) {
            this.bestPool.push(exp);
            if (this.bestPool.length > 20) this.bestPool = this.bestPool.slice(0, 20);
        }
        
        this.evolve();
        
        if (this.learnCount % 20 === 0) {
            console.log(`🧬 V69.1 | R:${reward.toFixed(2)} MR:${this.policy.mutationRate.toFixed(3)} | Mem:${this.experience.length}/${this.longMemory.length}/${this.bestPool.length}`);
        }
        
        return { reward, policy: this.policy };
    }

    evolve() {
        const recent = this.experience.slice(-15);
        if (recent.length < 10) return;
        const avg = recent.reduce((s, e) => s + e.reward, 0) / recent.length;
        
        if (avg < -1 && this.bestPool?.length > 0) {
            const best = this.bestPool[Math.floor(Math.random() * this.bestPool.length)];
            this.policy = { ...best.policy };
            console.log("🔁 ROLLBACK");
        } else if (avg < -1.5) {
            this.policy.mutationRate = Math.min(0.28, (this.policy.mutationRate || 0.2) * 1.05);
        } else if (avg > 0.5) {
            this.policy.mutationRate = Math.max(0.12, (this.policy.mutationRate || 0.2) * 0.97);
        }
    }

    getState() {
        return {
            policy: this.policy,
            experienceSize: this.experience?.length || 0,
            longMemory: this.longMemory?.length || 0,
            bestPool: this.bestPool?.length || 0,
            totalReward: this.totalReward?.toFixed(2) || 0,
            learnCount: this.learnCount || 0
        };
    }
}

class RealLoop {
    constructor() {
        this.tick = 0;
        this.timer = null;
        this.adaptive = new AdaptiveIntelligence();
        this.prevWorld = null;
    }

    start() {
        // ✅ Увеличен интервал для снижения нагрузки
        this.timer = setInterval(() => this.update(), 4000);
        console.log("🧬 STABLE LOOP STARTED (interval=4000ms)");
    }

    update() {
        this.tick++;
        const world = {
            entropy: Math.random() * 0.8 + 0.1,
            wars: Math.floor(Math.random() * 3),
            entities: 500 + Math.floor(Math.random() * 100),
            alliances: Math.floor(Math.random() * 2)
        };
        if (!this.prevWorld) this.prevWorld = { ...world };
        const learning = this.adaptive.learn(this.prevWorld, world);
        this.prevWorld = { ...world };
        
        // ✅ Мониторинг памяти
        const mem = process.memoryUsage();
        if (mem.heapUsed > 600 * 1024 * 1024) {
            console.log(`⚠️ MEMORY WARNING: ${Math.round(mem.heapUsed / 1024 / 1024)}MB`);
        }
        
        if (this.tick % 15 === 0) {
            console.log(`🧬 T${this.tick} | E:${world.entropy.toFixed(3)} | MR:${learning.policy.mutationRate.toFixed(3)}`);
        }
    }

    stop() { if (this.timer) clearInterval(this.timer); }
    getState() { return { tick: this.tick, adaptive: this.adaptive.getState() }; }
}

const loop = new RealLoop();
loop.start();

app.get("/api/state", (req, res) => { res.json(loop.getState()); });
app.get("/api/memory", (req, res) => { 
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024), heapTotal: Math.round(mem.heapTotal / 1024 / 1024) });
});

app.listen(PORT, () => console.log(`🌐 API on port ${PORT}`));
