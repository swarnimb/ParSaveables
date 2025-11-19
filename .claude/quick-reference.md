# Quick Reference - Copy-Paste Templates

Quick templates for common patterns. Just copy and adapt.

---

## New Service File Template

```javascript
/**
 * [Service Name] Service
 * [Brief description of what this service does]
 *
 * @module services/[serviceName]
 */

import { createLogger } from '../utils/logger.js';
import { executeQuery } from '../utils/databaseHelpers.js';
import { ValidationError } from '../utils/errors.js';
import { config } from '../config/index.js';

const logger = createLogger('[ServiceName]');

/**
 * [Function description]
 *
 * @param {Type} paramName - Parameter description
 * @returns {Promise<Type>} Return description
 * @throws {ValidationError} When validation fails
 */
export async function functionName(paramName) {
  logger.info('Function started', { paramName });

  // Validation
  if (!paramName) {
    throw new ValidationError('Parameter is required', 'paramName');
  }

  try {
    // Implementation
    const result = await doSomething(paramName);

    logger.info('Function completed', { resultCount: result.length });
    return result;

  } catch (error) {
    logger.error('Function failed', { error: error.message, paramName });
    throw error;
  }
}

export default {
  functionName
};
```

---

## Database Query Template

```javascript
import { executeQuery, executeQuerySingle, executeQueryOptional } from '../utils/databaseHelpers.js';

// Multiple results
export async function getMany() {
  return await executeQuery(
    () => supabase
      .from('table_name')
      .select('*')
      .eq('active', true)
      .limit(100),
    'Failed to fetch records'
  );
}

// Single required result
export async function getOne(id) {
  return await executeQuerySingle(
    () => supabase
      .from('table_name')
      .select('*')
      .eq('id', id),
    'Failed to fetch record'
  );
}

// Optional result (may not exist)
export async function findOptional(name) {
  return await executeQueryOptional(
    () => supabase
      .from('table_name')
      .select('*')
      .ilike('name', name),
    'Failed to search for record'
  );
}
```

---

## External API Call Template (with retry)

```javascript
import { retryWithBackoff, isRetryableError } from '../utils/retry.js';
import { ExternalAPIError } from '../utils/errors.js';

export async function callExternalAPI(params) {
  logger.info('Calling external API', { params });

  try {
    const response = await retryWithBackoff(
      () => apiClient.request({
        method: 'POST',
        endpoint: '/some/endpoint',
        data: params
      }),
      {
        maxRetries: 3,
        initialDelay: 2000,
        shouldRetry: isRetryableError,
        context: 'External API Name'
      }
    );

    logger.info('API call succeeded', { responseSize: response.length });
    return response;

  } catch (error) {
    logger.error('API call failed', { error: error.message });
    throw new ExternalAPIError('ServiceName', 'API call failed', error);
  }
}
```

---

## Test File Template

```javascript
/**
 * Tests for [ServiceName]
 *
 * @requires Valid .env credentials
 * Run: npm test src/tests/[serviceName].test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { functionToTest } from '../services/serviceName.js';
import { mockData } from './fixtures/testData.js';

console.log('\n🧪 Running [ServiceName] tests...\n');

test('should handle valid input correctly', async () => {
  // Arrange
  const input = mockData.validInput;

  // Act
  const result = await functionToTest(input);

  // Assert
  assert.ok(result);
  assert.strictEqual(result.status, 'success');

  console.log('✓ Valid input test passed');
});

test('should throw ValidationError for invalid input', async () => {
  await assert.rejects(
    () => functionToTest(null),
    {
      name: 'ValidationError',
      message: /required/i
    }
  );

  console.log('✓ Invalid input test passed');
});

console.log('✅ All tests completed!\n');
```

---

## Custom Error Class Template

```javascript
// Add to src/utils/errors.js

/**
 * [Error type description]
 */
export class CustomError extends AppError {
  constructor(message, details = {}) {
    super(message, 'CUSTOM_ERROR_CODE', 400);  // HTTP status code
    this.details = details;
  }
}
```

---

## Validation Function Template

```javascript
// Add to src/utils/validation.js

/**
 * Validates [what it validates]
 *
 * @param {Type} input - Input to validate
 * @returns {Type} Validated input
 * @throws {ValidationError} If validation fails
 */
export function validateSomething(input) {
  if (!input) {
    throw new ValidationError('[Field] is required', 'fieldName');
  }

  if (!/regex/.test(input)) {
    throw new ValidationError('Invalid format', 'fieldName');
  }

  return input;
}
```

---

## Cached Function Template

```javascript
// At module level
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes

export async function getCachedData(key) {
  // Check cache
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    logger.debug('Cache hit', { key });
    return cached.data;
  }

  // Cache miss
  logger.debug('Cache miss, fetching from source', { key });
  const data = await fetchFromSource(key);

  // Store in cache
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}

export function clearCache(key = null) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
```

---

## Constants Block Template

```javascript
// At top of file, after imports

// Configuration constants
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const CACHE_TTL_MS = 5 * 60 * 1000;

// Validation constants
const MIN_PLAYERS_REQUIRED = 4;
const EXACT_MATCH_THRESHOLD = 0.95;
const FUZZY_MATCH_THRESHOLD = 0.75;

// Business logic constants
const POINTS_FOR_FIRST_PLACE = 100;
const BONUS_FOR_ACE = 10;
const NO_BIRDIE_INDICATOR = 999;
```

---

## JSDoc Template (Complex Function)

```javascript
/**
 * [One-line description]
 *
 * [Detailed explanation of what this does, including:]
 * - Important business rules
 * - Edge cases handled
 * - Assumptions made
 *
 * @param {Object} complexParam - Description
 * @param {string} complexParam.field1 - Field description
 * @param {number} complexParam.field2 - Field description
 * @param {Array<Object>} arrayParam - Array description
 * @param {number} [optionalParam=default] - Optional param with default
 * @returns {Promise<Object>} Return object structure
 * @returns {string} returns.field1 - Return field description
 * @returns {number} returns.field2 - Return field description
 * @throws {ValidationError} When input is invalid
 * @throws {DatabaseError} When database operation fails
 *
 * @example
 * const result = await functionName(
 *   { field1: 'value', field2: 123 },
 *   [{ item: 'data' }]
 * );
 */
```

---

## Error Handling in API Endpoints

```javascript
export async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Validate input
    if (!req.body.field) {
      throw new ValidationError('Field is required', 'field');
    }

    // Process
    const result = await processData(req.body);

    // Success response
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    // Handle different error types
    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.code,
        field: error.field
      });
    }

    if (error instanceof ExternalAPIError) {
      logger.error('External API failure', {
        service: error.service,
        message: error.message
      });
      return res.status(error.statusCode).json({
        error: 'External service unavailable',
        code: error.code
      });
    }

    // Generic error (don't leak internals)
    logger.error('Unexpected error', {
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
```

---

## Commit Message Template

```
<type>(<scope>): <short description>

<detailed explanation of changes>
- What was changed
- Why it was changed
- Impact of the change

🤖 Generated with Claude Code
```

**Types:** feat, fix, refactor, perf, test, docs, chore

---

## Common Patterns Cheat Sheet

| Need                          | Use This                                      |
|-------------------------------|-----------------------------------------------|
| Database query                | `executeQuery()` from databaseHelpers         |
| External API call             | Wrap in `retryWithBackoff()`                  |
| Input validation              | Functions from `utils/validation.js`          |
| Throw error                   | Custom error classes from `utils/errors.js`   |
| Log something                 | `logger.info/warn/error/debug()`              |
| Access config                 | `config.anthropic.apiKey` (nested!)           |
| Cache data                    | Map with TTL pattern                          |
| Extract constants             | Top of file, SCREAMING_SNAKE_CASE            |
| Reusable test data            | `tests/fixtures/testData.js`                  |
| Mock external service         | `tests/helpers/mocks.js`                      |

---

## File Size Guidelines

- Utility function: 5-15 lines
- Service function: 20-50 lines
- Service file: 100-300 lines max
- API endpoint: 50-150 lines
- Test file: 100-300 lines

**If file exceeds limit → split it**

---

## Code Smells to Avoid

❌ Copy-pasted code
❌ Magic numbers (0.95, 999, etc.)
❌ console.log
❌ Hardcoded strings/values
❌ Functions over 50 lines
❌ No error handling
❌ No logging
❌ No input validation
❌ Generic variable names (data, temp, x)
❌ No documentation
❌ Direct process.env access
❌ Unlimited database queries

---

## Before Committing Checklist

- [ ] No duplicate code
- [ ] All functions documented
- [ ] No magic numbers
- [ ] Error handling present
- [ ] Logging added
- [ ] Input validated
- [ ] Tests written/updated
- [ ] Config access correct
- [ ] No console.log
- [ ] File under 300 lines

---

**When in doubt, check coding-standards.md for full details.**
