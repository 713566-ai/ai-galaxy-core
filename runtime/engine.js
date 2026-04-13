const Memory = require("./memory");
const LoopManager = require("./loopManager");

class Engine {
    constructor(core) {
        this.core = core;
        this.tick = 0;
        this.started = false;
        this.loop = null;
        this.memory = new Memory();
        this.loopManager = new LoopManager();
        
        // Восстановление состояния
        const saved = this.memory.load();
        if (saved) {
            this.tick = saved.tick || 0;
            console.log(`♻️ RESTORED STATE: tick=${this.tick}`);
        }
    }

    boot() {
        if (this.started) {
            console.log("⚠️ Engine already booted");
            return;
        }

        console.log("🔥 V64 ENGINE BOOT");
        this.started = true;
        
        // Запускаем цикл
        this.loop = setInterval(() => this.step(), 2000);
    }

    step() {
        this.tick++;

        // Симуляция мира
        const world = {
            entropy: Math.random() * 0.8 + 0.1,
            wars: Math.floor(Math.random() * 5),
            entities: 500 + Math.floor(Math.random() * 200),
            alliances: Math.floor(Math.random() * 3),
            tick: this.tick
        };

        // MetaWill анализ
        if (this.core.metaWill) {
            const signal = this.core.metaWill.analyze(world);
            this.core.metaWill.evolveRules(signal);
        }

        // Сохраняем состояние
        this.memory.save({
            tick: this.tick,
            world: world,
            metaRules: this.core.metaWill?.getRules()
        });

        // Вывод каждые 10 тиков
        if (this.tick % 10 === 0) {
            console.log(`🧬 T${this.tick} | E:${world.entropy.toFixed(3)} W:${world.wars} N:${world.entities}`);
        }
    }

    stop() {
        if (this.loop) {
            clearInterval(this.loop);
            this.loop = null;
        }
        this.started = false;
        console.log("🛑 Engine stopped");
    }

    getState() {
        return {
            started: this.started,
            tick: this.tick,
            memory: this.memory.load()
        };
    }
}

module.exports = Engine;
