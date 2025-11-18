# ParSaveables - Podcast System Documentation

## Overview

The ParSaveables Podcast System is an automated podcast generator that creates AI-powered disc golf commentary podcasts featuring two hosts: Hyzer and Annie. The system fetches tournament and season data from Supabase, generates conversational scripts using Claude AI, converts them to audio using text-to-speech services, and publishes episodes to GitHub Releases.

**Podcast Name:** Chain Reactions
**Tagline:** The world of heavy bags, curses, and pocket beers

## Architecture

### Components

1. **Data Fetcher** (`lib/data-fetcher.js`)
   - Connects to Supabase database
   - Fetches season and tournament data
   - Retrieves player stats, round information, course details

2. **Script Generator** (`lib/dialogue-script-generator.js`)
   - Uses Claude AI (Anthropic) to generate natural dialogue scripts
   - Creates conversational banter between Hyzer and Annie
   - Formats output as structured dialogue (SPEAKER: text)

3. **Audio Generators**
   - **ElevenLabs TTS** (`lib/elevenlabs-audio-generator.js`) - Premium human-like voices
   - **Google Cloud TTS** (`lib/google-audio-generator.js`) - Fallback option

4. **Audio Mixer** (`lib/audio-mixer.js`)
   - Uses FFmpeg to combine intro music, dialogue, and outro music
   - Handles fades, transitions, and volume ducking
   - Exports final MP3 podcast episode

5. **GitHub Uploader** (`lib/github-uploader.js`)
   - Creates GitHub releases for each episode
   - Uploads MP3 files as release assets
   - Generates episode metadata and show notes

### Workflow Scripts

- `generate-podcast.js` - Full automated workflow (data → script → audio → upload)
- `generate-dialogue-podcast.js` - Dialogue-focused generation
- `generate-from-existing-script.js` - Generate audio from manually edited scripts
- Test scripts: `test-script-generation.js`, `test-audio-generation.js`, `test-data-fetcher.js`

## Voice Configuration

### ElevenLabs (Primary - Free Tier)

**Character Limit:** 10,000 characters/month (free tier)

**Selected Voices:**
- **Hyzer:** Andriy Tkachenko (`hWHihsTve3RbzG4PHDBQ`) - Sports commentary energy
- **Annie:** Cat (`54Cze5LrTSyLgbO6Fhlc`) - Sarcastic/witty personality

**Voice Settings:**
```javascript
{
  stability: 0.5,        // 0-1: Lower = more variable/expressive
  similarity_boost: 0.75, // 0-1: Higher = closer to original voice
  style: 0.5,            // 0-1: Exaggeration of speaking style
  use_speaker_boost: true
}
```

**Features:**
- Character usage tracking
- Progress saving (resume interrupted generations)
- Retry logic (3 attempts per segment)
- Automatic character limit warnings

### Google Cloud TTS (Fallback)

**Voices:**
- **Hyzer:** `en-US-Neural2-J` (MALE)
- **Annie:** `en-US-Neural2-F` (FEMALE)

**Features:**
- SSML support for prosody, emphasis, pauses
- No character limits
- More robotic than ElevenLabs

### Provider Switching

Set in `.env`:
```bash
TTS_PROVIDER=elevenlabs  # or 'google'
```

## Audio Production

### Music Assets

Located in `podcast/assets/`:
- `intro-music.mp3` - Opening theme (12 seconds by default)
- `outro-music.mp3` - Closing theme (15 seconds by default)

### Audio Mixing Strategies

**1. Simple Concatenate (Current Default)**
```
Intro (12s, fades out over 10s) → Voice (delayed 8s to overlap) → Outro (15s)
```

**2. Full Mix (Alternative)**
```
Intro (full volume → fade) → Voice (clean) → Outro (fade in)
```

**3. Music Bed (Not Currently Used)**
```
Voice (100%) + Background music (20%) throughout
```

### FFmpeg Configuration

**Path (Windows):** `C:\ffmpeg\ffmpeg-8.0-essentials_build\bin\ffmpeg.exe`

**Output Settings:**
- Codec: MP3 (libmp3lame)
- Bitrate: 128 kbps
- Sample Rate: 44.1 kHz
- Channels: Stereo

## Configuration

### Environment Variables (.env)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key

# Text-to-Speech
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_HYZER_VOICE=hWHihsTve3RbzG4PHDBQ
ELEVENLABS_ANNIE_VOICE=54Cze5LrTSyLgbO6Fhlc

# Google Cloud TTS (optional)
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json

# GitHub
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username
GITHUB_REPO=ParSaveables

# Audio Settings
INTRO_DURATION_SECONDS=12
OUTRO_DURATION_SECONDS=15
INTRO_MUSIC_PATH=./assets/intro-music.mp3
OUTRO_MUSIC_PATH=./assets/outro-music.mp3

# Podcast Metadata
PODCAST_SHOW_NAME=Par Saveables
PODCAST_TAGLINE=The world of heavy bags, curses, and pocket beers
```

### NPM Scripts

```bash
# Full generation workflows
npm run generate                 # Auto-detect event type
npm run generate:season          # Force season recap
npm run generate:monthly         # Monthly recap
npm run generate:dialogue        # Dialogue podcast

# Generate from existing script (skip AI generation)
npm run generate:existing

# Testing
npm run test:script             # Test script generation only
npm run test:audio              # Test audio generation only
npm run test:data               # Test data fetcher only
```

## Usage Examples

### Generate Podcast from Scratch

```bash
cd podcast
npm run generate
```

**Steps:**
1. Fetches data from Supabase
2. Generates dialogue script with Claude AI
3. Converts script to audio (ElevenLabs or Google)
4. Mixes audio with intro/outro music
5. Uploads to GitHub Releases

### Generate from Manually Edited Script

```bash
# 1. Edit the script file
# podcast/output/Par-Saveables-EP01-Script.txt

# 2. Generate audio from edited script
npm run generate:existing
```

**Use Case:** When you want to manually tweak the AI-generated script before creating audio.

### Test Components Individually

```bash
# Test data fetching
npm run test:data

# Test script generation (no audio)
npm run test:script

# Test audio generation (with existing script)
npm run test:audio
```

## Character Usage Tracking (ElevenLabs)

The system automatically tracks character usage to stay within the free tier limit:

```
Generating 45 segments...
  [1/45] HYZER: Welcome back to Par Saveables... (67 chars)
  [2/45] ANNIE: Thanks Hyzer! Today we're breaking down... (82 chars)
  ...

✓ Generated 45 audio segments
📊 Total characters used: 6,100/10,000 (61%)
💡 Remaining: 3,900 characters (~28 segments)
```

**Estimate:** A 7-minute episode typically uses 6,000-7,000 characters, allowing 1-2 episodes per month on free tier.

## Dashboard Integration

### Podcast Button & Modal

The ParSaveables dashboard now includes a podcast player:

**Location:** Header navigation bar (🎙️ Podcasts button)

**Features:**
- Fetches episodes from GitHub Releases API
- Displays episode list in scrollable modal
- Inline HTML5 audio player for each episode
- Glassmorphism design matching dashboard aesthetic
- Mobile responsive

**Implementation:**
```javascript
// Fetch from GitHub Releases
fetch('https://api.github.com/repos/owner/ParSaveables/releases')

// Filter releases with .mp3 assets
const podcastReleases = releases.filter(release =>
  release.assets.some(asset => asset.name.endsWith('.mp3'))
);

// Create player for each episode
const audioPlayer = document.createElement('audio');
audioPlayer.controls = true;
audioPlayer.src = audioUrl;
```

**CSS Highlights:**
- Modal: `backdrop-filter: blur(10px)` for glassmorphism
- Episodes: Hover effect with `transform: translateX(5px)`
- Responsive: Max height `80vh` with scrollable content

## Output Files

### Directory Structure

```
podcast/
├── output/
│   ├── Par-Saveables-EP01-Script.txt          # Generated dialogue script
│   ├── Par-Saveables-Episode-1-*.mp3          # Final podcast audio
│   └── episode-metadata.json                  # Episode info
├── temp/
│   ├── dialogue-voice.mp3                     # TTS output (before mixing)
│   ├── segment-000-HYZER.mp3                  # Individual audio segments
│   ├── segment-001-ANNIE.mp3
│   └── elevenlabs-progress.json               # Progress tracker
└── assets/
    ├── intro-music.mp3
    └── outro-music.mp3
```

### GitHub Release Structure

**Release Title:** `Podcast Episode 1: Season Recap`

**Assets:**
- `Par-Saveables-EP01-2025-Season-Recap.mp3` (audio file)

**Description:**
```markdown
# 🎙️ Episode 1: 2025 Season Spectacular

The complete 2025 Par Saveables season recap! Hyzer and Annie break down
Minneapolis 2024, the full season, and the dramatic Portlandia 2025 tournament.

🎙️ Featuring: Pocket beer controversies, scoring format drama, and the
biggest controversy that shall not be named!

🏆 Season Winner: Player Name (123 pts)

The world of heavy bags, curses, and pocket beers!

---
Duration: 7:32
Generated: 2025-10-31
```

## Known Issues & Workarounds

### Issue 1: ElevenLabs Voice Selection
**Problem:** User didn't like the initial voice pairing (Andriy/Cat)
**Status:** Waiting for credit refresh to test new voices
**Workaround:** Use `generate-from-existing-script.js` to regenerate audio without using script generation credits

### Issue 2: FFmpeg Path (Windows)
**Problem:** FFmpeg must be manually installed on Windows
**Solution:** Hardcoded path in `audio-mixer.js` and `elevenlabs-audio-generator.js`
```javascript
const ffmpegPath = 'C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe';
```

### Issue 3: GitHub Asset Naming Conflicts
**Problem:** Cannot upload same filename to existing release
**Solution:** Append version suffix (e.g., `-v2`, `-v3`, `-ElevenLabs-v3`)

## Future Enhancements

Planned but not implemented:
- [ ] Voice cloning for custom character voices (requires paid tier)
- [ ] Automatic episode scheduling and publishing
- [ ] RSS feed generation for podcast apps
- [ ] Sound effects library (crowd reactions, disc throws)
- [ ] Multi-episode season packs
- [ ] Listener question integration
- [ ] Transcription generation
- [ ] Analytics dashboard (downloads, listeners)

## Legal & Ethical Considerations

### Celebrity Voice Impersonation
**Not Supported:** The system does not support celebrity voice cloning (e.g., Samuel L. Jackson, Cardi B)

**Reasons:**
1. **Terms of Service:** ElevenLabs TOS prohibits impersonation without consent
2. **Legal:** Right of publicity laws protect celebrity voices
3. **Ethical:** Unauthorized voice cloning is deceptive

**Alternative:** Use personality-matched pre-made voices from free library

### Voice Cloning (User Voices)
**Requires Paid Tier:** Voice cloning (Starter plan: $5/month minimum)

**Use Cases:**
- Cloning your own voice (with consent)
- Cloning voices of participants who've given written consent

## Troubleshooting

### Error: "ElevenLabs character limit exceeded"
**Solution:** Switch to Google TTS fallback or wait for monthly credit refresh
```bash
# In .env
TTS_PROVIDER=google
```

### Error: "FFmpeg not found"
**Solution:** Install FFmpeg and update path in configuration
```bash
# Windows (with Chocolatey)
choco install ffmpeg

# Mac
brew install ffmpeg

# Linux
apt-get install ffmpeg
```

### Error: "Script file not found"
**Solution:** Run full generation first, then use `generate:existing`
```bash
npm run generate          # Creates script
# Edit script manually
npm run generate:existing # Uses edited script
```

### Audio Quality Issues
**Solutions:**
1. Increase bitrate in `audio-mixer.js`: Change `'-b:a', '128k'` to `'192k'`
2. Use higher quality music assets (44.1 kHz, 320 kbps)
3. Switch to ElevenLabs if using Google TTS

## Dependencies

```json
{
  "@elevenlabs/elevenlabs-js": "^2.20.1",
  "@google-cloud/text-to-speech": "^5.0.1",
  "@octokit/rest": "^20.0.2",
  "@supabase/supabase-js": "^2.39.0",
  "axios": "^1.6.2",
  "dotenv": "^16.3.1",
  "fluent-ffmpeg": "^2.1.2",
  "fs-extra": "^11.2.0"
}
```

**Node Version:** >=18.0.0

## Resources

- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)

---

*Last updated: 2025-10-31*
