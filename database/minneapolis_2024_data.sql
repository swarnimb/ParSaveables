-- Minneapolis Disc Golf Classic 2024 - Complete Data Entry
-- Date: October 23, 2025
-- Data from provided tournament results table

-- ============================================================================
-- STEP 1: CREATE EVENT (using existing Portlandia points system for now)
-- ============================================================================
-- Note: Reusing Portlandia 2025 points system since we're entering final points directly

INSERT INTO events (name, type, year, start_date, end_date, points_system_id, is_active)
VALUES (
  'Minneapolis Disc Golf Classic 2024',
  'tournament',
  2024,
  '2024-08-01',  -- ADJUST: Replace with actual start date if known
  '2024-08-05',  -- ADJUST: Replace with actual end date if known
  (SELECT id FROM points_systems WHERE name = 'Portlandia 2025'),  -- Reusing existing tournament system
  true
);

-- Verify event created
SELECT * FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024';

-- ============================================================================
-- STEP 2: CREATE ROUNDS
-- ============================================================================

-- Round 1
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-08-01',  -- ADJUST: Replace with actual date
  'Minneapolis Course',  -- ADJUST: Replace with actual course name if known
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Round 2
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-08-02',  -- ADJUST: Replace with actual date
  'Minneapolis Course',  -- ADJUST: Replace with actual course name if known
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Round 3
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-08-03',  -- ADJUST: Replace with actual date
  'Minneapolis Course',  -- ADJUST: Replace with actual course name if known
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Round 4
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-08-04',  -- ADJUST: Replace with actual date
  'Minneapolis Course',  -- ADJUST: Replace with actual course name if known
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Round 5
INSERT INTO rounds (id, date, course_name, event_id, event_type, course_multiplier)
VALUES (
  gen_random_uuid(),
  '2024-08-05',  -- ADJUST: Replace with actual date
  'Minneapolis Course',  -- ADJUST: Replace with actual course name if known
  (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024'),
  'tournament',
  1.0
);

-- Get all round IDs for next step
SELECT
  r.id as round_id,
  r.date,
  r.course_name,
  ROW_NUMBER() OVER (ORDER BY r.date) as round_number
FROM rounds r
WHERE r.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY r.date;

-- ============================================================================
-- STEP 3: INSERT PLAYER DATA
-- ============================================================================
-- IMPORTANT: After running the query above, replace ROUND_X_ID with actual UUIDs

-- Get round IDs as variables (run this to get IDs, then replace below)
DO $$
DECLARE
  event_uuid UUID;
  round1_id UUID;
  round2_id UUID;
  round3_id UUID;
  round4_id UUID;
  round5_id UUID;
BEGIN
  -- Get event ID
  SELECT id INTO event_uuid FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024';

  -- Get round IDs in order
  SELECT id INTO round1_id FROM rounds WHERE event_id = event_uuid ORDER BY date OFFSET 0 LIMIT 1;
  SELECT id INTO round2_id FROM rounds WHERE event_id = event_uuid ORDER BY date OFFSET 1 LIMIT 1;
  SELECT id INTO round3_id FROM rounds WHERE event_id = event_uuid ORDER BY date OFFSET 2 LIMIT 1;
  SELECT id INTO round4_id FROM rounds WHERE event_id = event_uuid ORDER BY date OFFSET 3 LIMIT 1;
  SELECT id INTO round5_id FROM rounds WHERE event_id = event_uuid ORDER BY date OFFSET 4 LIMIT 1;

  -- ROUND 1 DATA
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id)
  VALUES
    (round1_id, 'Intern Line Cook', 1, 0, 0, 0, 5.0, event_uuid),
    (round1_id, 'Cobra', 2, 0, 0, 0, 4.0, event_uuid),
    (round1_id, 'Shogun', 3, 0, 0, 0, 3.0, event_uuid),
    (round1_id, 'Jabba the Putt', 4, 0, 0, 0, 2.0, event_uuid),
    (round1_id, 'Bird', 5, 0, 0, 0, 1.0, event_uuid),
    (round1_id, 'Fireball', 6, 0, 0, 0, 0.0, event_uuid),
    (round1_id, 'BigBirdie', 6, 0, 0, 0, 0.0, event_uuid),
    (round1_id, 'Butter Cookie', 6, 0, 0, 0, 0.0, event_uuid),
    (round1_id, 'Jaguar', 6, 0, 0, 0, 0.0, event_uuid);

  -- ROUND 2 DATA
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id)
  VALUES
    (round2_id, 'Intern Line Cook', 1, 0, 0, 0, 5.0, event_uuid),
    (round2_id, 'Shogun', 2, 0, 0, 0, 5.0, event_uuid),
    (round2_id, 'Cobra', 3, 0, 0, 0, 2.5, event_uuid),
    (round2_id, 'Butter Cookie', 3, 0, 0, 0, 2.5, event_uuid),
    (round2_id, 'Jabba the Putt', 5, 0, 0, 0, 1.0, event_uuid),
    (round2_id, 'Bird', 6, 0, 0, 0, 0.0, event_uuid),
    (round2_id, 'Fireball', 6, 0, 0, 0, 0.0, event_uuid),
    (round2_id, 'BigBirdie', 6, 0, 0, 0, 0.0, event_uuid),
    (round2_id, 'Jaguar', 6, 0, 0, 0, 0.0, event_uuid);

  -- ROUND 3 DATA
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id)
  VALUES
    (round3_id, 'Bird', 1, 0, 0, 0, 5.0, event_uuid),
    (round3_id, 'Intern Line Cook', 2, 0, 0, 0, 3.5, event_uuid),
    (round3_id, 'BigBirdie', 2, 0, 0, 0, 3.5, event_uuid),
    (round3_id, 'Shogun', 4, 0, 0, 0, 2.0, event_uuid),
    (round3_id, 'Fireball', 5, 0, 0, 0, 1.0, event_uuid),
    (round3_id, 'Jaguar', 5, 0, 0, 0, 1.0, event_uuid),
    (round3_id, 'Cobra', 7, 0, 0, 0, 0.0, event_uuid),
    (round3_id, 'Jabba the Putt', 7, 0, 0, 0, 0.0, event_uuid),
    (round3_id, 'Butter Cookie', 7, 0, 0, 0, 0.0, event_uuid);

  -- ROUND 4 DATA
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id)
  VALUES
    (round4_id, 'Bird', 1, 0, 0, 0, 5.0, event_uuid),
    (round4_id, 'Intern Line Cook', 2, 0, 0, 0, 4.0, event_uuid),
    (round4_id, 'Jabba the Putt', 3, 0, 0, 0, 3.0, event_uuid),
    (round4_id, 'Shogun', 4, 0, 0, 0, 2.0, event_uuid),
    (round4_id, 'Fireball', 5, 0, 0, 0, 1.0, event_uuid),
    (round4_id, 'Cobra', 6, 0, 0, 0, 0.0, event_uuid),
    (round4_id, 'BigBirdie', 6, 0, 0, 0, 0.0, event_uuid),
    (round4_id, 'Butter Cookie', 6, 0, 0, 0, 0.0, event_uuid),
    (round4_id, 'Jaguar', 6, 0, 0, 0, 0.0, event_uuid);

  -- ROUND 5 DATA
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id)
  VALUES
    (round5_id, 'Bird', 1, 0, 0, 0, 5.0, event_uuid),
    (round5_id, 'Butter Cookie', 2, 0, 0, 0, 4.0, event_uuid),
    (round5_id, 'Shogun', 3, 0, 0, 0, 2.5, event_uuid),
    (round5_id, 'Jabba the Putt', 3, 0, 0, 0, 2.5, event_uuid),
    (round5_id, 'Intern Line Cook', 5, 0, 0, 0, 1.0, event_uuid),
    (round5_id, 'Cobra', 5, 0, 0, 0, 1.0, event_uuid),
    (round5_id, 'Fireball', 7, 0, 0, 0, 0.0, event_uuid),
    (round5_id, 'BigBirdie', 7, 0, 0, 0, 0.0, event_uuid),
    (round5_id, 'Jaguar', 7, 0, 0, 0, 0.0, event_uuid);

  RAISE NOTICE 'All data inserted successfully!';
END $$;

-- ============================================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================================

-- View all rounds
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

-- View tournament leaderboard (should match the Total column)
SELECT
  pr.player_name,
  COUNT(DISTINCT pr.round_id) as rounds_played,
  SUM(pr.final_total) as total_points
FROM player_rounds pr
WHERE pr.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
GROUP BY pr.player_name
ORDER BY total_points DESC;

-- Expected totals to verify:
-- Intern Line Cook: 18.5
-- Bird: 16.0
-- Shogun: 14.5
-- Jabba the Putt: 8.5
-- Cobra: 7.5
-- Butter Cookie: 6.5
-- BigBirdie: 3.5
-- Fireball: 2.0
-- Jaguar: 1.0

-- View detailed round-by-round data
SELECT
  pr.player_name,
  r.date,
  ROW_NUMBER() OVER (PARTITION BY pr.player_name ORDER BY r.date) as round_number,
  pr.rank,
  pr.final_total
FROM player_rounds pr
JOIN rounds r ON pr.round_id = r.id
WHERE pr.event_id = (SELECT id FROM events WHERE name = 'Minneapolis Disc Golf Classic 2024')
ORDER BY pr.player_name, r.date;
