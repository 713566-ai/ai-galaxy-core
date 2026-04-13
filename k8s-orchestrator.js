// ========== V116 KUBERNETES ORCHESTRATOR ==========
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class KubernetesOrchestrator {
  constructor() {
    this.clusters = [];
    this.namespaces = [];
    this.deployments = [];
    this.autoScalingEnabled = true;
  }

  // Генерация Dockerfile для ядра
  generateDockerfile() {
    const dockerfile = `FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "core-v110.js"]`;
    
    fs.writeFileSync('./Dockerfile', dockerfile);
    console.log('🐳 Dockerfile создан');
  }

  // Генерация Kubernetes deployment
  generateK8sDeployment(universeId, replicas = 1) {
    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: `ai-galaxy-${universeId}`,
        namespace: `universe-${universeId}`,
        labels: { app: 'ai-galaxy', universe: universeId }
      },
      spec: {
        replicas: replicas,
        selector: { matchLabels: { app: 'ai-galaxy', universe: universeId } },
        template: {
          metadata: { labels: { app: 'ai-galaxy', universe: universeId } },
          spec: {
            containers: [{
              name: 'galaxy-core',
              image: `ghcr.io/${process.env.GITHUB_USERNAME}/ai-galaxy:${universeId}`,
              ports: [{ containerPort: 3000 }],
              env: [
                { name: 'GITHUB_TOKEN', valueFrom: { secretKeyRef: { name: 'github-secret', key: 'token' } } },
                { name: 'UNIVERSE_ID', value: universeId }
              ],
              resources: {
                limits: { cpu: '500m', memory: '512Mi' },
                requests: { cpu: '250m', memory: '256Mi' }
              }
            }]
          }
        }
      }
    };
    
    const service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: `ai-galaxy-svc-${universeId}`, namespace: `universe-${universeId}` },
      spec: {
        selector: { app: 'ai-galaxy', universe: universeId },
        ports: [{ port: 80, targetPort: 3000 }],
        type: 'ClusterIP'
      }
    };
    
    return { deployment, service };
  }

  // Применение Kubernetes конфигов
  async applyToK8s(universeId) {
    const { deployment, service } = this.generateK8sDeployment(universeId);
    
    // Создаём namespace
    await this.execKubectl(`create namespace universe-${universeId}`, true);
    
    // Применяем deployment
    const deploymentYaml = JSON.stringify(deployment, null, 2);
    fs.writeFileSync('/tmp/deploy.yaml', deploymentYaml);
    await this.execKubectl(`apply -f /tmp/deploy.yaml`);
    
    // Применяем service
    const serviceYaml = JSON.stringify(service, null, 2);
    fs.writeFileSync('/tmp/service.yaml', serviceYaml);
    await this.execKubectl(`apply -f /tmp/service.yaml`);
    
    console.log(`☸️ Вселенная ${universeId} развёрнута в Kubernetes`);
    return { namespace: `universe-${universeId}`, deployment: deployment.metadata.name };
  }

  // Выполнение kubectl команд
  async execKubectl(command, ignoreError = false) {
    return new Promise((resolve) => {
      exec(`kubectl ${command}`, (error, stdout, stderr) => {
        if (error && !ignoreError) {
          console.log(`⚠️ Kubectl error: ${stderr}`);
        }
        resolve(stdout || stderr);
      });
    });
  }

  // Масштабирование deployment
  async scaleUniverse(universeId, replicas) {
    const result = await this.execKubectl(`scale deployment ai-galaxy-${universeId} --replicas=${replicas} -n universe-${universeId}`);
    console.log(`📊 Вселенная ${universeId} масштабирована до ${replicas} подов`);
    return result;
  }

  // Получение статуса всех вселенных в кластере
  async getClusterStatus() {
    const namespaces = await this.execKubectl('get namespaces -o json');
    try {
      const nsData = JSON.parse(namespaces);
      const universeNamespaces = nsData.items
        .filter(ns => ns.metadata.name.startsWith('universe-'))
        .map(ns => ({ name: ns.metadata.name, created: ns.metadata.creationTimestamp }));
      
      const statuses = [];
      for (const ns of universeNamespaces) {
        const pods = await this.execKubectl(`get pods -n ${ns.name} -o json`);
        try {
          const podData = JSON.parse(pods);
          statuses.push({
            universe: ns.name.replace('universe-', ''),
            pods: podData.items.length,
            running: podData.items.filter(p => p.status.phase === 'Running').length
          });
        } catch(e) {}
      }
      return { clusters: statuses, totalUniverses: universeNamespaces.length };
    } catch(e) {
      return { error: 'Kubectl not available', clusters: [] };
    }
  }

  // Интеграция с V113 сплитом
  async onUniverseSplit(newUniverse) {
    console.log(`☸️ Авто-деплой новой вселенной в K8s: ${newUniverse.id}`);
    
    // Создаём Docker образ
    this.generateDockerfile();
    
    // Деплоим в Kubernetes
    const result = await this.applyToK8s(newUniverse.id);
    
    // Масштабируем в зависимости от энтропии
    const replicas = newUniverse.entropy > 0.7 ? 3 : 1;
    await this.scaleUniverse(newUniverse.id, replicas);
    
    return result;
  }

  // Автоматическое масштабирование на основе нагрузки
  async autoScale() {
    if (!this.autoScalingEnabled) return;
    
    const status = await this.getClusterStatus();
    for (const universe of status.clusters) {
      // Симуляция: если подов мало для этой вселенной
      const targetReplicas = universe.running < 2 ? 2 : 1;
      if (targetReplicas !== universe.pods) {
        await this.scaleUniverse(universe.universe, targetReplicas);
      }
    }
  }
}

// Глобальный экземпляр
const k8sOrchestrator = new KubernetesOrchestrator();

// API для Kubernetes
app.get('/api/k8s/status', async (req, res) => {
  const status = await k8sOrchestrator.getClusterStatus();
  res.json(status);
});

app.post('/api/k8s/deploy', async (req, res) => {
  const universeId = req.body.universeId || 'U_' + Date.now();
  const result = await k8sOrchestrator.applyToK8s(universeId);
  res.json({ success: true, ...result });
});

app.post('/api/k8s/scale/:universeId/:replicas', async (req, res) => {
  const result = await k8sOrchestrator.scaleUniverse(req.params.universeId, parseInt(req.params.replicas));
  res.json({ success: true, result: result });
});

app.post('/api/k8s/auto-scale', async (req, res) => {
  await k8sOrchestrator.autoScale();
  res.json({ success: true });
});

// Интеграция со сплитом (перехватываем создание новой вселенной)
const originalCheckSplit = checkSplit;
checkSplit = async function(worldState) {
  const newUniverse = await originalCheckSplit(worldState);
  if (newUniverse) {
    await k8sOrchestrator.onUniverseSplit(newUniverse);
  }
  return newUniverse;
};

// Автоматическое масштабирование каждые 60 секунд
setInterval(async () => {
  await k8sOrchestrator.autoScale();
}, 60000);

console.log('☸️ Kubernetes Orchestrator V116 активирован');
console.log('   Для работы требуется: kubectl и доступ к кластеру');
// ========== END V116 ==========
