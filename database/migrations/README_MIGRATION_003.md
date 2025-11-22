# Migration 003: Course Aliases System

## Problem

The `courses` table has duplicate entries for alternate spellings of the same course:
- "Live Oak", "Liveoak", "Live Oak Brewing DGC" (same course, 3 entries)
- "Northtown Park", "Northotown" (same course, 2 entries)
- "MetCenter", "Met Center" (same course, 2 entries)
- "Searight Park", "Searight" (same course, 2 entries)
- "Flying Armadillo", "Armadillio" (same course, 2 entries)
- "Sprinkle Valley", "Sprinkle" (same course, 2 entries)
- "Old Settler's", "Old Settlers", "Old Settler\'s" (same course, 3 entries)

**Issues with current approach:**
1. Info tab shows duplicate courses in Course Multipliers list
2. Harder to maintain tier/multiplier data (must update all duplicates)
3. No single source of truth for each physical course
4. Clutters courses table

## Solution

Create `course_aliases` table to map alternate spellings to canonical course entries.

**Architecture:**
```
courses (canonical entries only)
  ├─ Live Oak (tier 2, 1.5x)
  ├─ Northtown Park (tier 3, 2.0x)
  └─ MetCenter (tier 3, 2.0x)

course_aliases (alternate names)
  ├─ "Liveoak" → Live Oak
  ├─ "Live Oak Brewing DGC" → Live Oak
  ├─ "Northotown" → Northtown Park
  └─ "Met Center" → MetCenter
```

## What This Migration Does

### 1. Creates `course_aliases` Table
```sql
CREATE TABLE course_aliases (
  id SERIAL PRIMARY KEY,
  alias TEXT UNIQUE NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE
);
```

### 2. Migrates Existing Duplicates
- Extracts 14 alternate spellings from `courses` table
- Inserts them into `course_aliases` table
- Links aliases to their canonical course
- **Result:** 31 courses reduced to 20 unique courses with 14 aliases

### 3. Marks Duplicates as Inactive
- Sets `active = false` for duplicate course entries
- Preserves historical data (doesn't delete)
- Only canonical courses show as active

### 4. Adds Database Function
Creates `find_course_by_name_or_alias(input_name TEXT)` function that:
1. Tries exact match on `courses.course_name`
2. Falls back to match on `course_aliases.alias`
3. Falls back to partial match (fuzzy)

## Code Changes Required

### Backend Services

**`src/services/databaseService.js`:**
- Added `findCourseByNameOrAlias()` function
- Uses `find_course_by_name_or_alias` database function
- Replaces in-memory fuzzy matching

**`src/services/configService.js`:**
- Updated to call `db.findCourseByNameOrAlias()` instead of `findCourse()`
- Database-level matching instead of JavaScript-level

### Frontend

**No changes needed** - frontend queries `active = true` courses only, so duplicates automatically hidden.

## How to Run

### Option 1: Via Supabase Dashboard (Recommended for Production)
1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste contents of `003_add_course_aliases.sql`
3. Run the script
4. Verify in Table Editor:
   - `course_aliases` table created
   - Duplicate courses marked `active = false`

### Option 2: Via psql (Local Testing)
```bash
psql [YOUR_DATABASE_URL] < database/migrations/003_add_course_aliases.sql
```

## Verification Steps

After running migration:

1. **Check aliases created:**
```sql
SELECT * FROM course_aliases;
-- Should show 14 aliases
```

2. **Check duplicates disabled:**
```sql
SELECT course_name, active FROM courses WHERE active = false;
-- Should show 11 inactive courses: Liveoak, Live Oak Brewing DGC, Northotown,
-- Searight, Met Center, Roy G, Roy G., Old Settlers, Armadillio, Sprinkle, Old Settler\'s
```

3. **Test database function:**
```sql
-- Test various aliases
SELECT * FROM find_course_by_name_or_alias('Liveoak');          -- Should return Live Oak
SELECT * FROM find_course_by_name_or_alias('Armadillio');       -- Should return Flying Armadillo
SELECT * FROM find_course_by_name_or_alias('Sprinkle');         -- Should return Sprinkle Valley
SELECT * FROM find_course_by_name_or_alias('Old Settlers');     -- Should return Old Settler's
```

4. **Verify course count:**
```sql
SELECT COUNT(*) FROM courses WHERE active = true;
-- Should show exactly 20 active courses
```

5. **Check Info tab:**
- Navigate to Info tab in dashboard
- Course Multipliers section should show no duplicates
- Should show exactly 20 courses
- Only canonical course names should appear

## Rollback (If Needed)

```sql
-- Reactivate duplicate courses
UPDATE courses SET active = true
WHERE course_name IN (
  'Liveoak', 'Live Oak Brewing DGC', 'Northotown',
  'Searight', 'Met Center', 'Roy G', 'Roy G.', 'Old Settlers',
  'Armadillio', 'Sprinkle', 'Old Settler\''s'
);

-- Drop aliases table
DROP TABLE IF EXISTS course_aliases CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS find_course_by_name_or_alias(TEXT);
```

## Future Usage

### Adding New Aliases

When vision service extracts a new spelling:

```sql
-- Option 1: Add alias to existing course
INSERT INTO course_aliases (alias, course_id)
SELECT 'New Spelling', id FROM courses WHERE course_name = 'Canonical Name';

-- Option 2: Add entirely new course
INSERT INTO courses (course_name, tier, multiplier, active)
VALUES ('New Course Name', 2, 1.5, true);
```

### Querying with Aliases

The system automatically handles aliases via the database function:
```javascript
// In configService.js
const course = await db.findCourseByNameOrAlias('Liveoak');
// Returns: {course_name: 'Live Oak', tier: 2, multiplier: 1.5}
```

## Benefits

✅ **Cleaner Info tab** - No duplicate courses shown
✅ **Easier maintenance** - Update tier/multiplier in one place
✅ **Better matching** - Database-level fuzzy matching
✅ **Preserves history** - Old duplicate entries remain (inactive)
✅ **Flexible** - Easy to add new aliases without cluttering main table

## Notes

- Migration is **idempotent** (safe to run multiple times)
- Uses `ON CONFLICT DO NOTHING` to avoid duplicate alias errors
- Original duplicate courses kept as inactive (not deleted)
- Vision service will continue to work with any spelling via aliases
