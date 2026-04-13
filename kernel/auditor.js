class Auditor {
    check(patch) {
        if (!patch || !patch.target) return false;
        if (!patch.diff) return false;

        const dangerous = ["process.exit", "rm -rf", "eval", "require('fs')", "execSync"];
        for (const d of dangerous) {
            if (patch.diff.includes(d)) {
                console.log(`❌ Auditor rejected: dangerous pattern "${d}"`);
                return false;
            }
        }

        if (patch.risk === 'high') {
            console.log(`❌ Auditor rejected: high risk patch`);
            return false;
        }

        console.log(`✅ Auditor approved: ${patch.change}`);
        return true;
    }
}

module.exports = Auditor;
