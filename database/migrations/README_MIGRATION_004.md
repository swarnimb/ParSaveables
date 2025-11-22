# Migration 004: Clean Up Duplicate Courses

## Purpose

Delete duplicate course entries from the `courses` table, keeping only the 20 canonical courses.

**Before:** 31+ course entries with `active` flag to filter duplicates
**After:** Exactly 20 canonical courses + aliases table for variations

## Safety

This migration includes a **safety check** that aborts if any `rounds` table records reference the duplicate courses being deleted. This ensures no historical data is lost.

## What This Migration Does

### 1. Safety Check
- Verifies no `rounds` records reference duplicate course names
- Aborts with error if historical data would be affected
- Only proceeds if safe to delete

### 2. Rename Canonical Courses
- `Armadillo` → `Armadillo Big`
- Prepares for deletion of `Flying Armadillo` (duplicate)

### 3. Add Missing Aliases
- Armadillo Big: "Flying Armadillo DGC - Big Course", "Flying Armadillo", "Armadillo"
- Armadillo Mini: "Flying Armadillo DGC - Gold mini", "Flying Armadillo DGC - Gold Mini"
- Sprinkle Valley: "Sprinkle"
- Old Settler's: "Old Settlers", "Old Settler\'s"

### 4. Delete Duplicate Courses
Removes these 11 duplicate entries:
- Liveoak
- Live Oak Brewing DGC
- Northotown
- Searight
- Met Center
- Roy G
- Roy G.
- Old Settlers
- Sprinkle
- Old Settler\'s
- Flying Armadillo

### 5. Verification
- Confirms exactly 20 courses remain
- Reports alias count
- Raises warning if course count ≠ 20

## Expected Results

**Courses table (20 canonical courses):**
1. Armadillo Big (renamed from Armadillo)
2. Armadillo Mini
3. Austin Ridge Bible Church
4. Bartholomew
5. Bible Ridge
6. Circle C
7. Flying Armadillo (DELETED)
8. Guerrero Park
9. Kerville
10. Live Oak
11. Mary Moore Searight
12. MetCenter
13. Mitch Park
14. Northtown Park
15. Old Settler's
16. Roy G Guerrero
17. Searight Park
18. Slaughter Creek
19. Southeast Metro
20. Sprinkle Valley
21. Wells Branch
22. Williamson County

**Aliases table (17+ aliases):**
- All scorecard variations map to the 20 canonical courses above
- Vision service can extract any variation, aliases handle the mapping

## How to Run

### Via Supabase SQL Editor (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `004_cleanup_duplicate_courses.sql`
3. Run the script
4. Check output:
   - Should see: "SAFETY CHECK PASSED"
   - Should see: "Migration complete! Total courses: 20"
   - If error occurs, migration aborts safely

### Verification After Running

```sql
-- Should return exactly 20 rows
SELECT course_name FROM courses ORDER BY course_name;

-- Should return 17+ aliases
SELECT * FROM course_aliases ORDER BY alias;

-- Should return 0 (no inactive courses)
SELECT COUNT(*) FROM courses WHERE active = false;

-- Test aliases work
SELECT * FROM find_course_by_name_or_alias('Flying Armadillo DGC - Big Course');
-- Should return: Armadillo Big

SELECT * FROM find_course_by_name_or_alias('Sprinkle');
-- Should return: Sprinkle Valley
```

## Rollback (If Needed)

**WARNING:** Rollback requires re-creating deleted courses manually.

```sql
-- Re-insert duplicate courses (you'll need to get IDs from backup)
INSERT INTO courses (course_name, tier, multiplier, active) VALUES
  ('Liveoak', 2, 1.5, false),
  ('Live Oak Brewing DGC', 2, 1.5, false),
  ('Northotown', 3, 2.0, false),
  ('Searight', 3, 2.0, false),
  ('Met Center', 3, 2.0, false),
  ('Roy G', 2, 1.5, false),
  ('Roy G.', 2, 1.5, false),
  ('Old Settlers', 3, 2.0, false),
  ('Sprinkle', 2, 1.5, false),
  ('Old Settler\''s', 3, 2.0, false),
  ('Flying Armadillo', 2, 1.5, false);

-- Rename Armadillo Big back to Armadillo
UPDATE courses SET course_name = 'Armadillo' WHERE course_name = 'Armadillo Big';

-- Remove aliases added in this migration
DELETE FROM course_aliases WHERE alias IN (
  'Flying Armadillo DGC - Big Course',
  'Flying Armadillo',
  'Armadillo',
  'Flying Armadillo DGC - Gold mini',
  'Flying Armadillo DGC - Gold Mini',
  'Sprinkle',
  'Old Settlers',
  'Old Settler\''s'
);
```

**Recommendation:** Export `courses` table before running migration as backup.

## Benefits

✅ **Clean schema** - `courses` table has exactly 20 courses (no filtering needed)
✅ **Simple queries** - `SELECT * FROM courses` returns the canonical list
✅ **No active flag logic** - All courses in table are "active"
✅ **Explicit source of truth** - 20 courses visible directly in table
✅ **Safer** - Migration aborts if historical data would be affected
✅ **Better maintainability** - Add new courses = INSERT, not UPDATE active flag

## Database Schema After Migration

```
courses (20 canonical courses)
  ├─ Armadillo Big (tier 2, 1.5x)
  ├─ Armadillo Mini (tier 1, 1.0x)
  ├─ Live Oak (tier 2, 1.5x)
  └─ ... (17 more)

course_aliases (17+ alternate names)
  ├─ "Flying Armadillo DGC - Big Course" → Armadillo Big
  ├─ "Flying Armadillo DGC - Gold mini" → Armadillo Mini
  ├─ "Liveoak" → Live Oak
  └─ ... (14+ more)
```

## Notes

- Migration is **idempotent** (safe to run multiple times due to ON CONFLICT clauses)
- Safety check prevents accidental data loss
- `active` column can be removed later (commented out in script)
- Frontend code unchanged - already filters with `WHERE active = true`
- Backend code unchanged - uses `find_course_by_name_or_alias()` function

## Post-Migration Cleanup (Optional)

After verifying migration succeeded, you can:

1. **Remove active column** (no longer needed):
   ```sql
   ALTER TABLE courses DROP COLUMN active;
   ```

2. **Update frontend queries** to remove `WHERE active = true` filter:
   ```javascript
   // Before:
   .eq('active', true)

   // After (remove the filter):
   // All courses in table are canonical, no filter needed
   ```

---

**Run this migration AFTER Migration 003** (course aliases system must exist first)
