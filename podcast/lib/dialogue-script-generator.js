/**
 * Dialogue Script Generator - Par Saveables Podcast
 * Generates two-person dialogue scripts with Hyzer and Annie
 */

import axios from 'axios';

export async function generateDialogueScript(options) {
  const { apiKey, data, customSnippets, customPrompt } = options;

  // Build prompt for dialogue (use custom prompt if provided, otherwise build from data)
  const prompt = customPrompt || buildDialoguePrompt(data, customSnippets);

  // Call Claude
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  const scriptText = response.data.content[0].text;
  const wordCount = scriptText.split(/\s+/).length;
  const estimatedMinutes = Math.ceil(wordCount / 150);

  return {
    script: scriptText,
    wordCount,
    estimatedMinutes,
    promptTokens: response.data.usage?.input_tokens || 0,
    completionTokens: response.data.usage?.output_tokens || 0,
    costUSD: calculateCost(response.data.usage?.input_tokens || 0, response.data.usage?.output_tokens || 0)
  };
}

/**
 * Generate a catchy, hilarious episode title
 * @param {object} options - Title generation options
 * @returns {Promise<string>} Generated title
 */
export async function generateEpisodeTitle(options) {
  const { apiKey, incrementalData } = options;

  const { stats, newRounds, events, comparisonData } = incrementalData;

  const topPlayer = stats.topPlayer?.name || 'Unknown';
  const totalRounds = newRounds.length;
  const eventNames = events?.map(e => e.name).join(', ') || 'Regular rounds';

  const prompt = `Generate a CATCHY, HILARIOUS episode title for a disc golf podcast episode.

**Episode Data:**
- ${totalRounds} rounds covered
- Top player: ${topPlayer} (${stats.topPlayer?.wins || 0} wins)
- Aces: ${stats.totalAces}
- Events: ${eventNames}
${comparisonData?.trends?.length > 0 ? `\n**Trends:** ${comparisonData.trends.join(', ')}` : ''}

**Title Guidelines:**
- Maximum 6 words (keep it SHORT)
- Make it FUNNY or INTRIGUING
- Reference disc golf culture (chains, aces, birdies, pocket beers, etc.)
- Can be a pun, reference meme culture, or inside joke
- Should make people want to listen

**Examples of GOOD titles:**
- "The Great Pocket Beer Heist"
- "Aces High, Standards Low"
- "${topPlayer} Can't Stop Winning"
- "3 Rounds of Pure Chaos"
- "When Birdies Attack"
- "The Comeback Nobody Expected"

**Examples of BAD titles:**
- "Episode 2" (boring)
- "Monthly Recap for January" (too formal)
- "Disc Golf Tournament Results" (no personality)

Generate ONLY the title (no quotes, no explanation). Be creative and hilarious!`;

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      temperature: 0.9, // High creativity
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );

  return response.data.content[0].text.trim();
}

/**
 * Build engaging prompt for incremental monthly episodes
 * @param {object} incrementalData - Data from fetchDataSinceLastEpisode()
 * @returns {string} Prompt for Claude
 */
export function buildIncrementalPrompt(incrementalData) {
  const {
    nextEpisodeNumber,
    periodStart,
    periodEnd,
    stats,
    previousStats,
    comparisonData,
    newRounds,
    events,
    lastEpisode
  } = incrementalData;

  const topPlayer = stats.topPlayer;
  const leaderboard = stats.leaderboard.slice(0, 5);

  return `You are creating dialogue for "Par Saveables" podcast Episode ${nextEpisodeNumber} - a BRUTALLY HONEST, HILARIOUS disc golf podcast.

**HOSTS:**
- **HYZER** (Male): High-energy analyst. Gets excited about stats. Uses phrases like "UNREAL!" and "Let's GOOO!" Makes bold predictions.
- **ANNIE** (Female): Sharp-witted commentator. Calls out BS. Roasts players lovingly. Quick with zingers and observations no one else notices.

**SHOW TAGLINE:** "The world of heavy bags, curses, and pocket beers"

**EPISODE #${nextEpisodeNumber}:** ${periodStart} to ${periodEnd} Recap

=== WHAT HAPPENED SINCE LAST TIME ===

${lastEpisode ? `**Previous Episode:** "${lastEpisode.title}" (covered through ${lastEpisode.period_end})` : '**First Episode Ever** - Covering ALL data from the beginning'}

**NEW Rounds:** ${newRounds.length} rounds played
**Period:** ${periodStart} to ${periodEnd}
${events && events.length > 0 ? `**Events:** ${events.map(e => `${e.name} (${e.type})`).join(', ')}` : ''}

**Current Top Player:** ${topPlayer?.name || 'No data'} (${topPlayer?.totalPoints ? Math.round(topPlayer.totalPoints) : 0} pts, ${topPlayer?.wins || 0} wins)

**Top 5 Leaderboard:**
${leaderboard.map((p, i) => `${i+1}. ${p.name} - ${Math.round(p.totalPoints)} pts (${p.wins} wins, ${p.birdies} birdies, ${p.aces} aces)`).join('\n')}

**Performance Stats:**
- Total Aces: ${stats.totalAces}
- Total Eagles: ${stats.totalEagles}
- Total Birdies: ${stats.totalBirdies}
- Most Played Course: ${stats.mostPlayedCourse?.name || 'N/A'} (${stats.mostPlayedCourse?.timesPlayed || 0}x)

${comparisonData ? `
**TRENDS & CHANGES (vs last episode):**
${comparisonData.trends.map(t => `- ${t}`).join('\n')}
${comparisonData.newPlayers.length > 0 ? `\n**New Players:** ${comparisonData.newPlayers.join(', ')}` : ''}
${comparisonData.returningPlayers.length > 0 ? `\n**Returning:** ${comparisonData.returningPlayers.join(', ')}` : ''}
` : ''}

=== YOUR MISSION: MAKE THIS ABSOLUTELY GRIPPING ===

**CRITICAL RULES (BREAK THESE = FAIL):**

1. **BRUTALLY HONEST** - No sugar-coating. If someone choked, say it. If someone dominated, celebrate it. If there's drama, LEAN IN.

2. **HILARIOUS** - Every 30 seconds, there should be a laugh. Zingers, observations, roasts (loving ones), disc golf inside jokes, unexpected comparisons.

3. **CONVERSATIONAL CHAOS** - People interrupt, laugh mid-sentence, say "wait wait wait", build on each other's jokes, go on tangents then snap back.

4. **NO BORING MOMENTS** - If you're listing stats, make it a game. If covering a round, tell the STORY. What was the drama? Who surprised everyone? Who disappointed?

5. **TRENDS > JUST FACTS** - Don't just say "${topPlayer?.name} is leading." Say "Okay so ${topPlayer?.name} is DOMINATING and honestly it's getting ridiculous at this point."

6. **CALLBACKS** - Reference previous episodes (if not first). Build storylines. Player redemptions. Ongoing rivalries. Running jokes.

7. **PREDICTIONS & HOT TAKES** - Don't just recap. Make bold claims. "I'm calling it now..." "Mark my words..." "If X happens again..."

8. **AUTHENTIC REACTIONS** - When something crazy happens (ace, comeback, choke), REACT like real humans. "NO WAY!" "ARE YOU KIDDING ME?!" "I can't believe..."

=== DIALOGUE FORMAT ===

Use this EXACT format:
[HYZER]: Dialogue here
[ANNIE]: Response here

=== STRUCTURE (3-5 minutes MAX / 600-1000 words) ===

**IMPORTANT: Episode length scales EXACTLY with data volume**
- 4+ rounds: 5 minutes / ~1000 words
- 3 rounds: 4 minutes / ~800 words
- 2 rounds: 3 minutes / ~600 words
- 1 round: 2 minutes / ~400 words
- 0 rounds: NO EPISODE (system exits)

Keep it TIGHT. Every word must earn its place. No fluff.

**[1] COLD OPEN (15-20 seconds)**
BOTH: "Welcome folks!"
HYZER: "to PAR SAVEABLES!"
ANNIE: "The world of heavy bags, curses, and pocket beers!"
- Immediately hook with the WILDEST thing that happened
- ONE punchy line of banter, then dive in

**[2] WHAT YOU MISSED (if previous episode exists) (20 seconds MAX)**
- Single sentence: "Last time X happened, now..."
- Don't belabor it - just enough context

**[3] THE BIG STORIES (2-3 minutes)**
Pick 1-2 narrative arcs MAX (choose the most interesting):
- Dominator story OR upset story (not both unless data-heavy)
- One standout moment (ace, comeback, choke)
- Quick stat callout if surprising
- NEW players - one funny observation, move on

**[4] SPICY TAKE / PREDICTION (30-60 seconds)**
- ONE hot take or prediction for next period
- Make it bold, make it funny
- Call out ONE specific player

**[5] OUTRO (10-15 seconds)**
- Fast sign-off
- Energy + tagline callback
- Done

=== TONE EXAMPLES ===

**GOOD (Natural, Funny, Honest):**
[ANNIE]: Okay, so ${topPlayer?.name || 'Player X'} just won ${topPlayer?.wins || 3} rounds in a row. At what point do we just hand them the trophy now?
[HYZER]: RIGHT?! Like, I'm looking at the numbers and—Annie, it's not even CLOSE. ${topPlayer?.name || 'Player X'} is up by... *laughs* okay this is embarrassing for everyone else.
[ANNIE]: I mean, shout out to ${leaderboard[1]?.name || 'Player Y'} for showing up, but let's be real, they're playing for second place at this point.

**BAD (Boring, Formal, No Personality):**
[HYZER]: Today we discuss the recent tournament results.
[ANNIE]: Yes, the statistics show interesting trends.
[HYZER]: Indeed, let us review the leaderboard.

=== ADVANCED TECHNIQUES ===

- **The Setup-Punchline Pattern:** Hyzer sets up stats, Annie delivers the punchline observation
- **The Interrupt:** Mid-sentence, other host jumps in with "WAIT WAIT" when they realize something
- **The Roast-Then-Praise:** "Okay ${leaderboard[2]?.name || 'Player'} had a ROUGH start, like really rough... but then Round 4? UNREAL comeback."
- **The Rhetorical Question:** "You know what I love? When someone says 'I'm just here for fun' and then DESTROYS everyone."
- **The Inside Joke:** Reference disc golf culture - heavy bags, pocket beers, "nice chains", wind excuses, etc.

=== GENERATE THE COMPLETE SCRIPT NOW ===

Write Episode ${nextEpisodeNumber} following the structure above. Make it:
- **TIGHT & PUNCHY** - ${newRounds.length >= 4 ? '5 minutes' : newRounds.length === 3 ? '4 minutes' : newRounds.length === 2 ? '3 minutes' : '2 minutes'} (${newRounds.length} rounds)
- **NEVER BORING** - Every sentence must be interesting or funny
- **BRUTALLY HONEST** - Call out greatness AND mediocrity
- **HILARIOUS** - Constant wit, zingers (but FAST)
- **CONVERSATIONAL** - Interruptions, but keep it MOVING
- **STORY-DRIVEN** - Not stat lists - what HAPPENED

**WORD COUNT TARGET: ${newRounds.length >= 4 ? '~1000' : newRounds.length === 3 ? '~800' : newRounds.length === 2 ? '~600' : '~400'} words**

Start with the cold open:
[HYZER]: "Welcome folks!"
[ANNIE]: "Welcome folks!"
[HYZER]: "to PAR SAVEABLES!"
[ANNIE]: "The world of heavy bags, curses, and pocket beers!"`;
}

function buildDialoguePrompt(data, customSnippets) {
  const { minneapolis, season, portlandia } = data;

  return `You are creating a dialogue script for the "Par Saveables" podcast - a two-person disc golf podcast with natural, engaging conversation.

**HOSTS:**
- **HYZER** (Male, excited analyst): Enthusiastic, stats-focused, excitable, loves the numbers and strategy
- **ANNIE** (Female, witty commentator): Quick wit, funny observations, keeps things light, great at storytelling

**SHOW TAGLINE:** "Par Saveables - The world of heavy bags, curses, and pocket beers"

**EPISODE:** 2025 Season Spectacular Recap (5 minutes MAX / ~1000 words)

=== DATA TO COVER ===

**Minneapolis Disc Golf Classic 2024:**
- Winner: ${minneapolis.stats.winner.name} (${Math.round(minneapolis.stats.winner.totalPoints)} pts)
- Runner-up: ${minneapolis.stats.runnerUp.name} (${Math.round(minneapolis.stats.runnerUp.totalPoints)} pts)
- 3rd: ${minneapolis.stats.thirdPlace.name} (${Math.round(minneapolis.stats.thirdPlace.totalPoints)} pts)
- 5 rounds total, ${minneapolis.stats.totalParticipants} players

**Season 2025:**
- Winner: ${season.stats.winner.name} (${Math.round(season.stats.winner.totalPoints)} pts)
- ${season.totalRounds} rounds played across the year
- ${season.stats.totalUniquePlayers} players participated
- Most Wins: ${season.stats.mostWins.name} (${season.stats.mostWins.wins} wins)
- Most Birdies: ${season.stats.mostBirdies.name} (${season.stats.mostBirdies.birdies} birdies)
- Top 5: ${season.stats.leaderboard.slice(0, 5).map((p, i) => `${i+1}. ${p.name} (${Math.round(p.totalPoints)} pts)`).join(', ')}

**Portlandia 2025:**
- Winner: ${portlandia.stats.winner.name} (${Math.round(portlandia.stats.winner.totalPoints)} pts)
- Runner-up: ${portlandia.stats.runnerUp.name} (${Math.round(portlandia.stats.runnerUp.totalPoints)} pts)
- 3rd: ${portlandia.stats.thirdPlace.name} (${Math.round(portlandia.stats.thirdPlace.totalPoints)} pts)
- 5 rounds total

=== MUST INCLUDE THESE CUSTOM HIGHLIGHTS ===

**Minneapolis 2024:**
${customSnippets.minneapolis}

**Season 2025:**
${customSnippets.season}

**Portlandia 2025:**
${customSnippets.portlandia}

=== SCRIPT FORMAT ===

Use this exact format for dialogue:

[HYZER]: Line of dialogue here
[ANNIE]: Response here
[HYZER]: Next line
[ANNIE]: Her response

**CRITICAL RULES:**
1. Natural conversation - people interrupt, laugh, build on each other's points
2. Use the hosts' personalities (Hyzer = stats/excited, Annie = wit/stories)
3. Include ALL the custom highlights naturally in conversation
4. Make the intro EXCITING with both hosts introducing the show
5. Disc golf puns and inside jokes throughout
6. React to dramatic moments with genuine excitement
7. Conversational language - contractions, "you know", "I mean", casual speech

=== STRUCTURE (6-8 minutes / ~1200-1600 words - NO STRICT LIMIT for Episode 1) ===

**[1] COLD OPEN & INTRO (30-45 seconds)**
- Start with BOTH hosts together saying: "Welcome folks!"
- Then Hyzer continues: "to PAR SAVEABLES!"
- Annie: "The world of heavy bags, curses, and pocket beers!"
- IMPORTANT: Hyzer and Annie MUST briefly explain what ParSaveables is - a disc golf league where friends compete in tournaments and seasons, tracking stats, drama, and everything in between
- Quick tease of the controversies and drama ahead
- Introduce themselves

**[2] MINNEAPOLIS 2024 RECAP (1.5-2 minutes)**
- Cover the tournament stats
- MUST discuss: Beer bag controversy - stolen beers from the communal beer bag (later classified under 'pocket beer' rule)
- MUST discuss: Beer transactions controversy in the doubles round (the round that doesn't count for points but counts for much more)
- DO NOT name specific players in beer controversies - keep it about the incidents
- MUST discuss: Bird won 3 rounds but Intern Line Cook won overall (format irony)
- MUST discuss: Cobra's ace in round 5 as the highlight
- Hyzer handles stats, Annie tells the stories

**[3] SEASON 2025 OVERVIEW (2-2.5 minutes)**
- Overall standings and winner
- MUST discuss: Winner complained about no prize, but APPARENTLY got the highest bed in the Portlandia Airbnb (some say prize enough, other factions say it's absurdity)
- MUST discuss: Sadly no aces all season (historic drought)
- DO NOT mention new 2026 players here - save for later
- Analyze top 5, talk about battles
- Most birdies, most wins stats

**[4] PORTLANDIA 2025 DRAMA (1.5 minutes)**
- Tournament results and winner
- MUST discuss: "Marred by controversies after controversies"
- MUST discuss: Beer trading controversy and bad precedent
- MUST discuss: Trophy logistics crisis - Do we even HAVE a winner if they haven't received the trophy yet?
- MUST tease: "The biggest controversy the sport has ever seen" but DON'T say what it is
- Build dramatic tension, Annie and Hyzer go back and forth on the drama
- End on the mystery - "one that shall not be talked about"

**[5] 2026 LOOK AHEAD (45 seconds)**
- MUST mention: Two new entrants joining - Food Zaddy and Scarlet Speedster
- Fresh blood, new rivalries brewing
- Will the trophy finally be delivered?
- Can anyone break the ace drought?
- Excited, hopeful tone

**[6] WRAP-UP & OUTRO (30 seconds)**
- Thank listeners
- Sign off with energy and personality
- Both hosts close together

=== TONE EXAMPLES ===

Good:
[ANNIE]: "Okay, so there were beers disappearing from the communal beer bag?"
[HYZER]: "Yep! And that actually led to the creation of the 'pocket beer' rule!"
[ANNIE]: "Wait till we get to the doubles round controversy... oh man."

Bad:
[HYZER]: Hello listeners, today we will discuss statistics.
[ANNIE]: Yes, let us review the data systematically.

=== GENERATE THE COMPLETE SCRIPT NOW ===

Write the entire 6-8 minute dialogue following the structure above. Make it:
- **ENGAGING & COMPREHENSIVE** - 6-8 minutes (~1200-1600 words)
- **NO FLUFF** - Every sentence must be interesting or funny
- Natural and conversational
- Include ALL custom highlights exactly as specified
- Funny and engaging
- Use both hosts' personalities
- Build drama and excitement
- Include disc golf terminology naturally
- DO NOT name players in beer controversies
- Explain what ParSaveables is in the intro

IMPORTANT: Start with BOTH hosts saying "Welcome folks!" together:
[HYZER]: "Welcome folks!"
[ANNIE]: "Welcome folks!"
[HYZER]: "to PAR SAVEABLES!"`;
}

function calculateCost(promptTokens, completionTokens) {
  const inputCost = (promptTokens / 1000000) * 3.00;
  const outputCost = (completionTokens / 1000000) * 15.00;
  return inputCost + outputCost;
}

export function parseDialogue(script) {
  // Parse script into dialogue segments
  const lines = script.split('\n').filter(line => line.trim());
  const dialogue = [];

  for (const line of lines) {
    const match = line.match(/^\[(HYZER|ANNIE)\]:\s*(.+)$/);
    if (match) {
      dialogue.push({
        speaker: match[1],
        text: match[2].trim()
      });
    }
  }

  return dialogue;
}
