const fs = require('fs');
const path = require('path');

class PatchEngine {
    constructor() {
        this.patchesPath = path.join(__dirname, '../../patches');
        if (!fs.existsSync(this.patchesPath)) fs.mkdirSync(this.patchesPath, { recursive: true });
    }

    generatePatch(filePath, newContent) {
        const originalContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
        const diff = this.createDiff(originalContent, newContent);
        
        const patchFile = path.join(this.patchesPath, `patch-${Date.now()}.diff`);
        fs.writeFileSync(patchFile, diff);
        
        return { patchFile, hasChanges: originalContent !== newContent };
    }

    createDiff(original, updated) {
        const originalLines = original.split('\n');
        const updatedLines = updated.split('\n');
        const diff = [];
        
        for (let i = 0; i < Math.max(originalLines.length, updatedLines.length); i++) {
            if (originalLines[i] !== updatedLines[i]) {
                if (updatedLines[i] !== undefined) {
                    diff.push(`+ ${updatedLines[i]}`);
                }
                if (originalLines[i] !== undefined && !updatedLines.includes(originalLines[i])) {
                    diff.push(`- ${originalLines[i]}`);
                }
            }
        }
        
        return diff.join('\n');
    }

    applyPatch(filePath, patchFile) {
        if (!fs.existsSync(patchFile)) return false;
        
        const patch = fs.readFileSync(patchFile, 'utf8');
        const lines = patch.split('\n');
        let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
        let contentLines = content ? content.split('\n') : [];
        
        lines.forEach(line => {
            if (line.startsWith('+ ')) {
                contentLines.push(line.substring(2));
            } else if (line.startsWith('- ')) {
                const idx = contentLines.indexOf(line.substring(2));
                if (idx !== -1) contentLines.splice(idx, 1);
            }
        });
        
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, contentLines.join('\n'));
        return true;
    }

    rollback(patchFile) {
        if (fs.existsSync(patchFile)) {
            fs.unlinkSync(patchFile);
        }
        return true;
    }
}

module.exports = PatchEngine;
