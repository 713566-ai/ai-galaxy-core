#!/usr/bin/env node
// ============================================================
// 🧹 PORT CLEANER - Очистка занятых портов
// ============================================================

const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

const ports = [3000, 3001, 3003, 3100, 3101, 3102, 3103, 3104, 3105, 4000, 4001, 4002];

async function killProcessOnPort(port) {
    try {
        // Linux/Unix
        const { stdout } = await execPromise(`lsof -ti :${port} 2>/dev/null`);
        if (stdout.trim()) {
            const pids = stdout.trim().split('\n');
            for (const pid of pids) {
                await execPromise(`kill -9 ${pid} 2>/dev/null`);
                console.log(`✅ Порт ${port}: убит процесс ${pid}`);
            }
            return true;
        }
    } catch(e) {}
    
    try {
        // Альтернативный метод
        const { stdout } = await execPromise(`netstat -tlnp 2>/dev/null | grep :${port} | awk '{print $7}' | cut -d'/' -f1`);
        if (stdout.trim()) {
            await execPromise(`kill -9 ${stdout.trim()} 2>/dev/null`);
            console.log(`✅ Порт ${port}: убит процесс ${stdout.trim()}`);
            return true;
        }
    } catch(e) {}
    
    return false;
}

async function cleanAllPorts() {
    console.log("\n🧹 ОЧИСТКА ПОРТОВ...\n");
    
    let cleaned = 0;
    for (const port of ports) {
        if (await killProcessOnPort(port)) {
            cleaned++;
        }
    }
    
    console.log(`\n✅ Очищено портов: ${cleaned}/${ports.length}`);
    
    if (cleaned > 0) {
        console.log("⏳ Ожидание освобождения портов...");
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Запуск
cleanAllPorts();
