const express = require('express');
const fs = require('fs');
const net = require('net');
const axios = require('axios');
const WebSocket = require('ws');
const app = express();
const PORT = 3004;

console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║   🔗 AI GALAXY CORE - FREELANCER UNIVERSAL CONNECTOR                        ║
║   🎮 Game Server | 💼 Freelance Platform | 🤖 AI Agents | 💰 Economy        ║
║   ⚡ Real-time Sync | 📊 Analytics | 🔌 Plug & Play                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

// ========== КОНФИГУРАЦИЯ ==========
const CONFIG = {
  // AI Core
  aiCoreUrl: process.env.AI_CORE_URL || 'http://localhost:3000',
  
  // Freelancer FLHook
  flhookHost: process.env.FLHOOK_HOST || 'localhost',
  flhookPort: parseInt(process.env.FLHOOK_PORT) || 2302,
  flhookPassword: process.env.FLHOOK_PASSWORD || 'admin',
  
  // Freelance Platform
  freelanceApiKey: process.env.FREELANCE_API_KEY || '',
  platformWebhook: process.env.PLATFORM_WEBHOOK || '',
  
  // Business
  businessName: process.env.BUSINESS_NAME || 'AI Galaxy Core',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@aigalaxy.com',
  
  // Sync
  syncInterval: 5000,
  autoSave: true,
  
  // Pricing
  pricing: {
    basic: { monthly: 29.99, requests: 10000, agents: 100 },
    pro: { monthly: 99.99, requests: 50000, agents: 500 },
    enterprise: { monthly: 299.99, requests: 500000, agents: 2000 }
  }
};

// ========== БАЗА ДАННЫХ КЛИЕНТОВ ==========
class ClientDatabase {
  constructor() {
    this.clients = {};
    this.load();
  }
  
  load() {
    try {
      if (fs.existsSync('freelancer_clients.json')) {
        this.clients = JSON.parse(fs.readFileSync('freelancer_clients.json'));
        console.log(`📂 Loaded ${Object.keys(this.clients).length} clients`);
      }
    } catch(e) {}
  }
  
  save() {
    fs.writeFileSync('freelancer_clients.json', JSON.stringify(this.clients, null, 2));
  }
  
  createClient(data) {
    const id = Date.now().toString();
    const apiKey = 'fl_' + Math.random().toString(36).substr(2, 32);
    
    this.clients[id] = {
      id,
      apiKey,
      name: data.name,
      email: data.email,
      plan: data.plan || 'basic',
      server: data.server || {},
      createdAt: Date.now(),
      stats: {
        requests: 0,
        players: 0,
        npcs: 0,
        trades: 0
      },
      settings: {
        autoSync: true,
        notifications: true,
        webhook: data.webhook || null
      }
    };
    
    this.save();
    return this.clients[id];
  }
  
  getClientByApiKey(apiKey) {
    return Object.values(this.clients).find(c => c.apiKey === apiKey);
  }
  
  updateStats(clientId, stats) {
    if (this.clients[clientId]) {
      Object.assign(this.clients[clientId].stats, stats);
      this.save();
    }
  }
}

const db = new ClientDatabase();

// ========== FLHOOK КОННЕКТОР ==========
class FLHookConnector {
  constructor() {
    this.connections = new Map(); // clientId -> socket
    this.status = {};
  }
  
  connect(clientId, config) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(config.port, config.host, () => {
        console.log(`✅ FLHook connected for client ${clientId}`);
        this.connections.set(clientId, socket);
        this.status[clientId] = { connected: true, lastSync: Date.now() };
        
        socket.on('data', (data) => {
          this.handleData(clientId, data.toString());
        });
        
        socket.on('error', (err) => {
          console.error(`FLHook error for ${clientId}:`, err);
          this.status[clientId] = { connected: false, error: err.message };
        });
        
        resolve(socket);
      });
      
      socket.on('error', reject);
    });
  }
  
  handleData(clientId, data) {
    // Парсим данные от FLHook
    const lines = data.split('\n');
    for (let line of lines) {
      if (line.startsWith('MSG:')) {
        this.handleMessage(clientId, line);
      } else if (line.startsWith('PLAYER:')) {
        this.handlePlayerEvent(clientId, line);
      } else if (line.startsWith('TRADE:')) {
        this.handleTradeEvent(clientId, line);
      }
    }
  }
  
  handleMessage(clientId, line) {
    const match = line.match(/MSG: (.*?) says: (.*)/);
    if (match) {
      const [, player, message] = match;
      this.processCommand(clientId, player, message);
    }
  }
  
  processCommand(clientId, player, command) {
    const client = db.clients[clientId];
    if (!client) return;
    
    if (command.startsWith('!economy')) {
      this.sendCommand(clientId, `msg ${player} 📊 Current market prices: Energy: $${Math.floor(Math.random() * 100 + 50)}`);
    } else if (command.startsWith('!agents')) {
      this.getAIAgents(clientId).then(agents => {
        this.sendCommand(clientId, `msg ${player} 🤖 Active AI agents: ${agents.length}`);
      });
    } else if (command.startsWith('!spawn')) {
      const agentId = command.split(' ')[1];
      this.spawnAINPC(clientId, player, agentId);
    }
  }
  
  sendCommand(clientId, command) {
    const socket = this.connections.get(clientId);
    if (socket) {
      socket.write(command + '\n');
    }
  }
  
  async getAIAgents(clientId) {
    try {
      const response = await axios.get(`${CONFIG.aiCoreUrl}/api/agents`);
      return response.data.agents;
    } catch (error) {
      return [];
    }
  }
  
  async spawnAINPC(clientId, player, agentId) {
    const agents = await this.getAIAgents(clientId);
    const agent = agents.find(a => a.id == agentId);
    
    if (agent) {
      this.sendCommand(clientId, `msg ${player} ✨ Spawning AI NPC: ${agent.role} (Wealth: ${agent.wealth})`);
      this.sendCommand(clientId, `spawn li_fighter Li01 0 0 0`);
    }
  }
  
  handlePlayerEvent(clientId, line) {
    // Обработка событий игроков
    console.log(`👤 Player event for ${clientId}: ${line}`);
  }
  
  handleTradeEvent(clientId, line) {
    // Обработка торговых событий
    console.log(`💰 Trade event for ${clientId}: ${line}`);
  }
}

const flhook = new FLHookConnector();

// ========== FREELANCE ПЛАТФОРМА ИНТЕГРАЦИЯ ==========
class FreelancePlatform {
  constructor() {
    this.platforms = {
      upwork: { active: false, webhook: null },
      fiverr: { active: false, webhook: null },
      toptal: { active: false, webhook: null }
    };
  }
  
  async createGig(platform, data) {
    const gigTemplate = {
      title: `AI-Powered Freelancer Server - ${CONFIG.businessName}`,
      description: `
        🚀 Transform your Freelancer server with AI!
        
        Features:
        ✅ Dynamic economy based on 500+ AI agents
        ✅ Smart NPCs that trade, fight, and explore
        ✅ Real-time market prices
        ✅ Automated events and missions
        ✅ Full FLHook integration
        ✅ Web dashboard with analytics
        
        Plans:
        • Basic: $${CONFIG.pricing.basic.monthly}/month - ${CONFIG.pricing.basic.requests} requests/day
        • Pro: $${CONFIG.pricing.pro.monthly}/month - ${CONFIG.pricing.pro.requests} requests/day  
        • Enterprise: Custom pricing - Unlimited
        
        Includes:
        📊 Real-time monitoring
        🔧 24/7 technical support
        📈 Analytics dashboard
        🎮 Custom NPC behaviors
        💰 Dynamic pricing system
        
        Get started in 10 minutes!
      `,
      price: data.price || CONFIG.pricing.basic.monthly,
      delivery: '24 hours',
      revisions: 3
    };
    
    // Здесь интеграция с API платформ
    console.log(`📝 Created gig on ${platform}:`, gigTemplate.title);
    
    return { success: true, gig: gigTemplate };
  }
  
  async processOrder(order) {
    const client = db.createClient({
      name: order.clientName,
      email: order.clientEmail,
      plan: order.plan || 'basic',
      server: {
        host: order.serverHost,
        port: order.serverPort
      }
    });
    
    // Отправляем приветственное письмо
    await this.sendWelcomeEmail(client);
    
    // Создаем конфигурацию для клиента
    const config = this.generateConfig(client);
    
    return { client, config };
  }
  
  async sendWelcomeEmail(client) {
    const emailContent = `
      Welcome to ${CONFIG.businessName}!
      
      Your API Key: ${client.apiKey}
      
      Quick Start:
      1. Install FLHook plugin
      2. Configure with your API key
      3. Run the connector
      
      Dashboard: http://localhost:3004/client/${client.id}
      Documentation: http://localhost:3004/docs
      
      Need help? Contact: ${CONFIG.supportEmail}
    `;
    
    console.log(`📧 Welcome email sent to ${client.email}`);
    // Здесь реальная отправка email
  }
  
  generateConfig(client) {
    return {
      apiKey: client.apiKey,
      aiCoreUrl: CONFIG.aiCoreUrl,
      syncInterval: CONFIG.syncInterval,
      features: {
        economy: true,
        npcBehavior: true,
        events: true,
        analytics: true
      }
    };
  }
}

const freelance = new FreelancePlatform();

// ========== AI CORE КЛИЕНТ ==========
class AICoreClient {
  constructor() {
    this.cache = {
      agents: [],
      market: {},
      history: {}
    };
  }
  
  async sync() {
    try {
      const [agents, market, status] = await Promise.all([
        axios.get(`${CONFIG.aiCoreUrl}/api/agents`),
        axios.get(`${CONFIG.aiCoreUrl}/api/market`),
        axios.get(`${CONFIG.aiCoreUrl}/api/status`)
      ]);
      
      this.cache.agents = agents.data.agents;
      this.cache.market = market.data;
      this.cache.status = status.data;
      
      return true;
    } catch (error) {
      console.error('AI Core sync failed:', error.message);
      return false;
    }
  }
  
  getAgents() {
    return this.cache.agents;
  }
  
  getMarket() {
    return this.cache.market;
  }
  
  getStats() {
    return this.cache.status;
  }
}

const aiCore = new AICoreClient();

// ========== API ЭНДПОИНТЫ ==========

// Регистрация нового клиента
app.post('/api/register', express.json(), (req, res) => {
  const { name, email, plan, server } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  
  const client = db.createClient({ name, email, plan, server });
  
  res.json({
    success: true,
    client: {
      id: client.id,
      apiKey: client.apiKey,
      name: client.name,
      plan: client.plan
    },
    config: {
      apiEndpoint: `http://localhost:${PORT}/api/client/${client.id}`,
      flhookConfig: {
        host: CONFIG.flhookHost,
        port: CONFIG.flhookPort
      }
    }
  });
});

// Подключение FLHook
app.post('/api/connect', express.json(), (req, res) => {
  const { apiKey, flhookConfig } = req.body;
  const client = db.getClientByApiKey(apiKey);
  
  if (!client) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  flhook.connect(client.id, flhookConfig || {
    host: CONFIG.flhookHost,
    port: CONFIG.flhookPort
  });
  
  res.json({ success: true, message: 'Connecting to FLHook...' });
});

// Получить данные для клиента
app.get('/api/client/:clientId', async (req, res) => {
  const client = db.clients[req.params.clientId];
  
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  
  await aiCore.sync();
  
  res.json({
    client: {
      name: client.name,
      plan: client.plan,
      stats: client.stats
    },
    aiCore: {
      agents: aiCore.getAgents().length,
      market: aiCore.getMarket(),
      status: aiCore.getStats()
    },
    flhook: flhook.status[client.id] || { connected: false }
  });
});

// Создать gig на фриланс-платформе
app.post('/api/create-gig', express.json(), (req, res) => {
  const { platform, price, description } = req.body;
  
  freelance.createGig(platform, { price, description }).then(result => {
    res.json(result);
  });
});

// Обработка заказа с платформы
app.post('/api/order', express.json(), (req, res) => {
  const { platform, orderData } = req.body;
  
  freelance.processOrder(orderData).then(result => {
    res.json(result);
  });
});

// Вебхук для платформ
app.post('/webhook/:platform', express.json(), (req, res) => {
  const platform = req.params.platform;
  const event = req.body;
  
  console.log(`📨 Webhook from ${platform}:`, event.type);
  
  // Обработка вебхуков от платформ
  res.json({ success: true });
});

// Синхронизация с AI Core
app.post('/api/sync', async (req, res) => {
  const success = await aiCore.sync();
  res.json({ success, data: aiCore.cache });
});

// Получить статистику
app.get('/api/stats', (req, res) => {
  const clients = Object.values(db.clients);
  
  res.json({
    totalClients: clients.length,
    activeClients: clients.filter(c => flhook.status[c.id]?.connected).length,
    totalRequests: clients.reduce((sum, c) => sum + (c.stats.requests || 0), 0),
    plans: {
      basic: clients.filter(c => c.plan === 'basic').length,
      pro: clients.filter(c => c.plan === 'pro').length,
      enterprise: clients.filter(c => c.plan === 'enterprise').length
    },
    revenue: clients.reduce((sum, c) => {
      const prices = { basic: 29.99, pro: 99.99, enterprise: 299.99 };
      return sum + (prices[c.plan] || 0);
    }, 0)
  });
});

// ========== ВЕБ-ИНТЕРФЕЙС ДЛЯ КЛИЕНТОВ ==========
app.get('/client/:clientId', async (req, res) => {
  const client = db.clients[req.params.clientId];
  
  if (!client) {
    return res.status(404).send('Client not found');
  }
  
  await aiCore.sync();
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${client.name} - AI Galaxy Dashboard</title>
        <style>
            body {
                font-family: monospace;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .card {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .status {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 5px;
                font-weight: bold;
            }
            .online { background: #4CAF50; }
            .offline { background: #f44336; }
            .stat {
                font-size: 2em;
                font-weight: bold;
                color: #FFD700;
            }
            button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 ${CONFIG.businessName}</h1>
            <h3>Client: ${client.name} | Plan: ${client.plan.toUpperCase()}</h3>
            
            <div class="card">
                <h2>📊 Server Status</h2>
                <div class="status ${flhook.status[client.id]?.connected ? 'online' : 'offline'}">
                    ${flhook.status[client.id]?.connected ? '🟢 ONLINE' : '🔴 OFFLINE'}
                </div>
                <p>Last sync: ${new Date(flhook.status[client.id]?.lastSync || Date.now()).toLocaleString()}</p>
            </div>
            
            <div class="card">
                <h2>🤖 AI Galaxy Core</h2>
                <div class="stat">${aiCore.getAgents().length} Agents</div>
                <div>💰 Market: ${Object.keys(aiCore.getMarket()).length} resources</div>
                <div>📈 Generation: ${aiCore.getStats()?.generation || 0}</div>
                <button onclick="sync()">🔄 Sync Now</button>
            </div>
            
            <div class="card">
                <h2>📊 Your Stats</h2>
                <div>👥 Players online: ${client.stats.players || 0}</div>
                <div>🤖 AI NPCs: ${client.stats.npcs || 0}</div>
                <div>💰 Trades: ${client.stats.trades || 0}</div>
                <div>📡 API requests: ${client.stats.requests || 0}</div>
            </div>
            
            <div class="card">
                <h2>🔧 Quick Commands</h2>
                <button onclick="sendCommand('!economy')">💰 Show Economy</button>
                <button onclick="sendCommand('!agents')">🤖 Show Agents</button>
                <button onclick="sendCommand('!spawn')">✨ Spawn AI NPC</button>
            </div>
        </div>
        
        <script>
            async function sync() {
                const response = await fetch('/api/sync', { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    alert('✅ Synced with AI Core!');
                    location.reload();
                }
            }
            
            async function sendCommand(cmd) {
                const response = await fetch('/api/flhook/message', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({apiKey: '${client.apiKey}', command: cmd})
                });
                alert('Command sent!');
            }
            
            setInterval(() => location.reload(), 30000);
        </script>
    </body>
    </html>
  `);
});

// Документация API
app.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>API Documentation - AI Galaxy Connector</title>
        <style>
            body {
                font-family: monospace;
                background: #1e1e1e;
                color: #fff;
                padding: 20px;
            }
            .endpoint {
                background: #2d2d2d;
                padding: 15px;
                margin: 10px 0;
                border-radius: 5px;
                border-left: 4px solid #4CAF50;
            }
            code {
                background: #000;
                padding: 2px 5px;
                border-radius: 3px;
            }
        </style>
    </head>
    <body>
        <h1>🔌 AI Galaxy Core - Freelancer Connector API</h1>
        
        <h2>Client Management</h2>
        <div class="endpoint">
            <strong>POST /api/register</strong><br>
            Register new client<br>
            <code>{"name": "Server Name", "email": "admin@server.com", "plan": "basic"}</code>
        </div>
        
        <div class="endpoint">
            <strong>POST /api/connect</strong><br>
            Connect to FLHook<br>
            <code>{"apiKey": "your_key", "flhookConfig": {"host": "localhost", "port": 2302}}</code>
        </div>
        
        <h2>Freelance Platforms</h2>
        <div class="endpoint">
            <strong>POST /api/create-gig</strong><br>
            Create gig on freelance platform<br>
            <code>{"platform": "upwork", "price": 299, "description": "..."}</code>
        </div>
        
        <div class="endpoint">
            <strong>POST /api/order</strong><br>
            Process order from platform<br>
            <code>{"platform": "fiverr", "orderData": {...}}</code>
        </div>
        
        <h2>Data & Sync</h2>
        <div class="endpoint">
            <strong>GET /api/client/{clientId}</strong><br>
            Get client dashboard data
        </div>
        
        <div class="endpoint">
            <strong>POST /api/sync</strong><br>
            Force sync with AI Core
        </div>
        
        <h2>Quick Start</h2>
        <pre>
# 1. Register your server
curl -X POST http://localhost:3004/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"My Server","email":"admin@myserver.com","plan":"basic"}'

# 2. Connect to FLHook
curl -X POST http://localhost:3004/api/connect \
  -H "Content-Type: application/json" \
  -d '{"apiKey":"YOUR_API_KEY","flhookConfig":{"host":"localhost","port":2302}}'

# 3. Start syncing
curl -X POST http://localhost:3004/api/sync
        </pre>
        
        <p>📧 Support: ${CONFIG.supportEmail}</p>
    </body>
    </html>
  `);
});

// ========== АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ==========
setInterval(async () => {
  await aiCore.sync();
  
  // Синхронизируем со всеми подключенными клиентами
  for (const [clientId, client] of Object.entries(db.clients)) {
    if (flhook.status[clientId]?.connected) {
      const agents = aiCore.getAgents();
      
      // Обновляем экономику в FLHook
      flhook.sendCommand(clientId, 'setmarket fuel ' + (50 + Math.random() * 50));
      flhook.sendCommand(clientId, 'setmarket ore ' + (100 + Math.random() * 100));
      
      // Обновляем статистику клиента
      db.updateStats(clientId, {
        requests: (client.stats.requests || 0) + 1,
        npcs: agents.length
      });
    }
  }
}, CONFIG.syncInterval);

// ========== ЗАПУСК ==========
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Freelancer Connector running on http://localhost:${PORT}`);
  console.log(`📱 Client Dashboard: http://localhost:${PORT}/client/{clientId}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`\n🔗 Connected Services:`);
  console.log(`   - AI Core: ${CONFIG.aiCoreUrl}`);
  console.log(`   - FLHook: ${CONFIG.flhookHost}:${CONFIG.flhookPort}`);
  console.log(`\n💰 Pricing Plans:`);
  console.log(`   - Basic: $${CONFIG.pricing.basic.monthly}/month`);
  console.log(`   - Pro: $${CONFIG.pricing.pro.monthly}/month`);
  console.log(`   - Enterprise: $${CONFIG.pricing.enterprise.monthly}/month`);
  console.log(`\n📧 Support: ${CONFIG.supportEmail}`);
});

process.on('SIGINT', () => {
  console.log('\n💾 Saving client data...');
  db.save();
  process.exit(0);
});
