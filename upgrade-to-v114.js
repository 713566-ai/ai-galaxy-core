const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли уже V114
if (content.includes('PortalManager')) {
  console.log('✅ V114 уже активирован');
  process.exit(0);
}

// Добавляем систему порталов
const portalCode = `

// ========== V114 PORTAL CORE ==========
class PortalManager {
  constructor() {
    this.portals = []; // Активные порталы
    this.crossings = []; // История перемещений
  }

  // Создать портал между вселенными
  createPortal(fromUniverse, toUniverse, stability = 0.7) {
    const portal = {
      id: 'P_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      from: fromUniverse,
      to: toUniverse,
      stability: stability,
      createdAt: Date.now(),
      expiresAt: Date.now() + (60 * 60 * 1000) // Живёт 1 час
    };
    this.portals.push(portal);
    console.log('🌀 Портала создан: ' + portal.id + ' (' + fromUniverse.id + ' → ' + toUniverse.id + ')');
    return portal;
  }

  // Переместить бога через портал
  async migrateGod(god, portal, targetUniverse) {
    if (!portal || portal.stability < Math.random()) {
      console.log('💀 Бог ' + god.name + ' потерян в портале!');
      return null;
    }

    const migratedGod = {
      ...god,
      id: god.id + '_' + targetUniverse.id,
      power: god.power * (0.8 + Math.random() * 0.6), // Сила меняется
      homeUniverse: targetUniverse.id,
      crossedAt: Date.now()
    };

    this.crossings.push({
      god: god.name,
      from: portal.from.id,
      to: portal.to.id,
      time: Date.now()
    });

    console.log('✨ Бог ' + god.name + ' мигрировал через портал! Сила: ' + migratedGod.power.toFixed(2));
    return migratedGod;
  }

  // Найти активные порталы из вселенной
  findPortalsFrom(universeId) {
    const now = Date.now();
    return this.portals.filter(p => 
      p.from.id === universeId && 
      p.expiresAt > now &&
      p.stability > 0.2
    );
  }

  // Случайное создание портала при сплите
  maybeCreatePortal(universe1, universe2, chance = 0.4) {
    if (Math.random() < chance) {
      const stability = 0.3 + Math.random() * 0.6;
      return this.createPortal(universe1, universe2, stability);
    }
    return null;
  }
}

// Глобальный менеджер порталов
const portalManager = new PortalManager();

// Добавляем API для порталов
app.get('/api/portals', (req, res) => {
  res.json({
    activePortals: portalManager.portals.filter(p => p.expiresAt > Date.now()),
    totalCrossings: portalManager.crossings.length
  });
});

app.post('/api/portal/create', async (req, res) => {
  const { fromId, toId, stability } = req.body;
  const from = { id: fromId };
  const to = { id: toId };
  const portal = portalManager.createPortal(from, to, stability);
  res.json({ portalId: portal.id, stability: portal.stability });
});

app.post('/api/god/migrate', async (req, res) => {
  const { godName, portalId } = req.body;
  const portal = portalManager.portals.find(p => p.id === portalId);
  if (!portal) {
    return res.status(404).json({ error: 'Portal not found' });
  }
  
  const mockGod = { name: godName, id: godName, power: 1.0 };
  const migrated = await portalManager.migrateGod(mockGod, portal, portal.to);
  res.json({ success: !!migrated, god: migrated });
});

// Интеграция с V113: при сплите создаём портал между вселенными
const originalCheckSplit = checkSplit;
checkSplit = async function(worldState) {
  const newUniverse = await originalCheckSplit(worldState);
  if (newUniverse) {
    // Создаём портал между старой и новой вселенной
    const oldUniverse = { id: worldState.id || 'U0' };
    portalManager.maybeCreatePortal(oldUniverse, newUniverse, 0.6);
    
    // Логируем событие
    console.log('🌀 Портал открыт между ' + oldUniverse.id + ' и ' + newUniverse.id);
    
    // Если есть боги, некоторые могут мигрировать
    if (global.gods && global.gods.length > 0 && Math.random() < 0.3) {
      const randomGod = global.gods[Math.floor(Math.random() * global.gods.length)];
      const portals = portalManager.findPortalsFrom(oldUniverse.id);
      if (portals.length > 0) {
        await portalManager.migrateGod(randomGod, portals[0], newUniverse);
      }
    }
  }
  return newUniverse;
};
// ========== END V114 ==========
`;

// Вставляем перед последним app.listen
const listenIndex = content.lastIndexOf('app.listen');
if (listenIndex !== -1) {
  content = content.slice(0, listenIndex) + portalCode + content.slice(listenIndex);
  fs.writeFileSync(file, content);
  console.log('✅ V114 Portal Core добавлен');
} else {
  console.log('⚠️ app.listen не найден');
}

console.log('');
console.log('🎉 V114 АКТИВИРОВАН!');
console.log('');
console.log('Новые функции:');
console.log('  - 🌀 Создание порталов между вселенными');
console.log('  - ✨ Миграция богов через порталы');
console.log('  - 🔗 Авто-порталы при сплите (60% шанс)');
console.log('  - 📊 API для управления порталами');
