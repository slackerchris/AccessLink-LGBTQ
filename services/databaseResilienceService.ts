/**
 * Database Resilience Service
 * Provides retry mechanisms and error handling for database operations
 */

import { FirebaseError } from 'firebase/app';
import { DbResult } from '../types/firestore';

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export class DatabaseResilienceService {
  private defaultOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 500, // 500ms
    maxDelay: 5000  // 5 seconds
  };

  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<DbResult<T>> {
    const retryOptions = { ...this.defaultOptions, ...options };
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < retryOptions.maxRetries; attempt++) {
      try {
        const result = await operation();
        return { success: true, data: result };
      } catch (error) {
        lastError = this.normalizeError(error);
        
        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          return { 
            success: false, 
            error: lastError, 
            code: this.getErrorCode(lastError)
          };
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryOptions.baseDelay * Math.pow(2, attempt),
          retryOptions.maxDelay
        );
        
        console.warn(
          `Database operation failed (attempt ${attempt + 1}/${retryOptions.maxRetries}). ` +
          `Retrying in ${delay}ms. Error: ${lastError.message}`
        );
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we get here, all retries failed
    return { 
      success: false, 
      error: lastError, 
      code: this.getErrorCode(lastError)
    };
  }
  
  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Check specific Firebase error codes
    if (error instanceof FirebaseError) {
      const retryableCodes = [
        'unavailable',
        'resource-exhausted',
        'deadline-exceeded',
        'cancelled',
        'aborted',
        'internal'
      ];
      
      return retryableCodes.includes(error.code.split('/')[0]);
    }
    
    // Check for network related errors
    if (error instanceof TypeError && error.message.includes('network')) {
      return true;
    }
    
    // Don't retry by default
    return false;
  }
  
  /**
   * Normalize error object
   */
  private normalizeError(error: any): Error {
    if (error instanceof Error) {
      return error;
    }
    
    return new Error(
      typeof error === 'string' ? error : 'Unknown database error'
    );
  }
  
  /**
   * Extract error code from error object
   */
  private getErrorCode(error?: Error): string | undefined {
    if (!error) return undefined;
    
    if (error instanceof FirebaseError) {
      return error.code;
    }
    
    return 'unknown';
  }
  
  /**
   * Handle specific error types
   */
  handleError(error: any): DbResult {
    const normalizedError = this.normalizeError(error);
    
    // Handle Firebase specific errors
    if (error instanceof FirebaseError) {
      // Handle permission errors
      if (error.code.includes('permission-denied')) {
        return {
          success: false,
          error: normalizedError,
          code: 'permission-denied'
        };
      }
      
      // Handle not-found errors
      if (error.code.includes('not-found')) {
        return {
          success: false,
          error: normalizedError,
          code: 'not-found'
        };
      }
      
      // Handle already-exists errors
      if (error.code.includes('already-exists')) {
        return {
          success: false,
          error: normalizedError,
          code: 'already-exists'
        };
      }
    }
    
    // Default error response
    return {
      success: false,
      error: normalizedError,
      code: this.getErrorCode(normalizedError)
    };
  }
}

// Export singleton instance
export const databaseResilience = new DatabaseResilienceService();
export default databaseResilience;
