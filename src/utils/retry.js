/**
 * Retry Utility with Exponential Backoff
 *
 * Provides retry logic for unreliable operations like external API calls.
 * Implements exponential backoff to avoid overwhelming services.
 *
 * @module utils/retry
 */

import { createLogger } from './logger.js';

const logger = createLogger('RetryUtil');

/**
 * Executes async function with exponential backoff retry
 *
 * Essential for unreliable external APIs (Gmail, Anthropic, etc.).
 * Automatically retries on transient failures with increasing delays.
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry configuration
 * @param {number} [options.maxRetries=3] - Maximum retry attempts
 * @param {number} [options.initialDelay=1000] - Initial delay in ms
 * @param {number} [options.maxDelay=10000] - Maximum delay in ms (caps exponential growth)
 * @param {Function} [options.shouldRetry] - Function to determine if error is retryable
 * @param {string} [options.context='operation'] - Context for logging
 * @returns {Promise<any>} Result from successful execution
 * @throws {Error} Last error if all retries exhausted
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => anthropic.messages.create({ model: 'claude-3', ... }),
 *   {
 *     maxRetries: 3,
 *     shouldRetry: isRetryableError,
 *     context: 'Claude Vision API'
 *   }
 * );
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
    context = 'operation'
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();

      if (attempt > 0) {
        logger.info('Retry succeeded', { context, attempt });
      }

      return result;

    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable (e.g., validation errors)
      if (!shouldRetry(error)) {
        logger.warn('Error not retryable', {
          context,
          error: error.message,
          errorType: error.name
        });
        throw error;
      }

      // Last attempt failed
      if (attempt === maxRetries) {
        logger.error('All retry attempts exhausted', {
          context,
          attempts: attempt + 1,
          error: error.message
        });
        break;
      }

      // Calculate exponential backoff: 1s, 2s, 4s, 8s (capped at maxDelay)
      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);

      logger.warn('Retry attempt failed, backing off', {
        context,
        attempt: attempt + 1,
        maxRetries,
        nextRetryIn: `${delay}ms`,
        error: error.message
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Determines if an error is retryable
 *
 * Returns true for transient failures (network issues, rate limits).
 * Returns false for permanent failures (validation errors, auth failures).
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if error should be retried
 *
 * @example
 * if (isRetryableError(error)) {
 *   // Retry the operation
 * } else {
 *   // Fail immediately
 * }
 */
export function isRetryableError(error) {
  // Network errors (Node.js error codes)
  const networkErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED', 'EHOSTUNREACH'];
  if (error.code && networkErrorCodes.includes(error.code)) {
    return true;
  }

  // HTTP status codes that should be retried
  // 408: Request Timeout
  // 429: Too Many Requests (rate limit)
  // 500: Internal Server Error
  // 502: Bad Gateway
  // 503: Service Unavailable
  // 504: Gateway Timeout
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (error.statusCode && retryableStatusCodes.includes(error.statusCode)) {
    return true;
  }

  if (error.status && retryableStatusCodes.includes(error.status)) {
    return true;
  }

  // Anthropic API specific errors
  if (error.message?.toLowerCase().includes('rate limit')) {
    return true;
  }

  if (error.message?.toLowerCase().includes('overloaded')) {
    return true;
  }

  // Gmail API specific errors
  if (error.message?.toLowerCase().includes('quota')) {
    return true;
  }

  if (error.message?.toLowerCase().includes('ratelimitexceeded')) {
    return true;
  }

  // Generic timeout indicators
  if (error.message?.toLowerCase().includes('timeout')) {
    return true;
  }

  // Generic connection indicators
  if (error.message?.toLowerCase().includes('connection')) {
    return true;
  }

  // Default: don't retry
  return false;
}

/**
 * Checks if error is a permanent failure (should NOT retry)
 *
 * @param {Error} error - Error to check
 * @returns {boolean} True if error is permanent
 */
export function isPermanentError(error) {
  // HTTP 4xx errors (except 408 and 429 which are retryable)
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return error.statusCode !== 408 && error.statusCode !== 429;
  }

  if (error.status >= 400 && error.status < 500) {
    return error.status !== 408 && error.status !== 429;
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return true;
  }

  // Authentication/authorization errors
  if (error.message?.toLowerCase().includes('unauthorized')) {
    return true;
  }

  if (error.message?.toLowerCase().includes('forbidden')) {
    return true;
  }

  if (error.message?.toLowerCase().includes('invalid credentials')) {
    return true;
  }

  return false;
}

export default {
  retryWithBackoff,
  isRetryableError,
  isPermanentError
};
