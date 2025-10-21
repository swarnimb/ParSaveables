# ParSaveables - Changes Log

## 2025-10-20: Top 10 Scoring & Registered Players Filter

### Changes Implemented

#### 1. Top 10 Scores Per Player ✅

**Problem:**
Players who participated in more rounds were at a disadvantage if some rounds were below average. A player who played 15 rounds but had 5 bad games would score lower than someone who only played their best 10 rounds.

**Solution:**
- Only the best 10 rounds count toward season total
- Players can play as many rounds as they want
- System automatically picks their top 10 highest-scoring rounds
- Encourages participation without penalty for experimenting

**Dashboard Changes:**
- Completely rewrote `loadLeaderboard()` function
- Collects all rounds per player
- Sorts by points (descending)
- Takes only top 10 rounds using `.slice(0, 10)`
- Sums only those top 10 scores for season total
- Added "Played" column (total rounds)
- Added "Counted" column (rounds counted, max 10)

**Code Example:**
```javascript
// Collect all rounds per player
const playerRounds = {};
data.forEach(round => {
    if (!playerRounds[round.player_name]) {
        playerRounds[round.player_name] = [];
    }
    playerRounds[round.player_name].push({
        points: round.final_total || 0,
        rank: round.rank
    });
});

// Calculate stats using only TOP 10 scores
Object.entries(playerRounds).forEach(([name, rounds]) => {
    const sortedRounds = rounds.sort((a, b) => b.points - a.points);
    const top10Rounds = sortedRounds.slice(0, 10);

    playerStats[name] = {
        points: top10Rounds.reduce((sum, r) => sum + r.points, 0),
        rounds: rounds.length, // Total played
        countedRounds: top10Rounds.length // Counted (max 10)
    };
});
```

#### 2. Registered Players Filter ✅

**Problem:**
- Guest players appearing in season standings
- Truncated player names causing duplicate entries
- No way to limit season to core group members

**Solution:**
- Created 12-player registry
- Name normalization for truncated names
- Filter all dashboard sections to show registered players only

**Database Changes:**
```sql
CREATE TABLE registered_players (
  id SERIAL PRIMARY KEY,
  player_name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO registered_players (player_name) VALUES
  ('Intern Line Cook'),
  ('Jabba the Putt'),
  ('Food Zaddy'),
  ('Jaguar'),
  ('Shogun'),
  ('BigBirdie'),
  ('Butter Cookie'),
  ('Cobra'),
  ('🦅'),
  ('Fireball'),
  ('Ace Brook'),
  ('ScarletSpeedster');
```

**n8n Workflow Updates:**
- Added `normalizePlayerName()` function to "Clean and Rank Players" node
- Handles truncated names with prefix matching:
  - "Intern..." → "Intern Line Cook"
  - "Jabba..." → "Jabba the Putt"
  - "Food..." → "Food Zaddy"
- Applied to all players before saving to database

**Name Normalization Code:**
```javascript
function normalizePlayerName(name) {
  // Handle truncated names
  if (name.startsWith('Intern')) return 'Intern Line Cook';
  if (name.startsWith('Jabba')) return 'Jabba the Putt';
  if (name.startsWith('Food')) return 'Food Zaddy';

  // List of valid registered players
  const registeredPlayers = [
    'Intern Line Cook', 'Jabba the Putt', 'Food Zaddy',
    'Jaguar', 'Shogun', 'BigBirdie', 'Butter Cookie',
    'Cobra', '🦅', 'Fireball', 'Ace Brook', 'ScarletSpeedster'
  ];

  // Check if name is in registered players (exact match)
  if (registeredPlayers.includes(name)) return name;

  // If not matched, return as-is (will be filtered out in dashboard)
  return name;
}

// Normalize all player names before processing
parsedData.players.forEach(player => {
  player.name = normalizePlayerName(player.name);
});
```

**Dashboard Updates:**
- Added `REGISTERED_PLAYERS` constant (array of 12 names)
- Updated `loadLeaderboard()` to filter registered players
- Updated `loadBirdieLeaders()` to filter registered players
- Updated `loadCoursesTable()` to filter registered players
- Updated `loadMonthlyTrend()` to filter registered players

**Filter Pattern:**
```javascript
// Applied to all dashboard data loading functions
const REGISTERED_PLAYERS = [
    'Intern Line Cook', 'Jabba the Putt', 'Food Zaddy',
    'Jaguar', 'Shogun', 'BigBirdie', 'Butter Cookie',
    'Cobra', '🦅', 'Fireball', 'Ace Brook', 'ScarletSpeedster'
];

// Example from loadLeaderboard()
data.forEach(round => {
    if (!REGISTERED_PLAYERS.includes(round.player_name)) return;
    // ... rest of logic
});
```

### Files Modified

1. **Supabase Database**
   - Created `registered_players` table
   - Inserted 12 player records

2. **n8n Workflow**
   - "Clean and Rank Players" node: Added `normalizePlayerName()` function
   - Applied normalization before stats calculation

3. **Dashboard (index.html)**
   - Added `REGISTERED_PLAYERS` constant
   - Rewrote `loadLeaderboard()` for top 10 scoring
   - Updated table headers (added "Played" and "Counted" columns)
   - Added registered player filter to all 4 data loading functions

### Testing Checklist

- [ ] **Test Top 10 Scoring**
  - Find a player with more than 10 rounds
  - Verify "Played" column shows total rounds
  - Verify "Counted" column shows 10 (or less if under 10 rounds)
  - Manually check that only top 10 scores are summed

- [ ] **Test Name Normalization**
  - Post a scorecard with "Intern Line C..." truncated
  - Check n8n execution log shows "Intern Line Cook"
  - Verify it appears in dashboard as "Intern Line Cook"

- [ ] **Test Registered Players Filter**
  - Check that only 12 registered players appear in all sections
  - Post a scorecard with a guest player
  - Verify guest does not appear in dashboard

- [ ] **Test Edge Cases**
  - Player with exactly 10 rounds (Played = Counted = 10)
  - Player with less than 10 rounds (Played = Counted < 10)
  - Player with 15+ rounds (Played > Counted = 10)

### Technical Details

**Top 10 Scoring Algorithm:**
```javascript
// Step 1: Collect all rounds per player
const playerRounds = {};
data.forEach(round => {
    if (!REGISTERED_PLAYERS.includes(round.player_name)) return;
    if (!playerRounds[round.player_name]) {
        playerRounds[round.player_name] = [];
    }
    playerRounds[round.player_name].push({
        points: round.final_total || 0,
        rank: round.rank
    });
});

// Step 2: Sort and take top 10 for each player
Object.entries(playerRounds).forEach(([name, rounds]) => {
    const sortedRounds = rounds.sort((a, b) => b.points - a.points);
    const top10Rounds = sortedRounds.slice(0, 10);

    playerStats[name] = {
        points: top10Rounds.reduce((sum, r) => sum + r.points, 0),
        rounds: rounds.length,
        countedRounds: top10Rounds.length,
        wins: rounds.filter(r => r.rank === 1).length,
        top3: rounds.filter(r => r.rank <= 3).length
    };
});

// Step 3: Sort by season points (top 10 total)
const sortedPlayers = Object.entries(playerStats)
    .sort(([, a], [, b]) => b.points - a.points);
```

**Name Normalization Flow:**
1. Claude Vision extracts name from screenshot (may be truncated)
2. n8n "Clean and Rank Players" node calls `normalizePlayerName()`
3. Prefix matching applied (Intern, Jabba, Food)
4. Full name stored in database
5. Dashboard filters to only show registered players

### Deployment

- **Committed**: 2025-10-20
- **Pushed to**: GitHub main branch
- **Auto-deployed**: Vercel (https://par-saveables.vercel.app)
- **Status**: Live

### Breaking Changes

None. All changes are backward compatible. Existing data remains intact.

**Impact on Existing Data:**
- Players with >10 rounds will see lower season totals (only top 10 count)
- Non-registered players will no longer appear in dashboard
- All historical data is preserved in database

---

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
