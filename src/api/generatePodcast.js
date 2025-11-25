/**
 * Generate Podcast API Endpoint
 *
 * Orchestrates podcast generation workflow:
 * 1. Determine episode period and type
 * 2. Fetch relevant data from database
 * 3. Generate script using Claude AI (TODO)
 * 4. Generate audio using Google TTS (TODO)
 * 5. Upload audio file (TODO)
 * 6. Save episode metadata
 * 7. Publish episode
 *
 * Can be triggered manually (dashboard button) or via Vercel cron
 *
 * NOTE: This is a simplified version that creates episode metadata only.
 * Audio generation will be added in Phase 2.
 */

// Environment configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Main handler for podcast generation
 */
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Import dynamically to avoid build issues
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let episodeId = null;

    try {
        console.log('Starting podcast generation');

        // Step 1: Get next episode number
        const { data: latestEpisode } = await supabase
            .from('podcast_episodes')
            .select('episode_number')
            .order('episode_number', { ascending: false })
            .limit(1)
            .single();

        const episodeNumber = latestEpisode ? latestEpisode.episode_number + 1 : 1;

        // Step 2: Determine period (first episode = all 2025 data)
        const periodStart = episodeNumber === 1 ? '2025-01-01' : new Date().toISOString().split('T')[0];
        const periodEnd = episodeNumber === 1 ? '2025-12-31' : new Date().toISOString().split('T')[0];
        const type = episodeNumber === 1 ? 'season_recap' : 'monthly_recap';

        console.log('Episode details', { episodeNumber, periodStart, periodEnd, type });

        // Step 3: Fetch data for period
        const { data: rounds } = await supabase
            .from('rounds')
            .select('*')
            .gte('date', periodStart)
            .lte('date', periodEnd);

        const roundIds = rounds?.map(r => r.id) || [];

        const { data: playerRounds } = await supabase
            .from('player_rounds')
            .select('*')
            .in('round_id', roundIds);

        // Calculate player stats
        const playerStats = calculatePlayerStats(playerRounds || []);

        // Step 4: Create episode record
        const title = generateEpisodeTitle(episodeNumber, type, periodStart, periodEnd);
        const description = `Recap of ${rounds?.length || 0} rounds featuring ${playerStats.length} players.`;

        const { data: episode, error: createError } = await supabase
            .from('podcast_episodes')
            .insert([{
                episode_number: episodeNumber,
                title,
                description,
                type,
                period_start: periodStart,
                period_end: periodEnd,
                total_rounds_covered: rounds?.length || 0,
                is_published: true,
                published_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (createError) throw createError;

        episodeId = episode.id;

        console.log('Episode created successfully', { episodeId, episodeNumber });

        return res.status(200).json({
            success: true,
            episode: {
                id: episodeId,
                episode_number: episodeNumber,
                title,
                type,
                period_start: periodStart,
                period_end: periodEnd
            },
            message: `Episode ${episodeNumber} generated successfully! (Audio generation coming in Phase 2)`
        });

    } catch (error) {
        console.error('Podcast generation failed', error);

        return res.status(500).json({
            success: false,
            error: error.message || 'Unknown error',
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

