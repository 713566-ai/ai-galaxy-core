
// Универсальный коннектор для Coinbase
// Автоматически сгенерирован для хоста undefined:undefined

const net = require('net');

function connect() {
  const client = new net.Socket();
  
  client.connect(undefined, 'undefined', () => {
    console.log('✅ Подключен к Coinbase');
  });
  
  client.on('data', (data) => {
    console.log('📨 Данные:', data.toString());
  });
  
  return client;
}

module.exports = { connect };
