# ParSaveables Roadmap

This document tracks upcoming features and improvements for the ParSaveables system.

---

## Feature Implementation

Major features to be built that will add new functionality to the system.

### 1. Chatbot Enhancement
**Priority:** Low
**Status:** Deferred
**Description:** Improve the chatbot component with better AI responses, more comprehensive queries, and enhanced UI/UX.

**Current Issues:**
- Limited query types supported
- Response format could be more user-friendly
- No conversation history/context

**Proposed Improvements:**
- Add conversation memory
- Support complex multi-step queries
- Improve natural language understanding
- Add visualization support (charts in responses)
- Better error handling and fallback responses

**Note:** User decided to defer this feature to focus on admin panel and other priorities.

---

### 2. Dashboard & Admin UI Overhaul
**Priority:** High
**Status:** ✅ Complete (Nov 21, 2025 - Jan 30, 2025)
**Description:** Completely redesign dashboard and admin panel for better UX, modularity, and maintainability.

**✅ Completed - Mobile Dashboard (Nov 21-25, 2025):**
- Built new mobile-first dashboard at `/public/dashboard/`
- 5 modular files using ES6 modules (index.html, style.css, app.js, components.js, data.js)
- **Landing Page with Animated Navigation:**
  - Funny description highlighting disc golf culture (96 words)
  - 4 vertical tab cards with smooth morph animation (600ms)
  - URL-based routing with hash navigation
  - Clickable title to return to landing page
  - Browser back/forward support
- Forest background with semi-transparent cards
- Top 3 podium with metallic gold/silver/bronze disc graphics
- Orange gradient banner with rotating disc golf jokes (shows on landing too)
- Custom SVG disc golf basket logo with chains and laurel wreath
- Event selector (Season/Tournament toggle)
- Expandable stats showing overall performance (not just top 10)
- Bottom navigation with iPhone-style notch
- Refined visual hierarchy: Rank 1 larger, ranks 2-3 match ranks 4+
- Optimized spacing and vertical centering
- **4 Tabs Complete:**
  - ✅ Leaderboard: Podium, leaderboard, expandable stats
  - ✅ Stats: 3 interactive swipeable charts
  - ✅ Rules: Points system, tie breakers, course multipliers, top-10 rule
  - ⏳ Podcast: TODO (placeholder exists)
- Total: ~2,500+ lines across 5 files

**✅ Completed - Admin Panel (Nov 30, 2025 - Jan 30, 2025):**
- Built new admin panel at `/public/admin/`
- 4 modular files: index.html, style.css, app.js, data.js
- Mobile-responsive with forest background theme
- Password authentication and safety guidelines
- Players, Courses, Events, Points Systems tabs
- No delete buttons for safety
- ~1,200 lines total (cleaner than old 1,500-line monolith)
- See section 4 for complete details

**✅ Completed - Podcast Tab (Jan 30, 2025):**
- Episode 1 published and live on dashboard
- ElevenLabs voice integration
- Full audio playback controls
- See section 3 for complete details

---

### 2.5. Stats Page Implementation
**Priority:** High
**Status:** ✅ Complete (Jan 22, 2025)
**Description:** Build out the Stats tab (2nd tab) with meaningful player performance statistics and visualizations.

**✅ Completed Features:**
- **3 Interactive Swipeable Charts:**
  - Chart 1: Performance Breakdown (birdies/eagles/aces per player)
  - Chart 2: Rounds Analysis (wins/podiums/other rounds per player)
  - Chart 3: Average Score Analysis (by tier for seasons, by round for tournaments)
- **Touch Gestures:** Horizontal swipe navigation between charts
- **Event Selector:** Season/Tournament toggle at top
- **Player Dropdown:** Chart 3 allows selecting individual player
- **Tier Labels:** Easy (1.0x), Moderate (1.5x), Hard (2.0x), Elite (2.5x)
- **State Preservation:** Carousel position maintained when changing events/players
- **Code Quality:** Refactored chart rendering to eliminate duplication

**Technical Implementation:**
- Added `getPerformanceBreakdown()`, `getRoundsAnalysis()`, `getAverageScoreByTier()` in data.js
- Touch event handlers for swipe gestures
- Reusable `renderChart()` helper function
- Total: ~340 lines added across 3 files

---

### 3. Podcast Feature Refinement
**Priority:** High
**Status:** ✅ Phase 1 & 2 Complete (Jan 30, 2025) | Phase 3 TODO
**Description:** Automated podcast generation system with mobile dashboard integration.

**✅ Completed - Phase 1 (Dashboard UI + Infrastructure):**
- Built complete Podcast tab UI in mobile dashboard
  - Episode list with title, date, duration, description
  - HTML5 audio player with play/pause/seek controls
  - Playback speed control (1x, 1.25x, 1.5x, 1.75x, 2x)
  - Download button for episodes
  - "Generate New Episode" manual trigger button
- Created podcastService.js with 13 reusable functions
- Built /api/generatePodcast endpoint (metadata generation only)
- Database tables verified (podcast_episodes, podcast_scripts, podcast_generation_logs)
- Manual episode generation working (Episode #1 created with 2025 data)
- Episode cards with Play/Download buttons (when audio exists)
- 220+ lines of podcast-specific CSS styling
- Fixed RLS policy issues and API import errors

**✅ Completed - Phase 2 (Audio Generation & Publishing):**
- **Episode 1 Published:** "The Ruckus Until Now" (23:59 duration)
- Integrated ElevenLabs voices (George and Chris from UK library)
- Custom intro/outro music ("Forest Frolic")
- Supabase Storage hosting for audio files
- Inline player with full playback controls on dashboard
- Podcast tab now displays published episodes
- Full end-to-end workflow validated

**⏳ TODO - Phase 3 (Enhancements):**
- RSS feed for podcast apps
- Better episode metadata (show notes, timestamps)
- Archive old episodes (auto-delete after 1 year)
- Event-specific episode generation (tournament specials)
- Automated monthly generation (cron job for Feb 1, 2026)

---

### 4. Admin Panel Overhaul
**Priority:** High
**Status:** ✅ Complete (Nov 30, 2025 - Jan 30, 2025)
**Description:** Modernize admin panel with modular architecture and improved UX.

**✅ Completed - Architecture:**
- Built new admin panel at `/public/admin/`
- 4 modular files: index.html, style.css, app.js, data.js
- ES6 modules for better organization
- Mobile-responsive design with forest background theme
- Password authentication system
- Info icon (ℹ️) with safety guidelines

**✅ Completed - Features:**
- **Players Tab:**
  - View all registered players
  - Add new players (with safety confirmation)
  - Player name validation
  - No delete buttons (safety feature)
- **Courses Tab:**
  - View all courses with tier grouping (Easy/Moderate/Hard/Elite)
  - Add new courses with tier selection (1.0x, 1.5x, 2.0x, 2.5x)
  - Course name validation
  - No delete buttons (safety feature)
- **Events Tab:**
  - View seasons and tournaments separately
  - Add new events (Season or Tournament type)
  - Player selection with multi-select checkboxes
  - Event name, type, start/end dates
  - No delete buttons (safety feature)
- **Points Systems Tab:**
  - View existing point systems
  - Add new points system configuration
  - JSONB config editor for points allocation, tie breakers, multipliers
  - Arrow buttons for tie breaker reordering (↑↓ replaced drag-drop)
  - Bonus types: most_birdies (added in migration 006)

**✅ Database Changes:**
- Migration 006: Added `most_birdies` bonus type to points_systems table

**✅ Code Quality:**
- Removed all delete buttons for safety
- Added safety confirmation dialogs for all modifications
- Clean separation of concerns (data.js handles all DB operations)
- ~1,200 lines total (much cleaner than old 1,500-line monolith)

---

### 5. Email Notification Templates
**Priority:** Low
**Status:** Partially Implemented
**Description:** Improve email notification templates with better design and more information.

**Current State:**
- Basic success/error emails work
- Plain HTML templates

**Proposed:**
- Better visual design (branded templates)
- More detailed success emails (leaderboard snippet, stats)
- Digest emails (weekly summary)
- Customizable templates per event

---

## System Improvements

Enhancements to existing functionality that improve performance, maintainability, or user experience.

### Database Schema Optimization

#### Replace `season` column with `event_name` in rounds table
**Priority:** Low
**Description:** The current `season` column in the `rounds` table is inconsistent (NULL for some events, populated for others). Replace it with `event_name` that stores the actual event name.

**Current State:**
- `rounds.season` (integer) - inconsistent values
- `rounds.event_id` (bigint) - already links to events table

**Proposed Change:**
```sql
ALTER TABLE rounds DROP COLUMN season;
ALTER TABLE rounds ADD COLUMN event_name TEXT;
```

**Alternative:** Simply ignore `season` column since `event_id` provides the link to get event name via JOIN.

**Why Low Priority:**
- Not blocking any functionality
- `event_id` already provides the relationship to events table
- Can query event name via JOIN when needed

---

### Performance Optimizations

#### Database Connection Pooling
**Priority:** Low
**Description:** Implement connection pooling for Supabase queries to improve performance under load.

#### Caching Layer
**Priority:** Low
**Description:** Add Redis or in-memory caching for frequently accessed data (players list, courses, events).

#### Image Processing Optimization
**Priority:** Low
**Description:** Compress scorecard images before sending to Vision API to reduce costs and improve speed.

---

### Testing & Quality

#### Automated Testing Suite
**Priority:** Medium
**Description:** Expand test coverage beyond manual tests.

**Proposed:**
- Unit tests for all services (using Node test runner)
- Integration tests for API endpoints
- E2E tests for dashboard workflows
- Automated testing in CI/CD pipeline

---

### Documentation

#### API Documentation
**Priority:** Low
**Description:** Generate comprehensive API documentation for all endpoints.

**Tools:**
- JSDoc comments in code
- Auto-generate OpenAPI spec
- Interactive API explorer

---

## How to Use This Document

### Adding New Items
When you identify a new feature or improvement:
1. Determine if it's a **Feature** (new functionality) or **Improvement** (enhancement to existing)
2. Add under appropriate section with clear description
3. Set priority: High/Medium/Low
4. Set status: Not Started/Planned/In Progress/Blocked/Completed
5. Continue with current task - avoid scope creep

### Prioritization
- **High:** Critical for user experience or blocking other work
- **Medium:** Important but not urgent, can be scheduled
- **Low:** Nice to have, tackle when time permits

### Status Tracking
- **Not Started:** Idea documented, no work done
- **Planned:** Scheduled for implementation, design/research done
- **In Progress:** Actively being worked on
- **Blocked:** Waiting on dependency or decision
- **Completed:** Done and deployed

---

## Completed Features

### Code Quality Improvements (Jan 30, 2025)
**Description:** Major codebase cleanup and documentation updates.
- Removed 112,000+ lines of temporary files and build artifacts
- Cleaned up debug logs and console statements
- Updated all documentation to reflect current state
- Removed outdated files (old admin.html, old index.html)
- Improved SESSION-HANDOFF.md with complete system context
- **Result:** Cleaner repository, better maintainability

### Old File Cleanup (Jan 30, 2025)
**Description:** Removed deprecated admin and dashboard files.
- Deleted `/public/admin.html` (old monolithic admin, replaced by `/public/admin/`)
- Deleted `/public/index.html` (old dashboard, replaced by `/public/dashboard/`)
- Updated documentation references to point to new locations
- **Result:** Eliminated confusion between old and new implementations

### Code Cleanup & Optimization (Nov 25, 2025)
**Description:** Comprehensive code review and cleanup following architecture principles.
- **High Priority Fixes:**
  - Fixed memory leak risk in carousel touch event handlers
  - Eliminated event handler duplication (reduced ~80 lines)
  - Split large createScoreBarsChart function into 3 focused functions
- **Medium Priority Fixes:**
  - Extracted chart configuration to constants (CHART_CONFIG)
  - Converted CSS magic numbers to transition timing variables
- **Result:** Code review grade improved from A- to A
- **Files Modified:** app.js (~1129 lines), style.css (~1404 lines)

### Landing Page with Navigation (Nov 25, 2025)
**Description:** Built landing page with animated navigation to dashboard.
- Created landing page with funny disc golf description
- 4 vertical tab cards: Leaderboard, Stats, Podcast, Rules
- Smooth morph animation (600ms) from vertical tabs to bottom nav
- URL-based routing with hash navigation (#leaderboard, #stats, etc.)
- Clickable ParSaveables title to return to landing page
- Browser back/forward support with hashchange handler
- Renamed "Home" → "Leaderboard" and "Info" → "Rules" throughout
- Compact design with all tabs visible without scrolling
- Fixed double rendering bug on Stats and Rules pages
- Fixed scroll blocking issue when switching pages
- Added top-10 rounds rule to season descriptions on Rules page

### Course Database Cleanup (Jan 22, 2025)
**Description:** Eliminated duplicate course entries using aliases system.
- Created `course_aliases` table with 17+ aliases
- Database function `find_course_by_name_or_alias()` with 3-level fallback
- Updated 14 historical rounds to reference canonical names
- Deleted 11 duplicate courses
- **Result:** Exactly 20 canonical courses (down from 31+)

### Info Tab Implementation (Jan 22, 2025)
**Description:** Built Info tab showing event-specific points system information.
- Event selector (Season/Tournament toggle)
- Card 1: Funny description (4 variants based on config)
- Card 2: Points allocation, tie breakers, course multipliers
- Course multipliers only show for seasons with multipliers enabled

### Stats Tab Implementation (Jan 22, 2025)
**Description:** Built Stats tab with 3 interactive swipeable charts.
- Chart 1: Performance Breakdown (birdies/eagles/aces)
- Chart 2: Rounds Analysis (wins/podiums/other)
- Chart 3: Average Score Analysis (by tier or round)
- Touch gestures, event selector, player dropdown
- State preservation across navigation

### Mobile Dashboard (Nov 21, 2025)
**Description:** Built new mobile-first dashboard at `/public/dashboard/`.
- 5 modular files (index.html, style.css, app.js, components.js, data.js)
- Home, Stats, Info tabs complete
- Forest background, podium, leaderboard, expandable stats
- Bottom navigation with 4 tabs

### Manual Scorecard Processing Trigger (Nov 19, 2025)
**Description:** Added dashboard button to manually trigger scorecard processing instead of relying on cron jobs.

### Event-Based Player Filtering (Nov 19, 2025)
**Description:** Dashboard now filters leaderboards by event-specific player lists from `events.players` column.

---

**Last Updated:** 2025-01-30
