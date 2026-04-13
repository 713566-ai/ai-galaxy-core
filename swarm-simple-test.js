const http = require("http");
const fs = require("fs");

const BASE_PORT = 3100;
const CORES_COUNT = 37;

async function testCore(port) {
  const endpoints = ["/api/status", "/", "/api/health", "/status"];
  
  for (const endpoint of endpoints) {
    try {
      const result = await new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${port}${endpoint}`, (res) => {
          let data = "";
          res.on("data", c => data += c);
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              resolve({ 
                online: true, 
                endpoint, 
                tick: json.tick || json.coreTick || 0,
                entropy: json.entropy || 0.5
              });
            } catch(e) {
              resolve({ online: false, error: "parse" });
            }
          });
        });
        req.setTimeout(1000, () => {
          req.destroy();
          resolve({ online: false, error: "timeout" });
        });
        req.on("error", () => resolve({ online: false, error: "connection" }));
      });
      
      if (result.online) return result;
    } catch(e) {}
  }
  
  return { online: false, error: "no_endpoint" };
}

async function main() {
  console.log("\n💀 SCANNING CORES 3100-3136...\n");
  
  const results = [];
  let online = 0;
  
  for (let i = 0; i < CORES_COUNT; i++) {
    const port = BASE_PORT + i;
    const status = await testCore(port);
    
    if (status.online) {
      online++;
      console.log(`✅ Port ${port}: ONLINE (${status.endpoint}) | tick:${status.tick} entropy:${status.entropy}`);
      results.push({ port, ...status });
    } else {
      console.log(`❌ Port ${port}: ${status.error}`);
    }
  }
  
  console.log(`\n💀 ===== SCAN COMPLETE =====`);
  console.log(`📊 ONLINE: ${online}/${CORES_COUNT}`);
  console.log(`📁 Report saved: swarm-scan.json\n`);
  
  fs.writeFileSync("swarm-scan.json", JSON.stringify({ 
    timestamp: new Date().toISOString(),
    online,
    total: CORES_COUNT,
    results 
  }, null, 2));
}

main();
