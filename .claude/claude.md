# ParSaveables - Claude Code Project Context

## Project Overview

**ParSaveables** is a disc golf league tracking system that automatically processes scorecard screenshots, calculates points, and displays real-time leaderboards with AI-powered analytics. It also includes an automated podcast generator that creates AI-powered commentary episodes.

**Tech Stack:**
- Frontend: Vanilla HTML/CSS/JavaScript (Vercel)
- Database: Supabase (PostgreSQL)
- Automation: n8n workflows (Render)
- AI: Anthropic Claude (Vision + Chat + Script Generation)
- TTS: ElevenLabs / Google Cloud Text-to-Speech
- Integration: GroupMe webhooks
- Podcast: Node.js + FFmpeg

**Key Architecture:** Configuration-driven, database-first design. All business rules stored in database, not code.

---

## Critical Rules (NEVER Break These)

### 1. Configuration-Driven Architecture
- ❌ **NEVER** hardcode course names, tiers, or multipliers
- ❌ **NEVER** hardcode points systems (rank points, performance bonuses)
- ❌ **NEVER** hardcode business logic in workflow nodes
- ✅ **ALWAYS** read configuration from database tables
- ✅ **ALWAYS** use `points_systems` and `courses` tables

**Why:** This project was refactored to eliminate 65+ lines of hardcoded config. Maintaining this architecture is critical.

### 2. n8n Code Node Constraints
- ❌ **NEVER** use `fetch()` in n8n Code nodes (not available)
- ✅ **ALWAYS** use Supabase nodes for database queries
- ✅ **ALWAYS** use HTTP Request nodes for external APIs

**Why:** n8n Code nodes run in a sandboxed environment without fetch API.

### 3. Database Schema
- ❌ **NEVER** modify `rounds` or `player_rounds` tables without migrations
- ❌ **NEVER** delete event_id or points_system_id foreign keys
- ✅ **ALWAYS** create migrations in `database/migrations/`
- ✅ **ALWAYS** use ON CONFLICT for idempotent inserts

**Why:** Schema changes affect 36+ rounds of historical data and live workflows.

### 4. Points Calculation
- ❌ **NEVER** edit Calculate Points node without testing both seasons AND tournaments
- ✅ **ALWAYS** use pure functions (testable, no side effects)
- ✅ **ALWAYS** preserve tie-breaking logic
- ✅ **ALWAYS** apply course multipliers only for seasons (not tournaments)

**Why:** Points calculation is the core business logic. Bugs affect leaderboard accuracy.

---

## Project Structure

```
ParSaveables/
├── database/                   # All database scripts
│   ├── migrations/             # Schema changes (versioned)
│   ├── seed_data.sql          # Initial configuration
│   └── import_2025_final.sql  # Historical data
├── docs/                       # All documentation
│   ├── refactoring/           # Refactoring guides (one-time)
│   ├── ARCHITECTURE.md        # System design
│   ├── SETUP.md               # Setup instructions
│   └── PODCAST_SYSTEM.md      # Podcast generator documentation
├── n8n-workflows/             # Workflow node code
│   └── nodes/                 # Individual node implementations
│       ├── calculate-points.js           # Enterprise-grade calculator
│       ├── load-configuration-final.js   # Config loader
│       └── select-best-event.js          # Event selection (tournament priority)
├── podcast/                    # Automated podcast generator
│   ├── lib/                   # Core podcast modules
│   │   ├── data-fetcher.js           # Supabase data fetching
│   │   ├── dialogue-script-generator.js  # Claude AI script generation
│   │   ├── elevenlabs-audio-generator.js # ElevenLabs TTS integration
│   │   ├── google-audio-generator.js     # Google Cloud TTS fallback
│   │   ├── audio-mixer.js            # FFmpeg audio mixing
│   │   └── github-uploader.js        # GitHub Releases publisher
│   ├── generate-podcast.js    # Main generation script
│   ├── generate-from-existing-script.js  # Generate from manual edits
│   ├── assets/                # Intro/outro music
│   ├── output/                # Generated episodes
│   └── package.json           # NPM scripts and dependencies
├── ParSaveablesDashboard/     # Frontend (single-page app)
│   └── index.html             # Dashboard (1500+ lines, includes podcast player)
└── README.md                  # Public documentation
```

**Key Files:**
- `database/migrations/001_add_config_tables.sql` - Configuration tables
- `n8n-workflows/nodes/calculate-points.js` - Core points logic
- `ParSaveablesDashboard/index.html` - Dashboard UI (includes podcast player)
- `podcast/generate-from-existing-script.js` - Podcast generator
- `docs/refactoring/README_REFACTORING.md` - Start here for architecture understanding
- `docs/PODCAST_SYSTEM.md` - Complete podcast documentation

---

## Database Schema (READ THIS FIRST)

### Configuration Tables (Critical!)

**points_systems** - Scoring configurations
```sql
id | name | config (JSONB)
```
- Stores rank points (e.g., 1st=10, 2nd=7)
- Stores performance bonuses (birdie, eagle, ace)
- Stores tie-breaking rules
- Stores course multiplier settings

**courses** - Course difficulty tiers
```sql
id | course_name | tier (1-4) | multiplier (1.0-2.5) | active
```
- Tier 1: Beginner (1.0x)
- Tier 2: Intermediate (1.5x)
- Tier 3: Advanced (2.0x)
- Tier 4: Expert (2.5x)

**events** - Seasons and tournaments
```sql
id | name | type | year | start_date | end_date | points_system_id | is_active
```
- Links to points_systems table
- Supports date-based event detection

### Data Tables

**rounds** - Round metadata
```sql
id (UUID) | date | course_name | event_id | event_type | course_multiplier
```

**player_rounds** - Player performance
```sql
id | round_id | player_name | rank | aces | eagles | birdies | final_total | event_id
```

---

## Common Tasks

### Add New Course
```sql
INSERT INTO courses (course_name, tier, multiplier, active)
VALUES ('New Course Name', 3, 2.0, true);
```
**No code changes needed!**

### Create New Tournament
```sql
-- Step 1: Create points system
INSERT INTO points_systems (name, config) VALUES (
  'Tournament Name 2026',
  '{
    "rank_points": {"1": 15, "2": 12, "3": 9, "default": 0},
    "performance_points": {"birdie": 1, "eagle": 5, "ace": 10},
    "tie_breaking": {"enabled": true, "method": "average"},
    "course_multiplier": {"enabled": false, "override": 1.0}
  }'
);

-- Step 2: Create event
INSERT INTO events (name, type, year, start_date, end_date, points_system_id, is_active)
VALUES (
  'Tournament Name 2026',
  'tournament',
  2026,
  '2026-04-10',
  '2026-04-12',
  (SELECT id FROM points_systems WHERE name = 'Tournament Name 2026'),
  true
);
```
**No code changes needed!**

### Modify Points System
```sql
UPDATE points_systems
SET config = jsonb_set(config, '{rank_points,1}', '20')
WHERE name = 'Season 2025';
```
**No code changes needed!**

---

## Code Conventions

### n8n Workflow Nodes

**Always follow this pattern:**
```javascript
// 1. Get configuration from database (via Load Configuration node)
const config = $('Load Configuration').item.json;

// 2. Extract values
const courses = config.courses;
const pointsSystem = config.pointsSystem.config;

// 3. Use pure functions
function calculateSomething(input) {
  // No side effects, testable
  return result;
}

// 4. Return enriched data
return [{ json: { ... } }];
```

**Console logging:**
```javascript
console.log(`Event: ${event.name} (${event.type})`);
console.log(`Course: ${courseName} (${multiplier}x)`);
console.log(`${player.name}: Rank ${rank} → ${points} pts`);
```

**Error handling:**
```javascript
if (!config.pointsSystem) {
  throw new Error('[Node Name] No points system configured');
}
```

### SQL Conventions

**Migrations:**
- File naming: `###_description.sql` (e.g., `002_add_player_table.sql`)
- Always include rollback instructions in comments
- Test on local Supabase first

**Queries:**
- Use explicit column names (never `SELECT *` in production)
- Always add indexes for foreign keys
- Use ON CONFLICT for idempotent inserts

---

## Points System Logic

### Season 2025 (Regular Season)
```json
{
  "rank_points": {"1": 10, "2": 7, "3": 5, "default": 2},
  "performance_points": {"birdie": 1, "eagle": 3, "ace": 5},
  "course_multiplier": {"enabled": true}
}
```
**Formula:** `(rank_points + performance_points) × course_multiplier`

### Tournament (Example: Portlandia 2025)
```json
{
  "rank_points": {"1": 15, "2": 12, "3": 9, "4": 7, "5": 6, "6": 5, "7": 3, "default": 0},
  "performance_points": {"birdie": 1, "eagle": 5, "ace": 10},
  "course_multiplier": {"enabled": false, "override": 1.0}
}
```
**Formula:** `(rank_points + performance_points) × 1.0` (no course multiplier)

### Tie-Breaking
When players have identical scores:
1. More birdies wins
2. More pars wins
3. Earlier first birdie wins
4. Still tied → Share averaged points

**Example:** Two players tied for 2nd place
- Normal: 2nd gets 7 points, 3rd gets 5 points
- Tied: Both get (7 + 5) / 2 = 6 points

---

## Podcast System

### Overview

**Podcast Name:** Chain Reactions
**Tagline:** The world of heavy bags, curses, and pocket beers

The podcast system automatically generates AI-powered commentary episodes featuring two hosts:
- **Hyzer** - Sports commentary energy
- **Annie** - Sarcastic/witty personality

### Quick Start

```bash
cd podcast
npm install

# Generate podcast from scratch
npm run generate

# Generate from manually edited script
npm run generate:existing
```

### Architecture

**Workflow:**
1. Fetch data from Supabase (seasons, tournaments, player stats)
2. Generate dialogue script with Claude AI
3. Convert script to audio (ElevenLabs or Google TTS)
4. Mix audio with intro/outro music (FFmpeg)
5. Upload to GitHub Releases

**Key Files:**
- `podcast/generate-from-existing-script.js` - Main generation script
- `podcast/lib/elevenlabs-audio-generator.js` - ElevenLabs TTS integration
- `podcast/lib/audio-mixer.js` - FFmpeg audio mixing
- `podcast/lib/dialogue-script-generator.js` - Claude AI script generation

### TTS Configuration

**ElevenLabs (Primary - Free Tier):**
- Character limit: 10,000/month (free tier)
- Voices: Andriy Tkachenko (Hyzer), Cat (Annie)
- Configured in `.env`: `TTS_PROVIDER=elevenlabs`

**Google Cloud TTS (Fallback):**
- No character limits
- Voices: en-US-Neural2-J (Hyzer), en-US-Neural2-F (Annie)
- Configured in `.env`: `TTS_PROVIDER=google`

### Dashboard Integration

The dashboard includes a podcast player accessible via the "🎙️ Podcasts" button in the header:
- Fetches episodes from GitHub Releases API
- Displays scrollable episode list in modal
- HTML5 audio player for each episode
- Glassmorphism design matching dashboard aesthetic

**Implementation:** `ParSaveablesDashboard/index.html` (lines 773-1052)

### Common Tasks

**Generate Podcast:**
```bash
npm run generate:existing  # Use existing script (no Claude AI generation)
```

**Test Components:**
```bash
npm run test:script  # Test script generation only
npm run test:audio   # Test audio generation only
npm run test:data    # Test data fetcher only
```

**Character Usage Tracking:**
The system automatically tracks ElevenLabs character usage:
```
📊 Total characters used: 6,100/10,000 (61%)
💡 Remaining: 3,900 characters (~28 segments)
```

### Environment Variables

Required in `podcast/.env`:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key

# Claude AI
ANTHROPIC_API_KEY=your_key

# ElevenLabs
ELEVENLABS_API_KEY=your_key
ELEVENLABS_HYZER_VOICE=hWHihsTve3RbzG4PHDBQ
ELEVENLABS_ANNIE_VOICE=54Cze5LrTSyLgbO6Fhlc

# GitHub
GITHUB_TOKEN=your_token
GITHUB_OWNER=your_username
GITHUB_REPO=ParSaveables

# Audio
TTS_PROVIDER=elevenlabs
INTRO_DURATION_SECONDS=12
OUTRO_DURATION_SECONDS=15
```

**Full Documentation:** See `docs/PODCAST_SYSTEM.md`

---

## Known Issues & Workarounds

### Issue 1: Tournament Detection
**Problem:** When multiple events match a date, Supabase returns wrong one
**Solution:** Sort by `CASE WHEN type = 'tournament' THEN 1 ELSE 2 END ASC`
**Location:** "Determine Event" node

### Issue 2: Date Format from Scorecards
**Problem:** Scorecards have "September 26" (no year)
**Solution:** "Format Date for Query" node appends current year
**Location:** Before "Determine Event" node

### Issue 3: Course Name Variations
**Problem:** "Old Settler's" vs "Old Settlers" vs "Old Settler's Park"
**Solution:** Seed multiple spellings in `courses` table OR use fuzzy matching
**Location:** `database/seed_data.sql`

---

## Testing Checklist

Before committing changes:
- [ ] Test Calculate Points with season scorecard
- [ ] Test Calculate Points with tournament scorecard
- [ ] Verify course multiplier applied correctly
- [ ] Verify tie-breaking logic preserved
- [ ] Check dashboard displays correct points
- [ ] Run database migration on staging first
- [ ] Check n8n execution logs for errors

---

## Registered Players

Core league members (filter in dashboard):
```
Intern Line Cook, Jabba the Putt, Food Zaddy, Jaguar, Shogun,
BigBirdie, Butter Cookie, Cobra, Bird (🦅), Fireball,
Ace Brook, ScarletSpeedster
```

**Display Name Special Case:**
- Database: `Bird`
- Dashboard: `🦅` (emoji)

---

## Deployment

**Frontend:** Vercel (auto-deploy from main branch)
**Backend:** Render (n8n free tier, kept alive by UptimeRobot)
**Database:** Supabase (free tier, 500MB limit)

**Secrets:**
- Supabase anon key: In `ParSaveablesDashboard/index.html` (public, read-only)
- Supabase service key: In n8n credentials (write access)
- Claude API key: In n8n credentials

---

## Future Work

Planned but not implemented:
- [ ] Admin UI for configuration management (no SQL needed)
- [ ] Real-time dashboard updates (WebSockets)
- [ ] Mobile app (React Native)
- [ ] Stored procedures for complex queries
- [ ] Duplicate scorecard detection

**When implementing:** Follow configuration-driven pattern. No hardcoding!

---

## Resources

**Documentation:**
- Architecture: `docs/ARCHITECTURE.md`
- Setup: `docs/SETUP.md`
- Podcast System: `docs/PODCAST_SYSTEM.md`
- Refactoring Guide: `docs/refactoring/README_REFACTORING.md`
- Workflow Details: `docs/WORKFLOW_DETAILS.md`

**Session History:**
- Latest: `docs/refactoring/SESSION_CONTEXT.md`
- Changes: `docs/CHANGES_LOG.md`

**Quick Reference:**
- Database schema: See "Database Schema" section above
- Common tasks: See "Common Tasks" section above
- Code conventions: See "Code Conventions" section above

---

## Final Notes

**This project uses enterprise-grade patterns:**
- Configuration-driven design
- Database-first architecture
- Pure functions for testability
- Comprehensive error handling
- Clear separation of concerns

**When in doubt:**
1. Check if config should be in database (usually yes)
2. Never hardcode business rules
3. Write pure functions
4. Test with both seasons AND tournaments
5. Read the refactoring docs for context

**Questions?** Check `docs/refactoring/README_REFACTORING.md` first.

---

*Last updated: October 31, 2025 (added podcast system and dashboard improvements)*
