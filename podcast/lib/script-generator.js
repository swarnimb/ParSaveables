/**
 * Script Generator - Chain Reactions Podcast
 * Generates engaging podcast scripts using Claude AI
 */

import axios from 'axios';

export class ScriptGenerator {
  constructor(apiKey, config = {}) {
    this.apiKey = apiKey;
    this.config = {
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 0.8, // More creative for podcast content
      ...config
    };
  }

  /**
   * Generate season recap script (10 minutes)
   */
  async generateSeasonRecap(seasonData) {
    const prompt = this._buildSeasonRecapPrompt(seasonData);
    return await this._callClaude(prompt);
  }

  /**
   * Generate monthly recap script (3-5 minutes)
   */
  async generateMonthlyRecap(monthlyData) {
    const prompt = this._buildMonthlyRecapPrompt(monthlyData);
    return await this._callClaude(prompt);
  }

  /**
   * Build prompt for season recap
   */
  _buildSeasonRecapPrompt(data) {
    const {
      season,
      totalRounds,
      totalPlayers,
      tournaments,
      leaderboard,
      topPerformances,
      funFacts
    } = data;

    return `You are the host of "Chain Reactions", an energetic and entertaining disc golf podcast for the ParSaveables league.

Create a 10-minute podcast script for the ${season} Season Recap episode.

=== SEASON DATA ===
Total Rounds: ${totalRounds}
Active Players: ${totalPlayers}
Tournaments: ${tournaments.map(t => `${t.name} (${t.rounds} rounds)`).join(', ')}

Top 5 Leaderboard:
${leaderboard.map((p, i) => `${i + 1}. ${p.name} - ${p.points} points (${p.wins} wins, ${p.aces} aces, ${p.eagles} eagles, ${p.birdies} birdies)`).join('\n')}

Top Performances:
${topPerformances.map(p => `- ${p.description}`).join('\n')}

Fun Facts:
${funFacts.map(f => `- ${f}`).join('\n')}

=== SCRIPT REQUIREMENTS ===

**Tone & Style:**
- Enthusiastic sports commentary energy (think ESPN highlights)
- Professional but fun, knowledgeable but accessible
- Include disc golf puns and wordplay naturally
- Build excitement and drama around close competitions
- Celebrate achievements genuinely

**Structure (10 minutes = ~2000 words):**

[COLD OPEN - 20 seconds]
- Start with the most exciting moment/stat from the season
- Hook the listener immediately
- Example: "Picture this: It's Round 3 at Portlandia, chains are flying..."

[INTRO - 20 seconds]
- Welcome to Chain Reactions
- Quick intro of what's covered in this episode
- Energy and enthusiasm

[SECTION 1: SEASON OVERVIEW - 2 minutes]
- Total rounds, courses played, weather conditions
- Growth and participation highlights
- Set the stage for the season story

[SECTION 2: LEADERBOARD BREAKDOWN - 2.5 minutes]
- Top 5 players with stats and stories
- What made each player successful
- Close battles and point races
- Use specific numbers and achievements

[SECTION 3: TOURNAMENT HIGHLIGHTS - 2.5 minutes]
- Portlandia 2025 recap (5 rounds)
- Minneapolis 2024 recap (5 rounds)
- Memorable moments, clutch performances
- Course-specific challenges

[SECTION 4: PLAYER SPOTLIGHTS & STORIES - 2 minutes]
- Individual achievements (aces, comeback stories)
- Rivalries and friendships
- Personal bests and breakthroughs
- Include personality and humor

[SECTION 5: 2026 SEASON PREVIEW - 1 minute]
- What to expect next season
- New courses or changes
- Predictions and excitement-building
- Call to action

[OUTRO - 30 seconds]
- Thank listeners
- Where to find leaderboard/stats
- Tease next episode
- Sign off with energy

**Formatting:**
- Use [MUSIC: description] for music cues
- Use [PAUSE] for dramatic pauses
- Use [EMPHASIS] for words to stress
- Write conversationally (contractions, natural speech)
- Include transitions between sections

**Disc Golf Puns to Sprinkle In:**
- "Parked it" (great throw)
- "Chain music" (making putts)
- "Disc-appointed" (disappointed)
- "Aced it" (did great)
- "Hyzer flipped" (changed dramatically)
- Be creative with player names and their performances

**Data Integration:**
- Use specific numbers (points, rounds, percentages)
- Reference actual player names and achievements
- Mention specific courses and conditions
- Make stats interesting with comparisons

Generate the complete script now. Write naturally as if speaking to disc golf fans who know the players and love the sport. Make it entertaining, informative, and celebration-worthy!`;
  }

  /**
   * Build prompt for monthly recap
   */
  _buildMonthlyRecapPrompt(data) {
    const {
      month,
      year,
      rounds,
      leaderboardChanges,
      topPerformances,
      notableEvents,
      currentStandings
    } = data;

    const targetLength = rounds.length > 3 ? '5 minutes (1000 words)' : '3 minutes (600 words)';

    return `You are the host of "Chain Reactions", an energetic disc golf podcast for the ParSaveables league.

Create a ${targetLength} podcast script for the ${month} ${year} Monthly Recap.

=== MONTHLY DATA ===
Rounds This Month: ${rounds.length}
Courses Played: ${rounds.map(r => `${r.courseName} (${r.date})`).join(', ')}

Top Performances:
${topPerformances.map(p => `- ${p.playerName}: ${p.description}`).join('\n')}

${notableEvents.length > 0 ? `Notable Events:\n${notableEvents.map(e => `- ${e}`).join('\n')}` : ''}

Current Season Standings (Top 5):
${currentStandings.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} - ${p.points} pts (${p.change > 0 ? '+' : ''}${p.change} from last month)`).join('\n')}

Leaderboard Changes:
${leaderboardChanges.map(c => `- ${c.description}`).join('\n')}

=== SCRIPT REQUIREMENTS ===

**Tone:** Fast-paced, energetic, highlight-focused

**Structure (${targetLength}):**

[INTRO - 15 seconds]
- Quick welcome
- Month summary in one punchy sentence

[MONTH OVERVIEW - 1-1.5 minutes]
- Courses played, weather, turnout
- Overall vibe of the month
- Quick stats

[TOP PERFORMANCES - 1.5-2 minutes]
- Best rounds and standout plays
- Aces, eagles, birdies highlights
- Player callouts with specific achievements

[LEADERBOARD UPDATE - 1-1.5 minutes]
- Current top 5 standings
- Biggest point changes
- Battles and races heating up
- Who's climbing, who's holding

[PREVIEW - 30-45 seconds]
- What's coming next month
- Courses to watch
- Keep the momentum

[OUTRO - 15 seconds]
- Quick sign-off
- See you next month

**Style Notes:**
- Keep it punchy and tight
- Use disc golf terminology naturally
- Celebrate good plays enthusiastically
- Build anticipation for next month
- Include 1-2 disc golf puns

Generate the complete script now. Make it feel like a sports highlight reel - exciting, quick, and packed with action!`;
  }

  /**
   * Call Claude API
   */
  async _callClaude(prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          messages: [{
            role: 'user',
            content: prompt
          }]
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );

      const scriptText = response.data.content[0].text;
      const wordCount = scriptText.split(/\s+/).length;
      const estimatedMinutes = Math.ceil(wordCount / 150); // Average speaking pace

      return {
        script: scriptText,
        wordCount,
        estimatedMinutes,
        model: this.config.model,
        promptTokens: response.data.usage?.input_tokens || 0,
        completionTokens: response.data.usage?.output_tokens || 0
      };
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);
      throw new Error(`Script generation failed: ${error.message}`);
    }
  }

  /**
   * Calculate estimated cost for script generation
   */
  calculateCost(promptTokens, completionTokens) {
    // Claude Sonnet 4 pricing (as of Oct 2024)
    const inputCost = (promptTokens / 1000000) * 3.00;  // $3 per 1M input tokens
    const outputCost = (completionTokens / 1000000) * 15.00; // $15 per 1M output tokens
    return inputCost + outputCost;
  }
}

/**
 * Helper: Format duration as human-readable string
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper: Clean script for TTS (remove music cues, formatting)
 */
export function cleanScriptForTTS(script) {
  return script
    .replace(/\[MUSIC:.*?\]/gi, '') // Remove music cues
    .replace(/\[PAUSE\]/gi, ', ') // Convert pauses to commas
    .replace(/\[EMPHASIS\]/gi, '') // Remove emphasis markers
    .replace(/\[.*?\]/gi, '') // Remove any other stage directions
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
    .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
}
