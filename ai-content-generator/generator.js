const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIContentGenerator {
    constructor() {
        this.modsPath = path.join(__dirname, '../mods');
        this.godCoreUrl = 'http://localhost:5400';
        this.aiCoreUrl = 'http://localhost:3000';
    }

    // Анализ модов и извлечение объектов
    async analyzeMods() {
        const objects = {
            planets: [],
            ships: [],
            stations: [],
            factions: []
        };
        
        const modFolders = fs.readdirSync(this.modsPath).filter(f => 
            fs.statSync(path.join(this.modsPath, f)).isDirectory()
        );
        
        for (const mod of modFolders) {
            const modJson = path.join(this.modsPath, mod, 'mod.json');
            if (fs.existsSync(modJson)) {
                const config = JSON.parse(fs.readFileSync(modJson, 'utf8'));
                
                // Извлекаем планеты из описания
                if (config.features) {
                    if (config.description?.includes('планет')) {
                        objects.planets.push({
                            name: `${config.name.split(' ')[0]} Planet`,
                            mod: mod,
                            type: 'terrestrial'
                        });
                    }
                }
            }
            
            // Проверяем init.js на наличие объектов
            const initJs = path.join(this.modsPath, mod, 'init.js');
            if (fs.existsSync(initJs)) {
                const content = fs.readFileSync(initJs, 'utf8');
                if (content.includes('starterShip')) {
                    objects.ships.push({
                        name: `${config?.name || mod} Ship`,
                        mod: mod,
                        type: 'fighter'
                    });
                }
                if (content.includes('tradeRoutes')) {
                    objects.stations.push({
                        name: `${config?.name || mod} Station`,
                        mod: mod,
                        type: 'trading'
                    });
                }
            }
        }
        
        return objects;
    }

    // Генерация новой планеты на основе мода
    generatePlanetFromMod(modName, modData) {
        const colors = [0x44aa88, 0x88aa44, 0xaa4488, 0x4488aa, 0xaa8844];
        const sizes = [1.5, 2.0, 2.5, 3.0];
        
        return {
            name: `${modData.name || modName} Prime`,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: sizes[Math.floor(Math.random() * sizes.length)],
            position: {
                x: (Math.random() - 0.5) * 30,
                z: (Math.random() - 0.5) * 30,
                y: Math.sin(Math.random() * Math.PI * 2) * 5
            },
            atmosphere: true,
            description: `Планета из мода ${modData.name || modName}`,
            modSource: modName
        };
    }

    // Генерация корабля
    generateShipFromMod(modName, modData) {
        return {
            name: `${modData.name || modName} Fighter`,
            type: 'fighter',
            speed: 50 + Math.random() * 50,
            shields: 100 + Math.random() * 100,
            weapons: Math.floor(1 + Math.random() * 4),
            modSource: modName
        };
    }

    // Добавление объектов в 3D сцену (через API)
    async addObjectTo3DScene(object) {
        try {
            // Запрос к AI Core для добавления объекта
            const response = await axios.post(`${this.aiCoreUrl}/api/game/add-object`, object);
            return response.data;
        } catch(e) {
            console.log(`Ошибка добавления ${object.name}:`, e.message);
            return null;
        }
    }

    // Основной цикл генерации контента
    async generateContent() {
        console.log('🤖 AI Content Generator: анализ модов...');
        
        const objectsFromMods = await this.analyzeMods();
        const mods = [];
        const modFolders = fs.readdirSync(this.modsPath).filter(f => 
            fs.statSync(path.join(this.modsPath, f)).isDirectory()
        );
        
        for (const mod of modFolders) {
            const modJson = path.join(this.modsPath, mod, 'mod.json');
            if (fs.existsSync(modJson)) {
                mods.push({
                    id: mod,
                    ...JSON.parse(fs.readFileSync(modJson, 'utf8'))
                });
            }
        }
        
        console.log(`📊 Найдено модов: ${mods.length}`);
        console.log(`🪐 Планет из модов: ${objectsFromMods.planets.length}`);
        console.log(`🚀 Кораблей из модов: ${objectsFromMods.ships.length}`);
        
        // Генерация новых объектов
        const newPlanets = [];
        const newShips = [];
        
        for (const mod of mods) {
            const planet = this.generatePlanetFromMod(mod.id, mod);
            newPlanets.push(planet);
            
            const ship = this.generateShipFromMod(mod.id, mod);
            newShips.push(ship);
        }
        
        console.log(`\n🆕 Сгенерировано новых планет: ${newPlanets.length}`);
        console.log(`🆕 Сгенерировано новых кораблей: ${newShips.length}`);
        
        // Вывод информации
        console.log('\n📋 НОВЫЕ ОБЪЕКТЫ:');
        newPlanets.forEach(p => console.log(`   🪐 ${p.name} (из мода ${p.modSource})`));
        newShips.forEach(s => console.log(`   🚀 ${s.name} (из мода ${s.modSource})`));
        
        return { newPlanets, newShips, mods };
    }

    // Обновление 3D HTML файла с новыми объектами
    async update3DScene(planets) {
        const htmlPath = path.join(__dirname, '../public/3d/index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Генерируем код для добавления планет
        let planetsCode = '';
        planets.forEach((planet, index) => {
            planetsCode += `
        // Планета ${index + 1}: ${planet.name}
        const geo${index} = new THREE.SphereGeometry(${planet.size}, 64, 64);
        const mat${index} = new THREE.MeshStandardMaterial({ color: ${planet.color}, metalness: 0.3, roughness: 0.6 });
        const planet${index} = new THREE.Mesh(geo${index}, mat${index});
        planet${index}.position.set(${planet.position.x}, ${planet.position.y}, ${planet.position.z});
        scene.add(planet${index});
        
        // Название планеты ${planet.name}
        const div${index} = document.createElement('div');
        div${index}.textContent = '🪐 ${planet.name}';
        div${index}.style.color = '#ff0';
        div${index}.style.background = 'rgba(0,0,0,0.6)';
        div${index}.style.padding = '2px 10px';
        div${index}.style.borderRadius = '20px';
        div${index}.style.fontSize = '12px';
        const label${index} = new CSS2DObject(div${index});
        label${index}.position.set(0, ${planet.size + 0.5}, 0);
        planet${index}.add(label${index});
            `;
        });
        
        // Вставляем код в HTML (упрощённо)
        // В реальности нужно парсить HTML, но для простоты создадим новый файл
        
        const newHtml = html.replace('// Планеты будут добавлены здесь', planetsCode);
        fs.writeFileSync(htmlPath, newHtml);
        console.log('✅ 3D сцена обновлена!');
    }
}

module.exports = AIContentGenerator;
