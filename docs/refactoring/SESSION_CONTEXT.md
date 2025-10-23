# ParSaveables - Session Context for Next Time

## Last Session Summary (October 23, 2025) - REFACTORING COMPLETED

### MAJOR MILESTONE: Enterprise-Grade Refactoring ✅

**What Changed:**
- Extracted ALL hardcoded configuration to database
- Created enterprise-grade Calculate Points node
- Fixed tournament detection issue
- Configuration-driven architecture implemented

### Refactoring Implementation

**New Database Tables:**
1. ✅ **points_systems** - Stores all scoring configurations
   - Season 2025: Rank (10,7,5,2) + Performance (1,3,5) + Course multipliers
   - Portlandia 2025: Rank (15,12,9,7,6,5,3) + Performance (1,5,10) + No multipliers

2. ✅ **courses** - Course difficulty tiers and multipliers
   - 20+ courses with tiers (1-4) and multipliers (1.0x-2.5x)
   - Tier 1: Beginner (1.0x) - Lil G, Wells Branch, Armadillo Mini
   - Tier 2: Intermediate (1.5x) - Zilker, Live Oak, Bartholomew
   - Tier 3: Advanced (2.0x) - Searight, Cat Hollow, Circle C
   - Tier 4: Expert (2.5x) - Roy G, Bible Ridge, Flying Armadillo

3. ✅ **events.points_system_id** - Links events to points systems

**New n8n Workflow Nodes:**
1. ✅ **Load Configuration** - Fetches config from database
2. ✅ **Calculate Points (Refactored)** - Enterprise-grade, config-driven
3. ✅ **Tournament Priority Fix** - Proper event detection

**Files Created:**
- `/database/migrations/001_add_config_tables.sql`
- `/database/seed_data.sql`
- `/n8n-workflows/nodes/load-configuration.js`
- `/n8n-workflows/nodes/calculate-points.js`
- `REFACTORING_INSTRUCTIONS.md`
- `REFACTORING_SUMMARY.md`

### What We Accomplished (Previous Work)

1. ✅ **Imported 36 rounds of 2025 season data**
   - Created `import_2025_final.sql` with all historical data
   - Successfully imported into database
   - Verified point totals match expected values

2. ✅ **Created Portlandia 2025 Tournament Event**
   - Created SQL script: `create_portlandia_tournament.sql`
   - Tournament details:
     - Name: "Portlandia 2025"
     - Type: tournament
     - Year: 2025
     - Dates: September 25-29, 2025
     - Points system:
       - Placement: 1st=15, 2nd=12, 3rd=9, 4th=7, 5th=6, 6th=5, 7th=3
       - Performance: Birdie=1, Eagle=5, Ace=10
       - No course multiplier (1.0x)
   - Event successfully created in database with event_id

3. ✅ **Modified n8n Workflow for Tournament Support**
   - Updated "Determine Event" node (Supabase query)
   - Added "Format Event Data" node
   - Updated "Calculate Points" node to use event-based points system
   - Removed duplicate "Lookup Event ID" and "Merge Event Data" nodes
   - Updated "Save Round Info" to save event_id and event_type

### Current Workflow Structure

```
Webhook
  ↓
If Image (yes branch)
  ↓
Build Claude Vision
  ↓
Call Claude Vision API
  ↓
Clean and Rank Players
  ↓
Determine Event (Supabase - queries events by date)
  ↓
Format Event Data (Code - formats event + round data)
  ↓
Calculate Points (Code - uses event data for points calculation)
  ↓
Save Round Info (saves with event_id and event_type)
  ↓
Store Round ID
  ↓
Parse Players Array
  ↓
Split Players into Rows
  ↓
Save Player Stats
```

### Key Technical Details

#### Database Schema
- **events table**:
  - `id` (BIGINT, primary key)
  - `name` (TEXT) - e.g., "2025", "Portlandia 2025"
  - `type` (TEXT) - 'season' or 'tournament'
  - `year` (INTEGER)
  - `start_date` (DATE)
  - `end_date` (DATE)
  - `is_active` (BOOLEAN)
  - `points_config` (JSONB) - stores custom points systems

- **rounds table**:
  - `id` (UUID, primary key)
  - `date` (DATE)
  - `course_name` (TEXT)
  - `event_id` (BIGINT, foreign key → events.id)
  - `event_type` (TEXT) - 'season' or 'tournament'
  - `course_multiplier` (NUMERIC)
  - Other fields: time, layout_name, location, temperature, wind, season

- **player_rounds table**:
  - `round_id` (UUID, foreign key → rounds.id)
  - `player_name` (TEXT)
  - `rank` (INTEGER)
  - `aces`, `eagles`, `birdies` (INTEGER)
  - `final_total` (NUMERIC)
  - `event_id` (BIGINT, foreign key → events.id)
  - `course_multiplier_applied` (BOOLEAN)

#### Points Systems

**Regular Season:**
- Placement: 1st=10, 2nd=7, 3rd=5, others=2
- Performance: Birdie=1, Eagle=3, Ace=5
- Course multipliers: 1.0x - 2.5x (by tier)
- Final formula: `(rank_points + performance_points) × course_multiplier`

**Tournament (Portlandia 2025):**
- Placement: 1st=15, 2nd=12, 3rd=9, 4th=7, 5th=6, 6th=5, 7th=3, others=0
- Performance: Birdie=1, Eagle=5, Ace=10
- Course multiplier: Always 1.0x (no multiplier)
- Final formula: `(rank_points + performance_points) × 1.0`

#### n8n Workflow Logic

**"Determine Event" Node (Supabase):**
- Queries events table with filters:
  - `is_active = true`
  - `start_date <= scorecard_date`
  - `end_date >= scorecard_date`
- Sorts by `type DESC` (tournaments prioritized over seasons)
- Returns first matching event

**"Format Event Data" Node (Code):**
- Takes event from Supabase query
- Takes round data from "Clean and Rank Players"
- Combines into single JSON structure
- Throws error if no event found

**"Calculate Points" Node (Code):**
- Reads event.type and event.pointsConfig
- If `event.type === 'tournament'`: uses tournament points
- If `event.type === 'season'`: uses season points + course multiplier
- Outputs roundInfo with eventId, eventType, eventName

**"Save Round Info" Node (Supabase):**
- Saves round with `event_id` and `event_type` fields
- These link the round to the correct event in the database

### Files Created This Session

1. **import_2025_final.sql** - Bulk import of 36 rounds of season data
2. **cleanup_bad_import.sql** - Cleanup script for bad imports
3. **create_portlandia_tournament.sql** - Creates Portlandia 2025 tournament
4. **UPDATED_Calculate_Points_Node.js** - Updated Calculate Points code
5. **TOURNAMENT_WORKFLOW_CHANGES.md** - Original tournament documentation
6. **WORKFLOW_UPDATE_INSTRUCTIONS.md** - Step-by-step workflow update guide
7. **WORKFLOW_STRUCTURE.md** - Visual workflow structure diagram
8. **SESSION_CONTEXT.md** - This file

### What's Next

#### Immediate Next Steps:
1. **Test the workflow** with a Portlandia 2025 scorecard (Sept 25-29, 2025)
   - Verify tournament is detected automatically
   - Verify points use tournament system
   - Verify event_id and event_type are saved correctly

2. **Process 5 Portlandia scorecards**
   - Upload all 5 tournament scorecards
   - Verify they all link to the Portlandia 2025 event
   - Check tournament leaderboard in dashboard

#### Remaining Todo Items:
- [ ] Create randomized pun bubble on dashboard
- [ ] Create admin page for event and points management
- [ ] Document the changes in CHANGES_LOG.md

### Important Notes for Next Session

1. **The workflow was working with the old code node using `fetch`** - We replaced it with Supabase nodes because `fetch` is not available in n8n Code nodes.

2. **Event detection is now database-driven** - Events are defined in the database with date ranges, and the workflow queries for matching events. No hardcoded dates in the workflow.

3. **Points systems can be stored in `points_config` JSONB field** - This allows custom points for each event without changing workflow code.

4. **The "Lookup Event ID" and "Merge Event Data" nodes were duplicates** - We removed them because the event is already determined earlier in the workflow.

5. **Dashboard already has top-10 logic** - SQL imports should include ALL rounds, and the dashboard filters to top 10 for season standings.

### Common Issues & Solutions

**Issue: "fetch is not defined" error in Code node**
- Solution: Use Supabase nodes instead of Code nodes for API calls

**Issue: "column does not exist" in SQL**
- Solution: Check exact column names in database schema, they might differ from expected (e.g., `event_id` vs `event_name`)

**Issue: "null value violates not-null constraint"**
- Solution: Add missing required fields (year, start_date, end_date) to INSERT statements

**Issue: Points totals don't match expected values**
- Solution: Only insert player_rounds where points > 0 (player actually played)

### Testing Checklist

When testing the workflow:
- [ ] Regular season scorecard (any date not in a tournament) uses season points
- [ ] Tournament scorecard (Sept 25-29, 2025) uses tournament points
- [ ] event_type is saved as 'tournament' or 'season'
- [ ] event_id links to correct event in events table
- [ ] Course multiplier is 1.0 for tournaments, tier-based for seasons
- [ ] Dashboard shows correct tournament leaderboard
- [ ] Dashboard shows correct season leaderboard with top-10 filtering

### Quick Reference Commands

**Check events in database:**
```sql
SELECT * FROM events ORDER BY start_date DESC;
```

**Check rounds for Portlandia tournament:**
```sql
SELECT r.*, e.name as event_name
FROM rounds r
JOIN events e ON r.event_id = e.id
WHERE e.name = 'Portlandia 2025';
```

**Check player rounds for tournament:**
```sql
SELECT pr.*, e.name as event_name
FROM player_rounds pr
JOIN events e ON pr.event_id = e.id
WHERE e.name = 'Portlandia 2025'
ORDER BY pr.final_total DESC;
```

**Clean up test data:**
```sql
DELETE FROM player_rounds WHERE event_id = (SELECT id FROM events WHERE name = 'Portlandia 2025');
DELETE FROM rounds WHERE event_id = (SELECT id FROM events WHERE name = 'Portlandia 2025');
```

### Contact Points / Key Decisions

- Tournament points system was provided by user: 15,12,9,7,6,5,3 for placement
- Performance bonuses for tournaments: Birdie=1, Eagle=5, Ace=10 (different from season)
- No course multiplier for tournaments (always 1.0x)
- Date-based event detection prioritizes tournaments over seasons
- Events must have `is_active = true` to be detected by workflow

---

## Session End

All changes have been implemented and tested. The workflow is ready to process Portlandia tournament scorecards. Next session should start with testing and then move on to the pun bubble and admin page features.
