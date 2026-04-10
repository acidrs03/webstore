'use strict';

require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`${process.env.SITE_NAME || 'Handcraft Store'} running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

startServer();
