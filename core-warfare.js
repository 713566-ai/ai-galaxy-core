#!/usr/bin/env node
// ============================================================
// 🔥 V126-V128: INTER-CORE WARFARE & SELF-EVOLUTION
// ============================================================
// ✅ V126: Передача агентов, миграция, конфликты
// ✅ V127: Война ядер, подавление, захват
// ✅ V128: Самоэволюция, новые типы, переписывание правил
// ============================================================

const express = require("express");
const http = require("http");
const crypto = require("crypto");

class CoreWarfare {
    constructor(coreId, port) {
        this.coreId = coreId;
        this.port = port;
        this.app = express();
        this.app.use(express.json());
        
        // Состояние ядра
        this.state = {
            tick: 0,
            entropy: 0.5,
            strength: 0.7,        // Сила ядра (для войн)
            resources: 100,        // Ресурсы
            agents: this.generateAgents(),
            enemies: [],           // Вражеские ядра
            allies: [],            // Союзники
            evolutionLevel: 1,     // Уровень эволюции
            capturedAgents: 0,
            warsWon: 0,
            rules: this.getDefaultRules()
        };
        
        this.setupAPI();
        this.startLoop();
        this.startServer();
    }
    
    generateAgents() {
        const agentTypes = ['warrior', 'merchant', 'scientist', 'diplomat', 'spy'];
        const agents = [];
        for (let i = 0; i < 5; i++) {
            agents.push({
                id: crypto.randomBytes(4).toString('hex'),
                type: agentTypes[Math.floor(Math.random() * agentTypes.length)],
                power: Math.random() * 100,
                loyalty: this.coreId,
                experience: 0,
                special: null
            });
        }
        return agents;
    }
    
    getDefaultRules() {
        return {
            migrationEnabled: true,
            warfareEnabled: true,
            evolutionEnabled: true,
            agentCap: 10,
            resourceGrowth: 1.1
        };
    }
    
    // ===============================
    // V126: INTER-CORE COMMUNICATION
    // ===============================
    async migrateAgent(agentId, targetCore) {
        const agent = this.state.agents.find(a => a.id === agentId);
        if (!agent) return false;
        
        console.log(`🔄 [${this.coreId}] Миграция агента ${agent.type} → ${targetCore}`);
        
        // Отправляем агента в другое ядро
        const res = await this.sendToCore(targetCore, '/api/receive-agent', agent);
        if (res) {
            this.state.agents = this.state.agents.filter(a => a.id !== agentId);
            this.state.resources -= 10;
            return true;
        }
        return false;
    }
    
    async syncEntropy(targetCore) {
        const res = await this.sendToCore(targetCore, '/api/sync-entropy', {
            entropy: this.state.entropy,
            from: this.coreId
        });
        if (res && res.entropy) {
            this.state.entropy = (this.state.entropy + res.entropy) / 2;
            console.log(`🔄 [${this.coreId}] Синхронизация энтропии: ${this.state.entropy.toFixed(3)}`);
        }
    }
    
    // ===============================
    // V127: CORE WARFARE
    // ===============================
    async declareWar(targetCore) {
        console.log(`⚔️ [${this.coreId}] ОБЪЯВЛЕНИЕ ВОЙНЫ ${targetCore}!`);
        
        // Проверяем силу
        const targetInfo = await this.sendToCore(targetCore, '/api/core-info');
        if (!targetInfo) return false;
        
        // Битва
        const myPower = this.state.strength * this.state.resources;
        const enemyPower = targetInfo.strength * targetInfo.resources;
        
        if (myPower > enemyPower) {
            // Победа!
            const capturedAgents = await this.sendToCore(targetCore, '/api/surrender', {
                winner: this.coreId,
                loot: Math.floor(enemyPower / 10)
            });
            
            if (capturedAgents) {
                this.state.capturedAgents += capturedAgents.length || 1;
                this.state.resources += Math.floor(enemyPower / 10);
                this.state.warsWon++;
                console.log(`🏆 [${this.coreId}] ПОБЕДА над ${targetCore}! Захвачено ресурсов!`);
            }
        } else {
            console.log(`💀 [${this.coreId}] ПОРАЖЕНИЕ от ${targetCore}`);
            this.state.resources -= 30;
        }
        
        this.state.enemies.push(targetCore);
        return true;
    }
    
    async suppressCore(targetCore) {
        console.log(`👑 [${this.coreId}] ПОДАВЛЕНИЕ ${targetCore}...`);
        
        // Постоянное подавление
        const result = await this.sendToCore(targetCore, '/api/suppress', {
            suppressor: this.coreId,
            duration: 60000
        });
        
        if (result) {
            console.log(`🔒 [${this.coreId}] Ядро ${targetCore} подавлено на 60 секунд`);
        }
    }
    
    // ===============================
    // V128: SELF-EVOLUTION
    // ===============================
    evolve() {
        if (!this.state.rules.evolutionEnabled) return;
        
        console.log(`🧬 [${this.coreId}] ЭВОЛЮЦИЯ...`);
        
        this.state.evolutionLevel++;
        
        // Создаём новый тип агента
        const newTypes = ['god', 'demon', 'angel', 'undead', 'mutant'];
        const newType = newTypes[Math.floor(Math.random() * newTypes.length)];
        
        const newAgent = {
            id: crypto.randomBytes(4).toString('hex'),
            type: newType,
            power: 100 + this.state.evolutionLevel * 10,
            loyalty: this.coreId,
            experience: 0,
            special: `evolved_at_tick_${this.state.tick}`,
            evolutionLevel: this.state.evolutionLevel
        };
        
        this.state.agents.push(newAgent);
        console.log(`✨ [${this.coreId}] НОВЫЙ ТИП АГЕНТА: ${newType} (сила ${newAgent.power})`);
        
        // Переписываем правила
        this.mutateRules();
    }
    
    mutateRules() {
        const mutations = [
            () => { this.state.rules.agentCap += 2; console.log(`📈 Лимит агентов: ${this.state.rules.agentCap}`); },
            () => { this.state.rules.resourceGrowth += 0.1; console.log(`📈 Рост ресурсов: ${this.state.rules.resourceGrowth}`); },
            () => { this.state.strength += 0.05; console.log(`💪 Сила ядра: ${this.state.strength.toFixed(2)}`); },
            () => { this.state.rules.migrationEnabled = !this.state.rules.migrationEnabled; console.log(`🔄 Миграция: ${this.state.rules.migrationEnabled}`); }
        ];
        
        const mutation = mutations[Math.floor(Math.random() * mutations.length)];
        mutation();
    }
    
    // ===============================
    // API
    // ===============================
    setupAPI() {
        // Получить статус
        this.app.get("/api/status", (req, res) => {
            res.json({
                coreId: this.coreId,
                port: this.port,
                tick: this.state.tick,
                entropy: this.state.entropy,
                strength: this.state.strength,
                resources: this.state.resources,
                agents: this.state.agents.length,
                evolutionLevel: this.state.evolutionLevel,
                warsWon: this.state.warsWon,
                capturedAgents: this.state.capturedAgents
            });
        });
        
        // Получить агентов
        this.app.get("/api/agents", (req, res) => {
            res.json(this.state.agents);
        });
        
        // Получить информацию о ядре (для войны)
        this.app.get("/api/core-info", (req, res) => {
            res.json({
                coreId: this.coreId,
                strength: this.state.strength,
                resources: this.state.resources,
                agentsCount: this.state.agents.length,
                evolutionLevel: this.state.evolutionLevel
            });
        });
        
        // Принять агента (миграция)
        this.app.post("/api/receive-agent", (req, res) => {
            const agent = req.body;
            if (this.state.agents.length < this.state.rules.agentCap) {
                agent.loyalty = this.coreId;
                this.state.agents.push(agent);
                console.log(`📥 [${this.coreId}] Принят агент ${agent.type} от ${agent.loyalty}`);
                res.json({ success: true });
            } else {
                res.json({ success: false, reason: "cap_reached" });
            }
        });
        
        // Синхронизация энтропии
        this.app.post("/api/sync-entropy", (req, res) => {
            const { entropy, from } = req.body;
            this.state.entropy = (this.state.entropy + entropy) / 2;
            res.json({ entropy: this.state.entropy });
        });
        
        // Сдаться (война)
        this.app.post("/api/surrender", (req, res) => {
            const { winner, loot } = req.body;
            const captured = this.state.agents.slice(0, Math.floor(this.state.agents.length / 2));
            this.state.agents = this.state.agents.slice(Math.floor(this.state.agents.length / 2));
            this.state.resources -= loot;
            res.json({ captured, resourcesLost: loot });
        });
        
        // Подавление
        this.app.post("/api/suppress", (req, res) => {
            const { suppressor, duration } = req.body;
            this.state.suppressed = { by: suppressor, until: Date.now() + duration };
            console.log(`🔒 [${this.coreId}] Подавлено ядром ${suppressor}`);
            res.json({ suppressed: true });
        });
        
        // Запустить эволюцию
        this.app.post("/api/evolve", (req, res) => {
            this.evolve();
            res.json({ evolutionLevel: this.state.evolutionLevel });
        });
        
        // Объявить войну (через API)
        this.app.post("/api/declare-war", async (req, res) => {
            const { target } = req.body;
            const result = await this.declareWar(target);
            res.json({ warDeclared: result });
        });
        
        // PING
        this.app.get("/api/ping", (req, res) => {
            res.json({ pong: true, coreId: this.coreId, tick: this.state.tick });
        });
    }
    
    // ===============================
    // ВСПОМОГАТЕЛЬНЫЕ
    // ===============================
    sendToCore(targetCore, endpoint, data = null) {
        return new Promise((resolve) => {
            const url = `http://127.0.0.1:${targetCore}${endpoint}`;
            const options = {
                method: data ? 'POST' : 'GET',
                headers: data ? { 'Content-Type': 'application/json' } : {}
            };
            
            const req = http.request(url, options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
                });
            });
            req.setTimeout(2000, () => { req.destroy(); resolve(null); });
            req.on('error', () => resolve(null));
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }
    
    // ===============================
    // ИГРОВОЙ ЦИКЛ
    // ===============================
    startLoop() {
        setInterval(async () => {
            this.state.tick++;
            this.state.entropy += (Math.random() - 0.5) * 0.02;
            this.state.entropy = Math.max(0.1, Math.min(0.9, this.state.entropy));
            
            // Рост ресурсов
            this.state.resources *= this.state.rules.resourceGrowth;
            this.state.resources = Math.min(500, this.state.resources);
            
            // Обновление силы
            this.state.strength = 0.5 + (this.state.resources / 500) * 0.3;
            
            // Каждые 30 тиков - эволюция
            if (this.state.tick % 30 === 0 && this.state.rules.evolutionEnabled) {
                this.evolve();
            }
            
            // Каждые 10 тиков - поиск врагов и война
            if (this.state.tick % 10 === 0 && this.state.rules.warfareEnabled) {
                // Ищем другие ядра (3100-3105)
                for (let port = 3100; port <= 3105; port++) {
                    if (port !== this.port) {
                        const info = await this.sendToCore(port, '/api/core-info');
                        if (info && info.strength < this.state.strength * 0.8) {
                            await this.declareWar(port);
                        }
                    }
                }
            }
            
            // Логирование
            if (this.state.tick % 20 === 0) {
                console.log(`\n🔥 [${this.coreId}:${this.port}] ТИК ${this.state.tick}`);
                console.log(`   Энтропия: ${this.state.entropy.toFixed(3)} | Сила: ${this.state.strength.toFixed(2)} | Ресурсы: ${Math.floor(this.state.resources)}`);
                console.log(`   Агенты: ${this.state.agents.length} | Эволюция: ${this.state.evolutionLevel} | Побед: ${this.state.warsWon}`);
            }
            
        }, 2000);
    }
    
    startServer() {
        this.app.listen(this.port, () => {
            console.log(`🔥 Core ${this.coreId} запущен на порту ${this.port}`);
        });
    }
}

// ===============================
// ЗАПУСК ВСЕХ ЯДЕР
// ===============================
const cores = [
    { id: "AURORA", port: 3100 },
    { id: "OBSIDIAN", port: 3101 },
    { id: "NEXUS", port: 3102 },
    { id: "VORTEX", port: 3103 },
    { id: "PHOENIX", port: 3104 }
];

console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║   🔥 V126-V128: CORE WARFARE & SELF-EVOLUTION                             ║");
console.log("║   ✅ V126: Миграция агентов | Синхронизация | Конфликты                   ║");
console.log("║   ✅ V127: Война ядер | Подавление | Захват агентов                       ║");
console.log("║   ✅ V128: Самоэволюция | Новые типы | Переписывание правил               ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝\n");

const instances = [];
for (const core of cores) {
    const instance = new CoreWarfare(core.id, core.port);
    instances.push(instance);
}

console.log("\n🔥 ВСЕ ЯДРА ЗАПУЩЕНЫ!");
console.log("   Начинается война и эволюция...\n");

// Обработка завершения
process.on("SIGINT", () => {
    console.log("\n💀 Остановка всех ядер...");
    process.exit();
});
