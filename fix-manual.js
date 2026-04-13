const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Находим строки с pushUniverseState и заменяем
const oldPush = `  async pushUniverseState(universeId, worldState) {
    const repoName = 'universe_' + universeId;
    const dir = './temp_' + universeId;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + '/state.json', JSON.stringify(worldState, null, 2));
    
    await this.git.cwd(dir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('State update');
    await this.git.addRemote('origin', 'https://' + this.username + ':' + this.octokit.auth + '@github.com/' + this.username + '/' + repoName + '.git');
    await this.git.push('origin', 'main');
    
    fs.rmSync(dir, { recursive: true, force: true });
    return 'https://github.com/' + this.username + '/' + repoName;
  }`;

const newPush = `  async pushUniverseState(universeId, worldState) {
    const repoName = 'universe_' + universeId;
    const dir = './temp_' + universeId;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + '/state.json', JSON.stringify(worldState, null, 2));
    
    await this.git.cwd(dir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('State update');
    await this.git.branch(['-M', 'master']);
    await this.git.addRemote('origin', 'https://' + this.username + ':' + this.octokit.auth + '@github.com/' + this.username + '/' + repoName + '.git');
    await this.git.push('origin', 'master');
    
    fs.rmSync(dir, { recursive: true, force: true });
    return 'https://github.com/' + this.username + '/' + repoName;
  }`;

if (content.includes(oldPush)) {
  content = content.replace(oldPush, newPush);
  fs.writeFileSync(file, content);
  console.log('✅ Push метод исправлен (main → master)');
} else {
  console.log('⚠️ Старый метод не найден, пробуем другой вариант...');
  // Альтернативная замена
  content = content.replace(/push\('origin', 'main'\)/g, "push('origin', 'master')");
  fs.writeFileSync(file, content);
  console.log('✅ Замена main на master выполнена');
}
