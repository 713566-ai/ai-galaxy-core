const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли уже API маршруты
if (content.includes('/api/github/push')) {
  console.log('✅ API маршруты уже есть');
  process.exit(0);
}

// Находим место для вставки (перед последним app.listen)
const apiRoutes = `

// ========== GITHUB API ROUTES ==========
// Создать репозиторий
app.post('/api/github/create-repo', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  try {
    const repo = await gitManager.createRepo('test-' + Date.now(), 'AI Galaxy Universe');
    res.json({ url: repo.html_url });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Запушить состояние вселенной
app.post('/api/github/push', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  try {
    const worldState = {
      entropy: global.entropy || 0.5,
      gods: global.gods || [],
      ruleEngine: global.ruleEngine || { rules: {} }
    };
    const url = await gitManager.pushUniverseState('manual_' + Date.now(), worldState);
    res.json({ success: true, url: url });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Статус GitHub
app.get('/api/github/status', (req, res) => {
  res.json({ 
    configured: !!gitManager,
    username: process.env.GITHUB_USERNAME || null
  });
});

// Размножить ядро
app.post('/api/github/fork', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  try {
    const url = await gitManager.forkToNewUniverse('fork_' + Date.now());
    res.json({ success: true, url: url });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
// ========== END GITHUB API ==========
`;

// Вставляем перед последним app.listen
const listenIndex = content.lastIndexOf('app.listen');
if (listenIndex !== -1) {
  content = content.slice(0, listenIndex) + apiRoutes + content.slice(listenIndex);
  fs.writeFileSync(file, content);
  console.log('✅ API маршруты добавлены в core-v110.js');
} else {
  console.log('⚠️ Не найден app.listen, вставка в конец файла');
  fs.appendFileSync(file, apiRoutes);
  console.log('✅ API маршруты добавлены в конец файла');
}
