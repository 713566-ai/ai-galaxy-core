#!/bin/bash
echo "🔧 НАСТРОЙКА DNS ДЛЯ TERMUX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Создаём папку etc если нет
mkdir -p $PREFIX/etc

# 2. Создаём файл resolv.conf с правильными DNS
cat > $PREFIX/etc/resolv.conf << 'DNS'
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 1.1.1.1
DNS

# 3. Защищаем файл от изменений
chmod 444 $PREFIX/etc/resolv.conf

# 4. Проверяем DNS
echo "✅ DNS настроен:"
cat $PREFIX/etc/resolv.conf

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ПРОВЕРКА СВЯЗИ:"
ping -c 2 8.8.8.8 > /dev/null 2>&1 && echo "✅ Интернет есть" || echo "❌ Нет интернета"

echo ""
echo "6. ПРОВЕРКА РАБОТЫ DNS:"
nslookup google.com 2>/dev/null | grep -q "Address" && echo "✅ DNS работает" || echo "⚠️ DNS может не работать"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DNS НАСТРОЕН! ТЕПЕРЬ ЗАПУСТИ ТУННЕЛЬ:"
echo "   ./cloudflared tunnel --url http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
