/**
 * Validation Utilities
 *
 * Provides reusable validation functions to eliminate duplicate
 * validation logic across services.
 *
 * @module utils/validation
 */

import { ValidationError } from './errors.js';

/**
 * Validates ISO date string (YYYY-MM-DD format)
 *
 * Ensures date is well-formed and represents a valid calendar date.
 * Replaces duplicate regex validation in multiple services.
 *
 * @param {string} dateString - Date to validate
 * @param {string} [fieldName='date'] - Field name for error messages
 * @returns {string} Validated date string
 * @throws {ValidationError} If invalid format or invalid date
 *
 * @example
 * const validDate = validateISODate('2025-11-18');  // '2025-11-18'
 * validateISODate('2025-13-01');  // Throws ValidationError
 * validateISODate('11/18/2025');  // Throws ValidationError
 */
export function validateISODate(dateString, fieldName = 'date') {
  if (!dateString || typeof dateString !== 'string') {
    throw new ValidationError(
      `${fieldName} is required and must be a string`,
      fieldName
    );
  }

  // Check format: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new ValidationError(
      `Invalid ${fieldName} format: "${dateString}". Expected YYYY-MM-DD`,
      fieldName
    );
  }

  // Validate it's a real date (not 2025-13-40)
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError(
      `Invalid ${fieldName}: "${dateString}" is not a valid calendar date`,
      fieldName
    );
  }

  // Ensure date string matches parsed date (catches edge cases)
  const isoString = date.toISOString().split('T')[0];
  if (isoString !== dateString) {
    throw new ValidationError(
      `Invalid ${fieldName}: "${dateString}" does not match parsed date "${isoString}"`,
      fieldName
    );
  }

  return dateString;
}

/**
 * Validates scorecard data structure from Vision API
 *
 * Ensures scorecard has all required fields and minimum data quality.
 * Used after Claude Vision extraction.
 *
 * @param {Object} scorecardData - Scorecard object from Vision API
 * @returns {Object} Validated scorecard
 * @throws {ValidationError} If validation fails
 *
 * @example
 * const scorecard = validateScorecardData({
 *   course: 'Zilker Park',
 *   date: '2025-11-18',
 *   players: [...],
 *   holes: [...]
 * });
 */
export function validateScorecardData(scorecardData) {
  if (!scorecardData || typeof scorecardData !== 'object') {
    throw new ValidationError('Scorecard data is required and must be an object', 'scorecard');
  }

  // Check required fields
  const required = ['course', 'date', 'players', 'holes'];
  const missing = required.filter(field => !scorecardData[field]);

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required scorecard fields: ${missing.join(', ')}`,
      'scorecard'
    );
  }

  // Validate minimum players (disc golf standard: 2-4 players)
  if (!Array.isArray(scorecardData.players) || scorecardData.players.length < 4) {
    throw new ValidationError(
      `Scorecard must have at least 4 players, found ${scorecardData.players?.length || 0}`,
      'players'
    );
  }

  // Validate holes data exists
  if (!Array.isArray(scorecardData.holes) || scorecardData.holes.length === 0) {
    throw new ValidationError(
      'Scorecard must have hole data',
      'holes'
    );
  }

  // Validate date format
  validateISODate(scorecardData.date, 'scorecard.date');

  return scorecardData;
}

/**
 * Validates email address format
 *
 * Basic email validation using regex.
 * Does not verify email actually exists, just format.
 *
 * @param {string} email - Email address to validate
 * @param {string} [fieldName='email'] - Field name for error messages
 * @returns {string} Validated email
 * @throws {ValidationError} If invalid format
 *
 * @example
 * validateEmail('user@example.com');  // 'user@example.com'
 * validateEmail('invalid.email');     // Throws ValidationError
 */
export function validateEmail(email, fieldName = 'email') {
  if (!email || typeof email !== 'string') {
    throw new ValidationError(
      `${fieldName} is required and must be a string`,
      fieldName
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      `Invalid ${fieldName} format: "${email}"`,
      fieldName
    );
  }

  return email.trim().toLowerCase();
}

/**
 * Validates required string field
 *
 * Generic validator for non-empty strings.
 *
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {number} [minLength=1] - Minimum string length
 * @param {number} [maxLength=Infinity] - Maximum string length
 * @returns {string} Validated string
 * @throws {ValidationError} If invalid
 *
 * @example
 * validateRequiredString('value', 'fieldName');
 * validateRequiredString('test', 'username', 3, 20);
 */
export function validateRequiredString(value, fieldName, minLength = 1, maxLength = Infinity) {
  if (!value || typeof value !== 'string') {
    throw new ValidationError(
      `${fieldName} is required and must be a string`,
      fieldName
    );
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters, got ${trimmed.length}`,
      fieldName
    );
  }

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters, got ${trimmed.length}`,
      fieldName
    );
  }

  return trimmed;
}

/**
 * Validates number is within range
 *
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error messages
 * @param {number} [min=-Infinity] - Minimum value (inclusive)
 * @param {number} [max=Infinity] - Maximum value (inclusive)
 * @returns {number} Validated number
 * @throws {ValidationError} If invalid or out of range
 *
 * @example
 * validateNumber(5, 'score', 0, 10);   // 5
 * validateNumber(-1, 'score', 0, 10);  // Throws ValidationError
 */
export function validateNumber(value, fieldName, min = -Infinity, max = Infinity) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} must be a valid number`,
      fieldName
    );
  }

  if (value < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min}, got ${value}`,
      fieldName
    );
  }

  if (value > max) {
    throw new ValidationError(
      `${fieldName} must be at most ${max}, got ${value}`,
      fieldName
    );
  }

  return value;
}

export default {
  validateISODate,
  validateScorecardData,
  validateEmail,
  validateRequiredString,
  validateNumber
};
