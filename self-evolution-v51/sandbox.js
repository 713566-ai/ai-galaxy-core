const fs = require('fs');
const path = require('path');
const { VM } = require('vm2');

class Sandbox {
    constructor() {
        this.sandboxPath = path.join(__dirname, '../../sandbox');
        if (!fs.existsSync(this.sandboxPath)) fs.mkdirSync(this.sandboxPath, { recursive: true });
    }

    async testModule(modulePath) {
        try {
            // Очищаем кэш
            delete require.cache[require.resolve(modulePath)];
            const mod = require(modulePath);
            const instance = new mod();
            
            // Тестовый вызов
            const result = await instance.process({ test: true });
            return result && result.status === 'ok';
        } catch (e) {
            console.log(`❌ Тест провален: ${e.message}`);
            return false;
        }
    }

    async runInSandbox(code, context = {}) {
        const vm = new VM({
            timeout: 3000,
            sandbox: { ...context, console: { log: (...args) => console.log('[sandbox]', ...args) } }
        });
        try {
            const result = vm.run(code);
            return { success: true, result };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    cleanup() {
        const files = fs.readdirSync(this.sandboxPath);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                fs.unlinkSync(path.join(this.sandboxPath, file));
            }
        });
    }
}

module.exports = Sandbox;
