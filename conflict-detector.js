class ConflictDetector {
    detect(goals) {
        const conflicts = [];

        for (let i = 0; i < goals.length; i++) {
            for (let j = i + 1; j < goals.length; j++) {
                const a = goals[i];
                const b = goals[j];

                if (
                    (a.type === 'expand_system' && b.type === 'increase_stability') ||
                    (a.type === 'improve_performance' && b.type === 'reduce_complexity')
                ) {
                    conflicts.push({ a, b, reason: 'conflict' });
                }
            }
        }

        return conflicts;
    }
}

module.exports = ConflictDetector;
