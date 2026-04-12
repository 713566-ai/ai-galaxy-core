const TelegramBot = require('node-telegram-bot-api');

// Токен вашего бота
const token = '8783082662:AAGMe3vXiF4x7lXy2oR-oOCwzI2U6OinUE0';
const bot = new TelegramBot(token, { polling: true });

// ID администратора (замените на свой, когда бот напишет вам)
let ADMIN_CHAT_ID = null;

// Базовый URL вашего сервера
const API_URL = 'http://localhost:3000';

console.log('🤖 Telegram бот запущен...');

// ========== КОМАНДЫ ==========

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // Сохраняем ID администратора при первом сообщении
    if (!ADMIN_CHAT_ID) {
        ADMIN_CHAT_ID = chatId;
        console.log(`👑 Администратор установлен: ${chatId}`);
    }
    
    bot.sendMessage(chatId, `
🤖 *AI Galaxy Core Bot*

Добро пожаловать! Я управляю AI симуляцией.

*Доступные команды:*
/status - 📊 Статус симуляции
/market - 💰 Цены на рынке
/agents - 🏆 Топ агентов
/stats - 📈 Детальная статистика
/help - ❓ Помощь

💳 *По вопросам оплаты:* +380987979381
    `, { parse_mode: 'Markdown' });
});

// Команда /status
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();
        
        bot.sendMessage(chatId, `
📊 *Статус AI Galaxy Core*

🎮 *Поколение:* ${data.generation}
👥 *Население:* ${data.population}
💰 *Среднее богатство:* ${data.stats.avgWealth}
⚡ *Средняя энергия:* ${data.stats.avgEnergy}

📈 *Шаг:* ${data.step}
    `, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Ошибка подключения к серверу');
    }
});

// Команда /market
bot.onText(/\/market/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${API_URL}/api/market`);
        const prices = await response.json();
        
        let message = '💰 *Рынок ресурсов*\n\n';
        for (const [resource, price] of Object.entries(prices)) {
            const icons = {
                energy: '⚡',
                minerals: '⛏️',
                food: '🌾',
                tech: '🔬',
                crystals: '💎'
            };
            message += `${icons[resource] || '📦'} ${resource}: *$${Math.floor(price)}*\n`;
        }
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Ошибка получения данных рынка');
    }
});

// Команда /agents
bot.onText(/\/agents/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${API_URL}/api/agents`);
        const data = await response.json();
        
        let message = '🏆 *Топ агентов*\n\n';
        data.agents.slice(0, 10).forEach((agent, i) => {
            const roleIcon = {
                trader: '💰',
                warrior: '⚔️',
                explorer: '🔭',
                collector: '📦',
                builder: '🏗️'
            };
            message += `${i+1}. ${roleIcon[agent.role] || '🤖'} #${agent.id} *${agent.role}*\n`;
            message += `   💰 Богатство: ${agent.wealth}\n`;
            message += `   ⚡ Энергия: ${agent.energy}\n\n`;
        });
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Ошибка получения данных агентов');
    }
});

// Команда /stats
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const response = await fetch(`${API_URL}/api/status`);
        const data = await response.json();
        
        // Расчет примерного дохода (для демонстрации)
        const estimatedRevenue = data.population * 0.5;
        
        bot.sendMessage(chatId, `
📈 *Детальная статистика*

👥 *Общее население:* ${data.population}
🎮 *Поколение:* ${data.generation}
⏱️ *Шаг:* ${data.step}

💰 *Экономика:*
• Среднее богатство: ${data.stats.avgWealth}
• Средняя энергия: ${data.stats.avgEnergy}
• Примерный доход: ~$${estimatedRevenue.toFixed(0)}

📊 *Динамика:* ${data.population > 500 ? '📈 Рост' : data.population < 500 ? '📉 Падение' : '📊 Стабильность'}
    `, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Ошибка получения статистики');
    }
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, `
❓ *Помощь*

*Доступные команды:*
/status - Текущий статус симуляции
/market - Цены на ресурсы
/agents - Топ 10 агентов
/stats - Детальная статистика
/help - Эта справка

*Контакты:*
📞 Поддержка: +380987979381
💳 Оплата: карта 4441 1110 8473 8792

*О проекте:*
AI Galaxy Core - платформа для AI симуляции с динамической экономикой и эволюцией агентов.
    `, { parse_mode: 'Markdown' });
});

// ========== УВЕДОМЛЕНИЯ ==========

// Функция отправки уведомления о новом платеже
async function notifyNewPayment(email, plan, amount) {
    if (ADMIN_CHAT_ID) {
        bot.sendMessage(ADMIN_CHAT_ID, `
✅ *НОВАЯ ПОДПИСКА!*

📧 Email: ${email}
📋 План: ${plan}
💰 Сумма: $${amount}

⏰ Время: ${new Date().toLocaleString()}
        `, { parse_mode: 'Markdown' });
    }
}

// Функция отправки уведомления о старте сервера
async function notifyServerStart() {
    if (ADMIN_CHAT_ID) {
        bot.sendMessage(ADMIN_CHAT_ID, `
🚀 *AI Galaxy Core запущен!*

✅ Сервер работает
📊 Порты: 3000 (HTTP), 3001 (WebSocket)
🤖 Агенты активны
        `, { parse_mode: 'Markdown' });
    }
}

// Функция отправки уведомления об ошибке
async function notifyError(error) {
    if (ADMIN_CHAT_ID) {
        bot.sendMessage(ADMIN_CHAT_ID, `
⚠️ *Ошибка в системе!*

📝 ${error.message}

⏰ ${new Date().toLocaleString()}
        `, { parse_mode: 'Markdown' });
    }
}

// Периодическая отправка статуса (каждые 6 часов)
setInterval(async () => {
    if (ADMIN_CHAT_ID) {
        try {
            const response = await fetch(`${API_URL}/api/status`);
            const data = await response.json();
            
            bot.sendMessage(ADMIN_CHAT_ID, `
📊 *Автоматический отчет*

👥 Население: ${data.population}
🎮 Поколение: ${data.generation}
💰 Богатство: ${data.stats.avgWealth}

⏰ ${new Date().toLocaleString()}
            `, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error('Ошибка отправки отчета:', error);
        }
    }
}, 6 * 60 * 60 * 1000); // Каждые 6 часов

console.log('✅ Telegram бот готов к работе!');
console.log('📱 Найдите бота в Telegram: @AI_Galaxy_Core_Bot');
console.log('💡 Отправьте команду /start');

module.exports = { bot, notifyNewPayment, notifyServerStart, notifyError };
