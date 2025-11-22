-- Migration 004: Clean Up Duplicate Courses
-- Purpose: Delete duplicate course entries, keep only 20 canonical courses
-- Date: 2025-01-22
-- IMPORTANT: Run 004a_fix_rounds_before_cleanup.sql FIRST to update rounds table

-- ============================================================================
-- SAFETY CHECK: Verify no rounds reference duplicate courses
-- ============================================================================

-- This check ensures 004a was run first
DO $$
DECLARE
  duplicate_courses TEXT[] := ARRAY[
    'Liveoak',
    'Live Oak Brewing DGC',
    'Northotown',
    'Searight',
    'Met Center',
    'Roy G',
    'Roy G.',
    'Old Settlers',
    'Sprinkle',
    'Old Settler\''s',
    'Flying Armadillo',
    'Armadillo'  -- Will become 'Armadillo Big'
  ];
  round_count INTEGER;
BEGIN
  -- Check if rounds table stores course_name (not course_id FK)
  SELECT COUNT(*) INTO round_count
  FROM rounds
  WHERE course_name = ANY(duplicate_courses);

  IF round_count > 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Found % rounds referencing duplicate courses. Run 004a_fix_rounds_before_cleanup.sql first!', round_count;
  END IF;

  RAISE NOTICE 'SAFETY CHECK PASSED: No rounds reference duplicate courses';
END $$;

-- ============================================================================
-- Step 1: Rename canonical courses
-- ============================================================================

-- Rename 'Armadillo' to 'Armadillo Big'
UPDATE courses
SET course_name = 'Armadillo Big'
WHERE course_name = 'Armadillo';

-- ============================================================================
-- Step 2: Add all aliases BEFORE deleting duplicates
-- ============================================================================

-- Armadillo Big aliases
INSERT INTO course_aliases (alias, course_id)
SELECT 'Flying Armadillo DGC - Big Course', id FROM courses WHERE course_name = 'Armadillo Big'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO course_aliases (alias, course_id)
SELECT 'Flying Armadillo', id FROM courses WHERE course_name = 'Armadillo Big'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO course_aliases (alias, course_id)
SELECT 'Armadillo', id FROM courses WHERE course_name = 'Armadillo Big'
ON CONFLICT (alias) DO NOTHING;

-- Armadillo Mini aliases
INSERT INTO course_aliases (alias, course_id)
SELECT 'Flying Armadillo DGC - Gold mini', id FROM courses WHERE course_name = 'Armadillo Mini'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO course_aliases (alias, course_id)
SELECT 'Flying Armadillo DGC - Gold Mini', id FROM courses WHERE course_name = 'Armadillo Mini'
ON CONFLICT (alias) DO NOTHING;

-- Sprinkle Valley aliases
INSERT INTO course_aliases (alias, course_id)
SELECT 'Sprinkle', id FROM courses WHERE course_name = 'Sprinkle Valley'
ON CONFLICT (alias) DO NOTHING;

-- Old Settler's aliases
INSERT INTO course_aliases (alias, course_id)
SELECT 'Old Settlers', id FROM courses WHERE course_name = 'Old Settler''s'
ON CONFLICT (alias) DO NOTHING;

INSERT INTO course_aliases (alias, course_id)
SELECT 'Old Settler\''s', id FROM courses WHERE course_name = 'Old Settler''s'
ON CONFLICT (alias) DO NOTHING;

-- ============================================================================
-- Step 3: DELETE duplicate courses (not just mark inactive)
-- ============================================================================

-- Delete all duplicate course entries
-- course_aliases will remain via ON DELETE CASCADE protection won't apply
-- since we're deleting courses that have NO aliases pointing to them

DELETE FROM courses
WHERE course_name IN (
  'Liveoak',
  'Live Oak Brewing DGC',
  'Northotown',
  'Searight',
  'Met Center',
  'Roy G',
  'Roy G.',
  'Old Settlers',
  'Sprinkle',
  'Old Settler\''s',
  'Flying Armadillo'
);

-- ============================================================================
-- Step 4: Remove 'active' column (no longer needed)
-- ============================================================================

-- Now that we only have canonical courses, the 'active' flag is redundant
-- Comment out for now - can run later if desired
-- ALTER TABLE courses DROP COLUMN IF EXISTS active;

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
DECLARE
  course_count INTEGER;
  alias_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO course_count FROM courses;
  SELECT COUNT(*) INTO alias_count FROM course_aliases;

  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'Total courses: %', course_count;
  RAISE NOTICE 'Total aliases: %', alias_count;

  IF course_count != 20 THEN
    RAISE WARNING 'Expected 20 courses, found %', course_count;
  END IF;
END $$;
