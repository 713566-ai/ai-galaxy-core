class GoalSystem {
    generate(state) {
        const goals = [];
        
        if (state.agentsCount < 50) {
            goals.push({ id: 'expand', type: 'expand_system', description: 'Увеличить количество агентов', priority: 0.8, actions: ['spawn_agents'] });
        }
        if (state.stability < 0.6) {
            goals.push({ id: 'stabilize', type: 'increase_stability', description: 'Повысить стабильность', priority: 0.9, actions: ['reduce_mutation'] });
        }
        if (state.bestScore < 5) {
            goals.push({ id: 'perform', type: 'improve_performance', description: 'Улучшить производительность', priority: 0.7, actions: ['increase_selection'] });
        }
        
        return goals;
    }
}

module.exports = GoalSystem;
