// =========================
// 🧬 V76 STABLE CORE ENGINE
// =========================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const STATE_FILE = "./state/v76_state.json";

// =========================
// 🛡 SCHEMA LOCK
// =========================

const RewardSchema = (r) => ({
    tick: Number(r.tick ?? r.тик ?? 0),
    reward: Number(r.reward ?? r.награда ?? 0)
});

const PolicySchema = (p) => ({
    mutationRate: Number(p.mutationRate ?? p.скоростьМутаций ?? 0.2),
    selectionPressure: Number(p.selectionPressure ?? p.давлениеОтбора ?? 0.6),
    explorationBias: Number(p.explorationBias ?? p.смещениеИсследования ?? 0.5)
});

const WorldSchema = (w) => ({
    entropy: Number(w.entropy ?? w.энтропия ?? 0.5),
    wars: Number(w.wars ?? w.войны ?? 0),
    entities: Number(w.entities ?? w.сущности ?? 500),
    alliances: Number(w.alliances ?? w.альянсы ?? 0),
    tick: Number(w.tick ?? 0)
});

// =========================
// 🧼 STATE SANITIZER
// =========================

function sanitize(obj) {
    if (!obj) return getDefaultState();
    
    const clean = {
        ok: true,
        tick: Number(obj.tick ?? 0),
        policy: PolicySchema(obj.policy ?? {}),
        reward: {
            total: Number(obj.reward?.total ?? 0),
            last: Number(obj.reward?.last ?? 0),
            smoothed: Number(obj.reward?.smoothed ?? 0),
            history: (obj.reward?.history ?? [])
                .map(RewardSchema)
                .filter(r => Number.isFinite(r.tick) && Number.isFinite(r.reward))
                .slice(-200)
        },
        world: WorldSchema(obj.world ?? {}),
        evolutionaryBrain: {
            generation: Number(obj.evolutionaryBrain?.generation ?? 1),
            population: Number(obj.evolutionaryBrain?.population ?? 10),
            leader: obj.evolutionaryBrain?.leader ?? null,
            leaderFitness: Number(obj.evolutionaryBrain?.leaderFitness ?? 0),
            speciesCount: Number(obj.evolutionaryBrain?.speciesCount ?? 1),
            agents: (obj.evolutionaryBrain?.agents ?? []).slice(0, 100)
        }
    };
    
    return clean;
}

function getDefaultState() {
    return {
        ok: true,
        tick: 0,
        policy: { mutationRate: 0.2, selectionPressure: 0.6, explorationBias: 0.5 },
        reward: { total: 0, last: 0, smoothed: 0, history: [] },
        world: { entropy: 0.5, wars: 0, entities: 500, alliances: 0, tick: 0 },
        evolutionaryBrain: { generation: 1, population: 10, leader: null, leaderFitness: 0, speciesCount: 1, agents: [] }
    };
}

// =========================
// 💾 PERSISTENCE
// =========================

function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
            const clean = sanitize(raw);
            console.log(`♻️ V76 STATE LOADED: tick=${clean.tick}`);
            return clean;
        }
    } catch(e) {
        console.log("⚠️ State load error, using default");
    }
    return getDefaultState();
}

function saveState(state) {
    try {
        const toSave = sanitize(state);
        fs.writeFileSync(STATE_FILE, JSON.stringify(toSave, null, 2));
    } catch(e) {
        console.log("⚠️ State save error:", e.message);
    }
}

// =========================
// 🧠 CORE STATE
// =========================

let state = loadState();

// =========================
// 🔁 EVOLUTION STEP
// =========================

function evolve() {
    state.tick++;
    
    // Симуляция мира
    const targetEntropy = 0.3;
    const diff = targetEntropy - state.world.entropy;
    state.world.entropy += diff * 0.05 + (Math.random() - 0.5) * 0.05;
    state.world.entropy = Math.max(0.1, Math.min(0.9, state.world.entropy));
    
    state.world.entities += Math.floor(Math.random() * 3) - 1;
    state.world.entities = Math.max(100, Math.min(1000, state.world.entities));
    
    state.world.wars = Math.max(0, Math.min(5, state.world.wars + (Math.random() > 0.8 ? 1 : -1)));
    state.world.alliances = Math.max(0, Math.min(5, state.world.alliances + (Math.random() > 0.8 ? 1 : -1)));
    state.world.tick = state.tick;
    
    // Вычисление награды
    let reward = 0;
    reward += (targetEntropy - state.world.entropy) * 2;
    reward += (state.world.entities - 500) / 100;
    reward -= state.world.wars * 0.5;
    reward += state.world.alliances * 0.3;
    reward = Math.max(-3, Math.min(3, reward));
    
    // Обновление награды
    state.reward.last = reward;
    state.reward.total += reward;
    state.reward.smoothed = state.reward.smoothed * 0.9 + reward * 0.1;
    state.reward.history.push({ tick: state.tick, reward });
    if (state.reward.history.length > 200) state.reward.history.shift();
    
    // Адаптация политики
    if (state.reward.smoothed < -0.5) {
        state.policy.mutationRate = Math.min(0.35, state.policy.mutationRate * 1.02);
        state.policy.explorationBias = Math.min(0.8, state.policy.explorationBias + 0.01);
    } else if (state.reward.smoothed > 0.5) {
        state.policy.mutationRate = Math.max(0.12, state.policy.mutationRate * 0.98);
        state.policy.selectionPressure = Math.min(0.8, state.policy.selectionPressure + 0.01);
    }
    
    state.policy.mutationRate = Math.max(0.12, Math.min(0.35, state.policy.mutationRate));
    state.policy.selectionPressure = Math.max(0.5, Math.min(0.8, state.policy.selectionPressure));
    state.policy.explorationBias = Math.max(0.3, Math.min(0.8, state.policy.explorationBias));
    
    // Эволюция мозга
    state.evolutionaryBrain.leaderFitness = Math.max(0, Math.min(1, 
        state.evolutionaryBrain.leaderFitness + reward * 0.01
    ));
    
    if (state.tick % 50 === 0) {
        state.evolutionaryBrain.generation++;
        state.evolutionaryBrain.population = Math.floor(10 + Math.random() * 20);
    }
    
    // Сохранение
    saveState(state);
    
    if (state.tick % 10 === 0) {
        console.log(`🧬 V76 T${state.tick} | E:${state.world.entropy.toFixed(3)} | R:${reward.toFixed(2)} | MR:${state.policy.mutationRate.toFixed(3)}`);
    }
}

// =========================
// 🚀 MAIN LOOP
// =========================

setInterval(() => {
    try {
        evolve();
    } catch (e) {
        console.error("❌ CORE ERROR:", e.message);
    }
}, 2000);

// =========================
// 📡 API
// =========================

app.get("/api/status", (req, res) => {
    res.json(sanitize(state));
});

app.get("/api/state", (req, res) => {
    res.json(sanitize(state));
});

app.post("/api/reset", (req, res) => {
    state = getDefaultState();
    saveState(state);
    res.json({ ok: true, reset: true });
});

app.get("/api/memory", (req, res) => {
    const mem = process.memoryUsage();
    res.json({ heapUsed: Math.round(mem.heapUsed / 1024 / 1024), heapTotal: Math.round(mem.heapTotal / 1024 / 1024) });
});

// =========================
// 🧱 START
// =========================

app.listen(3000, () => {
    console.log("🧬 V76 STABLE CORE ONLINE ON :3000");
    console.log(`📁 State file: ${STATE_FILE}`);
});
