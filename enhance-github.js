const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли уже расширенные методы
if (content.includes('createUniverseIssue')) {
  console.log('✅ Расширенные методы уже добавлены');
  process.exit(0);
}

// Методы для расширения GitHub Manager
const extendedMethods = `

  // 1. СОЗДАНИЕ ISSUE ПРИ РОЖДЕНИИ ВСЕЛЕННОЙ
  async createUniverseIssue(universeId, entropy, parentId) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.username,
        repo: 'ai-galaxy-core',
        title: \`🌌 Новая вселенная: \${universeId}\`,
        body: \`
## 🧬 Рождение новой вселенной

| Параметр | Значение |
|----------|----------|
| **ID вселенной** | \${universeId} |
| **Энтропия** | \${entropy} |
| **Родительская вселенная** | \${parentId || 'U0'} |
| **Время создания** | \${new Date().toISOString()} |

### Автоматические действия:
- ✅ Репозиторий создан
- ✅ Облачная нода запущена
- 🔄 Система масштабируется

---
*Сгенерировано автоматически AI Galaxy Core V116*
\`,
        labels: ['universe', 'auto-generated']
      });
      console.log(\`📝 Issue создан: \${response.data.html_url}\`);
      return response.data;
    } catch(e) {
      console.log(\`⚠️ Не удалось создать issue: \${e.message}\`);
      return null;
    }
  }

  // 2. БЭКАП СОСТОЯНИЯ В GITHUB GIST
  async backupToGist(worldState, universeId) {
    try {
      const state = {
        universeId: universeId,
        timestamp: Date.now(),
        entropy: worldState.entropy || 0.5,
        gods: worldState.gods || [],
        nodes: worldState.cloud?.nodes || [],
        rules: worldState.ruleEngine?.rules || {}
      };
      
      const response = await this.octokit.gists.create({
        description: \`AI Galaxy State Backup - \${universeId} - \${new Date().toISOString()}\`,
        public: false,
        files: {
          \`state_\${universeId}_\${Date.now()}.json\`: {
            content: JSON.stringify(state, null, 2)
          }
        }
      });
      console.log(\`💾 Бэкап сохранён в Gist: \${response.data.html_url}\`);
      return response.data;
    } catch(e) {
      console.log(\`⚠️ Не удалось создать бэкап: \${e.message}\`);
      return null;
    }
  }

  // 3. ЗАПУСК GITHUB ACTION (CI/CD)
  async triggerAction(workflowId = 'deploy.yml', inputs = {}) {
    try {
      await this.octokit.actions.createWorkflowDispatch({
        owner: this.username,
        repo: 'ai-galaxy-core',
        workflow_id: workflowId,
        ref: 'main',
        inputs: inputs
      });
      console.log(\`⚙️ GitHub Action \${workflowId} запущен\`);
      return true;
    } catch(e) {
      console.log(\`⚠️ Не удалось запустить Action: \${e.message}\`);
      return false;
    }
  }

  // 4. ПОЛУЧЕНИЕ СПИСКА ВСЕЛЕННЫХ ИЗ РЕПОЗИТОРИЕВ
  async listUniversesFromRepos() {
    try {
      const repos = await this.octokit.repos.listForAuthenticatedUser({
        per_page: 100
      });
      const universes = repos.data
        .filter(r => r.name.startsWith('universe_'))
        .map(r => ({
          id: r.name.replace('universe_', ''),
          url: r.html_url,
          created: r.created_at,
          updated: r.updated_at
        }));
      console.log(\`📋 Найдено вселенных: \${universes.length}\`);
      return universes;
    } catch(e) {
      console.log(\`⚠️ Ошибка получения списка: \${e.message}\`);
      return [];
    }
  }
`;

// Добавляем методы в конец класса GitHubManager
const classEnd = content.indexOf('}', content.indexOf('class GitHubManager'));
content = content.slice(0, classEnd) + extendedMethods + content.slice(classEnd);

// Добавляем новые API эндпоинты
const apiEndpoints = `

// ========== НОВЫЕ API ЭНДПОИНТЫ ==========

// Создание issue
app.post('/api/github/issue', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const issue = await gitManager.createUniverseIssue(
    req.body.universeId || 'manual_' + Date.now(),
    req.body.entropy || 0.5,
    req.body.parentId || 'U0'
  );
  res.json({ success: !!issue, issue: issue });
});

// Бэкап состояния
app.post('/api/github/backup', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const worldState = {
    entropy: global.currentEntropy || 0.5,
    gods: global.gods || [],
    cloud: cloud.getStatus ? cloud.getStatus() : { nodes: [] }
  };
  const backup = await gitManager.backupToGist(worldState, req.body.universeId || 'U0');
  res.json({ success: !!backup, url: backup?.html_url });
});

// Запуск Action
app.post('/api/github/action/:workflow', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const result = await gitManager.triggerAction(req.params.workflow, req.body.inputs || {});
  res.json({ success: result });
});

// Список вселенных
app.get('/api/github/universes', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const universes = await gitManager.listUniversesFromRepos();
  res.json({ total: universes.length, universes: universes });
});

console.log('🌐 GitHub расширенные функции активированы');
console.log('   - Создание issue: POST /api/github/issue');
console.log('   - Бэкап в Gist: POST /api/github/backup');
console.log('   - Запуск Actions: POST /api/github/action/:workflow');
console.log('   - Список вселенных: GET /api/github/universes');
`;

// Добавляем API эндпоинты перед app.listen
const listenIndex = content.lastIndexOf('app.listen');
if (listenIndex !== -1) {
  content = content.slice(0, listenIndex) + apiEndpoints + content.slice(listenIndex);
  fs.writeFileSync(file, content);
  console.log('✅ Расширенные функции GitHub добавлены');
} else {
  console.log('⚠️ app.listen не найден');
  fs.appendFileSync(file, apiEndpoints);
  console.log('✅ API добавлены в конец файла');
}

console.log('');
console.log('🎉 ГОТОВО! Добавлены новые функции:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📝 Создание issue      → POST /api/github/issue');
console.log('💾 Бэкап в Gist       → POST /api/github/backup');
console.log('⚙️ Запуск Actions     → POST /api/github/action/:workflow');
console.log('📋 Список вселенных   → GET  /api/github/universes');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
