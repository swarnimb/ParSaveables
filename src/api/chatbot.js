/**
 * Chatbot API Endpoint
 *
 * Handles dashboard chatbot queries about player stats, leaderboards, and game data.
 * Uses Claude Chat API to provide conversational answers based on database context.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('Chatbot');

// Initialize clients
const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

/**
 * Determine query type from user question
 */
function parseQueryType(question) {
  const lowercaseQ = question.toLowerCase();

  if (lowercaseQ.includes('leaderboard') || lowercaseQ.includes('winning') || lowercaseQ.includes('first place') || lowercaseQ.includes('standings')) {
    return 'leaderboard';
  }

  if (lowercaseQ.includes('stats for') || lowercaseQ.includes('how is') || lowercaseQ.includes('how did')) {
    return 'player_stats';
  }

  if (lowercaseQ.includes('course') || lowercaseQ.includes('where') || lowercaseQ.includes('location')) {
    return 'course_info';
  }

  if (lowercaseQ.includes('recent') || lowercaseQ.includes('last round') || lowercaseQ.includes('latest')) {
    return 'recent_rounds';
  }

  return 'general';
}

/**
 * Extract player name from question
 */
function extractPlayerName(question) {
  // Common patterns: "stats for [Name]", "how is [Name] doing", "how did [Name] do"
  const patterns = [
    /stats for ([a-zA-Z\s]+)/i,
    /how (?:is|did) ([a-zA-Z\s]+) (?:doing|do)/i,
    /([a-zA-Z\s]+)'s stats/i,
    /about ([a-zA-Z\s]+)/i
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Fetch leaderboard data for current season
 */
async function getLeaderboardData() {
  logger.info('Fetching leaderboard data');

  // Get current active season
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('type', 'season')
    .eq('is_active', true)
    .order('year', { ascending: false })
    .limit(1);

  if (eventError || !events || events.length === 0) {
    throw new Error('No active season found');
  }

  const currentSeason = events[0];

  // Get all rounds for this season with player stats
  const { data: rounds, error: roundsError } = await supabase
    .from('rounds')
    .select(`
      id,
      date,
      course_name,
      player_rounds (
        player_name,
        rank,
        total_score,
        birdies,
        eagles,
        aces,
        final_total
      )
    `)
    .order('date', { ascending: false });

  if (roundsError) {
    throw new Error(`Failed to fetch rounds: ${roundsError.message}`);
  }

  // Calculate season totals per player
  const playerTotals = {};

  for (const round of rounds) {
    for (const pr of round.player_rounds) {
      if (!playerTotals[pr.player_name]) {
        playerTotals[pr.player_name] = {
          totalPoints: 0,
          rounds: 0,
          wins: 0,
          birdies: 0,
          eagles: 0,
          aces: 0
        };
      }

      playerTotals[pr.player_name].totalPoints += pr.final_total || 0;
      playerTotals[pr.player_name].rounds += 1;
      playerTotals[pr.player_name].birdies += pr.birdies || 0;
      playerTotals[pr.player_name].eagles += pr.eagles || 0;
      playerTotals[pr.player_name].aces += pr.aces || 0;

      if (pr.rank === 1) {
        playerTotals[pr.player_name].wins += 1;
      }
    }
  }

  // Convert to array and sort by total points
  const leaderboard = Object.entries(playerTotals)
    .map(([name, stats]) => ({ player: name, ...stats }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    season: currentSeason,
    leaderboard: leaderboard.slice(0, 10), // Top 10
    totalRounds: rounds.length
  };
}

/**
 * Fetch stats for specific player
 */
async function getPlayerStats(playerName) {
  logger.info('Fetching player stats', { playerName });

  const { data: playerRounds, error } = await supabase
    .from('player_rounds')
    .select(`
      player_name,
      rank,
      total_score,
      birdies,
      eagles,
      aces,
      pars,
      bogeys,
      final_total,
      rounds (
        date,
        course_name
      )
    `)
    .ilike('player_name', `%${playerName}%`)
    .order('rounds(date)', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }

  if (!playerRounds || playerRounds.length === 0) {
    return null;
  }

  // Calculate aggregates
  const stats = {
    playerName: playerRounds[0].player_name,
    totalRounds: playerRounds.length,
    totalPoints: playerRounds.reduce((sum, r) => sum + (r.final_total || 0), 0),
    wins: playerRounds.filter(r => r.rank === 1).length,
    topThree: playerRounds.filter(r => r.rank <= 3).length,
    totalBirdies: playerRounds.reduce((sum, r) => sum + (r.birdies || 0), 0),
    totalEagles: playerRounds.reduce((sum, r) => sum + (r.eagles || 0), 0),
    totalAces: playerRounds.reduce((sum, r) => sum + (r.aces || 0), 0),
    avgScore: (playerRounds.reduce((sum, r) => sum + r.total_score, 0) / playerRounds.length).toFixed(1),
    recentRounds: playerRounds.slice(0, 5).map(r => ({
      date: r.rounds.date,
      course: r.rounds.course_name,
      rank: r.rank,
      score: r.total_score,
      points: r.final_total
    }))
  };

  return stats;
}

/**
 * Fetch course information
 */
async function getCourseInfo() {
  logger.info('Fetching course info');

  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('active', true)
    .order('course_name');

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return courses;
}

/**
 * Fetch recent rounds
 */
async function getRecentRounds(limit = 5) {
  logger.info('Fetching recent rounds', { limit });

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select(`
      id,
      date,
      course_name,
      player_rounds (
        player_name,
        rank,
        total_score,
        final_total
      )
    `)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent rounds: ${error.message}`);
  }

  return rounds;
}

/**
 * Call Claude Chat API with context
 */
async function callClaudeChat(question, context) {
  logger.info('Calling Claude Chat API');

  const systemPrompt = `You are a helpful assistant for a disc golf league tracking system called ParSaveables.
You answer questions about player statistics, leaderboards, courses, and game results.
Use the provided context data to give accurate, conversational answers.
Keep responses concise (2-3 sentences) unless more detail is requested.
If data is missing or unclear, say so rather than guessing.`;

  const userPrompt = `Question: ${question}

Context Data:
${JSON.stringify(context, null, 2)}

Please answer the question based on the context data provided.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: userPrompt
    }]
  });

  return response.content[0].text;
}

/**
 * Main chatbot query handler
 */
export async function handleChatbotQuery(question) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    throw new Error('Question is required');
  }

  logger.info('Processing chatbot query', { question });

  try {
    // Determine query type
    const queryType = parseQueryType(question);
    logger.info('Query type determined', { queryType });

    // Fetch relevant data based on query type
    let context = {};

    switch (queryType) {
      case 'leaderboard':
        context = await getLeaderboardData();
        break;

      case 'player_stats': {
        const playerName = extractPlayerName(question);
        if (!playerName) {
          return { answer: "I couldn't identify which player you're asking about. Please include the player's name in your question." };
        }
        const stats = await getPlayerStats(playerName);
        if (!stats) {
          return { answer: `I couldn't find any stats for "${playerName}". Please check the spelling or try another player.` };
        }
        context = { player: stats };
        break;
      }

      case 'course_info':
        context = { courses: await getCourseInfo() };
        break;

      case 'recent_rounds':
        context = { recentRounds: await getRecentRounds() };
        break;

      case 'general':
        // For general queries, provide leaderboard as default context
        context = await getLeaderboardData();
        break;

      default:
        context = {};
    }

    // Call Claude Chat API
    const answer = await callClaudeChat(question, context);

    logger.info('Chatbot query completed successfully');

    return {
      answer,
      queryType,
      context: queryType // Include query type for frontend to potentially show related data
    };

  } catch (error) {
    logger.error('Chatbot query failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Vercel serverless function handler
 */
export async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { question } = req.body;

    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const result = await handleChatbotQuery(question);

    res.status(200).json(result);

  } catch (error) {
    logger.error('Chatbot endpoint error', { error: error.message });
    res.status(500).json({
      error: 'Failed to process chatbot query',
      message: error.message
    });
  }
}

// Export for Vercel
export default handler;
