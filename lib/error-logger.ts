/**
 * Error Logger Utility
 * 
 * Centralized error logging and monitoring for the Setu application.
 * Provides structured error logging with context and severity levels.
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  TRANSLATION = 'translation',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  farmerId?: string;
  catalogId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
}

/**
 * Log an error with context and severity
 * 
 * @param severity - Error severity level
 * @param category - Error category
 * @param message - Human-readable error message
 * @param error - Original error object (optional)
 * @param context - Additional context (optional)
 */
export function logError(
  severity: ErrorSeverity,
  category: ErrorCategory,
  message: string,
  error?: Error,
  context?: ErrorContext
): void {
  const errorLog: ErrorLog = {
    timestamp: new Date(),
    severity,
    category,
    message,
    error,
    context,
    stack: error?.stack
  };

  // Console logging with appropriate level
  const consoleMethod = severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
    ? console.error
    : severity === ErrorSeverity.MEDIUM
    ? console.warn
    : console.log;

  consoleMethod('[ERROR]', {
    severity,
    category,
    message,
    context,
    error: error?.message,
    stack: error?.stack
  });

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoringService(errorLog);
  }
}

/**
 * Log a translation error
 */
export function logTranslationError(
  message: string,
  error?: Error,
  context?: ErrorContext
): void {
  logError(ErrorSeverity.MEDIUM, ErrorCategory.TRANSLATION, message, error, context);
}

/**
 * Log a database error
 */
export function logDatabaseError(
  message: string,
  error?: Error,
  context?: ErrorContext
): void {
  logError(ErrorSeverity.HIGH, ErrorCategory.DATABASE, message, error, context);
}

/**
 * Log a network error
 */
export function logNetworkError(
  message: string,
  error?: Error,
  context?: ErrorContext
): void {
  logError(ErrorSeverity.MEDIUM, ErrorCategory.NETWORK, message, error, context);
}

/**
 * Log a validation error
 */
export function logValidationError(
  message: string,
  error?: Error,
  context?: ErrorContext
): void {
  logError(ErrorSeverity.LOW, ErrorCategory.VALIDATION, message, error, context);
}

/**
 * Log a critical error
 */
export function logCriticalError(
  message: string,
  error?: Error,
  context?: ErrorContext
): void {
  logError(ErrorSeverity.CRITICAL, ErrorCategory.UNKNOWN, message, error, context);
}

/**
 * Send error to monitoring service (placeholder)
 * 
 * In production, integrate with services like:
 * - Sentry
 * - LogRocket
 * - Datadog
 * - New Relic
 * - CloudWatch
 */
function sendToMonitoringService(errorLog: ErrorLog): void {
  // TODO: Integrate with monitoring service
  // Example: Sentry.captureException(errorLog.error, { extra: errorLog.context });
  
  // For now, just log to console in production
  if (process.env.NODE_ENV === 'production') {
    console.error('[MONITORING]', JSON.stringify(errorLog, null, 2));
  }
}

/**
 * Create a retry wrapper with error logging
 * 
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts
 * @param category - Error category for logging
 * @param context - Error context
 * @returns Promise with result or throws error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  context?: ErrorContext
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      logError(
        attempt === maxAttempts ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
        category,
        `Operation failed (attempt ${attempt}/${maxAttempts})`,
        lastError,
        { ...context, attempt }
      );

      if (attempt < maxAttempts) {
        // Exponential backoff
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError;
}

/**
 * Error boundary helper for React components
 * 
 * @param error - Error object
 * @param errorInfo - React error info
 * @param component - Component name
 */
export function logReactError(
  error: Error,
  errorInfo: { componentStack: string },
  component: string
): void {
  logError(
    ErrorSeverity.HIGH,
    ErrorCategory.UNKNOWN,
    `React component error in ${component}`,
    error,
    {
      component,
      metadata: {
        componentStack: errorInfo.componentStack
      }
    }
  );
}

/**
 * Performance monitoring helper
 * 
 * @param operation - Operation name
 * @param duration - Duration in milliseconds
 * @param context - Additional context
 */
export function logPerformance(
  operation: string,
  duration: number,
  context?: ErrorContext
): void {
  if (duration > 5000) {
    // Log slow operations
    logError(
      ErrorSeverity.LOW,
      ErrorCategory.UNKNOWN,
      `Slow operation detected: ${operation} took ${duration}ms`,
      undefined,
      { ...context, metadata: { duration, operation } }
    );
  }
}

/**
 * Measure and log operation performance
 * 
 * @param operation - Operation name
 * @param fn - Function to measure
 * @param context - Additional context
 * @returns Promise with result
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    logPerformance(operation, duration, context);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(
      ErrorSeverity.MEDIUM,
      ErrorCategory.UNKNOWN,
      `Operation failed: ${operation} (${duration}ms)`,
      error instanceof Error ? error : new Error(String(error)),
      { ...context, metadata: { duration, operation } }
    );
    throw error;
  }
}
