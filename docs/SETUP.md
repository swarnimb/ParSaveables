# Setup Guide

## 1. Supabase Database Setup

### Create Configuration Tables

Run the migration script `database/migrations/001_add_config_tables.sql` to create:
- `points_systems`: Scoring configurations (JSONB-based)
- `courses`: Course tiers and multipliers
- `events`: Seasons and tournaments with date ranges

Then run `database/seed_data.sql` to populate initial configurations.

### Create Core Tables

**Table: `rounds`**
```sql
CREATE TABLE rounds (
  id BIGSERIAL PRIMARY KEY,
  date TEXT,
  time TEXT,
  course_name TEXT,
  layout_name TEXT,
  location TEXT,
  temperature TEXT,
  wind TEXT,
  course_multiplier DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `player_rounds`**
```sql
CREATE TABLE player_rounds (
  id BIGSERIAL PRIMARY KEY,
  round_id BIGINT REFERENCES rounds(id),
  player_name TEXT,
  rank INTEGER,
  total_strokes INTEGER,
  total_score INTEGER,
  birdies INTEGER,
  eagles INTEGER,
  aces INTEGER,
  pars INTEGER,
  bogeys INTEGER,
  double_bogeys INTEGER,
  rank_points DECIMAL(5,2),
  birdie_points DECIMAL(5,2),
  eagle_points DECIMAL(5,2),
  ace_points DECIMAL(5,2),
  raw_total DECIMAL(6,2),
  final_total DECIMAL(6,2),
  hole_by_hole TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON rounds
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON player_rounds
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON points_systems
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON events
  FOR SELECT USING (true);

-- Admin write access (requires authentication)
CREATE POLICY "Enable insert for authenticated users" ON points_systems
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON points_systems
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON points_systems
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON courses
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON courses
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON courses
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON events
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON events
  FOR DELETE TO authenticated USING (true);
```

### Get API Credentials

1. Go to Supabase Project Settings > API
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

## 2. n8n Workflow Setup

### Install n8n

**Option A: Cloud (Render - Free Tier)**
1. Go to render.com
2. Create new Web Service
3. Use Docker image: `n8nio/n8n`
4. Set environment variables:
   - `N8N_BASIC_AUTH_ACTIVE=true`
   - `N8N_BASIC_AUTH_USER=admin`
   - `N8N_BASIC_AUTH_PASSWORD=[your-password]`
   - `WEBHOOK_URL=https://[your-app].onrender.com`

**Option B: Local**
```bash
npm install -g n8n
n8n start
```

### Import Workflow

1. Open n8n interface
2. Go to Workflows > Import from File
3. Select `n8n Workflows/ParSaveables Scorecard and Chat.json`

### Configure Credentials

**Supabase Credentials:**
1. In workflow, click on any Supabase node
2. Create new credential
3. Enter:
   - Host: [Your Supabase URL without https://]
   - Service Role Secret: [From Supabase settings]

**Anthropic API Credentials:**
1. Get API key from console.anthropic.com
2. In workflow, click on Claude HTTP Request node
3. Create HTTP Header Auth credential:
   - Name: `x-api-key`
   - Value: [Your Anthropic API key]

### Activate Workflow

1. Click "Active" toggle in top right
2. Copy webhook URLs:
   - **Scorecard webhook**: `https://[n8n-url]/webhook/groupme-scorecard-incoming`
   - **Chatbot webhook**: `https://[n8n-url]/webhook/chatbot`

## 3. GroupMe Bot Setup

1. Go to dev.groupme.com
2. Create new bot for your group
3. Set Callback URL to scorecard webhook URL
4. The bot will now process scorecard screenshots automatically

## 4. Dashboard Configuration

### Main Dashboard

Edit `ParSaveablesDashboard/index.html`:

```javascript
// Line 371-373
const SUPABASE_URL = 'https://[your-project].supabase.co';
const SUPABASE_KEY = 'eyJ...'; // Your anon public key
const N8N_CHATBOT_URL = 'https://[your-n8n]/webhook/chatbot';
```

### Admin Panel

Edit `ParSaveablesDashboard/admin.html`:

```javascript
// Line ~50-51
const SUPABASE_URL = 'https://[your-project].supabase.co';
const SUPABASE_KEY = 'eyJ...'; // Your anon public key
```

**Enable Supabase Authentication:**
1. Go to Supabase Dashboard > Authentication
2. Enable Email provider
3. Create user accounts for administrators
4. Users must sign in to access admin panel features

## 5. Testing

### Test Scorecard Processing
1. Post a UDisc screenshot to GroupMe
2. Check n8n executions for success
3. Verify data in Supabase tables

### Test Dashboard
1. Open `index.html` in browser
2. Verify data loads
3. Test chatbot with questions
4. Verify Points System visual displays correctly

### Test Admin Panel
1. Open `admin.html` in browser
2. Sign in with administrator credentials
3. Test CRUD operations on points systems, courses, and events
4. Verify data persists correctly

### Test Chatbot
```bash
curl -X POST https://[your-n8n]/webhook/chatbot \
  -H "Content-Type: application/json" \
  -d '{"question":"Who is winning?"}'
```

## Troubleshooting

**Dashboard not loading data:**
- Check browser console for CORS errors
- Verify Supabase credentials are correct
- Ensure RLS policies allow public read

**Workflow not triggering:**
- Verify webhook URL is correct in GroupMe
- Check n8n execution logs
- Ensure workflow is active

**Chatbot not responding:**
- Verify Anthropic API key is valid
- Check n8n logs for errors
- Test webhook endpoint directly
