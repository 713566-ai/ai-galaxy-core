require('dotenv').config();
const express = require('express');
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs');

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

console.log('🚀 AI Galaxy запускается на Replit...');

// GitHub Manager
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

// Cloud Orchestrator
class CloudOrchestrator {
  constructor() {
    this.nodes = [];
  }
  async spawnNode() {
    const nodeId = `node_${Date.now()}`;
    this.nodes.push({ id: nodeId, status: 'running', type: 'virtual' });
    console.log('☁️ Нода создана:', nodeId);
    return nodeId;
  }
  getStatus() {
    return { activeNodes: this.nodes.length, nodes: this.nodes };
  }
}
const cloud = new CloudOrchestrator();

// API Routes
app.get('/', (req, res) => {
  res.json({
    status: 'AI Galaxy Core on Replit',
    github: !!gitManager,
    cloud: cloud.getStatus(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/github/status', (req, res) => {
  res.json({ configured: !!gitManager, username: username || null });
});

app.post('/api/github/create-repo', async (req, res) => {
  if (!gitManager) return res.status(500).json({ error: 'GitHub not configured' });
  const repo = await gitManager.createRepo('replit-' + Date.now());
  res.json({ success: true, url: repo.html_url });
});

app.get('/api/cloud/status', (req, res) => {
  res.json(cloud.getStatus());
});

app.post('/api/cloud/scale-up', async (req, res) => {
  const nodeId = await cloud.spawnNode();
  res.json({ success: true, nodeId: nodeId });
});

app.get('/health', (req, res) => {
  res.json({ status: 'alive', timestamp: Date.now() });
});

app.listen(port, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   💀 AI GALAXY ON REPLIT 💀            ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  🔗 GitHub:    ' + (gitManager ? '✅ CONNECTED' : '❌ NOT CONFIGURED') + '     ║');
  console.log('║  ☁️ Cloud:      ' + cloud.nodes.length + ' virtual nodes       ║');
  console.log('║  🌐 Port:      ' + port + '                      ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});
