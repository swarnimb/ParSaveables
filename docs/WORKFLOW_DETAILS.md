# n8n Workflow Details

## Workflow Export

The complete workflow is available in: `n8n Workflows/ParSaveables Scorecard and Chat.json`

## Workflow Components

### 1. Scorecard Processing Workflow

#### Node Breakdown

**1. Receive Scorecard (Webhook)**
- **Type**: Webhook Trigger
- **Method**: POST
- **Path**: `/webhook/groupme-scorecard-incoming`
- **Purpose**: Receives GroupMe callback when image is posted
- **Output**: Full GroupMe message payload with image URL

**2. Check if Image (If Node)**
- **Type**: Conditional
- **Logic**: `body.attachments[0].type === "image"`
- **Purpose**: Filter out non-image messages
- **True**: Continue to processing
- **False**: No operation

**3. Extract Scorecard Data (Claude Vision)**
- **Type**: HTTP Request
- **API**: Anthropic Messages API
- **Model**: claude-sonnet-4-5-20250929
- **Input**:
  - Detailed prompt with JSON schema
  - Image URL from GroupMe
- **Output**: JSON with holes[], players[], course info
- **Max Tokens**: 4096
- **Temperature**: 0.3 (deterministic)

**Prompt Structure**:
```
Extract ALL data from this UDisc disc golf scorecard screenshot...

Required JSON structure:
{
  "courseName": string,
  "layoutName": string,
  "holes": [{ "hole": number, "distance": number, "par": number }],
  "players": [{
    "name": string,
    "totalStrokes": number,
    "totalScore": number,
    "holeByHole": [18 numbers],
    "birdies": number,
    "eagles": number,
    "aces": number,
    "pars": number,
    "bogeys": number,
    "doubleBogeys": number
  }]
}
```

**4. Clean and Rank Players (Code Node)**
- **Language**: JavaScript
- **Purpose**: Apply tie-breaker logic and assign ranks
- **Inputs**: Parsed Claude response
- **Logic**:
  1. Verify stats by recalculating from hole-by-hole scores
  2. Sort by: total score → birdies → pars → first birdie hole
  3. Assign ranks with proper tie handling
- **Output**: Same structure with verified stats and ranks

**Tie-Breaker Code**:
```javascript
function getFirstBirdieHole(player, holes) {
  for (let i = 0; i < player.holeByHole.length; i++) {
    const score = player.holeByHole[i];
    const par = holes[i].par;
    if (score === par - 1 && score > 1) {
      return i + 1;
    }
  }
  return 999;
}

// Sort with tie-breakers
players.sort((a, b) => {
  if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
  if (a.birdies !== b.birdies) return b.birdies - a.birdies;
  if (a.pars !== b.pars) return b.pars - a.pars;

  const aFirstBirdie = getFirstBirdieHole(a, holes);
  const bFirstBirdie = getFirstBirdieHole(b, holes);
  return aFirstBirdie - bFirstBirdie;
});
```

**5. Calculate Points (Code Node)**
- **Language**: JavaScript
- **Purpose**: Apply points system and course multipliers
- **Inputs**: Ranked player data
- **Logic**:
  1. Lookup course tier from courseName
  2. Calculate tie-adjusted rank points
  3. Add performance bonuses (ace/eagle/birdie)
  4. Apply course multiplier
- **Output**: Players with points breakdown

**Course Tier Lookup**:
```javascript
const courseTiers = {
  "tier1": { multiplier: 1.0, courses: ["Wells Branch", "Lil G"] },
  "tier2": { multiplier: 1.5, courses: ["Zilker Park", "Live Oak"] },
  "tier3": { multiplier: 2.0, courses: ["Northtown Park", "Searight"] },
  "tier4": { multiplier: 2.5, courses: ["East Metro", "Bible Ridge"] }
};

function getCourseMultiplier(courseName) {
  for (const tier in courseTiers) {
    const tierData = courseTiers[tier];
    const matchedCourse = tierData.courses.find(course =>
      courseName.toLowerCase().includes(course.toLowerCase())
    );
    if (matchedCourse) return tierData.multiplier;
  }
  return 1.0; // Default tier 1
}
```

**Tie-Adjusted Points**:
```javascript
const rankPoints = {1: 10, 2: 7, 3: 5};
const defaultRankPoints = 2;

function calculateRankPoints(players) {
  const rankPointsMap = {};
  let i = 0;

  while (i < players.length) {
    const currentRank = players[i].rank;

    // Find tied players
    let tiedPlayers = 1;
    let j = i + 1;
    while (j < players.length && players[j].rank === currentRank) {
      tiedPlayers++;
      j++;
    }

    // Average points for tied players
    let totalPoints = 0;
    for (let k = 0; k < tiedPlayers; k++) {
      const rank = currentRank + k;
      totalPoints += rankPoints[rank] || defaultRankPoints;
    }
    const avgPoints = totalPoints / tiedPlayers;

    // Assign to all tied players
    for (let k = i; k < j; k++) {
      rankPointsMap[k] = avgPoints;
    }

    i = j;
  }

  return rankPointsMap;
}
```

**Points Calculation**:
```javascript
const rankPointsMap = calculateRankPoints(roundData.players);

roundData.players.forEach((player, index) => {
  const baseRankPoints = rankPointsMap[index] || defaultRankPoints;
  const birdiePoints = player.birdies * 1;
  const eaglePoints = player.eagles * 3;
  const acePoints = player.aces * 5;
  const rawPoints = baseRankPoints + birdiePoints + eaglePoints + acePoints;
  const finalPoints = rawPoints * courseMultiplier;

  player.points = {
    rankPoints: baseRankPoints,
    birdiePoints, eaglePoints, acePoints,
    rawTotal: rawPoints,
    courseMultiplier,
    finalTotal: finalPoints
  };
});
```

**6. Save Round Info (Supabase Node)**
- **Type**: Supabase Insert
- **Table**: rounds
- **Fields Mapped**:
  - `date` ← `roundInfo.date`
  - `time` ← `roundInfo.time`
  - `course_name` ← `roundInfo.courseName`
  - `layout_name` ← `roundInfo.layoutName`
  - `location` ← `roundInfo.location`
  - `temperature` ← `roundInfo.temperature`
  - `wind` ← `roundInfo.wind`
  - `course_multiplier` ← `roundInfo.courseMultiplier`
- **Output**: Inserted row with auto-generated `id`

**7. Store Round ID (Set Node)**
- **Type**: Variable Assignment
- **Purpose**: Capture round ID for foreign key
- **Assignments**:
  - `round_id` ← Previous node's `id`
  - `players` ← Full players array from Calculate Points

**8. Parse Players Array (Code Node)**
- **Purpose**: Convert stringified players back to array
- **Logic**: `JSON.parse(data.players)`

**9. Split Players into Rows (Split Out Node)**
- **Type**: Item Splitter
- **Field**: `players`
- **Purpose**: Create one execution per player
- **Output**: Multiple items, one per player

**10. Save Player Stats (Supabase Node)**
- **Type**: Supabase Insert
- **Table**: player_rounds
- **Fields Mapped** (per player):
  - `round_id` ← From Store Round ID node
  - `player_name` ← `name`
  - `rank` ← `rank`
  - `total_strokes` ← `totalStrokes`
  - `total_score` ← `totalScore`
  - `birdies`, `eagles`, `aces`, `pars`, `bogeys`, `double_bogeys`
  - `rank_points` ← `points.rankPoints`
  - `birdie_points` ← `points.birdiePoints`
  - `eagle_points` ← `points.eaglePoints`
  - `ace_points` ← `points.acePoints`
  - `raw_total` ← `points.rawTotal`
  - `final_total` ← `points.finalTotal`
  - `hole_by_hole` ← `JSON.stringify(holeByHole)`
- **Output**: Bulk insert of all player rounds

---

### 2. Chatbot Workflow

#### Node Breakdown

**1. Receive Chat Question (Webhook)**
- **Type**: Webhook Trigger
- **Method**: POST
- **Path**: `/webhook/chatbot`
- **Expected Body**: `{ "question": "Who is winning?" }`
- **Response Mode**: Response Node (async)

**2. Determine Query Type (Code Node)**
- **Purpose**: Keyword-based intent detection
- **Logic**: Simple pattern matching
- **Output**: `queryType` and `searchTerm`

**Query Types**:
```javascript
if (question.includes('leaderboard') || question.includes('winning')) {
  queryType = 'leaderboard';
}
else if (question.includes('stats for') || question.includes('player')) {
  queryType = 'player_stats';
  searchTerm = extractPlayerName(question);
}
else if (question.includes('course')) {
  queryType = 'course_stats';
}
else if (question.includes('round') || question.includes('recent')) {
  queryType = 'recent_rounds';
}
else {
  queryType = 'general';
}
```

**3. Route by Query Type (Switch Node)**
- **Type**: Conditional Router
- **Paths**: 5 outputs (leaderboard, player, course, recent, general)
- **Purpose**: Direct to appropriate data fetch

**4a. Get Leaderboard Data (Supabase)**
- **Type**: Supabase Get All
- **Table**: player_rounds
- **Filter**: None (all data)
- **Purpose**: Full season data for aggregation

**4b. Get Player Stats (Supabase)**
- **Type**: Supabase Get All
- **Table**: player_rounds
- **Filter**: `player_name ILIKE %searchTerm%`
- **Purpose**: Stats for specific player

**4c. Get Course Stats (Supabase)**
- **Type**: Supabase Get All
- **Table**: rounds
- **Filter**: None
- **Purpose**: Course metadata for analysis

**4d. Get Recent Rounds (Supabase)**
- **Type**: Supabase Get All
- **Table**: rounds
- **Limit**: 10
- **Order**: date DESC
- **Purpose**: Latest activity

**5. Merge All Routes (Merge Node)**
- **Type**: Data Merger
- **Inputs**: 5 (all query paths)
- **Mode**: Append
- **Purpose**: Combine results regardless of path taken

**6. Prepare Data for Claude (Code Node)**
- **Purpose**: Package question + data for Claude
- **Output**:
```javascript
{
  question: "original question",
  data: [combined Supabase results],
  dataCount: number
}
```

**7. Build Claude Request (Code Node)**
- **Purpose**: Construct API payload
- **Model**: claude-sonnet-4-20250514
- **Max Tokens**: 2000
- **Prompt Template**:

```javascript
You are a disc golf season statistics assistant.

User Question: ${question}

Available Data:
${JSON.stringify(data, null, 2)}

FORMATTING INSTRUCTIONS:
- Keep responses concise and scannable
- Use bullet points (•) for lists
- Use numbered lists (1., 2., 3.) for rankings
- Format as: "Stat Name: Value"
- Don't repeat the question
- Get straight to the answer

EXAMPLE FORMATS:
For leaderboards:
1. Player Name - XXX points
2. Player Name - XXX points

For player stats:
**Player Name Stats:**
- Total Points: XXX
- Rounds Played: X
- Average: XX.X
```

**8. Generate Answer (HTTP Request)**
- **Type**: HTTP Request
- **URL**: https://api.anthropic.com/v1/messages
- **Method**: POST
- **Headers**:
  - `x-api-key`: Anthropic API key
  - `anthropic-version`: 2023-06-01
  - `content-type`: application/json
- **Body**: From Build Claude Request node

**9. Extract Answer (Code Node)**
- **Purpose**: Parse Claude response
- **Logic**: `claudeResponse.content[0].text`
- **Output**: Plain text answer

**10. Respond to Webhook (Response Node)**
- **Type**: Webhook Response
- **Format**: JSON
- **Body**: `{ "answer": extractedAnswer }`
- **Headers**: CORS headers for browser access
```javascript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

---

## Credentials Setup

### Supabase Credential
```
Type: Supabase API
Host: [project-ref].supabase.co
Service Role Secret: [from Supabase settings > API]
```

### Anthropic Credential
```
Type: HTTP Header Auth
Name: x-api-key
Value: sk-ant-... [from console.anthropic.com]
```

---

## Error Handling

**Built-in n8n Features**:
- Retry on failure: 3 attempts with exponential backoff
- Timeout: 120 seconds per execution
- Error workflow: Logs failures to separate table (optional)

**Custom Error Handling**:
```javascript
// In chatbot response
try {
  const response = await fetch(N8N_CHATBOT_URL, {...});
  const data = await response.json();
  addMessage(data.answer || 'Sorry, I could not process that.', 'bot');
} catch (error) {
  console.error('Chat error:', error);
  addMessage('Error: Could not connect to chatbot.', 'bot');
}
```

---

## Testing the Workflow

### Test Scorecard Processing
```bash
# Simulate GroupMe webhook
curl -X POST https://[n8n-url]/webhook/groupme-scorecard-incoming \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "attachments": [{
        "type": "image",
        "url": "https://example.com/scorecard.jpg"
      }]
    }
  }'
```

### Test Chatbot
```bash
curl -X POST https://[n8n-url]/webhook/chatbot \
  -H "Content-Type: application/json" \
  -d '{"question":"Who is winning the season?"}'
```

---

## Modifying the Workflow

### Update Course Tiers
Edit the `Calculate Points` code node:
```javascript
const courseTiers = {
  "tier1": { multiplier: 1.0, courses: ["New Course 1"] },
  // Add new tiers or courses here
};
```

### Change Points System
Edit the `Calculate Points` code node:
```javascript
const rankPoints = {1: 15, 2: 10, 3: 7}; // Modify values
const performancePoints = {
  birdie: 2,  // Was 1
  eagle: 5,   // Was 3
  ace: 10     // Was 5
};
```

### Add New Query Type
1. Update `Determine Query Type` code
2. Add new condition to `Route by Query Type` switch
3. Add new Supabase query node
4. Connect to `Merge All Routes`

---

## Performance Optimization

**Current Execution Time**:
- Scorecard processing: 10-15 seconds
- Chatbot query: 3-5 seconds

**Optimization Opportunities**:
1. Cache frequent queries (e.g., leaderboard)
2. Reduce Claude context size (only send relevant data)
3. Use Supabase functions for complex aggregations
4. Implement query result pagination for large datasets
