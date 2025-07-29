/**
 * Structured Logger for consistent logging across the application.
 * Only logs in development mode to avoid leaking information in production.
 */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Base log function.
 * @param level - The level of the log (INFO, WARN, ERROR).
 * @param message - The main log message.
 * @param context - Optional additional data to log.
 */
const log = (level: LogLevel, message: string, context: Record<string, any> = {}) => {
  // Only log in development environment
  if (__DEV__) {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
    }, null, 2));
  }
  // In a real production app, you might want to send this to a logging service
  // like Sentry, Datadog, etc. here.
};

export const logger = {
  info: (message: string, context?: Record<string, any>) => log('INFO', message, context),
  warn: (message: string, context?: Record<string, any>) => log('WARN', message, context),
  error: (message: string, context?: Record<string, any>) => log('ERROR', message, context),
};
