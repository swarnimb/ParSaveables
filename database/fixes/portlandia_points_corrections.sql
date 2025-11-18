-- Portlandia 2025 Points Corrections
-- Date: October 23, 2025
--
-- Corrections needed:
-- Round 1: Jaguar = 5 points, Intern Line Cook = 5 points
-- Round 3: Intern Line Cook = 16 points, Fireball = 18 points + 3 birdies, Ace Brook = 3 points

-- Step 1: Find Portlandia event and rounds
-- Run this first to identify round IDs
SELECT
    r.id as round_id,
    r.date,
    r.course_name,
    ROW_NUMBER() OVER (ORDER BY r.date) as round_number
FROM rounds r
JOIN events e ON r.event_id = e.id
WHERE e.name = 'Portlandia 2025'
ORDER BY r.date;

-- Step 2: View current points and stats for affected players
-- Run this to verify current values before updating
SELECT
    pr.player_name,
    r.date,
    r.course_name,
    ROW_NUMBER() OVER (ORDER BY r.date) as round_number,
    pr.final_total as current_points,
    pr.birdies,
    pr.eagles,
    pr.aces,
    pr.round_id
FROM player_rounds pr
JOIN rounds r ON pr.round_id = r.id
JOIN events e ON r.event_id = e.id
WHERE e.name = 'Portlandia 2025'
    AND pr.player_name IN ('Jaguar', 'Intern Line Cook', 'Fireball', 'Ace Brook')
ORDER BY r.date, pr.player_name;

-- Step 3: Update statements (replace round_id values after running Step 1)
--
-- INSTRUCTIONS:
-- 1. Run Step 1 query above to get round IDs for Round 1 and Round 3
-- 2. Replace 'ROUND_1_ID' with the actual round_id for Round 1
-- 3. Replace 'ROUND_3_ID' with the actual round_id for Round 3
-- 4. Run each UPDATE statement one at a time
-- 5. Run Step 2 query again to verify changes

-- Round 1 corrections
UPDATE player_rounds
SET final_total = 5
WHERE round_id = 'ROUND_1_ID'
    AND player_name = 'Jaguar';

UPDATE player_rounds
SET final_total = 5
WHERE round_id = 'ROUND_1_ID'
    AND player_name = 'Intern Line Cook';

-- Round 3 corrections
UPDATE player_rounds
SET final_total = 16
WHERE round_id = 'ROUND_3_ID'
    AND player_name = 'Intern Line Cook';

UPDATE player_rounds
SET final_total = 18,
    birdies = 3
WHERE round_id = 'ROUND_3_ID'
    AND player_name = 'Fireball';

UPDATE player_rounds
SET final_total = 3
WHERE round_id = 'ROUND_3_ID'
    AND player_name = 'Ace Brook';

-- Step 4: Verify all changes
SELECT
    pr.player_name,
    r.date,
    r.course_name,
    ROW_NUMBER() OVER (ORDER BY r.date) as round_number,
    pr.final_total as updated_points,
    pr.birdies,
    pr.eagles,
    pr.aces
FROM player_rounds pr
JOIN rounds r ON pr.round_id = r.id
JOIN events e ON r.event_id = e.id
WHERE e.name = 'Portlandia 2025'
    AND pr.player_name IN ('Jaguar', 'Intern Line Cook', 'Fireball', 'Ace Brook')
ORDER BY r.date, pr.player_name;
