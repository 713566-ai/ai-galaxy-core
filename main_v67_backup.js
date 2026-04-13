const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;
const STATE_FILE = "./state/snapshot.json";

// ========== ПАМЯТЬ ==========
class Memory {
    constructor(path) {
        this.path = path;
        this.ensureDir();
    }
    ensureDir() {
        const dir = this.path.split('/').slice(0, -1).join('/');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
    save(state) {
        fs.writeFileSync(this.path, JSON.stringify({ ...state, timestamp: Date.now() }, null, 2));
    }
    load() {
        try {
            if (fs.existsSync(this.path)) {
                return JSON.parse(fs.readFileSync(this.path, 'utf-8'));
            }
        } catch(e) {}
        return { tick: 0, world: { entropy: 0.5, entities: 500, wars: 0, alliances: 0 } };
    }
}

// ========== META-WILL ==========
class MetaWill {
    constructor() {
        this.rules = { mutationRate: 0.2, selectionPressure: 0.6 };
        this.adaptationLevel = 0;
    }
    analyze(world) {
        return { needExploration: world.entropy > 0.6, needStability: world.entropy < 0.3 };
    }
    evolveRules(signal) {
        if (signal.needExploration) this.rules.mutationRate = Math.min(0.3, this.rules.mutationRate + 0.01);
        if (signal.needStability) this.rules.selectionPressure = Math.min(0.85, this.rules.selectionPressure + 0.02);
        this.adaptationLevel++;
        return this.rules;
    }
}

// ========== V67 ADAPTIVE INTELLIGENCE ==========
class AdaptiveIntelligence {
    constructor() {
        this.experience = [];
        this.policy = { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 };
        this.totalReward = 0;
        this.adaptationCount = 0;
        this.learnCount = 0;
    }

    computeReward(prev, current) {
        if (!prev) return 0;
        let reward = 0;
        reward += ((prev.entropy || 0.5) - (current.entropy || 0.5)) * 2;
        reward += ((current.entities || 500) - (prev.entities || 500)) * 0.02;
        reward -= (current.wars || 0) * 0.2;
        reward += (current.alliances || 0) * 0.1;
        return Math.max(-2, Math.min(2, reward));
    }

    learn(prev, current, rules) {
        this.learnCount++;
        const reward = this.computeReward(prev, current);
        this.totalReward += reward;
        
        this.experience.push({
            id: this.learnCount,
            timestamp: Date.now(),
            prev: { entropy: prev?.entropy, entities: prev?.entities },
            current: { entropy: current.entropy, entities: current.entities, wars: current.wars },
            reward: reward,
            rules: { ...rules }
        });
        
        if (this.experience.length > 500) this.experience.shift();
        
        // Адаптация
        const recent = this.experience.slice(-20);
        if (recent.length >= 5) {
            const avgReward = recent.reduce((s, e) => s + e.reward, 0) / recent.length;
            if (avgReward < -0.2) {
                this.policy.mutationRate = Math.min(0.35, this.policy.mutationRate * 1.05);
            } else if (avgReward > 0.3) {
                this.policy.mutationRate = Math.max(0.1, this.policy.mutationRate * 0.97);
                this.policy.selectionPressure = Math.min(0.85, this.policy.selectionPressure * 1.02);
            }
        }
        
        this.policy.mutationRate = Math.max(0.08, Math.min(0.32, this.policy.mutationRate));
        this.policy.selectionPressure = Math.max(0.4, Math.min(0.85, this.policy.selectionPressure));
        
        this.adaptationCount++;
        
        if (this.learnCount % 10 === 0) {
            console.log(`📚 V67 Learning: #${this.learnCount} | R:${reward.toFixed(3)} | MR:${this.policy.mutationRate.toFixed(3)} | Exp:${this.experience.length}`);
        }
        
        return { reward, policy: { ...this.policy } };
    }

    getState() {
        return {
            policy: this.policy,
            experienceSize: this.experience.length,
            totalReward: this.totalReward.toFixed(2),
            adaptationCount: this.adaptationCount,
            learnCount: this.learnCount
        };
    }
}

// ========== REAL LOOP ==========
class RealLoop {
    constructor() {
        this.tick = 0;
        this.timer = null;
        this.memory = new Memory(STATE_FILE);
        this.metaWill = new MetaWill();
        this.adaptive = new AdaptiveIntelligence();
        this.prevWorld = null;
        
        const saved = this.memory.load();
        this.tick = saved.tick || 0;
        console.log(`♻️ RESTORED: tick=${this.tick}`);
    }

    start() {
        if (this.timer) return;
        this.timer = setInterval(() => this.update(), 2000);
        console.log(`🧬 LOOP STARTED`);
    }

    update() {
        this.tick++;
        
        const world = {
            entropy: Math.random() * 0.8 + 0.1,
            wars: Math.floor(Math.random() * 4),
            entities: 500 + Math.floor(Math.random() * 150),
            alliances: Math.floor(Math.random() * 3),
            tick: this.tick
        };
        
        if (!this.prevWorld) this.prevWorld = { ...world };
        
        const signal = this.metaWill.analyze(world);
        this.metaWill.evolveRules(signal);
        
        // V67 ОБУЧЕНИЕ
        const learning = this.adaptive.learn(this.prevWorld, world, this.metaWill.rules);
        
        // Применяем изученную политику
        this.metaWill.rules.mutationRate = learning.policy.mutationRate;
        this.metaWill.rules.selectionPressure = learning.policy.selectionPressure;
        
        this.prevWorld = { ...world };
        
        // Сохраняем память
        this.memory.save({ tick: this.tick, world, rules: this.metaWill.rules });
        
        if (this.tick % 5 === 0) {
            console.log(`🧬 T${this.tick} | E:${world.entropy.toFixed(3)} | MR:${learning.policy.mutationRate.toFixed(3)} | Exp:${this.adaptive.experience.length}`);
        }
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }

    getState() {
        return { tick: this.tick, running: !!this.timer, adaptive: this.adaptive.getState() };
    }
}

// ========== HTTP API ==========
const loop = new RealLoop();
loop.start();

app.use(express.json());
app.use(express.static('public'));

app.get("/api/status", (req, res) => {
    res.json({ status: "ok", loop: loop.getState() });
});

app.get("/api/memory", (req, res) => {
    res.json(loop.memory.load());
});

app.get("/api/v66/state", (req, res) => {
    res.json(loop.adaptive.getState());
});

app.get("/api/v66/experience", (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const recent = loop.adaptive.experience.slice(-limit);
    res.json({ experience: recent, count: recent.length });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 API RUNNING ON PORT ${PORT}`);
});

console.log("🔥 V67 ADAPTIVE SYSTEM STARTED");
