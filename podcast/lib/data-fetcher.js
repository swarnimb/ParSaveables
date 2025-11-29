/**
 * Data Fetcher Module
 * Fetches tournament and season data from Supabase for podcast script generation
 *
 * ParSaveables - Chain Reactions Podcast
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Initialize Supabase client
 */
export function createSupabaseClient(url, serviceRoleKey) {
  return createClient(url, serviceRoleKey);
}

/**
 * Fetch complete season data including all tournaments and regular rounds
 * @param {object} supabase - Supabase client
 * @param {number} year - Year (e.g., 2025)
 * @returns {Promise<object>} Season data with tournaments and stats
 */
export async function fetchSeasonData(supabase, year) {
  console.log(`Fetching season data for ${year}...`);

  try {
    // 1. Get all events for the year
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('year', year)
      .order('start_date', { ascending: true });

    if (eventsError) throw eventsError;

    console.log(`Found ${events.length} events for ${year}`);

    // 2. Get all rounds for the year
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .order('date', { ascending: true });

    if (roundsError) throw roundsError;

    console.log(`Found ${rounds.length} rounds for ${year}`);

    const roundIds = rounds.map(r => r.id);

    // 3. Get all player rounds for the year
    const { data: playerRounds, error: playerRoundsError } = await supabase
      .from('player_rounds')
      .select('*')
      .in('round_id', roundIds);

    if (playerRoundsError) throw playerRoundsError;

    console.log(`Found ${playerRounds.length} player rounds`);

    // 4. Calculate statistics
    const stats = calculateSeasonStats(events, rounds, playerRounds);

    return {
      year,
      events,
      rounds,
      playerRounds,
      stats,
      totalRounds: rounds.length,
      totalPlayers: stats.players.length
    };

  } catch (error) {
    console.error(`Error fetching season data:`, error);
    throw error;
  }
}

/**
 * Fetch specific tournament data by event ID or name
 * @param {object} supabase - Supabase client
 * @param {string|number} eventIdentifier - Event ID or name
 * @returns {Promise<object>} Tournament data with rounds and stats
 */
export async function fetchTournamentData(supabase, eventIdentifier) {
  console.log(`Fetching tournament data for: ${eventIdentifier}`);

  try {
    // Get event by ID or name
    let eventQuery = supabase.from('events').select('*');

    if (typeof eventIdentifier === 'number') {
      eventQuery = eventQuery.eq('id', eventIdentifier);
    } else {
      eventQuery = eventQuery.ilike('name', `%${eventIdentifier}%`);
    }

    const { data: events, error: eventError } = await eventQuery;

    if (eventError) throw eventError;
    if (!events || events.length === 0) {
      throw new Error(`Tournament not found: ${eventIdentifier}`);
    }

    const event = events[0];
    console.log(`Found event: ${event.name} (${event.type})`);

    // Get rounds for this event
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .eq('event_id', event.id)
      .order('date', { ascending: true });

    if (roundsError) throw roundsError;

    console.log(`Found ${rounds.length} rounds for ${event.name}`);

    const roundIds = rounds.map(r => r.id);

    // Get player rounds
    const { data: playerRounds, error: playerRoundsError } = await supabase
      .from('player_rounds')
      .select('*')
      .in('round_id', roundIds);

    if (playerRoundsError) throw playerRoundsError;

    console.log(`Found ${playerRounds.length} player rounds`);

    // Calculate tournament statistics
    const stats = calculateTournamentStats(event, rounds, playerRounds);

    return {
      event,
      rounds,
      playerRounds,
      stats,
      totalRounds: rounds.length
    };

  } catch (error) {
    console.error(`Error fetching tournament data:`, error);
    throw error;
  }
}

/**
 * Fetch monthly data for recap podcasts
 * @param {object} supabase - Supabase client
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Promise<object>} Monthly data with stats
 */
export async function fetchMonthlyData(supabase, month, year) {
  console.log(`Fetching monthly data for ${year}-${String(month).padStart(2, '0')}...`);

  try {
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;

    // Calculate last day of month
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = new Date(nextYear, nextMonth - 1, 0);
    const endDateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${endDate.getDate()}`;

    // Get rounds for the month
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDateStr)
      .order('date', { ascending: true });

    if (roundsError) throw roundsError;

    console.log(`Found ${rounds.length} rounds in ${year}-${monthStr}`);

    if (rounds.length === 0) {
      return {
        month,
        year,
        rounds: [],
        playerRounds: [],
        stats: null,
        totalRounds: 0,
        message: `No rounds played in ${year}-${monthStr}`
      };
    }

    const roundIds = rounds.map(r => r.id);

    // Get player rounds
    const { data: playerRounds, error: playerRoundsError } = await supabase
      .from('player_rounds')
      .select('*')
      .in('round_id', roundIds);

    if (playerRoundsError) throw playerRoundsError;

    // Calculate monthly statistics
    const stats = calculateMonthlyStats(rounds, playerRounds);

    return {
      month,
      year,
      rounds,
      playerRounds,
      stats,
      totalRounds: rounds.length
    };

  } catch (error) {
    console.error(`Error fetching monthly data:`, error);
    throw error;
  }
}

/**
 * Calculate season statistics from raw data
 * @param {Array} events - Events data
 * @param {Array} rounds - Rounds data
 * @param {Array} playerRounds - Player rounds data
 * @returns {object} Calculated statistics
 */
function calculateSeasonStats(events, rounds, playerRounds) {
  // Group player rounds by player name
  const playerStats = {};

  playerRounds.forEach(pr => {
    if (!playerStats[pr.player_name]) {
      playerStats[pr.player_name] = {
        name: pr.player_name,
        totalPoints: 0,
        rounds: [],
        wins: 0,
        top3: 0,
        aces: 0,
        eagles: 0,
        birdies: 0,
        avgScore: 0,
        bestRound: null,
        worstRound: null
      };
    }

    const stats = playerStats[pr.player_name];
    stats.rounds.push(pr);
    stats.aces += pr.aces || 0;
    stats.eagles += pr.eagles || 0;
    stats.birdies += pr.birdies || 0;

    if (pr.rank === 1) stats.wins++;
    if (pr.rank <= 3) stats.top3++;

    // Track best/worst rounds by score
    if (!stats.bestRound || pr.total_score < stats.bestRound.total_score) {
      stats.bestRound = pr;
    }
    if (!stats.worstRound || pr.total_score > stats.worstRound.total_score) {
      stats.worstRound = pr;
    }
  });

  // Calculate top 10 points and averages for each player
  Object.keys(playerStats).forEach(playerName => {
    const stats = playerStats[playerName];

    // Sort rounds by points (descending) and take top 10
    const sortedRounds = stats.rounds
      .sort((a, b) => (b.final_total || 0) - (a.final_total || 0))
      .slice(0, 10);

    stats.top10Rounds = sortedRounds;
    stats.totalPoints = sortedRounds.reduce((sum, r) => sum + (r.final_total || 0), 0);
    stats.countedRounds = sortedRounds.length;
    stats.totalRoundsPlayed = stats.rounds.length;

    // Calculate average score
    const totalScores = stats.rounds.reduce((sum, r) => sum + (r.total_score || 0), 0);
    stats.avgScore = stats.rounds.length > 0 ? totalScores / stats.rounds.length : 0;
  });

  // Sort players by total points
  const players = Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);

  // Calculate league-wide statistics
  const totalAces = players.reduce((sum, p) => sum + p.aces, 0);
  const totalEagles = players.reduce((sum, p) => sum + p.eagles, 0);
  const totalBirdies = players.reduce((sum, p) => sum + p.birdies, 0);

  // Find notable achievements
  const mostAces = players.reduce((max, p) => p.aces > max.aces ? p : max, players[0]);
  const mostBirdies = players.reduce((max, p) => p.birdies > max.birdies ? p : max, players[0]);
  const mostWins = players.reduce((max, p) => p.wins > max.wins ? p : max, players[0]);

  // Course statistics
  const courseStats = {};
  rounds.forEach(round => {
    if (!courseStats[round.course_name]) {
      courseStats[round.course_name] = {
        name: round.course_name,
        timesPlayed: 0,
        multiplier: round.course_multiplier || 1.0
      };
    }
    courseStats[round.course_name].timesPlayed++;
  });

  const courses = Object.values(courseStats).sort((a, b) => b.timesPlayed - a.timesPlayed);

  return {
    players,
    leaderboard: players.slice(0, 10), // Top 10
    winner: players[0],
    totalAces,
    totalEagles,
    totalBirdies,
    mostAces,
    mostBirdies,
    mostWins,
    courses,
    totalUniquePlayers: players.length,
    seasonEvents: events.filter(e => e.type === 'season').length,
    tournaments: events.filter(e => e.type === 'tournament')
  };
}

/**
 * Calculate tournament statistics
 * @param {object} event - Event data
 * @param {Array} rounds - Rounds data
 * @param {Array} playerRounds - Player rounds data
 * @returns {object} Tournament statistics
 */
function calculateTournamentStats(event, rounds, playerRounds) {
  // Group by player and calculate tournament totals
  const playerStats = {};

  playerRounds.forEach(pr => {
    if (!playerStats[pr.player_name]) {
      playerStats[pr.player_name] = {
        name: pr.player_name,
        totalPoints: 0,
        rounds: [],
        aces: 0,
        eagles: 0,
        birdies: 0,
        bestRoundPoints: 0,
        worstRoundPoints: Infinity
      };
    }

    const stats = playerStats[pr.player_name];
    stats.rounds.push(pr);
    stats.totalPoints += pr.final_total || 0;
    stats.aces += pr.aces || 0;
    stats.eagles += pr.eagles || 0;
    stats.birdies += pr.birdies || 0;

    if (pr.final_total > stats.bestRoundPoints) {
      stats.bestRoundPoints = pr.final_total;
      stats.bestRound = pr;
    }
    if (pr.final_total < stats.worstRoundPoints) {
      stats.worstRoundPoints = pr.final_total;
      stats.worstRound = pr;
    }
  });

  // Sort by total points
  const players = Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);

  // Tournament highlights
  const totalAces = players.reduce((sum, p) => sum + p.aces, 0);
  const totalEagles = players.reduce((sum, p) => sum + p.eagles, 0);
  const totalBirdies = players.reduce((sum, p) => sum + p.birdies, 0);

  const mostAcesPlayer = players.reduce((max, p) => p.aces > max.aces ? p : max, players[0]);
  const mostBirdiesPlayer = players.reduce((max, p) => p.birdies > max.birdies ? p : max, players[0]);

  // Round-by-round winners
  const roundWinners = rounds.map(round => {
    const roundPlayerData = playerRounds.filter(pr => pr.round_id === round.id);
    const winner = roundPlayerData.reduce((max, pr) =>
      (!max || (pr.rank === 1 && pr.rank <= max.rank)) ? pr : max, null
    );

    return {
      roundDate: round.date,
      courseName: round.course_name,
      winner: winner ? winner.player_name : 'Unknown',
      winnerPoints: winner ? winner.final_total : 0
    };
  });

  return {
    event,
    players,
    winner: players[0],
    runnerUp: players[1],
    thirdPlace: players[2],
    totalAces,
    totalEagles,
    totalBirdies,
    mostAcesPlayer,
    mostBirdiesPlayer,
    roundWinners,
    totalParticipants: players.length,
    totalRounds: rounds.length
  };
}

/**
 * Calculate monthly statistics
 * @param {Array} rounds - Rounds data for the month
 * @param {Array} playerRounds - Player rounds data for the month
 * @returns {object} Monthly statistics
 */
function calculateMonthlyStats(rounds, playerRounds) {
  // Group by player
  const playerStats = {};

  playerRounds.forEach(pr => {
    if (!playerStats[pr.player_name]) {
      playerStats[pr.player_name] = {
        name: pr.player_name,
        points: 0,
        rounds: 0,
        aces: 0,
        eagles: 0,
        birdies: 0,
        wins: 0
      };
    }

    const stats = playerStats[pr.player_name];
    stats.points += pr.final_total || 0;
    stats.rounds++;
    stats.aces += pr.aces || 0;
    stats.eagles += pr.eagles || 0;
    stats.birdies += pr.birdies || 0;

    if (pr.rank === 1) stats.wins++;
  });

  const players = Object.values(playerStats).sort((a, b) => b.points - a.points);

  // Course breakdown
  const courseStats = {};
  rounds.forEach(round => {
    if (!courseStats[round.course_name]) {
      courseStats[round.course_name] = { name: round.course_name, count: 0 };
    }
    courseStats[round.course_name].count++;
  });

  const courses = Object.values(courseStats).sort((a, b) => b.count - a.count);

  return {
    players,
    topPlayer: players[0],
    courses,
    mostPlayedCourse: courses[0],
    totalAces: players.reduce((sum, p) => sum + p.aces, 0),
    totalEagles: players.reduce((sum, p) => sum + p.eagles, 0),
    totalBirdies: players.reduce((sum, p) => sum + p.birdies, 0)
  };
}

/**
 * Fetch incremental data since last published episode
 * This is the KEY function for monthly podcasts - gets only NEW data
 * @param {object} supabase - Supabase client
 * @returns {Promise<object>} New rounds data since last episode
 */
export async function fetchDataSinceLastEpisode(supabase) {
  console.log('🔍 Fetching data since last published episode...');

  try {
    // 1. Get the last published episode
    const { data: lastEpisode, error: episodeError } = await supabase
      .from('podcast_episodes')
      .select('*')
      .eq('is_published', true)
      .order('episode_number', { ascending: false })
      .limit(1)
      .single();

    if (episodeError && episodeError.code !== 'PGRST116') { // PGRST116 = no rows
      throw episodeError;
    }

    let startDate, lastEpisodeNumber, lastEpisodeData;

    if (!lastEpisode) {
      // First episode ever - get ALL data
      console.log('📌 No previous episodes found - fetching ALL data');
      startDate = '2024-01-01'; // Get everything from the beginning
      lastEpisodeNumber = 0;
      lastEpisodeData = null;
    } else {
      // Get data since last episode's end date
      startDate = new Date(lastEpisode.period_end);
      startDate.setDate(startDate.getDate() + 1); // Start day after last episode ended
      startDate = startDate.toISOString().split('T')[0];
      lastEpisodeNumber = lastEpisode.episode_number;
      lastEpisodeData = lastEpisode;

      console.log(`📌 Last episode: #${lastEpisodeNumber} (${lastEpisode.title})`);
      console.log(`📅 Period: ${lastEpisode.period_start} to ${lastEpisode.period_end}`);
      console.log(`🆕 Fetching rounds since ${startDate}`);
    }

    const endDate = new Date().toISOString().split('T')[0]; // Today

    // 2. Get NEW rounds since last episode
    const { data: newRounds, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (roundsError) throw roundsError;

    console.log(`✓ Found ${newRounds.length} NEW rounds since ${startDate}`);

    if (newRounds.length === 0) {
      return {
        hasNewData: false,
        message: `No new rounds since last episode (${startDate})`,
        lastEpisode: lastEpisodeData,
        nextEpisodeNumber: lastEpisodeNumber + 1,
        periodStart: startDate,
        periodEnd: endDate
      };
    }

    const newRoundIds = newRounds.map(r => r.id);

    // 3. Get player rounds for NEW rounds
    const { data: newPlayerRounds, error: playerRoundsError } = await supabase
      .from('player_rounds')
      .select('*')
      .in('round_id', newRoundIds);

    if (playerRoundsError) throw playerRoundsError;

    console.log(`✓ Found ${newPlayerRounds.length} player performances in new rounds`);

    // 4. Get events covered in this period
    const eventIds = [...new Set(newRounds.map(r => r.event_id).filter(Boolean))];
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) throw eventsError;

    // 5. Calculate stats for NEW data
    const newStats = calculateIncrementalStats(newRounds, newPlayerRounds, events);

    // 6. Get PREVIOUS episode's data snapshot for comparison
    let previousStats = null;
    if (lastEpisodeData) {
      const { data: lastScript } = await supabase
        .from('podcast_scripts')
        .select('data_snapshot')
        .eq('episode_id', lastEpisodeData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      previousStats = lastScript?.data_snapshot?.stats || null;
    }

    return {
      hasNewData: true,
      lastEpisode: lastEpisodeData,
      nextEpisodeNumber: lastEpisodeNumber + 1,
      periodStart: startDate,
      periodEnd: endDate,
      newRounds,
      newPlayerRounds,
      events,
      stats: newStats,
      previousStats, // For comparison in script generation
      totalNewRounds: newRounds.length,
      comparisonData: previousStats ? generateComparisonInsights(previousStats, newStats) : null
    };

  } catch (error) {
    console.error('Error fetching incremental data:', error);
    throw error;
  }
}

/**
 * Calculate statistics for incremental data
 * @param {Array} rounds - New rounds
 * @param {Array} playerRounds - New player rounds
 * @param {Array} events - Events in this period
 * @returns {object} Statistics for new data
 */
function calculateIncrementalStats(rounds, playerRounds, events) {
  const playerStats = {};

  playerRounds.forEach(pr => {
    if (!playerStats[pr.player_name]) {
      playerStats[pr.player_name] = {
        name: pr.player_name,
        totalPoints: 0,
        rounds: [],
        wins: 0,
        top3: 0,
        aces: 0,
        eagles: 0,
        birdies: 0
      };
    }

    const stats = playerStats[pr.player_name];
    stats.rounds.push(pr);
    stats.totalPoints += pr.final_total || 0;
    stats.aces += pr.aces || 0;
    stats.eagles += pr.eagles || 0;
    stats.birdies += pr.birdies || 0;

    if (pr.rank === 1) stats.wins++;
    if (pr.rank <= 3) stats.top3++;
  });

  const players = Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);

  // Course breakdown
  const courseStats = {};
  rounds.forEach(round => {
    if (!courseStats[round.course_name]) {
      courseStats[round.course_name] = { name: round.course_name, timesPlayed: 0 };
    }
    courseStats[round.course_name].timesPlayed++;
  });

  const courses = Object.values(courseStats).sort((a, b) => b.timesPlayed - a.timesPlayed);

  return {
    players,
    topPlayer: players[0],
    leaderboard: players.slice(0, 10),
    courses,
    mostPlayedCourse: courses[0],
    totalAces: players.reduce((sum, p) => sum + p.aces, 0),
    totalEagles: players.reduce((sum, p) => sum + p.eagles, 0),
    totalBirdies: players.reduce((sum, p) => sum + p.birdies, 0),
    events: events.map(e => ({ name: e.name, type: e.type }))
  };
}

/**
 * Generate comparison insights between previous and current period
 * @param {object} previousStats - Stats from last episode
 * @param {object} currentStats - Stats from current period
 * @returns {object} Comparison insights
 */
function generateComparisonInsights(previousStats, currentStats) {
  const insights = {
    trends: [],
    newPlayers: [],
    returningPlayers: [],
    improvedPlayers: [],
    declinedPlayers: []
  };

  // Identify new players
  const previousPlayerNames = previousStats.players?.map(p => p.name) || [];
  const currentPlayerNames = currentStats.players.map(p => p.name);

  insights.newPlayers = currentPlayerNames.filter(name => !previousPlayerNames.includes(name));
  insights.returningPlayers = currentPlayerNames.filter(name => previousPlayerNames.includes(name));

  // Compare performance metrics
  if (previousStats.totalAces && currentStats.totalAces > previousStats.totalAces) {
    insights.trends.push(`Aces are UP - ${currentStats.totalAces} vs ${previousStats.totalAces} last time`);
  } else if (previousStats.totalAces && currentStats.totalAces < previousStats.totalAces) {
    insights.trends.push(`Aces are DOWN - ${currentStats.totalAces} vs ${previousStats.totalAces} last time`);
  }

  if (previousStats.totalBirdies && currentStats.totalBirdies > previousStats.totalBirdies) {
    insights.trends.push(`More birdies - ${currentStats.totalBirdies} vs ${previousStats.totalBirdies}`);
  }

  // Top player comparison
  if (previousStats.topPlayer && currentStats.topPlayer) {
    if (currentStats.topPlayer.name === previousStats.topPlayer.name) {
      insights.trends.push(`${currentStats.topPlayer.name} continues to dominate`);
    } else {
      insights.trends.push(`NEW leader: ${currentStats.topPlayer.name} (was ${previousStats.topPlayer.name})`);
    }
  }

  return insights;
}

/**
 * Helper: Get all registered players
 * @param {object} supabase - Supabase client
 * @returns {Promise<Array>} List of registered players
 */
export async function getRegisteredPlayers(supabase) {
  const { data, error } = await supabase
    .from('registered_players')
    .select('player_name')
    .eq('active', true)
    .order('player_name');

  if (error) throw error;
  return data.map(p => p.player_name);
}

export default {
  createSupabaseClient,
  fetchSeasonData,
  fetchTournamentData,
  fetchMonthlyData,
  fetchDataSinceLastEpisode,
  getRegisteredPlayers
};
