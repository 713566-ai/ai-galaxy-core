const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

let universe = {
  "tick": 57,
  "version": "4.1.0",
  "startTime": 1776082937272,
  "world": {
    "entropy": 0.45,
    "stability": 0.55,
    "consciousness": 0.4509259627300034
  },
  "empires": [
    {
      "id": "E1",
      "name": "Aurora",
      "strength": 0.7540255757746,
      "wealth": 364.29220944903176,
      "tech": 1.2225681327129827,
      "status": "stable",
      "god": "codey",
      "allies": [],
      "color": "#667eea"
    },
    {
      "id": "E2",
      "name": "Obsidian",
      "strength": 0.5478564845437676,
      "wealth": 257.83685059555796,
      "tech": 0.8138896959897571,
      "status": "unstable",
      "god": null,
      "allies": [],
      "color": "#764ba2"
    },
    {
      "id": "E3",
      "name": "Nexus",
      "strength": 0.6705051004143859,
      "wealth": 309.0069453268438,
      "tech": 1.1101011074681146,
      "status": "stable",
      "god": null,
      "allies": [],
      "color": "#48c6ef"
    }
  ],
  "agents": [
    {
      "name": "codey",
      "loyalty": "E1",
      "fitness": 0.895017711247916,
      "isGod": true,
      "consciousness": 0.6687211897160679
    },
    {
      "name": "uiax",
      "loyalty": "E1",
      "fitness": 0.651797254632532,
      "isGod": false,
      "consciousness": 0.42217675043635405
    },
    {
      "name": "garlic",
      "loyalty": "E2",
      "fitness": 0.4362184105960921,
      "isGod": false,
      "consciousness": 0.1917373620845382
    },
    {
      "name": "nova",
      "loyalty": "E3",
      "fitness": 0.7038728887324057,
      "isGod": false,
      "consciousness": 0.5210685486830536
    }
  ],
  "history": {
    "wars": 0,
    "godAscensions": 1,
    "technologies": 0,
    "alliances": 0,
    "mods": 0
  },
  "mods": [],
  "evolutionLog": []
};

function broadcast(data) {
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data)); });
}

app.get('/api/status', (req, res) => res.json(universe));

app.post('/api/game/attack', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire) {
    const target = universe.empires.find(e => e.id !== req.body.empireId);
    if (target) {
      const damage = empire.strength * 10;
      target.wealth -= damage;
      universe.history.wars++;
      broadcast({ type: 'event', message: `⚔️ ${empire.name} атакует ${target.name}!` });
      res.json({ message: `Атака! Урон: ${damage.toFixed(0)}` });
    } else res.json({ message: 'Нет цели' });
  } else res.json({ message: 'Империя не найдена' });
});

app.post('/api/game/upgrade', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.wealth >= 50) {
    empire.wealth -= 50;
    empire.tech = (empire.tech || 1) + 0.1;
    universe.history.technologies++;
    broadcast({ type: 'event', message: `🔬 ${empire.name} улучшил технологии!` });
    res.json({ message: `Технологии: ${empire.tech.toFixed(1)}` });
  } else res.json({ message: 'Не хватает ресурсов!' });
});

app.post('/api/game/trade', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire) {
    const profit = empire.strength * 20;
    empire.wealth += profit;
    res.json({ message: `Торговля: +${profit.toFixed(0)}` });
  } else res.json({ message: 'Ошибка' });
});

app.post('/api/game/pray', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.god) {
    empire.strength += 0.05;
    res.json({ message: `🙏 ${empire.god} благословляет!` });
  } else res.json({ message: 'Нет бога' });
});

app.post('/api/game/alliance', (req, res) => {
  const empire = universe.empires.find(e => e.id === req.body.empireId);
  if (empire && empire.wealth >= 100) {
    const target = universe.empires.find(e => e.id !== empire.id && !empire.allies.includes(e.id));
    if (target) {
      empire.allies.push(target.id);
      target.allies.push(empire.id);
      empire.wealth -= 100;
      universe.history.alliances++;
      broadcast({ type: 'event', message: `🤝 ${empire.name} + ${target.name}!` });
      res.json({ message: `Альянс с ${target.name}!` });
    } else res.json({ message: 'Нет доступных союзников' });
  } else res.json({ message: 'Не хватает ресурсов' });
});

setInterval(() => {
  universe.tick++;
  universe.empires.forEach(e => {
    e.strength += (Math.random() - 0.5) * 0.01;
    e.strength = Math.max(0.3, Math.min(0.95, e.strength));
    e.wealth += e.strength * 5;
  });
  universe.world.entropy += (0.45 - universe.world.entropy) * 0.03;
}, 500);

const PORT = 3001;
server.listen(PORT, () => console.log(`🎮 Game server on http://localhost:${PORT}`));