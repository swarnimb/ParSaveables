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
 * Get round-by-round progression data for an event
 */
export async function getRoundProgression(eventId) {
    // Get rounds for this event
    const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select('id, date, course_name')
        .eq('event_id', eventId)
        .order('date', { ascending: true });

    if (roundsError) throw roundsError;
    if (!rounds || rounds.length === 0) return [];

    const roundIds = rounds.map(r => r.id);

    // Get player_rounds for these rounds
    const { data: playerRounds, error: prError } = await supabase
        .from('player_rounds')
        .select('player_name, final_total, round_id')
        .in('round_id', roundIds);

    if (prError) throw prError;

    // Get event players to filter
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('players')
        .eq('id', eventId)
        .single();

    if (eventError) throw eventError;
    const eventPlayers = event.players || [];

    // Build progression data
    const playerProgressions = {};

    playerRounds.forEach(pr => {
        if (!eventPlayers.includes(pr.player_name)) return;

        if (!playerProgressions[pr.player_name]) {
            playerProgressions[pr.player_name] = {};
        }
        playerProgressions[pr.player_name][pr.round_id] = pr.final_total || 0;
    });

    // Calculate cumulative points for each player across rounds
    const progressionData = Object.entries(playerProgressions).map(([playerName, roundPoints]) => {
        let cumulative = 0;
        const points = rounds.map(round => {
            const roundScore = roundPoints[round.id] || 0;
            cumulative += roundScore;
            return cumulative;
        });

        return {
            playerName,
            points,
            finalTotal: cumulative
        };
    });

    return {
        rounds: rounds.map(r => ({ date: r.date, course: r.course_name })),
        players: progressionData.sort((a, b) => b.finalTotal - a.finalTotal)
    };
}

/**
 * Get average score by tier (for seasons) or by round (for tournaments)
 * For a specific player and event
 */
export async function getPlayerScoresByTier(eventId, playerName) {
    // Get event type
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('type')
        .eq('id', eventId)
        .single();

    if (eventError) throw eventError;

    // Get rounds for this event with course info
    const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select('id, course_name, date')
        .eq('event_id', eventId)
        .order('date', { ascending: true });

    if (roundsError) throw roundsError;
    if (!rounds || rounds.length === 0) return null;

    const roundIds = rounds.map(r => r.id);

    // Get player_rounds for this player
    const { data: playerRounds, error: prError } = await supabase
        .from('player_rounds')
        .select('round_id, final_total')
        .eq('player_name', playerName)
        .in('round_id', roundIds);

    if (prError) throw prError;

    // Get course tiers
    const courseNames = [...new Set(rounds.map(r => r.course_name))];
    const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('course_name, tier')
        .in('course_name', courseNames);

    if (coursesError) throw coursesError;

    // Build course tier map
    const courseTierMap = {};
    courses.forEach(c => {
        courseTierMap[c.course_name] = c.tier;
    });

    // Build player scores map
    const playerScoresMap = {};
    playerRounds.forEach(pr => {
        playerScoresMap[pr.round_id] = pr.final_total || 0;
    });

    if (event.type === 'season') {
        // Group by tier and calculate average
        const tierScores = { 1: [], 2: [], 3: [], 4: [] };

        rounds.forEach(round => {
            const tier = courseTierMap[round.course_name];
            const score = playerScoresMap[round.id];

            if (tier && score !== undefined) {
                tierScores[tier].push(score);
            }
        });

        // Calculate averages
        const tierNames = {
            1: 'Easy',
            2: 'Moderate',
            3: 'Hard',
            4: 'Elite'
        };

        const tierAverages = [];
        [1, 2, 3, 4].forEach(tier => {
            const scores = tierScores[tier];
            if (scores.length > 0) {
                const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                tierAverages.push({
                    label: tierNames[tier],
                    value: parseFloat(avg.toFixed(1)),
                    count: scores.length
                });
            }
        });

        return {
            type: 'tier',
            data: tierAverages
        };
    } else {
        // Tournament - show by round number
        const roundScores = rounds.map((round, index) => ({
            label: `Round ${index + 1}`,
            value: playerScoresMap[round.id] || 0,
            courseName: round.course_name
        })).filter(r => r.value > 0);

        return {
            type: 'round',
            data: roundScores
        };
    }
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
