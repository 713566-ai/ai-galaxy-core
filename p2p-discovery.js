const crypto = require('crypto');
const dgram = require('dgram');
const express = require('express');
const axios = require('axios');

class P2PDiscovery {
    constructor(port = 3002) {
        this.nodeId = crypto.randomBytes(20).toString('hex');
        this.port = port;
        this.routingTable = new Map();
        this.peers = new Map();
        this.seedNodes = [];
        this.udpSocket = dgram.createSocket('udp4');
        this.app = express();
        this.app.use(express.json());
        
        console.log(`🆔 ID узла: ${this.nodeId.substring(0, 16)}...`);
    }
    
    async init(seedNodes = []) {
        this.seedNodes = seedNodes;
        this.startUDPListener();
        this.startHTTPAPI();
        await this.connectToSeedNodes();
        this.startPeriodicTasks();
        console.log(`🌐 P2P Discovery запущен на порту ${this.port}`);
    }
    
    startUDPListener() {
        this.udpSocket.bind(this.port);
        
        this.udpSocket.on('message', (msg, rinfo) => {
            try {
                const data = JSON.parse(msg.toString());
                
                if (data.type === 'PING') {
                    const response = JSON.stringify({
                        type: 'PONG',
                        nodeId: this.nodeId,
                        port: this.port,
                        address: rinfo.address
                    });
                    this.udpSocket.send(response, rinfo.port, rinfo.address);
                }
                
                if (data.type === 'PONG') {
                    this.addPeer(data.nodeId, data.address, data.port);
                }
                
                if (data.type === 'ANNOUNCE') {
                    this.addPeer(data.nodeId, data.address, data.port);
                    this.gossipAnnounce(data);
                }
            } catch(e) {}
        });
    }
    
    broadcastDiscovery() {
        const message = JSON.stringify({
            type: 'PING',
            nodeId: this.nodeId,
            port: this.port,
            timestamp: Date.now()
        });
        this.udpSocket.send(message, this.port, '255.255.255.255');
    }
    
    startHTTPAPI() {
        this.app.get('/api/peers', (req, res) => {
            const peers = Array.from(this.peers.values()).map(p => ({
                nodeId: p.nodeId,
                address: p.address,
                port: p.port,
                lastSeen: p.lastSeen
            }));
            res.json({ peers });
        });
        
        this.app.get('/api/node/info', (req, res) => {
            res.json({
                nodeId: this.nodeId,
                port: this.port,
                peerCount: this.peers.size,
                routingTableSize: this.routingTable.size
            });
        });
        
        this.app.post('/api/handshake', (req, res) => {
            const { nodeId, address, port } = req.body;
            this.addPeer(nodeId, address, port);
            res.json({ success: true, nodeId: this.nodeId });
        });
        
        this.app.post('/api/knowledge/sync', (req, res) => {
            const { knowledge, fromNodeId } = req.body;
            this.mergeKnowledge(knowledge, fromNodeId);
            res.json({ success: true });
        });
        
        this.app.listen(this.port + 100, () => {
            console.log(`📡 HTTP API на порту ${this.port + 100}`);
        });
    }
    
    addPeer(nodeId, address, port) {
        if (nodeId === this.nodeId) return;
        const peerKey = `${address}:${port}`;
        
        if (!this.peers.has(peerKey)) {
            this.peers.set(peerKey, {
                nodeId,
                address,
                port,
                lastSeen: Date.now(),
                connected: true
            });
            console.log(`🆕 Новый пир: ${address}:${port}`);
            this.handshakeWithPeer(address, port);
        } else {
            this.peers.get(peerKey).lastSeen = Date.now();
        }
    }
    
    async handshakeWithPeer(address, port) {
        try {
            const response = await axios.post(`http://${address}:${port + 100}/api/handshake`, {
                nodeId: this.nodeId,
                address: await this.getPublicIP(),
                port: this.port
            });
            
            if (response.data.success) {
                console.log(`✅ Рукопожатие с ${address}:${port}`);
                await this.exchangePeers(address, port);
            }
        } catch(e) {}
    }
    
    async exchangePeers(address, port) {
        try {
            const response = await axios.get(`http://${address}:${port + 100}/api/peers`);
            const { peers } = response.data;
            for (const peer of peers) {
                this.addPeer(peer.nodeId, peer.address, peer.port);
            }
        } catch(e) {}
    }
    
    async connectToSeedNodes() {
        for (const seed of this.seedNodes) {
            const [address, port] = seed.split(':');
            await this.handshakeWithPeer(address, parseInt(port));
        }
    }
    
    xorDistance(id1, id2) {
        const buf1 = Buffer.from(id1, 'hex');
        const buf2 = Buffer.from(id2, 'hex');
        const result = Buffer.alloc(20);
        for (let i = 0; i < 20; i++) {
            result[i] = buf1[i] ^ buf2[i];
        }
        return result.toString('hex');
    }
    
    findClosestNodes(targetId, k = 8) {
        const distances = Array.from(this.routingTable.values()).map(node => ({
            nodeId: node.nodeId,
            address: node.address,
            port: node.port,
            distance: this.xorDistance(node.nodeId, targetId)
        }));
        distances.sort((a, b) => a.distance.localeCompare(b.distance));
        return distances.slice(0, k);
    }
    
    async gossip(message) {
        const peers = Array.from(this.peers.values());
        const batchSize = 3;
        for (let i = 0; i < peers.length; i += batchSize) {
            const batch = peers.slice(i, i + batchSize);
            await Promise.all(batch.map(peer => this.sendToPeer(peer, message)));
        }
    }
    
    async sendToPeer(peer, message) {
        try {
            await axios.post(`http://${peer.address}:${peer.port + 100}/api/gossip`, message);
        } catch(e) {}
    }
    
    gossipAnnounce(announce) {
        const peers = Array.from(this.peers.values());
        const randomPeers = peers.sort(() => 0.5 - Math.random()).slice(0, 3);
        for (const peer of randomPeers) {
            this.sendToPeer(peer, announce);
        }
    }
    
    async proposeGlobalEvolution(proposal) {
        const proposalId = `${Date.now()}_${this.nodeId.substring(0, 8)}`;
        const votes = new Map();
        const message = {
            type: 'PROPOSAL',
            proposalId,
            proposal,
            fromNodeId: this.nodeId
        };
        await this.gossip(message);
        await new Promise(resolve => setTimeout(resolve, 5000));
        let yesVotes = 0;
        let totalVotes = 0;
        for (const [nodeId, vote] of votes) {
            totalVotes++;
            if (vote === 'yes') yesVotes++;
        }
        const consensus = yesVotes / totalVotes > 0.5;
        if (consensus) {
            console.log(`✅ Консенсус достигнут! Применяем: ${proposal}`);
            await this.applyGlobalChange(proposal);
        }
        return consensus;
    }
    
    handleVote(proposal, fromNodeId) {
        const vote = Math.random() > 0.3 ? 'yes' : 'no';
        this.sendVote(proposal.proposalId, vote, fromNodeId);
    }
    
    async sendVote(proposalId, vote, toNodeId) {
        const peer = Array.from(this.peers.values()).find(p => p.nodeId === toNodeId);
        if (peer) {
            await axios.post(`http://${peer.address}:${peer.port + 100}/api/consensus/vote`, {
                proposalId,
                vote,
                fromNodeId: this.nodeId
            });
        }
    }
    
    mergeKnowledge(knowledge, fromNodeId) {
        console.log(`🧠 Получены знания от ${fromNodeId}`);
    }
    
    startPeriodicTasks() {
        setInterval(() => {
            this.broadcastDiscovery();
        }, 30000);
        
        setInterval(() => {
            const now = Date.now();
            for (const [key, peer] of this.peers) {
                if (now - peer.lastSeen > 120000) {
                    this.peers.delete(key);
                    console.log(`🗑️ Удален неактивный пир: ${key}`);
                }
            }
        }, 60000);
        
        setInterval(async () => {
            if (this.peers.size > 0) {
                await this.gossip({
                    type: 'SYNC',
                    knowledge: this.getLocalKnowledge(),
                    fromNodeId: this.nodeId
                });
            }
        }, 300000);
    }
    
    async getPublicIP() {
        try {
            const response = await axios.get('https://api.ipify.org?format=json');
            return response.data.ip;
        } catch(e) {
            return '127.0.0.1';
        }
    }
    
    getLocalKnowledge() {
        return {
            evolutionLevel: global.evolutionLevel || 0,
            intelligence: global.intelligence || 0,
            timestamp: Date.now()
        };
    }
    
    async applyGlobalChange(proposal) {
        console.log(`🌍 Применяем глобальное изменение: ${proposal}`);
    }
}

const p2p = new P2PDiscovery(3002);
const seedNodes = [];
p2p.init(seedNodes);

module.exports = p2p;
