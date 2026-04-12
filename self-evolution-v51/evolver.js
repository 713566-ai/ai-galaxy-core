const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Sandbox = require('./sandbox');
const PatchEngine = require('./patch-engine');

class V51Evolver {
    constructor() {
        this.sandbox = new Sandbox();
        this.patchEngine = new PatchEngine();
        this.corePath = path.join(__dirname, '../..');
        this.version = 51;
        this.evolutionLog = [];
        
        // Git init если нет
        try {
            execSync('git status', { cwd: this.corePath });
        } catch(e) {
            execSync('git init', { cwd: this.corePath });
            execSync('git add .', { cwd: this.corePath });
            execSync('git commit -m "V50 base core"', { cwd: this.corePath });
        }
    }

    analyzeCode() {
        const files = fs.readdirSync(this.corePath).filter(f => f.endsWith('.js'));
        const stats = {};
        files.forEach(file => {
            const content = fs.readFileSync(path.join(this.corePath, file), 'utf8');
            stats[file] = {
                lines: content.split('\n').length,
                functions: (content.match(/function\s+\w+/g) || []).length,
                apis: (content.match(/app\.(get|post|put|delete)/g) || []).length
            };
        });
        return stats;
    }

    async generateAndTestModule(name, code) {
        // 1. Сохраняем в песочницу
        const sandboxPath = path.join(this.corePath, 'sandbox', `${name}.js`);
        fs.writeFileSync(sandboxPath, code);
        
        // 2. Тестируем
        const testResult = await this.sandbox.testModule(sandboxPath);
        
        if (!testResult) {
            console.log(`❌ Модуль ${name} не прошёл тест`);
            fs.unlinkSync(sandboxPath);
            return false;
        }
        
        // 3. Генерируем патч
        const targetPath = path.join(this.corePath, 'modules', `${name}.js`);
        const patch = this.patchEngine.generatePatch(targetPath, code);
        
        if (patch.hasChanges) {
            // 4. Применяем патч
            this.patchEngine.applyPatch(targetPath, patch.patchFile);
            console.log(`✅ Модуль ${name} протестирован и интегрирован`);
        }
        
        this.sandbox.cleanup();
        return true;
    }

    async evolve() {
        console.log('\n🧬 V51 СТАБИЛЬНАЯ ЭВОЛЮЦИЯ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        const analysis = this.analyzeCode();
        
        // Создаём тестовый модуль
        const testModuleCode = `
class TestModule {
    constructor() {
        console.log('✅ Test module initialized');
    }
    
    async process(data) {
        return { status: 'ok', data };
    }
}

module.exports = TestModule;
        `;
        
        const success = await this.generateAndTestModule('test-module', testModuleCode);
        
        if (success) {
            // Коммитим изменения
            execSync('git add .', { cwd: this.corePath });
            execSync('git commit -m "V51 evolution step"', { cwd: this.corePath });
            console.log('💾 Изменения закоммичены в Git');
        }
        
        this.evolutionLog.push({
            timestamp: Date.now(),
            success,
            version: this.version++,
            analysis
        });
        
        return { success, version: this.version, analysis };
    }

    rollback() {
        try {
            execSync('git reset --hard HEAD~1', { cwd: this.corePath });
            console.log('🔄 Откат к предыдущей версии');
            return true;
        } catch(e) {
            console.log('❌ Не удалось откатить');
            return false;
        }
    }
}

module.exports = V51Evolver;
