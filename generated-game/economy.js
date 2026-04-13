
// 💰 ECONOMY MODULE
let resources = {
  gold: 1000,
  wood: 500,
  stone: 300,
  food: 800
};

const prices = {
  wood: 2,
  stone: 3,
  food: 1
};

function getStats() {
  return { ...resources };
}

function trade(resource, amount, direction) {
  const price = (prices[resource] || 2) * amount;
  
  if (direction === "buy") {
    if (resources.gold >= price) {
      resources.gold -= price;
      resources[resource] += amount;
      return { success: true, message: `Bought ${amount} ${resource}` };
    }
    return { success: false, message: "Not enough gold" };
  }
  
  if (direction === "sell") {
    if (resources[resource] >= amount) {
      resources.gold += price;
      resources[resource] -= amount;
      return { success: true, message: `Sold ${amount} ${resource}` };
    }
    return { success: false, message: `Not enough ${resource}` };
  }
  
  return { success: false, message: "Invalid direction" };
}

function produce(resource, amount) {
  resources[resource] = (resources[resource] || 0) + amount;
}

module.exports = { getStats, trade, produce };
