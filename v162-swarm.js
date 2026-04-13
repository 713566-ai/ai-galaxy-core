const fs = require('fs');

console.log("🧬 V162 DISTRIBUTED SWARM BRAIN STARTED");

// =========================
// 🌍 SWARM STATE
// =========================
let swarm = {
  tick: 0,
  nodes: [],
  worlds: [],
  globalEntropy: 0.5
};

// =========================
// 🧠 CREATE NODE
// =========================
function createNode(id){
  return {
    id,
    load: Math.random(),
    alive: true,
    worlds: []
  };
}

// =========================
// 🌍 INIT SWARM
// =========================
for(let i=0;i<4;i++){
  swarm.nodes.push(createNode("NODE-"+i));
}

// =========================
// 🧬 CREATE WORLD
// =========================
function createWorld(id){
  return {
    id,
    energy: Math.random(),
    entropy: Math.random(),
    games: [],
    node: null
  };
}

// =========================
// ⚖️ ASSIGN WORLD TO NODE
// =========================
function assignWorld(world){
  let best = swarm.nodes
    .filter(n => n.alive)
    .sort((a,b)=>a.load - b.load)[0];

  world.node = best.id;
  best.worlds.push(world.id);
  best.load += 0.1;

  console.log(`🌍 WORLD ${world.id} -> ${best.id}`);
}

// =========================
// 🧠 SPAWN WORLDS
// =========================
for(let i=0;i<5;i++){
  let w = createWorld("W-"+i);
  swarm.worlds.push(w);
  assignWorld(w);
}

// =========================
// 🔁 MIGRATION SYSTEM
// =========================
function migrate(){
  swarm.worlds.forEach(w=>{
    if(Math.random() < 0.1){
      console.log(`🔁 MIGRATING WORLD ${w.id}`);

      let old = swarm.nodes.find(n => n.id === w.node);
      if(old){
        old.worlds = old.worlds.filter(x=>x!==w.id);
        old.load -= 0.1;
      }

      assignWorld(w);
    }
  });
}

// =========================
// 💀 FAILURE SIMULATION
// =========================
function failNodes(){
  swarm.nodes.forEach(n=>{
    if(Math.random() < 0.05){
      n.alive = false;
      console.log(`💀 NODE FAILED: ${n.id}`);
    }
  });
}

// =========================
// 🔁 MAIN LOOP
// =========================
setInterval(()=>{
  swarm.tick++;

  console.log(`\n🧠 SWARM TICK ${swarm.tick}`);

  migrate();
  failNodes();

  console.log("📊 NODES:", swarm.nodes.map(n=>({
    id:n.id,
    alive:n.alive,
    load:n.load.toFixed(2)
  })));

}, 3000);
