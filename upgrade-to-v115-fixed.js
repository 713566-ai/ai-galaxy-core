const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли уже V115
if (content.includes('/multiverse-map')) {
  console.log('✅ V115 уже активирован');
  process.exit(0);
}

// Создаём папку для веб-файлов
const publicDir = './public';
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// HTML интерфейс (без шаблонных строк в коде)
const htmlContent = '<!DOCTYPE html>\n' +
'<html lang="ru">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>🌌 AI Galaxy — Мультивселенная</title>\n' +
'    <style>\n' +
'        * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'        body { background: linear-gradient(135deg, #0a0a2a, #1a1a3a); color: #fff; font-family: monospace; min-height: 100vh; padding: 20px; }\n' +
'        h1 { text-align: center; margin-bottom: 20px; }\n' +
'        .stats { display: flex; justify-content: space-around; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }\n' +
'        .stat-card { background: rgba(0,0,0,0.7); border: 1px solid #00f; border-radius: 10px; padding: 15px 25px; text-align: center; }\n' +
'        .stat-card .value { font-size: 1.8em; font-weight: bold; }\n' +
'        .universe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }\n' +
'        .universe-card { background: rgba(0,0,0,0.8); border-radius: 15px; padding: 15px; border-left: 4px solid; transition: transform 0.3s; }\n' +
'        .universe-card:hover { transform: translateY(-5px); }\n' +
'        .progress-bar { background: #333; height: 10px; border-radius: 5px; overflow: hidden; margin: 10px 0; }\n' +
'        .progress-fill { height: 100%; transition: width 0.5s; }\n' +
'        button { background: #00f; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-top: 10px; }\n' +
'        button:hover { background: #0af; }\n' +
'        .status { text-align: center; margin: 20px; color: #0f0; }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <h1>🌌 AI GALAXY — МУЛЬТИВСЕЛЕННАЯ V115</h1>\n' +
'    <div class="stats">\n' +
'        <div class="stat-card"><h3>🌍 Вселенных</h3><div class="value" id="universeCount">0</div></div>\n' +
'        <div class="stat-card"><h3>🌀 Порталов</h3><div class="value" id="portalCount">0</div></div>\n' +
'        <div class="stat-card"><h3>👑 Богов</h3><div class="value" id="godCount">0</div></div>\n' +
'    </div>\n' +
'    <div id="status" class="status">🔄 Загрузка...</div>\n' +
'    <div id="universeGrid" class="universe-grid"></div>\n' +
'    <script>\n' +
'        async function fetchData() {\n' +
'            try {\n' +
'                const r = await fetch("/api/universes");\n' +
'                const data = await r.json();\n' +
'                const universes = data.universes || [];\n' +
'                document.getElementById("universeCount").innerText = universes.length;\n' +
'                const grid = document.getElementById("universeGrid");\n' +
'                if (universes.length === 0) { grid.innerHTML = "<div class=\"status\">⚠️ Нет вселенных</div>"; return; }\n' +
'                grid.innerHTML = universes.map(function(u) {\n' +
'                    var color = u.entropy > 0.85 ? "#f00" : (u.entropy > 0.6 ? "#fa0" : "#0f0");\n' +
'                    return "<div class=\"universe-card\" style=\"border-left-color: " + color + "\">" +\n' +
'                        "<h3>🌌 " + (u.id || "U_" + u.id) + "</h3>" +\n' +
'                        "<div>📊 Энтропия: " + (u.entropy || 0).toFixed(3) + "</div>" +\n' +
'                        "<div class=\"progress-bar\"><div class=\"progress-fill\" style=\"width: " + ((u.entropy || 0) * 100) + "%; background: " + color + "\"></div></div>" +\n' +
'                        "<div>👑 Богов: " + (u.gods || []).length + "</div>" +\n' +
'                        "<button onclick=\"splitUniverse(\\'" + u.id + "\\')\">🌌 Сплит</button>" +\n' +
'                    "</div>";\n' +
'                }).join("");\n' +
'                document.getElementById("status").innerHTML = "✅ Обновлено: " + new Date().toLocaleTimeString();\n' +
'            } catch(e) { document.getElementById("status").innerHTML = "❌ Ошибка: " + e.message; }\n' +
'        }\n' +
'        async function splitUniverse(id) {\n' +
'            document.getElementById("status").innerHTML = "🔄 Сплит...";\n' +
'            await fetch("/api/split/" + id, { method: "POST" });\n' +
'            setTimeout(fetchData, 1000);\n' +
'        }\n' +
'        fetchData();\n' +
'        setInterval(fetchData, 3000);\n' +
'    </script>\n' +
'</body>\n' +
'</html>';

fs.writeFileSync(publicDir + '/index.html', htmlContent);
console.log('✅ Веб-интерфейс создан');

// Добавляем статику и API в код
const webCode = `
// ========== V115 WEB INTERFACE ==========
const path = require('path');
app.use(express.static('public'));

// API для списка вселенных
app.get('/api/universes', (req, res) => {
  const universes = global.universesList || [{ id: 'U0', entropy: 0.5, gods: [] }];
  res.json({ total: universes.length, universes: universes });
});

// Принудительный сплит через API
app.post('/api/split/:id', async (req, res) => {
  const worldState = { entropy: 0.9, rules: {}, id: req.params.id };
  const newUniverse = await checkSplit(worldState);
  res.json({ success: !!newUniverse, newUniverse: newUniverse });
});

// Инициализация списка вселенных
global.universesList = [{ id: 'U0', entropy: 0.5, gods: [], rules: { warChance: 0.3, collapseRate: 0.2 } }];

// Перехват создания новых вселенных
const originalConsoleLog = console.log;
console.log = function(...args) {
  const msg = args.join(' ');
  if (msg.includes('НОВАЯ ВСЕЛЕННАЯ СОЗДАНА')) {
    const match = msg.match(/СОЗДАНА: (.+)/);
    if (match && !global.universesList.find(u => u.id === match[1])) {
      global.universesList.push({ id: match[1], entropy: 0.3, gods: [] });
    }
  }
  originalConsoleLog.apply(console, args);
};
// ========== END V115 ==========
`;

// Вставляем перед app.listen
const listenIndex = content.lastIndexOf('app.listen');
if (listenIndex !== -1) {
  content = content.slice(0, listenIndex) + webCode + content.slice(listenIndex);
  fs.writeFileSync(file, content);
  console.log('✅ V115 Web Interface добавлен');
}

console.log('');
console.log('🎉 V115 АКТИВИРОВАН!');
console.log('');
console.log('Новые функции:');
console.log('  - 🌐 Веб-интерфейс на http://localhost:3000');
console.log('  - 🗺️ Карта мультивселенной');
console.log('  - 📊 Авто-обновление каждые 3 секунды');
