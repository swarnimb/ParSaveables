-- Clean up and reseed courses with correct 20 courses
-- First, delete all existing courses
DELETE FROM courses;

-- Tier 1: Beginner Courses (1.0x multiplier)
INSERT INTO courses (course_name, tier, multiplier, active) VALUES
  ('Wells Branch', 1, 1.0, true),
  ('Lil G', 1, 1.0, true),
  ('Armadillo Mini', 1, 1.0, true);

-- Tier 2: Intermediate Courses (1.5x multiplier)
INSERT INTO courses (course_name, tier, multiplier, active) VALUES
  ('Zilker Park', 2, 1.5, true),
  ('Live Oak', 2, 1.5, true),
  ('Bartholomew Park', 2, 1.5, true);

-- Tier 3: Advanced Courses (2.0x multiplier)
INSERT INTO courses (course_name, tier, multiplier, active) VALUES
  ('Northtown Park', 3, 2.0, true),
  ('Searight Park', 3, 2.0, true),
  ('MetCenter', 3, 2.0, true),
  ('Old Settler''s', 3, 2.0, true),
  ('Cat Hollow', 3, 2.0, true),
  ('Circle C', 3, 2.0, true),
  ('Frisbee Fling', 3, 2.0, true),
  ('Williamson County', 3, 2.0, true);

-- Tier 4: Expert Courses (2.5x multiplier)
INSERT INTO courses (course_name, tier, multiplier, active) VALUES
  ('East Metro', 4, 2.5, true),
  ('Sprinkle Valley', 4, 2.5, true),
  ('Roy G Guerrero', 4, 2.5, true),
  ('Bible Ridge', 4, 2.5, true),
  ('Flying Armadillo', 4, 2.5, true),
  ('Harvey Penick', 4, 2.5, true);

-- Verify
SELECT tier, COUNT(*) as course_count
FROM courses
WHERE active = true
GROUP BY tier
ORDER BY tier;

SELECT tier, course_name, multiplier
FROM courses
ORDER BY tier, course_name;
