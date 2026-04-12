
// Автоматически сгенерированный коннектор для API: Coinbase
// Создан: 4/3/2026, 12:17:55 AM

const axios = require('axios');

class CoinbaseConnector {
  constructor() {
    this.baseURL = 'https:/';
    this.connected = false;
  }
  
  async connect() {
    try {
      const response = await axios.get('https://api.coinbase.com/v2/time');
      if (response.status === 200) {
        this.connected = true;
        console.log('✅ Подключен к Coinbase');
        return true;
      }
    } catch (error) {
      console.error('❌ Ошибка подключения к Coinbase');
      return false;
    }
  }
  
  async getData(endpoint = '') {
    if (!this.connected) await this.connect();
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка получения данных:', error.message);
      return null;
    }
  }
}

module.exports = new CoinbaseConnector();
