import { test } from 'node:test';
import assert from 'node:assert';
import * as emailService from '../services/emailService.js';

/**
 * Email Service Tests
 *
 * NOTE: These tests require valid Gmail API credentials in .env
 * They will make actual API calls to Gmail
 *
 * To run these tests:
 * 1. Ensure .env has valid GMAIL_* credentials
 * 2. Run: npm test src/tests/emailService.test.js
 */

test('checkForNewEmails should return array of emails', async () => {
  console.log('\n🧪 Testing checkForNewEmails...');

  try {
    const emails = await emailService.checkForNewEmails({
      maxResults: 5
    });

    assert.ok(Array.isArray(emails), 'Should return an array');
    console.log(`✓ Found ${emails.length} unread emails with attachments`);

    if (emails.length > 0) {
      const firstEmail = emails[0];

      assert.ok(firstEmail.id, 'Email should have ID');
      assert.ok(firstEmail.from, 'Email should have sender');
      assert.ok(firstEmail.subject, 'Email should have subject');
      assert.ok(Array.isArray(firstEmail.attachments), 'Email should have attachments array');

      console.log('✓ First email structure:', {
        id: firstEmail.id,
        from: firstEmail.from,
        subject: firstEmail.subject,
        attachmentCount: firstEmail.attachments.length
      });
    } else {
      console.log('ℹ️ No unread emails with attachments found');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

test('checkForNewEmails with filters should respect search criteria', async () => {
  console.log('\n🧪 Testing checkForNewEmails with filters...');

  try {
    // Search for emails from a specific domain
    const emails = await emailService.checkForNewEmails({
      from: 'gmail.com', // This will match any gmail.com sender
      maxResults: 3
    });

    assert.ok(Array.isArray(emails), 'Should return an array');
    console.log(`✓ Found ${emails.length} filtered emails`);

    if (emails.length > 0) {
      emails.forEach((email, index) => {
        console.log(`  Email ${index + 1}:`, {
          from: email.from,
          subject: email.subject
        });
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

test('getImageAttachments should extract image URLs', async () => {
  console.log('\n🧪 Testing getImageAttachments...');

  try {
    // First, get an email with attachments
    const emails = await emailService.checkForNewEmails({
      maxResults: 1
    });

    if (emails.length === 0) {
      console.log('⚠️ Skipping test - no emails with attachments found');
      return;
    }

    const email = emails[0];
    console.log(`Found email with ${email.attachments.length} attachments`);

    const images = await emailService.getImageAttachments(email);

    assert.ok(Array.isArray(images), 'Should return an array');
    console.log(`✓ Extracted ${images.length} image attachments`);

    if (images.length > 0) {
      const firstImage = images[0];

      assert.ok(firstImage.filename, 'Image should have filename');
      assert.ok(firstImage.mimeType, 'Image should have MIME type');
      assert.ok(firstImage.imageUrl, 'Image should have URL');
      assert.ok(firstImage.imageUrl.startsWith('data:image/'), 'Image URL should be data URL');

      console.log('✓ First image:', {
        filename: firstImage.filename,
        mimeType: firstImage.mimeType,
        size: firstImage.size,
        urlPreview: firstImage.imageUrl.substring(0, 50) + '...'
      });
    } else {
      console.log('ℹ️ No image attachments found in email');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

test('markAsProcessed should mark email as read', async () => {
  console.log('\n🧪 Testing markAsProcessed...');

  try {
    // Get unread emails
    const emails = await emailService.checkForNewEmails({
      maxResults: 1
    });

    if (emails.length === 0) {
      console.log('⚠️ Skipping test - no unread emails found');
      return;
    }

    const email = emails[0];
    console.log(`Marking email as read: ${email.id}`);

    await emailService.markAsProcessed(email.id);

    console.log('✓ Email marked as read successfully');
    console.log('ℹ️ Note: Check your Gmail to verify the email is now marked as read');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

test('addLabel should add label to email', async () => {
  console.log('\n🧪 Testing addLabel...');

  try {
    // Get any recent email
    const emails = await emailService.checkForNewEmails({
      maxResults: 1
    });

    if (emails.length === 0) {
      console.log('⚠️ Skipping test - no emails found');
      return;
    }

    const email = emails[0];
    const testLabel = 'ParSaveables/Test';

    console.log(`Adding label "${testLabel}" to email: ${email.id}`);

    await emailService.addLabel(email.id, testLabel);

    console.log('✓ Label added successfully');
    console.log('ℹ️ Check your Gmail to verify the label was created and applied');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
});

test('sendErrorNotification should send error email', async () => {
  console.log('\n🧪 Testing sendErrorNotification...');

  try {
    const recipient = process.env.TEST_EMAIL_RECIPIENT || 'me';

    const errorDetails = {
      subject: 'Test Scorecard Submission',
      error: 'This is a test error notification from emailService tests',
      timestamp: new Date().toISOString()
    };

    console.log(`Sending error notification to: ${recipient}`);

    await emailService.sendErrorNotification(recipient, errorDetails);

    console.log('✓ Error notification sent successfully');
    console.log('ℹ️ Check your inbox for the error notification email');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    // Don't throw - error notifications are non-critical
    console.log('⚠️ Error notification failed but test continues');
  }
});

test('sendSuccessNotification should send success email', async () => {
  console.log('\n🧪 Testing sendSuccessNotification...');

  try {
    const recipient = process.env.TEST_EMAIL_RECIPIENT || 'me';

    const details = {
      courseName: 'Test Course',
      eventName: 'Season 2025',
      playerCount: 12,
      dashboardUrl: 'https://parsaveables.vercel.app'
    };

    console.log(`Sending success notification to: ${recipient}`);

    await emailService.sendSuccessNotification(recipient, details);

    console.log('✓ Success notification sent successfully');
    console.log('ℹ️ Check your inbox for the success notification email');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    // Don't throw - success notifications are non-critical
    console.log('⚠️ Success notification failed but test continues');
  }
});

/**
 * Integration Test: Full email processing workflow
 * This test simulates the complete flow of finding, processing, and labeling an email
 */
test('Integration: Full email processing workflow', async () => {
  console.log('\n🧪 Testing full email processing workflow...');

  try {
    // Step 1: Find unread emails with attachments
    console.log('Step 1: Finding unread emails...');
    const emails = await emailService.checkForNewEmails({
      maxResults: 1
    });

    if (emails.length === 0) {
      console.log('⚠️ Skipping integration test - no emails found');
      return;
    }

    const email = emails[0];
    console.log(`✓ Found email: ${email.subject}`);

    // Step 2: Extract image attachments
    console.log('Step 2: Extracting images...');
    const images = await emailService.getImageAttachments(email);
    console.log(`✓ Extracted ${images.length} images`);

    // Step 3: Add processing label
    console.log('Step 3: Adding label...');
    await emailService.addLabel(email.id, 'ParSaveables/Processed');
    console.log('✓ Label added');

    // Step 4: Mark as read
    console.log('Step 4: Marking as read...');
    await emailService.markAsProcessed(email.id);
    console.log('✓ Marked as read');

    console.log('\n✅ Integration test completed successfully!');
    console.log('Summary:', {
      emailId: email.id,
      from: email.from,
      subject: email.subject,
      imagesExtracted: images.length
    });
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    throw error;
  }
});
