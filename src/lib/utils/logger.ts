/**
 * Logger utility for consistent logging across the application
 * Replaces console.log with structured logging that respects environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/**
 * Format log message with timestamp and context
 */
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Logger that respects environment settings
 * - In production: only warn and error are logged
 * - In development: all levels are logged
 * - In test: nothing is logged (can be overridden)
 */
export const logger = {
  /**
   * Debug level - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment && !isTest) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage('debug', message, context));
    }
  },

  /**
   * Info level - only in development
   */
  info(message: string, context?: LogContext): void {
    if (isDevelopment && !isTest) {
      // eslint-disable-next-line no-console
      console.info(formatMessage('info', message, context));
    }
  },

  /**
   * Warn level - always logged
   */
  warn(message: string, context?: LogContext): void {
    if (!isTest) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage('warn', message, context));
    }
  },

  /**
   * Error level - always logged
   * In production, this should integrate with error monitoring (Sentry, etc.)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (isTest) return;

    const errorContext = error instanceof Error
      ? { 
          errorMessage: error.message, 
          errorStack: isDevelopment ? error.stack : undefined,
          ...context 
        }
      : { error, ...context };

    // eslint-disable-next-line no-console
    console.error(formatMessage('error', message, errorContext));

    // TODO: In production, send to error monitoring service
    // if (!isDevelopment) {
    //   Sentry.captureException(error);
    // }
  },
};

export default logger;
