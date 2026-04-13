require('dotenv').config();
const express = require('express');
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs');
const { exec, spawn } = require('child_process');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

console.log('🔧 Загрузка AI Galaxy Core V116...');

// ========== GITHUB MANAGER ==========
class GitHubManager {
  constructor(token, username) {
    this.octokit = new Octokit({ auth: token 

  // 1. СОЗДАНИЕ ISSUE ПРИ РОЖДЕНИИ ВСЕЛЕННОЙ
  async createUniverseIssue(universeId, entropy, parentId) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.username,
        repo: 'ai-galaxy-core',
        title: `🌌 Новая вселенная: ${universeId}`,
        body: `
## 🧬 Рождение новой вселенной

| Параметр | Значение |
|----------|----------|
| **ID вселенной** | ${universeId} |
| **Энтропия** | ${entropy} |
| **Родительская вселенная** | ${parentId || 'U0'} |
| **Время создания** | ${new Date().toISOString()} |

### Автоматические действия:
- ✅ Репозиторий создан
- ✅ Облачная нода запущена
- 🔄 Система масштабируется

---
*Сгенерировано автоматически AI Galaxy Core V116*
`,
        labels: ['universe', 'auto-generated']
      });
      console.log(`📝 Issue создан: ${response.data.html_url}`);
      return response.data;
    } catch(e) {
      console.log(`⚠️ Не удалось создать issue: ${e.message}`);
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
        description: `AI Galaxy State Backup - ${universeId} - ${new Date().toISOString()}`,
        public: false,
        files: {
          `state_${universeId}_${Date.now()}.json`: {
            content: JSON.stringify(state, null, 2)
          }
        }
      });
      console.log(`💾 Бэкап сохранён в Gist: ${response.data.html_url}`);
      return response.data;
    } catch(e) {
      console.log(`⚠️ Не удалось создать бэкап: ${e.message}`);
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
      console.log(`⚙️ GitHub Action ${workflowId} запущен`);
      return true;
    } catch(e) {
      console.log(`⚠️ Не удалось запустить Action: ${e.message}`);
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
      console.log(`📋 Найдено вселенных: ${universes.length}`);
      return universes;
    } catch(e) {
      console.log(`⚠️ Ошибка получения списка: ${e.message}`);
      return [];
    }
  }
});
    this.username = username;
    this.git = simpleGit();
  }

  async createRepo(name) {
    const response = await this.octokit.repos.createForAuthenticatedUser({
      name: name,
      private: false,
      auto_init: true
    });
    console.log('📦 Репозиторий создан:', response.data.html_url);
    return response.data;
  }
}

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;
let gitManager = (token && username) ? new GitHubManager(token, username) : null;
if (gitManager) console.log('🔗 GitHub Manager: ✅ ПОДКЛЮЧЁН');

// ========== РЕАЛЬНЫЙ CLOUD ORCHESTRATOR ==========
class RealCloudOrchestrator {
  constructor() {
    this.nodes = [];
    this.processes = [];
  }

  async spawnLocalNode() {
    const nodeId = `node_local_${Date.now()}`;
    const nodePort = 3000 + this.processes.length + 1;
    
    console.log(`🖥️ Запуск локальной ноды: ${nodeId} на порту ${nodePort}`);
    
    const child = spawn('node', ['core-v110.js'], { 
      env: { ...process.env, PORT: nodePort, NODE_ID: nodeId },
      detached: true,
      stdio: 'pipe'
    });
    
    child.stdout.on('data', (data) => {
      console.log(`[${nodeId}] ${data.toString().trim().slice(0, 100)}`);
    });
    
    child.unref();
    
    this.processes.push({ id: nodeId, process: child, port: nodePort });
    this.nodes.push({ id: nodeId, port: nodePort, status: 'running', type: 'local' });
    
    return nodeId;
  }

  async destroyNode(nodeId) {
    const proc = this.processes.find(p => p.id === nodeId);
    if (proc && proc.process) {
      proc.process.kill('SIGTERM');
      console.log(`🛑 Нода остановлена: ${nodeId}`);
    }
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.processes = this.processes.filter(p => p.id !== nodeId);
    return true;
  }

  getStatus() {
    return {
      activeNodes: this.nodes.length,
      nodes: this.nodes,
      avgLoad: (this.nodes.length * 0.2).toFixed(2)
    };
  }

  async autoScale(entropy) {
    const targetNodes = Math.min(5, Math.max(1, Math.floor(entropy * 5)));
    const currentNodes = this.nodes.length;
    
    if (targetNodes > currentNodes) {
      const toAdd = targetNodes - currentNodes;
      console.log(`📈 Масштабирование: +${toAdd} нод (энтропия: ${entropy})`);
      for (let i = 0; i < toAdd; i++) {
        await this.spawnLocalNode();
      }
    } else if (targetNodes < currentNodes && currentNodes > 1) {
      const toRemove = currentNodes - targetNodes;
      console.log(`📉 Масштабирование: -${toRemove} нод`);
      for (let i = 0; i < toRemove; i++) {
        const lastNode = this.nodes[this.nodes.length - 1];
        if (lastNode) await this.destroyNode(lastNode.id);
      }
    }
  }
}

const realCloud = new RealCloudOrchestrator();

// ========== API ROUTES ==========
app.get('/', (req, res) => {
  res.json({
    status: 'AI Galaxy Core V116',
    github: !!gitManager,
    cloud: realCloud.getStatus(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/github/status', (req, res) => {
  res.json({ configured: !!gitManager, username: username || null });
});

app.post('/api/github/create-repo', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const repo = await gitManager.createRepo('test-' + Date.now());
  res.json({ success: true, url: repo.html_url });
});

app.get('/api/cloud/status', (req, res) => {
  res.json(realCloud.getStatus());
});

app.post('/api/cloud/scale-up', async (req, res) => {
  const nodeId = await realCloud.spawnLocalNode();
  res.json({ success: true, nodeId: nodeId });
});

app.post('/api/cloud/scale-down/:nodeId', async (req, res) => {
  await realCloud.destroyNode(req.params.nodeId);
  res.json({ success: true });
});

app.post('/api/cloud/auto-scale', async (req, res) => {
  await realCloud.autoScale(req.body.entropy || 0.7);
  res.json(realCloud.getStatus());
});

// ========== ЗАПУСК ==========


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
app.listen(port, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   💀 AI GALAXY CORE V116 ONLINE 💀     ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  🔗 GitHub:    ' + (gitManager ? '✅ CONNECTED' : '❌ NOT CONFIGURED') + '     ║');
  console.log('║  ☁️ Cloud:      0 active nodes          ║');
  console.log('║  🌐 Port:      ' + port + '                      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});
