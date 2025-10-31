# 🎙️ Chain Reactions - ParSaveables Podcast Generator

Automated podcast generation system for the "Chain Reactions" disc golf podcast. Generates professional-quality episodes from tournament data using AI script generation and text-to-speech.

## 📋 Features

- **🤖 AI-Powered Scripts**: Claude AI generates engaging, funny scripts with sports commentary energy
- **🎤 Natural Audio**: Google Cloud Text-to-Speech with Neural2 voices (free tier: 1M chars/month)
- **🎵 Professional Mixing**: FFmpeg integration for intro/outro music with crossfades
- **📤 Automatic Hosting**: Uploads to GitHub releases for free MP3 hosting
- **💾 Database Integration**: Fetches all data from Supabase, saves episode metadata
- **💰 Cost Tracking**: Logs API usage and costs for each episode

## 🎯 Episode Types

### Season Recap (10 minutes)
Comprehensive review of full season including tournaments:
- Minneapolis 2024 tournament recap
- Full Season 2025 standings and highlights
- Portlandia 2025 tournament recap
- Player spotlights, fun facts, memorable moments

### Monthly Recap (5 minutes)
Quick roundup of month's activity:
- Rounds played and courses visited
- Leaderboard changes
- Notable performances
- Preview of upcoming events

## 🚀 Quick Start

### Prerequisites

1. **Node.js** 18.0.0 or higher
2. **FFmpeg** installed on system ([Download](https://ffmpeg.org/download.html))
3. **Google Cloud Account** (free tier) with Text-to-Speech API enabled
4. **GitHub Personal Access Token** with `repo` permissions
5. **Supabase** credentials (service role key)
6. **Anthropic API Key** (for Claude AI)

### Installation

```bash
cd podcast
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in credentials in `.env`:
```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-your-api-key
GITHUB_TOKEN=ghp_your-github-token
GITHUB_OWNER=your-github-username

# Optional (has defaults)
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json
INTRO_MUSIC_PATH=./assets/intro-music.mp3
OUTRO_MUSIC_PATH=./assets/outro-music.mp3
```

3. Setup Google Cloud credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable Text-to-Speech API
   - Create service account → Download JSON key
   - Save as `google-cloud-credentials.json` in podcast folder

4. Download intro/outro music (see `MUSIC_SOURCES.md` for recommendations)

### Test Installation

```bash
# Test data fetching
node test-data-fetcher.js

# Should output:
# ✅ All 5 tests passed!
# Data fetcher is working correctly. Ready to generate podcasts!
```

## 📖 Usage

### Generate Season Recap (Episode 1)

```bash
npm run generate:season

# Or with custom year:
node generate-podcast.js --type=season --year=2025
```

**Output:**
- Script saved to database (`podcast_scripts` table)
- MP3 generated: `output/Chain-Reactions-Episode-1-2025-Season-Recap.mp3`
- Uploaded to GitHub: `https://github.com/user/ParSaveables/releases/tag/podcast-ep1`
- Metadata saved to database (`podcast_episodes` table)

### Generate Monthly Recap

```bash
npm run generate:monthly

# Or with specific month:
node generate-podcast.js --type=monthly --month=9 --year=2025
```

## 🏗️ Project Structure

```
podcast/
├── lib/
│   ├── data-fetcher.js       # Supabase queries
│   ├── script-generator.js   # Claude AI script generation
│   ├── audio-generator.js    # Google TTS audio creation
│   ├── audio-mixer.js        # FFmpeg mixing
│   └── github-uploader.js    # GitHub release upload
├── assets/
│   ├── intro-music.mp3       # 20-second intro
│   └── outro-music.mp3       # 15-second outro
├── output/                   # Final MP3 files
├── temp/                     # Temporary working files
├── generate-podcast.js       # Main orchestrator
├── test-data-fetcher.js      # Data fetching tests
├── package.json
├── .env                      # Configuration (create from .env.example)
├── .env.example              # Template
├── MUSIC_SOURCES.md          # Music download guide
└── README.md                 # This file
```

## 🎵 Audio Configuration

### Voice Settings (`.env`)

```env
TTS_VOICE_NAME=en-US-Neural2-J    # Male, energetic
TTS_VOICE_GENDER=MALE
TTS_SPEAKING_RATE=1.0             # Normal speed
TTS_PITCH=0.0                     # Normal pitch
```

**Available Voices:** [Google Cloud TTS Voices](https://cloud.google.com/text-to-speech/docs/voices)

Recommended alternatives:
- `en-US-Neural2-D` - Male, deep voice
- `en-US-Neural2-A` - Female, clear
- `en-US-Neural2-I` - Male, casual

### Music Setup

See `MUSIC_SOURCES.md` for detailed guide on downloading royalty-free music.

**Quick Option**: Start with voice-only (no music files), add later:
```bash
# Will generate voice-only if music files not found
npm run generate:season
```

## 💰 Cost Breakdown

### Per Episode Costs

| Service | Season Recap (10 min) | Monthly Recap (5 min) | Free Tier |
|---------|----------------------|---------------------|-----------|
| Claude AI (Script) | $0.50 | $0.25 | ❌ Pay per use |
| Google TTS (Audio) | $0.00 | $0.00 | ✅ 1M chars/month |
| FFmpeg (Mixing) | $0.00 | $0.00 | ✅ Free forever |
| GitHub (Hosting) | $0.00 | $0.00 | ✅ Free forever |
| **Total** | **$0.50** | **$0.25** | |

### Annual Costs (13 episodes)

- 1 season recap: $0.50
- 12 monthly recaps: $3.00
- **Total: ~$3.50/year**

All costs logged to `podcast_generation_logs` table for tracking.

## 🗄️ Database Tables

### podcast_episodes
Stores published episode metadata:
```sql
- episode_number: INTEGER (unique)
- title: TEXT
- description: TEXT
- type: TEXT (season_recap, monthly_recap)
- audio_url: TEXT (GitHub download URL)
- duration_seconds: INTEGER
- file_size_mb: DECIMAL
- published_at: TIMESTAMP
- is_published: BOOLEAN
```

### podcast_scripts
Stores AI-generated scripts:
```sql
- episode_id: INTEGER (FK to podcast_episodes)
- script_text: TEXT
- word_count: INTEGER
- estimated_duration_minutes: INTEGER
- generated_by: TEXT (AI model)
- status: TEXT (draft, approved)
```

### podcast_generation_logs
Tracks generation process:
```sql
- episode_id: INTEGER
- stage: TEXT (script_generation, audio_generation, upload, complete)
- success: BOOLEAN
- api_costs: JSONB
- error_message: TEXT
```

## 🐛 Troubleshooting

### "Missing required environment variables"

**Solution:** Check `.env` file has all required values:
```bash
cat .env | grep -E "SUPABASE_URL|ANTHROPIC_API_KEY|GITHUB_TOKEN"
```

### "FFmpeg not found"

**Solution:** Install FFmpeg:
- **Mac**: `brew install ffmpeg`
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html), add to PATH
- **Linux**: `sudo apt-get install ffmpeg`

Test: `ffmpeg -version`

### "Google Cloud credentials not found"

**Solution:**
1. Download service account JSON from Google Cloud Console
2. Save as `google-cloud-credentials.json` in podcast folder
3. Or set absolute path in `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/credentials.json
   ```

### "Tournament not found: Minneapolis 2024"

**Solution:** Check database has event with this name:
```sql
SELECT * FROM events WHERE name ILIKE '%Minneapolis%';
```

Update `generate-podcast.js` line 189 with correct event name.

### "No rounds found for month"

**Normal:** Some months have no rounds. Podcast generation will skip gracefully.

### Music files not found

**Non-blocking:** System will generate voice-only podcast. See `MUSIC_SOURCES.md` to add music later.

## 📊 Testing

### Test Data Fetching

```bash
node test-data-fetcher.js
```

**Expected output:**
```
✅ All 5 tests passed!
  ✓ Registered players
  ✓ Minneapolis 2024 tournament
  ✓ Season 2025
  ✓ Portlandia 2025 tournament
  ✓ Monthly data
```

### Dry Run (Skip Upload)

Generate podcast without uploading to GitHub:
```bash
node generate-podcast.js --type=season --skip-upload
```

## 🎓 How It Works

### Full Pipeline

```
1. Fetch Data (Supabase)
   ↓
2. Generate Script (Claude AI)
   ↓ (~30 seconds)
3. Convert to Audio (Google TTS)
   ↓ (~60 seconds)
4. Mix with Music (FFmpeg)
   ↓ (~10 seconds)
5. Upload to GitHub (Releases)
   ↓ (~30 seconds)
6. Save Metadata (Supabase)
   ↓
7. Complete! (Total: ~2-3 minutes)
```

### Script Generation

Claude AI receives:
- Tournament data (winners, rounds, stats)
- Season leaderboard (top 10 scoring)
- Player achievements (aces, eagles, birdies)
- Course information (most played, difficulty tiers)

Generates:
- Cold open with hook
- Structured segments
- Natural conversational flow
- Disc golf puns and humor
- Sports commentary energy

### Audio Production

Google TTS converts script to speech:
- Neural2 voice for natural sound
- SSML markup for pauses and emphasis
- Speaking rate and pitch adjustments

FFmpeg mixes:
- 20-second intro music with fade-in
- Voice audio
- 15-second outro music with fade-out
- Crossfades between segments
- Volume normalization

## 🚀 Deployment

### GitHub Actions (Optional)

Automate monthly podcasts with GitHub Actions:

`.github/workflows/monthly-podcast.yml`:
```yaml
name: Generate Monthly Podcast
on:
  schedule:
    - cron: '0 0 1 * *'  # First day of month
  workflow_dispatch:  # Manual trigger

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install FFmpeg
        run: sudo apt-get install -y ffmpeg
      - name: Install dependencies
        run: cd podcast && npm install
      - name: Generate podcast
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: cd podcast && npm run generate:monthly
```

Add secrets in GitHub: Settings > Secrets > Actions

## 🤝 Contributing

### Adding New Episode Types

1. Create new script template in `lib/script-generator.js`
2. Add data fetching logic in `lib/data-fetcher.js`
3. Update `generate-podcast.js` with new type
4. Add npm script to `package.json`

### Improving Scripts

Edit prompts in `lib/script-generator.js`:
- Line 45: Season recap prompt
- Line 150: Monthly recap prompt

### Custom Voices

Browse voices: https://cloud.google.com/text-to-speech/docs/voices

Test voice:
```javascript
import { listVoices } from './lib/audio-generator.js';
const voices = await listVoices('./google-cloud-credentials.json');
console.log(voices.filter(v => v.languageCode === 'en-US'));
```

## 📝 License

MIT - Part of ParSaveables project

## 🆘 Support

**Issues?**
1. Check troubleshooting section above
2. Run tests: `node test-data-fetcher.js`
3. Enable debug mode: `DEBUG=true` in `.env`
4. Check logs in `podcast_generation_logs` table

**Questions?**
- Review this README
- Check code comments in `lib/` files
- See `MUSIC_SOURCES.md` for music help

## 🎉 Next Steps

1. **Generate first episode:**
   ```bash
   npm run generate:season
   ```

2. **Share with league:**
   - Post GitHub release URL to GroupMe
   - Add to dashboard (optional)

3. **Setup monthly automation:**
   - Add GitHub Actions workflow
   - Or create manual reminder

4. **Iterate on script quality:**
   - Listen to first episode
   - Adjust prompts in `script-generator.js`
   - Regenerate if needed

---

**Ready to generate your first podcast?** 🚀

```bash
npm run generate:season
```

Let's get this disc on the chains! ⛓️🥏
