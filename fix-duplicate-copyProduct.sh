#!/bin/bash

# Исправляем дублирование copyProduct в productsController.js

echo "🔧 Исправление дублирования copyProduct функции..."

cd backend/src/controllers/company

# Создаем backup
cp productsController.js productsController.js.backup

# Убираем старую версию copyProduct (простую) и оставляем только новую (с валидацией)
sed -i '/^\/\/ 📋 Копирование товара (для "Воздушной бухгалтерии")/,/^};$/d' productsController.js

echo "✅ Дублирование copyProduct исправлено"
echo "📄 Backup создан: productsController.js.backup"

# Проверяем что copyProduct осталась только одна
echo "🔍 Проверка copyProduct функций:"
grep -n "copyProduct" productsController.js | head -5