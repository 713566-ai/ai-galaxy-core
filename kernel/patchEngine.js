const fs = require('fs');

class PatchEngine {
    constructor(auditor) {
        this.auditor = auditor;
        this.applied = [];
    }

    apply(patch) {
        if (!this.auditor.check(patch)) {
            console.log("❌ PATCH REJECTED");
            return false;
        }

        console.log(`🧬 APPLYING PATCH: ${patch.change}`);
        this.logPatch(patch);
        this.applied.push(patch);
        return true;
    }

    logPatch(patch) {
        const logEntry = { timestamp: Date.now(), patch };
        fs.appendFileSync("./patch.log", JSON.stringify(logEntry) + "\n");
    }

    getStats() {
        return { appliedCount: this.applied.length, lastPatch: this.applied[this.applied.length - 1] };
    }
}

module.exports = PatchEngine;
