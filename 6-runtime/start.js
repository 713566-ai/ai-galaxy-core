const { GodOrchestrator } = require("../2-orchestrator/god-orchestrator");

const core = {
  games: [],
  worlds: [{ entropy: 0.5 }]
};

const orch = new GodOrchestrator(core);

setInterval(() => {
  orch.think();
}, 2000);
