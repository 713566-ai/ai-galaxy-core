#!/usr/bin/env node
const http = require('http');
let lastTick = 0;

setInterval(() => {
    http.get('http://localhost:3000/api/status', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(`[MONITOR] ТИК: ${json.tick} | Боги: ${json.empires?.filter(e => e.god).length}`);
                
                // Если тик не растёт — перезапуск
                if (json.tick === lastTick) {
                    console.log('⚠️ Вселенная зависла! Перезапуск...');
                    require('child_process').exec('pkill -f ultimate-game');
                }
                lastTick = json.tick;
            } catch(e) {}
        });
    }).on('error', () => {
        console.log('❌ Сервер недоступен!');
    });
}, 5000);
