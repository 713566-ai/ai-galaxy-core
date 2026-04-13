class Loop {
    constructor(ctx) {
        this.ctx = ctx;
        this.timer = null;
        this.running = false;
        this.prevWorld = null;
    }

    start(interval = 4000) {
        if (this.timer) return;
        this.running = true;
        this.timer = setInterval(() => this.update(), interval);
        console.log(`🧬 V74 LOOP STARTED (interval=${interval}ms)`);
    }

    update() {
        const tick = this.ctx.memory.state.tick + 1;
        this.ctx.memory.incrementTick();
        
        const world = {
            entropy: Math.random() * 0.8 + 0.1,
            wars: Math.floor(Math.random() * 3),
            entities: 500 + Math.floor(Math.random() * 100),
            alliances: Math.floor(Math.random() * 2),
            tick: tick
        };
        
        if (!this.prevWorld) this.prevWorld = { ...world };
        
        // Награды для агентов
        const rewards = {
            codey: world.entropy < 0.4 ? 0.5 : -0.2,
            uiax: world.wars < 2 ? 0.3 : -0.3,
            garlic: world.entropy > 0.6 ? 0.4 : -0.1
        };
        
        const brainResult = this.ctx.evolutionaryBrain.step(world, rewards);
        const leader = brainResult.leader;
        const leaderAction = leader?.strategy === 'growth' ? 'expand' : 
                            leader?.strategy === 'safety' ? 'stabilize' : 'monitor';
        
        const learning = this.ctx.adaptive.learn(this.prevWorld, world, leaderAction);
        
        this.ctx.memory.updateWorld(world);
        this.prevWorld = { ...world };
        this.ctx.memory.save();
        
        if (tick % 5 === 0) {
            console.log(`🧬 T${tick} | Leader:${leader?.name || 'none'} | Gen:${brainResult.generation} | Pop:${brainResult.population} | MR:${learning.policy.mutationRate.toFixed(3)}`);
        }
    }

    stop() { if (this.timer) clearInterval(this.timer); this.timer = null; }
}

module.exports = Loop;
