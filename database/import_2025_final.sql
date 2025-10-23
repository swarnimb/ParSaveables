-- Complete Import for 2025 Season - All 36 Rounds
-- Only players who actually played (points > 0) are included

DO $$
DECLARE
  v_event_id BIGINT;
  v_round_id UUID;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE name = '2025' AND type = 'season' LIMIT 1;
  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'Event not found';
  END IF;

  -- Round 1: 1/5/2025 - Lil G (x1)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Lil G', '2025-01-05', v_event_id, 'season', 1)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 3, 11.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 3, 11.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 3, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 2, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 2, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 2.0, v_event_id, true);

  -- Round 2: 1/5/2025 - Roy G (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Roy G', '2025-01-05', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 2, 30.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 2, 0, 0, 3, 25.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 3, 0, 0, 1, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 5.0, v_event_id, true);

  -- Round 3: 1/11/2025 - Cat hollow (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Cat hollow', '2025-01-11', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 0, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 2, 0, 0, 2, 18.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 3, 0, 0, 2, 14.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 4.0, v_event_id, true);

  -- Round 4: 1/18/2025 - Searight (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Searight', '2025-01-18', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 5, 30.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 2, 0, 0, 3, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 3, 0, 0, 2, 14.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 4.0, v_event_id, true);

  -- Round 5: 1/18/2025 - Circle C (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Circle C', '2025-01-18', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 1, 0, 0, 2, 24.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 4, 0, 0, 3, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 2, 0, 0, 1, 16.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 3, 0, 0, 1, 12.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 4.0, v_event_id, true);

  -- Round 6: 1/26/2025 - Sprinkle (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Sprinkle', '2025-01-26', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 1, 27.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 2, 0, 0, 0, 17.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 3, 0, 0, 0, 12.5, v_event_id, true);

  -- Round 7: 2/1/2025 - Armadillo Mini (x1)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Armadillo Mini', '2025-02-01', v_event_id, 'season', 1)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 1, 0, 0, 12.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 0, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 0, 2.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 0, 2.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 0, 2.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 2.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 3, 0, 0, 0, 5.0, v_event_id, true);

  -- Round 8: 2/1/2025 - Armadillo (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Armadillo', '2025-02-01', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 3, 25.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 4, 35.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 2, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 3, 0, 0, 3, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 2, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 1, 7.5, v_event_id, true);

  -- Round 9: 2/8/2025 - Zilker (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Zilker', '2025-02-08', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 2, 18.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 2, 0, 0, 2, 13.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 3, 0, 0, 1, 9.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 1, 4.5, v_event_id, true);

  -- Round 10: 2/23/2025 - Bartholomew (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Bartholomew', '2025-02-23', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 4, 0, 0, 1, 4.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 3, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 4, 21.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 1, 4.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 3, 0, 0, 2, 10.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 3.0, v_event_id, true);

  -- Round 11: 2/23/2025 - Live Oak (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Live Oak', '2025-02-23', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 3, 0, 0, 2, 10.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 3, 19.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 2, 0, 0, 3, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 2, 6.0, v_event_id, true);

  -- Round 12: 3/1/2025 - Searight (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Searight', '2025-03-01', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 4, 28.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 2, 0, 0, 3, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 3, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 3, 0, 0, 4, 18.0, v_event_id, true);

  -- Round 13: 3/7/2025 - Roy G (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Roy G', '2025-03-07', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 2, 0, 0, 0, 17.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 3, 0, 0, 2, 17.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 1, 0, 0, 1, 27.5, v_event_id, true);

  -- Round 14: 3/8/2025 - Met Center (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Met Center', '2025-03-08', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 7, 34.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 3, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 3, 0, 0, 4, 18.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 2, 0, 0, 3, 20.0, v_event_id, true);

  -- Round 15: 3/14/2025 - Live Oak (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Live Oak', '2025-03-14', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 3, 0, 0, 2, 10.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 3, 19.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 4, 0, 0, 1, 4.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 2, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 1, 4.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 2, 0, 0, 4, 16.5, v_event_id, true);

  -- Round 16: 3/16/2025 - Roy G (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Roy G', '2025-03-16', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 0, 25.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 3, 0, 0, 0, 25.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 2, 0, 0, 0, 17.5, v_event_id, true);

  -- Round 17: 3/16/2025 - Lil G (x1)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Lil G', '2025-03-16', v_event_id, 'season', 1)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 4, 0, 0, 1, 3.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 1, 3.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 3, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 1, 0, 0, 1, 11.0, v_event_id, true);

  -- Round 18: 3/20/2025 - Harvey Penick (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Harvey Penick', '2025-03-20', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 3, 0, 0, 0, 12.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 1, 27.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 2, 0, 0, 1, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 1, 7.5, v_event_id, true);

  -- Round 19: 3/22/2025 - Cat Hollow (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Cat Hollow', '2025-03-22', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 2, 24.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 2, 0, 0, 1, 16.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 1, 6.0, v_event_id, true);

  -- Round 20: 4/13/2025 - Frisbee Fling (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Frisbee Fling', '2025-04-13', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 2, 18.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 3, 0, 0, 0, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 3, 26.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 3, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 1, 6.0, v_event_id, true);

  -- Round 21: 4/13/2025 - Zilker Park (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Zilker Park', '2025-04-13', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 3, 0, 0, 1, 9.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 4, 0, 0, 1, 4.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 3, 19.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 0, 3.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 2, 0, 0, 1, 12.0, v_event_id, true);

  -- Round 22: 5/17/2025 - Zilker Park (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Zilker Park', '2025-05-17', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 3, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 2, 0, 0, 2, 13.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 0, 3.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 1, 0, 0, 4, 21.0, v_event_id, true);

  -- Round 23: 5/30/2025 - Live Oak (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Live Oak', '2025-05-30', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 3, 0, 0, 1, 9.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 3, 7.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 2, 0, 0, 1, 12.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 1, 0, 0, 5, 22.5, v_event_id, true);

  -- Round 24: 5/31/2025 - Northotown (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Northotown', '2025-05-31', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 3, 0, 0, 0, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 1, 2, 24.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 5, 30.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 3, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 4, 0, 0, 0, 4.0, v_event_id, true);

  -- Round 25: 6/6/2025 - Liveoak (x1.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Liveoak', '2025-06-06', v_event_id, 'season', 1.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 2, 0, 0, 4, 16.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 3, 19.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 3, 0, 0, 3, 12.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 4, 0, 0, 4, 9.0, v_event_id, true);

  -- Round 26: 6/22/2025 - Sprinkle Valley (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Sprinkle Valley', '2025-06-22', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 2, 22.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 1, 27.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 1, 7.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 3, 0, 0, 2, 17.5, v_event_id, true);

  -- Round 27: 7/12/2025 - Circle C (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Circle C', '2025-07-12', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 4, 22.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 3, 26.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 3, 0, 0, 3, 16.0, v_event_id, true);

  -- Round 28: 7/19/2025 - Lil G (x1)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Lil G', '2025-07-19', v_event_id, 'season', 1)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 3, 13.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 2, 0, 0, 4, 11.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 3, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 1, 3.0, v_event_id, true);

  -- Round 29: 7/19/2025 - Lil G (x1)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Lil G', '2025-07-19', v_event_id, 'season', 1)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 3, 0, 0, 2, 7.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 5, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 2, 0, 0, 3, 10.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 1, 3.0, v_event_id, true);

  -- Round 30: 8/2/2025 - Searight (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Searight', '2025-08-02', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 1, 0, 0, 4, 28.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 2, 0, 0, 2, 18.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 3, 0, 0, 1, 12.0, v_event_id, true);

  -- Round 31: 8/9/2025 - Roy G (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Roy G', '2025-08-09', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 2, 0, 0, 2, 22.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 3, 0, 0, 1, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 1, 7.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 4, 0, 0, 0, 5.0, v_event_id, true);

  -- Round 32: 8/16/2025 - Sprinkle Valley (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Sprinkle Valley', '2025-08-16', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 1, 27.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 3, 0, 0, 2, 17.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 2, 0, 0, 1, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 4, 0, 0, 1, 7.5, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Ace Brook', 4, 0, 0, 0, 5.0, v_event_id, true);

  -- Round 33: 9/1/2025 - Williamson County (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Williamson County', '2025-09-01', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 1, 16.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 1, 0, 0, 2, 24.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 1, 6.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 3, 0, 0, 2, 14.0, v_event_id, true);

  -- Round 34: 9/12/2025 - Searight (x2)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Searight', '2025-09-12', v_event_id, 'season', 2)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Intern Line Cook', 3, 0, 0, 2, 14.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 2, 0, 0, 3, 20.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 2, 8.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 4, 0, 0, 0, 4.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 1, 0, 0, 3, 26.0, v_event_id, true);

  -- Round 35: 4/6/2025 - Sprinkle (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Sprinkle', '2025-04-06', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 4, 0, 0, 0, 5.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Cobra', 3, 0, 0, 0, 25.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Butter Cookie', 1, 0, 0, 0, 50.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'BigBirdie', 2, 0, 0, 0, 17.5, v_event_id, true);

  -- Round 36: 9/20/2025 - Roy G (x2.5)
  INSERT INTO rounds (course_name, date, event_id, event_type, course_multiplier)
  VALUES ('Roy G', '2025-09-20', v_event_id, 'season', 2.5)
  RETURNING id INTO v_round_id;
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Bird', 4, 0, 0, 1, 15.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Shogun', 2, 0, 0, 0, 35.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jabba the Putt', 1, 0, 0, 2, 60.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Fireball', 3, 0, 0, 1, 30.0, v_event_id, true);
  INSERT INTO player_rounds (round_id, player_name, rank, aces, eagles, birdies, final_total, event_id, course_multiplier_applied)
  VALUES (v_round_id, 'Jaguar', 4, 0, 0, 0, 10.0, v_event_id, true);

  RAISE NOTICE 'Successfully imported all 36 rounds!';
END $$;

-- Verification
SELECT pr.player_name, COUNT(*) as rounds_played, SUM(pr.final_total) as total_points
FROM player_rounds pr
WHERE pr.event_id = (SELECT id FROM events WHERE name = '2025' AND type = 'season')
GROUP BY pr.player_name ORDER BY total_points DESC;