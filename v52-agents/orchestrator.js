const ArchitectAgent = require('./agents/architect');
const ChaosAgent = require('./agents/chaos');
const BugHunterAgent = require('./agents/bug-hunter');
const OptimizerAgent = require('./agents/optimizer');
const GatekeeperAgent = require('./agents/gatekeeper');
const fs = require('fs');
const path = require('path');

class V52Orchestrator {
    constructor() {
        this.agents = {
            architect: new ArchitectAgent(),
            chaos: new ChaosAgent(),
            bugHunter: new BugHunterAgent(),
            optimizer: new OptimizerAgent(),
            gatekeeper: new GatekeeperAgent()
        };
        
        // Веса агентов (важность их голоса)
        this.weights = {
            architect: 0.25,
            chaos: 0.10,
            bugHunter: 0.25,
            optimizer: 0.20,
            gatekeeper: 0.20
        };
        
        // Система доверия (адаптивные веса)
        this.trust = {
            architect: 1.0,
            chaos: 1.0,
            bugHunter: 1.0,
            optimizer: 1.0,
            gatekeeper: 1.0
        };
        
        this.evolutionCycle = 0;
        this.history = [];
        this.conflictLog = [];
    }

    // Обновление доверия к агенту на основе успешности
    updateTrust(agent, success) {
        if (!this.trust[agent]) this.trust[agent] = 1.0;
        
        const change = success ? 0.05 : -0.1;
        this.trust[agent] = Math.max(0.3, Math.min(2.0, this.trust[agent] + change));
        
        console.log(`📊 Доверие ${agent}: ${this.trust[agent].toFixed(2)}`);
    }

    // Расчёт консенсуса (голосование)
    calculateConsensus(results) {
        let score = 0;
        const votes = [];
        
        // Gatekeeper голос
        if (results.gatekeeper.approved) {
            score += this.weights.gatekeeper * this.trust.gatekeeper;
            votes.push({ agent: 'gatekeeper', vote: '✅', weight: this.weights.gatekeeper });
        } else {
            votes.push({ agent: 'gatekeeper', vote: '❌', weight: this.weights.gatekeeper });
        }
        
        // BugHunter голос (нет багов = хорошо)
        if (results.bugs === 0) {
            score += this.weights.bugHunter * this.trust.bugHunter;
            votes.push({ agent: 'bugHunter', vote: '✅', weight: this.weights.bugHunter });
        } else {
            votes.push({ agent: 'bugHunter', vote: '❌', weight: this.weights.bugHunter });
        }
        
        // Chaos голос (тесты пройдены)
        if (results.chaos.passed) {
            score += this.weights.chaos * this.trust.chaos;
            votes.push({ agent: 'chaos', vote: '✅', weight: this.weights.chaos });
        } else {
            votes.push({ agent: 'chaos', vote: '❌', weight: this.weights.chaos });
        }
        
        // Optimizer голос (всегда за улучшения)
        if (results.optimizations.length >= 0) {
            score += this.weights.optimizer * this.trust.optimizer;
            votes.push({ agent: 'optimizer', vote: '✅', weight: this.weights.optimizer });
        }
        
        // Architect голос
        if (results.architect.action !== 'BLOCK') {
            score += this.weights.architect * this.trust.architect;
            votes.push({ agent: 'architect', vote: '✅', weight: this.weights.architect });
        } else {
            votes.push({ agent: 'architect', vote: '❌', weight: this.weights.architect });
        }
        
        const maxPossible = Object.values(this.weights).reduce((a, b) => a + b, 0);
        const normalizedScore = score / maxPossible;
        
        return {
            score: normalizedScore,
            approved: normalizedScore >= 0.6,
            votes,
            details: { score, maxPossible, normalizedScore }
        };
    }

    // Разрешение конфликтов между агентами
    resolveConflict(decisions) {
        const conflicts = [];
        
        // Architect vs Optimizer
        if (decisions.architect.action === 'REFACTOR' && decisions.optimizer.optimizations.length === 0) {
            conflicts.push({
                type: 'Architect vs Optimizer',
                severity: 'medium',
                message: 'Architect хочет рефакторинг, но Optimizer не видит улучшений'
            });
        }
        
        // Gatekeeper vs Chaos
        if (!decisions.gatekeeper.approved && decisions.chaos.passed) {
            conflicts.push({
                type: 'Gatekeeper vs Chaos',
                severity: 'high',
                message: 'Gatekeeper блокирует, но Chaos тесты пройдены'
            });
        }
        
        // BugHunter vs Architect
        if (decisions.bugs > 5 && decisions.architect.action === 'REFACTOR') {
            conflicts.push({
                type: 'BugHunter vs Architect',
                severity: 'critical',
                message: `Слишком много багов (${decisions.bugs}), рефакторинг опасен`
            });
        }
        
        const severity = conflicts.some(c => c.severity === 'critical') ? 'critical' :
                        conflicts.some(c => c.severity === 'high') ? 'high' :
                        conflicts.length > 0 ? 'low' : 'none';
        
        this.conflictLog.push({
            cycle: this.evolutionCycle,
            timestamp: Date.now(),
            conflicts,
            severity
        });
        
        return { conflicts, severity };
    }

    async runEvolutionCycle() {
        console.log('\n🧬 V52.1 КОНСЕНСУСНАЯ ЭВОЛЮЦИЯ');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        this.evolutionCycle++;
        
        // 1. Architect анализирует
        const systemState = {
            files: fs.readdirSync(path.join(__dirname, '..')).filter(f => f.endsWith('.js')).length,
            avgFileSize: 100,
            duplicateCode: Math.floor(Math.random() * 10)
        };
        const architectDecision = this.agents.architect.analyze(systemState);
        console.log(`🏛️ Architect: ${architectDecision.action} (${architectDecision.issues.length} проблем)`);
        
        // 2. Chaos Agent тестирует
        const chaosResult = await this.agents.chaos.stressTest({});
        console.log(`🌪️ Chaos: ${chaosResult.passed ? '✅' : '❌'} (${chaosResult.results.length} тестов)`);
        
        // 3. Bug Hunter сканирует
        const mainJs = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');
        const bugs = this.agents.bugHunter.scanCode(mainJs, 'main.js');
        console.log(`🐛 BugHunter: найдено ${bugs.length} проблем`);
        
        // 4. Optimizer анализирует
        const optimizations = this.agents.optimizer.analyze(mainJs);
        console.log(`⚡ Optimizer: ${optimizations.length} улучшений`);
        
        // 5. Gatekeeper проверяет
        const change = {
            code: mainJs,
            testsPassed: chaosResult.passed && bugs.length === 0
        };
        const gatekeeperDecision = await this.agents.gatekeeper.validate(change);
        console.log(`🚪 Gatekeeper: ${gatekeeperDecision.approved ? '✅ ОДОБРЕНО' : '❌ ОТКЛОНЕНО'}`);
        
        // 6. РАЗРЕШЕНИЕ КОНФЛИКТОВ
        const decisions = {
            architect: architectDecision,
            chaos: chaosResult,
            bugs: bugs.length,
            optimizations: optimizations,
            gatekeeper: gatekeeperDecision
        };
        const conflict = this.resolveConflict(decisions);
        
        if (conflict.severity !== 'none') {
            console.log(`⚠️ КОНФЛИКТ: ${conflict.conflicts.length} конфликтов (${conflict.severity})`);
            conflict.conflicts.forEach(c => console.log(`   - ${c.message}`));
        }
        
        // 7. ГОЛОСОВАНИЕ (консенсус)
        const consensus = this.calculateConsensus(decisions);
        console.log(`\n🗳️ ГОЛОСОВАНИЕ:`);
        consensus.votes.forEach(v => console.log(`   ${v.agent}: ${v.vote} (вес: ${v.weight})`));
        console.log(`   ИТОГ: ${(consensus.score * 100).toFixed(1)}% - ${consensus.approved ? '✅ ПРИНЯТО' : '❌ ОТКЛОНЕНО'}`);
        
        // 8. Обновление доверия на основе результата
        if (consensus.approved) {
            this.updateTrust('architect', architectDecision.issues.length === 0);
            this.updateTrust('chaos', chaosResult.passed);
            this.updateTrust('bugHunter', bugs.length === 0);
            this.updateTrust('optimizer', optimizations.length > 0);
            this.updateTrust('gatekeeper', gatekeeperDecision.approved);
        } else {
            // Штраф всем за плохое решение
            Object.keys(this.trust).forEach(agent => {
                this.updateTrust(agent, false);
            });
        }
        
        // Логируем цикл
        const cycleResult = {
            cycle: this.evolutionCycle,
            timestamp: Date.now(),
            architect: architectDecision,
            chaos: chaosResult,
            bugs: bugs.length,
            optimizations: optimizations.length,
            gatekeeper: gatekeeperDecision,
            conflict,
            consensus,
            trust: { ...this.trust }
        };
        
        this.history.push(cycleResult);
        
        return cycleResult;
    }

    getStatus() {
        return {
            cycle: this.evolutionCycle,
            weights: this.weights,
            trust: this.trust,
            agents: {
                architect: this.agents.architect.getStats(),
                chaos: this.agents.chaos.getStats(),
                bugHunter: this.agents.bugHunter.getStats(),
                optimizer: this.agents.optimizer.getStats(),
                gatekeeper: this.agents.gatekeeper.getStats()
            },
            recentConflicts: this.conflictLog.slice(-5),
            history: this.history.slice(-10)
        };
    }
}

module.exports = V52Orchestrator;
