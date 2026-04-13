const fs = require('fs');
const { spawn } = require('child_process');

console.log('🧬 V161 SELF-HEALING CORE STARTED');

const CORE_FILE = './core-v145.js';
const LOCK = './core.lock';
const CHECK_INTERVAL = 5000;

let child = null;

// -------------------------
// START CORE
// -------------------------
function startCore(){
  console.log('🚀 START CORE');

  child = spawn('node', [CORE_FILE], {
    stdio: 'inherit'
  });

  fs.writeFileSync(LOCK, String(child.pid));
  console.log('🧲 LOCK PID:', child.pid);

  child.on('exit', (code)=>{
    console.log('💀 CORE CRASH:', code);
    console.log('🔁 RESTARTING...');
    setTimeout(startCore, 2000);
  });
}

// -------------------------
// HEALTH CHECK
// -------------------------
function healthCheck(){
  try {
    if(!child){
      console.log('⚠️ NO CORE → START');
      return startCore();
    }

    process.kill(child.pid, 0);
    console.log('🧠 CORE ALIVE:', child.pid);

  } catch(e){
    console.log('💀 CORE DEAD → RESTART');
    startCore();
  }
}

// -------------------------
// CLEAN ZOMBIES
// -------------------------
function cleanup(){
  try {
    const { execSync } = require('child_process');
    execSync('pkill -f core-v145.js || true');
  } catch(e){}
}

// -------------------------
// BOOT
// -------------------------
cleanup();
startCore();

setInterval(healthCheck, CHECK_INTERVAL);

// -------------------------
// EXIT SAFE
// -------------------------
process.on('SIGINT', ()=>{
  console.log('🛑 STOP V161');

  if(child) child.kill();
  if(fs.existsSync(LOCK)) fs.unlinkSync(LOCK);

  process.exit();
});
