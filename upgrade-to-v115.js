const fs = require('fs');
const file = './core-v110.js';
const path = require('path');

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли уже V115
if (content.includes('/multiverse-map')) {
  console.log('✅ V115 уже активирован');
  process.exit(0);
}

// Создаём папку для веб-файлов
const publicDir = './public';
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// HTML интерфейс
const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌌 AI Galaxy — Мультивселенная</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0a2a, #1a1a3a);
            color: #fff;
            font-family: 'Courier New', monospace;
            min-height: 100vh;
            padding: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
            font-size: 2em;
            text-shadow: 0 0 10px #00f;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }
        .stat-card {
            background: rgba(0,0,0,0.7);
            border: 1px solid #00f;
            border-radius: 10px;
            padding: 15px 25px;
            text-align: center;
        }
        .stat-card h3 { font-size: 0.9em; color: #88f; }
        .stat-card .value { font-size: 1.8em; font-weight: bold; }
        .universe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .universe-card {
            background: rgba(0,0,0,0.8);
            border-radius: 15px;
            padding: 15px;
            border-left: 4px solid;
            transition: transform 0.3s;
        }
        .universe-card:hover { transform: translateY(-5px); }
        .universe-card h3 { color: #0af; margin-bottom: 10px; }
        .universe-card .entropy { font-size: 1.2em; margin: 10px 0; }
        .progress-bar {
            background: #333;
            height: 10px;
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            transition: width 0.5s;
        }
        .portal-badge {
            background: #f0f;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7em;
            display: inline-block;
            margin: 5px 5px 0 0;
        }
        button {
            background: #00f;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover { background: #0af; }
        .status { text-align: center; margin: 20px; color: #0f0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .loading { animation: pulse 1s infinite; }
    </style>
</head>
<body>
    <h1>🌌 AI GALAXY — МУЛЬТИВСЕЛЕННАЯ V115</h1>
    
    <div class="stats">
        <div class="stat-card"><h3>🌍 Вселенных</h3><div class="value" id="universeCount">0</div></div>
        <div class="stat-card"><h3>🌀 Активных порталов</h3><div class="value" id="portalCount">0</div></div>
        <div class="stat-card"><h3>👑 Богов</h3><div class="value" id="godCount">0</div></div>
        <div class="stat-card"><h3>📦 GitHub репозиториев</h3><div class="value" id="githubCount">0</div></div>
    </div>
    
    <div id="status" class="status">🔄 Загрузка мультивселенной...</div>
    <div id="universeGrid" class="universe-grid"></div>
    
    <script>
        async function fetchData() {
            try {
                const [universesRes, portalsRes, githubRes] = await Promise.all([
                    fetch('/api/universes'),
                    fetch('/api/portals'),
                    fetch('/api/github/universes')
                ]);
                
                const universes = await universesRes.json();
                const portals = await portalsRes.json();
                const github = await githubRes.json();
                
                document.getElementById('universeCount').innerText = universes.total || universes.length || 0;
                document.getElementById('portalCount').innerText = portals.activePortals?.length || 0;
                document.getElementById('githubCount').innerText = github.total || 0;
                
                const grid = document.getElementById('universeGrid');
                const universeList = universes.universes || universes;
                
                if (!universeList || universeList.length === 0) {
                    grid.innerHTML = '<div class="status">⚠️ Нет вселенных. Запустите сплит или создайте вселенную вручную.</div>';
                    return;
                }
                
                grid.innerHTML = universeList.map(u => {
                    const entropyColor = u.entropy > 0.85 ? '#f00' : (u.entropy > 0.6 ? '#fa0' : '#0f0');
                    const portalCount = portals.activePortals?.filter(p => p.from?.id === u.id || p.to?.id === u.id).length || 0;
                    return `
                        <div class="universe-card" style="border-left-color: ${entropyColor}">
                            <h3>🌌 ${u.id || 'U_' + u.id}</h3>
                            <div class="entropy">📊 Энтропия: ${(u.entropy || 0).toFixed(3)}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(u.entropy || 0) * 100}%; background: ${entropyColor}"></div>
                            </div>
                            <div>⚔️ War Chance: ${((u.rules?.warChance || 0.3) * 100).toFixed(0)}%</div>
                            <div>💥 Collapse Rate: ${((u.rules?.collapseRate || 0.2) * 100).toFixed(0)}%</div>
                            <div>👑 Богов: ${u.gods?.length || 0}</div>
                            ${portalCount > 0 ? '<div>🌀 ' + portalCount + ' порталов</div>' : ''}
                            <button onclick="splitUniverse('${u.id}')">🌌 Сплит</button>
                        </div>
                    `;
                }).join('');
                
                document.getElementById('status').innerHTML = '✅ Мультивселенная активна | Обновлено: ' + new Date().toLocaleTimeString();
            } catch(e) {
                document.getElementById('status').innerHTML = '❌ Ошибка: ' + e.message;
            }
        }
        
        async function splitUniverse(id) {
            document.getElementById('status').innerHTML = '🔄 Сплит вселенной ' + id + '...';
            try {
                const res = await fetch('/api/split/' + id, { method: 'POST' });
                const data = await res.json();
                document.getElementById('status').innerHTML = '✅ Сплит выполнен! ' + (data.url || '');
                setTimeout(fetchData, 1000);
            } catch(e) {
                document.getElementById('status').innerHTML = '❌ Ошибка сплита: ' + e.message;
            }
        }
        
        fetchData();
        setInterval(fetchData, 3000);
    </script>
</body>
</html>`;

fs.writeFileSync(publicDir + '/index.html', htmlContent);
console.log('✅ Веб-интерфейс создан');

// Добавляем статику и API в код
const webCode = `

// ========== V115 WEB INTERFACE ==========
const path = require('path');
app.use(express.static('public'));

// API для списка вселенных
app.get('/api/universes', (req, res) => {
  const universes = global.universesList || [];
  res.json({ total: universes.length, universes: universes });
});

// API для GitHub репозиториев
app.get('/api/github/universes', async (req, res) => {
  if (!gitManager) return res.json({ total: 0, repos: [] });
  try {
    const repos = await gitManager.octokit.repos.listForAuthenticatedUser({ per_page: 30 });
    const aiRepos = repos.data.filter(r => r.name.includes('universe_') || r.name.includes('ai_core_'));
    res.json({ total: aiRepos.length, repos: aiRepos.map(r => ({ name: r.name, url: r.html_url })) });
  } catch(e) {
    res.json({ total: 0, error: e.message });
  }
});

// Принудительный сплит через API
app.post('/api/split/:id', async (req, res) => {
  const worldState = {
    entropy: 0.9,
    rules: {},
    id: req.params.id
  };
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
console.log('  - 🗺️ Карта мультивселенной в реальном времени');
console.log('  - 📊 Авто-обновление каждые 3 секунды');
console.log('  - 🎮 Кнопки управления сплитами');
