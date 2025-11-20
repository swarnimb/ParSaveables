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
    // STEP 1: Initialize Gmail Client
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 1: Initialize Gmail OAuth2 client');
    console.log('━'.repeat(80));

    const gmail = await emailService.initializeGmailClient();
    console.log('✅ Gmail client initialized successfully!\n');

    // ========================================
    // STEP 2: Check for Unread Emails
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 2: Poll inbox for unread emails with attachments');
    console.log('━'.repeat(80));

    const unreadEmails = await emailService.getUnreadEmails(gmail);

    console.log(`✅ Found ${unreadEmails.length} unread email(s) with attachments\n`);

    if (unreadEmails.length === 0) {
      console.log('⚠️  No unread emails found.');
      console.log('   To test further:');
      console.log('   1. Send an email to your configured Gmail address');
      console.log('   2. Attach a UDisc scorecard screenshot');
      console.log('   3. Run this test again\n');
      return;
    }

    // ========================================
    // STEP 3: Extract Attachments from First Email
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 3: Extract image attachments from first email');
    console.log('━'.repeat(80));

    const firstEmail = unreadEmails[0];
    console.log('   Email ID:', firstEmail.id);
    console.log('   From:', firstEmail.from);
    console.log('   Subject:', firstEmail.subject);
    console.log('   Date:', firstEmail.date);

    const attachments = await emailService.extractAttachments(gmail, firstEmail.id);

    console.log(`\n✅ Extracted ${attachments.length} attachment(s)`);

    attachments.forEach((att, i) => {
      console.log(`   ${i + 1}. ${att.filename} (${att.mimeType})`);
      console.log(`      Size: ${att.data.length} bytes`);
      console.log(`      Data URL preview: ${att.data.substring(0, 60)}...`);
    });
    console.log();

    // ========================================
    // STEP 4: Mark Email as Read (DRY RUN)
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 4: Mark email as read (DRY RUN)');
    console.log('━'.repeat(80));
    console.log('⚠️  This is a TEST - we will NOT mark the email as read.');
    console.log('   To actually mark it, uncomment the code in this script.\n');

    // Uncomment to actually mark email as read:
    // await emailService.markEmailAsRead(gmail, firstEmail.id);
    // console.log('✅ Email marked as read\n');

    // ========================================
    // STEP 5: Test Email Sending (DRY RUN)
    // ========================================
    console.log('━'.repeat(80));
    console.log('STEP 5: Send notification email (DRY RUN)');
    console.log('━'.repeat(80));
    console.log('⚠️  This is a TEST - we will NOT send a test email.');
    console.log('   To actually send, uncomment the code in this script.\n');

    // Uncomment to actually send test email:
    // await emailService.sendEmail(
    //   gmail,
    //   firstEmail.from,
    //   'ParSaveables Test - Email Service Working',
    //   '<h2>✅ Email Service Test Successful</h2><p>Your Gmail API integration is working correctly!</p>'
    // );
    // console.log('✅ Test email sent\n');

    // ========================================
    // SUMMARY
    // ========================================
    console.log('='.repeat(80));
    console.log('✅ EMAIL SERVICE TEST COMPLETED!');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log('   ✓ Gmail OAuth2 authentication: PASS');
    console.log('   ✓ Inbox polling: PASS');
    console.log(`   ✓ Unread emails found: ${unreadEmails.length}`);
    console.log(`   ✓ Attachments extracted: ${attachments.length}`);
    console.log('   ✓ Email marking: READY (dry run)');
    console.log('   ✓ Email sending: READY (dry run)');
    console.log('\n🎉 Gmail integration is working correctly!\n');

    console.log('Next Steps:');
    console.log('   1. To enable email marking, uncomment line 73 in this script');
    console.log('   2. To enable test email sending, uncomment lines 87-92');
    console.log('   3. Run the full workflow test: npm run test:workflow <image>\n');

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
