// ============================================
// DISCOVERY-STYLE MOD FOR AI GALAXY CORE
// Оригинальная механика, свой код
// Юридически чистая версия
// ============================================

console.log('🚀 Discovery Galaxy Mod активирован!');

// ========== НОВЫЕ ФРАКЦИИ ==========
const FACTIONS = {
    LIBERTY: { name: "Либерти", reputation: 0, enemies: ["CORSAR", "OUTCAST"] },
    CORSAR: { name: "Корсары", reputation: -0.5, enemies: ["LIBERTY", "ORDER"] },
    OUTCAST: { name: "Аутло", reputation: -0.5, enemies: ["LIBERTY", "ORDER"] },
    ORDER: { name: "Орден", reputation: 0.2, enemies: ["CORSAR", "OUTCAST"] },
    RHEINLAND: { name: "Рейнланд", reputation: 0.1, enemies: ["CORSAR"] }
};

// ========== PVP ЗОНЫ С ВЫСОКИМИ НАГРАДАМИ ==========
const PVP_ZONES = [
    { name: "Сигма-13", risk: "high", rewardMultiplier: 2.0, pvpEnabled: true },
    { name: "Омикрон-Гамма", risk: "extreme", rewardMultiplier: 3.0, pvpEnabled: true },
    { name: "Баффин", risk: "medium", rewardMultiplier: 1.5, pvpEnabled: true }
];

// ========== ДИНАМИЧЕСКАЯ РЕПУТАЦИЯ ==========
class ReputationSystem {
    constructor() {
        this.reputation = new Map();
        Object.keys(FACTIONS).forEach(f => this.reputation.set(f, 0));
    }
    
    changeReputation(faction, delta) {
        const current = this.reputation.get(faction) || 0;
        const newValue = Math.max(-1, Math.min(1, current + delta));
        this.reputation.set(faction, newValue);
        console.log(`📊 Репутация ${FACTIONS[faction].name}: ${(newValue * 100).toFixed(0)}%`);
        return newValue;
    }
    
    getReputation(faction) {
        return this.reputation.get(faction) || 0;
    }
    
    getFactionRelation(faction1, faction2) {
        if (FACTIONS[faction1].enemies.includes(faction2)) return -0.5;
        return 0.1;
    }
}

// ========== СИСТЕМА КЛАНОВ ==========
class ClanSystem {
    constructor() {
        this.clans = new Map();
    }
    
    createClan(name, founder) {
        if (this.clans.has(name)) return false;
        this.clans.set(name, {
            name: name,
            members: [founder],
            leader: founder,
            territory: null,
            treasury: 0,
            createdAt: Date.now()
        });
        console.log(`🏰 Создан клан: ${name}`);
        return true;
    }
    
    addMember(clanName, member) {
        const clan = this.clans.get(clanName);
        if (clan && !clan.members.includes(member)) {
            clan.members.push(member);
            return true;
        }
        return false;
    }
    
    claimTerritory(clanName, systemName) {
        const clan = this.clans.get(clanName);
        if (clan) {
            clan.territory = systemName;
            console.log(`🏆 Клан ${clanName} захватил территорию: ${systemName}`);
            return true;
        }
        return false;
    }
    
    getClans() {
        return Array.from(this.clans.values());
    }
}

// ========== ТОРГОВЫЕ КОНВОИ ==========
class TradeConvoySystem {
    constructor() {
        this.activeConvoys = [];
        this.convoyInterval = setInterval(() => this.spawnConvoy(), 60000);
    }
    
    spawnConvoy() {
        const routes = [
            { from: "Манхэттен", to: "Питтсбург", reward: 5000 },
            { from: "Нью-Берлин", to: "Гамбург", reward: 4500 },
            { from: "Лондон", to: "Дублин", reward: 5500 }
        ];
        const route = routes[Math.floor(Math.random() * routes.length)];
        const convoy = {
            id: Date.now(),
            route: route,
            health: 100,
            reward: route.reward,
            position: 0,
            active: true
        };
        this.activeConvoys.push(convoy);
        console.log(`🚢 Торговый конвой отправлен: ${route.from} → ${route.to}`);
        
        setTimeout(() => this.completeConvoy(convoy.id), 30000);
    }
    
    completeConvoy(convoyId) {
        const index = this.activeConvoys.findIndex(c => c.id === convoyId);
        if (index !== -1) {
            const convoy = this.activeConvoys[index];
            console.log(`✅ Конвой прибыл! Награда: ${convoy.reward} кредитов`);
            this.activeConvoys.splice(index, 1);
        }
    }
    
    attackConvoy(convoyId, damage) {
        const convoy = this.activeConvoys.find(c => c.id === convoyId);
        if (convoy) {
            convoy.health -= damage;
            if (convoy.health <= 0) {
                console.log(`💀 Конвой уничтожен! Добыча: ${convoy.reward * 0.5} кредитов`);
                this.activeConvoys = this.activeConvoys.filter(c => c.id !== convoyId);
                return convoy.reward * 0.5;
            }
        }
        return 0;
    }
}

// ========== API ДЛЯ ИНТЕГРАЦИИ ==========
const reputation = new ReputationSystem();
const clanSystem = new ClanSystem();
const convoySystem = new TradeConvoySystem();

// Экспорт для доступа из API
module.exports = {
    FACTIONS,
    PVP_ZONES,
    reputation,
    clanSystem,
    convoySystem
};

// Регистрация API эндпоинтов (будет добавлено в main.js)
console.log('✅ Discovery Galaxy Mod загружен!');
console.log(`📊 Фракций: ${Object.keys(FACTIONS).length}`);
console.log(`⚔️ PvP зон: ${PVP_ZONES.length}`);
console.log(`🏰 Система кланов: готова`);
console.log(`🚢 Торговые конвои: активны`);
