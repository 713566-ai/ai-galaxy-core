const express = require('express');

class API {
    static start(ctx) {
        const app = express();
        
        app.get("/api/status", (req, res) => {
            res.json({
                ok: true,
                tick: ctx.memory.state.tick,
                policy: ctx.adaptive.getState().policy,
                reward: ctx.memory.state.reward,
                world: ctx.memory.state.world,
                adaptive: ctx.adaptive.getState(),
                evolutionaryBrain: ctx.evolutionaryBrain.getState()
            });
        });
        
        app.get("/api/brain", (req, res) => {
            res.json(ctx.evolutionaryBrain.getState());
        });
        
        app.get("/api/memory", (req, res) => { 
            const mem = process.memoryUsage();
            res.json({ 
                heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
                state: ctx.memory.getState()
            });
        });
        
        app.listen(3000, () => console.log("🌐 V73 API RUNNING ON 3000"));
    }
}

module.exports = API;
