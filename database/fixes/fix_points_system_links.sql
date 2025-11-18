-- Fix Points System Links
-- This script ensures events are linked to the correct points_systems by name

-- First, let's see what we have
SELECT 'Current points_systems:' as info;
SELECT id, name FROM points_systems ORDER BY id;

SELECT 'Current event links:' as info;
SELECT e.id, e.name, e.type, e.points_system_id, ps.name as points_system_name
FROM events e
LEFT JOIN points_systems ps ON e.points_system_id = ps.id
WHERE e.is_active = true;

-- Update event links based on current points_systems IDs
-- Link 2025 Season
UPDATE events
SET points_system_id = (SELECT id FROM points_systems WHERE name = 'Season 2025' LIMIT 1)
WHERE name = '2025' AND type = 'season';

-- Link Portlandia 2025 Tournament
UPDATE events
SET points_system_id = (SELECT id FROM points_systems WHERE name = 'Portlandia 2025' LIMIT 1)
WHERE name = 'Portlandia 2025' AND type = 'tournament';

-- Link Minneapolis (if it should use Portlandia scoring)
UPDATE events
SET points_system_id = (SELECT id FROM points_systems WHERE name = 'Portlandia 2025' LIMIT 1)
WHERE name = 'Minneapolis Disc Golf Classic 2024' AND type = 'tournament';

-- Verify the fix
SELECT 'After fix:' as info;
SELECT e.id, e.name, e.type, e.points_system_id, ps.name as points_system_name, ps.id as ps_id
FROM events e
LEFT JOIN points_systems ps ON e.points_system_id = ps.id
WHERE e.is_active = true;
