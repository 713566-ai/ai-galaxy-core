
// Автоматически сгенерированный коннектор для PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres'
});

async function saveAgents(agents) {
  const query = 'INSERT INTO agents (id, role, wealth) VALUES ($1, $2, $3)';
  for (const agent of agents) {
    await pool.query(query, [agent.id, agent.role, agent.wealth]);
  }
}

module.exports = { pool, saveAgents };
