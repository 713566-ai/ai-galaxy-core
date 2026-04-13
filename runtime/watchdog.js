const { spawn } = require("child_process");
const fs = require("fs");

class Watchdog {
    constructor(scriptPath, options = {}) {
        this.scriptPath = scriptPath;
        this.checkInterval = options.checkInterval || 3000;
        this.maxRestarts = options.maxRestarts || 10;
        this.restartWindow = options.restartWindow || 60000;
        this.child = null;
        this.running = false;
        this.crashCount = 0;
        this.crashTimestamps = [];
        this.healthCheckUrl = options.healthCheckUrl || "http://localhost:3000/api/health";
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.launch();
        
        this.monitor = setInterval(() => this.check(), this.checkInterval);
        console.log(`🛡 WATCHDOG STARTED (interval=${this.checkInterval}ms)`);
    }

    launch() {
        console.log("🚀 Launching engine...");
        this.child = spawn("node", [this.scriptPath], {
            stdio: "inherit",
            env: process.env,
            detached: false
        });

        this.child.on("exit", (code, signal) => {
            console.log(`⚠️ Engine exited: code=${code}, signal=${signal}`);
            this.handleCrash();
        });

        this.child.on("error", (err) => {
            console.log(`❌ Engine error: ${err.message}`);
        });
    }

    handleCrash() {
        const now = Date.now();
        this.crashTimestamps.push(now);
        this.crashCount++;
        
        // Очищаем старые записи
        this.crashTimestamps = this.crashTimestamps.filter(ts => now - ts < this.restartWindow);
        
        // Проверка на слишком частые рестарты
        if (this.crashTimestamps.length > this.maxRestarts) {
            console.log(`🛑 TOO MANY CRASHES (${this.crashCount}) in ${this.restartWindow}ms. Stopping watchdog.`);
            this.stop();
            return;
        }
        
        // Автоматический перезапуск
        const delay = Math.min(1000 * this.crashCount, 10000);
        console.log(`🔄 Auto-restarting engine in ${delay}ms (crash #${this.crashCount})`);
        
        setTimeout(() => {
            if (this.running) {
                this.launch();
            }
        }, delay);
    }

    async check() {
        if (!this.child || this.child.killed || this.child.exitCode !== null) {
            console.log("🛡 WATCHDOG: Engine not running, restarting...");
            this.launch();
            return;
        }
        
        // Health check через HTTP
        try {
            const fetch = await import('node-fetch');
            const response = await fetch.default(this.healthCheckUrl, { timeout: 2000 });
            if (!response.ok) {
                console.log(`🛡 WATCHDOG: Health check failed (${response.status}), restarting...`);
                this.child.kill();
            }
        } catch (e) {
            // Если health check не работает, но процесс жив — возможно OK
            if (this.child && this.child.exitCode === null) {
                // Процесс жив, просто логируем
                // console.log(`⚠️ Health check error: ${e.message}`);
            }
        }
    }

    stop() {
        this.running = false;
        if (this.monitor) clearInterval(this.monitor);
        if (this.child) {
            this.child.kill('SIGTERM');
            setTimeout(() => {
                if (this.child && !this.child.killed) {
                    this.child.kill('SIGKILL');
                }
            }, 3000);
        }
        console.log("🛡 WATCHDOG STOPPED");
    }

    getStats() {
        return {
            running: this.running,
            crashCount: this.crashCount,
            crashesInWindow: this.crashTimestamps.length,
            pid: this.child?.pid || null,
            uptime: this.child ? Date.now() - this.child.spawnTime : 0
        };
    }
}

module.exports = Watchdog;
