const fs = require("fs");

class Memory {
    constructor(path = "./state/snapshot.json") {
        this.path = path;
        this.ensureDir();
    }

    ensureDir() {
        const dir = this.path.split('/').slice(0, -1).join('/');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    save(state) {
        const data = {
            ...state,
            timestamp: Date.now()
        };
        fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
        console.log(`💾 MEMORY SAVED: tick=${state.tick}`);
    }

    load() {
        try {
            if (fs.existsSync(this.path)) {
                const data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
                console.log(`♻️ MEMORY LOADED: tick=${data.tick}`);
                return data;
            }
        } catch (e) {
            console.log(`⚠️ Memory load error: ${e.message}`);
        }
        return null;
    }

    clear() {
        if (fs.existsSync(this.path)) {
            fs.unlinkSync(this.path);
        }
    }
}

module.exports = Memory;
