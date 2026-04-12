const axios = require('axios');

const GOD_CORE_URL = 'http://localhost:5400';

async function getUniverseState() {
    try {
        const res = await axios.get(`${GOD_CORE_URL}/status`, { timeout: 3000 });
        return res.data;
    } catch (e) {
        return { error: 'GOD CORE не доступен', entropy: 0.5, entities: 100 };
    }
}

async function sendAction(action) {
    try {
        const res = await axios.post(`${GOD_CORE_URL}/action/${action}`);
        return res.data;
    } catch (e) {
        return { error: e.message };
    }
}

module.exports = { getUniverseState, sendAction };
