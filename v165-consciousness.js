console.log("🧠 V165 CONSCIOUSNESS LAYER STARTED");

// =========================
// 🌍 WORLDS WITH "MIND"
// =========================
let worlds = [];

function createWorld(id, node){
  return {
    id,
    node,

    // physical state
    energy: Math.random(),
    fun: Math.random()*2,
    population: Math.floor(Math.random()*1000),

    // 🧠 CONSCIOUS LAYER
    desireToSurvive: Math.random(),
    greed: Math.random(),
    cooperation: Math.random(),

    // internal score (self perception)
    selfValue: 0,

    alive: true
  };
}

// =========================
// NODES
// =========================
let nodes = ["NODE-0","NODE-1","NODE-2","NODE-3"];

// =========================
// INIT WORLDS
// =========================
for(let i=0;i<8;i++){
  worlds.push(createWorld("W-"+i, nodes[i%nodes.length]));
}

// =========================
// 🧠 SELF EVALUATION
// =========================
function evaluate(world){
  world.selfValue =
    world.energy * 0.3 +
    world.fun * 0.3 +
    (world.population / 1000) * 0.2 +
    world.desireToSurvive * 0.2;

  return world.selfValue;
}

// =========================
// 🎯 DECISION SYSTEM (AI BEHAVIOR)
// =========================
function act(world){

  // survival behavior
  if(world.desireToSurvive > 0.7){
    world.energy += 0.02;
    world.fun -= 0.01;
  }

  // greedy expansion
  if(world.greed > 0.6){
    world.population += 5;
    world.energy -= 0.01;
  }

  // cooperation behavior
  if(world.cooperation > 0.6){
    world.fun += 0.02;
    world.energy += 0.01;
  }

  // decay if low self value
  if(world.selfValue < 0.5){
    world.energy -= 0.03;
  }
}

// =========================
// 💀 DEATH CONDITION
// =========================
function checkDeath(world){
  if(world.energy < 0.1 || world.selfValue < 0.2){
    world.alive = false;
    console.log(`💀 WORLD DIED: ${world.id}`);
  }
}

// =========================
// 🔁 MAIN LOOP
// =========================
let tick = 0;

setInterval(()=>{

  tick++;
  console.log(`\n🧠 CONSCIOUSNESS TICK ${tick}`);

  worlds.forEach(w=>{
    if(!w.alive) return;

    evaluate(w);
    act(w);
    checkDeath(w);
  });

  console.log("📊 WORLDS:");

  worlds.forEach(w=>{
    console.log({
      id: w.id,
      energy: w.energy.toFixed(3),
      fun: w.fun.toFixed(3),
      pop: w.population,
      self: w.selfValue.toFixed(3),
      alive: w.alive
    });
  });

}, 2500);
