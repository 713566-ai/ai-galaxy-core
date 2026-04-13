
// 🌍 WORLD MODULE
let world = {
  tick: 0,
  entropy: 0.5008080045505596,
  stability: 0.4991919954494404,
  events: []
};

function evolve() {
  world.tick++;
  world.entropy += (Math.random() - 0.5) * 0.02;
  world.entropy = Math.max(0.1, Math.min(0.9, world.entropy));
  world.stability = 1 - world.entropy;
  
  // Генерация случайных событий
  if (Math.random() < 0.1) {
    const events = ["storm", "discovery", "conflict", "trade", "celebration"];
    const event = events[Math.floor(Math.random() * events.length)];
    world.events.unshift({ type: event, tick: world.tick });
    if (world.events.length > 20) world.events.pop();
  }
}

function getState() {
  return {
    tick: world.tick,
    entropy: world.entropy.toFixed(3),
    stability: world.stability.toFixed(3),
    recentEvents: world.events.slice(0, 5)
  };
}

module.exports = { evolve, getState };
