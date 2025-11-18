/**
 * Tests for Chatbot API
 *
 * Note: These tests require valid .env credentials and active database connection.
 * Run with: npm test src/tests/chatbot.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { handleChatbotQuery } from '../api/chatbot.js';

console.log('\n🧪 Running chatbot tests...\n');

// Test 1: Leaderboard query
test('handleChatbotQuery should respond to leaderboard question', async () => {
  const question = "Who is winning the season?";

  const result = await handleChatbotQuery(question);

  assert.ok(result, 'Should return result');
  assert.ok(result.answer, 'Should return answer');
  assert.strictEqual(result.queryType, 'leaderboard', 'Should detect leaderboard query type');

  console.log('✓ Leaderboard query test passed');
  console.log('Question:', question);
  console.log('Answer:', result.answer);
  console.log();
});

// Test 2: Player stats query
test('handleChatbotQuery should respond to player stats question', async () => {
  const question = "How did Kyle do in recent rounds?";

  const result = await handleChatbotQuery(question);

  assert.ok(result, 'Should return result');
  assert.ok(result.answer, 'Should return answer');
  assert.strictEqual(result.queryType, 'player_stats', 'Should detect player stats query type');

  console.log('✓ Player stats query test passed');
  console.log('Question:', question);
  console.log('Answer:', result.answer);
  console.log();
});

// Test 3: Course info query
test('handleChatbotQuery should respond to course question', async () => {
  const question = "What courses are in the system?";

  const result = await handleChatbotQuery(question);

  assert.ok(result, 'Should return result');
  assert.ok(result.answer, 'Should return answer');
  assert.strictEqual(result.queryType, 'course_info', 'Should detect course info query type');

  console.log('✓ Course info query test passed');
  console.log('Question:', question);
  console.log('Answer:', result.answer);
  console.log();
});

// Test 4: Recent rounds query
test('handleChatbotQuery should respond to recent rounds question', async () => {
  const question = "What are the latest rounds played?";

  const result = await handleChatbotQuery(question);

  assert.ok(result, 'Should return result');
  assert.ok(result.answer, 'Should return answer');
  assert.strictEqual(result.queryType, 'recent_rounds', 'Should detect recent rounds query type');

  console.log('✓ Recent rounds query test passed');
  console.log('Question:', question);
  console.log('Answer:', result.answer);
  console.log();
});

// Test 5: General query
test('handleChatbotQuery should respond to general question', async () => {
  const question = "Tell me about the disc golf league";

  const result = await handleChatbotQuery(question);

  assert.ok(result, 'Should return result');
  assert.ok(result.answer, 'Should return answer');
  assert.strictEqual(result.queryType, 'general', 'Should detect general query type');

  console.log('✓ General query test passed');
  console.log('Question:', question);
  console.log('Answer:', result.answer);
  console.log();
});

// Test 6: Empty question validation
test('handleChatbotQuery should reject empty question', async () => {
  try {
    await handleChatbotQuery('');
    assert.fail('Should have thrown error for empty question');
  } catch (error) {
    assert.ok(error.message.includes('required'), 'Should throw validation error');
    console.log('✓ Empty question validation test passed');
    console.log();
  }
});

// Test 7: Unknown player
test('handleChatbotQuery should handle unknown player gracefully', async () => {
  const question = "How is NonexistentPlayer123 doing?";

  const result = await handleChatbotQuery(question);

  assert.ok(result, 'Should return result');
  assert.ok(result.answer, 'Should return answer');
  assert.ok(result.answer.toLowerCase().includes('couldn\'t find') ||
            result.answer.toLowerCase().includes('no stats'),
            'Should indicate player not found');

  console.log('✓ Unknown player test passed');
  console.log('Question:', question);
  console.log('Answer:', result.answer);
  console.log();
});

console.log('✅ All chatbot tests completed!\n');
