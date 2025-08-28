// Загрузка переменных окружения
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config();
}
const app = require('./app');
const http = require('http');
const { logger } = require('./config/logger');
const prismaManager = require('./utils/prismaManager');



// Создаем HTTP сервер
const server = http.createServer(app);

// Глобальная переменная для доступа к сервису WebSocket из других модулей
let webSocketService;

// Проверка состояния базы данных и запуск сервера
async function startServer() {
  try {
    await prismaManager.connect();
    logger.info('Database connected successfully');

    
    // Вместо app.set используем глобальную переменную
    global.webSocketService = webSocketService;
    
    const port = process.env.PORT || 4000;
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`WebSocket server initialized`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Экспортируем webSocketService для использования в других модулях
module.exports = {
  webSocketService: () => webSocketService,
  getWebSocketService: () => webSocketService // Альтернативный способ получения сервиса
};

startServer();