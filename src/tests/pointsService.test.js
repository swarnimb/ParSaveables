import { test } from 'node:test';
import assert from 'node:assert';
import * as pointsService from '../services/pointsService.js';
import * as eventService from '../services/eventService.js';
import * as configService from '../services/configService.js';

console.log('\n🧪 Running points service tests...\n');

/**
 * Test: Calculate points - basic scenario
 */
test('calculatePoints should calculate points correctly', async () => {
  // Get real configuration from database
  const event = await eventService.assignEvent('2025-10-15');
  const configuration = await configService.loadConfiguration(event, 'Zilker Park');

  const rankedPlayers = [
    {
      name: 'Alice',
      rank: 1,
      totalScore: -5,
      birdies: 5,
      eagles: 0,
      aces: 0
    },
    {
      name: 'Bob',
      rank: 2,
      totalScore: -2,
      birdies: 2,
      eagles: 0,
      aces: 0
    },
    {
      name: 'Charlie',
      rank: 3,
      totalScore: 0,
      birdies: 0,
      eagles: 0,
      aces: 0
    }
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);

  assert.strictEqual(playersWithPoints.length, 3, 'Should process all players');

  // Check points structure
  playersWithPoints.forEach(player => {
    assert.ok(player.points, 'Player should have points object');
    assert.ok(typeof player.points.rankPoints === 'number', 'Should have rank points');
    assert.ok(typeof player.points.performancePoints === 'number', 'Should have performance points');
    assert.ok(typeof player.points.rawTotal === 'number', 'Should have raw total');
    assert.ok(typeof player.points.courseMultiplier === 'number', 'Should have multiplier');
    assert.ok(typeof player.points.finalTotal === 'number', 'Should have final total');
  });

  console.log('✓ Points calculated for all players');
  playersWithPoints.forEach(p => {
    console.log(`  ${p.rank}. ${p.name}: ${p.points.finalTotal} pts (${p.points.rankPoints} rank + ${p.points.performancePoints} perf × ${p.points.courseMultiplier})`);
  });
});

/**
 * Test: Calculate points - performance bonuses
 */
test('calculatePoints should add performance bonuses correctly', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const configuration = await configService.loadConfiguration(event, 'Zilker Park');

  const rankedPlayers = [
    {
      name: 'Alice',
      rank: 1,
      totalScore: -8,
      birdies: 5,
      eagles: 1,
      aces: 1
    }
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);
  const player = playersWithPoints[0];

  const expectedBirdiePoints = 5 * (configuration.pointsSystem.config.performance_points.birdie || 0);
  const expectedEaglePoints = 1 * (configuration.pointsSystem.config.performance_points.eagle || 0);
  const expectedAcePoints = 1 * (configuration.pointsSystem.config.performance_points.ace || 0);

  assert.strictEqual(player.points.birdiePoints, expectedBirdiePoints, 'Birdie points should match');
  assert.strictEqual(player.points.eaglePoints, expectedEaglePoints, 'Eagle points should match');
  assert.strictEqual(player.points.acePoints, expectedAcePoints, 'Ace points should match');

  console.log('✓ Performance bonuses calculated correctly');
  console.log(`  ${player.points.birdiePoints} birdie pts, ${player.points.eaglePoints} eagle pts, ${player.points.acePoints} ace pts`);
});

/**
 * Test: Calculate points - course multiplier applied
 */
test('calculatePoints should apply course multiplier', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const configuration = await configService.loadConfiguration(event, 'Zilker Park');

  const rankedPlayers = [
    {
      name: 'Alice',
      rank: 1,
      totalScore: -5,
      birdies: 3,
      eagles: 0,
      aces: 0
    }
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);
  const player = playersWithPoints[0];

  // Verify multiplier was applied
  if (configuration.pointsSystem.config.course_multiplier?.enabled) {
    assert.ok(
      player.points.courseMultiplier >= 1.0,
      'Multiplier should be at least 1.0'
    );

    const expectedFinal = player.points.rawTotal * player.points.courseMultiplier;
    assert.strictEqual(
      player.points.finalTotal,
      parseFloat(expectedFinal.toFixed(2)),
      'Final total should equal raw × multiplier'
    );

    console.log('✓ Course multiplier applied');
    console.log(`  Raw: ${player.points.rawTotal}, Multiplier: ${player.points.courseMultiplier}x, Final: ${player.points.finalTotal}`);
  } else {
    console.log('⚠ Course multiplier disabled in this points system');
  }
});

/**
 * Test: Calculate points - no multiplier when disabled
 */
test('calculatePoints should skip multiplier when disabled', () => {
  const configuration = {
    event: { id: 1, name: 'Test Event', type: 'season', year: 2025 },
    pointsSystem: {
      id: 1,
      name: 'Test System',
      config: {
        rank_points: { 1: 10, 2: 7, default: 2 },
        performance_points: { birdie: 1, eagle: 3, ace: 5 },
        course_multiplier: { enabled: false }
      }
    },
    course: { course_name: 'Test Course', tier: 3, multiplier: 2.0 }
  };

  const rankedPlayers = [
    { name: 'Alice', rank: 1, totalScore: -5, birdies: 5, eagles: 0, aces: 0 }
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);
  const player = playersWithPoints[0];

  assert.strictEqual(player.points.courseMultiplier, 1.0, 'Multiplier should be 1.0 when disabled');
  assert.strictEqual(player.points.finalTotal, player.points.rawTotal, 'Final should equal raw when no multiplier');

  console.log('✓ Multiplier correctly skipped when disabled');
});

/**
 * Test: Calculate points - default rank points
 */
test('calculatePoints should use default rank points for unranked positions', () => {
  const configuration = {
    event: { id: 1, name: 'Test Event', type: 'season', year: 2025 },
    pointsSystem: {
      id: 1,
      name: 'Test System',
      config: {
        rank_points: { 1: 10, 2: 7, 3: 5, default: 2 },
        performance_points: { birdie: 1, eagle: 3, ace: 5 },
        course_multiplier: { enabled: false }
      }
    },
    course: { course_name: 'Test Course', tier: 2, multiplier: 1.0 }
  };

  const rankedPlayers = [
    { name: 'Alice', rank: 1, totalScore: -5, birdies: 0, eagles: 0, aces: 0 },
    { name: 'Bob', rank: 10, totalScore: 5, birdies: 0, eagles: 0, aces: 0 } // No specific rank 10 points
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);

  assert.strictEqual(playersWithPoints[0].points.rankPoints, 10, 'Rank 1 should get 10 points');
  assert.strictEqual(playersWithPoints[1].points.rankPoints, 2, 'Rank 10 should get default 2 points');

  console.log('✓ Default rank points used for unranked positions');
});

/**
 * Test: Calculate points - zero performance stats
 */
test('calculatePoints should handle players with no performance stats', async () => {
  const event = await eventService.assignEvent('2025-10-15');
  const configuration = await configService.loadConfiguration(event, 'Zilker Park');

  const rankedPlayers = [
    {
      name: 'Alice',
      rank: 5,
      totalScore: 5,
      birdies: 0,
      eagles: 0,
      aces: 0
    }
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);
  const player = playersWithPoints[0];

  assert.strictEqual(player.points.birdiePoints, 0, 'No birdie points');
  assert.strictEqual(player.points.eaglePoints, 0, 'No eagle points');
  assert.strictEqual(player.points.acePoints, 0, 'No ace points');
  assert.strictEqual(player.points.performancePoints, 0, 'No performance points');
  assert.ok(player.points.rankPoints > 0, 'Should still get rank points');

  console.log('✓ Players with no performance stats handled');
  console.log(`  Total: ${player.points.finalTotal} (only rank points)`);
});

/**
 * Test: Calculate tied rank points
 */
test('calculateTiedRankPoints should average points for tied ranks', () => {
  const rankConfig = { 1: 10, 2: 7, 3: 5, 4: 3, default: 2 };

  // Three players tied for 2nd place (ranks 2, 3, 4)
  const tiedRanks = [2, 3, 4];
  const averagePoints = pointsService.calculateTiedRankPoints(tiedRanks, rankConfig);

  const expected = (7 + 5 + 3) / 3; // Average of ranks 2, 3, 4
  assert.strictEqual(averagePoints, expected, 'Should average tied rank points');

  console.log('✓ Tied rank points averaged correctly');
  console.log(`  Ranks ${tiedRanks.join(', ')} → ${averagePoints.toFixed(2)} pts each`);
});

/**
 * Test: Calculate tied rank points - single rank
 */
test('calculateTiedRankPoints should return normal points for single rank', () => {
  const rankConfig = { 1: 10, 2: 7, 3: 5, default: 2 };

  const points = pointsService.calculateTiedRankPoints([1], rankConfig);

  assert.strictEqual(points, 10, 'Single rank should get normal points');

  console.log('✓ Single rank (no tie) returns normal points');
});

/**
 * Test: Calculate tied rank points - with defaults
 */
test('calculateTiedRankPoints should use default points when needed', () => {
  const rankConfig = { 1: 10, 2: 7, default: 2 };

  // Tied for ranks 3, 4, 5 (only default available)
  const tiedRanks = [3, 4, 5];
  const averagePoints = pointsService.calculateTiedRankPoints(tiedRanks, rankConfig);

  const expected = (2 + 2 + 2) / 3; // All use default
  assert.strictEqual(averagePoints, expected, 'Should use default for missing ranks');

  console.log('✓ Default points used in tie averaging');
});

/**
 * Test: Calculate points - final total precision
 */
test('calculatePoints should round final total to 2 decimal places', () => {
  const configuration = {
    event: { id: 1, name: 'Test Event', type: 'season', year: 2025 },
    pointsSystem: {
      id: 1,
      name: 'Test System',
      config: {
        rank_points: { 1: 10, default: 2 },
        performance_points: { birdie: 1, eagle: 3, ace: 5 },
        course_multiplier: { enabled: true }
      }
    },
    course: { course_name: 'Test Course', tier: 3, multiplier: 1.33 } // Will create decimals
  };

  const rankedPlayers = [
    { name: 'Alice', rank: 1, totalScore: -5, birdies: 3, eagles: 0, aces: 0 }
  ];

  const playersWithPoints = pointsService.calculatePoints(rankedPlayers, configuration);
  const player = playersWithPoints[0];

  // Check that final total has at most 2 decimal places
  const decimalPlaces = (player.points.finalTotal.toString().split('.')[1] || '').length;
  assert.ok(decimalPlaces <= 2, 'Final total should have at most 2 decimal places');

  console.log('✓ Final total precision correct');
  console.log(`  Final: ${player.points.finalTotal}`);
});
