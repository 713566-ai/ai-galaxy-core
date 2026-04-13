const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли уже V113
if (content.includes('checkSplit')) {
  console.log('✅ V113 уже активирован');
  process.exit(0);
}

// Добавляем функцию сплита
const splitCode = `

// ========== V113 UNIVERSE SPLIT CORE ==========
async function checkSplit(worldState) {
  const overload = worldState.entropy > 0.85;
  
  if (overload && Math.random() < 0.3) {
    console.log('🌌🌀 СПЛИТ ВСЕЛЕННОЙ! Энтропия: ' + worldState.entropy);
    
    // Создаём новую вселенную с мутированными правилами
    const newUniverse = {
      id: 'U_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      entropy: worldState.entropy * 0.7,
      parentId: worldState.id || 'U0',
      rules: {
        warChance: Math.min(1, (worldState.rules?.warChance || 0.3) * (0.8 + Math.random() * 0.4)),
        collapseRate: Math.min(1, (worldState.rules?.collapseRate || 0.2) * (0.8 + Math.random() * 0.4)),
        entropyGain: Math.min(0.1, (worldState.rules?.entropyGain || 0.02) * (0.8 + Math.random() * 0.4))
      },
      createdAt: Date.now()
    };
    
    // Пуш на GitHub
    if (gitManager) {
      try {
        const url = await gitManager.pushUniverseState(newUniverse.id, newUniverse);
        console.log('📦 Вселенная запушена на GitHub: ' + url);
        
        // 30% шанс на форк ядра
        if (Math.random() < 0.3) {
          const forkUrl = await gitManager.forkToNewUniverse(newUniverse.id);
          console.log('🧬 Ядро размножено: ' + forkUrl);
        }
      } catch(e) {
        console.log('⚠️ Ошибка пуша: ' + e.message);
      }
    }
    
    return newUniverse;
  }
  return null;
}

// Автоматический сплит в цикле (каждый тик)
setInterval(async () => {
  const worldState = {
    entropy: global.currentEntropy || 0.5,
    rules: global.currentRules || {},
    id: global.universeId || 'U0'
  };
  const newUniverse = await checkSplit(worldState);
  if (newUniverse) {
    console.log('🌌 НОВАЯ ВСЕЛЕННАЯ СОЗДАНА: ' + newUniverse.id);
    if (global.onSplit) global.onSplit(newUniverse);
  }
}, 5000); // Проверка каждые 5 секунд
// ========== END V113 ==========
`;

// Вставляем перед последним app.listen
const listenIndex = content.lastIndexOf('app.listen');
if (listenIndex !== -1) {
  content = content.slice(0, listenIndex) + splitCode + content.slice(listenIndex);
  fs.writeFileSync(file, content);
  console.log('✅ V113 Universe Split Core добавлен в core-v110.js');
} else {
  console.log('⚠️ app.listen не найден, добавляем в конец');
  fs.appendFileSync(file, splitCode);
  console.log('✅ V113 добавлен в конец файла');
}

// Добавляем глобальные переменные для отслеживания энтропии
let entropySetup = `
// Глобальные переменные для V113
global.currentEntropy = 0.5;
global.currentRules = { warChance: 0.3, collapseRate: 0.2, entropyGain: 0.02 };
global.universeId = 'U0';

// Функция обновления состояния
function updateUniverseState(entropy, rules) {
  global.currentEntropy = entropy;
  global.currentRules = rules;
}
`;

const requireIndex = content.indexOf('require(');
const afterRequire = content.indexOf('\n', requireIndex);
content = content.slice(0, afterRequire + 1) + entropySetup + content.slice(afterRequire + 1);
fs.writeFileSync(file, content);

console.log('✅ Глобальные переменные добавлены');
console.log('');
console.log('🎉 V113 АКТИВИРОВАН!');
console.log('');
console.log('Функции:');
console.log('  - Авто-сплит при энтропии > 0.85');
console.log('  - Пуш новых вселенных на GitHub');
console.log('  - Авто-размножение ядра (30% шанс)');
