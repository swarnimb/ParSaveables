# ParSaveables Refactoring Implementation Guide

## Overview

This guide walks you through implementing the enterprise-grade refactoring of the ParSaveables system. The refactoring extracts all hardcoded configuration to the database and makes the Calculate Points node configuration-driven.

---

## Step-by-Step Implementation

### Phase 1: Database Setup (15 minutes)

#### Step 1.1: Run Migration Script

1. Open your Supabase SQL Editor
2. Copy the contents of `/database/migrations/001_add_config_tables.sql`
3. Execute the script
4. Verify tables created:
   - `points_systems`
   - `courses`
   - `events` table updated with `points_system_id` column

#### Step 1.2: Seed Configuration Data

1. Copy the contents of `/database/seed_data.sql`
2. Execute the script
3. Verify data inserted:
   ```sql
   SELECT * FROM points_systems;  -- Should see 2 rows
   SELECT * FROM courses;          -- Should see 20+ rows
   SELECT e.name, ps.name as points_system
   FROM events e
   JOIN points_systems ps ON e.points_system_id = ps.id;
   ```

---

### Phase 2: Update n8n Workflow (30 minutes)

#### Step 2.1: Add "Load Configuration" Node

**Location:** Insert between "Determine Event" and "Calculate Points"

1. Open n8n workflow in editor
2. Click the connection line between "Determine Event" → "Calculate Points"
3. Click the **+** button to add new node
4. Select **Code** node type
5. Name it: `Load Configuration`
6. Copy code from `/n8n-workflows/nodes/load-configuration.js`
7. Paste into the node
8. **Save** the node

**Expected Output:**
```json
{
  "event": {
    "id": 1,
    "name": "2025",
    "type": "season",
    "points_config": { /* config from database */ }
  },
  "courses": [ /* array of course objects */ ],
  "pointsSystem": { /* points system object */ }
}
```

#### Step 2.2: Replace "Calculate Points" Node Code

1. Click on the **Calculate Points** node
2. **Select ALL** existing code and delete it
3. Copy code from `/n8n-workflows/nodes/calculate-points.js`
4. Paste into the node
5. **Save** the node

**Key Changes:**
- Now reads config from "Load Configuration" node
- No hardcoded course tiers
- No hardcoded points systems
- Uses database configuration dynamically

#### Step 2.3: Fix "Determine Event" Node

**Current Problem:** When multiple events match a date (e.g., season + tournament), it returns the wrong one.

**Solution:** Update the Supabase query to prioritize tournaments

1. Click on **"Determine Event"** Supabase node
2. Scroll to **"Sort"** section
3. **Option A: If custom SQL sort is supported:**
   - Add custom sort: `(CASE WHEN type = 'tournament' THEN 1 ELSE 2 END) ASC`

4. **Option B: If custom sort NOT supported (recommended):**
   - Keep existing node but rename to "Find Any Event"
   - Add a new **Code** node after it called "Prioritize Tournament"
   - Use this code:

```javascript
// Get all matching events from previous query
const events = $input.all().map(item => item.json);

if (!events || events.length === 0) {
  throw new Error('No active event found for this date');
}

// Prioritize: tournament > season
events.sort((a, b) => {
  if (a.type === 'tournament' && b.type !== 'tournament') return -1;
  if (a.type !== 'tournament' && b.type === 'tournament') return 1;
  // If same type, newer events first
  return new Date(b.start_date) - new Date(a.start_date);
});

const selectedEvent = events[0];
console.log(`Selected event: ${selectedEvent.name} (${selectedEvent.type})`);

return [{ json: selectedEvent }];
```

---

### Phase 3: Testing (20 minutes)

#### Test 1: Verify Configuration Loading

1. In n8n, click on **"Load Configuration"** node
2. Click **"Execute Node"** (test button)
3. Check output:
   - `event` object should have `points_config` field
   - `courses` array should have 20+ courses
   - `pointsSystem` object should have `config` field

**Expected:**
```json
{
  "event": {
    "points_config": {
      "rank_points": {"1": 10, "2": 7, ...},
      "performance_points": {"birdie": 1, ...}
    }
  },
  "courses": [
    {"course_name": "Lil G", "tier": 1, "multiplier": 1.0},
    ...
  ]
}
```

#### Test 2: Upload Season Scorecard

1. Post a test scorecard with date **NOT** in Sept 25-29
2. Watch workflow execution
3. Verify:
   - "Determine Event" returns "2025" season
   - "Load Configuration" fetches Season 2025 points system
   - "Calculate Points" uses rank points (10,7,5,2)
   - Course multiplier applied (1.0x-2.5x based on tier)
   - Points saved correctly in database

#### Test 3: Upload Tournament Scorecard

1. Post a test scorecard with date in **Sept 25-29, 2025**
2. Watch workflow execution
3. Verify:
   - "Determine Event" returns "Portlandia 2025" tournament
   - "Load Configuration" fetches Portlandia points system
   - "Calculate Points" uses rank points (15,12,9,7,6,5,3)
   - Course multiplier is 1.0 (disabled for tournaments)
   - Performance bonuses use tournament values (Eagle=5, Ace=10)
   - Points saved correctly

---

### Phase 4: Troubleshooting

#### Issue: "No points system configured for this event"

**Cause:** Event's `points_system_id` is NULL

**Fix:**
```sql
-- Check which events are missing points_system_id
SELECT id, name, type, points_system_id FROM events WHERE points_system_id IS NULL;

-- Link to appropriate points system
UPDATE events
SET points_system_id = (SELECT id FROM points_systems WHERE name = 'Season 2025')
WHERE name = '2025';
```

#### Issue: "Course not found in database. Using 1.0x multiplier"

**Cause:** Course name from scorecard doesn't match database

**Fix:**
```sql
-- Add the course (check spelling carefully)
INSERT INTO courses (course_name, tier, multiplier, active)
VALUES ('Exact Course Name', 3, 2.0, true);
```

**Or:** Add alternate spelling:
```sql
-- Example: "Old Settlers" vs "Old Settler's"
INSERT INTO courses (course_name, tier, multiplier, active)
VALUES ('Old Settlers', 3, 2.0, true);
```

#### Issue: Tournament scorecard uses season points

**Cause:** "Determine Event" returning wrong event

**Fix:** Implement "Prioritize Tournament" code node as described in Step 2.3

---

### Phase 5: Validation Checklist

Before considering refactoring complete, verify:

- [ ] Migration script ran without errors
- [ ] Seed data inserted (2 points systems, 20+ courses)
- [ ] Events table has `points_system_id` populated
- [ ] "Load Configuration" node fetches config successfully
- [ ] "Calculate Points" node has NO hardcoded values
- [ ] Season scorecard uses season points (10,7,5,2)
- [ ] Tournament scorecard uses tournament points (15,12,9,7,6,5,3)
- [ ] Course multipliers applied correctly
- [ ] Dashboard displays correct points
- [ ] Console logs show config-driven behavior

---

## What's Next?

After completing this refactoring:

1. **Admin UI (Optional but Recommended)**
   - Build admin.html page for managing configuration
   - No more SQL needed to add courses or tournaments

2. **Documentation**
   - Update ARCHITECTURE.md with new structure
   - Create DATABASE_SCHEMA.md with ER diagram
   - Write ADMIN_GUIDE.md for non-technical users

3. **Process Portlandia Scorecards**
   - Upload 5 tournament scorecards
   - Verify they all use correct tournament points
   - Check leaderboard in dashboard

---

## Benefits Achieved

✅ **Zero Hardcoding** - All business rules in database
✅ **Configuration-Driven** - Add tournaments without touching code
✅ **Maintainable** - Single Calculate Points node for all scenarios
✅ **Extensible** - New features = config changes only
✅ **Testable** - Pure functions, predictable behavior
✅ **Auditable** - Database tracks all configuration changes

---

## Rollback Plan

If issues arise, you can quickly rollback:

1. **Keep old Calculate Points node** (rename to "Calculate Points Legacy")
2. **Switch connections** back to legacy node
3. **Remove new nodes** (Load Configuration, Prioritize Tournament)
4. **Drop new tables** (optional):
   ```sql
   DROP TABLE IF EXISTS points_systems CASCADE;
   DROP TABLE IF EXISTS courses CASCADE;
   ALTER TABLE events DROP COLUMN IF EXISTS points_system_id;
   ```

---

## Support

If you encounter issues:
1. Check n8n execution logs for errors
2. Verify database queries in Supabase SQL Editor
3. Test each node individually using "Execute Node" button
4. Check console logs for configuration loading messages

Happy refactoring! 🎯
