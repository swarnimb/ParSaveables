-- Add Minneapolis Disc Golf Classic 2024 Tournament
-- Date: October 23, 2025
-- Purpose: Create tournament event and add rounds/player data

-- ============================================================================
-- STEP 1: CREATE POINTS SYSTEM FOR TOURNAMENT
-- ============================================================================
-- Define the scoring rules for Minneapolis Disc Golf Classic 2024
-- Adjust the rank_points and performance_points as needed

INSERT INTO points_systems (name, config, description) VALUES (
  'Minneapolis Disc Golf Classic 2024',
  '{
    "rank_points": {
      "1": 15,
      "2": 12,
      "3": 9,
      "4": 7,
      "5": 6,
      "6": 5,
      "7": 3,
      "default": 0
    },
    "performance_points": {
      "birdie": 1,
      "eagle": 5,
      "ace": 10
    },
    "tie_breaking": {
      "enabled": true,
      "method": "average"
    },
    "course_multiplier": {
      "enabled": false,
      "override": 1.0
    }
  }',
  'Tournament scoring system for Minneapolis Disc Golf Classic 2024'
);

-- Verify points system created
SELECT * FROM points_systems WHERE name = 'Minneapolis Disc Golf Classic 2024';

-- ============================================================================
-- STEP 2: CREATE EVENT
-- ============================================================================
-- Create the tournament event
-- ADJUST: start_date and end_date to match actual tournament dates

INSERT INTO events (name, type, year, start_date, end_date, points_system_id, is_active) VALUES (
  'Minneapolis Disc Golf Classic 2024',
  'tournament',
  2024,
  '2024-XX-XX',  -- REPLACE with actual start date (format: 'YYYY-MM-DD')
  '2024-XX-XX',  -- REPLACE with actual end date (format: 'YYYY-MM-DD')
  (SELECT id FROM points_systems WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  true
);

-- Verify event created
SELECT * FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024';

-- ============================================================================
-- STEP 3: ADD ROUNDS
-- ============================================================================
-- Add individual rounds for the tournament
-- ADJUST: date, course_name for each round
-- course_multiplier should be 1.0 for tournaments (no multiplier)

-- Round 1
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-XX-XX',  -- REPLACE with round 1 date
  'Course Name Here',  -- REPLACE with actual course name
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Round 2 (add more rounds as needed)
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-XX-XX',  -- REPLACE with round 2 date
  'Course Name Here',  -- REPLACE with actual course name
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Round 3 (optional - add if tournament had 3+ rounds)
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-XX-XX',  -- REPLACE with round 3 date
  'Course Name Here',  -- REPLACE with actual course name
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Verify rounds created
SELECT
  r.id as round_id,
  r.date,
  r.course_name,
  ROW_NUMBER() OVER (ORDER BY r.date) as round_number
FROM rounds r
WHERE r.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY r.date;

-- ============================================================================
-- STEP 4: ADD PLAYER ROUND DATA
-- ============================================================================
-- Add player performance data for each round
-- TEMPLATE: Copy this template for each player in each round

-- ROUND 1 PLAYERS
-- Get Round 1 ID first
SELECT id, date, course_name
FROM rounds
WHERE event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY date
LIMIT 1;

-- Player 1 - Round 1
INSERT INTO player_rounds (
  round_id,
  player_name,
  rank,
  aces,
  eagles,
  birdies,
  final_total,
  event_id
) VALUES (
  'ROUND_1_ID',  -- REPLACE with actual round_id from query above
  'Player Name',  -- REPLACE with actual player name
  1,  -- REPLACE with actual rank
  0,  -- REPLACE with actual aces count
  0,  -- REPLACE with actual eagles count
  5,  -- REPLACE with actual birdies count
  20.0,  -- REPLACE with actual final_total points
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
);

-- Player 2 - Round 1
INSERT INTO player_rounds (
  round_id,
  player_name,
  rank,
  aces,
  eagles,
  birdies,
  final_total,
  event_id
) VALUES (
  'ROUND_1_ID',  -- REPLACE with actual round_id
  'Player Name',  -- REPLACE with actual player name
  2,  -- REPLACE with actual rank
  0,  -- REPLACE with actual aces count
  0,  -- REPLACE with actual eagles count
  3,  -- REPLACE with actual birdies count
  15.0,  -- REPLACE with actual final_total points
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
);

-- ROUND 2 PLAYERS (repeat pattern for Round 2)
-- Get Round 2 ID first
SELECT id, date, course_name
FROM rounds
WHERE event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY date
OFFSET 1 LIMIT 1;

-- Player 1 - Round 2
INSERT INTO player_rounds (
  round_id,
  player_name,
  rank,
  aces,
  eagles,
  birdies,
  final_total,
  event_id
) VALUES (
  'ROUND_2_ID',  -- REPLACE with actual round_id
  'Player Name',  -- REPLACE with actual player name
  1,  -- REPLACE with actual rank
  0,  -- REPLACE with actual aces count
  0,  -- REPLACE with actual eagles count
  4,  -- REPLACE with actual birdies count
  18.0,  -- REPLACE with actual final_total points
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
);

-- Continue this pattern for all players in all rounds...

-- ============================================================================
-- STEP 5: VERIFICATION QUERIES
-- ============================================================================

-- View all rounds for the tournament
SELECT
  r.id as round_id,
  r.date,
  r.course_name,
  ROW_NUMBER() OVER (ORDER BY r.date) as round_number,
  COUNT(pr.id) as player_count
FROM rounds r
LEFT JOIN player_rounds pr ON r.id = pr.round_id
WHERE r.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
GROUP BY r.id, r.date, r.course_name
ORDER BY r.date;

-- View all player data for the tournament
SELECT
  pr.player_name,
  r.date,
  r.course_name,
  ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY pr.rank) as round_number,
  pr.rank,
  pr.aces,
  pr.eagles,
  pr.birdies,
  pr.final_total
FROM player_rounds pr
JOIN rounds r ON pr.round_id = r.id
WHERE pr.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY r.date, pr.rank;

-- View tournament leaderboard (total points across all rounds)
SELECT
  pr.player_name,
  COUNT(DISTINCT pr.round_id) as rounds_played,
  SUM(pr.final_total) as total_points,
  SUM(pr.aces) as total_aces,
  SUM(pr.eagles) as total_eagles,
  SUM(pr.birdies) as total_birdies
FROM player_rounds pr
WHERE pr.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
GROUP BY pr.player_name
ORDER BY total_points DESC;

-- ============================================================================
-- HELPFUL BULK INSERT TEMPLATE (OPTIONAL)
-- ============================================================================
-- If you have multiple players to add at once, use this pattern:

/*
-- Get round ID first
SELECT id FROM rounds
WHERE event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY date OFFSET 0 LIMIT 1;

-- Bulk insert for Round 1
INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id)
VALUES
  ('ROUND_1_ID', 'Player 1', 1, 0, 0, 5, 20.0, (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')),
  ('ROUND_1_ID', 'Player 2', 2, 0, 0, 4, 18.0, (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')),
  ('ROUND_1_ID', 'Player 3', 3, 0, 1, 3, 17.0, (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')),
  ('ROUND_1_ID', 'Player 4', 4, 0, 0, 2, 10.0, (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'));
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Replace all 'REPLACE' placeholders with actual values
-- 2. Tournament dates should fall within start_date and end_date of event
-- 3. course_multiplier is always 1.0 for tournaments
-- 4. final_total = (rank_points + performance_points) × 1.0
-- 5. Use registered player names that match your REGISTERED_PLAYERS list
-- 6. Ranks should be sequential (1, 2, 3, 4...) for each round
-- 7. Run verification queries after each step to confirm data is correct
