# ParSaveables Roadmap

This document tracks upcoming features and improvements for the ParSaveables system.

---

## Feature Implementation

Major features to be built that will add new functionality to the system.

### 1. Chatbot Enhancement
**Priority:** High
**Status:** Needs Work
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

---

### 2. Dashboard & Admin UI Overhaul
**Priority:** High
**Status:** ✅ Mobile Dashboard Complete (Nov 21, 2025)
**Description:** Completely redesign dashboard and admin panel for better UX, modularity, and maintainability.

**✅ Completed - Mobile Dashboard:**
- Built new mobile-first dashboard at `/public/dashboard/`
- 5 modular files using ES6 modules (index.html, style.css, app.js, components.js, data.js)
- Forest background with semi-transparent cards
- Top 3 podium with metallic gold/silver/bronze disc graphics
- Event selector (Season/Tournament toggle)
- Expandable stats showing overall performance
- Bottom navigation with iPhone-style notch
- Total: ~1,540 lines vs old 2,700-line monolith

**Still TODO - Admin Panel:**
- Admin panel still uses old monolithic structure (~1,500 lines)
- Apply same modular architecture as new dashboard
- Improve mobile responsiveness for admin functions

---

### 3. Podcast Feature Refinement
**Priority:** Medium
**Status:** Partially Implemented
**Description:** Enhance the automated podcast generation system.

**Current State:**
- Basic podcast generation exists
- Playback on dashboard works

**Proposed Enhancements:**
- Automatic episode generation on schedule
- Better audio quality/voice selection
- Episode metadata (show notes, timestamps)
- RSS feed for podcast apps
- Download functionality
- Archive old episodes

---

### 4. Registered Players Management
**Priority:** Medium
**Status:** Not Started
**Description:** Add full CRUD interface for managing registered players in the admin panel.

**Requirements:**
- Add "Registered Players" tab to admin panel
- Create, read, update, delete player records
- Mark players as active/inactive
- Bulk import from CSV
- Player profile pages (optional)

**Database:**
- Table: `registered_players`
- Columns: `id`, `player_name`, `active`, `created_at`

---

### 5. Event Player Selection
**Priority:** Medium
**Status:** Not Started
**Description:** When creating/editing events, allow admin to select which registered players participate.

**Requirements:**
- Multi-select dropdown in event form
- Auto-populate from player_rounds when processing scorecards
- Ability to manually add/remove players from events
- Visual indicator of which players are in which events

**Implementation:**
- Enhance admin.html event form
- Add player selection UI component
- Update event creation/edit API

---

### 6. Email Notification Templates
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

### Manual Scorecard Processing Trigger
**Completed:** 2025-11-19
**Description:** Added dashboard button to manually trigger scorecard processing instead of relying on cron jobs.

### Event-Based Player Filtering
**Completed:** 2025-11-19
**Description:** Dashboard now filters leaderboards by event-specific player lists from `events.players` column.

---

**Last Updated:** 2025-11-19
