# n8n Workflow Recreation Guide

## Why Workflows Disappeared

On Render's free tier, n8n stores workflows in a **local SQLite database** that gets wiped when the container restarts. This is a common issue.

## Quick Fix: Recreate the Workflow

Follow these steps exactly to recreate your ParSaveables workflow.

---

## Prerequisites

Before starting, gather:
1. **Supabase URL** and **Service Role Secret** (from Supabase > Settings > API)
2. **Anthropic API Key** (from console.anthropic.com)
3. **GroupMe Bot Callback URL** (you'll get this after creating the workflow)

---

## Part 1: Create New Workflow in n8n

### Step 1: Access n8n
1. Log into your Render account
2. Find your n8n service
3. Click the URL to open n8n interface
4. Sign in with your credentials

### Step 2: Create New Workflow
1. Click **"+ New Workflow"** in top right
2. Name it: `ParSaveables Scorecard and Chat`
3. Click **Save**

---

## Part 2: Build Scorecard Processing Flow

### Node 1: Webhook (Receive Scorecard)
1. Click **"+"** to add node
2. Search for **"Webhook"** and select it
3. Configure:
   - **HTTP Method**: POST
   - **Path**: `groupme-scorecard-incoming`
   - **Response Mode**: Last Node
4. Click **"Execute Node"** to get webhook URL
5. **COPY THIS URL** - you'll need it for GroupMe later

### Node 2: IF (Check if Image)
1. Add **IF** node
2. Connect from Webhook
3. Configure:
   - **Condition**:
     - Value 1: `{{ $json.body.attachments[0].type }}`
     - Operation: Equal
     - Value 2: `image`
4. We'll use the **true** output path

### Node 3: HTTP Request (Claude Vision)
1. Add **HTTP Request** node to **true** branch
2. Configure:
   - **Method**: POST
   - **URL**: `https://api.anthropic.com/v1/messages`
   - **Authentication**: Predefined Credential Type > Header Auth
     - Create new credential:
       - **Name**: `x-api-key`
       - **Value**: Your Anthropic API key
   - **Send Headers**: ON
     - Add header: `anthropic-version` = `2023-06-01`
     - Add header: `content-type` = `application/json`
   - **Send Body**: ON
   - **Body Content Type**: JSON
   - **Specify Body**: Using JSON
   - **JSON**:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 4096,
  "temperature": 0.3,
  "messages": [{
    "role": "user",
    "content": [
      {
        "type": "image",
        "source": {
          "type": "url",
          "url": "={{ $json.body.attachments[0].url }}"
        }
      },
      {
        "type": "text",
        "text": "Extract ALL data from this UDisc disc golf scorecard screenshot.\n\nRequired JSON structure:\n{\n  \"date\": \"MM/DD/YYYY\",\n  \"time\": \"HH:MM AM/PM\",\n  \"courseName\": string,\n  \"layoutName\": string,\n  \"location\": \"City, State\",\n  \"temperature\": \"XX°F\",\n  \"wind\": \"description\",\n  \"holes\": [{\"hole\": number, \"distance\": number, \"par\": number}],\n  \"players\": [{\n    \"name\": string,\n    \"totalStrokes\": number,\n    \"totalScore\": number (relative to par, e.g., -3),\n    \"holeByHole\": [18 numbers - actual strokes per hole],\n    \"birdies\": number,\n    \"eagles\": number,\n    \"aces\": number,\n    \"pars\": number,\n    \"bogeys\": number,\n    \"doubleBogeys\": number (includes triple+ bogeys)\n  }]\n}\n\nIMPORTANT:\n- Count ONLY scores >= par+2 as doubleBogeys (includes triple bogeys, etc.)\n- Verify: birdies + eagles + aces + pars + bogeys + doubleBogeys should equal total holes\n- holeByHole must be 18 numbers\n- Return ONLY valid JSON, no markdown"
      }
    ]
  }]
}
```

### Node 4: Code (Parse Claude Response)
1. Add **Code** node
2. Configure:
   - **Language**: JavaScript
   - **Code**:
```javascript
// Parse Claude's response
const response = $input.item.json;
const content = response.content[0].text;

// Remove markdown code blocks if present
let jsonStr = content.trim();
if (jsonStr.startsWith('```')) {
  jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

const data = JSON.parse(jsonStr);
return { json: data };
```

### Node 5: Load Configuration
1. Add **Code** node
2. Name it: `Load Configuration`
3. Copy/paste code from `n8n-workflows/nodes/load-configuration-final.js`
4. Replace the Supabase credentials section at the top:
```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR-SERVICE-ROLE-SECRET';
```

### Node 6: Calculate Points
1. Add **Code** node
2. Name it: `Calculate Points`
3. Copy/paste code from `n8n-workflows/nodes/calculate-points.js`

### Node 7: Supabase (Save Round Info)
1. Add **Supabase** node
2. Configure:
   - **Credential**: Create new Supabase credential
     - **Host**: `YOUR-PROJECT.supabase.co` (no https://)
     - **Service Role Secret**: From Supabase settings
   - **Operation**: Insert
   - **Table**: `rounds`
   - **Columns to Send**: Define
   - **Add field mappings**:
     - `date` → `{{ $json.date }}`
     - `time` → `{{ $json.time }}`
     - `course_name` → `{{ $json.courseName }}`
     - `layout_name` → `{{ $json.layoutName }}`
     - `location` → `{{ $json.location }}`
     - `temperature` → `{{ $json.temperature }}`
     - `wind` → `{{ $json.wind }}`
     - `course_multiplier` → `{{ $json.courseMultiplier }}`

### Node 8: Set (Store Round ID)
1. Add **Set** node
2. Configure:
   - **Mode**: Manual Mapping
   - **Add Assignment**:
     - `round_id` → `{{ $json.id }}`
     - `players` → `{{ $('Calculate Points').item.json.players }}`

### Node 9: Code (Parse Players)
1. Add **Code** node
2. Configure:
```javascript
// Players are already an array from Set node
return { json: {
  round_id: $json.round_id,
  players: $json.players
}};
```

### Node 10: Split Out (Split Players)
1. Add **Split Out** node
2. Configure:
   - **Field to Split Out**: `players`

### Node 11: Supabase (Save Player Rounds)
1. Add **Supabase** node
2. Configure:
   - **Credential**: Use existing Supabase credential
   - **Operation**: Insert
   - **Table**: `player_rounds`
   - **Columns to Send**: Define
   - **Add field mappings**:
     - `round_id` → `{{ $('Set').item.json.round_id }}`
     - `player_name` → `{{ $json.name }}`
     - `rank` → `{{ $json.rank }}`
     - `total_strokes` → `{{ $json.totalStrokes }}`
     - `total_score` → `{{ $json.totalScore }}`
     - `birdies` → `{{ $json.birdies }}`
     - `eagles` → `{{ $json.eagles }}`
     - `aces` → `{{ $json.aces }}`
     - `pars` → `{{ $json.pars }}`
     - `bogeys` → `{{ $json.bogeys }}`
     - `double_bogeys` → `{{ $json.doubleBogeys }}`
     - `rank_points` → `{{ $json.points.rankPoints }}`
     - `birdie_points` → `{{ $json.points.birdiePoints }}`
     - `eagle_points` → `{{ $json.points.eaglePoints }}`
     - `ace_points` → `{{ $json.points.acePoints }}`
     - `raw_total` → `{{ $json.points.rawTotal }}`
     - `final_total` → `{{ $json.points.finalTotal }}`
     - `hole_by_hole` → `{{ JSON.stringify($json.holeByHole) }}`

### Save the Workflow!
Click **Save** (Ctrl+S)

---

## Part 3: Build Chatbot Flow

### Node 12: Webhook (Receive Chat)
1. Add new **Webhook** node (separate from scorecard)
2. Configure:
   - **HTTP Method**: POST
   - **Path**: `chatbot`
   - **Response Mode**: Using 'Respond to Webhook' Node
3. Copy this webhook URL too

### Node 13: Code (Parse Question)
1. Add **Code** node
2. Configure:
```javascript
const question = $json.body.question || $json.question || '';
return { json: { question } };
```

### Node 14: Code (Load Event Context)
1. Add **Code** node
2. Name it: `Load Event for Context`
3. Code:
```javascript
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR-SERVICE-ROLE-SECRET';

// Get active event
const response = await fetch(`${SUPABASE_URL}/rest/v1/events?is_active=eq.true&order=start_date.desc&limit=1`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
});

const events = await response.json();
const activeEvent = events[0];

return {
  json: {
    question: $json.question,
    eventId: activeEvent?.id,
    eventName: activeEvent?.name,
    eventType: activeEvent?.type
  }
};
```

### Node 15: Supabase (Get Player Rounds)
1. Add **Supabase** node
2. Configure:
   - **Operation**: Get All
   - **Table**: `player_rounds`
   - **Return All**: ON

### Node 16: Supabase (Get Rounds)
1. Add **Supabase** node
2. Configure:
   - **Operation**: Get All
   - **Table**: `rounds`
   - **Return All**: ON

### Node 17: Code (Prepare for Claude)
1. Add **Code** node
2. Code:
```javascript
const question = $('Load Event for Context').item.json.question;
const playerRounds = $('Supabase').all().map(item => item.json);
const rounds = $('Supabase1').all().map(item => item.json);

return {
  json: {
    question,
    playerRounds,
    rounds
  }
};
```

### Node 18: HTTP Request (Claude Chat)
1. Add **HTTP Request** node
2. Configure:
   - **Method**: POST
   - **URL**: `https://api.anthropic.com/v1/messages`
   - **Authentication**: Use existing Anthropic credential
   - **Send Headers**: ON
     - `anthropic-version` = `2023-06-01`
     - `content-type` = `application/json`
   - **Send Body**: ON
   - **Body Content Type**: JSON
   - **JSON**:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 2000,
  "messages": [{
    "role": "user",
    "content": "You are a disc golf season statistics assistant.\n\nUser Question: {{ $json.question }}\n\nPlayer Rounds Data:\n{{ JSON.stringify($json.playerRounds, null, 2) }}\n\nRounds Data:\n{{ JSON.stringify($json.rounds, null, 2) }}\n\nFORMATTING INSTRUCTIONS:\n- Keep responses concise and scannable\n- Use bullet points (•) for lists\n- Use numbered lists (1., 2., 3.) for rankings\n- Format as: \"Stat Name: Value\"\n- Don't repeat the question\n- Get straight to the answer\n\nEXAMPLE FORMATS:\nFor leaderboards:\n1. Player Name - XXX points\n2. Player Name - XXX points\n\nFor player stats:\n**Player Name Stats:**\n- Total Points: XXX\n- Rounds Played: X\n- Average: XX.X"
  }]
}
```

### Node 19: Code (Extract Answer)
1. Add **Code** node
2. Code:
```javascript
const response = $json;
const answer = response.content[0].text;
return { json: { answer } };
```

### Node 20: Respond to Webhook
1. Add **Respond to Webhook** node
2. Configure:
   - **Response Code**: 200
   - **Response Body**: {{ JSON.stringify({ answer: $json.answer }) }}
   - **Response Headers**: Add these:
     - `Content-Type` = `application/json`
     - `Access-Control-Allow-Origin` = `*`
     - `Access-Control-Allow-Methods` = `POST, GET, OPTIONS`
     - `Access-Control-Allow-Headers` = `Content-Type`

### Save the Workflow!
Click **Save** (Ctrl+S)

---

## Part 4: Activate Workflow

1. Click the **toggle switch** in top right to **Active**
2. Workflow should show green "Active" status

---

## Part 5: Update GroupMe Bot

1. Go to dev.groupme.com
2. Find your bot
3. Update **Callback URL** to the scorecard webhook URL from Node 1

---

## Part 6: Update Dashboard

Edit `ParSaveablesDashboard/index.html`:

Find line ~373 and update:
```javascript
const N8N_CHATBOT_URL = 'https://YOUR-N8N-URL.onrender.com/webhook/chatbot';
```

---

## Part 7: Test Everything

### Test Scorecard Processing
1. Post a UDisc screenshot to your GroupMe
2. Check n8n executions (should see successful run)
3. Check Supabase tables for new data

### Test Chatbot
1. Open dashboard
2. Click chat icon
3. Ask: "Who is winning?"
4. Should get response

---

## IMPORTANT: Prevent This From Happening Again

### Option 1: Export Workflow Regularly (FREE)
After recreating workflow:
1. In n8n, click **...** menu next to workflow name
2. Click **Download**
3. Save as `ParSaveables-Scorecard-and-Chat.json`
4. Store in `n8n-workflows/` folder
5. Commit to git

**Set a reminder to export monthly!**

### Option 2: Use PostgreSQL Database (PAID)
1. Create PostgreSQL database on Render or Supabase
2. Add environment variables to n8n on Render:
   ```
   DB_TYPE=postgresdb
   DB_POSTGRESDB_HOST=your-db-host
   DB_POSTGRESDB_PORT=5432
   DB_POSTGRESDB_DATABASE=n8n
   DB_POSTGRESDB_USER=your-user
   DB_POSTGRESDB_PASSWORD=your-password
   ```
3. Workflows will persist across restarts

### Option 3: Use n8n Cloud (PAID)
- Sign up for n8n.cloud ($20/month)
- Workflows automatically persisted
- No Render needed

---

## Troubleshooting

**Workflow won't activate:**
- Check all credentials are saved
- Verify Supabase URL has no `https://`
- Ensure all nodes are connected

**Scorecard processing fails:**
- Check Anthropic API key is valid
- Verify image URL is accessible
- Check n8n execution logs for errors

**Chatbot not responding:**
- Verify webhook URL in dashboard
- Check CORS headers on Respond to Webhook node
- Test webhook URL with curl:
  ```bash
  curl -X POST https://your-n8n.onrender.com/webhook/chatbot \
    -H "Content-Type: application/json" \
    -d '{"question":"test"}'
  ```

**Database errors:**
- Verify Supabase credentials
- Check RLS policies allow service role access
- Ensure tables exist with correct schema

---

## Quick Reference: Node Order

**Scorecard Flow:**
1. Webhook → 2. IF → 3. HTTP (Claude Vision) → 4. Code (Parse) → 5. Load Configuration → 6. Calculate Points → 7. Supabase (Rounds) → 8. Set → 9. Code (Parse Players) → 10. Split Out → 11. Supabase (Player Rounds)

**Chatbot Flow:**
12. Webhook → 13. Code (Parse) → 14. Code (Load Event) → 15. Supabase (Player Rounds) → 16. Supabase (Rounds) → 17. Code (Prepare) → 18. HTTP (Claude Chat) → 19. Code (Extract) → 20. Respond to Webhook

---

## Need Help?

If you get stuck, check:
1. `docs/WORKFLOW_DETAILS.md` - Full node documentation
2. `docs/SESSION_2_WORKFLOW_FIXES.md` - Common fixes
3. n8n execution logs - Click on failed execution to see error details
