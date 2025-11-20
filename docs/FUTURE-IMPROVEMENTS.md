# Future Improvements

This document tracks enhancement ideas that are not critical for current functionality but would improve the system in the future.

## Database Schema Improvements

### Replace `season` column with `event_name` in rounds table
**Priority:** Low
**Description:** The current `season` column in the `rounds` table is inconsistent (NULL for some events, populated for others). Replace it with `event_name` that stores the actual event name (e.g., "Season 2025", "Portlandia 2025", "Minneapolis Disc Golf Classic 2024").

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

## How to Use This Document

When you encounter a potential improvement during development:
1. Add it to this document with a clear description
2. Mark the priority (Low/Medium/High)
3. Continue with the current task
4. Review this list periodically to decide what to implement

**Note:** This list helps avoid scope creep during active development while preserving good ideas for later.
