
// ⚔️ COMBAT MODULE
function fight(attacker, defender) {
  const attackPower = attacker.power * (0.5 + Math.random() * 0.5);
  const defendPower = defender.power * (0.3 + Math.random() * 0.7);
  
  if (attackPower > defendPower) {
    const damage = (attackPower - defendPower) * 10;
    return { winner: attacker, loser: defender, damage: damage.toFixed(1) };
  } else {
    const damage = (defendPower - attackPower) * 5;
    return { winner: defender, loser: attacker, damage: damage.toFixed(1) };
  }
}

function simulateBattle(teamA, teamB) {
  const results = [];
  for (let i = 0; i < Math.min(teamA.length, teamB.length); i++) {
    results.push(fight(teamA[i], teamB[i]));
  }
  return results;
}

module.exports = { fight, simulateBattle };
