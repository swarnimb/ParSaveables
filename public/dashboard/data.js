/**
 * Data Layer - Supabase queries and data operations
 * Leverages existing backend architecture
 */

// Supabase client (initialized in app.js)
let supabase = null;

export function initSupabase(client) {
    supabase = client;
}

/**
 * Get all events (seasons and tournaments)
 */
export async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get events by type (season or tournament)
 */
export async function getEventsByType(type) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('type', type)
        .order('year', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Get leaderboard for a specific event
 */
export async function getLeaderboard(eventId) {
    // Get rounds for this event
    const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select(`
            id,
            event_id,
            player_rounds (
                player_name,
                rank,
                total_score,
                birdies,
                eagles,
                aces,
                pars,
                bogeys,
                final_total
            )
        `)
        .eq('event_id', eventId);

    if (roundsError) throw roundsError;

    // Aggregate player stats across all rounds
    const playerStats = {};

    rounds.forEach(round => {
        round.player_rounds.forEach(pr => {
            if (!playerStats[pr.player_name]) {
                playerStats[pr.player_name] = {
                    name: pr.player_name,
                    totalPoints: 0,
                    rounds: 0,
                    wins: 0,
                    birdies: 0,
                    eagles: 0,
                    aces: 0,
                    pars: 0,
                    bogeys: 0,
                    avgScore: 0,
                    scores: []
                };
            }

            const stats = playerStats[pr.player_name];
            stats.totalPoints += pr.final_total || 0;
            stats.rounds += 1;
            stats.birdies += pr.birdies || 0;
            stats.eagles += pr.eagles || 0;
            stats.aces += pr.aces || 0;
            stats.pars += pr.pars || 0;
            stats.bogeys += pr.bogeys || 0;
            stats.scores.push(pr.total_score);

            if (pr.rank === 1) {
                stats.wins += 1;
            }
        });
    });

    // Calculate averages and format data
    const leaderboard = Object.values(playerStats).map(player => {
        const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
        player.avgScore = player.rounds > 0 ? (totalScore / player.rounds).toFixed(1) : 0;
        delete player.scores; // Don't need raw scores in output
        return player;
    });

    // Sort by total points (descending)
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    // Add current rank
    leaderboard.forEach((player, index) => {
        player.rank = index + 1;
    });

    return leaderboard;
}

/**
 * Get current active event
 */
export async function getActiveEvent() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'season')
        .order('year', { ascending: false })
        .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
}

/**
 * Process scorecard endpoint call
 */
export async function processScorecard() {
    try {
        const response = await fetch('/api/processScorecard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to process scorecard');
        }

        return data;
    } catch (error) {
        console.error('Process scorecard error:', error);
        throw error;
    }
}
