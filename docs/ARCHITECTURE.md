# System Architecture

## Overview

ParSaveables is a serverless disc golf tracking system that automatically processes scorecard screenshots and provides real-time analytics through a chatbot and dashboard.

## Architecture Diagram

```
┌─────────────┐
│   GroupMe   │
│   (User)    │
└──────┬──────┘
       │ Posts scorecard screenshot
       ▼
┌─────────────────────────────────────────────┐
│           n8n Workflow (Render)             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────┐                        │
│  │ Webhook        │ Receives image         │
│  │ Trigger        │                        │
│  └────────┬───────┘                        │
│           │                                 │
│           ▼                                 │
│  ┌────────────────┐                        │
│  │ Claude Vision  │ Extracts scorecard     │
│  │ API            │ data (JSON)            │
│  └────────┬───────┘                        │
│           │                                 │
│           ▼                                 │
│  ┌────────────────┐                        │
│  │ Rank & Points  │ Calculates standings   │
│  │ Calculator     │ & course multipliers   │
│  └────────┬───────┘                        │
│           │                                 │
│           ▼                                 │
│  ┌────────────────┐                        │
│  │ Supabase Save  │ Stores round & player  │
│  │                │ data                   │
│  └────────────────┘                        │
│                                             │
│  ┌────────────────┐                        │
│  │ Chatbot        │ Answers questions      │
│  │ Webhook        │ using Claude           │
│  └────────────────┘                        │
└─────────────────────────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │   Supabase     │
          │   (Database)   │
          └────────┬───────┘
                   │
                   ▼
          ┌────────────────┐
          │    Vercel      │
          │  (Dashboard)   │
          └────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │     Users      │
          └────────────────┘
```

## Component Details

### 1. GroupMe Integration

**Purpose**: Entry point for scorecard data

**Flow**:
1. User posts UDisc screenshot to group
2. GroupMe webhook triggers n8n workflow
3. Image URL passed to n8n

**Configuration**:
- Bot name: ParSaveables Bot
- Callback URL: `https://[n8n-url]/webhook/groupme-scorecard-incoming`

### 2. n8n Workflow Engine

**Purpose**: Orchestration and automation

**Two Workflows**:

#### A. Scorecard Processing Workflow
```
Webhook → Check Image → Claude Vision → Clean/Rank →
Calculate Points → Save Round → Save Players
```

**Nodes**:
1. **Receive Scorecard** (Webhook): Accepts GroupMe POST
2. **Check if Image** (If): Validates attachment type
3. **Extract Scorecard Data** (HTTP): Calls Claude Vision API
4. **Clean and Rank Players** (Code): Applies tie-breaker logic
5. **Calculate Points** (Code): Course multipliers + point system
6. **Save Round Info** (Supabase): Inserts round metadata
7. **Store Round ID** (Set): Captures auto-generated ID
8. **Parse Players Array** (Code): Prepares player data
9. **Split Players** (Split): One row per player
10. **Save Player Stats** (Supabase): Bulk insert player rounds

#### B. Chatbot Workflow
```
Webhook → Determine Query Type → Route → Fetch Data →
Claude Response → Return Answer
```

**Nodes**:
1. **Receive Question** (Webhook): POST from dashboard
2. **Determine Query Type** (Code): Keyword detection
3. **Route by Query Type** (Switch): 5 paths (leaderboard, player, course, recent, general)
4. **Fetch Data** (Supabase × 4): Parallel queries
5. **Merge All Routes** (Merge): Combine results
6. **Prepare for Claude** (Code): Format context
7. **Build Request** (Code): Construct API payload
8. **Generate Answer** (HTTP): Claude API call
9. **Extract Answer** (Code): Parse response
10. **Respond** (Webhook Response): Send JSON

**Hosting**: Render Web Service (Docker)

### 3. Database (Supabase)

**Tables**:

#### `rounds`
- Primary key: `id` (auto-increment)
- Fields: course info, date/time, weather, multiplier
- Purpose: Store round metadata

#### `player_rounds`
- Primary key: `id` (auto-increment)
- Foreign key: `round_id` → `rounds.id`
- Fields: player stats, scores, points breakdown
- Purpose: Store individual performances

**Access Pattern**:
- Write: n8n workflow only
- Read: Dashboard (public) + Chatbot (internal)

**RLS Policies**:
- Public SELECT on both tables
- No INSERT/UPDATE/DELETE from public

### 4. Claude AI (Anthropic)

**Two Use Cases**:

#### A. Vision API (Scorecard Extraction)
- **Model**: claude-sonnet-4-5-20250929
- **Input**: UDisc screenshot URL
- **Output**: Structured JSON (holes, players, stats)
- **Prompt**: Detailed extraction instructions with JSON schema
- **Cost**: ~$0.01-0.03 per scorecard

#### B. Chat API (Chatbot)
- **Model**: claude-sonnet-4-20250514
- **Input**: User question + database context
- **Output**: Formatted answer
- **Prompt**: Stats assistant with formatting rules
- **Cost**: ~$0.001-0.005 per question

### 5. Dashboard (Vercel)

**Tech**: Vanilla HTML/CSS/JavaScript

**Libraries**:
- Chart.js: Monthly trend visualization
- Supabase JS: Real-time data fetching

**Data Refresh**:
- Manual: "Refresh Data" button
- Automatic: Every 5 minutes (setInterval)

**Sections**:
1. **Chatbot**: Sends POST to n8n webhook
2. **Season Leaderboard**: Aggregates player_rounds by player
3. **Aces/Eagles/Birdies**: Horizontal stacked bars
4. **Course Tiers**: Matrix of player × tier averages
5. **Monthly Trend**: Line chart of cumulative points

**Hosting**: Vercel (static site)

## Data Flow

### Scorecard Upload Flow

```
1. User posts screenshot → GroupMe
2. GroupMe → n8n webhook (POST with image URL)
3. n8n → Claude Vision API (extract JSON)
4. n8n → Calculate ranks (tie-breaker logic)
5. n8n → Calculate points (multipliers + bonuses)
6. n8n → Supabase INSERT (rounds table)
7. n8n → Supabase INSERT (player_rounds table)
8. Dashboard → Auto-refresh (fetches new data)
```

**Processing Time**: 5-15 seconds

### Chatbot Query Flow

```
1. User types question → Dashboard
2. Dashboard → n8n webhook (POST with question)
3. n8n → Determine query type (keyword parsing)
4. n8n → Supabase queries (parallel fetch)
5. n8n → Claude Chat API (generate answer)
6. n8n → Dashboard (JSON response)
7. Dashboard → Display formatted answer
```

**Response Time**: 2-5 seconds

## Scoring Logic

### Rank Points (with Tie Averaging)

```javascript
Base points: {1st: 10, 2nd: 7, 3rd: 5, other: 2}

If tied:
  avg_points = sum(points for tied ranks) / num_tied_players

Example: Two players tie for 2nd
  avg = (7 + 5) / 2 = 6 points each
```

### Performance Bonuses

```javascript
bonuses = (aces × 5) + (eagles × 3) + (birdies × 1)
```

### Course Multipliers

```javascript
final_points = (rank_points + bonuses) × course_multiplier

Tiers:
  1.0x: Beginner courses
  1.5x: Intermediate
  2.0x: Advanced
  2.5x: Championship
```

### Tie-Breaker Rules

For players with same total score:
1. More birdies wins
2. More pars wins
3. Earlier first birdie wins
4. If still tied, share rank

## Security

**API Keys** (stored in n8n credentials):
- Supabase service role key
- Anthropic API key

**Public Access**:
- Dashboard: Read-only via Supabase anon key
- Chatbot: Public webhook (no auth)
- Scorecard upload: GroupMe webhook (no auth)

**Risks & Mitigations**:
- **Risk**: Public chatbot abuse
  - **Mitigation**: Rate limiting in n8n (not implemented yet)
- **Risk**: Database exposure
  - **Mitigation**: RLS policies, anon key has SELECT only
- **Risk**: High API costs
  - **Mitigation**: Monitor Anthropic usage dashboard

## Scalability

**Current Limits**:
- Supabase: 500 MB database (~50,000 rounds)
- Render: 750 hours/month (covered by uptime ping)
- Vercel: Unlimited bandwidth
- Anthropic: Pay-per-use

**Bottlenecks**:
- n8n execution time (max 2 min/execution)
- Supabase connection pool (limited on free tier)
- Claude API rate limits (tier-dependent)

**Estimated Capacity**:
- 100 scorecards/month: No issues
- 500 scorecards/month: Monitor DB size
- 1000+ scorecards/month: Consider paid tiers

## Error Handling

**n8n Workflow**:
- Error workflow configured (logs to Supabase error table)
- Retries on Supabase failures
- Timeout: 120 seconds per execution

**Dashboard**:
- Try-catch on Supabase queries
- Fallback messages on chatbot errors
- Loading states during data fetch

**Monitoring**:
- n8n execution history
- Supabase logs
- Anthropic usage dashboard
- UptimeRobot status

## Future Enhancements

**Planned**:
1. Player authentication (Supabase Auth)
2. Manual score editing
3. Player profiles with photos
4. Course difficulty auto-adjustment
5. Push notifications for new rounds
6. Mobile app (React Native)
7. Rate limiting on chatbot
8. Webhook signature validation
9. Database backups (automated)
10. Analytics dashboard for admin
