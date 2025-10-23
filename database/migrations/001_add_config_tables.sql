-- Migration 001: Add Configuration Tables
-- Purpose: Extract hardcoded configuration to database
-- Date: 2025-10-23
-- Author: ParSaveables Refactoring

-- ============================================================================
-- 1. CREATE POINTS_SYSTEMS TABLE
-- ============================================================================
-- Stores all points configurations for seasons and tournaments
-- Config stored as JSONB for flexibility

CREATE TABLE IF NOT EXISTS points_systems (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  config JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE points_systems IS 'Configuration for different scoring systems (seasons, tournaments)';
COMMENT ON COLUMN points_systems.config IS 'JSON structure: {rank_points, performance_points, tie_breaking, course_multiplier}';

-- ============================================================================
-- 2. CREATE COURSES TABLE
-- ============================================================================
-- Stores course difficulty tiers and multipliers

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_name TEXT UNIQUE NOT NULL,
  tier INTEGER CHECK (tier IN (1, 2, 3, 4)),
  multiplier DECIMAL(3,2) NOT NULL CHECK (multiplier >= 1.0 AND multiplier <= 5.0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE courses IS 'Disc golf courses with difficulty tiers and score multipliers';
COMMENT ON COLUMN courses.tier IS 'Difficulty tier: 1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert';
COMMENT ON COLUMN courses.multiplier IS 'Score multiplier based on course difficulty (1.0-5.0)';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(active);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(course_name);

-- ============================================================================
-- 3. UPDATE EVENTS TABLE
-- ============================================================================
-- Link events to points_systems table

ALTER TABLE events
ADD COLUMN IF NOT EXISTS points_system_id INTEGER REFERENCES points_systems(id);

COMMENT ON COLUMN events.points_system_id IS 'Foreign key to points_systems table';

-- Create index for faster joins
CREATE INDEX IF NOT EXISTS idx_events_points_system ON events(points_system_id);

-- ============================================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================
-- Auto-update updated_at timestamp on changes

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_points_systems_updated_at BEFORE UPDATE ON points_systems
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT 'points_systems' as table_name, COUNT(*) as row_count FROM points_systems
UNION ALL
SELECT 'courses', COUNT(*) FROM courses;

-- Verify foreign key
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'events' AND column_name = 'points_system_id';

-- Display schema
\d points_systems
\d courses
\d events
