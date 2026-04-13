// ========== V112 CLOUD ORCHESTRATOR ==========
// ВНИМАНИЕ: без повторного объявления require('fs') и других

class CloudOrchestrator {
  constructor() {
    this.nodes = [];
    this.deployments = [];
    this.loadHistory = [];
  }

  // Оценка текущей нагрузки
  assessLoad(world) {
    const load = {
      entropy: world.entropy || 0.5,
      agentCount: world.agents?.length || 0,
      godCount: world.gods?.length || 0,
      activeConflicts: world.conflicts?.length || 0,
      timestamp: Date.now()
    };
    
    load.total = Math.min(1, 
      (load.entropy * 0.4) + 
      (load.agentCount / 100) * 0.3 + 
      (load.activeConflicts / 10) * 0.3
    );
    
    this.loadHistory.push(load);
    if (this.loadHistory.length > 100) this.loadHistory.shift();
    
    return load;
  }

  // Решение о масштабировании
  makeDecision(load) {
    if (load.total > 0.8 || load.entropy > 0.85) {
      return { action: 'SCALE_UP', priority: 'HIGH', reason: `Высокая нагрузка: ${load.total.toFixed(2)}` };
    }
    
    if (load.total > 0.6 && this.loadHistory.length > 10) {
      const avgLoad = this.loadHistory.slice(-10).reduce((a,b) => a + b.total, 0) / 10;
      if (avgLoad > 0.6) {
        return { action: 'SCALE_UP', priority: 'MEDIUM', reason: `Стабильно высокая нагрузка: ${avgLoad.toFixed(2)}` };
      }
    }
    
    if (load.total < 0.3 && this.nodes.length > 1) {
      return { action: 'SCALE_DOWN', priority: 'LOW', reason: `Низкая нагрузка: ${load.total.toFixed(2)}` };
    }
    
    return { action: 'STABLE', priority: 'NONE', reason: 'Нормальная нагрузка' };
  }

  // Создание новой ноды
  async spawnNode(worldId, region = 'default') {
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nodePort = 3000 + this.nodes.length + 1;
    
    console.log(`☁️ Запуск новой ноды: ${nodeId} на порту ${nodePort}`);
    
    const newNode = {
      id: nodeId,
      port: nodePort,
      region: region,
      startedAt: Date.now(),
      status: 'running'
    };
    
    this.nodes.push(newNode);
    
    // Логируем в GitHub
    if (typeof gitManager !== 'undefined' && gitManager) {
      try {
        await gitManager.pushUniverseState(`deploy_${nodeId}`, newNode);
      } catch(e) {}
    }
    
    return newNode;
  }

  // Остановка ноды
  async destroyNode(nodeId) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    console.log(`☁️ Остановка ноды: ${nodeId}`);
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    return true;
  }

  // Автоматическое управление
  async autoManage(world) {
    const load = this.assessLoad(world);
    const decision = this.makeDecision(load);
    
    if (decision.action === 'SCALE_UP') {
      console.log(`📈 ${decision.priority}: ${decision.reason}`);
      const newNode = await this.spawnNode(world.id || 'U0', `region_${this.nodes.length + 1}`);
      return { action: 'scaled_up', node: newNode };
    }
    
    if (decision.action === 'SCALE_DOWN') {
      console.log(`📉 ${decision.reason}`);
      const nodeToRemove = this.nodes[this.nodes.length - 1];
      if (nodeToRemove) {
        await this.destroyNode(nodeToRemove.id);
        return { action: 'scaled_down', node: nodeToRemove };
      }
    }
    
    return { action: 'stable', load: load.total };
  }

  // Статус оркестратора
  getStatus() {
    return {
      activeNodes: this.nodes.length,
      nodes: this.nodes.map(n => ({ id: n.id, port: n.port, status: n.status })),
      avgLoad: this.loadHistory.slice(-10).reduce((a,b) => a + b.total, 0) / 10 || 0,
      totalDeployments: this.deployments.length
    };
  }
}

// Глобальный экземпляр
const cloudOrchestrator = new CloudOrchestrator();

// API для управления облаком
app.get('/api/cloud/status', (req, res) => {
  res.json(cloudOrchestrator.getStatus());
});

app.post('/api/cloud/scale-up', async (req, res) => {
  const node = await cloudOrchestrator.spawnNode('U0', req.body?.region || 'default');
  res.json({ success: true, node: node });
});

app.post('/api/cloud/scale-down/:nodeId', async (req, res) => {
  const result = await cloudOrchestrator.destroyNode(req.params.nodeId);
  res.json({ success: result });
});

// Автоматическое управление каждые 30 секунд
setInterval(async () => {
  const worldState = {
    entropy: typeof globalCurrentEntropy !== 'undefined' ? globalCurrentEntropy : 0.5,
    agents: typeof globalAgents !== 'undefined' ? globalAgents : [],
    gods: typeof globalGods !== 'undefined' ? globalGods : [],
    conflicts: typeof globalConflicts !== 'undefined' ? globalConflicts : []
  };
  const result = await cloudOrchestrator.autoManage(worldState);
  if (result.action !== 'stable') {
    console.log(`☁️ Cloud Orchestrator: ${result.action}`);
  }
}, 30000);

console.log('☁️ Cloud Orchestrator V112 активирован');
// ========== END CLOUD ORCHESTRATOR ==========
