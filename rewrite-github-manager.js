const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Находим и удаляем старый класс GitHubManager
const classStart = content.indexOf('class GitHubManager');
const classEnd = content.indexOf('class', classStart + 1);

let newContent;
if (classEnd !== -1) {
  // Удаляем старый класс
  newContent = content.slice(0, classStart) + content.slice(classEnd);
} else {
  newContent = content;
}

// Новый полноценный класс
const newClass = `
// ========== GITHUB MANAGER ==========
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');

class GitHubManager {
  constructor(token, username) {
    this.octokit = new Octokit({ auth: token });
    this.username = username;
    this.git = simpleGit();
  }

  async createRepo(name, description) {
    const response = await this.octokit.repos.createForAuthenticatedUser({
      name: name,
      description: description || 'AI Galaxy Universe',
      private: false,
      auto_init: true
    });
    console.log('📦 Repo created: ' + response.data.html_url);
    return response.data;
  }

  async pushUniverseState(universeId, worldState) {
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
  }

  async forkToNewUniverse(universeId) {
    const newRepoName = 'ai_core_' + universeId;
    const repo = await this.createRepo(newRepoName, 'Forked AI Galaxy Core');
    
    const tempDir = './temp_fork_' + universeId;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const { execSync } = require('child_process');
    try {
      execSync('cp -r ./* ' + tempDir + '/', { stdio: 'ignore' });
    } catch(e) {}
    
    await this.git.cwd(tempDir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('Fork from parent');
    await this.git.addRemote('origin', 'https://' + this.username + ':' + this.octokit.auth + '@github.com/' + this.username + '/' + newRepoName + '.git');
    await this.git.push('origin', 'main');
    
    return repo.html_url;
  }
}

const token = process.env.GITHUB_TOKEN;
const username = process.env.GITHUB_USERNAME;
let gitManager = (token && username) ? new GitHubManager(token, username) : null;
if (gitManager) console.log('🔗 GitHub Manager ready');
// ========== END GITHUB MANAGER ==========
`;

// Вставляем новый класс после всех require
const requireEnd = newContent.lastIndexOf('require(');
const lastRequireLine = newContent.indexOf('\n', requireEnd);
newContent = newContent.slice(0, lastRequireLine + 1) + newClass + newContent.slice(lastRequireLine + 1);

fs.writeFileSync(file, newContent);
console.log('✅ GitHub Manager полностью пересоздан');
