const { Pool } = require('pg');
require('dotenv').config();

// Настройка подключения к PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'aigalaxy_db',
    user: process.env.DB_USER || 'u0_a425',  // Используем текущего пользователя
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Проверка подключения
pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err);
});

// Функции для работы с агентами
const AgentDB = {
    async saveAgent(agent) {
        const query = `
            INSERT INTO agents (agent_id, role, energy, wealth, age, is_alive, faction, techs, skills, inventory)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (agent_id) DO UPDATE SET
                role = EXCLUDED.role,
                energy = EXCLUDED.energy,
                wealth = EXCLUDED.wealth,
                age = EXCLUDED.age,
                is_alive = EXCLUDED.is_alive,
                faction = EXCLUDED.faction,
                techs = EXCLUDED.techs,
                skills = EXCLUDED.skills,
                inventory = EXCLUDED.inventory,
                updated_at = CURRENT_TIMESTAMP
        `;
        
        const values = [
            agent.id,
            agent.role,
            agent.energy,
            agent.wealth,
            agent.age,
            agent.isAlive,
            agent.faction,
            agent.techs || [],
            JSON.stringify(agent.skills || {}),
            JSON.stringify(agent.inventory || {})
        ];
        
        try {
            await pool.query(query, values);
            return true;
        } catch (err) {
            console.error('Error saving agent:', err.message);
            return false;
        }
    },
    
    async loadAgents() {
        const query = 'SELECT * FROM agents WHERE is_alive = true ORDER BY agent_id LIMIT 500';
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error loading agents:', err.message);
            return [];
        }
    },
    
    async getTopWealthAgents(limit = 30) {
        const query = 'SELECT * FROM agents WHERE is_alive = true ORDER BY wealth DESC LIMIT $1';
        try {
            const result = await pool.query(query, [limit]);
            return result.rows;
        } catch (err) {
            console.error('Error getting top agents:', err.message);
            return [];
        }
    },
    
    async getRoleStats() {
        const query = `
            SELECT role, COUNT(*) as count, AVG(wealth) as avg_wealth
            FROM agents
            WHERE is_alive = true
            GROUP BY role
        `;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (err) {
            console.error('Error getting role stats:', err.message);
            return [];
        }
    },
    
    async cleanupDeadAgents() {
        const query = 'DELETE FROM agents WHERE is_alive = false AND age > 100';
        try {
            const result = await pool.query(query);
            console.log(`🧹 Cleaned up ${result.rowCount} dead agents`);
            return result.rowCount;
        } catch (err) {
            console.error('Error cleaning up agents:', err.message);
            return 0;
        }
    }
};

const HistoryDB = {
    async savePopulationSnapshot(step, population, generation, avgWealth) {
        const query = `
            INSERT INTO population_history (step, population, generation, avg_wealth)
            VALUES ($1, $2, $3, $4)
        `;
        try {
            await pool.query(query, [step, population, generation, avgWealth]);
            return true;
        } catch (err) {
            console.error('Error saving population snapshot:', err.message);
            return false;
        }
    },
    
    async getHistory(limit = 100) {
        const query = 'SELECT * FROM population_history ORDER BY step DESC LIMIT $1';
        try {
            const result = await pool.query(query, [limit]);
            return result.rows.reverse();
        } catch (err) {
            console.error('Error getting history:', err.message);
            return [];
        }
    },
    
    async saveMarketPrice(step, resource, price) {
        const query = `
            INSERT INTO market_history (step, resource_name, price)
            VALUES ($1, $2, $3)
        `;
        try {
            await pool.query(query, [step, resource, price]);
            return true;
        } catch (err) {
            console.error('Error saving market price:', err.message);
            return false;
        }
    }
};

const UserDB = {
    async createUser(username, email, passwordHash) {
        const query = `
            INSERT INTO users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, role
        `;
        try {
            const result = await pool.query(query, [username, email, passwordHash]);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating user:', err.message);
            return null;
        }
    },
    
    async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        try {
            const result = await pool.query(query, [username]);
            return result.rows[0];
        } catch (err) {
            console.error('Error finding user:', err.message);
            return null;
        }
    },
    
    async updateLastLogin(userId) {
        const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1';
        try {
            await pool.query(query, [userId]);
            return true;
        } catch (err) {
            console.error('Error updating last login:', err.message);
            return false;
        }
    }
};

const SubscriptionDB = {
    async createSubscription(userId, plan, apiKey, paymentMethod) {
        const query = `
            INSERT INTO subscriptions (user_id, plan, api_key, payment_method, end_date)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '30 days')
            RETURNING *
        `;
        try {
            const result = await pool.query(query, [userId, plan, apiKey, paymentMethod]);
            return result.rows[0];
        } catch (err) {
            console.error('Error creating subscription:', err.message);
            return null;
        }
    },
    
    async verifyApiKey(apiKey) {
        const query = `
            SELECT s.*, u.username, u.email 
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            WHERE s.api_key = $1 AND s.status = 'active' AND s.end_date > CURRENT_TIMESTAMP
        `;
        try {
            const result = await pool.query(query, [apiKey]);
            return result.rows[0];
        } catch (err) {
            console.error('Error verifying API key:', err.message);
            return null;
        }
    }
};

module.exports = {
    pool,
    AgentDB,
    HistoryDB,
    UserDB,
    SubscriptionDB
};
