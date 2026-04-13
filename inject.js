const fs = require('fs');

const targetFile = './core-v110.js';

console.log('🧬 Вставка GitHub Manager в ' + targetFile);

if (!fs.existsSync(targetFile)) {
  console.log('❌ Файл не найден');
  process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('GitHubManager')) {
  console.log('✅ Уже есть');
  process.exit(0);
}

const injectCode = `

// ========== GITHUB MANAGER ==========
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');

class GitHubManager {
  constructor(token, username) {
    this.octokit = new Octokit({ auth: token });
    this.username = username;
    this.git = simpleGit();
  }

  async pushUniverseState(universeId, worldState) {
    const repoName = 'universe_' + universeId;
    const dir = './temp_' + universeId;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + '/state.json', JSON.stringify(worldState, null, 2));
    
    await this.git.cwd(dir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('State');
    await this.git.addRemote('origin', 'https://' + this.username + ':' + this.octokit.auth + '@github.com/' + this.username + '/' + repoName + '.git');
    await this.git.push('origin', 'main');
    
    fs.rmSync(dir, { recursive: true, force: true });
    return 'https://github.com/' + this.username + '/' + repoName;
  }
}

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;
let gitManager = (token && username) ? new GitHubManager(token, username) : null;
if (gitManager) console.log('GitHub Manager ready');
// ========== END ==========
`;

const lines = content.split('\n');
let insertIndex = 0;
for (let i = 0; i < lines.length && i < 30; i++) {
  if (lines[i].includes('require(')) insertIndex = i + 1;
}
lines.splice(insertIndex, 0, injectCode);
fs.writeFileSync(targetFile, lines.join('\n'));

console.log('✅ Готово!');
