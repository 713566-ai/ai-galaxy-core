class PriorityEvolution {
    update(bias, reward) {
        Object.keys(bias).forEach(k => {
            bias[k] *= reward > 0 ? 1.05 : 0.95;
        });

        const sum = Object.values(bias).reduce((a, b) => a + b, 0);
        Object.keys(bias).forEach(k => bias[k] /= sum);

        return bias;
    }
}

module.exports = PriorityEvolution;
