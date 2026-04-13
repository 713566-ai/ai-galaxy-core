const express = require('express');
const app = express();
app.get('/api/swarm/status', (req, res) => {
  res.json({ status: 'swarm master', nodes: [], timestamp: Date.now() });
});
app.listen(3002, () => console.log('Swarm master on 3002'));
