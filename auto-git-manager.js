// ============================================
// 🔄 V146 - AUTO-GIT MANAGER
// ============================================
// ✅ Авто-коммиты при изменениях
// ✅ Авто-пуш на GitHub
// ✅ Авто-бэкап версий
// ✅ История изменений
// ============================================

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

class AutoGitManager {
  constructor() {
    this.lastCommitTime = Date.now();
    this.commitCount = 0;
    this.pushCount = 0;
    this.watchedFiles = new Set();
    this.autoPushEnabled = true;
    this.history = [];
    this.isRunning = true;
  }
  
  // Проверка изменений в файлах
  checkChanges() {
    return new Promise((resolve) => {
      exec('git status --porcelain 2>/dev/null', (err, stdout) => {
        if (err) {
          resolve([]);
          return;
        }
        const changed = stdout.trim().split('\n').filter(l => l && l.trim());
        resolve(changed);
      });
    });
  }
  
  // Получение списка изменённых файлов
  getChangedFiles() {
    return new Promise((resolve) => {
      exec('git diff --name-only', (err, stdout) => {
        if (err) {
          resolve([]);
          return;
        }
        const files = stdout.trim().split('\n').filter(l => l);
        resolve(files);
      });
    });
  }
  
  // Авто-коммит
  async autoCommit() {
    const changes = await this.checkChanges();
    
    if (changes.length === 0) return null;
    
    const changedFiles = await this.getChangedFiles();
    const timestamp = new Date().toISOString();
    const version = `V145_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}`;
    const commitMsg = `🤖 [AUTO] V145 Game Civilization - ${changes.length} files changed\n\nFiles: ${changedFiles.slice(0,5).join(', ')}${changedFiles.length > 5 ? ` +${changedFiles.length-5} more` : ''}\nVersion: ${version}`;
    
    return new Promise((resolve) => {
      exec(`git add . && git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
        if (!err) {
          this.commitCount++;
          this.lastCommitTime = Date.now();
          
          // Сохраняем в историю
          this.history.push({
            type: 'commit',
            count: this.commitCount,
            files: changes.length,
            timestamp: Date.now(),
            hash: stdout.match(/\[[a-f0-9]+\]/)?.[0] || 'unknown'
          });
          
          if (this.history.length > 50) this.history.shift();
          
          console.log(`📦 [GIT] Auto-commit #${this.commitCount}: ${changes.length} files changed`);
          console.log(`   📝 ${commitMsg.slice(0, 80)}...`);
          resolve(true);
        } else {
          console.log(`⚠️ [GIT] Commit failed: ${stderr.slice(0, 100)}`);
          resolve(false);
        }
      });
    });
  }
  
  // Авто-пуш
  async autoPush() {
    if (!this.autoPushEnabled) return false;
    
    return new Promise((resolve) => {
      exec('git push origin main 2>/dev/null || git push origin master 2>/dev/null', (err, stdout) => {
        if (!err) {
          this.pushCount++;
          console.log(`📤 [GIT] Auto-push #${this.pushCount} successful`);
          
          this.history.push({
            type: 'push',
            count: this.pushCount,
            timestamp: Date.now()
          });
          
          resolve(true);
        } else {
          console.log(`⚠️ [GIT] Push failed, will retry later`);
          resolve(false);
        }
      });
    });
  }
  
  // Полный цикл (каждую минуту)
  async tick() {
    if (!this.isRunning) return;
    
    const committed = await this.autoCommit();
    if (committed) {
      await this.autoPush();
    }
  }
  
  // Принудительный коммит
  async forceCommit(message) {
    return new Promise((resolve) => {
      exec(`git add . && git commit -m "${message}"`, (err) => {
        if (!err) {
          this.commitCount++;
          console.log(`📦 [GIT] Force commit: ${message}`);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  
  // Принудительный пуш
  async forcePush() {
    return new Promise((resolve) => {
      exec('git push origin main 2>/dev/null || git push origin master 2>/dev/null', (err) => {
        if (!err) {
          this.pushCount++;
          console.log(`📤 [GIT] Force push successful`);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
  
  getStats() {
    return {
      totalCommits: this.commitCount,
      totalPushes: this.pushCount,
      lastCommit: new Date(this.lastCommitTime).toISOString(),
      autoPushEnabled: this.autoPushEnabled,
      isRunning: this.isRunning,
      recentHistory: this.history.slice(-10)
    };
  }
  
  stop() {
    this.isRunning = false;
    console.log(`🛑 [GIT] Auto-Git Manager stopped`);
  }
  
  start() {
    this.isRunning = true;
    console.log(`▶️ [GIT] Auto-Git Manager started`);
  }
}

module.exports = new AutoGitManager();
