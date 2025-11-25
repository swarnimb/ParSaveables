/**
 * Generate Podcast API Endpoint
 *
 * Orchestrates podcast generation workflow:
 * 1. Determine episode period and type
 * 2. Fetch relevant data from database
 * 3. Generate script using Claude AI
 * 4. Generate audio using Google TTS
 * 5. Upload audio file
 * 6. Save episode metadata
 * 7. Publish episode
 *
 * Can be triggered manually (dashboard button) or via Vercel cron
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger.js';
import {
    getLatestEpisode,
    getNextEpisodeNumber,
    createEpisode,
    updateEpisode,
    publishEpisode,
    logGenerationStage,
    completeGenerationLog,
    determineNextEpisodePeriod
} from '../services/podcastService.js';

// Environment configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Main handler for podcast generation
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let episodeId = null;
    let logId = null;

    try {
        logger.info('Starting podcast generation');

        // Step 1: Determine episode details
        const { periodStart, periodEnd, type } = await determineNextEpisodePeriod(supabase);
        const episodeNumber = await getNextEpisodeNumber(supabase);

        logger.info('Episode details', { episodeNumber, periodStart, periodEnd, type });

        // Step 2: Create episode record
        const episodeData = {
            episode_number: episodeNumber,
            title: generateEpisodeTitle(episodeNumber, type, periodStart, periodEnd),
            description: '', // Will be updated after script generation
            type,
            period_start: periodStart,
            period_end: periodEnd,
            is_published: false
        };

        const episode = await createEpisode(supabase, episodeData);
        episodeId = episode.id;

        logger.info('Created episode record', { episodeId });

        // Step 3: Fetch data for period
        logId = await logGenerationStage(supabase, {
            episode_id: episodeId,
            stage: 'script_generation'
        });

        const episodeContent = await fetchEpisodeData(supabase, periodStart, periodEnd, type);

        logger.info('Fetched episode data', {
            rounds: episodeContent.totalRounds,
            players: episodeContent.players.length
        });

        // Step 4: Generate script
        // TODO: Call existing podcast/lib/script-generator.js
        // For now, create placeholder
        const scriptText = await generatePlaceholderScript(episodeContent, type);

        await completeGenerationLog(supabase, logId, true);

        // Step 5: Update episode with script summary
        await updateEpisode(supabase, episodeId, {
            description: extractDescription(scriptText),
            total_rounds_covered: episodeContent.totalRounds,
            event_ids: episodeContent.eventIds
        });

        // Step 6: Generate audio
        // TODO: Call existing podcast/lib/audio-generator.js
        // For now, skip audio generation

        // Step 7: Publish episode
        await publishEpisode(supabase, episodeId);

        logger.info('Podcast generation complete', { episodeId, episodeNumber });

        return res.status(200).json({
            success: true,
            episode: {
                id: episodeId,
                episode_number: episodeNumber,
                title: episodeData.title,
                type,
                period_start: periodStart,
                period_end: periodEnd
            },
            message: `Episode ${episodeNumber} generated successfully`
        });

    } catch (error) {
        logger.error('Podcast generation failed', { error, episodeId });

        if (logId) {
            await completeGenerationLog(supabase, logId, false, error.message);
        }

        return res.status(500).json({
            success: false,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

/**
 * Generate episode title based on type and period
 */
function generateEpisodeTitle(episodeNumber, type, periodStart, periodEnd) {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    if (type === 'season_recap') {
        const year = startDate.getFullYear();
        return `Chain Reactions #${episodeNumber} - ${year} Season Highlights`;
    }

    if (type === 'monthly_recap') {
        const month = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return `Chain Reactions #${episodeNumber} - ${month} Recap`;
    }

    if (type === 'tournament_special') {
        return `Chain Reactions #${episodeNumber} - Tournament Special`;
    }

    return `Chain Reactions #${episodeNumber}`;
}

/**
 * Fetch all data needed for episode generation
 */
async function fetchEpisodeData(supabase, periodStart, periodEnd, type) {
    try {
        logger.info('Fetching episode data', { periodStart, periodEnd });

        // Fetch rounds in period
        const { data: rounds, error: roundsError } = await supabase
            .from('rounds')
            .select('*')
            .gte('date', periodStart)
            .lte('date', periodEnd)
            .order('date', { ascending: true });

        if (roundsError) throw roundsError;

        const roundIds = rounds.map(r => r.id);

        // Fetch player rounds
        const { data: playerRounds, error: playerRoundsError } = await supabase
            .from('player_rounds')
            .select('*')
            .in('round_id', roundIds);

        if (playerRoundsError) throw playerRoundsError;

        // Fetch events
        const eventIds = [...new Set(rounds.map(r => r.event_id).filter(Boolean))];
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds);

        if (eventsError) throw eventsError;

        // Calculate player statistics
        const playerStats = calculatePlayerStats(playerRounds);

        return {
            rounds,
            playerRounds,
            events,
            eventIds,
            totalRounds: rounds.length,
            players: playerStats,
            type
        };
    } catch (error) {
        logger.error('Failed to fetch episode data', { error });
        throw new Error(`Failed to fetch episode data: ${error.message}`);
    }
}

/**
 * Calculate aggregate player statistics
 */
function calculatePlayerStats(playerRounds) {
    const stats = {};

    playerRounds.forEach(pr => {
        const name = pr.player_name;

        if (!stats[name]) {
            stats[name] = {
                name,
                rounds: 0,
                totalPoints: 0,
                wins: 0,
                topThreeFinishes: 0,
                birdies: 0,
                eagles: 0,
                aces: 0,
                bogeys: 0,
                doubleBogeys: 0
            };
        }

        stats[name].rounds += 1;
        stats[name].totalPoints += pr.points || 0;
        stats[name].wins += pr.rank === 1 ? 1 : 0;
        stats[name].topThreeFinishes += pr.rank <= 3 ? 1 : 0;
        stats[name].birdies += pr.birdies || 0;
        stats[name].eagles += pr.eagles || 0;
        stats[name].aces += pr.aces || 0;
        stats[name].bogeys += pr.bogeys || 0;
        stats[name].doubleBogeys += pr.double_bogeys || 0;
    });

    return Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints);
}

/**
 * Generate placeholder script (temporary until we integrate existing generator)
 */
async function generatePlaceholderScript(episodeContent, type) {
    const { rounds, players, events } = episodeContent;

    const topPlayers = players.slice(0, 5);

    return `
Welcome to Chain Reactions, the ParSaveables disc golf podcast!

${type === 'season_recap' ? 'Season Recap' : 'Monthly Recap'}

We covered ${rounds.length} rounds across ${events.length} events.

Top performers:
${topPlayers.map((p, i) => `${i + 1}. ${p.name} - ${p.totalPoints} points, ${p.wins} wins, ${p.aces} aces`).join('\n')}

Notable stats:
- Total birdies: ${players.reduce((sum, p) => sum + p.birdies, 0)}
- Total eagles: ${players.reduce((sum, p) => sum + p.eagles, 0)}
- Total aces: ${players.reduce((sum, p) => sum + p.aces, 0)}

That's all for this episode! Until next time, keep those chains rattling!
    `.trim();
}

/**
 * Extract description from script (first 200 characters)
 */
function extractDescription(scriptText) {
    const cleaned = scriptText.replace(/\n+/g, ' ').trim();
    return cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
}
