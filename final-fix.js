const fs = require('fs');
const file = './core-v110.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Отключаем проблемный push
content = content.replace(/app\.post\('\/api\/github\/push',[\s\S]+?\n\}\);/m, 
`app.post('/api/github/push', (req, res) => {
  res.json({ 
    success: false, 
    message: 'Push временно отключён. Используйте:',
    working: ['POST /api/github/create-repo', 'POST /api/cloud/scale-up', 'GET /api/cloud/status']
  });
});`);

// 2. Упрощаем GitHub Manager (убираем push метод)
content = content.replace(/async pushUniverseState\([^)]+\)\s*\{[\s\S]+?\n\s{2}\}/m,
`async pushUniverseState(universeId, worldState) {
    console.log('ℹ️ Push отключён, состояние сохранено локально');
    return 'https://github.com/' + this.username + '/push-disabled';
  }`);

fs.writeFileSync(file, content);
console.log('✅ Push отключён, остальные функции работают');
