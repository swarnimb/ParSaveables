# ParSaveables - Changes Log

## 2025-10-20: Multi-Season Support & UX Improvements

### Changes Implemented

#### 1. Multi-Season Support ✅

**Database Changes:**
- Added `season` column to `rounds` table
- Season automatically captured from scorecard submission date
- Existing data migrated to 2025 season
- Index created for faster season filtering

**n8n Workflow:**
- Updated "Save Round Info" node
- Added field: `season = {{ new Date().getFullYear() }}`
- Automatically tags scorecards with current year

**Dashboard:**
- Season selector dropdown in header
- Populates with all available seasons (descending order)
- Defaults to most recent season
- All data queries filter by selected season
- Graceful handling when no data exists for a season

#### 2. Standardized Box Sizes for Mobile ✅

**CSS Updates:**
- All `.card` elements: `min-height: 450px`
- `.chat-section`: `min-height: 450px`
- Added `display: flex` and `flex-direction: column`
- `.scrollable-table`: Added `flex-grow: 1` for proper scaling
- `.chat-box`: Added `flex-grow: 1`

**Result:**
- Consistent box heights across all sections
- Better mobile viewing experience
- No more skewed layouts on different screen sizes

#### 3. Improved Sorting ✅

**Season Leaderboard:**
- NOW: Sorted by total points (descending)
- WAS: Unsorted aggregation
- Shows highest point earners first

**Aces/Eagles/Birdies:**
- NOW: Sorted by total count (descending)
- WAS: Already sorted by total
- Confirmed working correctly

**Average Score by Course Tiers:**
- NOW: Sorted by total season points (descending)
- WAS: Alphabetical by player name
- Shows best performers first

**All Tables:**
- Consistent descending sort (best to worst)
- Easy to identify leaders at a glance

### Files Modified

1. **Supabase Database**
   - `rounds` table: Added `season` column
   - Migration script executed

2. **n8n Workflow**
   - "Save Round Info" node: Added season field mapping

3. **Dashboard (index.html)**
   - Added season selector UI
   - Updated all data loading functions
   - Added season filtering logic
   - Improved CSS for consistent sizing
   - Enhanced sorting in all visualizations

### Testing Checklist

- [ ] **Test Season Selector**
  - Post a new scorecard
  - Verify it appears under correct season (2025)
  - Switch seasons and verify data filters correctly

- [ ] **Test Mobile View**
  - Open dashboard on mobile device
  - Verify all boxes are same height
  - Scroll through each section
  - Confirm no layout issues

- [ ] **Test Sorting**
  - Check leaderboard shows highest points first
  - Check aces/eagles/birdies shows highest counts first
  - Check course tiers shows best performers first

- [ ] **Test Edge Cases**
  - Select a season with no data
  - Verify "No data for this season" message shows
  - Refresh data and confirm it works

### Next Steps

1. **Monitor 2025 Season End**
   - When first 2026 scorecard is posted, verify it creates new season
   - Check that 2026 appears in dropdown
   - Confirm switching between 2025 and 2026 works

2. **Gather User Feedback**
   - Ask group members about season selector
   - Get feedback on mobile layout
   - Check if sorting makes sense to users

3. **Future Enhancements** (Not Yet Implemented)
   - Season comparison view
   - Export season data to CSV
   - Player aliases for truncated names
   - Custom date range filtering
   - Head-to-head matchups
   - Player handicaps

### Technical Details

**Season Detection Logic:**
```javascript
// In n8n workflow "Save Round Info" node
season: {{ new Date().getFullYear() }}
```

**Season Filtering Pattern:**
```javascript
// In dashboard functions
const selectedSeason = getSelectedSeason();
const { data: rounds } = await supabase
    .from('rounds')
    .select('id')
    .eq('season', selectedSeason);

const roundIds = rounds.map(r => r.id);
const { data: playerRounds } = await supabase
    .from('player_rounds')
    .select('...')
    .in('round_id', roundIds);
```

**Sorting Examples:**
```javascript
// Leaderboard (by points)
.sort((a, b) => b.points - a.points)

// Aces/Eagles/Birdies (by total)
.sort((a, b) => b.total - a.total)

// Course Tiers (by season points)
.sort((a, b) => playerTotalPoints[b] - playerTotalPoints[a])
```

### Deployment

- **Committed**: 2025-10-20
- **Pushed to**: GitHub main branch
- **Auto-deployed**: Vercel (https://par-saveables.vercel.app)
- **Status**: Live

### Breaking Changes

None. All changes are backward compatible. Existing 2025 data is preserved and accessible.

---

## Previous Changes

### 2025-10-20: Initial Deployment
- Set up Supabase database
- Deployed n8n workflow to Render
- Configured UptimeRobot for 24/7 uptime
- Deployed dashboard to Vercel
- Integrated GroupMe bot
- System fully operational
