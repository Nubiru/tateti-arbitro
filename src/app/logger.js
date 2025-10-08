/**
 * Servicio de Logger Estructurado
 * Logging específico por servicio con formato de una línea limpio
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const getCurrentLogLevel = () => {
  const level =
    LOG_LEVELS[process.env.LOG_LEVEL] !== undefined
      ? LOG_LEVELS[process.env.LOG_LEVEL]
      : LOG_LEVELS.INFO;
  return level;
};

const formatTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', 'T').substring(0, 19);
};

const formatLogMessage = (
  level,
  service,
  layer,
  operation,
  message,
  data = {}
) => {
  const timestamp = formatTimestamp();
  const dataString =
    data && typeof data === 'object' && Object.keys(data).length > 0
      ? ' | ' +
        Object.entries(data)
          .map(([key, value]) => `${key}=${value}`)
          .join(' ')
      : '';

  return `[${timestamp}][${level}][${service}][${layer}][${operation}]: ${message}${dataString}`;
};

const logger = {
  error: (service, layer, operation, message, data) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.ERROR) {
      // eslint-disable-next-line no-console
      console.error(
        formatLogMessage('ERROR', service, layer, operation, message, data)
      );
    }
  },

  warn: (service, layer, operation, message, data) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.WARN) {
      // eslint-disable-next-line no-console
      console.warn(
        formatLogMessage('WARN', service, layer, operation, message, data)
      );
    }
  },

  info: (service, layer, operation, message, data) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.INFO) {
      // eslint-disable-next-line no-console
      console.info(
        formatLogMessage('INFO', service, layer, operation, message, data)
      );
    }
  },

  debug: (service, layer, operation, message, data) => {
    if (getCurrentLogLevel() >= LOG_LEVELS.DEBUG) {
      // eslint-disable-next-line no-console
      console.debug(
        formatLogMessage('DEBUG', service, layer, operation, message, data)
      );
    }
  },
};

export default logger;
