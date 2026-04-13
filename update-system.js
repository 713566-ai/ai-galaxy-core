#!/usr/bin/env node
// ============================================================
// 📦 UPDATE SYSTEM - Авто-обновление всех компонентов
// ============================================================

const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");

class SystemUpdater {
    constructor() {
        this.backupDir = path.join(process.cwd(), 'backups');
        this.components = [
            'swarm-v127.js',
            'simple-core.js',
            'revive.js',
            'system-patch.js',
            'port-cleaner.js'
        ];
    }
    
    createBackup() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir);
        }
        
        const timestamp = Date.now();
        const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
        fs.mkdirSync(backupPath);
        
        for (const comp of this.components) {
            if (fs.existsSync(comp)) {
                fs.copyFileSync(comp, path.join(backupPath, comp));
            }
        }
        
        console.log(`💾 Бэкап создан: ${backupPath}`);
        return backupPath;
    }
    
    async update() {
        console.log("\n📦 ОБНОВЛЕНИЕ СИСТЕМЫ...\n");
        
        // Создаём бэкап
        const backupPath = this.createBackup();
        
        // Перезапускаем систему
        console.log("🔄 Перезапуск системы...");
        exec('node system-patch.js --restart', (err) => {
            if (err) {
                console.log("❌ Ошибка при перезапуске");
            } else {
                console.log("✅ Система обновлена и перезапущена!");
            }
        });
    }
}

const updater = new SystemUpdater();
updater.update();
