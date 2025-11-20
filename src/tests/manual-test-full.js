/**
 * Manual Full Integration Test
 *
 * Tests complete workflow: Email → Vision → Scoring → Database
 * Combines email service test with workflow test using image from email.
 *
 * Usage:
 *   node src/tests/manual-test-full.js
 */

import * as emailService from '../services/emailService.js';
import * as visionService from '../services/visionService.js';
import * as scoringService from '../services/scoringService.js';
import * as eventService from '../services/eventService.js';
import * as playerService from '../services/playerService.js';
import * as configService from '../services/configService.js';
import * as pointsService from '../services/pointsService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('FullTest');

async function testFullWorkflow() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 FULL INTEGRATION TEST: EMAIL → WORKFLOW');
  console.log('='.repeat(80) + '\n');

  try {
    // ========================================
    // PHASE 1: EMAIL SERVICE
    // ========================================
    console.log('━'.repeat(80));
    console.log('PHASE 1: Check Gmail for new emails');
    console.log('━'.repeat(80));

    const emails = await emailService.checkForNewEmails();
    console.log(`✅ Found ${emails.length} unread email(s) with image attachments\n`);

    if (emails.length === 0) {
      console.log('⚠️  No emails to process.');
      console.log('   Send an email with UDisc scorecard to test.\n');
      return;
    }

    const firstEmail = emails[0];
    console.log('   Processing email from:', firstEmail.from);
    console.log('   Subject:', firstEmail.subject);
    console.log();

    // Extract attachments
    const attachments = await emailService.getImageAttachments(firstEmail);
    console.log(`✅ Extracted ${attachments.length} image(s)\n`);

    const imageUrl = attachments[0].imageUrl;

    // ========================================
    // PHASE 2: WORKFLOW (8 STEPS)
    // ========================================
    console.log('━'.repeat(80));
    console.log('PHASE 2: Process scorecard through workflow');
    console.log('━'.repeat(80));
    console.log();

    // STEP 1: Vision
    console.log('STEP 1: Vision extraction...');
    const scorecardData = await visionService.extractScorecardData(imageUrl);

    console.log('Vision API response:', JSON.stringify(scorecardData, null, 2).substring(0, 500));

    if (!scorecardData || !scorecardData.valid) {
      throw new Error(`Vision rejected: ${scorecardData?.reason || 'Invalid response'}`);
    }

    if (!scorecardData.players || scorecardData.players.length === 0) {
      throw new Error('Vision extracted no players from scorecard');
    }

    console.log(`✅ Extracted: ${scorecardData.courseName}, ${scorecardData.players.length} players\n`);

    // STEP 2: Scoring
    console.log('STEP 2: Calculate stats and ranking...');
    const processedData = scoringService.processScorecard(scorecardData);

    if (!processedData || !processedData.players) {
      throw new Error('Scoring service returned invalid data');
    }

    console.log(`✅ Ranked ${processedData.players.length} players\n`);

    // STEP 3: Event
    console.log('STEP 3: Assign event...');
    const event = await eventService.assignEvent(scorecardData.date);
    console.log(`✅ Event: ${event.name} (${event.type})\n`);

    // STEP 4: Players
    console.log('STEP 4: Validate players...');

    const playerValidation = await playerService.validatePlayers(processedData.players);
    console.log(`✅ Matched: ${playerValidation.matched.length}, Unmatched (ignored): ${playerValidation.unmatched.length}\n`);

    // Use only matched players for points calculation
    const validPlayers = playerValidation.matched;

    if (validPlayers.length === 0) {
      throw new Error('No valid players matched - cannot calculate points');
    }

    // STEP 5: Config
    console.log('STEP 5: Load configuration...');
    const configuration = await configService.loadConfiguration(event, scorecardData.courseName);
    console.log(`✅ Points system: ${configuration.pointsSystem.name}\n`);

    // STEP 6: Points
    console.log('STEP 6: Calculate points...');

    const playersWithPoints = pointsService.calculatePoints(
      validPlayers,
      configuration
    );
    console.log(`✅ Points calculated for ${playersWithPoints.length} players\n`);

    // STEP 7-8: Data prep
    console.log('STEP 7-8: Prepare data (DRY RUN)...');
    console.log('⚠️  NOT inserting to database\n');

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(80));
    console.log('✅ FULL INTEGRATION TEST COMPLETED!');
    console.log('='.repeat(80));
    console.log('\n📊 Final Leaderboard:\n');

    playersWithPoints.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`);
      console.log(`      Score: ${p.totalScore} | Rank: ${p.rank} | Points: ${p.points?.finalTotal || 'N/A'}`);
    });

    console.log('\n🎉 All systems working end-to-end!\n');

    return { emails, scorecardData, playersWithPoints };

  } catch (error) {
    console.error('\n❌ FULL INTEGRATION TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testFullWorkflow()
  .then(() => {
    console.log('✅ Test completed');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
