console.log("🌐 V163 SWARM NETWORK STARTED");

// =========================
// 🧠 GLOBAL SWARM BUS
// =========================
const Bus = {
  messages: [],
  
  send(from, to, type, payload){
    this.messages.push({ from, to, type, payload, t: Date.now() });
  },

  broadcast(from, type, payload){
    this.messages.push({ from, to: "ALL", type, payload, t: Date.now() });
  },

  fetch(nodeId){
    return this.messages.filter(m => m.to === nodeId || m.to === "ALL");
  },

  clear(){
    this.messages = [];
  }
};

// =========================
// 🌍 NODES
// =========================
let nodes = [];

function createNode(id){
  return {
    id,
    memory: [],
    energy: Math.random(),
    alive: true
  };
}

for(let i=0;i<4;i++){
  nodes.push(createNode("NODE-"+i));
}

// =========================
// 🧬 WORLDS
// =========================
let worlds = [];

function createWorld(id, node){
  return {
    id,
    node,
    power: Math.random(),
    conflicts: 0
  };
}

for(let i=0;i<6;i++){
  let n = nodes[i % nodes.length];
  worlds.push(createWorld("W-"+i, n.id));
}

// =========================
// ⚔️ WAR SYSTEM
// =========================
function triggerWar(a, b){
  console.log(`⚔️ WAR: ${a} vs ${b}`);
  Bus.send(a, b, "WAR_DECLARED", { intensity: Math.random() });
}

// =========================
// 📡 NODE PROCESSOR
// =========================
function tickNode(node){
  let inbox = Bus.fetch(node.id);

  inbox.forEach(msg=>{
    if(msg.type === "WAR_DECLARED"){
      node.energy -= msg.payload.intensity * 0.1;
      node.memory.push(msg);

      console.log(`💥 ${node.id} received WAR signal`);
    }

    if(msg.type === "SYNC"){
      node.energy += 0.01;
    }
  });

  node.energy += 0.005;
}

// =========================
// 🔁 SWARM LOOP
// =========================
let tick = 0;

setInterval(()=>{
  tick++;
  console.log(`\n🌐 SWARM TICK ${tick}`);

  // 🧠 process nodes
  nodes.forEach(n=>{
    if(n.alive){
      tickNode(n);
    }
  });

  // ⚔️ random wars
  if(Math.random() < 0.4){
    let a = nodes[Math.floor(Math.random()*nodes.length)].id;
    let b = nodes[Math.floor(Math.random()*nodes.length)].id;
    if(a !== b) triggerWar(a,b);
  }

  // 📡 broadcast sync
  Bus.broadcast("SWARM", "SYNC", { tick });

  // 💀 failure simulation
  nodes.forEach(n=>{
    if(Math.random() < 0.03){
      n.alive = false;
      console.log(`💀 NODE DOWN: ${n.id}`);
    }
  });

  // 📊 status
  console.log("📊 NODES:");
  nodes.forEach(n=>{
    console.log({
      id: n.id,
      energy: n.energy.toFixed(3),
      alive: n.alive
    });
  });

}, 2500);
