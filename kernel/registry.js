class Registry {
    constructor() {
        this.modules = {};
    }

    register(name, module) {
        this.modules[name] = module;
        console.log(`📦 Registered: ${name}`);
    }

    get(name) {
        return this.modules[name];
    }

    build(core) {
        for (const name in this.modules) {
            const mod = this.modules[name];
            if (mod.init) {
                this.modules[name] = mod.init(core);
            }
        }
        return this.modules;
    }
}

module.exports = Registry;
