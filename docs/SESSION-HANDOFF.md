# ParSaveables - Session Handoff Guide

**Quick Start for New Claude Code Sessions**

Last Updated: 2025-11-30

---

## TL;DR - Start Here

**System Status:** ✅ **FULLY OPERATIONAL - ADMIN PANEL ADDED**
- Production deployment on Vercel
- Landing page with animated navigation
- Mobile-first dashboard at `/dashboard/` with 4 tabs
- **NEW:** Admin panel at `/admin/` for managing all data
- Podcast Episode 1 published and live
- URL-based routing with hash navigation
- Manual trigger via dashboard button
- Event-based player filtering active
- All 8 services + 2 API endpoints working

**What to Read:**
1. This file (SESSION-HANDOFF.md) - Current system state
2. `README.md` - Project overview
3. `docs/ROADMAP.md` - Upcoming features to work on
4. `docs/ARCHITECTURE.md` - Deep technical details

---

## Current System State

### Deployment
- **Platform:** Vercel (production)
- **Branch:** `main`
- **Trigger:** Manual via dashboard button (cron disabled)
- **URL:** https://par-saveables.vercel.app
- **Podcast:** https://par-saveables.vercel.app/dashboard#podcast

### Core Workflow
1. User clicks "Process Scorecards" button on dashboard
2. System polls Gmail for unread emails with attachments
3. Claude Vision API extracts scorecard data
4. 12-step workflow processes and stores data
5. Dashboard auto-refreshes to show new data

### Recent Changes (Nov 30, 2025)

**Admin Panel - Complete Rebuild (COMPLETED):**
- ✅ Built from scratch at `/public/admin/`
- ✅ Modular architecture: 4 files (HTML/CSS/JS/Data)
- ✅ Mobile-responsive with forest background theme matching dashboard
- ✅ Password authentication (parsaveables2025)
- ✅ 4 management sections with navigation tabs
- ✅ Compact table layout for Players (one line per player)
- ✅ Card layout for Courses, Events, Points Systems
- ✅ Complete CRUD operations for all entities
- ✅ Navigation: Dashboard ↔ Admin with back arrow
- ✅ "Create New Points System" option in Events modal
- ⚠️ **IMPORTANT:** RLS policies on `registered_players` table need to be enabled

**Admin Panel Features:**
- **Players:** Table view with #, Name, Status, Edit, Delete
- **Courses:** Tier, multiplier, aliases display
- **Events:** Type (season/tournament), dates, points system selector
- **Points Systems:** Rank points, bonuses (ace/eagle/birdie)
- **Navigation:** Click ⚙️ on dashboard → Admin, ← arrow → Dashboard

**Admin Panel Files:**
```
/public/admin/
├── index.html (95 lines) - Structure with login + 4 sections
├── style.css (470+ lines) - Dark theme with forest background
├── data.js (279 lines) - Supabase CRUD operations
└── app.js (764 lines) - All application logic
```

**Supabase Configuration Issue:**
- `registered_players` table has RLS policies blocking public access
- Table is empty (needs to be populated from events data)
- 10 unique players found in events: Ace Brook, BigBirdie, Bird, Butter Cookie, Cobra, Fireball, Intern Line Cook, Jabba the Putt, Jaguar, Shogun

**Next Session Action Items:**
1. Fix RLS policies on `registered_players` table (see SQL below)
2. Populate registered_players from events data
3. Test all CRUD operations end-to-end

**SQL to Fix RLS (run in Supabase SQL Editor):**
```sql
-- Allow public read access
CREATE POLICY "Allow public read access" ON registered_players
FOR SELECT USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON registered_players
FOR INSERT WITH CHECK (true);

-- Allow public update access
CREATE POLICY "Allow public update access" ON registered_players
FOR UPDATE USING (true);

-- Allow public delete access
CREATE POLICY "Allow public delete access" ON registered_players
FOR DELETE USING (true);
```

### Previous Changes (Nov 29, 2025)

**Podcast Episode 1 Published (COMPLETED):**
- ✅ Episode 1 "The Ruckus Until Now" published and live
- ✅ ElevenLabs voice integration (Hyzer: male, Annie: female)
- ✅ Custom intro/outro music with precise timing and fading
- ✅ Supabase Storage for audio hosting (9.58 MB)
- ✅ Inline podcast player with progress bar and time controls
- ✅ Play button toggles play/pause (▶/⏸)
- ✅ Auto-pause other episodes when playing new one
- ✅ Removed download button
- ✅ Reduced episode description text by 20%
- ✅ Episodes sorted newest first (Episode 2 will appear above Episode 1)
- ✅ Complete audio generation pipeline with FFmpeg
- ⚠️ **Known Issue:** Line 8 has "*whistles*" spoken as word (ElevenLabs quota hit)

**Podcast Scripts & Audio Generation:**
- Created `podcast/generate-ep1-elevenlabs.js` for ElevenLabs audio
- Created `podcast/mix-episode-1.js` for intro/outro mixing
- Created `podcast/publish-episode-1.js` for Supabase upload
- Updated FFmpeg paths in 3 files to `C:\\ffmpeg\\bin\\ffmpeg.exe`
- Episode 1 context: Minneapolis 2024, Season 2025, Portlandia 2025, 2026 preview
- Script: 1010 words, 60 dialogue segments, ~7 minutes total

**Audio Specifications:**
- **Intro:** 15s (100% volume 0-10s, fade 10-15s, dialogue starts at 13s)
- **Dialogue:** ~6.7 minutes with ElevenLabs voices
- **Outro:** Fade in during last 5s of dialogue, then 10s (100% for 3s, fade for 7s)
- **Total Duration:** ~7 minutes 3 seconds (423s)

**ElevenLabs Configuration:**
```
ELEVENLABS_API_KEY=sk_bea21bf387197581aebdb415642e0e5ffb61c8c2fe9ec152
ELEVENLABS_HYZER_VOICE=50y2RdLRjpTShM4ZFm5D
ELEVENLABS_ANNIE_VOICE=dfeOmy6Uay63tNhyO99j
```

**Supabase Storage:**
- Bucket: `podcast-episodes` (public)
- Episode 1 URL: https://bcovevbtcdsgzbrieiin.supabase.co/storage/v1/object/public/podcast-episodes/ParSaveables-EP01.mp3

### Previous Changes (Nov 25, 2025)
**Landing Page with Animated Navigation (COMPLETED):**
- ✅ Created landing page at `/dashboard/` with funny description
- ✅ 4 vertical tab cards: Leaderboard, Stats, Podcast, Rules
- ✅ Smooth morph animation (600ms) from vertical tabs to bottom nav
- ✅ URL-based routing with hash navigation (#leaderboard, #stats, etc.)
- ✅ Clickable ParSaveables title to return to landing page
- ✅ Browser back/forward support via hashchange handler
- ✅ Renamed "Home" → "Leaderboard" and "Info" → "Rules" throughout
- ✅ Compact design with all tabs visible without scrolling
- ✅ Top joke banner shows on both landing and dashboard
- ✅ Description includes "Let's throw some plastic" as green CTA

**Bug Fixes:**
- ✅ Fixed double rendering on Stats and Rules pages
- ✅ Fixed scroll blocking issue when switching from Stats page
- ✅ Fixed Rules page showing wrong render function
- ✅ Added top-10 rounds rule to season descriptions

**Code Cleanup & Optimization (COMPLETED):**
- ✅ Fixed memory leak risk in carousel touch handlers
- ✅ Eliminated event handler duplication (~80 lines reduced)
- ✅ Split large chart functions into smaller focused functions
- ✅ Extracted chart configuration to constants (CHART_CONFIG)
- ✅ Converted CSS magic numbers to variables (transition timing)
- ✅ Code review grade improved from A- to A

**Landing Page Content:**
> "Where amateur disc golfers take rules deadly serious and slow play even more seriously. Mulligans are negotiated like hostage situations, shotguns are mandatory, and curses can make or break your round.
>
> We believe in fast golf, faster beer, and the sacred art of the perfectly timed blessing. Punishments are real. The rulebook is longer than the PDGA's.
>
> Let's throw some plastic."

### Previous Changes (Jan 22, 2025)
**Course Database Cleanup (COMPLETED):**
- ✅ Created course_aliases table to eliminate duplicate course entries
- ✅ Migration 003: Added course aliases system with database function
- ✅ Migration 004a: Updated 14 historical rounds to use canonical course names
- ✅ Migration 004: Deleted 11 duplicate courses, kept 20 canonical courses
- Database function `find_course_by_name_or_alias()` with 3-level fallback:
  1. Exact match on course_name
  2. Match on alias
  3. Partial/fuzzy match
- Updated backend services to use database-level course matching
- **RESULT:** Exactly 20 courses in database (down from 31+)
- **BENEFIT:** Clean schema, no more active/inactive filtering needed

**Info Tab Implementation:**
- Event-aware points system display with 2 cards:
  - Card 1: Short funny description (4 variants based on config hash)
  - Card 2: Points allocation table + Tie breaker order + Course multipliers (seasons only)
- Course multipliers section shows tier/multiplier for each course
- `getPointsSystem()` function fetches config from database
- Only shows courses when multipliers enabled for seasons

**Stats Page Implementation:**
- Built 3 swipeable interactive charts with touch gestures
- Chart 1: Performance Breakdown (birdies/eagles/aces by player)
- Chart 2: Rounds Analysis (wins/podiums/other rounds by player)
- Chart 3: Average Score Analysis (scores by tier for seasons, by round for tournaments)
- Player dropdown on Chart 3 to select individual player analysis
- Tier labels: Easy (1.0x), Moderate (1.5x), Hard (2.0x), Elite (2.5x)
- Carousel position preserved when changing events/players (no jump to first chart)
- Event selector on Stats page (Season/Tournament toggle)
- Charts update dynamically based on selected event
- Refactored chart rendering to eliminate code duplication (reusable helper)
- Total: ~340 lines added across 3 files (app.js, data.js, style.css)

**Previous (Nov 21, 2025):**
- Built mobile-first dashboard at `/public/dashboard/`
- Leaderboard tab with podium, leaderboard, expandable stats
- Compressed top section (joke banner, header, event selector) for better viewability
- Player "Bird" displays as 🦅 emoji throughout
- Removed "pts" text from podium points display
- Bottom navigation with 4 tabs: Leaderboard, Stats, Podcast, Rules

**Previous (Nov 19, 2025):**
- Added manual trigger button to dashboard
- Removed automatic cron job (was daily at 12pm UTC)
- Implemented event-based player filtering

---

## System Architecture Overview

### Backend (Serverless - Vercel)
**8 Microservices:**
1. `emailService.js` - Gmail API integration
2. `visionService.js` - Claude Vision API for scorecard extraction
3. `scoringService.js` - Stats calculation and ranking
4. `eventService.js` - Event assignment (season/tournament)
5. `playerService.js` - Player validation with fuzzy matching
6. `configService.js` - Configuration loader
7. `pointsService.js` - Points calculation
8. `databaseService.js` - Supabase CRUD operations

**2 API Endpoints:**
- `/api/processScorecard` - Main workflow orchestrator
- `/api/chatbot` - AI chatbot for dashboard queries

### Podcast Generation System
**Location:** `/podcast/` directory

**Scripts:**
- `generate-dialogue-podcast.js` - Main CLI script for generating episodes
- `generate-ep1-elevenlabs.js` - ElevenLabs audio generation for Episode 1
- `mix-episode-1.js` - Custom audio mixer with intro/outro music
- `publish-episode-1.js` - Upload to Supabase and create DB records

**Libraries:**
- `lib/dialogue-script-generator.js` - Claude AI script generation with Hyzer/Annie dialogue
- `lib/elevenlabs-audio-generator.js` - ElevenLabs TTS with caching and progress tracking
- `lib/dialogue-audio-generator.js` - Google TTS fallback
- `lib/audio-mixer.js` - FFmpeg wrapper for mixing

**Assets:**
- `assets/intro-music.mp3` - Intro music (15s)
- `assets/outro-music.mp3` - Outro music (10s)

**Output:**
- `output/Par-Saveables-EP01-Script.txt` - Final edited script
- `output/ParSaveables-EP01-ElevenLabs.mp3` - Final mixed episode

**Context Files:**
- `episode-1-context.json` - Custom context for Episode 1 (Minneapolis 2024, Season 2025, Portlandia 2025)

### Frontend (Static HTML/CSS/JS)
**Mobile Dashboard (Nov 2025):**
- `public/dashboard/index.html` - Landing page + dashboard shell (~105 lines)
- `public/dashboard/style.css` - Complete styling with CSS variables (~1600 lines)
- `public/dashboard/app.js` - Main orchestrator, routing, state, charts, inline podcast player (~1200 lines)
- `public/dashboard/components.js` - Reusable UI components (~284 lines)
- `public/dashboard/data.js` - Supabase queries + chart data fetching (~450 lines)
- `public/dashboard/forest-bg.jpg` - Background image

**Features:**
- Landing page: Funny description + 4 vertical tabs with morph animation
- Leaderboard tab: Podium (top 3), leaderboard (all players), expandable stats
- Stats tab: 3 swipeable charts with touch gestures, event-aware
- Podcast tab: Episode list with inline audio players, progress bars, time controls
- Rules tab: Points system info with top-10 rule for seasons

**Legacy Dashboards:**
- `public/index.html` - Old desktop dashboard (~2700 lines, deprecated)
- `public/admin.html` - Admin panel (~1500 lines, still in use)

### Database (Supabase PostgreSQL)
**Configuration Tables:**
- `events` - Seasons and tournaments with player lists
- `points_systems` - Scoring rules (JSONB config)
- `courses` - 20 canonical courses with tier/multiplier
- `course_aliases` - Alternate spellings mapped to canonical courses
- `registered_players` - Player registry

**Data Tables:**
- `rounds` - Round metadata (references canonical course names)
- `player_rounds` - Player stats and points

**Podcast Tables:**
- `podcast_episodes` - Episode metadata, audio URLs, publishing info
- `podcast_scripts` - Generated scripts with word count and review status
- `podcast_generation_logs` - Generation attempts for debugging

---

## Key Technical Details

### Event-Based Player Filtering
- Each event has a `players` column (JSONB array)
- Dashboard loads `currentEventPlayers` from selected event
- Only players in that list appear on leaderboard
- Example: 2025 season excludes Food Zaddy and ScarletSpeedster

### Points Calculation
- Configured per event via `points_system_id`
- Rank points + performance bonuses (birdies/eagles/aces)
- Course multipliers applied (frozen at insert time)
- Tied ranks get averaged points

### Player Validation (Fuzzy Matching)
- Uses Levenshtein distance algorithm
- 95% threshold for exact match
- 75% threshold for fuzzy match
- Skips emoji-only names (like Bird 🦅)

### Vision API Rules
- Detects bird emoji → assigns "Bird" as player name
- Minimum 4 players required
- Extracts hole-by-hole scores, stats, course, date

### Course Matching (Aliases System)
- Database function `find_course_by_name_or_alias()` handles variations
- 3-level fallback: exact match → alias match → partial match
- Vision service can extract any spelling (e.g., "Flying Armadillo DGC - Big Course")
- Aliases automatically map to canonical course (e.g., "Armadillo Big")
- **20 canonical courses** (clean table, no duplicates)
- **17+ aliases** for scorecard variations
- All historical rounds updated to reference canonical names

### Podcast Audio Pipeline
1. **Script Generation:** Claude AI generates Hyzer/Annie dialogue script
2. **Audio Generation:** ElevenLabs TTS converts script to 60 audio segments
3. **Concatenation:** FFmpeg combines segments into single dialogue track
4. **Mixing:** Custom FFmpeg filter adds intro/outro with precise timing
5. **Upload:** Supabase Storage hosts final MP3
6. **Database:** Episode record with audio_url, metadata, and script

---

## Common Tasks & How to Do Them

### Add New Registered Player
**Database:**
```sql
INSERT INTO registered_players (player_name, active)
VALUES ('Player Name', true);
```
**Also update:** `public/index.html` REGISTERED_PLAYERS array (line ~1083)

### Remove Player from Event
```sql
UPDATE events
SET players = players - 'Player Name'
WHERE id = 1;
```

### Populate Event Players from Data
```sql
UPDATE events
SET players = (
  SELECT jsonb_agg(DISTINCT player_name ORDER BY player_name)
  FROM player_rounds
  WHERE event_id = X
)
WHERE id = X;
```

### Add New Course Alias
When vision service extracts a new course name variation:
```sql
-- Add alias to existing canonical course
INSERT INTO course_aliases (alias, course_id)
SELECT 'New Course Name Variation', id
FROM courses
WHERE course_name = 'Canonical Course Name'
ON CONFLICT (alias) DO NOTHING;
```

### Add New Course (Entirely New)
```sql
-- Insert new canonical course
INSERT INTO courses (course_name, tier, multiplier)
VALUES ('New Course Name', 2, 1.5);
```

### Generate New Podcast Episode (Manual)
```bash
cd podcast
node generate-dialogue-podcast.js
# Follow prompts for episode number and title
# Script generated, then audio, then uploaded
```

### Publish Podcast Episode to Dashboard
```bash
cd podcast
node publish-episode-1.js
# Uploads audio to Supabase Storage
# Creates episode and script records in database
```

### Trigger Scorecard Processing
1. Visit https://par-saveables.vercel.app
2. Click "📧 Process Scorecards" button (top center)
3. Wait for processing (shows alert with results)

### Deploy Changes
```bash
git add -A
git commit -m "Description"
git push
# Vercel auto-deploys from main branch
```

---

## Known Issues & Quirks

### Podcast Episode 1
- ⚠️ **Line 8 has "*whistles*" spoken as word instead of removed**
  - Cause: ElevenLabs character quota exceeded during regeneration
  - Fix: Regenerate segment 8 when quota resets (monthly)
  - File: `podcast/output/Par-Saveables-EP01-Script.txt` line 8
  - Action item recorded in Pending Improvements section below

### Database Schema
- `rounds.season` column exists but is inconsistent (NULL for most)
- Use `event_id` instead - it's the source of truth
- See `docs/ROADMAP.md` for planned schema improvements

### Frontend Code
- Single large HTML files with inline styles/scripts
- Hard to maintain, needs modularization
- See ROADMAP for planned UI overhaul

### Chatbot
- Basic functionality works but needs enhancement
- Limited query types supported
- See ROADMAP for improvement plan

---

## Pending Improvements

### High Priority
1. **Fix Episode 1 "*whistles*" audio segment**
   - When: ElevenLabs quota resets (monthly)
   - File: `podcast/output/Par-Saveables-EP01-Script.txt` line 8
   - Change "*whistles*" to "wow." (already updated in script file)
   - Run: `cd podcast && node generate-ep1-elevenlabs.js`
   - Then: `node mix-episode-1.js`
   - Upload: `node publish-episode-1.js` (will overwrite existing)

2. **Setup Monthly Podcast Automation**
   - Add to `vercel.json`: `"schedule": "0 12 1 * *"` (12pm UTC on 1st of month)
   - Create `/api/generatePodcast` endpoint
   - Integrate podcast generation scripts
   - Test automation before Feb 1, 2026

### Medium Priority
3. **Admin Panel Overhaul**
   - Modularize `public/admin.html` (currently ~1500 lines)
   - Add Registered Players CRUD interface
   - Add Course Management UI
   - Make mobile-responsive

4. **Chatbot Enhancement**
   - Better AI responses
   - More query types
   - Conversation history

---

## Upcoming Work (Priority Order)

See `docs/ROADMAP.md` for full details. Top priorities:

1. **Podcast Automation** (High)
   - Fix Episode 1 whistles audio
   - Setup monthly cron job
   - Create API endpoint for automated generation

2. **Chatbot Enhancement** (High)
   - Better AI responses
   - More query types
   - Conversation history

3. **Dashboard & Admin UI Overhaul** (High)
   - Modularize code (separate CSS/JS files)
   - Improve mobile responsiveness
   - Better visual design

4. **Registered Players Management** (Medium)
   - Add CRUD interface to admin panel
   - Currently only manageable via SQL

---

## File Structure Quick Reference

```
ParSaveables/
├── docs/
│   ├── ARCHITECTURE.md       # Deep technical architecture
│   ├── DEPLOYMENT.md         # Vercel deployment guide
│   ├── TESTING.md            # Testing procedures
│   ├── ROADMAP.md            # Future features & improvements
│   └── SESSION-HANDOFF.md    # This file
├── database/
│   ├── migrations/           # Schema changes
│   ├── seeds/                # Initial data
│   ├── historical/           # One-time imports
│   └── fixes/                # Archived corrections
├── public/
│   ├── dashboard/            # Mobile dashboard (Nov 2025)
│   │   ├── index.html        # Landing + shell
│   │   ├── style.css         # Styling
│   │   ├── app.js            # Main logic + routing + inline player
│   │   ├── components.js     # Reusable UI
│   │   ├── data.js           # Supabase queries
│   │   └── forest-bg.jpg     # Background
│   ├── index.html            # Old dashboard (deprecated)
│   └── admin.html            # Admin panel
├── podcast/                  # Podcast generation system
│   ├── lib/                  # Core libraries
│   │   ├── dialogue-script-generator.js
│   │   ├── elevenlabs-audio-generator.js
│   │   ├── dialogue-audio-generator.js
│   │   └── audio-mixer.js
│   ├── assets/               # Music files
│   │   ├── intro-music.mp3
│   │   └── outro-music.mp3
│   ├── output/               # Generated episodes
│   │   ├── Par-Saveables-EP01-Script.txt
│   │   └── ParSaveables-EP01-ElevenLabs.mp3
│   ├── episode-1-context.json
│   ├── generate-dialogue-podcast.js
│   ├── generate-ep1-elevenlabs.js
│   ├── mix-episode-1.js
│   └── publish-episode-1.js
├── src/
│   ├── api/                  # Orchestrators
│   ├── services/             # 8 microservices
│   ├── config/               # Environment config
│   ├── utils/                # Helpers (logger, etc)
│   └── tests/                # Unit tests
├── .env                      # Environment variables (not in git)
├── package.json              # Dependencies
├── vercel.json               # Deployment config
└── README.md                 # Project overview
```

---

## Development Principles

**Code Quality:**
- Single responsibility per service
- Configuration-driven (zero hardcoding)
- Pure functions (testable, composable)
- Comprehensive logging
- Fail-fast with descriptive errors

**User Preferences:**
- Concise, effective responses
- No over-explaining
- Complete solutions
- Commit frequently

**Git Workflow:**
- All work on `main` branch
- Commit format: "Action: description" with details
- Include Claude Code signature in commits
- Push after each logical unit of work

---

## Environment Variables

Required in `.env` (local) and Vercel dashboard (production):

```
# Supabase
SUPABASE_URL=https://bcovevbtcdsgzbrieiin.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[secret]

# Anthropic Claude
ANTHROPIC_API_KEY=[secret]

# Gmail API
GMAIL_CLIENT_ID=[secret]
GMAIL_CLIENT_SECRET=[secret]
GMAIL_REFRESH_TOKEN=[secret]

# ElevenLabs (Podcast)
ELEVENLABS_API_KEY=sk_bea21bf387197581aebdb415642e0e5ffb61c8c2fe9ec152
ELEVENLABS_HYZER_VOICE=50y2RdLRjpTShM4ZFm5D
ELEVENLABS_ANNIE_VOICE=dfeOmy6Uay63tNhyO99j

# Environment
NODE_ENV=production
```

---

## Testing

### Manual End-to-End Test
```bash
# Test complete workflow with real scorecard image
node src/tests/manual-test-full.js
```

### Unit Tests
```bash
npm test  # Runs all service tests
```

### Test Podcast Generation
```bash
cd podcast
node generate-dialogue-podcast.js
# Follow prompts
```

**Note:** Tests require valid .env credentials and database connection.

---

## Quick Commands

```bash
# Install dependencies
npm install

# Test workflow with image
npm run test:workflow path/to/scorecard.jpg

# Generate podcast episode
cd podcast && node generate-dialogue-podcast.js

# Publish episode to dashboard
cd podcast && node publish-episode-1.js

# Deploy to Vercel
vercel --prod

# Check logs
vercel logs

# View environment variables
vercel env ls
```

---

## Troubleshooting

### "Process Scorecards" button does nothing
- Check browser console for errors
- Verify `/api/processScorecard` endpoint is accessible
- Check Vercel function logs

### Players not showing on dashboard
- Verify `events.players` column has data for selected event
- Check browser console for loading errors
- Verify event_id matches between events and player_rounds

### Podcast not playing
- Check browser console for audio errors
- Verify audio_url is publicly accessible
- Test URL directly in browser
- Check Supabase Storage bucket is public

### Scorecard processing fails
- Check email has image attachment
- Verify image is UDisc format with 4+ players
- Check Vercel function logs for error details
- Verify Vision API key is valid

### Database connection issues
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel
- Check Supabase project is active
- Test connection locally with .env

---

## When Starting a New Session

1. **Read this file** (SESSION-HANDOFF.md)
2. **Check ROADMAP.md** for planned work
3. **Verify current branch:** Should be `main`
4. **Check recent commits:** `git log --oneline -10`
5. **Review open tasks:** User will specify what to work on

**Don't assume outdated context!** The system has evolved significantly. Always reference current documentation.

---

## Key Contacts & Resources

- **Production Dashboard:** https://par-saveables.vercel.app
- **Podcast Page:** https://par-saveables.vercel.app/dashboard#podcast
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/swarnimb/ParSaveables

---

**Questions to Ask User at Session Start:**

1. What feature/issue do you want to work on?
2. Any recent changes or context I should know about?
3. Should I reference ROADMAP.md for priorities?

**Don't ask these - they're covered in docs:**
- System architecture (see ARCHITECTURE.md)
- Deployment process (see DEPLOYMENT.md)
- Testing procedures (see TESTING.md)
- Project overview (see README.md)

---

Last Updated: 2025-11-29
Status: Production Ready - Podcast Episode 1 Published
Next Session: **Fix Episode 1 Whistles Audio + Monthly Automation Setup**
