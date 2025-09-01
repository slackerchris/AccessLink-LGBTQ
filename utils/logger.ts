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

  /**
   * Overrides the global console methods to automatically capture logs.
   */
  overrideConsole: () => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
    };

    const intercept = (level: LogLevel, originalMethod: (...args: any[]) => void) => {
      return (...args: any[]) => {
        try {
          const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
          log(level, message, { source: 'console' });
        } catch (e) {
          // Fallback to original console if logging fails
          originalConsole.error('Failed to intercept console log:', e);
        }
        originalMethod.apply(console, args);
      };
    };

    console.log = intercept('INFO', originalConsole.log);
    console.warn = intercept('WARN', originalConsole.warn);
    console.error = intercept('ERROR', originalConsole.error);
    console.info = intercept('INFO', originalConsole.info);
    console.debug = intercept('INFO', originalConsole.debug); // Map debug to info
  },
};
