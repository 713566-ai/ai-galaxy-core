#!/usr/bin/env node
// ============================================================
// 🔍 FULL SYSTEM DIAGNOSTIC v1.0
// ============================================================
// ✅ Проверка всех файлов
// ✅ Проверка всех ядер
// ✅ Проверка портов
// ✅ Проверка API
// ✅ Генерация отчёта
// ============================================================

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

class FullDiagnostic {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            files: { total: 0, coreFiles: [], otherFiles: [] },
            cores: { total: 0, active: [], inactive: [], byPort: {} },
            apis: { working: [], broken: [] },
            services: {},
            summary: { status: 'unknown', score: 0 }
        };
    }
    
    // ===============================
    // 1. ПРОВЕРКА ФАЙЛОВ
    // ===============================
    checkFiles() {
        console.log("\n📁 [1/5] ПРОВЕРКА ФАЙЛОВ...");
        
        const files = fs.readdirSync('.');
        this.results.files.total = files.length;
        
        // Ищем все core файлы
        const corePatterns = [
            /core-v\d+\.js$/,
            /core-v\d+-.*\.js$/,
            /.*-core\.js$/,
            /ultimate.*\.js$/,
            /swarm.*\.js$/,
            /game-builder\.js$/,
            /start-all\.js$/,
            /auto-publish\.js$/,
            /core-warfare\.js$/
        ];
        
        for (const file of files) {
            const stats = fs.statSync(file);
            let isCore = false;
            
            for (const pattern of corePatterns) {
                if (pattern.test(file)) {
                    isCore = true;
                    break;
                }
            }
            
            if (isCore || file.includes('core') || file.includes('game') || file.includes('swarm')) {
                this.results.files.coreFiles.push({
                    name: file,
                    size: (stats.size / 1024).toFixed(1) + ' KB',
                    modified: stats.mtime
                });
            } else if (file.endsWith('.js')) {
                this.results.files.otherFiles.push(file);
            }
        }
        
        console.log(`   ✅ Найдено JS файлов: ${files.filter(f => f.endsWith('.js')).length}`);
        console.log(`   ✅ Core файлов: ${this.results.files.coreFiles.length}`);
        console.log(`   📄 Основные ядра: ${this.results.files.coreFiles.map(f => f.name).join(', ')}`);
    }
    
    // ===============================
    // 2. ПРОВЕРКА ЗАПУЩЕННЫХ ПРОЦЕССОВ
    // ===============================
    async checkProcesses() {
        console.log("\n🔄 [2/5] ПРОВЕРКА ПРОЦЕССОВ...");
        
        return new Promise((resolve) => {
            exec('ps aux | grep node | grep -v grep', (err, stdout) => {
                const lines = stdout.split('\n').filter(l => l.trim());
                this.results.services.nodeProcesses = lines.length;
                
                // Ищем конкретные процессы
                const processes = {
                    'ultimate-game': false,
                    'game-build': false,
                    'swarm-master': false,
                    'core-warfare': false,
                    'start-all': false
                };
                
                for (const line of lines) {
                    if (line.includes('ultimate-game')) processes['ultimate-game'] = true;
                    if (line.includes('game-build')) processes['game-build'] = true;
                    if (line.includes('swarm-master')) processes['swarm-master'] = true;
                    if (line.includes('core-warfare')) processes['core-warfare'] = true;
                    if (line.includes('start-all')) processes['start-all'] = true;
                }
                
                this.results.services = processes;
                
                console.log(`   ✅ Node процессов: ${lines.length}`);
                console.log(`   🌌 Ultimate Game: ${processes['ultimate-game'] ? '✅' : '❌'}`);
                console.log(`   🎮 Game Build: ${processes['game-build'] ? '✅' : '❌'}`);
                console.log(`   🔗 Swarm Master: ${processes['swarm-master'] ? '✅' : '❌'}`);
                console.log(`   🔥 Core Warfare: ${processes['core-warfare'] ? '✅' : '❌'}`);
                
                resolve();
            });
        });
    }
    
    // ===============================
    // 3. ПРОВЕРКА ПОРТОВ И ЯДЕР
    // ===============================
    async checkPorts() {
        console.log("\n🌐 [3/5] ПРОВЕРКА ПОРТОВ И ЯДЕР...");
        
        const portsToCheck = [3000, 3001, 3002, 3100, 3101, 3102, 3103, 3104, 3105, 3200, 3201, 3202];
        const endpoints = ['/api/status', '/api/ping', '/'];
        
        for (const port of portsToCheck) {
            let found = false;
            let response = null;
            
            for (const endpoint of endpoints) {
                const result = await this.checkPort(port, endpoint);
                if (result) {
                    found = true;
                    response = result;
                    break;
                }
            }
            
            if (found) {
                const coreName = response.coreId || response.nodeId || response.name || `core-${port}`;
                this.results.cores.active.push({
                    port,
                    name: coreName,
                    tick: response.tick || 0,
                    entropy: response.entropy || 0.5,
                    strength: response.strength,
                    resources: response.resources,
                    agents: response.agents?.length || response.agentsCount || 0,
                    warsWon: response.warsWon || 0
                });
                this.results.cores.byPort[port] = 'active';
                console.log(`   ✅ Порт ${port}: ${coreName} (тик:${response.tick || 0})`);
            } else {
                this.results.cores.inactive.push(port);
                this.results.cores.byPort[port] = 'inactive';
                console.log(`   ❌ Порт ${port}: не отвечает`);
            }
        }
        
        this.results.cores.total = portsToCheck.length;
        console.log(`\n   📊 ИТОГО: ${this.results.cores.active.length} активных / ${this.results.cores.inactive.length} неактивных`);
    }
    
    checkPort(port, endpoint) {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${port}${endpoint}`, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch(e) {
                        resolve(null);
                    }
                });
            });
            req.setTimeout(1000, () => {
                req.destroy();
                resolve(null);
            });
            req.on('error', () => resolve(null));
        });
    }
    
    // ===============================
    // 4. ПРОВЕРКА API
    // ===============================
    async checkAPIs() {
        console.log("\n🔌 [4/5] ПРОВЕРКА API...");
        
        const apis = [
            { name: 'Основная вселенная', url: 'http://localhost:3000/api/status', port: 3000 },
            { name: 'Готовая игра', url: 'http://localhost:3001/api/status', port: 3001 },
            { name: 'Swarm Master', url: 'http://localhost:3002/api/swarm/status', port: 3002 },
            { name: 'Core 3100', url: 'http://localhost:3100/api/status', port: 3100 },
            { name: 'Core 3101', url: 'http://localhost:3101/api/status', port: 3101 },
            { name: 'Core 3102', url: 'http://localhost:3102/api/status', port: 3102 },
            { name: 'Core Warfare 3103', url: 'http://localhost:3103/api/status', port: 3103 },
            { name: 'Core Warfare 3104', url: 'http://localhost:3104/api/status', port: 3104 }
        ];
        
        for (const api of apis) {
            const result = await this.checkEndpoint(api.url);
            if (result) {
                this.results.apis.working.push(api.name);
                console.log(`   ✅ ${api.name} (порт ${api.port})`);
            } else {
                this.results.apis.broken.push(api.name);
                console.log(`   ❌ ${api.name} (порт ${api.port})`);
            }
        }
    }
    
    checkEndpoint(url) {
        return new Promise((resolve) => {
            const req = http.get(url, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => {
                    try {
                        JSON.parse(data);
                        resolve(true);
                    } catch(e) {
                        resolve(false);
                    }
                });
            });
            req.setTimeout(2000, () => {
                req.destroy();
                resolve(false);
            });
            req.on('error', () => resolve(false));
        });
    }
    
    // ===============================
    // 5. ГЕНЕРАЦИЯ ОТЧЁТА
    // ===============================
    generateReport() {
        console.log("\n📊 [5/5] ГЕНЕРАЦИЯ ОТЧЁТА...");
        
        // Подсчёт очков
        let score = 0;
        score += this.results.cores.active.length * 10;
        score += this.results.apis.working.length * 5;
        score += this.results.services['ultimate-game'] ? 20 : 0;
        score += this.results.services['core-warfare'] ? 20 : 0;
        
        this.results.summary.score = score;
        if (score >= 80) this.results.summary.status = '🟢 ОТЛИЧНО';
        else if (score >= 50) this.results.summary.status = '🟡 СРЕДНЕ';
        else this.results.summary.status = '🔴 ПЛОХО';
        
        // Сохраняем отчёт
        const reportPath = path.join(process.cwd(), 'diagnostic-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        
        console.log(`   ✅ Отчёт сохранён: ${reportPath}`);
        
        // Вывод итогов
        console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
        console.log("║   🔍 РЕЗУЛЬТАТЫ ДИАГНОСТИКИ                                               ║");
        console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
        
        console.log("\n📁 ФАЙЛЫ:");
        console.log(`   Всего JS файлов: ${this.results.files.coreFiles.length + this.results.files.otherFiles.length}`);
        console.log(`   Core файлы: ${this.results.files.coreFiles.length}`);
        this.results.files.coreFiles.forEach(f => console.log(`      - ${f.name} (${f.size})`));
        
        console.log("\n🔥 ЯДРА:");
        console.log(`   Активных: ${this.results.cores.active.length}/${this.results.cores.total}`);
        this.results.cores.active.forEach(c => {
            console.log(`      ✅ Порт ${c.port}: ${c.name} | тик:${c.tick} | сила:${c.strength || '?'} | агенты:${c.agents}`);
        });
        if (this.results.cores.inactive.length > 0) {
            console.log(`   Неактивные порты: ${this.results.cores.inactive.join(', ')}`);
        }
        
        console.log("\n🔌 API:");
        console.log(`   Работают: ${this.results.apis.working.length}/${this.results.apis.working.length + this.results.apis.broken.length}`);
        this.results.apis.working.forEach(api => console.log(`      ✅ ${api}`));
        
        console.log("\n🔄 ПРОЦЕССЫ:");
        console.log(`   Ultimate Game: ${this.results.services['ultimate-game'] ? '✅' : '❌'}`);
        console.log(`   Core Warfare: ${this.results.services['core-warfare'] ? '✅' : '❌'}`);
        console.log(`   Game Build: ${this.results.services['game-build'] ? '✅' : '❌'}`);
        console.log(`   Swarm Master: ${this.results.services['swarm-master'] ? '✅' : '❌'}`);
        
        console.log("\n📊 ОБЩАЯ ОЦЕНКА:");
        console.log(`   Очки: ${score}/100`);
        console.log(`   Статус: ${this.results.summary.status}`);
        
        console.log("\n💡 РЕКОМЕНДАЦИИ:");
        if (this.results.cores.inactive.length > 0) {
            console.log(`   • Запустите неактивные ядра: node core-warfare.js`);
        }
        if (!this.results.services['core-warfare']) {
            console.log(`   • Запустите войну ядер: node core-warfare.js`);
        }
        if (!this.results.services['ultimate-game']) {
            console.log(`   • Запустите основную вселенную: node start-all.js`);
        }
        
        console.log("\n");
    }
    
    async run() {
        console.log("\n╔═══════════════════════════════════════════════════════════════════════════╗");
        console.log("║   🔍 FULL SYSTEM DIAGNOSTIC v1.0                                          ║");
        console.log("╚═══════════════════════════════════════════════════════════════════════════╝");
        
        this.checkFiles();
        await this.checkProcesses();
        await this.checkPorts();
        await this.checkAPIs();
        this.generateReport();
    }
}

// ЗАПУСК
const diagnostic = new FullDiagnostic();
diagnostic.run();
