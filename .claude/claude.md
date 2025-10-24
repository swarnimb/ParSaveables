# ParSaveables - Claude Code Project Context

## Project Overview

**ParSaveables** is a disc golf league tracking system that automatically processes scorecard screenshots, calculates points, and displays real-time leaderboards with AI-powered analytics.

**Tech Stack:**
- Frontend: Vanilla HTML/CSS/JavaScript (Vercel)
- Database: Supabase (PostgreSQL)
- Automation: n8n workflows (Render)
- AI: Anthropic Claude (Vision + Chat)
- Integration: GroupMe webhooks

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
│   └── SETUP.md               # Setup instructions
├── n8n-workflows/             # Workflow node code
│   └── nodes/                 # Individual node implementations
│       ├── calculate-points.js           # Enterprise-grade calculator
│       ├── load-configuration-final.js   # Config loader
│       └── select-best-event.js          # Event selection (tournament priority)
├── ParSaveablesDashboard/     # Frontend (single-page app)
│   └── index.html             # Dashboard (1000+ lines)
└── README.md                  # Public documentation
```

**Key Files:**
- `database/migrations/001_add_config_tables.sql` - Configuration tables
- `n8n-workflows/nodes/calculate-points.js` - Core points logic
- `ParSaveablesDashboard/index.html` - Dashboard UI
- `docs/refactoring/README_REFACTORING.md` - Start here for architecture understanding

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

*Last updated: October 23, 2025 (after enterprise refactoring)*
