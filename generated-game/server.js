
// 🎮 AUTO-GENERATED GAME SERVER
// Game: AutoGame_187608
// Genre: sandbox-strategy

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static("public"));

let gameState = {
  tick: 0,
  players: 0,
  world: require("./world"),
  agents: require("./agents"),
  combat: require("./combat"),
  economy: require("./economy")
};

// API
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    game: "AutoGame_187608",
    tick: gameState.tick,
    players: gameState.players,
    genre: "sandbox-strategy"
  });
});

app.get("/api/ping", (req, res) => {
  res.json({ pong: true, tick: gameState.tick });
});

// WebSocket для реального времени
wss.on("connection", (ws) => {
  gameState.players++;
  ws.on("close", () => { gameState.players--; });
  ws.send(JSON.stringify({ type: "connected", message: "Welcome to the game!" }));
});

// Игровой цикл
setInterval(() => {
  gameState.tick++;
  gameState.world.evolve();
  
  // Отправляем состояние всем клиентам
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "state",
        tick: gameState.tick,
        world: gameState.world.getState(),
        economy: gameState.economy.getStats()
      }));
    }
  });
  
  if (gameState.tick % 20 === 0) {
    console.log(`🎮 [GAME] tick ${gameState.tick} | players: ${gameState.players}`);
  }
  
}, 1000);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🎮 GAME SERVER RUNNING ON http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/status`);
});
