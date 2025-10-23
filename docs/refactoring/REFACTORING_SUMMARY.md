# ParSaveables Refactoring Summary

## What Changed?

### Before Refactoring ❌
```javascript
// Hardcoded in Calculate Points node
const rankPoints = {1: 10, 2: 7, 3: 5};
const courseTiers = {
  "tier1": {multiplier: 1.0, courses: ["Lil G", "Wells Branch"]},
  "tier2": {multiplier: 1.5, courses: ["Zilker Park", "Live Oak"]},
  // ... 15+ more courses
};
```

**Problems:**
- Adding courses = editing workflow code
- New tournaments = copy-pasting Calculate Points node
- Tournament detection broken (returns season instead)
- Duplicate code across nodes

---

### After Refactoring ✅
```javascript
// Configuration loaded from database
const config = $('Load Configuration').item.json;
const rankPoints = config.pointsSystem.config.rank_points;
const courses = config.courses; // Query from database
```

**Benefits:**
- Adding courses = INSERT into database (or admin UI)
- New tournaments = INSERT into database (or admin UI)
- Tournament detection fixed (proper prioritization)
- Zero code duplication

---

## Files Created

### Database
- `/database/migrations/001_add_config_tables.sql` - Create tables
- `/database/seed_data.sql` - Initial configuration data

### n8n Workflow Nodes
- `/n8n-workflows/nodes/load-configuration.js` - Fetch config from DB
- `/n8n-workflows/nodes/calculate-points.js` - Enterprise-grade points calculator

### Documentation
- `REFACTORING_INSTRUCTIONS.md` - Step-by-step implementation guide
- `REFACTORING_SUMMARY.md` - This file

---

## Quick Start

### 1. Run Database Scripts (5 min)

```sql
-- In Supabase SQL Editor:

-- Step 1: Create tables
-- Copy/paste: /database/migrations/001_add_config_tables.sql

-- Step 2: Seed data
-- Copy/paste: /database/seed_data.sql

-- Step 3: Verify
SELECT * FROM points_systems;
SELECT * FROM courses;
```

### 2. Update n8n Workflow (10 min)

**Add "Load Configuration" node:**
- Position: Between "Determine Event" and "Calculate Points"
- Type: Code
- Code: Copy from `/n8n-workflows/nodes/load-configuration.js`

**Replace "Calculate Points" code:**
- Open existing node
- Delete all code
- Paste from `/n8n-workflows/nodes/calculate-points.js`

**Fix "Determine Event":**
- Add "Prioritize Tournament" code node after it
- Or update sort order to prioritize tournaments

### 3. Test (5 min)

**Test Season Scorecard:**
- Upload scorecard with date NOT in Sept 25-29
- Verify: Uses Season 2025 points (10,7,5,2)
- Verify: Course multiplier applied

**Test Tournament Scorecard:**
- Upload scorecard with date in Sept 25-29, 2025
- Verify: Uses Portlandia 2025 points (15,12,9,7,6,5,3)
- Verify: Course multiplier = 1.0 (disabled)

---

## Configuration Examples

### Add New Course (SQL)
```sql
INSERT INTO courses (course_name, tier, multiplier, active)
VALUES ('New Austin DGC', 3, 2.0, true);
```

### Add New Tournament (SQL)
```sql
-- Step 1: Create points system
INSERT INTO points_systems (name, config) VALUES (
  'Austin Open 2026',
  '{
    "rank_points": {"1": 20, "2": 15, "3": 12, "default": 0},
    "performance_points": {"birdie": 1, "eagle": 5, "ace": 10},
    "tie_breaking": {"enabled": true, "method": "average"},
    "course_multiplier": {"enabled": false, "override": 1.0}
  }'
);

-- Step 2: Create event
INSERT INTO events (name, type, year, start_date, end_date, points_system_id, is_active)
VALUES (
  'Austin Open 2026',
  'tournament',
  2026,
  '2026-04-10',
  '2026-04-12',
  (SELECT id FROM points_systems WHERE name = 'Austin Open 2026'),
  true
);
```

---

## Configuration Schema Reference

### points_systems.config JSON Structure
```json
{
  "rank_points": {
    "1": 15,          // 1st place points
    "2": 12,          // 2nd place points
    "3": 9,           // 3rd place points
    "default": 0      // All other ranks
  },
  "performance_points": {
    "birdie": 1,      // Points per birdie
    "eagle": 5,       // Points per eagle
    "ace": 10         // Points per ace
  },
  "tie_breaking": {
    "enabled": true,  // Enable tie averaging?
    "method": "average" // Averaging method
  },
  "course_multiplier": {
    "enabled": true,  // Use course multipliers?
    "source": "course_tier",  // Get from courses table
    "override": 1.0   // Fixed multiplier if disabled
  }
}
```

### courses Table Structure
```
id          | SERIAL PRIMARY KEY
course_name | TEXT UNIQUE NOT NULL
tier        | INTEGER (1-4)
multiplier  | DECIMAL(3,2)
active      | BOOLEAN DEFAULT true
created_at  | TIMESTAMP
updated_at  | TIMESTAMP
```

---

## Troubleshooting

### "No points system configured"
**Fix:** Link event to points system
```sql
UPDATE events
SET points_system_id = (SELECT id FROM points_systems WHERE name = 'Season 2025')
WHERE name = '2025';
```

### "Course not found"
**Fix:** Add course to database
```sql
INSERT INTO courses (course_name, tier, multiplier)
VALUES ('Missing Course Name', 3, 2.0);
```

### Tournament returns season points
**Fix:** Verify event dates match scorecard date
```sql
SELECT * FROM events
WHERE start_date <= '2025-09-26'
  AND end_date >= '2025-09-26'
  AND type = 'tournament';
```

---

## Next Steps

1. ✅ **Complete Refactoring** - Follow REFACTORING_INSTRUCTIONS.md
2. **Build Admin UI** - Create admin.html for zero-SQL configuration
3. **Test Thoroughly** - Upload multiple scorecards
4. **Process Portlandia Scorecards** - Upload 5 tournament scorecards
5. **Document Changes** - Update CHANGES_LOG.md

---

## Success Metrics

After refactoring, you should be able to:
- ✅ Add course → Single INSERT statement
- ✅ Create tournament → Two INSERT statements
- ✅ Modify points → Single UPDATE statement
- ✅ No code changes needed
- ✅ Admin UI handles everything (future)

---

**Status:** Implementation files ready ✅
**Next Action:** Run database scripts in Supabase
**Estimated Time:** 20 minutes total
