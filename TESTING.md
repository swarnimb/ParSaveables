# Testing Guide

## End-to-End Workflow Testing

### Manual Workflow Test

Test the entire scorecard processing workflow with a real UDisc scorecard image.

**What it tests:**
1. ✅ Vision extraction (Claude Vision API)
2. ✅ Stats calculation
3. ✅ Player ranking
4. ✅ Event assignment
5. ✅ Player validation
6. ✅ Configuration loading
7. ✅ Points calculation
8. ✅ Data preparation for database

**Safe Mode:** The test does NOT insert into the database by default (dry run).

### How to Run

**Option 1: Local Image File**
```bash
node src/tests/manual-test-workflow.js path/to/scorecard.jpg
```

**Option 2: Remote Image URL**
```bash
node src/tests/manual-test-workflow.js https://example.com/scorecard.png
```

**Option 3: Data URL (base64)**
```bash
node src/tests/manual-test-workflow.js "data:image/jpeg;base64,/9j/4AAQ..."
```

### Example Output

```
================================================================================
🧪 MANUAL END-TO-END WORKFLOW TEST
================================================================================

📷 Converting local file to data URL: ./test-scorecard.jpg
   ✓ Image loaded: data:image/jpeg;base64,/9j/4AAQSkZJRg...

────────────────────────────────────────────────────────────────────────────────
STEP 1: Extract scorecard data with Claude Vision API
────────────────────────────────────────────────────────────────────────────────
✅ Scorecard extracted successfully!
   Course: Zilker Park
   Date: 2025-11-18
   Players: 5
   Holes: 18

────────────────────────────────────────────────────────────────────────────────
STEP 2: Calculate statistics and rank players
────────────────────────────────────────────────────────────────────────────────
✅ Stats calculated and players ranked!

   Leaderboard:
   1. Kyle Fiedler - Score: -2, Birdies: 4, Points (pre-calc): TBD
   2. David Smith - Score: 0, Birdies: 3, Points (pre-calc): TBD
   ...

────────────────────────────────────────────────────────────────────────────────
STEP 3: Assign event based on scorecard date
────────────────────────────────────────────────────────────────────────────────
✅ Event assigned!
   Event: 2025
   Type: season
   Points System ID: 1

────────────────────────────────────────────────────────────────────────────────
STEP 4: Validate player names against registry
────────────────────────────────────────────────────────────────────────────────
✅ Players validated!
   Exact matches: 4
   Fuzzy matches: 1
   Unknown: 0

────────────────────────────────────────────────────────────────────────────────
STEP 5: Load points system and course configuration
────────────────────────────────────────────────────────────────────────────────
✅ Configuration loaded!
   Points System: Season 2025
   Course: Zilker Park
   Course Multiplier: 1.5

────────────────────────────────────────────────────────────────────────────────
STEP 6: Calculate final points for each player
────────────────────────────────────────────────────────────────────────────────
✅ Points calculated!

   Final Leaderboard with Points:
   1. Kyle Fiedler
      Rank: 1 | Score: -2 | Birdies: 4
      Base Points: 100 | Bonuses: 4 | Multiplier: 1.5x
      🏆 FINAL POINTS: 156

   2. David Smith
      Rank: 2 | Score: 0 | Birdies: 3
      Base Points: 90 | Bonuses: 3 | Multiplier: 1.5x
      🏆 FINAL POINTS: 139.5

────────────────────────────────────────────────────────────────────────────────
STEP 7: Database insertion (DRY RUN)
────────────────────────────────────────────────────────────────────────────────
⚠️  This is a TEST - we will NOT insert into the database.

📋 Would insert:
   1 round record
   5 player_round records

================================================================================
✅ WORKFLOW TEST COMPLETED SUCCESSFULLY!
================================================================================

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

### Prerequisites

1. **Valid .env file** with credentials:
   ```bash
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ANTHROPIC_API_KEY=your_key
   ```

2. **Database setup** with:
   - Active event (season/tournament)
   - Registered players
   - Points system configured
   - Courses in database

3. **UDisc scorecard screenshot** showing:
   - At least 4 players
   - Hole-by-hole scores
   - Course name
   - Date (or current date will be used)

### Getting a Test Scorecard

**Option 1: Use your own UDisc screenshot**
- Take screenshot of any UDisc round
- Save as JPG/PNG
- Run test with that file

**Option 2: Create a sample in UDisc**
- Play a practice round (or use past round)
- Screenshot the scorecard
- Email to yourself or save locally

**Option 3: Use a sample URL**
```bash
# If you have a scorecard image hosted somewhere
node src/tests/manual-test-workflow.js https://your-image-url.com/scorecard.jpg
```

### Troubleshooting

**Error: "Vision API rejected image"**
- Ensure image is a valid UDisc scorecard
- Check that at least 4 players are visible
- Verify image quality (not blurry/cropped)

**Error: "No event found for date"**
- Create an active season in your database
- Or modify the scorecard date to match existing event

**Error: "Unknown players"**
- Add player names to `registered_players` table
- Or ignore warning (test still completes)

**Error: "Missing environment variables"**
- Copy `.env.example` to `.env`
- Fill in your actual credentials

### Next Steps

After successful test:
1. Review the output to verify all calculations
2. Check that player names matched correctly
3. Verify points calculation is correct
4. If everything looks good, you can enable actual database insertion by modifying the script

---

## Unit Tests

Run individual service tests:

```bash
# All tests
npm test

# Specific service
npm test src/tests/scoringService.test.js
npm test src/tests/playerService.test.js
npm test src/tests/pointsService.test.js
```

**Note:** Unit tests require valid .env and active database connection.
