#!/bin/bash
echo "🔧 Исправляем pushUniverseState в core-v110.js..."

node -e "
const fs = require('fs');
const file = './core-v110.js';
let content = fs.readFileSync(file, 'utf8');

const oldMethod = /async pushUniverseState\([^)]+\)\s*\{[\s\S]+?return[^;]+;\s*\}/;

const newMethod = \`async pushUniverseState(universeId, worldState) {
    const repoName = 'universe_' + universeId;
    const dir = './temp_' + universeId;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + '/state.json', JSON.stringify(worldState, null, 2));

    await this.git.cwd(dir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('State update');
    await this.git.branch(['-M', 'master']);

    await this.git.addRemote('origin', 'https://github.com/' + this.username + '/' + repoName + '.git');
    
    await this.git.addConfig('credential.https://github.com.username', this.username);
    await this.git.addConfig('credential.https://github.com.helper', 'store --file=~/.git-credentials');
    
    const { execSync } = require('child_process');
    execSync('echo \"https://' + this.username + ':' + this.octokit.auth + '@github.com\" >> ~/.git-credentials');
    
    await this.git.push('origin', 'master');

    fs.rmSync(dir, { recursive: true, force: true });
    return 'https://github.com/' + this.username + '/' + repoName;
  }\`;

if (content.match(oldMethod)) {
  content = content.replace(oldMethod, newMethod);
  fs.writeFileSync(file, content);
  console.log('✅ Метод pushUniverseState успешно заменён');
} else {
  console.log('⚠️ Метод не найден, пробуем другой способ...');
  const simpleReplace = content.replace(/await this\.git\.push\('origin', 'main'\)/g, \"await this.git.push('origin', 'master')\");
  if (simpleReplace !== content) {
    fs.writeFileSync(file, simpleReplace);
    console.log('✅ Заменено main → master');
  } else {
    console.log('❌ Не удалось найти метод для замены');
  }
}
"

echo ""
echo "=== ПЕРЕЗАПУСК ЯДРА ==="
pkill -9 node 2>/dev/null
sleep 1
node core-v110.js &
sleep 3

echo ""
echo "=== ТЕСТ PUSH ==="
curl -s -X POST http://localhost:3000/api/github/push

echo ""
echo "=== СТАТУС ОБЛАКА ==="
curl -s http://localhost:3000/api/cloud/status
