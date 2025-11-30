-- Add most_birdies bonus to Minneapolis Disc Golf Classic 2024 points system
-- Date: 2025-01-30
-- Purpose: Fix missing most_birdies bonus field in performance_points

UPDATE points_systems
SET config = jsonb_set(
    config,
    '{performance_points,most_birdies}',
    '1'
)
WHERE name = 'Minneapolis Disc Golf Classic 2024';

-- Verify the update
SELECT id, name,
       config->'performance_points' as performance_points
FROM points_systems
WHERE name = 'Minneapolis Disc Golf Classic 2024';
