-- Migration 004a: Fix Rounds References Before Cleanup
-- Purpose: Update rounds to reference canonical course names
-- Date: 2025-01-22
-- Run BEFORE 004_cleanup_duplicate_courses.sql

-- ============================================================================
-- Step 1: Show which rounds will be updated (for review)
-- ============================================================================

SELECT
  id,
  course_name,
  date,
  CASE
    WHEN course_name = 'Liveoak' THEN 'Live Oak'
    WHEN course_name = 'Live Oak Brewing DGC' THEN 'Live Oak'
    WHEN course_name = 'Northotown' THEN 'Northtown Park'
    WHEN course_name = 'Searight' THEN 'Searight Park'
    WHEN course_name = 'Met Center' THEN 'MetCenter'
    WHEN course_name = 'Roy G' THEN 'Roy G Guerrero'
    WHEN course_name = 'Roy G.' THEN 'Roy G Guerrero'
    WHEN course_name = 'Old Settlers' THEN 'Old Settler''s'
    WHEN course_name = 'Sprinkle' THEN 'Sprinkle Valley'
    WHEN course_name = 'Old Settler\''s' THEN 'Old Settler''s'
    WHEN course_name = 'Flying Armadillo' THEN 'Armadillo Big'
    WHEN course_name = 'Armadillo' THEN 'Armadillo Big'
  END AS new_course_name
FROM rounds
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
  'Flying Armadillo',
  'Armadillo'
)
ORDER BY date DESC;

-- ============================================================================
-- Step 2: Update rounds to use canonical course names
-- ============================================================================

-- Live Oak variations → Live Oak
UPDATE rounds
SET course_name = 'Live Oak'
WHERE course_name IN ('Liveoak', 'Live Oak Brewing DGC');

-- Northtown Park variations → Northtown Park
UPDATE rounds
SET course_name = 'Northtown Park'
WHERE course_name = 'Northotown';

-- Searight Park variations → Searight Park
UPDATE rounds
SET course_name = 'Searight Park'
WHERE course_name = 'Searight';

-- MetCenter variations → MetCenter
UPDATE rounds
SET course_name = 'MetCenter'
WHERE course_name = 'Met Center';

-- Roy G Guerrero variations → Roy G Guerrero
UPDATE rounds
SET course_name = 'Roy G Guerrero'
WHERE course_name IN ('Roy G', 'Roy G.');

-- Old Settler's variations → Old Settler's
UPDATE rounds
SET course_name = 'Old Settler''s'
WHERE course_name IN ('Old Settlers', 'Old Settler\''s');

-- Sprinkle Valley variations → Sprinkle Valley
UPDATE rounds
SET course_name = 'Sprinkle Valley'
WHERE course_name = 'Sprinkle';

-- Armadillo variations → Armadillo Big
-- Note: This runs BEFORE we rename 'Armadillo' to 'Armadillo Big' in courses table
UPDATE rounds
SET course_name = 'Armadillo Big'
WHERE course_name IN ('Flying Armadillo', 'Armadillo');

-- ============================================================================
-- Step 3: Verification
-- ============================================================================

DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count remaining rounds with duplicate course names
  SELECT COUNT(*) INTO duplicate_count
  FROM rounds
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
    'Flying Armadillo',
    'Armadillo'
  );

  IF duplicate_count > 0 THEN
    RAISE WARNING 'Still found % rounds with duplicate course names', duplicate_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All rounds updated to canonical course names';
  END IF;

  -- Show updated distribution
  RAISE NOTICE '--- Rounds by course after update ---';
END $$;

-- Show course distribution after update
SELECT
  course_name,
  COUNT(*) as round_count
FROM rounds
GROUP BY course_name
ORDER BY course_name;
