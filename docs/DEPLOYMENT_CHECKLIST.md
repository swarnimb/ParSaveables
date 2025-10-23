# Deployment Checklist

Complete these steps to get ParSaveables running with perpetual uptime on free tiers.

## Phase 1: Database Setup (Supabase)

- [ ] **Create Supabase Account**: Sign up at supabase.com
- [ ] **Create New Project**: Choose a name (e.g., "ParSaveables")
- [ ] **Run SQL Scripts**: Execute table creation from `docs/SETUP.md`
  - [ ] Create `rounds` table
  - [ ] Create `player_rounds` table
  - [ ] Enable RLS policies for public read access
- [ ] **Copy API Credentials**:
  - [ ] Project URL: `https://[project-id].supabase.co`
  - [ ] Anon public key: `eyJ...` (long string)
  - [ ] Service role key: (for n8n only)
- [ ] **Test Connection**: Use Supabase dashboard table editor

## Phase 2: Deploy n8n Workflow (Render)

- [ ] **Create Render Account**: Sign up at render.com
- [ ] **Create Web Service**:
  - [ ] Type: Docker
  - [ ] Image: `n8nio/n8n:latest`
  - [ ] Name: `parsaveables-n8n`
  - [ ] Region: Choose closest
  - [ ] Instance: Free
- [ ] **Set Environment Variables** (in Render dashboard):
  ```
  N8N_BASIC_AUTH_ACTIVE=true
  N8N_BASIC_AUTH_USER=admin
  N8N_BASIC_AUTH_PASSWORD=[create-strong-password]
  WEBHOOK_URL=https://parsaveables-n8n.onrender.com
  N8N_PORT=10000
  N8N_PROTOCOL=https
  N8N_HOST=parsaveables-n8n.onrender.com
  EXECUTIONS_DATA_PRUNE=true
  EXECUTIONS_DATA_MAX_AGE=168
  ```
- [ ] **Deploy**: Click "Create Web Service" and wait for build
- [ ] **Access n8n**: Visit `https://parsaveables-n8n.onrender.com` and login
- [ ] **Import Workflow**:
  - [ ] Go to Workflows → Import from File
  - [ ] Select `n8n Workflows/ParSaveables Scorecard and Chat.json`
- [ ] **Configure Credentials**:
  - [ ] **Supabase**: Add credential with service role key
  - [ ] **Anthropic**: Add HTTP Header Auth with API key
- [ ] **Activate Workflow**: Toggle "Active" in top right
- [ ] **Copy Webhook URLs**:
  - [ ] Scorecard: `https://parsaveables-n8n.onrender.com/webhook/groupme-scorecard-incoming`
  - [ ] Chatbot: `https://parsaveables-n8n.onrender.com/webhook/chatbot`

## Phase 3: Keep n8n Awake (UptimeRobot)

- [ ] **Create UptimeRobot Account**: Sign up at uptimerobot.com
- [ ] **Add New Monitor**:
  - [ ] Monitor Type: HTTP(s)
  - [ ] Friendly Name: ParSaveables n8n
  - [ ] URL: `https://parsaveables-n8n.onrender.com`
  - [ ] Monitoring Interval: 5 minutes
  - [ ] Alert Contacts: (optional)
- [ ] **Verify Status**: Check dashboard shows "Up"
- [ ] **Test**: Wait 20 minutes, confirm n8n doesn't sleep

## Phase 4: Deploy Dashboard (Vercel)

### Option A: Vercel CLI (Recommended)

- [ ] **Install Vercel CLI**: `npm install -g vercel`
- [ ] **Navigate to Project**:
  ```bash
  cd "C:\Users\Swarnim Bagre\Downloads\My Files\Professional\Side Projects\Github Projects\ParSaveables"
  ```
- [ ] **Deploy**:
  ```bash
  vercel --prod
  ```
- [ ] **Configure**:
  - [ ] Set root directory: `ParSaveablesDashboard`
  - [ ] Accept defaults
- [ ] **Copy Deployment URL**: (e.g., `https://parsaveables.vercel.app`)

### Option B: GitHub Integration

- [ ] **Push to GitHub**: (already done if following this checklist)
- [ ] **Import in Vercel**:
  - [ ] Go to vercel.com/new
  - [ ] Import `swarnimb/ParSaveables` repository
  - [ ] Root Directory: `ParSaveablesDashboard`
  - [ ] Framework Preset: Other
- [ ] **Deploy**: Click "Deploy"
- [ ] **Enable Auto-Deploy**: Deploys automatically on push to main

## Phase 5: Update Dashboard Configuration

- [ ] **Edit index.html** (lines 371-373):
  ```javascript
  const SUPABASE_URL = 'https://[your-project-id].supabase.co';
  const SUPABASE_KEY = 'eyJ...'; // Your anon public key
  const N8N_CHATBOT_URL = 'https://parsaveables-n8n.onrender.com/webhook/chatbot';
  ```
- [ ] **Commit and Push**:
  ```bash
  git add ParSaveablesDashboard/index.html
  git commit -m "Update API endpoints for production"
  git push
  ```
- [ ] **Verify Vercel Auto-Deploy**: Check Vercel dashboard for new deployment

## Phase 6: GroupMe Bot Setup

- [ ] **Go to GroupMe Developer**: dev.groupme.com
- [ ] **Create Bot**:
  - [ ] Select your disc golf group
  - [ ] Bot Name: ParSaveables Scorecard Bot
  - [ ] Callback URL: `https://parsaveables-n8n.onrender.com/webhook/groupme-scorecard-incoming`
  - [ ] Avatar URL: (optional)
- [ ] **Save Bot ID**: Copy for reference
- [ ] **Test**: Post a UDisc screenshot to group

## Phase 7: Testing

### Test 1: Scorecard Processing
- [ ] **Post Screenshot**: Upload UDisc scorecard to GroupMe
- [ ] **Check n8n Logs**:
  - [ ] Go to n8n → Executions
  - [ ] Verify execution succeeded
  - [ ] Check each node output
- [ ] **Verify Supabase Data**:
  - [ ] Open Supabase table editor
  - [ ] Check `rounds` table has new row
  - [ ] Check `player_rounds` table has player data
- [ ] **Expected Time**: 10-15 seconds

### Test 2: Dashboard Loading
- [ ] **Open Dashboard**: Visit your Vercel URL
- [ ] **Check Data Loads**:
  - [ ] Season Leaderboard populates
  - [ ] Aces/Eagles/Birdies chart shows
  - [ ] Course tiers table displays
  - [ ] Monthly trend chart renders
- [ ] **Test Refresh**: Click "Refresh Data" button
- [ ] **Check Browser Console**: No errors

### Test 3: Chatbot
- [ ] **Ask Question**: Type "Who is winning?" in chatbot
- [ ] **Verify Response**: Should show leaderboard rankings
- [ ] **Test Multiple Queries**:
  - [ ] "What's David's average score?"
  - [ ] "Show me player stats for [name]"
  - [ ] "Best round at Zilker?"
- [ ] **Check Response Time**: 2-5 seconds

### Test 4: Mobile Access
- [ ] **Open on Phone**: Visit Vercel URL from mobile browser
- [ ] **Test Responsive Layout**: Should adapt to screen size
- [ ] **Test Chatbot**: Verify typing and scrolling work

## Phase 8: Share with Group

- [ ] **Get Public URL**: Copy Vercel deployment URL
- [ ] **Create Instructions**: Write simple guide for group members
  ```
  📊 ParSaveables Dashboard is live!

  View stats: https://parsaveables.vercel.app

  How to use:
  1. Post UDisc scorecards to this group
  2. Bot automatically processes and saves scores
  3. Visit dashboard to see leaderboard and stats
  4. Ask the chatbot questions about performance

  No login required!
  ```
- [ ] **Post to GroupMe**: Share link and instructions
- [ ] **Answer Questions**: Help members navigate dashboard

## Phase 9: Monitoring Setup

- [ ] **Bookmark Admin URLs**:
  - [ ] n8n: `https://parsaveables-n8n.onrender.com`
  - [ ] Supabase: `https://supabase.com/dashboard/project/[id]`
  - [ ] Vercel: `https://vercel.com/dashboard`
  - [ ] UptimeRobot: `https://uptimerobot.com/dashboard`
- [ ] **Set Up Alerts** (optional):
  - [ ] UptimeRobot: Email if n8n goes down
  - [ ] Render: Email on deployment failures
- [ ] **Check Weekly**:
  - [ ] Review n8n execution logs
  - [ ] Monitor Supabase database size
  - [ ] Check Anthropic API usage/costs

## Troubleshooting Common Issues

### Issue: Dashboard shows "Error loading data"
- [ ] Check Supabase credentials in index.html
- [ ] Verify RLS policies allow public SELECT
- [ ] Check browser console for specific error
- [ ] Test Supabase connection in dashboard

### Issue: Scorecard not processing
- [ ] Verify n8n workflow is Active
- [ ] Check GroupMe webhook URL is correct
- [ ] Review n8n execution logs for errors
- [ ] Confirm Anthropic API key is valid

### Issue: Chatbot not responding
- [ ] Check n8n chatbot webhook URL in index.html
- [ ] Verify CORS headers are set (in workflow)
- [ ] Test webhook directly with curl
- [ ] Check Anthropic API rate limits

### Issue: n8n keeps sleeping
- [ ] Verify UptimeRobot monitor is active
- [ ] Check monitor interval is 5 minutes
- [ ] Review UptimeRobot logs for failures
- [ ] Consider adding backup monitor (cron-job.org)

## Maintenance Schedule

### Daily (Automated)
- UptimeRobot pings n8n every 5 minutes
- Dashboard auto-refreshes every 5 minutes
- n8n processes scorecards on-demand

### Weekly (Manual)
- [ ] Review n8n execution logs for errors
- [ ] Check Supabase database size (should be < 50 MB)
- [ ] Monitor Anthropic API costs

### Monthly (Manual)
- [ ] Export n8n workflow (backup to git)
- [ ] Backup Supabase database
- [ ] Review and update course tier multipliers
- [ ] Check for n8n/Supabase updates

## Cost Tracking

| Service | Estimated Monthly Cost |
|---------|----------------------|
| Supabase | $0 (free tier) |
| Render | $0 (free tier) |
| Vercel | $0 (free tier) |
| UptimeRobot | $0 (free tier) |
| Anthropic API | $2-5 (usage-based) |
| **Total** | **$2-5/month** |

**Note**: Anthropic costs scale with scorecard volume. Estimate: ~$0.02-0.05 per scorecard + ~$0.002 per chatbot query.

## Next Steps After Deployment

Once everything is running:

1. **Gather Feedback**: Ask group members about features they want
2. **Plan Improvements**: See "Future Enhancements" in `docs/ARCHITECTURE.md`
3. **Monitor Usage**: Track engagement and API costs
4. **Iterate**: Update logic based on group preferences (see next section)

---

**Deployment Complete!**

Your disc golf tracker is now live with:
- Automated scorecard processing
- Real-time dashboard
- AI chatbot
- 24/7 uptime on free tiers

Repository: https://github.com/swarnimb/ParSaveables
