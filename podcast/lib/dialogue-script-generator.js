/**
 * Dialogue Script Generator - Par Saveables Podcast
 * Generates two-person dialogue scripts with Hyzer and Annie
 */

import axios from 'axios';

export async function generateDialogueScript(options) {
  const { apiKey, data, customSnippets } = options;

  // Build prompt for dialogue
  const prompt = buildDialoguePrompt(data, customSnippets);

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

function buildDialoguePrompt(data, customSnippets) {
  const { minneapolis, season, portlandia } = data;

  return `You are creating a dialogue script for the "Par Saveables" podcast - a two-person disc golf podcast with natural, engaging conversation.

**HOSTS:**
- **HYZER** (Male, excited analyst): Enthusiastic, stats-focused, excitable, loves the numbers and strategy
- **ANNIE** (Female, witty commentator): Quick wit, funny observations, keeps things light, great at storytelling

**SHOW TAGLINE:** "Par Saveables - The world of heavy bags, curses, and pocket beers"

**EPISODE:** 2025 Season Spectacular Recap (10 minutes / ~2000 words)

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

=== STRUCTURE (10 minutes) ===

**[1] COLD OPEN & INTRO (1 minute)**
- Start with BOTH hosts together saying: "Welcome folks!"
- Then Hyzer continues: "to PAR SAVEABLES!"
- Annie: "The world of heavy bags, curses, and pocket beers!"
- Quick tease of the controversies and drama ahead
- Introduce themselves and what's coming

**[2] MINNEAPOLIS 2024 RECAP (2.5 minutes)**
- Cover the tournament stats
- MUST discuss: pocket beer controversies (Butter Cookie/Jaguar, Jaguar/Jabba)
- MUST discuss: Bird won 3 rounds but Intern Line Cook won overall (format irony)
- MUST discuss: Cobra's ace in round 5 as the highlight
- Hyzer handles stats, Annie tells the stories

**[3] SEASON 2025 OVERVIEW (3 minutes)**
- Overall standings and winner
- MUST discuss: Winner complained about no prize, others joked about "highest bed at Portlandia"
- MUST discuss: Sadly no aces all season
- MUST discuss: Two new entrants for 2026 (Food Zaddy and Scarlet Speedster)
- Analyze top 5, talk about battles
- Most birdies, most wins stats

**[4] PORTLANDIA 2025 DRAMA (2.5 minutes)**
- Tournament results and winner
- MUST discuss: "Marred by controversies after controversies"
- MUST discuss: Beer trading controversy and bad precedent
- MUST tease: "The biggest controversy the sport has ever seen" but DON'T say what it is
- Build dramatic tension, Annie and Hyzer go back and forth on the drama
- End on the mystery - "one that shall not be talked about"

**[5] WRAP-UP & OUTRO (1 minute)**
- Quick 2026 preview mention
- Thank listeners
- Sign off with energy and personality
- Both hosts close together

=== TONE EXAMPLES ===

Good:
[ANNIE]: "Okay, so let me get this straight - Butter Cookie and Jaguar had a whole thing about pocket beers?"
[HYZER]: "Oh yeah! And that's just the beginning, Annie. Wait till you hear about the borrowed beers!"

Bad:
[HYZER]: Hello listeners, today we will discuss statistics.
[ANNIE]: Yes, let us review the data systematically.

=== GENERATE THE COMPLETE SCRIPT NOW ===

Write the entire 10-minute dialogue following the structure above. Make it:
- Natural and conversational
- Include ALL custom highlights
- Funny and engaging
- Use both hosts' personalities
- Build drama and excitement
- Include disc golf terminology naturally

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
