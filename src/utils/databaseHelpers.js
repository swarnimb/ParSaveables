/**
 * Database Query Helpers
 *
 * Provides reusable query wrappers with standardized error handling.
 * Eliminates duplicate error handling code across all database operations.
 *
 * @module utils/databaseHelpers
 */

import { createLogger } from './logger.js';
import { DatabaseError } from './errors.js';

const logger = createLogger('DatabaseHelpers');

/**
 * Executes a Supabase query with standardized error handling
 *
 * Wraps Supabase queries to provide consistent error handling and logging.
 * Eliminates need for repetitive if(error) checks across services.
 *
 * @param {Function} queryFn - Async function that returns Supabase query result {data, error}
 * @param {string} errorContext - Description for error logging (e.g., 'Failed to fetch players')
 * @returns {Promise<any>} Query data
 * @throws {DatabaseError} If query fails
 *
 * @example
 * const players = await executeQuery(
 *   () => supabase.from('players').select('*'),
 *   'Failed to fetch players'
 * );
 */
export async function executeQuery(queryFn, errorContext) {
  const { data, error } = await queryFn();

  if (error) {
    logger.error(errorContext, {
      error: error.message,
      code: error.code,
      details: error.details
    });
    throw new DatabaseError(`${errorContext}: ${error.message}`, {
      originalError: error
    });
  }

  return data;
}

/**
 * Executes query and ensures exactly one result
 *
 * Use when query must return a single record.
 * Throws if no results or multiple results found.
 *
 * @param {Function} queryFn - Async function that returns Supabase query
 * @param {string} errorContext - Description for error logging
 * @returns {Promise<Object>} Single query result
 * @throws {DatabaseError} If no results, multiple results, or query fails
 *
 * @example
 * const event = await executeQuerySingle(
 *   () => supabase.from('events').select('*').eq('id', 1),
 *   'Failed to fetch event'
 * );
 */
export async function executeQuerySingle(queryFn, errorContext) {
  const data = await executeQuery(queryFn, errorContext);

  if (!data || data.length === 0) {
    logger.warn(`${errorContext}: No results found`);
    throw new DatabaseError(`${errorContext}: No results found`);
  }

  if (data.length > 1) {
    logger.warn(`${errorContext}: Multiple results found, using first`, {
      count: data.length
    });
  }

  return data[0];
}

/**
 * Executes query with optional result
 *
 * Use when query may legitimately return no results.
 * Returns null if not found instead of throwing error.
 *
 * @param {Function} queryFn - Async function that returns Supabase query
 * @param {string} errorContext - Description for error logging
 * @returns {Promise<Object|null>} Single query result or null if not found
 * @throws {DatabaseError} If query fails (but NOT if no results)
 *
 * @example
 * const player = await executeQueryOptional(
 *   () => supabase.from('players').select('*').eq('name', 'John'),
 *   'Failed to search for player'
 * );
 * // player is null if not found, no error thrown
 */
export async function executeQueryOptional(queryFn, errorContext) {
  const data = await executeQuery(queryFn, errorContext);
  return data && data.length > 0 ? data[0] : null;
}

export default {
  executeQuery,
  executeQuerySingle,
  executeQueryOptional
};
