// Anti-duplicate lock
if (global.__AI_CORE_LOCK__) {
    console.log("🚫 Another instance already running");
    process.exit(1);
}
global.__AI_CORE_LOCK__ = true;
