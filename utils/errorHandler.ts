import { logger } from './logger';
import { getErrorMessage } from './errorMessages';

/**
 * A standardized error object to be used throughout the application.
 */
export interface AppError {
  /**
   * The technical error code (e.g., 'auth/user-not-found').
   */
  code: string;
  /**
   * The user-friendly message for display in the UI.
   */
  message: string;
  /**
   * The original error object, for logging and debugging.
   */
  originalError?: any;
}

/**
 * Centralized error handler.
 *
 * @param error - The error object caught in a catch block.
 * @param context - Optional context about where the error occurred (e.g., { function: 'signIn', screen: 'LoginScreen' }).
 * @returns A standardized AppError object.
 */
export const handleError = (error: any, context: Record<string, any> = {}): AppError => {
  // Default values
  let errorCode = 'unknown_error';
  let errorMessage = getErrorMessage(errorCode);

  // Firebase errors often have a 'code' property
  if (error && typeof error.code === 'string') {
    errorCode = error.code;
    errorMessage = getErrorMessage(errorCode);
  } else if (error && typeof error.message === 'string') {
    // For generic errors, we can use the message if available, but log it for review.
    // We don't want to show potentially technical messages to the user.
    logger.warn('Generic error message encountered', { originalMessage: error.message, context });
  }

  const appError: AppError = {
    code: errorCode,
    message: errorMessage,
    originalError: error,
  };

  // Log the detailed error for debugging
  logger.error(`Error handled in ${context.source || 'unknown source'}`, {
    code: appError.code,
    userMessage: appError.message,
    originalError: error?.message || 'No original error message',
    stack: error?.stack,
    ...context,
  });

  return appError;
};
