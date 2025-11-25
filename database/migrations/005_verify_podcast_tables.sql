-- Migration 005: Verify Podcast Tables Exist
-- Purpose: Ensure migration 002 was run in production
-- Created: 2025-11-25

-- Check if tables exist, if not create them
-- This is idempotent - safe to run multiple times

-- ============================================
-- Verify podcast_episodes table
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'podcast_episodes') THEN
        RAISE NOTICE 'Creating podcast_episodes table...';

        CREATE TABLE podcast_episodes (
          id SERIAL PRIMARY KEY,
          episode_number INTEGER NOT NULL UNIQUE,
          title TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL CHECK (type IN ('season_recap', 'monthly_recap', 'tournament_special')),
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          audio_url TEXT,
          duration_seconds INTEGER,
          file_size_mb DECIMAL(5,2),
          event_ids INTEGER[],
          total_rounds_covered INTEGER DEFAULT 0,
          published_at TIMESTAMP,
          is_published BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX idx_podcast_episodes_published ON podcast_episodes(is_published, published_at DESC);
        CREATE INDEX idx_podcast_episodes_period ON podcast_episodes(period_start, period_end);

        -- Enable RLS
        ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;

        -- Public can read published episodes
        CREATE POLICY "Allow public read of published episodes" ON podcast_episodes
          FOR SELECT USING (is_published = true);

        RAISE NOTICE 'podcast_episodes table created successfully';
    ELSE
        RAISE NOTICE 'podcast_episodes table already exists';
    END IF;
END $$;

-- ============================================
-- Verify podcast_scripts table
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'podcast_scripts') THEN
        RAISE NOTICE 'Creating podcast_scripts table...';

        CREATE TABLE podcast_scripts (
          id SERIAL PRIMARY KEY,
          episode_id INTEGER REFERENCES podcast_episodes(id) ON DELETE CASCADE,
          script_text TEXT NOT NULL,
          estimated_duration_minutes INTEGER,
          word_count INTEGER,
          generated_by TEXT DEFAULT 'claude-sonnet-4',
          prompt_used TEXT,
          data_snapshot JSONB,
          status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'approved', 'rejected')),
          reviewed_at TIMESTAMP,
          reviewed_by TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX idx_podcast_scripts_episode ON podcast_scripts(episode_id);
        CREATE INDEX idx_podcast_scripts_status ON podcast_scripts(status);

        ALTER TABLE podcast_scripts ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Allow public read of approved scripts" ON podcast_scripts
          FOR SELECT USING (status = 'approved');

        RAISE NOTICE 'podcast_scripts table created successfully';
    ELSE
        RAISE NOTICE 'podcast_scripts table already exists';
    END IF;
END $$;

-- ============================================
-- Verify podcast_generation_logs table
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'podcast_generation_logs') THEN
        RAISE NOTICE 'Creating podcast_generation_logs table...';

        CREATE TABLE podcast_generation_logs (
          id SERIAL PRIMARY KEY,
          episode_id INTEGER REFERENCES podcast_episodes(id) ON DELETE SET NULL,
          stage TEXT NOT NULL CHECK (stage IN ('script_generation', 'audio_generation', 'upload', 'complete', 'failed')),
          started_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP,
          duration_seconds INTEGER,
          success BOOLEAN DEFAULT false,
          error_message TEXT,
          error_details JSONB,
          api_costs JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX idx_podcast_logs_episode ON podcast_generation_logs(episode_id);
        CREATE INDEX idx_podcast_logs_stage ON podcast_generation_logs(stage, success);

        ALTER TABLE podcast_generation_logs ENABLE ROW LEVEL SECURITY;

        RAISE NOTICE 'podcast_generation_logs table created successfully';
    ELSE
        RAISE NOTICE 'podcast_generation_logs table already exists';
    END IF;
END $$;

-- ============================================
-- Verify triggers exist
-- ============================================

DO $$
BEGIN
    -- Check if update_updated_at_column function exists
    IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        RAISE NOTICE 'Created update_updated_at_column function';
    END IF;

    -- Check and create trigger for podcast_episodes
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_podcast_episodes_updated_at') THEN
        CREATE TRIGGER update_podcast_episodes_updated_at
        BEFORE UPDATE ON podcast_episodes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created trigger for podcast_episodes';
    END IF;

    -- Check and create trigger for podcast_scripts
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_podcast_scripts_updated_at') THEN
        CREATE TRIGGER update_podcast_scripts_updated_at
        BEFORE UPDATE ON podcast_scripts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'Created trigger for podcast_scripts';
    END IF;
END $$;

-- Migration complete
SELECT 'Migration 005 complete - Podcast tables verified' AS status;
