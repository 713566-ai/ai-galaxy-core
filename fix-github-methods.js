const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Проверяем, есть ли метод createRepo в классе
if (content.includes('async createRepo')) {
  console.log('✅ Методы уже есть');
  process.exit(0);
}

// Находим класс GitHubManager и добавляем недостающие методы
const classStart = content.indexOf('class GitHubManager');
const classEnd = content.indexOf('}', content.indexOf('class GitHubManager')) + 1;

if (classStart === -1) {
  console.log('❌ Класс GitHubManager не найден');
  process.exit(1);
}

const missingMethods = `

  async createRepo(name, description) {
    const response = await this.octokit.repos.createForAuthenticatedUser({
      name: name,
      description: description || 'AI Galaxy Universe',
      private: false,
      auto_init: true
    });
    console.log('📦 Репозиторий создан: ' + response.data.html_url);
    return response.data;
  }

  async forkToNewUniverse(universeId) {
    const newRepoName = 'ai_core_' + universeId;
    const repo = await this.createRepo(newRepoName, 'Forked AI Galaxy Core');
    
    const tempDir = './temp_fork_' + universeId;
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const { execSync } = require('child_process');
    try {
      execSync(\`cp -r ./* \${tempDir}/\`, { stdio: 'ignore' });
    } catch(e) {}
    
    await this.git.cwd(tempDir);
    await this.git.init();
    await this.git.add('.');
    await this.git.commit('Fork from parent');
    await this.git.addRemote('origin', 'https://' + this.username + ':' + this.octokit.auth + '@github.com/' + this.username + '/' + newRepoName + '.git');
    await this.git.push('origin', 'main');
    
    return repo.html_url;
  }
`;

// Вставляем методы перед последней скобкой класса
const insertPos = content.lastIndexOf('}', classEnd - 1);
content = content.slice(0, insertPos) + missingMethods + content.slice(insertPos);

fs.writeFileSync(file, content);
console.log('✅ Методы createRepo и forkToNewUniverse добавлены');
