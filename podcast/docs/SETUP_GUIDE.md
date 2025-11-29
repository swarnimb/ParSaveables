# 🚀 Podcast System Setup Guide

Step-by-step guide to get the Chain Reactions podcast generator up and running.

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18.0.0+ installed ([Download](https://nodejs.org/))
- [ ] FFmpeg installed ([Download](https://ffmpeg.org/download.html))
- [ ] Supabase credentials (already have from main project)
- [ ] Anthropic API key (already have from main project)
- [ ] GitHub account with personal access token
- [ ] Google Cloud account (free tier)

---

## Step 1: Install Dependencies (2 minutes)

```bash
cd C:\Users\bagre\Downloads\My Files\Professional\Side Projects\Github Projects\ParSaveables\podcast

npm install
```

**Expected output:**
```
added 87 packages
```

**Verify installation:**
```bash
node --version  # Should show v18.0.0 or higher
ffmpeg -version # Should show FFmpeg version info
```

---

## Step 2: Run Database Migration (1 minute)

The podcast tables are already created in migration `002_add_podcast_tables.sql`.

**Verify tables exist in Supabase:**

1. Go to Supabase dashboard
2. Open SQL Editor
3. Run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('podcast_episodes', 'podcast_scripts', 'podcast_generation_logs');
```

**Should return 3 rows.**

If tables don't exist, run:
```sql
-- Copy and paste contents of:
-- database/migrations/002_add_podcast_tables.sql
```

---

## Step 3: Get Google Cloud Credentials (10 minutes)

### 3.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click "Create Project" (top left)
3. Name: "ParSaveables-Podcast"
4. Click "Create"

### 3.2 Enable Text-to-Speech API

1. In Google Cloud Console, search "Text-to-Speech API"
2. Click "Enable"
3. Wait 30 seconds for activation

### 3.3 Create Service Account

1. Go to: IAM & Admin > Service Accounts
2. Click "+ CREATE SERVICE ACCOUNT"
3. Name: `podcast-tts`
4. Description: "Text-to-Speech for Chain Reactions podcast"
5. Click "Create and Continue"
6. Role: Select "Project > Editor"
7. Click "Continue" → "Done"

### 3.4 Download JSON Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create"

**File downloads automatically** (e.g., `parsaveables-podcast-abc123.json`)

6. **Rename** to `google-cloud-credentials.json`
7. **Move** to podcast folder:
```bash
mv ~/Downloads/parsaveables-podcast-abc123.json google-cloud-credentials.json
```

**Security Note:** This file contains sensitive credentials. Never commit to Git! (Already in .gitignore)

---

## Step 4: Get GitHub Personal Access Token (3 minutes)

### 4.1 Create Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Note: "ParSaveables Podcast Upload"
4. Expiration: "No expiration" (or 1 year)
5. Scopes: Check **`repo`** (Full control of repositories)
6. Scroll down, click "Generate token"

### 4.2 Copy Token

**IMPORTANT:** Copy token immediately! You won't see it again.

Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Save temporarily in a text file.

---

## Step 5: Configure Environment Variables (5 minutes)

### 5.1 Create .env File

```bash
# In podcast folder
cp .env.example .env
```

### 5.2 Edit .env File

Open `.env` in text editor and fill in:

```env
# ============================================
# REQUIRED - System will not work without these
# ============================================

# Supabase (from main project)
SUPABASE_URL=https://bcovevbtcdsgzbrieiin.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Anthropic (from main project)
ANTHROPIC_API_KEY=sk-ant-api-12345-your-key-here

# GitHub (from Step 4)
GITHUB_TOKEN=ghp_your-token-from-step-4
GITHUB_OWNER=swarnimb
GITHUB_REPO=ParSaveables

# ============================================
# OPTIONAL - Has defaults, can customize
# ============================================

# Google Cloud (from Step 3)
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json

# Podcast Metadata
PODCAST_SHOW_NAME=Chain Reactions
PODCAST_HOST_NAME=Dave
PODCAST_DESCRIPTION=The official ParSaveables disc golf podcast featuring tournament recaps, player highlights, and championship-level analysis!

# Audio Configuration
INTRO_MUSIC_PATH=./assets/intro-music.mp3
OUTRO_MUSIC_PATH=./assets/outro-music.mp3
INTRO_DURATION_SECONDS=20
OUTRO_DURATION_SECONDS=15

# Google TTS Voice (male, energetic)
TTS_VOICE_NAME=en-US-Neural2-J
TTS_VOICE_GENDER=MALE
TTS_SPEAKING_RATE=1.0
TTS_PITCH=0.0

# Output Directories
OUTPUT_DIR=./output
TEMP_DIR=./temp

# Debug Mode
DEBUG=false
```

### 5.3 Fill in Credentials

**Where to find:**

- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard > Settings > API > `service_role` key
- **ANTHROPIC_API_KEY**: console.anthropic.com > API Keys
- **GITHUB_TOKEN**: From Step 4 above
- **GITHUB_OWNER**: Your GitHub username (e.g., `swarnimb`)

**Save file.**

---

## Step 6: Test Configuration (2 minutes)

```bash
node test-data-fetcher.js
```

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║  🧪 Testing Data Fetcher Module                  ║
╚═══════════════════════════════════════════════════╝

Initializing Supabase client...
✓ Supabase client created

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 1: Fetch Registered Players
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 12 registered players:
  1. Intern Line Cook
  2. Jabba the Putt
  ... (etc)

✅ All 5 tests passed!
Data fetcher is working correctly. Ready to generate podcasts!
```

**If tests fail:**
- Check `.env` file has correct credentials
- Verify database migration ran successfully
- Ensure Supabase service role key (not anon key)

---

## Step 7: Download Music (Optional, 15 minutes)

See `MUSIC_SOURCES.md` for detailed guide.

### Quick Option: Skip for Now

You can generate podcasts without music. System will warn but continue with voice-only audio.

### Recommended Option: YouTube Audio Library

1. Go to: https://studio.youtube.com/channel/UC/music
2. Search "sports energetic" → Download a ~20 second track
3. Search "outro conclusion" → Download a ~15 second track
4. Trim to exact lengths using Audacity (free)
5. Save as:
   - `assets/intro-music.mp3` (20 seconds)
   - `assets/outro-music.mp3` (15 seconds)

---

## Step 8: Generate First Episode! (2-3 minutes)

```bash
npm run generate:season
```

**What happens:**

1. **Fetches data** from Supabase (Minneapolis, Season 2025, Portlandia)
2. **Generates script** with Claude AI (~30 seconds)
3. **Converts to audio** with Google TTS (~60 seconds)
4. **Mixes with music** using FFmpeg (~10 seconds) - or skips if no music
5. **Uploads to GitHub** release (~30 seconds)
6. **Saves metadata** to database

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║  🎙️  ParSaveables Podcast Generator             ║
║     Chain Reactions - Disc Golf Podcast          ║
╚═══════════════════════════════════════════════════╝

Type: season
Year: 2025

🎙️  Generating Season 2025 Recap Episode

📊 Step 1/6: Fetching data from database...
✓ Minneapolis 2024: 5 rounds, 8 players
✓ Season 2025: 36 rounds, 12 players
✓ Portlandia 2025: 5 rounds, 9 players

✍️  Step 2/6: Generating podcast script with Claude AI...
✓ Script generated: 2143 words (~10 minutes)
✓ Cost: $0.52

🎤 Step 3/6: Converting script to audio with Google TTS...
✓ Voice audio generated

🎵 Step 4/6: Mixing audio with intro/outro music...
✓ Final podcast ready

📤 Step 5/6: Uploading to GitHub...
✓ Uploaded successfully!

💾 Step 6/6: Saving episode metadata to database...
✓ Episode saved to database (ID: 1)

✅ Season recap episode generated successfully!

🎵 Audio URL: https://github.com/user/ParSaveables/releases/download/podcast-ep1/Chain-Reactions-EP01-2025-Season-Recap.mp3
📍 Release: https://github.com/user/ParSaveables/releases/tag/podcast-ep1
💰 Total cost: $0.52
```

---

## Step 9: Listen & Share! (10 minutes)

1. **Open release URL** from output
2. **Download MP3** from GitHub release
3. **Listen** to your first episode!
4. **Share** with league in GroupMe

**Post to GroupMe:**
```
🎙️ NEW PODCAST EPISODE! 🎙️

Chain Reactions - Episode 1: The 2025 Season Spectacular

A 10-minute recap of our entire season including Minneapolis 2024, all regular season rounds, and the epic Portlandia 2025 tournament!

🎧 Listen here: [GitHub Release URL]

Featuring AI-powered sports commentary, player highlights, and all the disc golf puns you can handle! ⛓️🥏
```

---

## Step 10: Setup Monthly Automation (Optional)

See "Deployment" section in `README.md` for GitHub Actions setup.

**Manual Option:** Set calendar reminder for end of each month, run:
```bash
npm run generate:monthly
```

---

## 🎉 You're Done!

Podcast system is fully operational.

### Next Steps

1. **Generate monthly recaps** - Run at end of each month
2. **Iterate on scripts** - Edit prompts in `lib/script-generator.js` to improve quality
3. **Try different voices** - Experiment with Google TTS voices
4. **Add more episode types** - Create tournament-specific recaps

### Maintenance

- Monitor costs in `podcast_generation_logs` table
- Check Google Cloud TTS usage (free tier: 1M chars/month)
- Keep GitHub releases organized (can delete old episodes if needed)

---

## 🐛 Troubleshooting

### "Missing required environment variables"
→ Check `.env` file has all required fields filled in

### "FFmpeg not found"
→ Install FFmpeg: https://ffmpeg.org/download.html
→ Add to PATH on Windows

### "Google Cloud credentials not found"
→ Verify `google-cloud-credentials.json` exists in podcast folder
→ Check GOOGLE_APPLICATION_CREDENTIALS path in `.env`

### "GitHub upload failed"
→ Verify personal access token has `repo` scope
→ Check token hasn't expired
→ Ensure repository name is correct in `.env`

### "No rounds found"
→ Normal for some months
→ Check database has data: `SELECT * FROM rounds LIMIT 5;`

---

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Review code comments in `lib/` files
3. Enable debug mode: `DEBUG=true` in `.env`
4. Check `podcast_generation_logs` table for error details

---

## 🚀 Ready to Go!

Your podcast system is set up and ready to generate professional-quality episodes!

```bash
npm run generate:season
```

Let's make some podcast magic! ✨🎙️
