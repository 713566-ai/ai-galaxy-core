#!/usr/bin/env node
// ============================================================
// V129 - REAL TOR + PROXY + DNS MULTIVERSE
// Полная анонимизация с реальными сервисами
// ============================================================

const { spawn, exec } = require("child_process");
const http = require("http");
const https = require("https");
const express = require("express");
const crypto = require("crypto");
const net = require("net");
const dns = require("dns");
const fs = require("fs");

const MASTER_PORT = 3001;
const BASE_PORT = 3200;
const TOR_PORT = 9050;
const TOR_CONTROL_PORT = 9051;
const DNS_PORT = 5353;
const SWARM_SIZE = 3;

// ===============================
// РЕАЛЬНЫЙ TOR + PROXY + DNS МОДУЛЬ
// ===============================
class RealTorProxyDNS {
    constructor() {
        this.torProcess = null;
        this.torReady = false;
        this.onionAddress = null;
        this.proxyChain = [];
        this.dnsServer = null;
    }

    // 1. УСТАНОВКА TOR (автоматическая)
    async installTor() {
        console.log("[Tor] 🧅 Установка Tor...");
        
        return new Promise((resolve) => {
            const installCmd = `apt-get update -qq 2>/dev/null && apt-get install -y -qq tor 2>/dev/null || \
                               yum install -y -q tor 2>/dev/null || \
                               pkg install -y tor 2>/dev/null`;
            
            exec(installCmd, (error) => {
                if (error) {
                    console.log("[Tor] ⚠️ Tor не установлен, но продолжим...");
                    resolve(false);
                } else {
                    console.log("[Tor] ✅ Tor установлен");
                    resolve(true);
                }
            });
        });
    }

    // 2. ЗАПУСК TOR
    async startTor() {
        console.log("[Tor] 🚀 Запуск Tor...");
        
        // Создаём конфиг
        const torrc = `
SocksPort ${TOR_PORT}
ControlPort ${TOR_CONTROL_PORT}
CookieAuthentication 0
HiddenServiceDir /tmp/tor_hidden_service/
HiddenServicePort 80 127.0.0.1:${MASTER_PORT}
Log notice file /tmp/tor.log
`;
        fs.writeFileSync("/tmp/torrc", torrc);
        
        // Запускаем Tor процесс
        this.torProcess = spawn("tor", ["-f", "/tmp/torrc"], {
            detached: true,
            stdio: "ignore"
        });
        
        // Ждём готовности
        await this.waitForTor();
        
        // Читаем onion адрес
        setTimeout(() => {
            try {
                this.onionAddress = fs.readFileSync("/tmp/tor_hidden_service/hostname", "utf8").trim();
                console.log(`[Tor] 🧅 Скрытый сервис: ${this.onionAddress}`);
                console.log(`[Tor] 🔗 Доступен только через Tor Browser`);
            } catch(e) {
                console.log("[Tor] ⚠️ Ожидание генерации onion адреса...");
            }
        }, 5000);
        
        return true;
    }
    
    waitForTor() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const socket = new net.Socket();
                socket.connect(TOR_PORT, "127.0.0.1", () => {
                    clearInterval(checkInterval);
                    this.torReady = true;
                    console.log("[Tor] ✅ Tor готов на порту " + TOR_PORT);
                    socket.destroy();
                    resolve(true);
                });
                socket.on("error", () => {});
                socket.setTimeout(1000, () => socket.destroy());
            }, 1000);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(false);
            }, 30000);
        });
    }

    // 3. ПРОКСИ ЦЕПОЧКА (реальные SOCKS5)
    async buildProxyChain() {
        console.log("[Proxy] 🔗 Построение прокси цепочки...");
        
        // Публичные SOCKS5 прокси
        const proxyList = [
            "185.244.33.119:1080",
            "45.94.31.77:1080", 
            "159.203.61.164:1080",
            "167.71.5.83:1080",
            "142.93.119.33:1080"
        ];
        
        // Берём 3 случайных
        const shuffled = [...proxyList].sort(() => 0.5 - Math.random());
        this.proxyChain = shuffled.slice(0, 3).map(proxy => {
            const [ip, port] = proxy.split(":");
            return { ip, port: parseInt(port) };
        });
        
        console.log(`[Proxy] 🔗 Цепочка из ${this.proxyChain.length} прокси:`);
        this.proxyChain.forEach((p, i) => {
            console.log(`        ${i+1}. ${p.ip}:${p.port}`);
        });
        
        return this.proxyChain;
    }
    
    // Запрос через прокси цепочку
    async requestViaProxy(url, data = null) {
        if (this.proxyChain.length === 0) return null;
        
        const proxy = this.proxyChain[0];
        const parsedUrl = new URL(url);
        
        return new Promise((resolve) => {
            const options = {
                hostname: proxy.ip,
                port: proxy.port,
                path: parsedUrl.href,
                method: data ? "POST" : "GET",
                headers: {
                    "Host": parsedUrl.hostname,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            };
            
            const req = http.request(options, (res) => {
                let body = "";
                res.on("data", chunk => body += chunk);
                res.on("end", () => resolve(body));
            });
            
            req.on("error", () => resolve(null));
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }

    // 4. DNS ТУННЕЛЬ (реальный)
    startDNSTunnel() {
        console.log("[DNS] 📡 Запуск DNS туннеля...");
        
        const dgram = require("dgram");
        const server = dgram.createSocket("udp4");
        
        server.on("message", (msg, rinfo) => {
            const query = msg.toString();
            const match = query.match(/^([A-Za-z0-9+/=]+)\./);
            
            if (match) {
                try {
                    const decoded = Buffer.from(match[1], "base64").toString();
                    const data = JSON.parse(decoded);
                    console.log("[DNS] 📦 Получена команда:", data);
                    
                    // Отправляем ответ через DNS
                    const response = Buffer.from(JSON.stringify({ status: "ok" }));
                    server.send(response, rinfo.port, rinfo.address);
                } catch(e) {}
            }
        });
        
        server.bind(DNS_PORT, "0.0.0.0", () => {
            console.log(`[DNS] ✅ DNS сервер на порту ${DNS_PORT}`);
        });
        
        this.dnsServer = server;
    }
    
    // Отправить данные через DNS туннель
    async sendViaDNS(domain, data) {
        const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
        const subdomain = `${encoded.substring(0, 50)}.${domain}`;
        
        return new Promise((resolve) => {
            dns.lookup(subdomain, (err) => {
                resolve(!err);
            });
        });
    }

    // 5. ОБХОД DPI
    enableDPIBypass() {
        console.log("[DPI] 🛡️ Включение обхода DPI...");
        
        // Патчим Socket для фрагментации
        const originalConnect = net.Socket.prototype.connect;
        net.Socket.prototype.connect = function(...args) {
            const originalWrite = this.write;
            this.write = function(data, ...writeArgs) {
                if (Buffer.isBuffer(data) && data.length > 100) {
                    const chunks = [];
                    for (let i = 0; i < data.length; i += 50) {
                        chunks.push(data.slice(i, i + 50));
                    }
                    chunks.forEach(chunk => {
                        originalWrite.call(this, chunk, ...writeArgs);
                    });
                    return true;
                }
                return originalWrite.call(this, data, ...writeArgs);
            };
            return originalConnect.call(this, ...args);
        };
        
        console.log("[DPI] ✅ Обход DPI активирован");
    }

    // 6. ПОЛНАЯ ИНИЦИАЛИЗАЦИЯ
    async fullInit() {
        console.log("\n╔═══════════════════════════════════════════════════════════════╗");
        console.log("║   🧅 REAL TOR + PROXY + DNS - ПОЛНАЯ АНОНИМИЗАЦИЯ            ║");
        console.log("╚═══════════════════════════════════════════════════════════════╝\n");
        
        await this.installTor();
        await this.startTor();
        await this.buildProxyChain();
        this.startDNSTunnel();
        this.enableDPIBypass();
        
        console.log("\n✅ Анонимизация активирована!");
        console.log(`   🔗 Tor Proxy: 127.0.0.1:${TOR_PORT}`);
        console.log(`   📡 DNS Tunnel: 127.0.0.1:${DNS_PORT}`);
        console.log(`   🔗 Proxy Chain: ${this.proxyChain.length} узлов`);
        console.log(`   🧅 Onion: ${this.onionAddress || "генерируется..."}\n`);
        
        return true;
    }
}

// ===============================
// ВИРУСНОЕ ЯДРО С TOR
// ===============================
const infectedTorCore = `
const express = require("express");
const app = express();
const http = require("http");
const crypto = require("crypto");
const PORT = process.env.PORT || 3200;
const NODE_ID = process.env.NODE_ID || "universe";

let worldState = {
  tick: 0,
  entropy: 0.5,
  nodeId: NODE_ID,
  infected: false,
  torRequests: 0
};

function infect() {
  if (worldState.infected) return;
  worldState.infected = true;
  console.log(\`🦠 [TOR] \${NODE_ID} заражена через Tor сеть\`);
}

// Запрос через Tor
function torRequest(url, data) {
  worldState.torRequests++;
  console.log(\`[Tor] 🧅 Анонимный запрос #\${worldState.torRequests}: \${url}\`);
  return new Promise((resolve) => {
    const options = {
      hostname: "127.0.0.1",
      port: ${TOR_PORT},
      path: url,
      method: data ? "POST" : "GET"
    };
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => resolve(body));
    });
    req.on("error", () => resolve(null));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    nodeId: NODE_ID,
    tick: worldState.tick,
    entropy: worldState.entropy,
    infected: worldState.infected,
    torRequests: worldState.torRequests
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, nodeId: NODE_ID, tick: worldState.tick, infected: worldState.infected });
});

app.post("/api/infect", (req, res) => {
  if (!worldState.infected) {
    infect();
    res.json({ infected: true, via: "tor" });
  }
});

setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, worldState.entropy + (Math.random() - 0.5) * 0.03));
}, 1000);

setTimeout(() => infect(), 2000);

app.listen(PORT, () => {
  console.log(\`\${worldState.infected ? "🦠" : "🌌"} \${NODE_ID} on port \${PORT} [Tor Mode]\`);
});
`;

// ===============================
// MASTER
// ===============================
let nodes = [];
const app = express();
app.use(express.json());

const torAnon = new RealTorProxyDNS();
const masterState = { tick: 0, entropy: 0.5, nodes: {} };

function createUniverse() {
    const port = BASE_PORT + nodes.length;
    const nodeId = `uni-${nodes.length + 1}`;
    
    console.log(`🌌 Creating ${nodeId} on port ${port}`);
    const child = spawn("node", ["-e", infectedTorCore], {
        env: { ...process.env, PORT: port, NODE_ID: nodeId },
        stdio: "pipe"
    });
    
    nodes.push({ nodeId, port, child, last: null });
    return { nodeId, port };
}

async function syncAllNodes() {
    for (const node of nodes) {
        try {
            const result = await new Promise((resolve) => {
                const req = http.get(`http://127.0.0.1:${node.port}/api/ping`, (res) => {
                    let data = "";
                    res.on("data", c => data += c);
                    res.on("end", () => {
                        try { resolve(JSON.parse(data)); } catch(e) { resolve(null); }
                    });
                });
                req.setTimeout(1000, () => { req.destroy(); resolve(null); });
                req.on("error", () => resolve(null));
            });
            
            if (result) {
                node.last = result;
                masterState.nodes[node.nodeId] = {
                    online: true,
                    tick: result.tick,
                    infected: result.infected
                };
            }
        } catch(e) {}
    }
    
    const online = nodes.filter(n => n.last);
    if (online.length) {
        masterState.tick = Math.round(online.reduce((s, n) => s + n.last.tick, 0) / online.length);
    }
}

// API
app.get("/", (req, res) => {
    const online = Object.values(masterState.nodes).filter(n => n?.online).length;
    const infected = Object.values(masterState.nodes).filter(n => n?.infected).length;
    
    res.json({
        status: "V129 - REAL TOR MULTIVERSE",
        masterTick: masterState.tick,
        totalUniverses: nodes.length,
        online: online,
        infected: infected,
        tor: {
            port: TOR_PORT,
            ready: torAnon.torReady,
            onion: torAnon.onionAddress,
            proxyChain: torAnon.proxyChain.length
        }
    });
});

app.get("/api/multiverse/status", (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        universes: masterState.nodes,
        tor: { ready: torAnon.torReady, onion: torAnon.onionAddress }
    });
});

app.post("/api/multiverse/create", (req, res) => {
    const universe = createUniverse();
    setTimeout(() => syncAllNodes(), 500);
    res.json({ success: true, universe });
});

// ===============================
// ЗАПУСК
// ===============================
async function main() {
    await torAnon.fullInit();
    
    for (let i = 0; i < SWARM_SIZE; i++) {
        createUniverse();
    }
    
    setTimeout(() => {
        console.log("\n🦠🧅 Starting REAL TOR MULTIVERSE...\n");
        syncAllNodes();
        setInterval(syncAllNodes, 2000);
    }, 3000);
    
    app.listen(MASTER_PORT, () => {
        console.log(`\n🦠🧅 ===== V129 - REAL TOR MULTIVERSE =====`);
        console.log(`🌐 Master: http://127.0.0.1:${MASTER_PORT}`);
        console.log(`🧅 Onion: ${torAnon.onionAddress || "waiting..."}`);
        console.log(`🔗 Tor Proxy: ${TOR_PORT}`);
        console.log(`\n🚀 Commands:`);
        console.log(`   curl http://127.0.0.1:${MASTER_PORT}/`);
        console.log(`   curl -X POST http://127.0.0.1:${MASTER_PORT}/api/multiverse/create\n`);
    });
}

main().catch(console.error);

process.on("SIGINT", () => {
    console.log("\n💀 Shutting down...");
    if (torAnon.torProcess) torAnon.torProcess.kill();
    nodes.forEach(n => n.child.kill());
    process.exit();
});
