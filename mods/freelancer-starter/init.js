// Мод Freelancer Starter Pack
console.log('🚀 Freelancer Starter Pack активирован!');

// Добавление стартового корабля для новых игроков
const starterShip = {
    name: "Starflier",
    class: "Light Fighter",
    speed: 80,
    cargo: 50,
    weapons: 2,
    shields: 100,
    hull: 200
};

// Добавление торговых маршрутов
const tradeRoutes = [
    { from: "Манхэттен", to: "Питтсбург", commodity: "Биомедицина", profit: 150 },
    { from: "Либерти", to: "Бретань", commodity: "Оптический компьютер", profit: 300 },
    { from: "Рейнланд", to: "Кусак", commodity: "Боеприпасы", profit: 250 }
];

console.log(`📦 Добавлен корабль: ${starterShip.name}`);
console.log(`📦 Добавлено ${tradeRoutes.length} торговых маршрутов`);

// Экспорт для API
module.exports = { starterShip, tradeRoutes };
