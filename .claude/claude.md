# ParSaveables - Claude Code Context

**Quick Start:** Read `docs/SESSION-HANDOFF.md` for complete current state

**Last Updated:** 2025-11-29

**Status:** ✅ Production Ready - Landing Page + Mobile Dashboard + Podcast Automation

---

## For New Sessions

**Start here:**
1. Read `docs/SESSION-HANDOFF.md` - Current system state and handoff guide
2. Read `docs/ROADMAP.md` - Planned features and priorities
3. Ask user what they want to work on

**Don't read outdated info below** - it's kept for historical reference only.

---

## Quick Reference

- **Production:** https://par-saveables.vercel.app
- **Branch:** `main`
- **Deployment:** Vercel (auto-deploy on push)
- **Trigger:** Manual button on dashboard
- **Architecture:** 8 microservices + 2 API endpoints

## Code Architecture Principles

**CRITICAL: Read before proposing any new code structure**

### 1. Leverage Existing Architecture First
- **Backend services already exist** (`src/services/`) - DO NOT duplicate on frontend
- Frontend should consume backend services via Supabase, not recreate them
- Before creating new files/services, check if functionality exists in backend
- Example: Player data operations → Use `playerService.js` (backend), not new frontend service

### 2. Appropriate Structure = Scope-Matched Complexity
- **Small feature** (mobile dashboard) = 5-10 files maximum
- **NOT**: 20+ files mimicking backend architecture
- **Enterprise-level** means "clean and maintainable", NOT "maximum files"
- If proposing >10 files for frontend work, question if over-engineering

### 3. DRY Principle - Don't Repeat Backend Logic
- Backend handles: Data operations, business logic, validation, error handling
- Frontend handles: Display, user interactions, routing, state management
- **Never duplicate**:
  - Data fetching logic (use Supabase directly)
  - Business rules (already in backend services)
  - Configuration management (use backend config)

### 4. Reusability Guidelines
- **Reusable components**: UI elements used 2+ times (podium, player cards)
- **Reusable functions**: Data formatters, DOM helpers (5+ uses)
- **NOT reusable**: One-time page logic, single-use utilities
- Avoid premature abstraction - extract only when pattern repeats

### 5. Decision Framework Before Creating Files
Ask these questions:
1. Does backend already handle this? (Check `src/services/`)
2. Is this used in 2+ places? (If no, inline it)
3. Is file >200 lines? (If no, might not need splitting)
4. Does splitting improve clarity? (Not just "organization")

If answer is NO to most questions → Don't create the file

### 6. File Creation Checklist
Before proposing file structure:
- [ ] Reviewed existing backend services
- [ ] Identified actual code reuse (not theoretical)
- [ ] Counted real use cases (not "might need later")
- [ ] Verified scope matches complexity
- [ ] Explained WHY each file exists (not just "best practice")

**When in doubt: Start with fewer files, split later if needed**

## Documentation Structure

- `docs/SESSION-HANDOFF.md` - **START HERE** for new sessions
- `docs/ROADMAP.md` - Upcoming features (chatbot, UI overhaul, podcast)
- `docs/ARCHITECTURE.md` - Technical architecture details
- `docs/DEPLOYMENT.md` - Vercel deployment guide
- `docs/TESTING.md` - Testing procedures
- `README.md` - Project overview

<<<<<<< HEAD
## Recent Changes (Nov 25, 2025)

**Landing Page with Animated Navigation:**
- Built landing page at `/dashboard/` with funny disc golf description
- 4 vertical tab cards: Leaderboard, Stats, Podcast, Rules
- Smooth morph animation (600ms) from vertical tabs to bottom nav
- URL-based routing with hash navigation (#leaderboard, #stats, etc.)
- Clickable ParSaveables title to return to landing page
- Browser back/forward support via hashchange handler
- Renamed "Home" → "Leaderboard" and "Info" → "Rules" throughout
- Compact design with all tabs visible without scrolling
- Top joke banner shows on both landing and dashboard
- Description includes "Let's throw some plastic" as green CTA

**Bug Fixes:**
- Fixed double rendering on Stats and Rules pages (hashchange conflict)
- Fixed scroll blocking when switching from Stats page (className reset)
- Fixed Rules page calling wrong render function
- Added top-10 rounds rule to season descriptions

**Code Cleanup & Optimization:**
- Fixed memory leak risk in carousel touch handlers
- Eliminated event handler duplication (~80 lines reduced)
- Split large chart functions into smaller focused functions
- Extracted chart configuration to constants (CHART_CONFIG)
- Converted CSS magic numbers to transition timing variables
- Code review grade improved from A- to A

**Podcast Feature - Phase 1:**
- Built complete Podcast tab UI (episode list + audio player)
- Created podcastService.js with 13 reusable functions
- Built /api/generatePodcast endpoint (metadata only)
- Migration 005: Verified podcast tables in production
- Fixed RLS policy and API import errors
- Manual episode generation working (Episode #1 with 2025 data)
- HTML5 player with speed control (1x-2x)
- 220+ lines of podcast CSS styling
- Audio generation pending (Phase 2)

**Previous (Nov 21, 2025) - Mobile Dashboard:**
- Built new mobile-first dashboard (`/public/dashboard/`) with 5 files
- Forest background, podium, expandable stats, bottom navigation
- Custom SVG logo, rotating jokes, emoji support
=======
## Recent Changes (Jan 22, 2025)

**Stats Tab Implementation:**
- Built 3 interactive swipeable charts on Stats page
- Touch gesture handling for carousel navigation
- Chart 1: Performance Breakdown (horizontal stacked bars - birdies/eagles/aces)
- Chart 2: Rounds Analysis (horizontal stacked bars - wins/podiums/other)
- Chart 3: Average Score Analysis (tier-based for seasons, round-based for tournaments)
- Player dropdown on Chart 3 for individual analysis
- Tier names: Easy, Moderate, Hard, Elite (instead of numbers)
- Carousel position preserved when changing events/players
- Refactored charts to use reusable helper (eliminated 50 lines of duplication)
- Event-aware: all charts update based on selected event
- Total: ~340 lines added (optimized, no over-engineering)

**Previous (Nov 21, 2025):**
- Built mobile-first dashboard with Home tab
- Podium display, leaderboard, expandable stats
- Compressed top section for better mobile viewability
- Bottom navigation with 4 tabs
- Player "Bird" displays as 🦅 emoji
>>>>>>> 2fa610e (Restructure podcast folder: Remove single-host system, organize files)

**Previous (Nov 19, 2025):**
- Added manual trigger button
- Removed automatic cron jobs
- Implemented event-based player filtering

---

**Everything below this line is outdated - refer to SESSION-HANDOFF.md instead**

---

## Historical Context (Deprecated)

This section preserved for reference but is NO LONGER CURRENT.

The system has evolved significantly from the initial refactor described below.
See `docs/SESSION-HANDOFF.md` for accurate current state.

### Original Refactor (Completed Nov 2024)
- Replaced n8n workflow with Node.js serverless architecture
- Built 8 microservices + 2 orchestrators
- Deployed to Vercel with cron jobs
- Created comprehensive documentation

### Subsequent Updates (Nov 2024 - Nov 2025)
- Manual trigger added (Nov 2025)
- Event-based filtering implemented (Nov 2025)
- Documentation reorganized (Nov 2025)
- Production workflow validated and optimized

---

**Again: For current information, see `docs/SESSION-HANDOFF.md`**
