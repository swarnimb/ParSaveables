# ParSaveables - Claude Code Context

**Quick Start:** Read `docs/SESSION-HANDOFF.md` for complete current state

**Last Updated:** 2025-01-19

**Status:** ✅ Production Ready - Fully Operational System

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

## Documentation Structure

- `docs/SESSION-HANDOFF.md` - **START HERE** for new sessions
- `docs/ROADMAP.md` - Upcoming features (chatbot, UI overhaul, podcast)
- `docs/ARCHITECTURE.md` - Technical architecture details
- `docs/DEPLOYMENT.md` - Vercel deployment guide
- `docs/TESTING.md` - Testing procedures
- `README.md` - Project overview

## Recent Changes (Jan 19, 2025)

- Added manual trigger button to dashboard
- Removed automatic cron jobs
- Implemented event-based player filtering
- Reorganized documentation (merged NEXT-STEPS + FUTURE-IMPROVEMENTS → ROADMAP)
- Cleaned up temporary files

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

### Subsequent Updates (Nov 2024 - Jan 2025)
- Manual trigger added (Jan 2025)
- Event-based filtering implemented (Jan 2025)
- Documentation reorganized (Jan 2025)
- Production workflow validated and optimized

---

**Again: For current information, see `docs/SESSION-HANDOFF.md`**
