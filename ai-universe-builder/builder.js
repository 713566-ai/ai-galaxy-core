const axios = require('axios');
const fs = require('fs');
const path = require('path');

class UniverseBuilder {
    constructor() {
        this.modsPath = path.join(__dirname, '../mods');
        this.godCoreUrl = 'http://localhost:5400';
        this.aiCoreUrl = 'http://localhost:3000';
    }

    // Анализ существующих модов
    async analyzeMods() {
        const mods = [];
        const modFolders = fs.readdirSync(this.modsPath).filter(f => 
            fs.statSync(path.join(this.modsPath, f)).isDirectory()
        );
        
        for (const mod of modFolders) {
            const modJson = path.join(this.modsPath, mod, 'mod.json');
            if (fs.existsSync(modJson)) {
                const config = JSON.parse(fs.readFileSync(modJson, 'utf8'));
                mods.push({ id: mod, ...config });
            }
        }
        return mods;
    }

    // Получение текущего состояния вселенной
    async getUniverseState() {
        try {
            const res = await axios.get(`${this.godCoreUrl}/status`, { timeout: 3000 });
            return res.data;
        } catch(e) {
            return null;
        }
    }

    // Генерация новой фракции (на основе модов)
    generateFactionFromMods(mods) {
        const factions = [];
        mods.forEach(mod => {
            if (mod.features && mod.features.includes("Новые фракции")) {
                factions.push({
                    name: `${mod.name.split(' ')[0]} Empire`,
                    reputation: Math.random() * 2 - 1,
                    allies: [],
                    enemies: [],
                    homeSystem: `System-${Math.floor(Math.random() * 100)}`
                });
            }
        });
        return factions;
    }

    // Генерация PvP зон
    generatePVPZones() {
        return [
            { name: "Сигма-13", risk: "high", rewardMultiplier: 2.0 },
            { name: "Омикрон-Гамма", risk: "extreme", rewardMultiplier: 3.0 },
            { name: "Баффин", risk: "medium", rewardMultiplier: 1.5 },
            { name: "Торговая зона", risk: "low", rewardMultiplier: 1.2 },
            { name: "Нейтральная зона", risk: "medium", rewardMultiplier: 1.8 }
        ];
    }

    // Балансировка экономики
    balanceEconomy(universeState) {
        const entropy = universeState?.entropy || 0.5;
        const entities = universeState?.entities || 500;
        
        return {
            priceModifier: 1 + (entropy - 0.5) * 2,
            spawnRate: Math.min(100, Math.max(10, entities / 100)),
            taxRate: entropy > 0.7 ? 0.3 : 0.1
        };
    }

    // Создание нового мода на основе текущей вселенной
    async createModFromUniverse(name, description) {
        const universe = await this.getUniverseState();
        const modId = name.toLowerCase().replace(/ /g, '-');
        const modPath = path.join(this.modsPath, modId);
        
        if (fs.existsSync(modPath)) {
            return { error: 'Мод уже существует' };
        }
        
        fs.mkdirSync(modPath, { recursive: true });
        
        const modConfig = {
            name: name,
            version: "1.0.0",
            author: "AI Universe Builder",
            description: description,
            "freelancer-style": true,
            features: [
                universe?.entropy > 0.7 ? "Кризисная экономика" : "Стабильная экономика",
                universe?.entities > 1000 ? "Перенаселение" : "Нормальное население"
            ]
        };
        
        fs.writeFileSync(path.join(modPath, 'mod.json'), JSON.stringify(modConfig, null, 2));
        fs.writeFileSync(path.join(modPath, 'init.js'), `
console.log('🎮 Мод ${name} активирован!');
console.log('🌌 Создан на основе вселенной с энтропией ${universe?.entropy || 0.5}');
        `);
        
        return { success: true, modId, path: modPath };
    }

    // Основной цикл строительства вселенной
    async build() {
        console.log('🧠 AI Universe Builder: начинаю анализ...');
        
        const mods = await this.analyzeMods();
        const universe = await this.getUniverseState();
        
        console.log(`📊 Найдено модов: ${mods.length}`);
        console.log(`🌌 Энтропия вселенной: ${universe?.entropy || 0.5}`);
        
        // Генерация контента
        const factions = this.generateFactionFromMods(mods);
        const pvpZones = this.generatePVPZones();
        const economy = this.balanceEconomy(universe);
        
        console.log(`🛡️ Создано фракций: ${factions.length}`);
        console.log(`⚔️ PvP зон: ${pvpZones.length}`);
        console.log(`💰 Экономический баланс: ${economy.priceModifier}`);
        
        return { factions, pvpZones, economy, mods, universe };
    }
}

module.exports = UniverseBuilder;
