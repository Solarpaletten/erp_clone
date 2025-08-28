#!/bin/bash
# =====================================================
# 🚀 ИСПРАВЛЕННЫЙ СУПЕР СКРИПТ ДЛЯ КОСМИЧЕСКОГО КОРАБЛЯ
# =====================================================

echo "🚀 ЗАПУСКАЕМ КОСМИЧЕСКИЙ КОРАБЛЬ!"
echo "⚡ Backend + Frontend параллельно..."

# Сохраняем текущую директорию
CURRENT_DIR=$(pwd)

# Функция для запуска backend
start_backend() {
    echo "🔧 Starting Backend..."
    cd "${CURRENT_DIR}/backend"
    npm run build
    npm run dev
}

# Функция для запуска frontend  
start_frontend() {
    echo "🎨 Starting Frontend..."
    cd "${CURRENT_DIR}/frontend"
    npm run build
    npm run dev
}

# Запускаем параллельно
start_backend &
BACKEND_PID=$!

start_frontend &
FRONTEND_PID=$!

echo "🎯 Backend PID: $BACKEND_PID"
echo "🎯 Frontend PID: $FRONTEND_PID"

# Ожидаем завершения процессов
wait

echo "🎊 Космический корабль готов к полёту!"