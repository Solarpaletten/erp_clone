# ====================================
# Dockerfile - Optimized SOLAR API  
# ====================================

# Используем минимальный Alpine образ
FROM node:18-alpine

# Метаданные
LABEL maintainer="SOLAR Team"
LABEL description="Optimized SOLAR API Backend"

# Устанавливаем только необходимые зависимости
RUN apk update && apk add --no-cache \
    python3 \
    make \
    g++ && \
    rm -rf /var/cache/apk/*

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S solar -u 1001

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы для установки зависимостей
COPY package*.json ./
COPY prisma ./prisma

# Устанавливаем зависимости и генерируем Prisma Client
RUN npm ci --omit=dev --no-optional && \
    npx prisma generate --schema=prisma/schema.prisma && \
    npm cache clean --force && \
    rm -rf /tmp/* && \
    rm -rf ~/.npm

# Копируем исходный код
COPY src ./src

# Изменяем владельца файлов
RUN chown -R solar:nodejs /app

# Переключаемся на непривилегированного пользователя
USER solar

# Открываем порт
EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Запускаем приложение
CMD ["node", "src/index.js"]
