/**
 * Custom Error Classes
 *
 * Provides typed errors for better error handling and categorization.
 * Each error type has a specific HTTP status code and error code.
 *
 * @module utils/errors
 */

/**
 * Base application error class
 * All custom errors extend this class
 */
export class AppError extends Error {
  /**
   * Create an application error
   *
   * @param {string} message - Error message
   * @param {string} code - Error code for programmatic handling
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database operation errors
 * Used when Supabase queries fail
 *
 * @example
 * throw new DatabaseError('Failed to fetch players', { table: 'registered_players' });
 */
export class DatabaseError extends AppError {
  /**
   * @param {string} message - Error description
   * @param {Object} details - Additional context (table, query, etc.)
   */
  constructor(message, details = {}) {
    super(message, 'DATABASE_ERROR', 500);
    this.details = details;
  }
}

/**
 * Validation errors for user input
 * Used when request data is invalid or missing
 *
 * @example
 * throw new ValidationError('Invalid date format: expected YYYY-MM-DD', 'date');
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Error description
   * @param {string|null} field - Field name that failed validation
   */
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
}

/**
 * External API errors (Gmail, Anthropic, etc.)
 * Used when third-party service calls fail
 *
 * @example
 * throw new ExternalAPIError('Gmail', 'Failed to send email', originalError);
 */
export class ExternalAPIError extends AppError {
  /**
   * @param {string} service - Service name (Gmail, Anthropic, etc.)
   * @param {string} message - Error description
   * @param {Error|null} originalError - Original error from API
   */
  constructor(service, message, originalError = null) {
    super(`${service} API error: ${message}`, 'EXTERNAL_API_ERROR', 502);
    this.service = service;
    this.originalError = originalError;
  }
}

/**
 * Configuration errors
 * Used when required config is missing or invalid
 *
 * @example
 * throw new ConfigurationError('Missing ANTHROPIC_API_KEY in environment');
 */
export class ConfigurationError extends AppError {
  /**
   * @param {string} message - Error description
   */
  constructor(message) {
    super(message, 'CONFIGURATION_ERROR', 500);
  }
}

/**
 * Business logic errors
 * Used when business rules are violated (e.g., no event found)
 *
 * @example
 * throw new BusinessLogicError('No event found for date 2025-11-18');
 */
export class BusinessLogicError extends AppError {
  /**
   * @param {string} message - Error description
   * @param {string} code - Specific business logic error code
   */
  constructor(message, code = 'BUSINESS_LOGIC_ERROR') {
    super(message, code, 422);
  }
}

export default {
  AppError,
  DatabaseError,
  ValidationError,
  ExternalAPIError,
  ConfigurationError,
  BusinessLogicError
};
