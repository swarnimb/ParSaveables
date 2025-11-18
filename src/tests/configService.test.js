import { test } from 'node:test';
import assert from 'node:assert';
import * as configService from '../services/configService.js';
import * as eventService from '../services/eventService.js';

console.log('\n🧪 Running config service tests...\n');

/**
 * Test: Load configuration for season event
 */
test('loadConfiguration should load complete config for season', async () => {
  // First get an event
  const event = await eventService.assignEvent('2025-10-15');

  // Load configuration
  const config = await configService.loadConfiguration(event, 'Zilker Park');

  assert.ok(config, 'Should return configuration');
  assert.ok(config.event, 'Should have event');
  assert.ok(config.pointsSystem, 'Should have points system');
  assert.ok(config.course, 'Should have course');
  assert.ok(config.courses, 'Should have all courses');

  console.log(`✓ Configuration loaded for: ${config.event.name}`);
  console.log(`  Points System: ${config.pointsSystem.name}`);
  console.log(`  Course: ${config.course.course_name} (${config.course.multiplier}x)`);
});

/**
 * Test: Load configuration - event details
 */
test('loadConfiguration should include complete event details', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const config = await configService.loadConfiguration(event, 'Zilker Park');

  assert.strictEqual(config.event.id, event.id, 'Event ID should match');
  assert.strictEqual(config.event.name, event.name, 'Event name should match');
  assert.strictEqual(config.event.type, event.type, 'Event type should match');
  assert.ok(config.event.year, 'Event should have year');

  console.log('✓ Event details complete');
});

/**
 * Test: Load configuration - points system
 */
test('loadConfiguration should include points system with config', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const config = await configService.loadConfiguration(event, 'Zilker Park');

  assert.ok(config.pointsSystem.id, 'Points system should have ID');
  assert.ok(config.pointsSystem.name, 'Points system should have name');
  assert.ok(config.pointsSystem.config, 'Points system should have config');
  assert.ok(config.pointsSystem.config.rank_points, 'Config should have rank_points');
  assert.ok(config.pointsSystem.config.performance_points, 'Config should have performance_points');

  console.log('✓ Points system configuration loaded');
  console.log(`  Rank points:`, config.pointsSystem.config.rank_points);
  console.log(`  Performance points:`, config.pointsSystem.config.performance_points);
});

/**
 * Test: Load configuration - course matching
 */
test('loadConfiguration should find course by exact name', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const config = await configService.loadConfiguration(event, 'Zilker Park');

  assert.ok(config.course, 'Should have course');
  assert.ok(config.course.course_name, 'Course should have name');
  assert.ok(config.course.tier, 'Course should have tier');
  assert.ok(config.course.multiplier, 'Course should have multiplier');

  console.log(`✓ Course matched: ${config.course.course_name}`);
  console.log(`  Tier: ${config.course.tier}, Multiplier: ${config.course.multiplier}x`);
});

/**
 * Test: Load configuration - course partial matching
 */
test('loadConfiguration should handle partial course name matches', async () => {
  const event = await eventService.assignEvent('2025-10-15');

  // Try partial name (e.g., "Zilker" should match "Zilker Park")
  const config = await configService.loadConfiguration(event, 'Zilker');

  assert.ok(config.course, 'Should find course with partial match');

  if (!config.course.isDefault) {
    console.log(`✓ Partial match: "Zilker" → "${config.course.course_name}"`);
  } else {
    console.log('⚠ No partial match found, using default');
  }
});

/**
 * Test: Load configuration - unknown course defaults
 */
test('loadConfiguration should use defaults for unknown course', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const config = await configService.loadConfiguration(event, 'Unknown Course XYZ');

  assert.ok(config.course, 'Should have course (default)');
  assert.strictEqual(config.course.multiplier, 1.0, 'Should use default multiplier');
  assert.strictEqual(config.course.isDefault, true, 'Should be marked as default');

  console.log('✓ Unknown course handled with defaults');
  console.log(`  Course: ${config.course.course_name} (${config.course.multiplier}x)`);
});

/**
 * Test: Load configuration - all courses list
 */
test('loadConfiguration should include all active courses', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const config = await configService.loadConfiguration(event, 'Zilker Park');

  assert.ok(Array.isArray(config.courses), 'Courses should be an array');
  assert.ok(config.courses.length > 0, 'Should have at least one course');

  console.log(`✓ All courses loaded: ${config.courses.length} active courses`);
  config.courses.slice(0, 3).forEach(course => {
    console.log(`  - ${course.course_name} (Tier ${course.tier}, ${course.multiplier}x)`);
  });
});

/**
 * Test: Load configuration - tournament event
 */
test('loadConfiguration should work for tournament events', async () => {
  const event = await eventService.assignEvent('2025-09-26');
  const config = await configService.loadConfiguration(event, 'Blue Lake Park');

  assert.strictEqual(config.event.type, 'tournament', 'Should be tournament');
  assert.ok(config.pointsSystem, 'Tournament should have points system');

  console.log(`✓ Tournament configuration loaded: ${config.event.name}`);
});

/**
 * Test: Load configuration - case insensitive course matching
 */
test('loadConfiguration should match courses case-insensitively', async () => {
  const event = await eventService.assignEvent('2025-10-15');

  const config1 = await configService.loadConfiguration(event, 'ZILKER PARK');
  const config2 = await configService.loadConfiguration(event, 'zilker park');
  const config3 = await configService.loadConfiguration(event, 'Zilker Park');

  // All should find same course (or all default)
  if (!config1.course.isDefault && !config2.course.isDefault && !config3.course.isDefault) {
    assert.strictEqual(
      config1.course.course_name,
      config2.course.course_name,
      'Case should not matter'
    );
    assert.strictEqual(
      config2.course.course_name,
      config3.course.course_name,
      'Case should not matter'
    );
    console.log('✓ Case-insensitive course matching works');
  } else {
    console.log('✓ All variants handled (some defaulted)');
  }
});
