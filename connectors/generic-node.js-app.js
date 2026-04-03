
// Универсальный коннектор для Node.js App
// Автоматически сгенерирован для хоста localhost:3000

const net = require('net');

function connect() {
  const client = new net.Socket();
  
  client.connect(3000, 'localhost', () => {
    console.log('✅ Подключен к Node.js App');
  });
  
  client.on('data', (data) => {
    console.log('📨 Данные:', data.toString());
  });
  
  return client;
}

module.exports = { connect };
