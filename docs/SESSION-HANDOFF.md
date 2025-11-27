# ParSaveables - Session Handoff Guide

**Quick Start for New Claude Code Sessions**

Last Updated: 2025-11-25

---

## TL;DR - Start Here

**System Status:** ✅ **FULLY OPERATIONAL - LANDING PAGE + MOBILE DASHBOARD**
- Production deployment on Vercel
- New landing page with animated navigation
- Mobile-first dashboard at `/dashboard/` with 4 tabs
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

### Core Workflow
1. User clicks "Process Scorecards" button on dashboard
2. System polls Gmail for unread emails with attachments
3. Claude Vision API extracts scorecard data
4. 12-step workflow processes and stores data
5. Dashboard auto-refreshes to show new data

### Recent Changes (Nov 25, 2025)
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

**Podcast Feature - Phase 1 (COMPLETED):**
- ✅ Built complete Podcast tab UI with episode list + audio player
- ✅ Created podcastService.js with 13 reusable functions
- ✅ Built /api/generatePodcast endpoint (metadata only, no audio yet)
- ✅ Added podcast data fetching (getPodcastEpisodes, generatePodcast)
- ✅ Migration 005: Verified podcast tables exist in production
- ✅ Fixed "Failed to load episodes" error (RLS policy issue)
- ✅ Fixed "Failed to generate podcast" error (import simplification)
- ✅ Manual episode generation working (creates Episode #1 with 2025 data)
- ✅ Episode cards with Play/Download buttons (when audio exists)
- ✅ HTML5 audio player with speed control (1x-2x)
- ✅ 220+ lines of podcast-specific CSS styling
- ⏳ Audio generation pending (Phase 2 - integrate /podcast/ CLI)
- ⏳ File upload pending (GitHub releases or Vercel Blob)
- ⏳ Vercel cron job for monthly automation (Feb 1, 2026)

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

### Frontend (Static HTML/CSS/JS)
**Mobile Dashboard (Nov 2025):**
- `public/dashboard/index.html` - Landing page + dashboard shell (~105 lines)
- `public/dashboard/style.css` - Complete styling with CSS variables (~1404 lines)
- `public/dashboard/app.js` - Main orchestrator, routing, state, charts (~1129 lines)
- `public/dashboard/components.js` - Reusable UI components (~284 lines)
- `public/dashboard/data.js` - Supabase queries + chart data fetching (~242 lines)
- `public/dashboard/forest-bg.jpg` - Background image

**Features:**
- Landing page: Funny description + 4 vertical tabs with morph animation
- Leaderboard tab: Podium (top 3), leaderboard (all players), expandable stats
- Stats tab: 3 swipeable charts with touch gestures, event-aware
- Podcast tab: Placeholder for future podcast feature
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

### Podcast Feature
- Partially implemented
- Works but needs refinement
- See ROADMAP for enhancement plan

---

## Upcoming Work (Priority Order)

See `docs/ROADMAP.md` for full details. Top priorities:

1. **Chatbot Enhancement** (High)
   - Better AI responses
   - More query types
   - Conversation history

2. **Dashboard & Admin UI Overhaul** (High)
   - Modularize code (separate CSS/JS files)
   - Improve mobile responsiveness
   - Better visual design

3. **Registered Players Management** (Medium)
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
│   ├── index.html            # Dashboard (needs refactoring)
│   └── admin.html            # Admin panel
├── src/
│   ├── api/                  # Orchestrators
│   ├── services/             # 8 microservices
│   ├── config/               # Environment config
│   ├── utils/                # Helpers (logger, etc)
│   └── tests/                # Unit tests
├── podcast/                  # Podcast generation system
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
SUPABASE_URL=https://bcovevbtcdsgzbrieiin.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[secret]
ANTHROPIC_API_KEY=[secret]
GMAIL_CLIENT_ID=[secret]
GMAIL_CLIENT_SECRET=[secret]
GMAIL_REFRESH_TOKEN=[secret]
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

**Note:** Tests require valid .env credentials and database connection.

---

## Quick Commands

```bash
# Install dependencies
npm install

# Test workflow with image
npm run test:workflow path/to/scorecard.jpg

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

Last Updated: 2025-11-25
Status: Production Ready - Podcast Phase 1 Complete
Next Session: **Podcast Audio Generation (Phase 2)**

---

## Next Session Goals

### Priority 1: Podcast Audio Generation (Phase 2)
**Current State:**
- ✅ Podcast tab UI complete (episode list + player)
- ✅ Episode metadata generation working (Episode #1 created)
- ✅ Database tables exist (podcast_episodes, podcast_scripts, podcast_generation_logs)
- ⏳ Audio generation not integrated yet
- ⏳ Episode #1 shows "Audio pending..."

**What Works:**
- Manual "Generate New Episode" button creates episode metadata
- Episode #1: "Chain Reactions #1 - 2025 Season Highlights"
- Data range: Jan 1 - Dec 31, 2025 (all 3 historical events)
- Player statistics calculated (birdies, eagles, aces, wins, etc.)

**What's Missing:**
1. **Script generation** - Integrate `/podcast/lib/script-generator.js`
   - Uses Claude API to generate engaging podcast script
   - Takes player stats, rounds data, fun facts
   - Returns ~2000 word script (10 minutes audio)

2. **Audio generation** - Integrate `/podcast/lib/audio-generator.js`
   - Uses Google Cloud TTS (free tier: 1M chars/month)
   - Converts script to MP3 audio
   - Voice: en-US-Neural2-J (male, energetic)

3. **File upload** - Store audio file
   - Option A: GitHub Releases (free, unlimited)
   - Option B: Vercel Blob Storage ($0.15/GB)
   - Update episode.audio_url with public URL

4. **Cron job** - Monthly automation (Feb 1, 2026)
   - Add to vercel.json: `"schedule": "0 0 1 * *"`
   - Triggers /api/generatePodcast automatically

**Implementation Steps:**
1. Update `/api/generatePodcast` to call script generator
2. Add audio generation after script
3. Upload audio to storage (recommend GitHub Releases)
4. Update episode with audio_url
5. Test Episode #1 end-to-end
6. Add vercel.json cron configuration
7. Deploy and verify

**Files to Modify:**
- `src/api/generatePodcast.js` - Add script + audio generation
- `vercel.json` - Add cron schedule
- Test with existing `/podcast/` CLI tools first

**Environment Variables Needed:**
- ANTHROPIC_API_KEY (already exists)
- GOOGLE_APPLICATION_CREDENTIALS (if using Google TTS)
- GITHUB_TOKEN (if using GitHub Releases for storage)

### Priority 2: Admin Panel Overhaul
**Current State:**
- `public/admin.html` is monolithic (~1,500 lines)
- Works but hard to maintain
- Not mobile-responsive

**Tasks:**
1. Create new modular architecture:
   - `public/admin/index.html`
   - `public/admin/style.css`
   - `public/admin/app.js`
   - `public/admin/components.js`
   - `public/admin/data.js`
2. Port existing functionality to new structure
3. Add new features:
   - Registered Players CRUD interface
   - Course Management (add/edit courses + aliases)
   - Better event management UI
   - Points System visual editor
4. Make mobile-responsive

**Files to Work On:**
- Create new `/public/admin/` directory
- Migrate logic from `public/admin.html`
- Test all admin functionality

### Optional: If Time Permits
- Chatbot enhancement (conversation memory)
- Performance optimizations (caching)
- Automated testing suite
