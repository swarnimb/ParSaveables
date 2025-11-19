# ParSaveables Coding Standards & Style Guide

**Last Updated:** 2025-11-18
**Project:** ParSaveables Disc Golf Scorecard Processor
**Purpose:** Single source of truth for code style, patterns, and architecture decisions

---

## Core Principles

1. **Zero Duplication:** If code appears 2+ times, extract to shared utility
2. **Configuration Over Code:** Business rules in database, not hardcoded
3. **Fail-Fast with Context:** Validate early, throw descriptive errors
4. **Pure Functions:** Stateless, testable, composable
5. **Comprehensive Logging:** Every action logged with context
6. **Enterprise-Grade:** Production-ready code from day one

---

## File Organization

### Directory Structure (MUST FOLLOW)

```
src/
├── api/                    # API endpoints (orchestrators only)
│   ├── processScorecard.js # Main workflow orchestration
│   └── chatbot.js          # Chatbot endpoint
├── services/               # Business logic (single responsibility)
│   ├── databaseService.js  # ONLY database CRUD
│   ├── visionService.js    # ONLY Claude Vision calls
│   ├── scoringService.js   # ONLY stats calculation
│   └── [service].js        # One concern per file
├── utils/                  # Shared utilities (pure functions)
│   ├── logger.js           # Logging factory
│   ├── validation.js       # Shared validators
│   ├── retry.js            # Retry logic
│   └── errors.js           # Custom error classes
├── templates/              # Email/UI templates
│   └── emailTemplates.js   # Email HTML generators
├── config/                 # Configuration
│   └── index.js            # Environment config loader
└── tests/                  # Test files (mirrors src structure)
    ├── fixtures/           # Shared test data
    ├── helpers/            # Test utilities and mocks
    └── [service].test.js   # Tests for each service
```

**Rule:** If a file exceeds 300 lines, it's doing too much - split it.

---

## Code Style

### 1. Module Exports (STANDARD PATTERN)

**✅ ALWAYS USE THIS PATTERN:**

```javascript
/**
 * Service description
 * @module services/exampleService
 */

import { createLogger } from '../utils/logger.js';
import { executeQuery } from '../utils/databaseHelpers.js';

const logger = createLogger('ExampleService');

/**
 * Function description with JSDoc
 * @param {string} param - Parameter description
 * @returns {Promise<Object>} Return description
 */
export async function functionOne(param) {
  logger.info('Function one called', { param });
  // Implementation
}

/**
 * Another function
 */
export async function functionTwo() {
  // Implementation
}

// Default export for convenience (optional but recommended)
export default {
  functionOne,
  functionTwo
};
```

**❌ NEVER DO:**
- Mix named and default exports inconsistently
- Export only default without named exports
- Use CommonJS `module.exports` (this is ES6 modules)

---

### 2. Error Handling (MANDATORY)

**✅ USE CUSTOM ERROR CLASSES:**

```javascript
import { ValidationError, DatabaseError, ExternalAPIError } from '../utils/errors.js';

// Validation errors (user input)
if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
  throw new ValidationError('Invalid date format: expected YYYY-MM-DD', 'date');
}

// Database errors
if (error) {
  logger.error('Failed to fetch data', { error: error.message });
  throw new DatabaseError('Failed to fetch registered players', { table: 'registered_players' });
}

// External API errors
try {
  const result = await anthropic.messages.create(...);
} catch (error) {
  throw new ExternalAPIError('Anthropic', 'Vision API call failed', error);
}
```

**❌ NEVER DO:**
```javascript
throw new Error('something failed');  // Too generic
throw 'error message';                 // String throws
return null;                           // Silent failures
```

---

### 3. Async/Await (REQUIRED)

**✅ ALWAYS:**
```javascript
export async function fetchData() {
  try {
    const result = await someAsyncOperation();
    logger.info('Operation succeeded', { result });
    return result;
  } catch (error) {
    logger.error('Operation failed', { error: error.message });
    throw new DatabaseError('Failed to fetch data', error);
  }
}
```

**❌ NEVER:**
```javascript
// No callbacks
fetchData((error, result) => { });

// No naked promises
return someAsyncOperation().then(result => result);

// No missing try-catch on external calls
const result = await externalAPI();  // What if it fails?
```

---

### 4. Logging (COMPREHENSIVE)

**✅ EVERY SERVICE MUST:**

```javascript
import { createLogger } from '../utils/logger.js';
const logger = createLogger('ServiceName');  // Match file name

// Log entry to every function
export async function processData(input) {
  logger.info('Processing data', { inputType: typeof input, inputSize: input.length });

  try {
    // Log major steps
    logger.debug('Validation passed', { validatedFields: Object.keys(input) });

    const result = await transform(input);

    // Log success
    logger.info('Data processed successfully', { resultCount: result.length });
    return result;

  } catch (error) {
    // Log errors with full context
    logger.error('Processing failed', {
      error: error.message,
      stack: error.stack,
      input: JSON.stringify(input).slice(0, 200)  // Truncate large objects
    });
    throw error;
  }
}
```

**Log Levels:**
- `logger.error()` - Errors that need attention
- `logger.warn()` - Unexpected but handled situations
- `logger.info()` - Major operations and results
- `logger.debug()` - Detailed execution flow (use sparingly)

**❌ NEVER:**
```javascript
console.log('debugging stuff');  // Use logger
// No logging at all
// Logging sensitive data (passwords, API keys)
```

---

### 5. Function Documentation (JSDoc REQUIRED)

**✅ EVERY EXPORTED FUNCTION:**

```javascript
/**
 * Calculate points for ranked players with performance bonuses
 *
 * Applies configuration-driven point system:
 * - Rank points from points_system.config.rankPoints array
 * - Performance bonuses (aces, eagles, birdies)
 * - Course multiplier from course.multiplier
 * - Tied ranks share averaged points
 *
 * @param {Array<Object>} rankedPlayers - Players sorted by rank with stats
 * @param {Object} pointsSystemConfig - Points configuration from database
 * @param {number} pointsSystemConfig.rankPoints - Points by rank [100, 90, 85...]
 * @param {Object} pointsSystemConfig.performanceBonus - Bonus points {ace: 10, eagle: 5...}
 * @param {Object} course - Course information
 * @param {number} course.multiplier - Course difficulty multiplier (0.5-2.0)
 * @returns {Promise<Array<Object>>} Players with calculated points
 * @throws {ValidationError} If invalid config structure
 *
 * @example
 * const players = await calculatePoints(
 *   rankedPlayers,
 *   { rankPoints: [100, 90], performanceBonus: { ace: 10 } },
 *   { multiplier: 1.5 }
 * );
 */
export async function calculatePoints(rankedPlayers, pointsSystemConfig, course) {
  // Implementation
}
```

**Minimum Required:**
- Description of what function does
- `@param` for each parameter with type and description
- `@returns` with type and description
- `@throws` for each error type
- `@example` for complex functions

**❌ NEVER:**
```javascript
// No documentation
export function doStuff(x, y) { }

// Vague documentation
/**
 * Does the thing
 */
export function doThing() { }
```

---

### 6. Variable Naming (STRICT)

**✅ CONVENTIONS:**

```javascript
// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
const EXACT_MATCH_THRESHOLD = 0.95;

// Functions: camelCase, verb-first
async function calculatePoints() { }
async function validatePlayer() { }
function findBestMatch() { }

// Variables: camelCase, descriptive
const rankedPlayers = sortByScore(players);
const totalPoints = calculateSum(scores);
const isValidEmail = emailRegex.test(input);

// Classes: PascalCase
class ValidationError extends Error { }
class PlayerService { }

// Private functions: prefix with underscore
function _internalHelper() { }

// Booleans: is/has/should prefix
const isValid = true;
const hasErrors = false;
const shouldRetry = checkCondition();
```

**❌ NEVER:**
```javascript
const x = getData();              // What is x?
const temp = process();           // Temporary what?
const data = fetchStuff();        // Too generic
const flag = true;                // What flag?
function handle() { }             // Handle what?
```

---

### 7. Configuration Access (CRITICAL)

**✅ ALWAYS USE config OBJECT:**

```javascript
import { config } from '../config/index.js';

// Correct nested access
const apiKey = config.anthropic.apiKey;
const dbUrl = config.supabase.url;
const serviceKey = config.supabase.serviceRoleKey;
const model = config.anthropic.model;

// Initialize clients
const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });
const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);
```

**❌ NEVER:**
```javascript
// Flat access (WRONG - doesn't match config structure)
const apiKey = config.anthropicApiKey;  // ❌
const dbUrl = config.supabaseUrl;       // ❌

// Direct process.env access (bypass validation)
const apiKey = process.env.ANTHROPIC_API_KEY;  // ❌ Use config

// Hardcoded values
const model = 'claude-3-5-sonnet-20241022';  // ❌ Use config.anthropic.model
```

---

### 8. Database Queries (USE HELPERS)

**✅ ALWAYS USE QUERY HELPERS:**

```javascript
import { executeQuery, executeQuerySingle, executeQueryOptional } from '../utils/databaseHelpers.js';

// For multiple results
export async function getRegisteredPlayers() {
  const data = await executeQuery(
    () => supabase
      .from('registered_players')
      .select('*')
      .eq('active', true),
    'Failed to fetch registered players'
  );

  return data;
}

// For single required result
export async function getEvent(id) {
  const event = await executeQuerySingle(
    () => supabase
      .from('events')
      .select('*')
      .eq('id', id),
    'Failed to fetch event'
  );

  return event;
}

// For optional result (may not exist)
export async function findPlayer(name) {
  const player = await executeQueryOptional(
    () => supabase
      .from('registered_players')
      .select('*')
      .ilike('player_name', name),
    'Failed to search for player'
  );

  return player;  // null if not found
}
```

**❌ NEVER:**
```javascript
// Duplicate error handling
const { data, error } = await supabase.from('table').select('*');
if (error) {
  logger.error('Failed', error);
  throw new Error(`Database error: ${error.message}`);
}
// This pattern repeated 20+ times - USE HELPER!
```

---

### 9. No Magic Numbers/Strings (EXTRACT CONSTANTS)

**✅ ALWAYS:**

```javascript
// At top of file
const EXACT_MATCH_THRESHOLD = 0.95;
const FUZZY_MATCH_THRESHOLD = 0.75;
const MIN_PLAYERS_REQUIRED = 4;
const CACHE_TTL_MS = 5 * 60 * 1000;  // 5 minutes
const MAX_RETRY_ATTEMPTS = 3;
const NO_BIRDIE_INDICATOR = 999;

// Use in code
if (similarity >= EXACT_MATCH_THRESHOLD) {
  return { type: 'exact', player };
}

if (players.length < MIN_PLAYERS_REQUIRED) {
  throw new ValidationError(`Minimum ${MIN_PLAYERS_REQUIRED} players required`);
}
```

**❌ NEVER:**
```javascript
if (similarity >= 0.95) { }           // What does 0.95 mean?
if (score === 999) { }                // Magic number
setTimeout(() => {}, 300000);         // What's 300000?
if (temperature === 0.3) { }          // Why 0.3?
```

---

### 10. DRY Principle (ZERO TOLERANCE FOR DUPLICATION)

**✅ EXTRACT IMMEDIATELY IF APPEARS 2+ TIMES:**

```javascript
// WRONG: Duplicate validation
function funcOne(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
}

function funcTwo(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
}

// RIGHT: Extract to shared utility
// utils/validation.js
export function validateISODate(dateString) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new ValidationError('Invalid date format: expected YYYY-MM-DD', 'date');
  }
  return dateString;
}

// Use everywhere
import { validateISODate } from '../utils/validation.js';

function funcOne(date) {
  validateISODate(date);  // Single line
}
```

**Rule:** If you copy-paste code, STOP and extract it first.

---

## Testing Standards

### Test File Structure

**✅ REQUIRED FORMAT:**

```javascript
/**
 * Tests for [ServiceName]
 *
 * @requires Valid .env credentials for integration tests
 * Run: npm test src/tests/serviceName.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { functionToTest } from '../services/serviceName.js';
import { mockData, mockEvent } from './fixtures/testData.js';

console.log('\n🧪 Running [ServiceName] tests...\n');

// Test 1: Happy path
test('functionToTest should return expected result for valid input', async () => {
  // Arrange
  const input = mockData;

  // Act
  const result = await functionToTest(input);

  // Assert
  assert.ok(result, 'Should return result');
  assert.strictEqual(result.status, 'success');
  assert.strictEqual(result.data.length, 3);

  console.log('✓ Valid input test passed');
});

// Test 2: Edge case
test('functionToTest should handle empty input gracefully', async () => {
  // Arrange
  const emptyInput = [];

  // Act
  const result = await functionToTest(emptyInput);

  // Assert
  assert.deepStrictEqual(result, []);

  console.log('✓ Empty input test passed');
});

// Test 3: Error case
test('functionToTest should throw ValidationError for invalid input', async () => {
  // Arrange
  const invalidInput = null;

  // Assert throws
  await assert.rejects(
    async () => await functionToTest(invalidInput),
    {
      name: 'ValidationError',
      message: /required/i
    }
  );

  console.log('✓ Invalid input test passed');
});

console.log('✅ All [ServiceName] tests completed!\n');
```

### Test Coverage Requirements

**MINIMUM:**
- 1 happy path test per function
- 1 error case test per function
- Edge cases for critical business logic

**USE TEST FIXTURES:**
```javascript
// tests/fixtures/testData.js
export const mockScorecardData = { /* reusable data */ };
export const mockEvent = { /* reusable data */ };

// NOT this (duplicate data in every test):
const testData = { /* inline data */ };  // ❌
```

---

## Architecture Patterns

### 1. Service Layer Pattern (STRICT)

**Each service has ONLY ONE responsibility:**

```javascript
// ✅ databaseService.js - ONLY database operations
export async function getPlayers() { }
export async function saveRound() { }

// ✅ scoringService.js - ONLY calculation logic
export function calculateStats() { }
export function rankPlayers() { }

// ✅ visionService.js - ONLY external API calls
export async function extractScorecardData() { }

// ❌ NEVER mix concerns:
// databaseService.js should NOT calculate scores
// scoringService.js should NOT query database
// visionService.js should NOT save to database
```

### 2. Configuration-Driven Design (MANDATORY)

**Business rules in database, NOT code:**

```javascript
// ✅ GOOD: Load from database
const pointsSystem = await db.getPointsSystem(eventId);
const rankPoints = pointsSystem.config.rankPoints;  // [100, 90, 85...]

// ❌ BAD: Hardcoded
const rankPoints = [100, 90, 85, 80, 75];  // What if it changes?
```

**Make configurable:**
- Points systems
- Tie-breaking rules
- Validation thresholds
- Email templates
- Course multipliers

### 3. Orchestration Pattern (API Layer)

**API endpoints orchestrate, services execute:**

```javascript
// ✅ api/processScorecard.js
export async function handler(req, res) {
  try {
    // Orchestrate 12-step workflow
    const emails = await emailService.checkInbox();
    const images = await emailService.extractImages(emails[0]);
    const scorecard = await visionService.extractData(images[0]);
    const stats = scoringService.calculateStats(scorecard);
    const ranked = scoringService.rankPlayers(stats);
    const event = await eventService.assignEvent(scorecard.date);
    const config = await configService.loadConfiguration(event);
    const points = pointsService.calculatePoints(ranked, config);
    await databaseService.saveRound(scorecard, points);

    res.status(200).json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
}

// ❌ NEVER put business logic in API layer
// ❌ NEVER do database queries directly in API
```

---

## Performance Standards

### 1. Use Caching (REQUIRED)

```javascript
// ✅ Cache rarely-changing data
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes

export async function loadConfiguration(eventId) {
  const cached = configCache.get(eventId);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const data = await fetchFromDatabase(eventId);
  configCache.set(eventId, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Use Retry Logic (REQUIRED for External APIs)

```javascript
import { retryWithBackoff, isRetryableError } from '../utils/retry.js';

// ✅ Wrap external calls
const response = await retryWithBackoff(
  () => anthropic.messages.create({ /* config */ }),
  {
    maxRetries: 3,
    shouldRetry: isRetryableError,
    context: 'Claude Vision API'
  }
);
```

### 3. Pagination (REQUIRED for Large Queries)

```javascript
// ✅ Always limit results
const rounds = await supabase
  .from('rounds')
  .select('*')
  .order('date', { ascending: false })
  .limit(100);  // Prevent fetching 10,000+ rows

// ❌ NEVER unlimited queries
const rounds = await supabase.from('rounds').select('*');  // Danger!
```

---

## Security Standards

### 1. Input Validation (ALWAYS)

```javascript
// ✅ Validate all user input
import { validateISODate, isValidEmail } from '../utils/validation.js';

export async function processRequest(req) {
  // Validate required fields
  if (!req.body.question || typeof req.body.question !== 'string') {
    throw new ValidationError('Question is required and must be a string', 'question');
  }

  // Sanitize input
  const sanitized = req.body.question.trim().slice(0, 1000);  // Max length

  // Validate format
  if (req.body.date) {
    validateISODate(req.body.date);
  }
}
```

### 2. Error Messages (DON'T LEAK INTERNALS)

```javascript
// ✅ Generic public errors
catch (error) {
  logger.error('Database query failed', { error: error.message, stack: error.stack });

  // User sees generic message
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}

// ❌ Don't expose schema
res.status(500).json({
  error: `Column 'user_id' doesn't exist in table 'rounds'`  // Leaks schema!
});
```

### 3. Rate Limiting (TODO: Add to API endpoints)

```javascript
// TODO: Add rate limiting middleware
// - 100 requests per minute per IP
// - 1000 requests per hour per user
```

---

## Git Commit Standards

**Format:**
```
<type>(<scope>): <description>

[optional body]

🤖 Generated with Claude Code
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `docs`: Documentation only
- `chore`: Maintenance

**Examples:**
```
feat(chatbot): add retry logic for API calls

Wraps Anthropic API calls with exponential backoff retry
to handle transient network failures and rate limits.

🤖 Generated with Claude Code

---

fix(config): correct nested config access in chatbot

Changed config.anthropicApiKey to config.anthropic.apiKey
to match actual config structure.

🤖 Generated with Claude Code
```

---

## Code Review Checklist

Before committing, verify:

- [ ] No duplicate code (extracted to utilities)
- [ ] All functions have JSDoc
- [ ] No magic numbers (extracted to constants)
- [ ] Error handling with custom error classes
- [ ] Logging at entry/exit of functions
- [ ] Input validation for all user data
- [ ] Uses config object (not process.env)
- [ ] No hardcoded business logic
- [ ] Tests added/updated
- [ ] No console.log (use logger)
- [ ] Follows standard export pattern
- [ ] No files over 300 lines

---

## When to Refactor

**IMMEDIATE RED FLAGS:**
1. Code copy-pasted (extract to utility)
2. Function over 50 lines (break into smaller functions)
3. File over 300 lines (split into multiple files)
4. Hardcoded business rule (move to database config)
5. No error handling (add try-catch)
6. No logging (add logger calls)
7. No tests (write tests)

**Rule:** Leave code better than you found it.

---

## Questions to Ask Before Writing Code

1. **Does this already exist?** (Check for duplication)
2. **Is this configurable enough?** (Avoid hardcoding)
3. **Can this be tested easily?** (Pure functions)
4. **What happens when it fails?** (Error handling)
5. **Will this scale?** (Performance considerations)
6. **Is this the right layer?** (Service vs API vs util)

---

## Tools & Commands

**Run tests:**
```bash
npm test                                # All tests
npm test src/tests/serviceName.test.js  # Specific test
```

**Code quality checks:**
```bash
# TODO: Add linting
npm run lint
npm run format
```

**Deploy:**
```bash
vercel --prod
```

---

## References

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](../docs/DEPLOYMENT.md) - Deployment guide
- [README.md](../README.md) - Project overview

---

**Remember: Consistency > Cleverness. Readable > Compact. Maintainable > Fast (unless profiled).**
