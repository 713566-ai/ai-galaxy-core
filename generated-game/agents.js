
// 🤖 AGENTS MODULE
const agents = [];

// Генерация начальных агентов
for (let i = 0; i < 5; i++) {
  agents.push({
    id: `agent_${i}`,
    name: `Agent-${String.fromCharCode(65 + i)}`,
    power: 0.3 + Math.random() * 0.5,
    loyalty: null,
    experience: 0
  });
}

function getAll() {
  return agents;
}

function update() {
  for (const agent of agents) {
    agent.experience++;
    agent.power += (Math.random() - 0.5) * 0.02;
    agent.power = Math.max(0.1, Math.min(0.95, agent.power));
  }
}

function getStrongest() {
  return agents.sort((a, b) => b.power - a.power)[0];
}

module.exports = { getAll, update, getStrongest };
