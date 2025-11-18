import { test } from 'node:test';
import assert from 'node:assert';
import * as eventService from '../services/eventService.js';

/**
 * Test: Assign event for season date
 */
test('assignEvent should find Season 2025 for October date', async () => {
  const event = await eventService.assignEvent('2025-10-15');

  assert.ok(event, 'Should return an event');
  assert.strictEqual(event.name, 'Season 2025', 'Should be Season 2025');
  assert.strictEqual(event.type, 'season', 'Should be a season');
  assert.ok(event.points_system_id, 'Should have points system linked');

  console.log(`✓ Assigned event: ${event.name} (${event.type})`);
});

/**
 * Test: Assign event for tournament date (should prioritize tournament)
 */
test('assignEvent should find Portlandia 2025 for tournament date', async () => {
  const event = await eventService.assignEvent('2025-09-26');

  assert.ok(event, 'Should return an event');
  assert.strictEqual(event.name, 'Portlandia 2025', 'Should be Portlandia 2025');
  assert.strictEqual(event.type, 'tournament', 'Should be a tournament');
  assert.ok(event.points_system_id, 'Should have points system linked');

  console.log(`✓ Assigned tournament: ${event.name}`);
});

/**
 * Test: Invalid date format should throw error
 */
test('assignEvent should reject invalid date format', async () => {
  await assert.rejects(
    async () => {
      await eventService.assignEvent('2025/10/15'); // Wrong format
    },
    {
      message: /Invalid date format/
    },
    'Should throw error for invalid date format'
  );

  console.log('✓ Invalid date format rejected');
});

/**
 * Test: Date with no event should throw error
 */
test('assignEvent should throw error if no event found', async () => {
  await assert.rejects(
    async () => {
      await eventService.assignEvent('2020-01-01'); // Old date with no event
    },
    {
      message: /No active season or tournament found/
    },
    'Should throw error when no event exists'
  );

  console.log('✓ Missing event error thrown correctly');
});

console.log('\n🧪 Running event service tests...\n');
