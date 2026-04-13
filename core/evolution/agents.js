const agents = [
    {
        name: 'codey',
        weight: 0.4,
        strategy: 'growth',
        recommendation: 'expand',
        mutationRate: 0.2
    },
    {
        name: 'uiax',
        weight: 0.4,
        strategy: 'balance',
        recommendation: 'diplomacy',
        mutationRate: 0.2
    },
    {
        name: 'garlic',
        weight: 0.2,
        strategy: 'safety',
        recommendation: 'stabilize',
        mutationRate: 0.2
    }
];

module.exports = agents;
