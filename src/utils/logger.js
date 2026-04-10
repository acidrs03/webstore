'use strict';

const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, colorize, printf, errors, json } = format;

const isDev = process.env.NODE_ENV !== 'production';

// ── Custom console format for development ────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `${ts} [${level}]: ${message}\n${stack}`
      : `${ts} [${level}]: ${message}`;
  })
);

// ── JSON format for production file logs ─────────────────────────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ── Build transports list ─────────────────────────────────────────────────────
const loggerTransports = [
  new transports.Console({
    format: isDev ? devFormat : prodFormat,
    silent: process.env.NODE_ENV === 'test',
  }),
];

if (!isDev) {
  const logDir = path.resolve(__dirname, '..', '..', 'logs');

  loggerTransports.push(
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: prodFormat,
      maxsize: 5 * 1024 * 1024,   // 5 MB
      maxFiles: 5,
      tailable: true,
    })
  );

  loggerTransports.push(
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: prodFormat,
      maxsize: 10 * 1024 * 1024,  // 10 MB
      maxFiles: 10,
      tailable: true,
    })
  );
}

// ── Create and export logger ──────────────────────────────────────────────────
const logger = createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transports: loggerTransports,
  exitOnError: false,
});

// Add http level (used by morgan stream)
logger.http = (message) => logger.log('http', message);

module.exports = logger;
