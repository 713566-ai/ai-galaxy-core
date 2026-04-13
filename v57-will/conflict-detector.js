class ConflictDetector {
    detect(goals) {
        const conflicts = [];
        
        for (let i = 0; i < goals.length; i++) {
            for (let j = i + 1; j < goals.length; j++) {
                const a = goals[i];
                const b = goals[j];
                
                if (a.type === 'expand_system' && b.type === 'increase_stability') {
                    conflicts.push({ goalA: a.description, goalB: b.description, reason: 'Рост vs Стабильность' });
                }
                if (a.type === 'improve_performance' && b.type === 'increase_complexity') {
                    conflicts.push({ goalA: a.description, goalB: b.description, reason: 'Производительность vs Сложность' });
                }
            }
        }
        
        return conflicts;
    }
}

module.exports = ConflictDetector;
