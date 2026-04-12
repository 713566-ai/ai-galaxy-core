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
