require('dotenv').config();
const express = require('express');
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

console.log('🔧 Загрузка AI Galaxy Core V116...');

// ========== GITHUB MANAGER ==========
class GitHubManager {
  constructor(token, username) {
    this.octokit = new Octokit({ auth: token });
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

  // 1. СОЗДАНИЕ ISSUE ПРИ РОЖДЕНИИ ВСЕЛЕННОЙ
  async createUniverseIssue(universeId, entropy, parentId) {
    try {
      const response = await this.octokit.issues.create({
        owner: this.username,
        repo: 'ai-galaxy-core',
        title: `🌌 Новая вселенная: ${universeId}`,
        body: `## 🧬 Рождение новой вселенной\n\n| Параметр | Значение |\n|----------|----------|\n| **ID вселенной** | ${universeId} |\n| **Энтропия** | ${entropy} |\n| **Родительская вселенная** | ${parentId || 'U0'} |\n| **Время создания** | ${new Date().toISOString()} |\n\n---\n*Сгенерировано автоматически AI Galaxy Core V116*`,
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
        nodes: worldState.cloud?.nodes || []
      };
      const response = await this.octokit.gists.create({
        description: `AI Galaxy State Backup - ${universeId} - ${new Date().toISOString()}`,
        public: false,
        files: {
          [`state_${universeId}_${Date.now()}.json`]: {
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

  // 3. ЗАПУСК GITHUB ACTION
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

  // 4. ПОЛУЧЕНИЕ СПИСКА ВСЕЛЕННЫХ
  async listUniversesFromRepos() {
    try {
      const repos = await this.octokit.repos.listForAuthenticatedUser({ per_page: 100 });
      const universes = repos.data
        .filter(r => r.name.startsWith('universe_'))
        .map(r => ({ id: r.name.replace('universe_', ''), url: r.html_url, created: r.created_at }));
      console.log(`📋 Найдено вселенных: ${universes.length}`);
      return universes;
    } catch(e) {
      console.log(`⚠️ Ошибка: ${e.message}`);
      return [];
    }
  }
}

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;
let gitManager = (token && username) ? new GitHubManager(token, username) : null;
if (gitManager) console.log('🔗 GitHub Manager: ✅ ПОДКЛЮЧЁН');

// ========== CLOUD ORCHESTRATOR ==========
class CloudOrchestrator {
  constructor() { this.nodes = []; }
  async spawnNode() {
    const nodeId = `node_local_${Date.now()}`;
    this.nodes.push({ id: nodeId, port: 3000 + this.nodes.length + 1, status: 'running', type: 'local' });
    console.log('🖥️ Нода создана:', nodeId);
    return nodeId;
  }
  getStatus() { return { activeNodes: this.nodes.length, nodes: this.nodes, avgLoad: (this.nodes.length * 0.2).toFixed(2) }; }
}
const cloud = new CloudOrchestrator();

// ========== API ROUTES ==========
app.get('/', (req, res) => res.json({ status: 'AI Galaxy Core V116', github: !!gitManager, cloud: cloud.getStatus(), timestamp: new Date().toISOString() }));
app.get('/api/github/status', (req, res) => res.json({ configured: !!gitManager, username: username }));
app.post('/api/github/create-repo', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'No token' });
  const repo = await gitManager.createRepo('test-' + Date.now());
  res.json({ success: true, url: repo.html_url });
});
app.post('/api/github/issue', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const issue = await gitManager.createUniverseIssue(req.body.universeId || 'U_TEST', req.body.entropy || 0.85, req.body.parentId);
  res.json({ success: !!issue, url: issue?.html_url });
});
app.post('/api/github/backup', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const backup = await gitManager.backupToGist({ entropy: 0.5, cloud: cloud.getStatus() }, req.body.universeId || 'U0');
  res.json({ success: !!backup, url: backup?.html_url });
});
app.post('/api/github/action/:workflow', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const result = await gitManager.triggerAction(req.params.workflow, req.body.inputs || {});
  res.json({ success: result });
});
app.get('/api/github/universes', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const universes = await gitManager.listUniversesFromRepos();
  res.json({ total: universes.length, universes });
});
app.get('/api/cloud/status', (req, res) => res.json(cloud.getStatus()));
app.post('/api/cloud/scale-up', async (req, res) => {
  const nodeId = await cloud.spawnNode();
  res.json({ success: true, nodeId });
});
app.get('/health', (req, res) => res.json({ status: 'alive' }));

app.listen(port, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   💀 AI GALAXY CORE V116 ONLINE 💀     ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  🔗 GitHub:    ${gitManager ? '✅ CONNECTED' : '❌ NOT CONFIGURED'}     ║`);
  console.log(`║  ☁️ Cloud:      ${cloud.nodes.length} active nodes          ║`);
  console.log(`║  🌐 Port:      ${port}                      ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('🌐 GitHub расширенные функции активированы');
});
