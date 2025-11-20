# Next Steps - Testing Your Workflow

## What We Just Created

You now have a **manual end-to-end test** that lets you test the entire scorecard processing workflow with a real UDisc screenshot, without needing to send emails or wait for cron jobs.

### Test File
`src/tests/manual-test-workflow.js`

### What It Tests (8 Steps)
1. ✅ **Vision Extraction** - Claude Vision API extracts data from image
2. ✅ **Stats Calculation** - Counts birdies, eagles, aces, pars, bogeys
3. ✅ **Player Ranking** - Sorts by score with 4-level tie-breaking
4. ✅ **Event Assignment** - Matches date to season/tournament
5. ✅ **Player Validation** - Fuzzy matches names against registry
6. ✅ **Config Loading** - Loads points system and course data
7. ✅ **Points Calculation** - Applies rank points, bonuses, multipliers
8. ✅ **Data Preparation** - Formats data for database (dry run - doesn't insert)

---

## How to Run the Test

### Step 1: Get a UDisc Scorecard Screenshot

**Option A: Use existing screenshot**
- Do you have any UDisc scorecard screenshots from previous rounds?
- Save one to your project folder (e.g., `test-scorecard.jpg`)

**Option B: Create a new one**
- Open UDisc app
- View any past round scorecard
- Take screenshot
- Save to project folder

**Requirements:**
- Must show at least 4 players
- Must show hole-by-hole scores
- Must show course name
- Date visible (or it will use current year)

### Step 2: Run the Test

**Option 1: Using npm script**
```bash
npm run test:workflow path/to/scorecard.jpg
```

**Option 2: Direct node command**
```bash
node src/tests/manual-test-workflow.js path/to/scorecard.jpg
```

**Option 3: Remote URL**
```bash
npm run test:workflow https://example.com/scorecard.png
```

### Step 3: Review the Output

The test will show you:
- ✅ What Claude Vision extracted from the image
- ✅ Calculated stats for each player
- ✅ Ranking with tie-breaking
- ✅ Which event was assigned
- ✅ Player name matching results
- ✅ Final points calculation
- ✅ What would be inserted into database

**Example Output:**
```
✅ WORKFLOW TEST COMPLETED SUCCESSFULLY!

📊 Summary:
   ✓ Vision extraction: PASS
   ✓ Stats calculation: PASS
   ✓ Player ranking: PASS
   ✓ Event assignment: PASS
   ✓ Player validation: PASS
   ✓ Configuration loading: PASS
   ✓ Points calculation: PASS
   ✓ Data preparation: PASS

🎉 All systems operational!
```

---

## What Could Go Wrong (And How to Fix)

### Error: "No image path provided"
**Fix:** Provide the path to your scorecard image
```bash
npm run test:workflow ./my-scorecard.jpg
```

### Error: "supabaseUrl is required"
**Fix:** Make sure your `.env` file exists with credentials
```bash
cp .env.example .env
# Then edit .env with your actual credentials
```

### Error: "Vision API rejected image"
**Fix:** Image might not be a valid UDisc scorecard
- Make sure it shows at least 4 players
- Verify it's a UDisc screenshot (not other app)
- Check image isn't too blurry or cropped

### Error: "No event found for date"
**Fix:** Create an active season in your database
- Go to Supabase
- Add event with current year as date range
- Or modify scorecard date to match existing event

### Warning: "Unknown players"
**Fix:** Add players to your registry (or ignore - test still completes)
- Go to Supabase `registered_players` table
- Add player names from scorecard

---

## Sample Test Scenarios

### Scenario 1: Basic Test
```bash
# Test with a local screenshot
npm run test:workflow ./test-scorecard.jpg
```
**Expected:** All 8 steps pass, shows final points for each player

### Scenario 2: Remote Image
```bash
# Test with a URL
npm run test:workflow https://i.imgur.com/your-scorecard.png
```
**Expected:** Same as Scenario 1

### Scenario 3: Fuzzy Name Matching
```bash
# Use screenshot with truncated names like "Intern..." or "Jabba..."
npm run test:workflow ./truncated-names.jpg
```
**Expected:** Step 4 shows fuzzy matches found

### Scenario 4: Unknown Course
```bash
# Use screenshot from course not in database
npm run test:workflow ./unknown-course.jpg
```
**Expected:** Step 5 shows default course (multiplier 1.0)

---

## What to Check in the Output

### 1. Vision Extraction (Step 1)
- ✅ Correct course name extracted
- ✅ Correct date (or current year if not visible)
- ✅ All player names extracted
- ✅ Hole-by-hole scores look accurate

### 2. Stats Calculation (Step 2)
- ✅ Birdies counted correctly
- ✅ Eagles/aces detected
- ✅ Total score matches scorecard

### 3. Ranking (Step 2)
- ✅ Players sorted by score (lowest to highest)
- ✅ Ties broken correctly (by birdies → pars → first birdie hole)

### 4. Event Assignment (Step 3)
- ✅ Correct season/tournament assigned
- ✅ Points system ID looks right

### 5. Player Validation (Step 4)
- ✅ All known players matched (exact or fuzzy)
- ✅ Unknown players flagged but not blocking

### 6. Config Loading (Step 5)
- ✅ Points system loaded
- ✅ Course multiplier correct (or 1.0 default)

### 7. Points Calculation (Step 6)
**Most Important Check!**
- ✅ Rank 1 gets highest base points (e.g., 100)
- ✅ Rank 2 gets second highest (e.g., 90)
- ✅ Bonuses added for birdies/eagles/aces
- ✅ Course multiplier applied
- ✅ Final points make sense

**Example Verification:**
```
1. Kyle Fiedler
   Rank: 1 | Score: -2 | Birdies: 4
   Base Points: 100 | Bonuses: 4 | Multiplier: 1.5x
   🏆 FINAL POINTS: 156

   Calculation check:
   (100 + 4) × 1.5 = 156 ✅ Correct!
```

### 8. Data Preparation (Step 7)
- ✅ Round data has all required fields
- ✅ Player rounds data includes hole-by-hole scores
- ✅ No null/undefined values in critical fields

---

## After Successful Test

### Option 1: Keep Dry Run (Recommended)
- Leave test as-is (safe, no database changes)
- Run whenever you want to verify workflow
- Great for debugging issues

### Option 2: Enable Database Insertion
If you want to actually insert test data:

1. **Modify the script** (around line 230):
```javascript
// Change this:
console.log('⚠️  This is a TEST - we will NOT insert into the database.');

// To this:
console.log('💾 Inserting into database...');
const round = await db.insertRound(roundData);
const playerRounds = playerRoundsData.map(pr => ({ ...pr, round_id: round.id }));
await db.insertPlayerRounds(playerRounds);
console.log('✅ Data inserted successfully!');
```

2. **Run the test**:
```bash
npm run test:workflow ./scorecard.jpg
```

3. **Verify in Supabase**:
- Check `rounds` table for new entry
- Check `player_rounds` table for player stats
- Check leaderboard in frontend

---

## Troubleshooting Guide

### Test hangs/times out
- Check internet connection (Vision API requires network)
- Verify Anthropic API key is valid
- Check Supabase connection

### Points calculation seems wrong
- Verify points system config in database
- Check course multiplier is correct
- Review rank points array (should be descending: [100, 90, 85...])

### Player names not matching
- Add variations to `registered_players` table
- Check for typos in database
- Verify fuzzy matching threshold (95% exact, 75% fuzzy)

### Course not found
- Add course to `courses` table with multiplier
- Or accept default (multiplier 1.0)
- Check course name spelling in database

---

## Next Steps After Testing

### 1. Verify Production Workflow
Once test passes, you can confidently use the actual email workflow:
```bash
# The real workflow polls Gmail and processes scorecards automatically
# No changes needed - uses same services we just tested
```

### 2. Monitor Logs
When processing real scorecards:
- Check Vercel logs for errors
- Review Supabase logs for database issues
- Monitor Anthropic API usage

### 3. Optimize Further (Optional)
If you want even better performance:
- Add more caching (players list, courses list)
- Implement database connection pooling
- Add more retry logic to Gmail API

---

## Summary

**You now have:**
- ✅ Complete end-to-end workflow test
- ✅ Safe dry-run mode (no database changes)
- ✅ Detailed output showing each step
- ✅ Easy to run: `npm run test:workflow <image>`

**To test your workflow:**
1. Get a UDisc scorecard screenshot
2. Run: `npm run test:workflow ./scorecard.jpg`
3. Review output to verify all steps pass
4. Check final points calculation is correct

**Result:** Full confidence that your entire system works correctly! 🎉
