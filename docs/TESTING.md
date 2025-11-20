# Testing Guide

## Complete Testing Strategy

Test the entire system in 3 phases:

1. **Email Service Test** - Gmail API integration (Steps 1-2)
2. **Workflow Test** - Scorecard processing without email (Steps 3-12)
3. **Full Integration** - Email → Processing → Database (Steps 1-12)

---

## Phase 1: Email Service Test

Tests Gmail API integration: OAuth2, inbox polling, attachment extraction.

**What it tests:**
1. ✅ Gmail OAuth2 authentication
2. ✅ Inbox polling for unread emails with attachments
3. ✅ Image attachment extraction as data URLs
4. ✅ Email marking as read (dry run)
5. ✅ Notification email sending (dry run)

### How to Run

```bash
npm run test:email
```

**Prerequisites:**
- Valid `.env` with Gmail credentials (`GMAIL_*` variables)
- OAuth2 refresh token configured
- Gmail API enabled in Google Cloud Console

**Safe Mode:** Does NOT mark emails or send notifications by default.

### Example Output

```
================================================================================
🧪 MANUAL EMAIL SERVICE TEST
================================================================================

STEP 1: Initialize Gmail OAuth2 client
✅ Gmail client initialized successfully!

STEP 2: Poll inbox for unread emails with attachments
✅ Found 2 unread email(s) with attachments

STEP 3: Extract image attachments from first email
   Email ID: 18c4a2b3f8e91d20
   From: player@example.com
   Subject: Round at Zilker Park
   Date: 2025-11-19

✅ Extracted 1 attachment(s)
   1. scorecard.jpg (image/jpeg)
      Size: 234567 bytes
      Data URL preview: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...

STEP 4: Mark email as read (DRY RUN)
⚠️  This is a TEST - we will NOT mark the email as read.

STEP 5: Send notification email (DRY RUN)
⚠️  This is a TEST - we will NOT send a test email.

================================================================================
✅ EMAIL SERVICE TEST COMPLETED!
================================================================================

📊 Summary:
   ✓ Gmail OAuth2 authentication: PASS
   ✓ Inbox polling: PASS
   ✓ Unread emails found: 2
   ✓ Attachments extracted: 1
   ✓ Email marking: READY (dry run)
   ✓ Email sending: READY (dry run)

🎉 Gmail integration is working correctly!
```

---

## Phase 2: Workflow Test

Test scorecard processing workflow with a local image (bypasses email).

**What it tests:**
1. ✅ Vision extraction (Claude Vision API)
2. ✅ Stats calculation
3. ✅ Player ranking
4. ✅ Event assignment
5. ✅ Player validation
6. ✅ Configuration loading
7. ✅ Points calculation
8. ✅ Data preparation for database

**Safe Mode:** Does NOT insert into database by default (dry run).

### How to Run

**Option 1: Local Image File**
```bash
npm run test:workflow path/to/scorecard.jpg
```

**Option 2: Remote Image URL**
```bash
npm run test:workflow https://example.com/scorecard.png
```

**Option 3: Data URL (base64)**
```bash
npm run test:workflow "data:image/jpeg;base64,/9j/4AAQ..."
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
