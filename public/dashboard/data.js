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

    // Calculate stats using TOP 10 SCORES
    const leaderboard = Object.entries(playerAllRounds).map(([name, rounds]) => {
        // Sort by points descending and take top 10
        const sortedRounds = rounds.sort((a, b) => (b.final_total || 0) - (a.final_total || 0));
        const top10 = sortedRounds.slice(0, 10);

        const totalPoints = top10.reduce((sum, r) => sum + (r.final_total || 0), 0);
        const totalScore = top10.reduce((sum, r) => sum + r.total_score, 0);

        return {
            name,
            totalPoints,
            rounds: rounds.length, // Total rounds played
            countedRounds: top10.length, // Rounds that count (max 10)
            wins: rounds.filter(r => r.rank === 1).length,
            topThreeFinishes: rounds.filter(r => r.rank <= 3).length,
            birdies: rounds.reduce((sum, r) => sum + (r.birdies || 0), 0),
            eagles: rounds.reduce((sum, r) => sum + (r.eagles || 0), 0),
            aces: rounds.reduce((sum, r) => sum + (r.aces || 0), 0),
            pars: rounds.reduce((sum, r) => sum + (r.pars || 0), 0),
            bogeys: rounds.reduce((sum, r) => sum + (r.bogeys || 0), 0),
            avgScore: top10.length > 0 ? (totalScore / top10.length).toFixed(1) : 0
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
