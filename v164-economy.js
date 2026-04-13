console.log("💰 V164 EMERGENT ECONOMY STARTED");

// =========================
// 🌍 NODES ECONOMY
// =========================
let nodes = [];

function createNode(id){
  return {
    id,
    money: 100,
    production: Math.random(),
    alive: true
  };
}

for(let i=0;i<4;i++){
  nodes.push(createNode("NODE-"+i));
}

// =========================
// 🌍 WORLDS (CIVS)
// =========================
let worlds = [];

function createWorld(id, node){
  return {
    id,
    node,
    fun: Math.random()*2,
    energy: Math.random(),
    population: Math.floor(Math.random()*1000),
    alive: true
  };
}

for(let i=0;i<6;i++){
  worlds.push(createWorld("W-"+i, nodes[i%nodes.length].id));
}

// =========================
// 💰 PRICE FUNCTION
// =========================
function price(world){
  return (
    world.fun * 50 +
    world.energy * 30 +
    world.population * 0.01
  );
}

// =========================
// 🏦 TRADE SYSTEM
// =========================
function trade(){
  worlds.forEach(w=>{
    let seller = nodes.find(n => n.id === w.node);
    if(!seller) return;

    let value = price(w);

    seller.money += value * 0.05;

    // random economy drift
    if(Math.random() < 0.3){
      let buyer = nodes[Math.floor(Math.random()*nodes.length)];
      if(buyer.id !== seller.id){
        seller.money += 2;
        buyer.money -= 2;

        console.log(`💱 TRADE: ${buyer.id} <-> ${seller.id}`);
      }
    }
  });
}

// =========================
// 📉 BANKRUPTCY SYSTEM
// =========================
function collapse(){
  nodes.forEach(n=>{
    if(n.money < 20){
      n.alive = false;
      console.log(`💀 NODE BANKRUPT: ${n.id}`);

      // worlds die with node
      worlds.forEach(w=>{
        if(w.node === n.id){
          w.alive = false;
        }
      });
    }
  });
}

// =========================
// 📈 ECONOMIC GROWTH
// =========================
function growth(){
  nodes.forEach(n=>{
    if(n.alive){
      n.money += n.production * 2;
    }
  });
}

// =========================
// 🔁 MAIN LOOP
// =========================
let tick = 0;

setInterval(()=>{
  tick++;

  console.log(`\n💰 ECONOMY TICK ${tick}`);

  growth();
  trade();
  collapse();

  console.log("📊 NODES:");
  nodes.forEach(n=>{
    console.log({
      id: n.id,
      money: n.money.toFixed(2),
      alive: n.alive
    });
  });

  console.log("🌍 WORLDS:");
  worlds.forEach(w=>{
    console.log({
      id: w.id,
      node: w.node,
      value: price(w).toFixed(2),
      alive: w.alive
    });
  });

}, 3000);
