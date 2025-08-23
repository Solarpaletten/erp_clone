const app = require('./app');
const { logger } = require('./config/logger');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Solar API started on http://localhost:${PORT}`);
});
