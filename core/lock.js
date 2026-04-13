if (global.__V70_RUNNING__) {
    console.log("🚫 V70 already running");
    process.exit(1);
}
global.__V70_RUNNING__ = true;
console.log("🔒 V70 LOCK ACTIVE");
