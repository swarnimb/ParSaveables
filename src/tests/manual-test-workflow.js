/**
 * Manual End-to-End Workflow Test
 *
 * Tests the entire scorecard processing workflow with a real image.
 * This bypasses email polling and directly tests the core workflow:
 *   Vision → Scoring → Ranking → Event → Player → Config → Points → Database
 *
 * Usage:
 *   node src/tests/manual-test-workflow.js <path-to-scorecard-image>
 *
 * Example:
 *   node src/tests/manual-test-workflow.js ./test-scorecard.jpg
 *   node src/tests/manual-test-workflow.js https://example.com/scorecard.png
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as visionService from '../services/visionService.js';
import * as scoringService from '../services/scoringService.js';
import * as eventService from '../services/eventService.js';
import * as playerService from '../services/playerService.js';
import * as configService from '../services/configService.js';
import * as pointsService from '../services/pointsService.js';
import * as db from '../services/databaseService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ManualTest');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert local file to data URL for Vision API
 */
function imageToDataUrl(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  const base64Image = imageBuffer.toString('base64');

  // Detect image type from extension
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  const mimeType = mimeTypes[ext] || 'image/jpeg';

  return `data:${mimeType};base64,${base64Image}`;
}

/**
 * Main test workflow
 */
async function testWorkflow(imagePath) {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 MANUAL END-TO-END WORKFLOW TEST');
  console.log('='.repeat(80) + '\n');

  try {
    // Prepare image
    let imageUrl;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('📷 Using remote image URL:', imagePath);
      imageUrl = imagePath;
    } else if (imagePath.startsWith('data:')) {
      console.log('📷 Using data URL (already base64 encoded)');
      imageUrl = imagePath;
    } else {
      console.log('📷 Converting local file to data URL:', imagePath);
      imageUrl = imageToDataUrl(imagePath);
      console.log('   ✓ Image loaded:', imageUrl.substring(0, 50) + '...\n');
    }

    // ========================================
    // STEP 1: Vision Extraction
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 1: Extract scorecard data with Claude Vision API');
    console.log('━'.repeat(80));

    const scorecardData = await visionService.extractScorecardData(imageUrl);

    if (!scorecardData.valid) {
      console.error('❌ Vision API rejected image:', scorecardData.reason);
      process.exit(1);
    }

    console.log('✅ Scorecard extracted successfully!');
    console.log('   Course:', scorecardData.courseName);
    console.log('   Date:', scorecardData.date);
    console.log('   Players:', scorecardData.players.length);
    console.log('   Holes:', scorecardData.holes?.length);
    console.log('   Raw data:', JSON.stringify(scorecardData, null, 2).substring(0, 500) + '...\n');

    // ========================================
    // STEP 2: Calculate Stats & Rank Players
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 2: Calculate statistics and rank players');
    console.log('━'.repeat(80));

    const processedData = scoringService.processScorecard(scorecardData);

    console.log('✅ Stats calculated and players ranked!');
    console.log('   Players with stats:', processedData.rankedPlayers.length);
    console.log('\n   Leaderboard:');
    processedData.rankedPlayers.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - Score: ${p.stats.totalScore}, Birdies: ${p.stats.birdies}, Points (pre-calc): TBD`);
    });
    console.log();

    // ========================================
    // STEP 3: Assign Event (Season/Tournament)
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 3: Assign event based on scorecard date');
    console.log('━'.repeat(80));

    const event = await eventService.assignEvent(scorecardData.date);

    console.log('✅ Event assigned!');
    console.log('   Event:', event.name);
    console.log('   Type:', event.type);
    console.log('   Points System ID:', event.points_system_id);
    console.log();

    // ========================================
    // STEP 4: Validate Players
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 4: Validate player names against registry');
    console.log('━'.repeat(80));

    const playerValidation = await playerService.validatePlayers(
      processedData.rankedPlayers.map(p => p.name)
    );

    console.log('✅ Players validated!');
    console.log('   Exact matches:', playerValidation.matched.length);
    console.log('   Fuzzy matches:', playerValidation.fuzzy.length);
    console.log('   Unknown:', playerValidation.unknown.length);

    if (playerValidation.unknown.length > 0) {
      console.log('   ⚠️  Unknown players:', playerValidation.unknown.join(', '));
    }
    console.log();

    // ========================================
    // STEP 5: Load Configuration
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 5: Load points system and course configuration');
    console.log('━'.repeat(80));

    const configuration = await configService.loadConfiguration(event, scorecardData.courseName);

    console.log('✅ Configuration loaded!');
    console.log('   Points System:', configuration.pointsSystem.name);
    console.log('   Course:', configuration.course.course_name);
    console.log('   Course Multiplier:', configuration.course.multiplier);
    console.log('   Rank Points:', configuration.pointsSystem.config.rankPoints);
    console.log();

    // ========================================
    // STEP 6: Calculate Points
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 6: Calculate final points for each player');
    console.log('━'.repeat(80));

    const playersWithPoints = await pointsService.calculatePoints(
      processedData.rankedPlayers,
      configuration.pointsSystem.config,
      configuration.course
    );

    console.log('✅ Points calculated!');
    console.log('\n   Final Leaderboard with Points:');
    playersWithPoints.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Rank: ${p.rank} | Score: ${p.stats.totalScore} | Birdies: ${p.stats.birdies}`);
      console.log(`      Base Points: ${p.points.basePoints} | Bonuses: ${p.points.performanceBonus} | Multiplier: ${configuration.course.multiplier}x`);
      console.log(`      🏆 FINAL POINTS: ${p.points.finalTotal}`);
    });
    console.log();

    // ========================================
    // STEP 7: Prepare Database Records
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 7: Prepare data for database insertion');
    console.log('━'.repeat(80));

    const roundData = {
      event_id: event.id,
      course_name: scorecardData.courseName,
      date: scorecardData.date,
      layout_name: scorecardData.layoutName || null,
      location: scorecardData.location || null,
      temperature: scorecardData.temperature || null,
      wind: scorecardData.wind || null
    };

    console.log('✅ Round data prepared!');
    console.log('   Event ID:', roundData.event_id);
    console.log('   Course:', roundData.course_name);
    console.log('   Date:', roundData.date);
    console.log();

    // ========================================
    // STEP 8: Ask User for Confirmation
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 8: Database insertion (DRY RUN)');
    console.log('━'.repeat(80));
    console.log('⚠️  This is a TEST - we will NOT insert into the database.');
    console.log('   To actually insert, modify the script to remove the dry-run check.\n');

    const playerRoundsData = playersWithPoints.map(player => ({
      // round_id will be set after round insertion
      player_name: player.name,
      rank: player.rank,
      total_score: player.stats.totalScore,
      birdies: player.stats.birdies || 0,
      eagles: player.stats.eagles || 0,
      aces: player.stats.aces || 0,
      pars: player.stats.pars || 0,
      bogeys: player.stats.bogeys || 0,
      double_bogeys: player.stats.doubleBogeys || 0,
      hole_by_hole: player.holeByHole,
      rank_points: player.points.basePoints,
      performance_bonus: player.points.performanceBonus,
      course_multiplier: configuration.course.multiplier,
      final_total: player.points.finalTotal
    }));

    console.log('📋 Would insert:');
    console.log('   1 round record');
    console.log('  ', playerRoundsData.length, 'player_round records\n');

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(80));
    console.log('✅ WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log('   ✓ Vision extraction: PASS');
    console.log('   ✓ Stats calculation: PASS');
    console.log('   ✓ Player ranking: PASS');
    console.log('   ✓ Event assignment: PASS');
    console.log('   ✓ Player validation: PASS');
    console.log('   ✓ Configuration loading: PASS');
    console.log('   ✓ Points calculation: PASS');
    console.log('   ✓ Data preparation: PASS');
    console.log('\n🎉 All systems operational!\n');

    // Return data for inspection
    return {
      scorecardData,
      processedData,
      event,
      playerValidation,
      configuration,
      playersWithPoints,
      roundData,
      playerRoundsData
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// ========================================
// CLI Entry Point
// ========================================
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('❌ Error: No image path provided\n');
  console.error('Usage: node src/tests/manual-test-workflow.js <path-to-image>\n');
  console.error('Examples:');
  console.error('  node src/tests/manual-test-workflow.js ./my-scorecard.jpg');
  console.error('  node src/tests/manual-test-workflow.js https://example.com/scorecard.png');
  console.error('  node src/tests/manual-test-workflow.js "data:image/jpeg;base64,/9j/4AAQ..."\n');
  process.exit(1);
}

// Run the test
testWorkflow(imagePath)
  .then(results => {
    console.log('✅ Test data saved to results object (if needed for debugging)');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
