-- Update events table to populate players column (JSONB) with player names from player_rounds

-- For event_id = 6
UPDATE events
SET players = (
  SELECT jsonb_agg(DISTINCT player_name ORDER BY player_name)
  FROM player_rounds
  WHERE event_id = 6
)
WHERE id = 6;

-- For event_id = 8
UPDATE events
SET players = (
  SELECT jsonb_agg(DISTINCT player_name ORDER BY player_name)
  FROM player_rounds
  WHERE event_id = 8
)
WHERE id = 8;

-- Verify results
SELECT id, name, type, players
FROM events
ORDER BY id;
