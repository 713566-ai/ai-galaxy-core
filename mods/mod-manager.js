const fs = require('fs');
const path = require('path');

const MODS_DIR = path.join(__dirname, 'mods');
const ACTIVE_MODS_FILE = path.join(MODS_DIR, 'active-mods.json');

class ModManager {
    constructor() {
        this.mods = [];
        this.activeMods = [];
        this.loadMods();
    }

    // Загрузка всех модов
    loadMods() {
        if (!fs.existsSync(MODS_DIR)) {
            fs.mkdirSync(MODS_DIR, { recursive: true });
        }
        
        const folders = fs.readdirSync(MODS_DIR);
        this.mods = folders.filter(f => {
            const modPath = path.join(MODS_DIR, f);
            return fs.statSync(modPath).isDirectory() && fs.existsSync(path.join(modPath, 'mod.json'));
        }).map(f => {
            const config = JSON.parse(fs.readFileSync(path.join(MODS_DIR, f, 'mod.json'), 'utf8'));
            return { id: f, name: config.name, version: config.version, author: config.author, enabled: false };
        });
        
        if (fs.existsSync(ACTIVE_MODS_FILE)) {
            const active = JSON.parse(fs.readFileSync(ACTIVE_MODS_FILE, 'utf8'));
            this.activeMods = active;
            this.mods.forEach(m => { m.enabled = active.includes(m.id); });
        }
    }

    // Включение мода
    enableMod(modId) {
        const mod = this.mods.find(m => m.id === modId);
        if (!mod) return false;
        if (!this.activeMods.includes(modId)) {
            this.activeMods.push(modId);
            mod.enabled = true;
            this.save();
            this.applyMod(modId);
        }
        return true;
    }

    // Выключение мода
    disableMod(modId) {
        const mod = this.mods.find(m => m.id === modId);
        if (!mod) return false;
        this.activeMods = this.activeMods.filter(id => id !== modId);
        mod.enabled = false;
        this.save();
        this.removeMod(modId);
        return true;
    }

    // Применение мода
    applyMod(modId) {
        const modPath = path.join(MODS_DIR, modId);
        const scriptsPath = path.join(modPath, 'scripts');
        const assetsPath = path.join(modPath, 'assets');
        
        // Копирование скриптов
        if (fs.existsSync(scriptsPath)) {
            const scripts = fs.readdirSync(scriptsPath);
            scripts.forEach(script => {
                const dest = path.join(__dirname, '../', script);
                fs.copyFileSync(path.join(scriptsPath, script), dest);
                console.log(`📦 Мод ${modId}: установлен скрипт ${script}`);
            });
        }
        
        // Копирование ассетов
        if (fs.existsSync(assetsPath)) {
            const assets = fs.readdirSync(assetsPath);
            assets.forEach(asset => {
                const dest = path.join(__dirname, '../public/assets/', asset);
                if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), { recursive: true });
                fs.copyFileSync(path.join(assetsPath, asset), dest);
                console.log(`📦 Мод ${modId}: установлен ассет ${asset}`);
            });
        }
        
        // Выполнение скрипта инициализации
        const initScript = path.join(modPath, 'init.js');
        if (fs.existsSync(initScript)) {
            require(initScript);
            console.log(`📦 Мод ${modId}: выполнен init.js`);
        }
    }

    // Удаление мода
    removeMod(modId) {
        // Здесь логика удаления файлов мода
        console.log(`🗑️ Мод ${modId} отключён`);
    }

    save() {
        fs.writeFileSync(ACTIVE_MODS_FILE, JSON.stringify(this.activeMods, null, 2));
    }

    getMods() {
        return this.mods;
    }

    getActiveMods() {
        return this.activeMods;
    }
}

module.exports = ModManager;
