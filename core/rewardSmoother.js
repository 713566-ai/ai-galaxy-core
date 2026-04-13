class RewardSmoother {
    constructor(windowSize = 15) {
        this.window = [];
        this.size = windowSize;
    }

    add(value) {
        this.window.push(value);
        if (this.window.length > this.size) this.window.shift();
    }

    avg() {
        if (this.window.length === 0) return 0;
        return this.window.reduce((a, b) => a + b, 0) / this.window.length;
    }
    
    getWindow() { return [...this.window]; }
}

module.exports = RewardSmoother;
