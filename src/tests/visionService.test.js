import { test } from 'node:test';
import assert from 'node:assert';
import * as vision from '../services/visionService.js';

/**
 * Test: Extract scorecard data from sample image
 *
 * NOTE: This test requires:
 * 1. Valid ANTHROPIC_API_KEY in .env
 * 2. Sample scorecard image URL
 *
 * To run manually with a real scorecard:
 * node src/tests/visionService.test.js --sample-url=https://example.com/scorecard.jpg
 */
test('extractScorecardData should validate and extract scorecard', async () => {
  // Get sample URL from command line or skip test
  const sampleUrl = process.env.SAMPLE_SCORECARD_URL;

  if (!sampleUrl) {
    console.log('⏭️  Skipping vision test (no SAMPLE_SCORECARD_URL provided)');
    console.log('   To test: SAMPLE_SCORECARD_URL=https://... npm test');
    return;
  }

  console.log(`Testing with image: ${sampleUrl}`);

  const result = await vision.extractScorecardData(sampleUrl);

  // Test structure
  assert.ok(result, 'Should return a result');
  assert.ok(typeof result.valid === 'boolean', 'Should have valid field');

  if (!result.valid) {
    console.log(`✓ Image rejected: ${result.reason}`);
    return;
  }

  // Test valid scorecard structure
  assert.ok(result.courseName, 'Should have course name');
  assert.ok(Array.isArray(result.players), 'Should have players array');
  assert.ok(result.players.length >= 4, 'Should have at least 4 players');
  assert.ok(Array.isArray(result.holes), 'Should have holes array');

  // Test first player structure
  const player = result.players[0];
  assert.ok(player.name, 'Player should have name');
  assert.ok(typeof player.totalStrokes === 'number', 'Should have total strokes');
  assert.ok(typeof player.totalScore === 'number', 'Should have total score');
  assert.ok(Array.isArray(player.holeByHole), 'Should have hole-by-hole scores');
  assert.ok(player.holeByHole.length === result.holes.length, 'Hole-by-hole length should match holes');

  console.log(`✓ Valid scorecard extracted:`);
  console.log(`  Course: ${result.courseName}`);
  console.log(`  Layout: ${result.layoutName || 'N/A'}`);
  console.log(`  Date: ${result.date || 'N/A'}`);
  console.log(`  Players: ${result.players.map(p => p.name).join(', ')}`);
  console.log(`  Holes: ${result.holes.length}`);
});

/**
 * Test: Reject invalid image (not a scorecard)
 *
 * This would test with a non-scorecard image, but requires manual setup
 */
test('extractScorecardData should reject non-scorecard images', async () => {
  const invalidUrl = process.env.INVALID_IMAGE_URL;

  if (!invalidUrl) {
    console.log('⏭️  Skipping invalid image test (no INVALID_IMAGE_URL provided)');
    return;
  }

  const result = await vision.extractScorecardData(invalidUrl);

  assert.strictEqual(result.valid, false, 'Should mark as invalid');
  assert.ok(result.reason, 'Should provide reason');

  console.log(`✓ Invalid image rejected: ${result.reason}`);
});

console.log('\n🧪 Running vision service tests...\n');
console.log('💡 Tip: Set SAMPLE_SCORECARD_URL environment variable to test with real image\n');
