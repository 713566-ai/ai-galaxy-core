
// =========================
// 🧬 V152 FIX: GAME DNA STABILIZER
// =========================

function cleanupPopulation(games) {
  const seen = new Set();

  return games
    .filter(g => {
      // ❌ remove dead
      if (g.dead) return false;

      // ❌ remove duplicates by ID
      if (seen.has(g.id)) return false;
      seen.add(g.id);

      return true;
    })
    .sort((a, b) => b.fitness - a.fitness) // 🧠 natural selection
    .slice(0, 50); // 🔥 hard cap population
}

function mutate(g) {
  const noise = (Math.random() - 0.5) * 0.1;

  g.fun += noise;
  g.money += Math.random() * 0.5;

  g.fitness = (g.fun + g.money * 0.5);

  if (g.fun < 0) g.dead = true;

  return g;
}

// 🔁 CORE LOOP PATCH
function applyV152(world) {
  world.games = cleanupPopulation(world.games);
  world.games = world.games.map(mutate);
}

module.exports = { applyV152 };

console.log("🧬 V152 FIX LOADED");
