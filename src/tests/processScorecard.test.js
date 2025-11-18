import { test } from 'node:test';
import assert from 'node:assert';
import * as processor from '../api/processScorecard.js';

/**
 * Process Scorecard Orchestrator Tests
 *
 * NOTE: These tests require:
 * 1. Valid .env credentials (Supabase, Claude API, Gmail API)
 * 2. Active database with proper schema
 * 3. Real emails with scorecards (for integration test)
 *
 * To run these tests:
 * - Unit tests: npm test src/tests/processScorecard.test.js
 * - Integration test: Requires unread emails in Gmail
 */

test('processSingleScorecard should process a scorecard image URL', async () => {
  console.log('\n🧪 Testing processSingleScorecard...');

  // This test requires a valid scorecard image URL
  // For actual testing, replace with a real scorecard image URL
  const testImageUrl = process.env.TEST_SCORECARD_IMAGE_URL;

  if (!testImageUrl) {
    console.log('⚠️ Skipping test - TEST_SCORECARD_IMAGE_URL not set in .env');
    console.log('ℹ️ Add a scorecard image URL to .env to test this function');
    return;
  }

  try {
    console.log('Processing scorecard from URL...');

    const result = await processor.processSingleScorecard(testImageUrl);

    assert.ok(result, 'Should return result object');
    assert.ok(result.round, 'Should have round object');
    assert.ok(result.round.id, 'Round should have ID');
    assert.ok(result.playerRounds, 'Should have player rounds');
    assert.ok(Array.isArray(result.playerRounds), 'Player rounds should be array');
    assert.ok(result.event, 'Should have event object');
    assert.ok(result.scorecardData, 'Should have scorecard data');
    assert.ok(result.configuration, 'Should have configuration');

    console.log('✓ Scorecard processed successfully!');
    console.log('\nResults:', {
      roundId: result.round.id,
      courseName: result.round.course_name,
      eventName: result.event.name,
      playerCount: result.playerRounds.length,
      topPlayer: result.playerRounds[0]?.player_name,
      topScore: result.playerRounds[0]?.final_total_points
    });

    console.log('\nPlayer Validation:', {
      matched: result.playerValidation.stats.matched,
      unmatched: result.playerValidation.stats.unmatched,
      fuzzyMatches: result.playerValidation.stats.fuzzyMatches
    });

    if (result.playerValidation.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      result.playerValidation.warnings.forEach(warning => {
        console.log(`  - ${warning.message}`);
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

test('processNewScorecards should process emails from Gmail', async () => {
  console.log('\n🧪 Testing processNewScorecards (integration test)...');

  try {
    console.log('Checking Gmail for new scorecards...');

    const results = await processor.processNewScorecards({
      maxEmails: 1, // Process only 1 email for testing
      skipNotifications: true // Don't send notifications during tests
    });

    assert.ok(results, 'Should return results object');
    assert.ok(results.stats, 'Should have stats object');
    assert.ok(typeof results.stats.emailsChecked === 'number', 'Should have emailsChecked count');
    assert.ok(Array.isArray(results.processed), 'Should have processed array');
    assert.ok(Array.isArray(results.failed), 'Should have failed array');

    console.log('✓ Email processing completed!');
    console.log('\nStats:', results.stats);

    if (results.stats.emailsChecked === 0) {
      console.log('ℹ️ No emails found to process');
      return;
    }

    if (results.stats.successful > 0) {
      console.log('\n✅ Successfully processed scorecards:');
      results.processed.forEach((result, index) => {
        console.log(`\n  ${index + 1}. Round ${result.round.id}`);
        console.log(`     Course: ${result.round.course_name}`);
        console.log(`     Event: ${result.event.name}`);
        console.log(`     Players: ${result.playerRounds.length}`);
        console.log(`     Email: ${result.emailId}`);
      });
    }

    if (results.stats.failed > 0) {
      console.log('\n❌ Failed to process:');
      results.failed.forEach((failure, index) => {
        console.log(`\n  ${index + 1}. Email ${failure.emailId}`);
        console.log(`     From: ${failure.from}`);
        console.log(`     Subject: ${failure.subject}`);
        console.log(`     Error: ${failure.error}`);
      });
    }
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    throw error;
  }
});

test('processNewScorecards should handle no emails gracefully', async () => {
  console.log('\n🧪 Testing processNewScorecards with no emails...');

  try {
    // Use a filter that likely won't match any emails
    const results = await processor.processNewScorecards({
      emailFrom: 'nonexistent@example.com',
      maxEmails: 1,
      skipNotifications: true
    });

    assert.ok(results, 'Should return results object');
    assert.strictEqual(results.stats.emailsChecked, 0, 'Should have checked 0 emails');
    assert.strictEqual(results.stats.successful, 0, 'Should have 0 successful');
    assert.strictEqual(results.stats.failed, 0, 'Should have 0 failed');

    console.log('✓ Handled empty inbox gracefully');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

/**
 * Manual Testing Guide
 *
 * To manually test the full workflow:
 *
 * 1. Set up environment variables in .env
 * 2. Send a test email to yourself with a UDisc scorecard image
 * 3. Mark the email as unread
 * 4. Run: npm test src/tests/processScorecard.test.js
 * 5. Check the dashboard to verify the scorecard was added
 *
 * Alternative: Test with a direct image URL
 *
 * 1. Add TEST_SCORECARD_IMAGE_URL to .env
 * 2. Run: npm test src/tests/processScorecard.test.js
 * 3. Check the processSingleScorecard test output
 */

test('Manual testing guide', () => {
  console.log('\n📝 Manual Testing Guide:');
  console.log('\n1. Email-based testing:');
  console.log('   - Send scorecard image to your Gmail');
  console.log('   - Mark email as unread');
  console.log('   - Run: npm test src/tests/processScorecard.test.js');
  console.log('   - Check dashboard for results');

  console.log('\n2. Direct URL testing:');
  console.log('   - Add TEST_SCORECARD_IMAGE_URL=<url> to .env');
  console.log('   - Run: npm test src/tests/processScorecard.test.js');
  console.log('   - Check processSingleScorecard test output');

  console.log('\n3. Vercel deployment testing:');
  console.log('   - Deploy to Vercel');
  console.log('   - POST to /api/processScorecard');
  console.log('   - Check response JSON');

  console.log('\n✓ Guide displayed');
});
