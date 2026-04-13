// ============================================
// ⚔️ V145 - GAME WARS SYSTEM
// ============================================

class GameWars {
  constructor() {
    this.activeWars = [];
    this.warHistory = [];
  }
  
  declareWar(gameA, gameB) {
    // Проверяем, не воюют ли уже
    const alreadyAtWar = this.activeWars.some(w => 
      (w.gameA === gameA && w.gameB === gameB) ||
      (w.gameA === gameB && w.gameB === gameA)
    );
    
    if (alreadyAtWar) return false;
    
    this.activeWars.push({
      gameA,
      gameB,
      startedAt: Date.now(),
      turns: 0
    });
    
    console.log(`⚔️ [WAR] ${gameA.id} declared war on ${gameB.id}!`);
    return true;
  }
  
  tick() {
    const finishedWars = [];
    
    for (const war of this.activeWars) {
      war.turns++;
      
      // Битва
      const result = war.gameA.warWith(war.gameB);
      
      this.warHistory.push({
        ...result,
        turn: war.turns,
        timestamp: Date.now()
      });
      
      // Война заканчивается, если один из игроков мёртв
      if (war.gameA.status === "dead" || war.gameB.status === "dead") {
        finishedWars.push(war);
      }
      
      // Или после 10 раундов
      if (war.turns >= 10) {
        finishedWars.push(war);
      }
    }
    
    // Удаляем законченные войны
    for (const war of finishedWars) {
      const index = this.activeWars.indexOf(war);
      if (index !== -1) {
        this.activeWars.splice(index, 1);
        console.log(`🕊️ [WAR] War between ${war.gameA.id} and ${war.gameB.id} ended after ${war.turns} turns`);
      }
    }
    
    // Ограничиваем историю
    if (this.warHistory.length > 100) {
      this.warHistory.shift();
    }
  }
  
  getActiveWars() {
    return this.activeWars.map(w => ({
      gameA: w.gameA.id,
      gameB: w.gameB.id,
      turns: w.turns
    }));
  }
  
  getWarHistory() {
    return this.warHistory.slice(-20);
  }
}

module.exports = new GameWars();
