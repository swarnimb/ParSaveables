/**
 * Test Data Fetcher Module
 * Tests Supabase queries to ensure data is fetched correctly
 *
 * Usage: node test-data-fetcher.js
 */

import 'dotenv/config';
import { createSupabaseClient, fetchSeasonData, fetchTournamentData, fetchMonthlyData, getRegisteredPlayers } from './lib/data-fetcher.js';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n╔═══════════════════════════════════════════════════╗');
console.log('║  🧪 Testing Data Fetcher Module                  ║');
console.log('╚═══════════════════════════════════════════════════╝\n');

/**
 * Test suite
 */
async function runTests() {
  try {
    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('✓ Supabase client created\n');

    // Test 1: Fetch registered players
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 1: Fetch Registered Players');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const players = await getRegisteredPlayers(supabase);
    console.log(`Found ${players.length} registered players:`);
    players.forEach((player, i) => {
      console.log(`  ${i + 1}. ${player}`);
    });
    console.log('\n✅ Test 1 passed\n');

    // Test 2: Fetch Minneapolis 2024 tournament
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 2: Fetch Minneapolis 2024 Tournament');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const minneapolisData = await fetchTournamentData(supabase, 'Minneapolis Disc Golf Classic 2024');
    console.log(`Event: ${minneapolisData.event.name}`);
    console.log(`Type: ${minneapolisData.event.type}`);
    console.log(`Dates: ${minneapolisData.event.start_date} to ${minneapolisData.event.end_date}`);
    console.log(`Total Rounds: ${minneapolisData.totalRounds}`);
    console.log(`Total Players: ${minneapolisData.stats.totalParticipants}`);
    console.log(`Winner: ${minneapolisData.stats.winner.name} (${Math.round(minneapolisData.stats.winner.totalPoints)} pts)`);
    console.log(`Total Aces: ${minneapolisData.stats.totalAces}`);
    console.log(`Total Eagles: ${minneapolisData.stats.totalEagles}`);
    console.log(`Total Birdies: ${minneapolisData.stats.totalBirdies}`);
    console.log('\nTop 3:');
    minneapolisData.stats.players.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${Math.round(p.totalPoints)} pts`);
    });
    console.log('\n✅ Test 2 passed\n');

    // Test 3: Fetch Season 2025
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 3: Fetch Season 2025');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const seasonData = await fetchSeasonData(supabase, 2025);
    console.log(`Year: ${seasonData.year}`);
    console.log(`Events: ${seasonData.events.length}`);
    console.log(`Total Rounds: ${seasonData.totalRounds}`);
    console.log(`Total Players: ${seasonData.totalPlayers}`);
    console.log(`Season Winner: ${seasonData.stats.winner.name} (${Math.round(seasonData.stats.winner.totalPoints)} pts)`);
    console.log(`Most Aces: ${seasonData.stats.mostAces.name} (${seasonData.stats.mostAces.aces} aces)`);
    console.log(`Most Birdies: ${seasonData.stats.mostBirdies.name} (${seasonData.stats.mostBirdies.birdies} birdies)`);
    console.log(`Most Wins: ${seasonData.stats.mostWins.name} (${seasonData.stats.mostWins.wins} wins)`);
    console.log('\nTop 5 Leaderboard:');
    seasonData.stats.leaderboard.slice(0, 5).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} - ${Math.round(p.totalPoints)} pts (${p.countedRounds}/${p.totalRoundsPlayed} rounds)`);
    });
    console.log('\nMost Played Courses:');
    seasonData.stats.courses.slice(0, 5).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} - ${c.timesPlayed} rounds (${c.multiplier}x)`);
    });
    console.log('\n✅ Test 3 passed\n');

    // Test 4: Fetch Portlandia 2025 tournament
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 4: Fetch Portlandia 2025 Tournament');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const portlandiaData = await fetchTournamentData(supabase, 'Portlandia 2025');
    console.log(`Event: ${portlandiaData.event.name}`);
    console.log(`Type: ${portlandiaData.event.type}`);
    console.log(`Dates: ${portlandiaData.event.start_date} to ${portlandiaData.event.end_date}`);
    console.log(`Total Rounds: ${portlandiaData.totalRounds}`);
    console.log(`Total Players: ${portlandiaData.stats.totalParticipants}`);
    console.log(`Winner: ${portlandiaData.stats.winner.name} (${Math.round(portlandiaData.stats.winner.totalPoints)} pts)`);
    console.log(`Runner-up: ${portlandiaData.stats.runnerUp.name} (${Math.round(portlandiaData.stats.runnerUp.totalPoints)} pts)`);
    console.log(`3rd Place: ${portlandiaData.stats.thirdPlace.name} (${Math.round(portlandiaData.stats.thirdPlace.totalPoints)} pts)`);
    console.log('\nRound Winners:');
    portlandiaData.stats.roundWinners.forEach((rw, i) => {
      console.log(`  Round ${i + 1} (${rw.roundDate}): ${rw.winner} at ${rw.courseName} (${rw.winnerPoints} pts)`);
    });
    console.log('\n✅ Test 4 passed\n');

    // Test 5: Fetch monthly data
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test 5: Fetch Monthly Data (September 2025)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const monthlyData = await fetchMonthlyData(supabase, 9, 2025);
    if (monthlyData.totalRounds > 0) {
      console.log(`Month: September 2025`);
      console.log(`Total Rounds: ${monthlyData.totalRounds}`);
      console.log(`Top Player: ${monthlyData.stats.topPlayer.name} (${Math.round(monthlyData.stats.topPlayer.points)} pts)`);
      console.log(`Most Played Course: ${monthlyData.stats.mostPlayedCourse.name} (${monthlyData.stats.mostPlayedCourse.count} times)`);
      console.log(`Total Aces: ${monthlyData.stats.totalAces}`);
      console.log(`Total Birdies: ${monthlyData.stats.totalBirdies}`);
      console.log('\nTop 3:');
      monthlyData.stats.players.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name} - ${Math.round(p.points)} pts (${p.rounds} rounds, ${p.wins} wins)`);
      });
    } else {
      console.log(monthlyData.message);
    }
    console.log('\n✅ Test 5 passed\n');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ All 5 tests passed!');
    console.log('\nData fetcher is working correctly. Ready to generate podcasts!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
