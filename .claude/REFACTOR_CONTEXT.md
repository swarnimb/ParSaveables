# ParSaveables Serverless Refactor - Claude Context

 

**Last Updated:** 2025-11-18

**Branch:** `claude/cross-chat-context-01FUU29HUVAF5nUwTgNfHenV`

**Status:** 7/8 services complete, orchestrators pending

 

---

 

## Quick Start (New Session)

 

1. **Verify branch:** `git checkout claude/cross-chat-context-01FUU29HUVAF5nUwTgNfHenV`

2. **Check progress:** Review "Build Status" section below

3. **Continue:** Start with emailService.js

4. **Reference:** See "What's Been Built" for completed code patterns

 

---

 

## Project Overview

 

**What:** Serverless disc golf scorecard processing system

**Why:** Replacing lost n8n workflow with maintainable, testable Node.js code

**Goal:** Enterprise-quality codebase that anyone can understand and extend

 

### Tech Stack

- **Runtime:** Node.js 18+ with ES modules (`import/export`)

- **Database:** Supabase PostgreSQL (existing production schema)

- **AI:** Anthropic Claude Vision API (scorecard extraction)

- **Deployment:** Vercel serverless functions (free tier)

- **Trigger:** Gmail API (manual email with screenshot)

- **Testing:** Node.js built-in test runner

 

### Key Architecture Decisions

- **Microservices:** Each service does ONE thing (single responsibility)

- **Config-driven:** All scoring rules in database, zero hardcoding

- **Testable:** Every function pure, every service tested

- **Composable:** Complex features built by combining simple functions

- **Fail-fast:** Validate early, throw descriptive errors

 

---

 

## Build Status

 

### ✅ Complete (7 services)

 

**1. Infrastructure**

- `package.json` - Dependencies, npm scripts

- `.env.example` - Environment variable template

- `src/config/index.js` - Load & validate config

- `src/utils/logger.js` - Timestamped logging

 

**2. Services**

- `databaseService.js` (167 lines) - Supabase CRUD

- `visionService.js` (181 lines) - Claude Vision API

- `scoringService.js` (212 lines) - Stats + ranking

- `eventService.js` (59 lines) - Event assignment

- `playerService.js` (242 lines) - Name validation with Levenshtein

- `configService.js` (106 lines) - Load points system + courses

- `pointsService.js` (168 lines) - Calculate final points

 

**3. Tests** - All 7 services have comprehensive test files

 

**Total Code:** 1,228 lines

 

### ❌ Pending (3 components)

 

1. **emailService.js** - Gmail API integration (NEXT)

2. **src/api/processScorecard.js** - Main orchestrator

3. **src/api/chatbot.js** - Chatbot endpoint

 

---

 

## Development Principles

 

### Code Quality Standards

1. **Enterprise-grade:** Every function modular, testable, reusable

2. **Zero hardcoding:** All config from database or `.env`

3. **Single responsibility:** Each service does ONE thing well

4. **Composition:** Build complex features by combining simple functions

5. **Fail fast:** Validate early with descriptive errors

6. **Logging:** Every service logs actions (info/warn/error)

 

### Communication Rules (User Preferences)

- ✅ **Concise:** Brief, precise responses - no fluff

- ✅ **Explain first:** Walk through logic before implementing

- ✅ **Test as we build:** Create test file with every service

- ✅ **Commit frequently:** Push after each service complete

- ❌ **No long responses:** User prefers compact explanations

 

### File Organization

```

src/

├── config/       # Environment & configuration

├── utils/        # Shared utilities (logger, helpers)

├── services/     # Business logic (one file per responsibility)

├── api/          # Orchestrators (tie services together)

└── tests/        # Unit tests (one per service)

```

 

---

 

## What's Been Built - Detailed Reference

 

### 1. databaseService.js

 

**Purpose:** All Supabase database operations

 

**Functions (6):**

```javascript

getRegisteredPlayers()        // Fetch active players

findEventByDate(dateString)   // Find season/tournament (prioritizes tournaments)

getCourses()                  // Get all active courses with tiers/multipliers

getPointsSystem(id)           // Get scoring config by ID

insertRound(roundData)        // Create round record, returns ID

insertPlayerRounds(array)     // Bulk insert player stats

```

 

**Key Pattern:**

- Uses `createClient()` from `@supabase/supabase-js`

- Service role key for full access (bypasses RLS)

- All functions async, return data or throw descriptive errors

- Logging on every operation

 

### 2. visionService.js

 

**Purpose:** Extract scorecard data from image using Claude Vision API

 

**Main Function:**

```javascript

extractScorecardData(imageUrl)

// Returns: {valid: true/false, courseName, players, holes, date, time, weather, ...}

```

 

**Validation Rules:**

- Must look like UDisc scorecard format

- Minimum 4 players required

- Must contain hole-by-hole scoring data

 

**Flexibility:**

- Handles variable hole counts (9, 18, 27, etc.)

- Supports non-standard hole names (A, 2A, 2B)

- Extracts weather data (temp, wind)

- Attempts to match truncated player names

 

**Prompt Strategy:**

- Detailed extraction instructions in constant `SCORECARD_EXTRACTION_PROMPT`

- Requests JSON output (no markdown)

- Specifies all required fields with examples

 

### 3. scoringService.js

 

**Purpose:** Calculate stats and rank players with tie-breakers

 

**Functions (4):**

```javascript

calculateStats(holeByHole, holes)     // Count birdies/eagles/aces from scores

getFirstBirdieHole(holeByHole, holes) // For tie-breaking

rankPlayers(players, holes)            // Sort with tie-breakers

processScorecard(scorecardData)        // Orchestrate stats + ranking

```

 

**Tie-Breaking Priority:**

1. Lower total score wins

2. More birdies wins

3. More pars wins

4. Earlier first birdie wins

5. Still tied → share rank

 

**Key Logic:**

- Recalculates stats from hole-by-hole (catches Vision API errors)

- Logs when Claude's stats don't match calculated values

- Pure functions (no side effects, testable)

 

### 4. eventService.js

 

**Purpose:** Assign season or tournament based on scorecard date

 

**Main Function:**

```javascript

assignEvent(dateString)

// Validates format (YYYY-MM-DD)

// Calls databaseService.findEventByDate()

// Ensures event has points_system_id linked

// Returns event object or throws error

```

 

**Error Handling:**

- Invalid date format → descriptive error

- No event found → suggests creating one in admin panel

- Missing points_system_id → suggests linking in admin panel

 

### 5. playerService.js

 

**Purpose:** Validate and match player names against registry

 

**Main Function:**

```javascript

validatePlayers(scorecardPlayers)

// Returns: {matched, unmatched, warnings, stats}

```

 

**Fuzzy Matching Algorithm:**

- Uses **Levenshtein distance** (edit distance calculation)

- Exact threshold: 95% similarity

- Fuzzy threshold: 75% similarity

- Below 75% → unmatched, logged as warning

 

**Helper Functions:**

```javascript

normalizeName(name)              // Lowercase, trim, remove special chars

calculateSimilarity(name1, name2) // 0-1 similarity score

levenshteinDistance(str1, str2)  // Edit distance algorithm

findPlayerByName(name)           // Exact match lookup

```

 

**Why This Matters:**

- Handles truncated names ("Intern..." → "Intern Line Cook")

- Catches typos/variations

- Returns warnings for fuzzy matches (needs confirmation)

 

### 6. configService.js

 

**Purpose:** Load complete scoring configuration for an event

 

**Main Function:**

```javascript

loadConfiguration(event, courseName)

// Returns: {event, pointsSystem, course, courses}

```

 

**Course Matching:**

- Exact match first

- Partial match (contains) second

- Default (tier 2, 1.0x multiplier) if no match

- Logs warnings for defaults

 

**Why Needed:**

- Single call gets all config (points system + course data)

- Fuzzy course name matching handles variations

- Falls back gracefully to defaults

 

### 7. pointsService.js

 

**Purpose:** Calculate final points for all players

 

**Main Function:**

```javascript

calculatePoints(rankedPlayers, configuration)

// Returns: players with points breakdown {rankPoints, performancePoints, rawTotal, courseMultiplier, finalTotal}

```

 

**Calculation Steps:**

1. Get rank points from config (handles tied ranks)

2. Calculate performance points (aces/eagles/birdies)

3. Sum rawTotal = rank + performance

4. Apply course multiplier (if enabled in config)

5. Return finalTotal

 

**Tied Rank Averaging:**

```javascript

calculateTiedRankPoints(ranks, rankConfig)

// Example: 3 players tie for 2nd (ranks 2,3,4 = 7,5,3 points)

// Each gets: (7+5+3)/3 = 5 points

```

 

**Config-Driven:**

- All point values from database `points_systems.config`

- Multipliers can be enabled/disabled per event

- Supports any custom scoring system

 

---

 

## Database Schema Reference

 

### Configuration Tables (Read)

```sql

points_systems (id, name, config JSONB)

-- config structure:

{

  "rank_points": {"1": 10, "2": 7, "3": 5, "default": 2},

  "performance_points": {"birdie": 1, "eagle": 3, "ace": 5},

  "tie_breaking": {"enabled": true, "method": "average"},

  "course_multiplier": {"enabled": true, "source": "course_tier"}

}

 

courses (id, course_name, tier, multiplier, active)

-- Tier 1: 1.0x, Tier 2: 1.5x, Tier 3: 2.0x, Tier 4: 2.5x

 

events (id, name, type, year, start_date, end_date, points_system_id, is_active)

-- type: 'season' or 'tournament'

 

registered_players (id, player_name, active)

-- 12 players currently

```

 

### Data Tables (Write)

```sql

rounds (id, date, time, course_name, layout_name, location, temperature, wind, course_multiplier)

 

player_rounds (id, round_id, player_name, rank, total_strokes, total_score,

               birdies, eagles, aces, pars, bogeys, double_bogeys,

               rank_points, birdie_points, eagle_points, ace_points,

               raw_total, final_total, hole_by_hole TEXT)

```

 

**Important:** Database is LIVE with production data. Tests are read-only.

 

---

 

## Next Steps - What to Build

 

### 1. emailService.js (PRIORITY 1 - NEXT)

 

**Purpose:** Gmail API integration to trigger workflow

 

**Functions Needed:**

```javascript

async function checkForNewEmails()

// Poll Gmail inbox for unread emails

// Filter for emails with image attachments

// Return array of {emailId, imageUrl, receivedDate}

 

async function extractImageUrl(email)

// Get attachment URL from email message

// Handle both inline images and attachments

// Return public-accessible image URL

 

async function markAsProcessed(emailId)

// Mark email as read

// Optionally label as "Processed"

 

async function sendErrorNotification(emailId, error)

// Email user if processing failed

// Include error details and original scorecard info

```

 

**Gmail API Setup:**

- OAuth2 flow with refresh token

- Required scopes: `gmail.readonly`, `gmail.modify`

- Credentials: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`

- Library: `googleapis` (already in package.json)

 

**Test Strategy:**

- Mock Gmail API responses

- Test with sample email data structure

- Verify OAuth token refresh logic

 

### 2. src/api/processScorecard.js (PRIORITY 2)

 

**Purpose:** Main orchestrator tying all services together

 

**Single Function:**

```javascript

export async function processNewScorecards()

```

 

**Workflow (12 steps):**

```javascript

1. emailService.checkForNewEmails()

2. For each email with image:

   3. emailService.extractImageUrl(email)

   4. visionService.extractScorecardData(imageUrl)

   5. Check if valid scorecard (min 4 players)

   6. scoringService.processScorecard(data) // stats + ranking

   7. eventService.assignEvent(date)

   8. playerService.validatePlayers(players)

   9. configService.loadConfiguration(event, courseName)

   10. pointsService.calculatePoints(players, config)

   11. databaseService.insertRound(roundData)

   12. databaseService.insertPlayerRounds(playerData)

   13. emailService.markAsProcessed(emailId)

   14. On error: emailService.sendErrorNotification(emailId, error)

```

 

**Error Handling:**

- Wrap each step in try/catch

- Log all errors with context

- Continue processing other emails if one fails

- Send notification email on any failure

 

**Return Value:**

```javascript

{

  processed: number,      // Successfully processed

  failed: number,         // Failed processing

  skipped: number,        // Invalid scorecards

  errors: Array<Object>   // Error details

}

```

 

### 3. src/api/chatbot.js (PRIORITY 3)

 

**Purpose:** Separate endpoint for dashboard chatbot

 

**Main Function:**

```javascript

export async function handleChatbotQuery(question)

```

 

**Workflow:**

```javascript

1. Parse question to determine query type

   - "leaderboard" / "winning"

   - "stats for [player]"

   - "course [name]"

   - "recent rounds"

   - "general"

 

2. Fetch relevant data from Supabase

   - Filter by query type

   - Limit results for performance

 

3. Call Claude Chat API

   - Include question + data context

   - Format instructions for clean output

 

4. Return formatted answer

```

 

**Query Type Detection:**

```javascript

if (question.includes('leaderboard') || question.includes('winning')) {

  queryType = 'leaderboard';

  data = await db.getSeasonLeaderboard();

}

else if (question.includes('stats for')) {

  queryType = 'player_stats';

  playerName = extractPlayerName(question);

  data = await db.getPlayerStats(playerName);

}

// ... etc

```

 

---

 

## Deployment (Vercel)

 

### vercel.json Configuration

```json

{

  "functions": {

    "api/processScorecard.js": {

      "memory": 1024,

      "maxDuration": 60

    },

    "api/chatbot.js": {

      "memory": 512,

      "maxDuration": 30

    }

  }

}

```

 

### Environment Variables (Vercel Dashboard)

```

SUPABASE_URL=https://bcovevbtcdsgzbrieiin.supabase.co

SUPABASE_SERVICE_ROLE_KEY=[your-key]

ANTHROPIC_API_KEY=[your-key]

GMAIL_CLIENT_ID=[your-id]

GMAIL_CLIENT_SECRET=[your-secret]

GMAIL_REFRESH_TOKEN=[your-token]

NODE_ENV=production

```

 

### API Endpoints

- `POST /api/processScorecard` - Process new scorecards (manual trigger or cron)

- `POST /api/chatbot` - Handle chatbot queries from dashboard

 

### Cron Jobs (Optional)

```json

{

  "crons": [{

    "path": "/api/processScorecard",

    "schedule": "*/15 * * * *"

  }]

}

```

 

---

 

## Common Code Patterns

 

### Service Function Template

```javascript

import { createLogger } from '../utils/logger.js';

 

const logger = createLogger('ServiceName');

 

export async function functionName(params) {

  logger.info('Action starting', { context: params });

 

  // 1. Validation

  if (!params || !params.required) {

    logger.error('Missing required param', { params });

    throw new Error('Descriptive error message for user');

  }

 

  // 2. Business logic

  try {

    const result = await operation(params);

 

    logger.info('Action complete', { resultSummary: result.id });

    return result;

 

  } catch (error) {

    logger.error('Operation failed', {

      error: error.message,

      stack: error.stack

    });

    throw new Error(`Service error: ${error.message}`);

  }

}

 

export default { functionName };

```

 

### Test File Template

```javascript

import { test } from 'node:test';

import assert from 'node:assert';

import * as service from '../services/serviceName.js';

 

test('functionName should do expected thing', async () => {

  const input = { /* test data */ };

  const result = await service.functionName(input);

 

  assert.ok(result, 'Should return result');

  assert.strictEqual(result.property, expected, 'Should match expected');

 

  console.log('✓ Test passed:', result);

});

 

console.log('\n🧪 Running serviceName tests...\n');

```

 

---

 

## Testing Strategy

 

### Unit Tests (Current)

- Every service has test file in `src/tests/`

- Tests run with: `npm test`

- Cover: happy path, edge cases, error scenarios

- **Status:** Cannot run locally (sandbox network restrictions)

- **Plan:** Test on Vercel deployment

 

### Integration Testing (Future)

- Deploy to Vercel staging environment

- Test with real Supabase database

- Use sample scorecard images

- Verify end-to-end workflow

 

### Test Data Available

- Season 2025 (active, dates: all year)

- Portlandia 2025 tournament (Sept 25-29)

- Minneapolis 2024 tournament (Aug 1-5)

- 12 registered players

- 20 courses across 4 tiers

- 36+ rounds of historical data

 

---

 

## User Workflow

 

### Scorecard Submission

1. User plays disc golf round

2. Takes screenshot of UDisc scorecard

3. Emails screenshot to designated Gmail account

4. (System automatically processes within 15 min if cron enabled)

5. Dashboard refreshes to show new round data

 

### Error Scenarios

- **Invalid image:** User receives email "Not a valid scorecard"

- **< 4 players:** Rejected with reason

- **No matching event:** Suggests creating event in admin panel

- **Unmatched players:** Warns which names didn't match registry

- **API errors:** User notified with error details

 

### Admin Actions (Existing HTML Panel)

- Add new tournament → Creates event + points system

- Add new course → Inserts into courses table

- Modify scoring → Updates points_systems.config

- All done via browser UI, no backend code needed

 

---

 

## Files to Reference (Key Examples)

 

**Best Code Patterns:**

- `src/services/scoringService.js` - Complex business logic, tie-breaking

- `src/services/playerService.js` - Advanced algorithm (Levenshtein)

- `src/services/pointsService.js` - Config-driven calculation

- `src/tests/pointsService.test.js` - Comprehensive test coverage

 

**Configuration:**

- `src/config/index.js` - Environment variable validation

- `.env.example` - Required credentials template

 

**Documentation:**

- `src/README.md` - Folder structure quick reference

- This file - Complete context for new sessions

 

---

 

## Git Workflow

 

### Branches

- `main` - Production code (HTML dashboard, old n8n docs)

- `claude/cross-chat-context-01FUU29HUVAF5nUwTgNfHenV` - Current refactor work

 

### Commit Pattern

```bash

git add src/services/serviceName.js src/tests/serviceName.test.js

git commit -m "Add serviceName for [purpose]

 

- Implement function1: [what it does]

- Implement function2: [what it does]

- Add comprehensive tests covering [scenarios]"

git push

```

 

### When to Commit

- After each service complete (service + test file)

- After infrastructure changes (package.json, config)

- Before starting new major component

 

---

 

## Quick Reference Cheat Sheet

 

### Import Patterns

```javascript

import * as db from './databaseService.js';           // All functions

import { config } from '../config/index.js';          // Config object

import { createLogger } from '../utils/logger.js';    // Logger factory

```

 

### Logger Usage

```javascript

const logger = createLogger('MyService');

logger.info('Action happening', { data });

logger.warn('Potential issue', { warning });

logger.error('Operation failed', { error: err.message });

logger.debug('Verbose info', { details }); // Only if LOG_LEVEL=debug

```

 

### Database Calls

```javascript

const players = await db.getRegisteredPlayers();

const event = await db.findEventByDate('2025-11-18');

const courses = await db.getCourses();

const ps = await db.getPointsSystem(event.points_system_id);

const round = await db.insertRound({ date, course_name, ... });

await db.insertPlayerRounds([{ round_id, player_name, ... }]);

```

 

### Error Throwing

```javascript

throw new Error('User-friendly message explaining what went wrong');

// Examples:

throw new Error('No event found for date 2025-11-18. Create one in admin panel.');

throw new Error('Player "John Doe" not in registry. Add via admin panel.');

```

 

---

 

## Session Handoff Checklist

 

**When starting new session, Claude should:**

1. ✅ Read this file (`REFACTOR_CONTEXT.md`)

2. ✅ Checkout branch: `claude/cross-chat-context-01FUU29HUVAF5nUwTgNfHenV`

3. ✅ Review "Build Status" to see what's complete

4. ✅ Check "Next Steps" for what to build

5. ✅ Follow "Development Principles" for code style

6. ✅ Use "Common Patterns" for consistency

7. ✅ Commit after each service complete

 

**Don't:**

- ❌ Make long responses (user prefers concise)

- ❌ Hardcode config values (always database-driven)

- ❌ Skip tests (create test file with every service)

- ❌ Modify production database (read-only for testing)

- ❌ Assume - ask for clarification if unclear

 

---

 

**Last Updated:** 2025-11-18

**Next Action:** Build `emailService.js` with Gmail API integration

**Current Progress:** 7/8 services complete (87%)

 
