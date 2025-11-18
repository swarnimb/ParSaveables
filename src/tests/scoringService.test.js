import { test } from 'node:test';
import assert from 'node:assert';
import * as scoring from '../services/scoringService.js';

// Sample hole data (9 holes for testing)
const sampleHoles = [
  { hole: 1, par: 3, distance: 250 },
  { hole: 2, par: 4, distance: 350 },
  { hole: 3, par: 3, distance: 200 },
  { hole: 4, par: 4, distance: 400 },
  { hole: 5, par: 5, distance: 500 },
  { hole: 6, par: 3, distance: 275 },
  { hole: 7, par: 4, distance: 375 },
  { hole: 8, par: 4, distance: 425 },
  { hole: 9, par: 5, distance: 550 }
];

/**
 * Test: Calculate stats from hole-by-hole scores
 */
test('calculateStats should count performance correctly', () => {
  // Player with: 1 ace, 1 eagle, 2 birdies, 3 pars, 1 bogey, 1 double bogey
  const holeByHole = [
    1,  // Hole 1 (par 3): Ace
    2,  // Hole 2 (par 4): Eagle
    2,  // Hole 3 (par 3): Birdie
    3,  // Hole 4 (par 4): Birdie
    5,  // Hole 5 (par 5): Par
    3,  // Hole 6 (par 3): Par
    4,  // Hole 7 (par 4): Par
    5,  // Hole 8 (par 4): Bogey
    7   // Hole 9 (par 5): Double bogey
  ];

  const stats = scoring.calculateStats(holeByHole, sampleHoles);

  assert.strictEqual(stats.aces, 1, 'Should count 1 ace');
  assert.strictEqual(stats.eagles, 1, 'Should count 1 eagle');
  assert.strictEqual(stats.birdies, 2, 'Should count 2 birdies');
  assert.strictEqual(stats.pars, 3, 'Should count 3 pars');
  assert.strictEqual(stats.bogeys, 1, 'Should count 1 bogey');
  assert.strictEqual(stats.doubleBogeys, 1, 'Should count 1 double bogey');

  console.log('✓ Stats calculated correctly:', stats);
});

/**
 * Test: Find first birdie hole
 */
test('getFirstBirdieHole should find first birdie', () => {
  const holeByHole = [3, 3, 2, 3, 5, 3, 4, 4, 5]; // First birdie on hole 3
  const firstBirdie = scoring.getFirstBirdieHole(holeByHole, sampleHoles);

  assert.strictEqual(firstBirdie, 3, 'First birdie should be on hole 3');

  console.log('✓ First birdie found on hole', firstBirdie);
});

/**
 * Test: No birdies should return 999
 */
test('getFirstBirdieHole should return 999 if no birdies', () => {
  const holeByHole = [3, 4, 3, 4, 5, 3, 4, 4, 5]; // All pars
  const firstBirdie = scoring.getFirstBirdieHole(holeByHole, sampleHoles);

  assert.strictEqual(firstBirdie, 999, 'Should return 999 when no birdies');

  console.log('✓ No birdies detected correctly');
});

/**
 * Test: Rank players without ties
 */
test('rankPlayers should rank by total score', () => {
  const players = [
    { name: 'Player A', totalScore: -2, totalStrokes: 33, birdies: 3, pars: 6, holeByHole: [2,3,3,3,4,2,3,4,4] },
    { name: 'Player B', totalScore: 0, totalStrokes: 35, birdies: 1, pars: 8, holeByHole: [3,4,2,4,5,3,4,4,5] },
    { name: 'Player C', totalScore: +3, totalStrokes: 38, birdies: 0, pars: 5, holeByHole: [4,5,3,5,6,3,4,5,6] }
  ];

  const ranked = scoring.rankPlayers(players, sampleHoles);

  assert.strictEqual(ranked[0].name, 'Player A', '1st place: Player A');
  assert.strictEqual(ranked[0].rank, 1, 'Should have rank 1');
  assert.strictEqual(ranked[1].name, 'Player B', '2nd place: Player B');
  assert.strictEqual(ranked[1].rank, 2, 'Should have rank 2');
  assert.strictEqual(ranked[2].name, 'Player C', '3rd place: Player C');
  assert.strictEqual(ranked[2].rank, 3, 'Should have rank 3');

  console.log('✓ Players ranked:', ranked.map(p => `${p.rank}. ${p.name} (${p.totalScore})`));
});

/**
 * Test: Rank players with tie-breaking (more birdies wins)
 */
test('rankPlayers should break tie by birdies', () => {
  const players = [
    { name: 'Player A', totalScore: 0, totalStrokes: 35, birdies: 2, pars: 7, holeByHole: [2,3,3,4,5,2,4,4,5] },
    { name: 'Player B', totalScore: 0, totalStrokes: 35, birdies: 1, pars: 8, holeByHole: [3,4,2,4,5,3,4,4,5] }
  ];

  const ranked = scoring.rankPlayers(players, sampleHoles);

  assert.strictEqual(ranked[0].name, 'Player A', 'Player A wins with more birdies');
  assert.strictEqual(ranked[0].rank, 1, 'Should have rank 1');
  assert.strictEqual(ranked[1].name, 'Player B', 'Player B loses tie-break');
  assert.strictEqual(ranked[1].rank, 2, 'Should have rank 2');

  console.log('✓ Tie broken by birdies');
});

/**
 * Test: Rank players with exact tie (shared rank)
 */
test('rankPlayers should share rank for exact ties', () => {
  const holeByHole = [3, 4, 3, 4, 5, 3, 4, 4, 5]; // Identical scores

  const players = [
    { name: 'Player A', totalScore: 0, totalStrokes: 35, birdies: 0, pars: 9, holeByHole },
    { name: 'Player B', totalScore: 0, totalStrokes: 35, birdies: 0, pars: 9, holeByHole }
  ];

  const ranked = scoring.rankPlayers(players, sampleHoles);

  assert.strictEqual(ranked[0].rank, 1, 'First player should have rank 1');
  assert.strictEqual(ranked[1].rank, 1, 'Second player should share rank 1');

  console.log('✓ Exact tie - both players share rank 1');
});

/**
 * Test: Process complete scorecard
 */
test('processScorecard should verify stats and rank players', () => {
  const scorecardData = {
    courseName: 'Test Course',
    layoutName: 'Main',
    date: '2025-11-18',
    holes: sampleHoles,
    players: [
      {
        name: 'Winner',
        totalScore: -3,
        totalStrokes: 32,
        holeByHole: [2, 3, 2, 3, 4, 2, 3, 3, 4],
        birdies: 5, // Will be recalculated
        eagles: 0,
        aces: 0
      },
      {
        name: 'Second Place',
        totalScore: 0,
        totalStrokes: 35,
        holeByHole: [3, 4, 3, 4, 5, 3, 4, 4, 5],
        birdies: 0,
        eagles: 0,
        aces: 0
      }
    ]
  };

  const processed = scoring.processScorecard(scorecardData);

  assert.strictEqual(processed.players[0].name, 'Winner', '1st place: Winner');
  assert.strictEqual(processed.players[0].rank, 1, 'Should have rank 1');
  assert.strictEqual(processed.players[0].birdies, 5, 'Should recalculate birdies');

  assert.strictEqual(processed.players[1].name, 'Second Place', '2nd place: Second Place');
  assert.strictEqual(processed.players[1].rank, 2, 'Should have rank 2');

  console.log('✓ Scorecard processed and players ranked');
});

console.log('\n🧪 Running scoring service tests...\n');
