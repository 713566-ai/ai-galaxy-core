
// Автоматически сгенерированный коннектор для API: GitHub
// Создан: 4/3/2026, 12:17:55 AM

const axios = require('axios');

class GitHubConnector {
  constructor() {
    this.baseURL = 'https:/';
    this.connected = false;
  }
  
  async connect() {
    try {
      const response = await axios.get('https://api.github.com/zen');
      if (response.status === 200) {
        this.connected = true;
        console.log('✅ Подключен к GitHub');
        return true;
      }
    } catch (error) {
      console.error('❌ Ошибка подключения к GitHub');
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

module.exports = new GitHubConnector();
