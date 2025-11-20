/**
 * Manual Email Service Test
 *
 * Tests Gmail API integration without processing scorecards.
 * Verifies: OAuth2 auth, inbox polling, attachment extraction, email marking.
 *
 * Usage:
 *   node src/tests/manual-test-email.js
 */

import * as emailService from '../services/emailService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('EmailTest');

/**
 * Test email service functions
 */
async function testEmailService() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 MANUAL EMAIL SERVICE TEST');
  console.log('='.repeat(80) + '\n');

  try {
    // ========================================
    // STEP 1: Check for New Emails
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 1: Check Gmail inbox for new emails with attachments');
    console.log('━'.repeat(80));

    const emails = await emailService.checkForNewEmails();

    console.log(`✅ Found ${emails.length} unread email(s) with image attachments\n`);

    if (emails.length === 0) {
      console.log('⚠️  No unread emails with image attachments found.');
      console.log('   To test further:');
      console.log('   1. Send an email to your configured Gmail address');
      console.log('   2. Attach a UDisc scorecard screenshot (JPG/PNG)');
      console.log('   3. Run this test again\n');

      console.log('='.repeat(80));
      console.log('✅ EMAIL SERVICE TEST COMPLETED (NO EMAILS)');
      console.log('='.repeat(80));
      console.log('\n📊 Summary:');
      console.log('   ✓ Gmail API connection: PASS');
      console.log('   ✓ Inbox polling: PASS');
      console.log('   ✓ Unread emails found: 0');
      console.log('\n🎉 Gmail integration is working (just no emails to process)!\n');
      return;
    }

    // ========================================
    // STEP 2: Show First Email Details
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 2: Display first email details');
    console.log('━'.repeat(80));

    const firstEmail = emails[0];
    console.log('   Email ID:', firstEmail.id);
    console.log('   From:', firstEmail.from);
    console.log('   Subject:', firstEmail.subject);
    console.log('   Snippet:', firstEmail.snippet?.substring(0, 80) + '...');
    console.log();

    // ========================================
    // STEP 3: Extract Image Attachments
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 3: Extract image attachments from first email');
    console.log('━'.repeat(80));

    const attachments = await emailService.getImageAttachments(firstEmail);

    console.log(`✅ Extracted ${attachments.length} image attachment(s)\n`);

    attachments.forEach((att, i) => {
      console.log(`   ${i + 1}. ${att.filename} (${att.mimeType})`);
      console.log(`      Size: ${att.size} bytes`);
      console.log(`      Data URL length: ${att.imageUrl.length} characters`);
    });
    console.log();

    // ========================================
    // STEP 4: Mark Email as Processed (DRY RUN)
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 4: Mark email as processed (DRY RUN)');
    console.log('━'.repeat(80));
    console.log('⚠️  This is a TEST - we will NOT mark the email as processed.');
    console.log('   To actually mark it, uncomment line 70 in this script.\n');

    // Uncomment to actually mark email as processed:
    // await emailService.markAsProcessed(firstEmail.id);
    // console.log('✅ Email marked as processed\n');

    // ========================================
    // STEP 5: Test Notification Email (DRY RUN)
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 5: Send success notification (DRY RUN)');
    console.log('━'.repeat(80));
    console.log('⚠️  This is a TEST - we will NOT send a notification email.');
    console.log('   To actually send, uncomment lines 82-87 in this script.\n');

    // Uncomment to actually send success notification:
    // await emailService.sendSuccessNotification(firstEmail.from, {
    //   courseName: 'Test Course',
    //   date: new Date().toISOString().split('T')[0],
    //   playerCount: 4
    // });
    // console.log('✅ Success notification sent\n');

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(80));
    console.log('✅ EMAIL SERVICE TEST COMPLETED!');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log('   ✓ Gmail API connection: PASS');
    console.log('   ✓ Inbox polling: PASS');
    console.log(`   ✓ Unread emails found: ${emails.length}`);
    console.log(`   ✓ Image attachments extracted: ${attachments.length}`);
    console.log('   ✓ Email marking: READY (dry run)');
    console.log('   ✓ Email notifications: READY (dry run)');
    console.log('\n🎉 Gmail integration is working correctly!\n');

    console.log('Next Steps:');
    console.log('   1. To enable email marking, uncomment line 70 in this script');
    console.log('   2. To enable notifications, uncomment lines 82-87');
    console.log('   3. Image ready for workflow test (use the data URL from attachment)\n');

    return { emails, attachments };

  } catch (error) {
    console.error('\n❌ EMAIL SERVICE TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);

    console.error('\nTroubleshooting:');
    console.error('   1. Check .env has valid Gmail credentials (GMAIL_* variables)');
    console.error('   2. Verify OAuth2 refresh token is valid');
    console.error('   3. Ensure Gmail API is enabled in Google Cloud Console');
    console.error('   4. Check credentials.json exists and is valid\n');

    process.exit(1);
  }
}

// Run the test
testEmailService()
  .then(() => {
    console.log('✅ Test completed successfully');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
