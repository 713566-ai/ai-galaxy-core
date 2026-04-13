// ============================================
// ⚔️ V147 - SPECIES CONFLICT ENGINE
// ============================================
// ✅ Конкуренция между видами
// ✅ Естественный отбор
// ✅ Доминирование жанров
// ============================================

function resolveCompetition(speciesList) {
  if (speciesList.length < 2) return speciesList;
  
  const conflicts = [];
  
  for (let i = 0; i < speciesList.length; i++) {
    for (let j = i + 1; j < speciesList.length; j++) {
      const a = speciesList[i];
      const b = speciesList[j];
      
      if (a.extinct || b.extinct) continue;
      
      // Шанс конфликта зависит от жанров
      const genreConflict = a.genreCluster === b.genreCluster ? 0.3 : 0.1;
      const conflictChance = 0.05 + genreConflict;
      
      if (Math.random() < conflictChance) {
        const result = a.compete(b);
        conflicts.push(result);
      }
    }
  }
  
  return { speciesList, conflicts };
}

module.exports = { resolveCompetition };
