class Registry {
    constructor() {
        this.modules = new Map();
    }

    register(name, module) {
        this.modules.set(name, module);
        console.log(`📦 MODULE REGISTERED: ${name}`);
    }

    get(name) {
        return this.modules.get(name);
    }

    list() {
        return [...this.modules.keys()];
    }

    unregister(name) {
        this.modules.delete(name);
        console.log(`🗑️ MODULE UNREGISTERED: ${name}`);
    }
}

class SelfOrganizingCore {
    constructor() {
        this.registry = new Registry();
        this.state = {
            entropy: 0.5,
            wars: 0,
            entities: 500,
            alliances: 0,
            tick: 0
        };
        this.metaWill = null;
    }

    attach(name, module) {
        if (module.init) module.init(this);
        this.registry.register(name, module);
    }

    getState() {
        return this.state;
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
    }

    tick() {
        this.state.tick++;
        for (const [name, mod] of this.registry.modules.entries()) {
            if (mod.update) {
                try {
                    mod.update(this.state);
                } catch (e) {
                    console.log(`⚠️ module ${name} failed:`, e.message);
                }
            }
        }
    }

    getRegistryStats() {
        return {
            modulesCount: this.registry.modules.size,
            modules: this.registry.list(),
            state: this.state
        };
    }
}

module.exports = { Registry, SelfOrganizingCore };
