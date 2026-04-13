#!/usr/bin/env node
// ============================================================
// 🔧 V128 - FULL SYSTEM PATCH & AUTO-RECOVERY
// ============================================================
// ✅ Полный перезапуск всех систем
// ✅ Авто-восстановление после падения
// ✅ Сохранение состояния
// ✅ Graceful shutdown
// ============================================================

const { spawn, exec } = require("child_process");
const fs = require("fs");
const path = require("path");

class SystemPatcher {
    constructor() {
        this.services = {
            'swarm-master': { port: 3003, file: 'swarm-v127.js', status: false, pid: null },
            'simple-core': { port: 3000, file: 'simple-core.js', status: false, pid: null },
            'game-server': { port: 3001, file: 'game-build/server.js', status: false, pid: null },
            'revive-engine': { port: null, file: 'revive.js', status: false, pid: null }
        };
        
        this.warfareCores = [];
        this.stateFile = path.join(process.cwd(), 'system-state.json');
        this.isShuttingDown = false;
    }
    
    // ===============================
    // СОХРАНЕНИЕ СОСТОЯНИЯ
    // ===============================
    saveState() {
        const state = {
            timestamp: Date.now(),
            services: this.services,
            warfareCores: this.warfareCores,
            systemUptime: process.uptime()
        };
        fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
        console.log(`💾 [STATE] Сохранено в ${this.stateFile}`);
    }
    
    loadState() {
        try {
            if (fs.existsSync(this.stateFile)) {
                const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
                console.log(`📂 [STATE] Загружено состояние от ${new Date(state.timestamp).toLocaleTimeString()}`);
                return state;
            }
        } catch(e) {}
        return null;
    }
    
    // ===============================
    // ПРОВЕРКА ЗАНЯТОСТИ ПОРТА
    // ===============================
    isPortInUse(port) {
        try {
            const result = exec(`lsof -i :${port} 2>/dev/null | grep LISTEN`, { timeout: 1000 });
            return result.stdout.length > 0;
        } catch(e) {
            return false;
        }
    }
    
    // ===============================
    // УБИВАЕМ ВСЕ ПРОЦЕССЫ (GRACEFUL)
    // ===============================
    async killAllProcesses() {
        console.log("\n🛑 [SHUTDOWN] Остановка всех процессов...");
        this.isShuttingDown = true;
        
        // Сначала SIGTERM (graceful)
        exec('pkill -f "node" 2>/dev/null || true', (err) => {});
        
        // Ждём 3 секунды
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Затем SIGKILL (force)
        exec('pkill -9 -f "node" 2>/dev/null || true', (err) => {});
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log("✅ [SHUTDOWN] Все процессы остановлены");
        this.isShuttingDown = false;
    }
    
    // ===============================
    // ЗАПУСК ОТДЕЛЬНОГО СЕРВИСА
    // ===============================
    startService(name, service) {
        return new Promise((resolve) => {
            if (!service.file || !fs.existsSync(service.file)) {
                console.log(`⚠️ [${name}] Файл не найден: ${service.file}`);
                resolve(false);
                return;
            }
            
            // Проверяем порт
            if (service.port && this.isPortInUse(service.port)) {
                console.log(`⚠️ [${name}] Порт ${service.port} уже занят`);
                resolve(false);
                return;
            }
            
            console.log(`🚀 [${name}] Запуск...`);
            
            let child;
            if (name === 'game-server') {
                child = spawn("node", [service.file], {
                    cwd: path.dirname(service.file),
                    env: { ...process.env, PORT: service.port },
                    detached: false,
                    stdio: "pipe"
                });
            } else {
                child = spawn("node", [service.file], {
                    detached: false,
                    stdio: "pipe"
                });
            }
            
            child.stdout.on("data", (data) => {
                const msg = data.toString().trim();
                if (msg && !msg.includes("⚠️")) {
                    console.log(`   [${name}] ${msg.slice(0, 80)}`);
                }
            });
            
            child.stderr.on("data", (data) => {
                const msg = data.toString();
                if (!msg.includes("EADDRINUSE") && !msg.includes("deprecated")) {
                    console.log(`   ⚠️ [${name}] ${msg.slice(0, 80)}`);
                }
            });
            
            child.on("exit", (code) => {
                if (!this.isShuttingDown) {
                    console.log(`💀 [${name}] Упал (код ${code}), перезапуск через 2 сек...`);
                    setTimeout(() => this.startService(name, service), 2000);
                }
                service.status = false;
                service.pid = null;
            });
            
            service.status = true;
            service.pid = child.pid;
            this.services[name] = service;
            
            setTimeout(() => resolve(true), 1000);
        });
    }
    
    // ===============================
    // ЗАПУСК ВСЕХ СЕРВИСОВ
    // ===============================
    async startAllServices() {
        console.log("\n🔧 [START] Запуск всех сервисов...\n");
        
        // Порядок важен!
        const order = ['swarm-master', 'simple-core', 'game-server', 'revive-engine'];
        
        for (const name of order) {
            await this.startService(name, this.services[name]);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log("\n✅ [START] Все сервисы запущены!");
        this.saveState();
    }
    
    // ===============================
    // ПРОВЕРКА ЗДОРОВЬЯ
    // ===============================
    async healthCheck() {
        const http = require('http');
        const endpoints = [
            { name: 'Swarm Master', url: 'http://127.0.0.1:3003/api/status', port: 3003 },
            { name: 'Основная вселенная', url: 'http://127.0.0.1:3000/api/ping', port: 3000 },
            { name: 'Игра', url: 'http://127.0.0.1:3001/api/ping', port: 3001 }
        ];
        
        let allHealthy = true;
        
        for (const ep of endpoints) {
            const result = await this.checkEndpoint(ep.url);
            if (result) {
                console.log(`✅ [HEALTH] ${ep.name} (${ep.port}) - OK`);
            } else {
                console.log(`❌ [HEALTH] ${ep.name} (${ep.port}) - DOWN`);
                allHealthy = false;
            }
        }
        
        return allHealthy;
    }
    
    checkEndpoint(url) {
        return new Promise((resolve) => {
            const http = require('http');
            const req = http.get(url, (res) => {
                resolve(res.statusCode === 200);
            });
            req.setTimeout(3000, () => {
                req.destroy();
                resolve(false);
            });
            req.on('error', () => resolve(false));
        });
    }
    
    // ===============================
    // ПОЛНЫЙ РЕСТАРТ
    // ===============================
    async fullRestart() {
        console.log("\n🔄 [RESTART] Инициирован полный перезапуск...");
        
        // Сохраняем состояние перед перезапуском
        this.saveState();
        
        // Убиваем всё
        await this.killAllProcesses();
        
        // Ждём освобождения портов
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Запускаем заново
        await this.startAllServices();
        
        // Проверяем здоровье
        const healthy = await this.healthCheck();
        
        if (healthy) {
            console.log("\n✅ [RESTART] Система полностью восстановлена!");
        } else {
            console.log("\n⚠️ [RESTART] Некоторые сервисы не отвечают, повторный рестарт через 10 сек...");
            setTimeout(() => this.fullRestart(), 10000);
        }
    }
    
    // ===============================
    // МОНИТОРИНГ (AUTO-HEAL)
    // ===============================
    startMonitoring() {
        setInterval(async () => {
            if (!this.isShuttingDown) {
                const healthy = await this.healthCheck();
                if (!healthy) {
                    console.log("\n🚨 [ALERT] Обнаружены проблемы! Запуск auto-heal...");
                    await this.fullRestart();
                }
            }
        }, 30000); // Каждые 30 секунд
    }
    
    // ===============================
    // ЗАПУСК
    // ===============================
    async run() {
        console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
        console.log("║   🔧 V128 - FULL SYSTEM PATCH & AUTO-RECOVERY                             ║");
        console.log("║   ✅ Полный перезапуск | ✅ Авто-восстановление | ✅ Graceful shutdown     ║");
        console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
        
        // Загружаем предыдущее состояние
        const prevState = this.loadState();
        
        // Запускаем сервисы
        await this.startAllServices();
        
        // Запускаем мониторинг
        this.startMonitoring();
        
        // Graceful shutdown
        process.on("SIGINT", async () => {
            console.log("\n🛑 Получен сигнал завершения...");
            await this.killAllProcesses();
            console.log("👋 Система остановлена");
            process.exit(0);
        });
        
        console.log("\n🔧 System Patcher активен! Мониторинг каждые 30 секунд.");
        console.log("   Для полного рестарта: node system-patch.js --restart");
    }
}

// ===============================
// ЗАПУСК С ПАРАМЕТРАМИ
// ===============================
const patcher = new SystemPatcher();

if (process.argv.includes('--restart')) {
    patcher.fullRestart();
} else if (process.argv.includes('--kill')) {
    patcher.killAllProcesses();
} else {
    patcher.run();
}
