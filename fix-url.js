const fs = require('fs');
const file = './core-v110.js';

let content = fs.readFileSync(file, 'utf8');

// Находим строку с addRemote и исправляем
const oldLine = "await this.git.addRemote('origin', 'https://' + this.username + ':' + this.octokit.auth + '@github.com/' + this.username + '/' + repoName + '.git');";
const newLine = "const encodedToken = encodeURIComponent(this.octokit.auth);\n    await this.git.addRemote('origin', 'https://' + this.username + ':' + encodedToken + '@github.com/' + this.username + '/' + repoName + '.git');";

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync(file, content);
  console.log('✅ URL фикс применён');
} else {
  console.log('⚠️ Строка не найдена, пробуем другой способ...');
  content = content.replace(/this\.octokit\.auth/g, "encodeURIComponent(this.octokit.auth)");
  fs.writeFileSync(file, content);
  console.log('✅ Добавлено encodeURIComponent');
}
