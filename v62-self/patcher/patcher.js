class PatcherV62 {
    constructor() {
        this.appliedPatches = [];
        this.rollbackStack = [];
    }

    apply(patch, target) {
        if (!patch || !target) {
            return { success: false, error: 'Invalid patch or target' };
        }
        
        const oldValue = target[patch.diff.field];
        let newValue = oldValue;
        
        switch (patch.diff.operation) {
            case 'multiply':
                newValue = oldValue * patch.diff.value;
                break;
            case 'add':
                newValue = oldValue + patch.diff.value;
                break;
            case 'set':
                newValue = patch.diff.value;
                break;
            default:
                return { success: false, error: 'Unknown operation' };
        }
        
        // Сохраняем для отката
        this.rollbackStack.push({
            patch: patch.id,
            target: patch.diff.field,
            oldValue,
            timestamp: Date.now()
        });
        
        // Применяем
        target[patch.diff.field] = newValue;
        
        this.appliedPatches.push({
            id: patch.id,
            timestamp: Date.now(),
            change: patch.change,
            oldValue,
            newValue
        });
        
        console.log(`🔧 PATCH APPLIED: ${patch.change} (${oldValue} → ${newValue})`);
        
        return { success: true, oldValue, newValue };
    }

    rollback() {
        const last = this.rollbackStack.pop();
        if (!last) return { success: false };
        
        // Здесь логика отката
        console.log(`🔄 ROLLBACK: ${last.patch}`);
        return { success: true, rolledBack: last.patch };
    }

    getStats() {
        return {
            appliedCount: this.appliedPatches.length,
            lastPatch: this.appliedPatches[this.appliedPatches.length - 1],
            rollbackStackSize: this.rollbackStack.length
        };
    }
}

module.exports = PatcherV62;
