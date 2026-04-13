const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Полностью заменяем метод pushUniverseState
const oldMethodMatch = /async pushUniverseState\([^)]+\)\s*\{[\s\S]+?return[^;]+;\s*\}/;
const newMethod = `async pushUniverseState(universeId, worldState) {
    const repoName = 'universe_' + universeId;
    const dir = './temp_' + universeId;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + '/state.json', JSON.stringify(worldState, null, 2));
    
    await this.git.cwd(dir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('State update');
    await this.git.branch(['-M', 'master']);
    
    // Исправленный URL с правильным кодированием
    const token = this.octokit.auth;
    const remoteUrl = \`https://\${this.username}:\${token}@github.com/\${this.username}/\${repoName}.git\`;
    await this.git.addRemote('origin', remoteUrl);
    await this.git.push('origin', 'master');
    
    fs.rmSync(dir, { recursive: true, force: true });
    return 'https://github.com/' + this.username + '/' + repoName;
  }`;

content = content.replace(oldMethodMatch, newMethod);
fs.writeFileSync(file, content);
console.log('✅ Метод push исправлен');
