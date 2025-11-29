# Automated Monthly Podcast System

**Status:** ✅ Ready for Production

**First Run:** Manual (to create Episode 1 from all existing data)
**Automated Runs:** Monthly on 1st at 12pm UTC (starting Feb 1, 2026)

---

## How It Works

### Monthly Automation (Feb 1, 2026 onwards)

1. **Vercel Cron** triggers `/api/generatePodcast` on 1st of each month at 12pm UTC
2. **Incremental Data Fetch** - Gets ONLY new rounds since last episode
3. **Comparison Analysis** - Compares stats vs previous episode (trends, new players, performance changes)
4. **Script Generation** - Claude AI creates brutally honest, hilarious dialogue
5. **Audio Generation** - ElevenLabs TTS (or Google TTS fallback)
6. **Mixing** - Adds intro/outro music
7. **Upload** - Publishes to GitHub Releases
8. **Database Tracking** - Saves episode, script, and logs

### Episode Length

**Dynamic Scaling** - Episodes scale EXACTLY with new data:
- **4+ rounds:** 5 minutes / ~1000 words
- **3 rounds:** 4 minutes / ~800 words
- **2 rounds:** 3 minutes / ~600 words
- **1 round:** 2 minutes / ~400 words
- **0 rounds:** No episode generated (system exits)

Scripts are optimized for **tight, punchy delivery** - every word must be interesting or funny. No fluff.

## Intelligence Features

**Episode-to-Episode Continuity:**
- Tracks what was covered in last episode
- Only discusses NEW rounds (no repetition)
- Builds storylines: "Last time we saw X dominate, but NOW..."
- Identifies trends: "Aces are UP this month" or "NEW leader emerged"

**Engaging Script Prompts:**
- **Brutally Honest**: Calls out chokes, celebrates dominance
- **Hilarious**: Zingers every 30 seconds, roasts, disc golf inside jokes
- **Conversational**: Interruptions, laughter, tangents, authentic reactions
- **Story-Driven**: Not just stats - tells WHAT HAPPENED with drama

---

## First Episode (Manual Run)

To generate Episode 1 from ALL existing data:

```bash
cd podcast
npm run generate
```

This will:
- Fetch ALL rounds from the beginning
- Create Episode 1 covering full history
- Upload to GitHub Releases
- Mark as published in database

**IMPORTANT:** Episode 1 must be generated BEFORE Feb 1, 2026 for automation to work correctly.

---

## Database Tables

**podcast_episodes** - Episode metadata
- `episode_number` - Sequential episode number
- `period_start` / `period_end` - Date range covered
- `audio_url` - GitHub Release URL
- `is_published` - Marks episode as complete

**podcast_scripts** - Generated scripts
- `script_text` - Full dialogue
- `data_snapshot` - Stats used (enables comparison for next episode)
- `status` - draft/approved/rejected

**podcast_generation_logs** - Execution tracking
- `stage` - script_generation/audio_generation/upload/complete/failed
- `api_costs` - Claude + TTS costs
- `error_message` - If failed

---

## Configuration

**Environment Variables (.env):**

```bash
# Required
ANTHROPIC_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
GITHUB_TOKEN=your_token
GITHUB_OWNER=your_username
GITHUB_REPO=ParSaveables

# TTS Provider (elevenlabs or google)
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_key
ELEVENLABS_HYZER_VOICE=hWHihsTve3RbzG4PHDBQ
ELEVENLABS_ANNIE_VOICE=54Cze5LrTSyLgbO6Fhlc

# Optional - Google TTS Fallback
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json

# Audio (optional - has defaults)
INTRO_MUSIC_PATH=./assets/intro-music.mp3
OUTRO_MUSIC_PATH=./assets/outro-music.mp3
INTRO_DURATION_SECONDS=12
OUTRO_DURATION_SECONDS=15
```

**Vercel Cron Schedule:**
```json
{
  "crons": [
    {
      "path": "/api/generatePodcast",
      "schedule": "0 12 1 * *"
    }
  ]
}
```

**Cron Explanation:**
- `0` = minute 0
- `12` = hour 12 (noon UTC)
- `1` = day 1 (first of month)
- `*` = every month
- `*` = any day of week

**Example Schedule:**
- Feb 1, 2026 at 12:00 UTC → Episode 2
- Mar 1, 2026 at 12:00 UTC → Episode 3
- Apr 1, 2026 at 12:00 UTC → Episode 4

---

## Costs

**Per Episode (estimated):**
- Claude AI: ~$0.10-0.50 (script generation)
- ElevenLabs TTS: Free tier (10k chars/month)
- Google TTS: Free (1M chars/month fallback)
- GitHub: Free (releases)

**Total: ~$0.10-0.50 per episode** (mostly Claude API)

---

## Manual Trigger

To manually generate an episode (testing or special occasions):

```bash
# Option 1: Run locally
cd podcast
npm run generate

# Option 2: Trigger via API
curl -X POST https://par-saveables.vercel.app/api/generatePodcast
```

---

## Script Quality Guidelines

The system generates scripts following these rules:

1. **Never Boring** - If 10 seconds feels dull, it failed
2. **Brutally Honest** - Calls out greatness AND mediocrity
3. **Hilarious** - Constant wit, observations, zingers
4. **Conversational** - Interruptions, laughter, tangents
5. **Story-Driven** - Not stat lists - tells what HAPPENED

**Tone Examples:**

✅ **Good:**
```
[ANNIE]: Okay, so Player X just won 3 rounds in a row. At what point do we just hand them the trophy now?
[HYZER]: RIGHT?! Like, I'm looking at the numbers and—Annie, it's not even CLOSE.
[ANNIE]: I mean, shout out to Player Y for showing up, but let's be real, they're playing for second place.
```

❌ **Bad:**
```
[HYZER]: Today we discuss tournament results.
[ANNIE]: Yes, the statistics show trends.
```

---

## Monitoring

**Check Generation Status:**

1. **Database Logs:**
```sql
SELECT * FROM podcast_generation_logs
ORDER BY created_at DESC
LIMIT 5;
```

2. **Episode Status:**
```sql
SELECT episode_number, title, is_published, audio_url
FROM podcast_episodes
ORDER BY episode_number DESC;
```

3. **Vercel Logs:**
```bash
vercel logs --prod
```

---

## Troubleshooting

**Episode not generated on schedule:**
- Check Vercel cron logs
- Verify no new rounds exist (system skips if no data)
- Check API endpoint is deployed

**Script quality issues:**
- Review `prompt_used` in podcast_scripts table
- Adjust prompt in `lib/dialogue-script-generator.js`
- Regenerate with `npm run generate:existing`

**Audio generation fails:**
- Check ElevenLabs API key / usage limits
- Fallback to Google TTS: `TTS_PROVIDER=google`
- Check FFmpeg installation for mixing

**Upload fails:**
- Verify GITHUB_TOKEN has releases permission
- Check repo name matches `GITHUB_REPO` env var

---

## Next Steps

1. **Add Intro/Outro Music:**
   - Place files in `podcast/assets/`
   - `intro-music.mp3` (12 seconds)
   - `outro-music.mp3` (15 seconds)

2. **Generate Episode 1:**
   ```bash
   cd podcast
   npm run generate
   ```

3. **Verify Automation:**
   - Wait for Feb 1, 2026
   - Check Vercel logs
   - Verify Episode 2 appears in database + GitHub Releases

4. **Integrate with Dashboard:**
   - Podcast tab will fetch from GitHub Releases API
   - Display episodes with audio player
   - Show episode metadata from database

---

**System Ready!** 🎙️

The automated monthly podcast system is fully configured and ready to run.
