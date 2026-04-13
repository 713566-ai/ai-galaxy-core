// ========== REAL CLOUD ORCHESTRATOR ==========
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class RealCloudOrchestrator {
  constructor() {
    this.nodes = [];
    this.processes = [];
    this.useDocker = false; // Сначала локальные процессы, потом Docker
  }

  // 1. СОЗДАНИЕ DOCKER ОБРАЗА
  async buildDockerImage() {
    console.log('🐳 Сборка Docker образа...');
    
    const dockerfile = `FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY core-v110.js .
COPY .env .
EXPOSE 3000
CMD ["node", "core-v110.js"]`;
    
    fs.writeFileSync('./Dockerfile', dockerfile);
    
    exec('docker build -t ai-galaxy:latest .', (error, stdout) => {
      if (error) {
        console.log('⚠️ Docker не установлен, использую локальные процессы');
        this.useDocker = false;
      } else {
        console.log('✅ Docker образ создан');
        this.useDocker = true;
      }
    });
  }

  // 2. ЗАПУСК ЛОКАЛЬНОГО ПРОЦЕССА (копия ядра)
  async spawnLocalNode() {
    const nodeId = `node_local_${Date.now()}`;
    const nodePort = 3000 + this.processes.length + 1;
    
    console.log(`🖥️ Запуск локальной ноды: ${nodeId} на порту ${nodePort}`);
    
    // Запускаем копию ядра в отдельном процессе
    const env = { ...process.env, PORT: nodePort, NODE_ID: nodeId };
    const child = spawn('node', ['core-v110.js'], { 
      env: env,
      detached: true,
      stdio: 'pipe'
    });
    
    child.stdout.on('data', (data) => {
      console.log(`[${nodeId}] ${data.toString().trim()}`);
    });
    
    child.unref();
    
    this.processes.push({ id: nodeId, process: child, port: nodePort, type: 'local' });
    this.nodes.push({ id: nodeId, port: nodePort, status: 'running', type: 'local' });
    
    return nodeId;
  }

  // 3. ЗАПУСК DOCKER КОНТЕЙНЕРА
  async spawnDockerNode() {
    const nodeId = `node_docker_${Date.now()}`;
    const nodePort = 3000 + this.processes.length + 1;
    
    console.log(`🐳 Запуск Docker контейнера: ${nodeId} на порту ${nodePort}`);
    
    exec(`docker run -d --name ${nodeId} -p ${nodePort}:3000 -e PORT=3000 ai-galaxy:latest`, (error, stdout) => {
      if (error) {
        console.log(`⚠️ Ошибка запуска Docker: ${error.message}`);
        return null;
      }
      console.log(`✅ Контейнер запущен: ${stdout.trim()}`);
    });
    
    this.nodes.push({ id: nodeId, port: nodePort, status: 'running', type: 'docker' });
    return nodeId;
  }

  // 4. ЗАПУСК НОДЫ (автовыбор)
  async spawnNode(type = 'auto') {
    let nodeId;
    
    if (type === 'docker' || (this.useDocker && type === 'auto')) {
      nodeId = await this.spawnDockerNode();
    } else {
      nodeId = await this.spawnLocalNode();
    }
    
    // Логируем в GitHub
    if (global.gitManager) {
      try {
        await global.gitManager.createRepo(`node_${nodeId}`);
      } catch(e) {}
    }
    
    return nodeId;
  }

  // 5. ОСТАНОВКА НОДЫ
  async destroyNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    if (node.type === 'local') {
      const proc = this.processes.find(p => p.id === nodeId);
      if (proc && proc.process) {
        proc.process.kill('SIGTERM');
        console.log(`🛑 Локальная нода остановлена: ${nodeId}`);
      }
    } else if (node.type === 'docker') {
      exec(`docker stop ${nodeId} && docker rm ${nodeId}`, (error) => {
        if (!error) console.log(`🛑 Docker контейнер остановлен: ${nodeId}`);
      });
    }
    
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.processes = this.processes.filter(p => p.id !== nodeId);
    
    return true;
  }

  // 6. СТАТУС ВСЕХ НОД
  getStatus() {
    return {
      activeNodes: this.nodes.length,
      nodes: this.nodes,
      avgLoad: (this.nodes.length * 0.2).toFixed(2),
      types: {
        local: this.nodes.filter(n => n.type === 'local').length,
        docker: this.nodes.filter(n => n.type === 'docker').length
      }
    };
  }

  // 7. МАСШТАБИРОВАНИЕ (авто)
  async autoScale(entropy) {
    const targetNodes = Math.min(10, Math.max(1, Math.floor(entropy * 10)));
    const currentNodes = this.nodes.length;
    
    if (targetNodes > currentNodes) {
      const toAdd = targetNodes - currentNodes;
      console.log(`📈 Масштабирование: +${toAdd} нод (энтропия: ${entropy})`);
      for (let i = 0; i < toAdd; i++) {
        await this.spawnNode();
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

// Глобальный экземпляр
const realCloud = new RealCloudOrchestrator();

// Авто-билд Docker образа при старте
setTimeout(() => realCloud.buildDockerImage(), 5000);

// API для реального оркестратора
app.post('/api/real/scale-up', async (req, res) => {
  const nodeId = await realCloud.spawnNode(req.body.type || 'auto');
  res.json({ success: true, nodeId: nodeId, type: realCloud.nodes.find(n => n.id === nodeId)?.type });
});

app.post('/api/real/scale-down/:nodeId', async (req, res) => {
  const result = await realCloud.destroyNode(req.params.nodeId);
  res.json({ success: result });
});

app.get('/api/real/status', (req, res) => {
  res.json(realCloud.getStatus());
});

app.post('/api/real/auto-scale', async (req, res) => {
  await realCloud.autoScale(req.body.entropy || 0.7);
  res.json(realCloud.getStatus());
});

console.log('☁️ Real Cloud Orchestrator активирован');
console.log('   - Локальные процессы: ✅');
console.log('   - Docker контейнеры: ⏳ (проверяется)');
