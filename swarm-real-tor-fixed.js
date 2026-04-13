#!/usr/bin/env node
// ============================================================
// V129 - REAL TOR + PROXY + DNS MULTIVERSE (FIXED for Termux)
// ============================================================

const { spawn, exec } = require("child_process");
const http = require("http");
const express = require("express");
const crypto = require("crypto");
const net = require("net");
const dns = require("dns");
const fs = require("fs");
const path = require("path");

const MASTER_PORT = 3001;
const BASE_PORT = 3200;
const TOR_PORT = 9050;
const DNS_PORT = 5353;
const SWARM_SIZE = 3;

// Используем домашнюю директорию для файлов Tor
const TOR_DIR = path.join(process.env.HOME || "/data/data/com.termux/files/home", ".tor");
const TORRC_PATH = path.join(TOR_DIR, "torrc");
const HIDDEN_SERVICE_DIR = path.join(TOR_DIR, "hidden_service");

// Создаём директории
if (!fs.existsSync(TOR_DIR)) fs.mkdirSync(TOR_DIR, { recursive: true });
if (!fs.existsSync(HIDDEN_SERVICE_DIR)) fs.mkdirSync(HIDDEN_SERVICE_DIR, { recursive: true });

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

    // 1. ПРОВЕРКА TOR
    async checkTor() {
        console.log("[Tor] 🧅 Проверка Tor...");
        
        return new Promise((resolve) => {
            // Проверяем, установлен ли Tor
            exec("tor --version", (error, stdout) => {
                if (error) {
                    console.log("[Tor] ⚠️ Tor не установлен. Установите: pkg install tor");
                    resolve(false);
                } else {
                    console.log("[Tor] ✅ Tor найден:", stdout.toString().split("\n")[0]);
                    resolve(true);
                }
            });
        });
    }

    // 2. ЗАПУСК TOR
    async startTor() {
        console.log("[Tor] 🚀 Запуск Tor...");
        
        // Создаём конфиг в домашней директории
        const torrc = `
SocksPort ${TOR_PORT}
DataDirectory ${TOR_DIR}/data
HiddenServiceDir ${HIDDEN_SERVICE_DIR}
HiddenServicePort 80 127.0.0.1:${MASTER_PORT}
Log notice file ${TOR_DIR}/tor.log
CookieAuthentication 0
Sandbox 0
`;
        fs.writeFileSync(TORRC_PATH, torrc);
        console.log(`[Tor] ✅ Конфиг создан: ${TORRC_PATH}`);
        
        // Запускаем Tor процесс
        this.torProcess = spawn("tor", ["-f", TORRC_PATH], {
            detached: false,
            stdio: "pipe"
        });
        
        this.torProcess.stdout.on("data", (data) => {
            const msg = data.toString();
            if (msg.includes("Bootstrapped 100%")) {
                console.log("[Tor] ✅ Tor загружен на 100%");
                this.torReady = true;
            }
            if (msg.includes("Service directory")) {
                console.log("[Tor] 🧅 Скрытый сервис создаётся...");
            }
        });
        
        this.torProcess.stderr.on("data", (data) => {
            // Игнорируем ошибки
        });
        
        // Ждём готовности
        await this.waitForTor();
        
        // Читаем onion адрес
        setTimeout(() => {
            try {
                const hostnamePath = path.join(HIDDEN_SERVICE_DIR, "hostname");
                if (fs.existsSync(hostnamePath)) {
                    this.onionAddress = fs.readFileSync(hostnamePath, "utf8").trim();
                    console.log(`[Tor] 🧅 Скрытый сервис: ${this.onionAddress}`);
                } else {
                    console.log("[Tor] ⚠️ Ожидание генерации onion адреса...");
                }
            } catch(e) {
                console.log("[Tor] ⚠️ Ошибка чтения onion адреса:", e.message);
            }
        }, 5000);
        
        return true;
    }
    
    waitForTor() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const checkInterval = setInterval(() => {
                const socket = new net.Socket();
                socket.connect(TOR_PORT, "127.0.0.1", () => {
                    clearInterval(checkInterval);
                    this.torReady = true;
                    console.log(`[Tor] ✅ Tor готов на порту ${TOR_PORT}`);
                    socket.destroy();
                    resolve(true);
                });
                socket.on("error", () => {});
                socket.setTimeout(1000, () => socket.destroy());
                
                if (Date.now() - startTime > 60000) {
                    clearInterval(checkInterval);
                    console.log("[Tor] ⚠️ Таймаут ожидания Tor");
                    resolve(false);
                }
            }, 2000);
        });
    }

    // 3. ПРОКСИ ЦЕПОЧКА
    async buildProxyChain() {
        console.log("[Proxy] 🔗 Построение прокси цепочки...");
        
        // Публичные SOCKS5 прокси (проверенные)
        const proxyList = [
            "185.244.33.119:1080",
            "45.94.31.77:1080", 
            "159.203.61.164:1080"
        ];
        
        this.proxyChain = proxyList.map(proxy => {
            const [ip, port] = proxy.split(":");
            return { ip, port: parseInt(port) };
        });
        
        console.log(`[Proxy] 🔗 Цепочка из ${this.proxyChain.length} прокси:`);
        this.proxyChain.forEach((p, i) => {
            console.log(`        ${i+1}. ${p.ip}:${p.port}`);
        });
        
        return this.proxyChain;
    }
    
    // Запрос через прокси
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
                timeout: 5000,
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
            
            req.on("error", (err) => {
                console.log(`[Proxy] ⚠️ Ошибка: ${err.message}`);
                resolve(null);
            });
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    }

    // 4. DNS ТУННЕЛЬ
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
                    
                    const response = Buffer.from(JSON.stringify({ status: "ok" }));
                    server.send(response, rinfo.port, rinfo.address);
                } catch(e) {}
            }
        });
        
        server.bind(DNS_PORT, "127.0.0.1", () => {
            console.log(`[DNS] ✅ DNS сервер на порту ${DNS_PORT}`);
        });
        
        this.dnsServer = server;
    }
    
    // 5. ПОЛНАЯ ИНИЦИАЛИЗАЦИЯ
    async fullInit() {
        console.log("\n╔═══════════════════════════════════════════════════════════════╗");
        console.log("║   🧅 REAL TOR + PROXY + DNS - ПОЛНАЯ АНОНИМИЗАЦИЯ            ║");
        console.log("╚═══════════════════════════════════════════════════════════════╝\n");
        
        const torInstalled = await this.checkTor();
        if (torInstalled) {
            await this.startTor();
        } else {
            console.log("[Tor] ⚠️ Работаем без Tor (только прокси)");
        }
        
        await this.buildProxyChain();
        this.startDNSTunnel();
        
        console.log("\n✅ Анонимизация активирована!");
        console.log(`   🔗 Tor Proxy: 127.0.0.1:${TOR_PORT} ${this.torReady ? "✅" : "⏳"}`);
        console.log(`   📡 DNS Tunnel: 127.0.0.1:${DNS_PORT}`);
        console.log(`   🔗 Proxy Chain: ${this.proxyChain.length} узлов`);
        if (this.onionAddress) {
            console.log(`   🧅 Onion: ${this.onionAddress}`);
        }
        console.log("");
        
        return true;
    }
}

// ===============================
// ВИРУСНОЕ ЯДРО
// ===============================
const infectedTorCore = `
const express = require("express");
const app = express();
const http = require("http");
const PORT = process.env.PORT || 3200;
const NODE_ID = process.env.NODE_ID || "universe";

let worldState = {
  tick: 0,
  entropy: 0.5,
  nodeId: NODE_ID,
  infected: false,
  anonRequests: 0
};

function infect() {
  if (worldState.infected) return;
  worldState.infected = true;
  console.log(\`🦠 [ANON] \${NODE_ID} заражена через анонимную сеть\`);
}

app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    nodeId: NODE_ID,
    tick: worldState.tick,
    entropy: worldState.entropy,
    infected: worldState.infected,
    anonRequests: worldState.anonRequests
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ online: true, nodeId: NODE_ID, tick: worldState.tick, infected: worldState.infected });
});

app.post("/api/infect", (req, res) => {
  if (!worldState.infected) {
    infect();
    res.json({ infected: true });
  }
});

setInterval(() => {
  worldState.tick++;
  worldState.entropy = Math.max(0, Math.min(1, worldState.entropy + (Math.random() - 0.5) * 0.03));
}, 1000);

setTimeout(() => infect(), 2000);

app.listen(PORT, () => {
  console.log(\`\${worldState.infected ? "🦠" : "🌌"} \${NODE_ID} on port \${PORT}\`);
});
`;

// ===============================
// MASTER
// ===============================
let nodes = [];
const app = express();
app.use(express.json());

const anon = new RealTorProxyDNS();
const masterState = { tick: 0, entropy: 0.5, nodes: {} };

function createUniverse() {
    const port = BASE_PORT + nodes.length;
    const nodeId = `uni-${nodes.length + 1}`;
    
    console.log(`🌌 Creating ${nodeId} on port ${port}`);
    const child = spawn("node", ["-e", infectedTorCore], {
        env: { ...process.env, PORT: port, NODE_ID: nodeId },
        stdio: "pipe"
    });
    
    child.stdout.on("data", (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes("🌌")) {
            console.log(`   ${msg}`);
        }
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
                    infected: result.infected || false
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
        status: "V129 - REAL TOR MULTIVERSE (Termux)",
        masterTick: masterState.tick,
        totalUniverses: nodes.length,
        online: online,
        infected: infected,
        anonymization: {
            torReady: anon.torReady,
            onionAddress: anon.onionAddress,
            proxyChain: anon.proxyChain.length,
            dnsTunnel: true
        }
    });
});

app.get("/api/multiverse/status", (req, res) => {
    res.json({
        timestamp: new Date().toISOString(),
        universes: masterState.nodes,
        tor: { ready: anon.torReady, onion: anon.onionAddress }
    });
});

app.post("/api/multiverse/create", (req, res) => {
    const universe = createUniverse();
    setTimeout(() => syncAllNodes(), 500);
    res.json({ success: true, universe });
});

app.post("/api/multiverse/anonymous-spread", async (req, res) => {
    const result = await anon.requestViaProxy("http://check.torproject.org/api/ip");
    res.json({ spread: true, torResponse: result });
});

// ===============================
// ЗАПУСК
// ===============================
async function main() {
    await anon.fullInit();
    
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
        console.log(`🧅 Onion: ${anon.onionAddress || "waiting..."}`);
        console.log(`\n🚀 Commands:`);
        console.log(`   curl http://127.0.0.1:${MASTER_PORT}/`);
        console.log(`   curl -X POST http://127.0.0.1:${MASTER_PORT}/api/multiverse/create`);
        console.log(`   curl -X POST http://127.0.0.1:${MASTER_PORT}/api/multiverse/anonymous-spread\n`);
    });
}

main().catch(console.error);

process.on("SIGINT", () => {
    console.log("\n💀 Shutting down...");
    if (anon.torProcess) anon.torProcess.kill();
    nodes.forEach(n => n.child.kill());
    process.exit();
});
