class Agents {
    constructor() {
        this.list = {
            codey: { name: "Codey-v2", role: "code_generation", skills: ["code_review", "refactoring"] },
            uiax: { name: "UIA-X", role: "reasoning", modules: ["perception", "action"] },
            garlic: { name: "Garlic", role: "safety", stats: { threats: 0, blocks: 0 } }
        };
    }

    getAll() { return this.list; }
}

module.exports = Agents;
