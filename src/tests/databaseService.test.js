import { test } from 'node:test';
import assert from 'node:assert';
import * as db from '../services/databaseService.js';

/**
 * Test: Get registered players
 */
test('getRegisteredPlayers should return active players', async () => {
  const players = await db.getRegisteredPlayers();

  assert.ok(Array.isArray(players), 'Should return an array');
  assert.ok(players.length > 0, 'Should have at least one player');
  assert.ok(players[0].player_name, 'Player should have a name');
  assert.strictEqual(players[0].active, true, 'All players should be active');

  console.log(`✓ Found ${players.length} registered players`);
});

/**
 * Test: Find event by date (season)
 */
test('findEventByDate should find Season 2025', async () => {
  const event = await db.findEventByDate('2025-10-15');

  assert.ok(event, 'Should find an event');
  assert.strictEqual(event.name, 'Season 2025', 'Should be Season 2025');
  assert.strictEqual(event.type, 'season', 'Should be a season');
  assert.ok(event.points_system_id, 'Should have points system linked');

  console.log(`✓ Found event: ${event.name}`);
});

/**
 * Test: Find event by date (tournament)
 */
test('findEventByDate should find Portlandia 2025 tournament', async () => {
  const event = await db.findEventByDate('2025-09-26');

  assert.ok(event, 'Should find an event');
  assert.strictEqual(event.name, 'Portlandia 2025', 'Should be Portlandia 2025');
  assert.strictEqual(event.type, 'tournament', 'Should be a tournament');

  console.log(`✓ Found tournament: ${event.name}`);
});

/**
 * Test: Get all courses
 */
test('getCourses should return active courses', async () => {
  const courses = await db.getCourses();

  assert.ok(Array.isArray(courses), 'Should return an array');
  assert.ok(courses.length > 0, 'Should have at least one course');
  assert.ok(courses[0].course_name, 'Course should have a name');
  assert.ok(courses[0].tier, 'Course should have a tier');
  assert.ok(courses[0].multiplier, 'Course should have a multiplier');

  console.log(`✓ Found ${courses.length} active courses`);
});

/**
 * Test: Get points system
 */
test('getPointsSystem should return valid points system', async () => {
  // First get an event to find its points_system_id
  const event = await db.findEventByDate('2025-10-15');
  const pointsSystem = await db.getPointsSystem(event.points_system_id);

  assert.ok(pointsSystem, 'Should return points system');
  assert.ok(pointsSystem.name, 'Should have a name');
  assert.ok(pointsSystem.config, 'Should have config');
  assert.ok(pointsSystem.config.rank_points, 'Config should have rank_points');

  console.log(`✓ Loaded points system: ${pointsSystem.name}`);
});

console.log('\n🧪 Running database service tests...\n');
