# ParSaveables - Session Handoff Guide

**Quick Start for New Claude Code Sessions**

Last Updated: 2025-01-22

---

## TL;DR - Start Here

**System Status:** ✅ **FULLY OPERATIONAL - MOBILE DASHBOARD WITH STATS**
- Production deployment on Vercel
- New mobile-first dashboard at `/dashboard/` with Stats tab
- 3 interactive swipeable charts on Stats page
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

### Recent Changes (Jan 22, 2025)
**Course Aliases System (Database Cleanup):**
- Created course_aliases table to eliminate duplicate course entries
- Migration script: `database/migrations/003_add_course_aliases.sql`
- Database function `find_course_by_name_or_alias()` with 3-level fallback:
  1. Exact match on course_name
  2. Match on alias
  3. Partial/fuzzy match
- Updated backend services to use database-level course matching
- **STATUS:** Migration files committed but NOT YET RUN on database
- **NEXT STEP:** Run migration via Supabase dashboard (see README_MIGRATION_003.md)

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
- Home tab with podium, leaderboard, expandable stats
- Compressed top section (joke banner, header, event selector) for better viewability
- Player "Bird" displays as 🦅 emoji throughout
- Removed "pts" text from podium points display
- Bottom navigation with 4 tabs: Home, Stats, Podcast, About

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
**Mobile Dashboard (Jan 2025):**
- `public/dashboard/index.html` - Dashboard shell with SVG logo and banner (~82 lines)
- `public/dashboard/style.css` - Complete styling with CSS variables (~860 lines)
- `public/dashboard/app.js` - Main orchestrator, routing, state, charts (~590 lines)
- `public/dashboard/components.js` - Reusable UI components (~284 lines)
- `public/dashboard/data.js` - Supabase queries + chart data fetching (~242 lines)
- `public/dashboard/forest-bg.jpg` - Background image

**Features:**
- Home tab: Podium (top 3), leaderboard (all players), expandable stats
- Stats tab: 3 swipeable charts with touch gestures, event-aware
- Podcast tab: Placeholder for future podcast feature
- About tab: Project information

**Legacy Dashboards:**
- `public/index.html` - Old desktop dashboard (~2700 lines, deprecated)
- `public/admin.html` - Admin panel (~1500 lines, still in use)

### Database (Supabase PostgreSQL)
**Configuration Tables:**
- `events` - Seasons and tournaments with player lists
- `points_systems` - Scoring rules (JSONB config)
- `courses` - Course library with multipliers
- `course_aliases` - Alternate spellings for courses (NEW - migration pending)
- `registered_players` - Player registry

**Data Tables:**
- `rounds` - Round metadata
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

### Course Matching (NEW - Aliases System)
- Database function `find_course_by_name_or_alias()` handles variations
- 3-level fallback: exact match → alias match → partial match
- Eliminates duplicate course entries in database
- Vision service can extract any spelling, aliases map to canonical name
- **Status:** Code committed, migration NOT yet run (see database/migrations/README_MIGRATION_003.md)

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

### Run Course Aliases Migration (PENDING)
**Via Supabase Dashboard (Recommended):**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `database/migrations/003_add_course_aliases.sql`
3. Run the script
4. Verify with:
   ```sql
   SELECT * FROM course_aliases;
   SELECT course_name, active FROM courses WHERE active = false;
   SELECT * FROM find_course_by_name_or_alias('Liveoak');
   ```
5. Check Info tab on dashboard - no duplicate courses should appear

**See:** `database/migrations/README_MIGRATION_003.md` for full details and rollback instructions

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

### Pending Migration
- **Course aliases system NOT yet applied to database**
- Migration files committed: `003_add_course_aliases.sql` + README
- Backend code updated to use `findCourseByNameOrAlias()`
- **Action needed:** Run migration via Supabase dashboard
- Impact: Info tab currently shows duplicate courses until migration runs

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

Last Updated: 2025-01-22
Status: Production Ready (with pending migration)
Next Session: Run course aliases migration or continue mobile dashboard work
