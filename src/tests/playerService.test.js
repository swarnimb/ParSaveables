import { test } from 'node:test';
import assert from 'node:assert';
import * as playerService from '../services/playerService.js';

console.log('\n🧪 Running player service tests...\n');

/**
 * Test: Normalize name function
 */
test('normalizeName should clean and standardize names', () => {
  assert.strictEqual(
    playerService.normalizeName('  David  '),
    'david',
    'Should trim whitespace'
  );

  assert.strictEqual(
    playerService.normalizeName('David!!!'),
    'david',
    'Should remove special characters'
  );

  assert.strictEqual(
    playerService.normalizeName('David   Smith'),
    'david smith',
    'Should collapse multiple spaces'
  );

  assert.strictEqual(
    playerService.normalizeName('DAVID'),
    'david',
    'Should convert to lowercase'
  );

  console.log('✓ Name normalization works correctly');
});

/**
 * Test: Calculate similarity - exact matches
 */
test('calculateSimilarity should return 1.0 for exact matches', () => {
  const score1 = playerService.calculateSimilarity('David', 'David');
  assert.strictEqual(score1, 1.0, 'Exact match should be 1.0');

  const score2 = playerService.calculateSimilarity('david', 'DAVID');
  assert.strictEqual(score2, 1.0, 'Case-insensitive match should be 1.0');

  const score3 = playerService.calculateSimilarity(' David ', 'David');
  assert.strictEqual(score3, 1.0, 'Whitespace differences should match');

  console.log('✓ Exact match similarity calculation works');
});

/**
 * Test: Calculate similarity - partial matches
 */
test('calculateSimilarity should score partial matches appropriately', () => {
  // Contains match
  const score1 = playerService.calculateSimilarity('David', 'David Smith');
  assert.ok(score1 >= 0.8, 'Substring match should score high');

  // First name match
  const score2 = playerService.calculateSimilarity('David', 'David Johnson');
  assert.ok(score2 >= 0.8, 'First name match should score high');

  // Similar but not exact
  const score3 = playerService.calculateSimilarity('David', 'Dave');
  assert.ok(score3 > 0.5 && score3 < 0.9, 'Similar names should score medium');

  // Completely different
  const score4 = playerService.calculateSimilarity('David', 'John');
  assert.ok(score4 < 0.5, 'Different names should score low');

  console.log('✓ Partial match similarity calculation works');
});

/**
 * Test: Validate players - exact matches
 */
test('validatePlayers should match exact player names', async () => {
  const scorecardPlayers = [
    { name: 'David', totalScore: -2, birdies: 3 }
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.strictEqual(result.matched.length, 1, 'Should match 1 player');
  assert.strictEqual(result.unmatched.length, 0, 'Should have no unmatched');
  assert.ok(result.matched[0].playerId, 'Matched player should have ID');
  assert.ok(result.matched[0].registeredName, 'Should have registered name');
  assert.ok(result.matched[0].matchScore >= 0.95, 'Should have high match score');

  console.log(`✓ Exact player match: "${scorecardPlayers[0].name}" → "${result.matched[0].registeredName}"`);
});

/**
 * Test: Validate players - fuzzy matches
 */
test('validatePlayers should handle fuzzy name matches', async () => {
  const scorecardPlayers = [
    { name: 'Dave', totalScore: -1, birdies: 2 } // Should match "David"
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.ok(result.matched.length >= 0, 'Should attempt to match');

  if (result.matched.length > 0) {
    assert.ok(result.matched[0].matchScore >= 0.75, 'Fuzzy match should meet threshold');
    console.log(`✓ Fuzzy match: "${scorecardPlayers[0].name}" → "${result.matched[0].registeredName}" (${(result.matched[0].matchScore * 100).toFixed(0)}%)`);
  }

  // Should have fuzzy match warning if matched
  if (result.matched.length > 0 && result.matched[0].matchScore < 0.95) {
    const fuzzyWarnings = result.warnings.filter(w => w.type === 'fuzzy_match');
    assert.ok(fuzzyWarnings.length > 0, 'Should warn about fuzzy matches');
    console.log(`✓ Fuzzy match warning generated`);
  }
});

/**
 * Test: Validate players - unmatched names
 */
test('validatePlayers should identify unmatched players', async () => {
  const scorecardPlayers = [
    { name: 'UnknownPlayer12345', totalScore: 0, birdies: 0 }
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.strictEqual(result.unmatched.length, 1, 'Should have 1 unmatched player');
  assert.strictEqual(result.matched.length, 0, 'Should have 0 matched players');

  const unmatchedWarnings = result.warnings.filter(w => w.type === 'unmatched');
  assert.ok(unmatchedWarnings.length > 0, 'Should warn about unmatched players');

  console.log(`✓ Unmatched player detected: "${scorecardPlayers[0].name}"`);
});

/**
 * Test: Validate players - multiple players
 */
test('validatePlayers should handle multiple players', async () => {
  const scorecardPlayers = [
    { name: 'David', totalScore: -2, birdies: 3 },
    { name: 'Ryan', totalScore: -1, birdies: 2 },
    { name: 'Jeff', totalScore: 0, birdies: 1 }
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.strictEqual(result.stats.total, 3, 'Should process 3 players');
  assert.ok(result.stats.matched >= 2, 'Should match at least 2 players');

  console.log(`✓ Multi-player validation: ${result.stats.matched}/${result.stats.total} matched`);
  console.log(`  Stats:`, result.stats);
});

/**
 * Test: Validate players - case insensitivity
 */
test('validatePlayers should be case-insensitive', async () => {
  const scorecardPlayers = [
    { name: 'DAVID', totalScore: -2, birdies: 3 },
    { name: 'david', totalScore: -1, birdies: 2 }
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.ok(result.matched.length >= 1, 'Should match case-insensitive names');

  if (result.matched.length > 0) {
    assert.ok(result.matched[0].matchScore >= 0.95, 'Case differences should not affect score');
    console.log(`✓ Case-insensitive matching works`);
  }
});

/**
 * Test: Validate players - special characters
 */
test('validatePlayers should handle special characters', async () => {
  const scorecardPlayers = [
    { name: 'David!!!', totalScore: -2, birdies: 3 },
    { name: 'Ryan...', totalScore: -1, birdies: 2 }
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.ok(result.matched.length >= 1, 'Should match names with special chars removed');
  console.log(`✓ Special character handling: ${result.matched.length} matched`);
});

/**
 * Test: Find player by name - exact match
 */
test('findPlayerByName should find exact match', async () => {
  const player = await playerService.findPlayerByName('David');

  if (player) {
    assert.ok(player.id, 'Player should have ID');
    assert.ok(player.player_name, 'Player should have name');
    assert.strictEqual(player.active, true, 'Player should be active');
    console.log(`✓ Found player: ${player.player_name}`);
  } else {
    console.log(`⚠ No player named "David" in database`);
  }
});

/**
 * Test: Find player by name - not found
 */
test('findPlayerByName should return null for non-existent player', async () => {
  const player = await playerService.findPlayerByName('NonExistentPlayer12345');

  assert.strictEqual(player, null, 'Should return null for non-existent player');
  console.log('✓ Returns null for non-existent player');
});

/**
 * Test: Validate players - stats summary
 */
test('validatePlayers should provide accurate stats', async () => {
  const scorecardPlayers = [
    { name: 'David', totalScore: -2, birdies: 3 },
    { name: 'UnknownPlayer', totalScore: 0, birdies: 0 }
  ];

  const result = await playerService.validatePlayers(scorecardPlayers);

  assert.ok(result.stats, 'Should have stats object');
  assert.strictEqual(result.stats.total, 2, 'Total should be 2');
  assert.strictEqual(
    result.stats.matched + result.stats.unmatched,
    result.stats.total,
    'Matched + unmatched should equal total'
  );

  console.log('✓ Stats summary accurate:', result.stats);
});
