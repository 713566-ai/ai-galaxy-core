const axios = require("axios");
const SelfRewriter = require("../v60-self/selfRewriter");

class RealLoop {
    constructor(metaWill) {
        this.tick = 0;
        this.running = false;
        this.history = [];
        this.metaWill = metaWill;
        this.rewriter = new SelfRewriter(metaWill);
    }

    async step() {
        this.tick++;

        try {
            // 1. META-WILL ANALYSIS
            const meta = await axios.get("http://localhost:3000/api/v58/state", { timeout: 2000 });
            
            // 2. APPLY RULES TO SWARM
            await axios.post("http://localhost:3000/api/v54/apply-rules", {
                rules: meta.data.rules
            }, { timeout: 2000 });
            
            // 3. RUN SWARM STEP
            const swarm = await axios.post("http://localhost:3000/api/swarm/step", {}, { timeout: 2000 });
            
            // 4. GET WORLD STATE (GOD CORE)
            const world = await axios.get("http://localhost:5400/status", { timeout: 2000 });
            
            // 5. FEEDBACK TO META-WILL
            await axios.post("http://localhost:3000/api/v58/feedback", {
                swarm: swarm.data,
                world: world.data
            }, { timeout: 2000 });
            
            // 6. 🔥 V60 SELF-REWRITE (самоизменение правил)
            if (this.metaWill && this.metaWill.history) {
                const rewrite = this.rewriter.run(this.metaWill.history);
                if (rewrite.changed) {
                    await axios.post("http://localhost:3000/api/v54/apply-rules", {
                        rules: rewrite.rules
                    }, { timeout: 2000 });
                }
            }
            
            this.history.push({
                tick: this.tick,
                entropy: world.data.entropy,
                bestScore: swarm.data.bestScore,
                agentsCount: swarm.data.agentsCount
            });
            
            if (this.history.length > 100) this.history.shift();
            
            console.log(`🧬 V60 LOOP tick=${this.tick} | entropy=${world.data.entropy.toFixed(3)} | bestScore=${swarm.data.bestScore || 0}`);
            
        } catch (e) {
            console.log(`❌ LOOP ERROR tick=${this.tick}:`, e.message);
        }
    }

    start(interval = 3000) {
        if (this.running) {
            console.log("⚠️ Loop уже запущен");
            return;
        }
        this.running = true;
        this.interval = setInterval(() => this.step(), interval);
        console.log(`🚀 V60 SELF-ORGANIZING LOOP STARTED (interval=${interval}ms)`);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.running = false;
            console.log("🛑 V60 LOOP STOPPED");
        }
    }

    getStatus() {
        return {
            running: this.running,
            tick: this.tick,
            historyLength: this.history.length,
            lastTick: this.history[this.history.length - 1],
            selfRewriter: this.rewriter.getStats()
        };
    }
}

module.exports = RealLoop;
