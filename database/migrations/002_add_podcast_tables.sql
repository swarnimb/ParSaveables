-- Migration 002: Add Podcast Tables
-- Purpose: Support automated podcast generation for "Chain Reactions" podcast
-- Created: 2025-10-27

-- ============================================
-- Table: podcast_episodes
-- Stores metadata for published podcast episodes
-- ============================================

CREATE TABLE IF NOT EXISTS podcast_episodes (
  id SERIAL PRIMARY KEY,
  episode_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('season_recap', 'monthly_recap', 'tournament_special')),

  -- Date range covered by this episode
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Audio file details
  audio_url TEXT, -- GitHub release URL
  duration_seconds INTEGER, -- Length in seconds
  file_size_mb DECIMAL(5,2), -- File size in MB

  -- Related data
  event_ids INTEGER[], -- Array of event IDs covered in this episode
  total_rounds_covered INTEGER DEFAULT 0,

  -- Publishing
  published_at TIMESTAMP,
  is_published BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_podcast_episodes_published ON podcast_episodes(is_published, published_at DESC);
CREATE INDEX idx_podcast_episodes_period ON podcast_episodes(period_start, period_end);

-- ============================================
-- Table: podcast_scripts
-- Stores generated scripts before audio conversion
-- Allows for review/editing before finalizing
-- ============================================

CREATE TABLE IF NOT EXISTS podcast_scripts (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES podcast_episodes(id) ON DELETE CASCADE,

  -- Script content
  script_text TEXT NOT NULL,
  estimated_duration_minutes INTEGER,
  word_count INTEGER,

  -- Generation details
  generated_by TEXT DEFAULT 'claude-sonnet-4', -- AI model used
  prompt_used TEXT, -- Store prompt for reproducibility
  data_snapshot JSONB, -- Tournament/season data used

  -- Review status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'rejected')),
  reviewed_at TIMESTAMP,
  reviewed_by TEXT,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_podcast_scripts_episode ON podcast_scripts(episode_id);
CREATE INDEX idx_podcast_scripts_status ON podcast_scripts(status);

-- ============================================
-- Table: podcast_generation_logs
-- Tracks podcast generation attempts for debugging
-- ============================================

CREATE TABLE IF NOT EXISTS podcast_generation_logs (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES podcast_episodes(id) ON DELETE SET NULL,

  -- Generation stage
  stage TEXT NOT NULL CHECK (stage IN ('script_generation', 'audio_generation', 'upload', 'complete', 'failed')),

  -- Execution details
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,

  -- Status
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  error_details JSONB,

  -- Cost tracking (optional)
  api_costs JSONB, -- {"claude": 0.50, "tts": 0.00, "total": 0.50}

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_podcast_logs_episode ON podcast_generation_logs(episode_id);
CREATE INDEX idx_podcast_logs_stage ON podcast_generation_logs(stage, success);

-- ============================================
-- RLS Policies (Public Read Access)
-- ============================================

-- Enable RLS
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_generation_logs ENABLE ROW LEVEL SECURITY;

-- Public can read published episodes
CREATE POLICY "Allow public read of published episodes" ON podcast_episodes
  FOR SELECT USING (is_published = true);

-- Public can read approved scripts (for transparency)
CREATE POLICY "Allow public read of approved scripts" ON podcast_scripts
  FOR SELECT USING (status = 'approved');

-- Only service role can read logs (admin only)
-- No public policy = no public access

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for podcast_episodes
CREATE TRIGGER update_podcast_episodes_updated_at
BEFORE UPDATE ON podcast_episodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for podcast_scripts
CREATE TRIGGER update_podcast_scripts_updated_at
BEFORE UPDATE ON podcast_scripts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data / Initial Seed (Optional)
-- ============================================

-- Add first episode placeholder for 2025 season recap
INSERT INTO podcast_episodes (
  episode_number,
  title,
  description,
  type,
  period_start,
  period_end,
  total_rounds_covered
) VALUES (
  1,
  'Chain Reactions Episode 1: The 2025 Season Spectacular',
  'A thrilling recap of the 2025 ParSaveables season including Portlandia and Minneapolis tournaments, plus a sneak peek at the 2026 season!',
  'season_recap',
  '2025-01-01',
  '2025-12-31',
  0  -- Will be updated when generated
) ON CONFLICT (episode_number) DO NOTHING;

-- ============================================
-- Rollback Instructions
-- ============================================

/*
To rollback this migration:

DROP TRIGGER IF EXISTS update_podcast_episodes_updated_at ON podcast_episodes;
DROP TRIGGER IF EXISTS update_podcast_scripts_updated_at ON podcast_scripts;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS podcast_generation_logs CASCADE;
DROP TABLE IF EXISTS podcast_scripts CASCADE;
DROP TABLE IF EXISTS podcast_episodes CASCADE;
*/

-- Migration complete
COMMENT ON TABLE podcast_episodes IS 'Chain Reactions podcast episode metadata';
COMMENT ON TABLE podcast_scripts IS 'Generated podcast scripts for review';
COMMENT ON TABLE podcast_generation_logs IS 'Podcast generation execution logs';
