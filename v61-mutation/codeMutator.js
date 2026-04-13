const fs = require('fs');
const { execSync } = require('child_process');

class CodeMutationEngine {
    constructor(filePath) {
        this.filePath = filePath;
        this.mutationRate = 0.1;
        this.backupPath = `${filePath}.backup`;
    }

    load() {
        return fs.readFileSync(this.filePath, 'utf-8');
    }

    backup() {
        const code = this.load();
        fs.writeFileSync(this.backupPath, code);
        console.log(`💾 Backup created: ${this.backupPath}`);
    }

    restore() {
        if (fs.existsSync(this.backupPath)) {
            const backup = fs.readFileSync(this.backupPath, 'utf-8');
            fs.writeFileSync(this.filePath, backup);
            console.log(`🔄 Restored from backup: ${this.backupPath}`);
            return true;
        }
        return false;
    }

    mutate(code) {
        const lines = code.split("\n");
        const mutated = lines.map(line => {
            if (Math.random() < this.mutationRate) {
                return this.randomMutation(line);
            }
            return line;
        });
        return mutated.join("\n");
    }

    randomMutation(line) {
        const mutations = [
            l => l.replace("true", "false"),
            l => l.replace("0.5", (Math.random() * 0.8 + 0.1).toFixed(2)),
            l => l + " // mutated",
            l => l.replace("console.log", "// console.log"),
            l => l.replace("return", "// return")
        ];
        const fn = mutations[Math.floor(Math.random() * mutations.length)];
        return fn(line);
    }

    validateSyntax(code) {
        const tempFile = `/tmp/validate-${Date.now()}.js`;
        try {
            fs.writeFileSync(tempFile, code);
            execSync(`node --check ${tempFile}`, { stdio: 'pipe' });
            fs.unlinkSync(tempFile);
            return true;
        } catch (e) {
            fs.unlinkSync(tempFile);
            return false;
        }
    }

    commit() {
        const original = this.load();
        const mutated = this.mutate(original);
        
        if (!this.validateSyntax(mutated)) {
            console.log(`❌ Syntax error in mutated code, skipping mutation`);
            return false;
        }
        
        this.backup();
        fs.writeFileSync(this.filePath, mutated);
        console.log(`🧬 CODE MUTATED: ${this.filePath}`);
        return true;
    }

    rollback() {
        return this.restore();
    }

    getStats() {
        return {
            file: this.filePath,
            mutationRate: this.mutationRate,
            backupExists: fs.existsSync(this.backupPath)
        };
    }
}

module.exports = CodeMutationEngine;
