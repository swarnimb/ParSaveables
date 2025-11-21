# ParSaveables - Claude Code Context

**Quick Start:** Read `docs/SESSION-HANDOFF.md` for complete current state

**Last Updated:** 2025-11-21

**Status:** ✅ Production Ready - New Mobile Dashboard Live

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

## Recent Changes (Nov 21, 2025)

**Mobile Dashboard UI Overhaul:**
- Built new mobile-first dashboard (`/public/dashboard/`) with 5 files total
- Forest background image with semi-transparent cards
- Top 3 players shown with metallic gold/silver/bronze disc graphics
- Podium display (2-1-3 arrangement) with expandable stats
- Event selector (Season/Tournament toggle)
- Stats calculated from overall performance (not just top 10)
- Bottom navigation with iPhone-style notch design
- Removed chatbot to preserve API credits

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
