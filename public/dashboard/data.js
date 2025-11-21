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
 * Uses TOP 10 SCORES only (best 10 rounds count toward total)
 */
export async function getLeaderboard(eventId) {
    // Get event details (for player filtering)
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('players')
        .eq('id', eventId)
        .single();

    if (eventError) throw eventError;

    const eventPlayers = event.players || [];

    // Get rounds for this event
    const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select('id')
        .eq('event_id', eventId);

    if (roundsError) throw roundsError;

    const roundIds = rounds.map(r => r.id);
    if (roundIds.length === 0) return [];

    // Get player_rounds for these rounds
    const { data: playerRounds, error: prError } = await supabase
        .from('player_rounds')
        .select('player_name, final_total, rank, total_score, birdies, eagles, aces, pars, bogeys, round_id')
        .in('round_id', roundIds);

    if (prError) throw prError;

    // Group rounds by player
    const playerAllRounds = {};
    playerRounds.forEach(pr => {
        // Only include players in this event's player list
        if (!eventPlayers.includes(pr.player_name)) return;

        if (!playerAllRounds[pr.player_name]) {
            playerAllRounds[pr.player_name] = [];
        }
        playerAllRounds[pr.player_name].push(pr);
    });

    // Calculate stats using TOP 10 SCORES for ranking, but keep overall stats for display
    const leaderboard = Object.entries(playerAllRounds).map(([name, rounds]) => {
        // Sort by points descending and take top 10
        const sortedRounds = rounds.sort((a, b) => (b.final_total || 0) - (a.final_total || 0));
        const top10 = sortedRounds.slice(0, 10);

        // Top 10 stats (for ranking)
        const totalPoints = top10.reduce((sum, r) => sum + (r.final_total || 0), 0);

        // Overall stats (for dropdown display)
        const totalWins = rounds.filter(r => r.rank === 1).length;
        const totalTopThreeFinishes = rounds.filter(r => r.rank <= 3).length;
        const totalBirdies = rounds.reduce((sum, r) => sum + (r.birdies || 0), 0);
        const totalEagles = rounds.reduce((sum, r) => sum + (r.eagles || 0), 0);
        const totalAces = rounds.reduce((sum, r) => sum + (r.aces || 0), 0);
        const totalPars = rounds.reduce((sum, r) => sum + (r.pars || 0), 0);
        const totalBogeys = rounds.reduce((sum, r) => sum + (r.bogeys || 0), 0);

        // Calculate average points (final_total) across all rounds
        const totalPointsAllRounds = rounds.reduce((sum, r) => sum + (r.final_total || 0), 0);
        const avgScore = rounds.length > 0 ? (totalPointsAllRounds / rounds.length).toFixed(1) : '-';

        return {
            name,
            totalPoints, // Top 10 only (for ranking)
            rounds: rounds.length, // Total rounds played
            countedRounds: top10.length, // Rounds that count toward points (max 10)
            wins: totalWins, // Overall
            topThreeFinishes: totalTopThreeFinishes, // Overall
            birdies: totalBirdies, // Overall
            eagles: totalEagles, // Overall
            aces: totalAces, // Overall
            pars: totalPars, // Overall
            bogeys: totalBogeys, // Overall
            avgScore: avgScore // Overall average points per round
        };
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
