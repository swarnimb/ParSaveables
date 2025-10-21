# Deployment Guide - Free Tier Setup

This guide ensures perpetual uptime using only free tiers.

## Architecture

```
GroupMe → n8n (Render) → Supabase
                ↓
Dashboard (Vercel) ← Users
```

## 1. Deploy Database (Supabase)

**Free Tier Limits:**
- 500 MB database
- 1 GB file storage
- 50 MB file uploads
- Unlimited API requests

**Setup:**
1. Sign up at supabase.com
2. Create new project
3. Follow database setup from `SETUP.md`
4. Project stays active indefinitely on free tier

**No action needed for uptime** - Supabase free tier has no sleep mode.

## 2. Deploy n8n Workflow (Render)

**Free Tier Limits:**
- 750 hours/month
- Sleeps after 15 min inactivity
- 100 GB bandwidth

### Initial Deployment

1. Sign up at render.com
2. New Web Service → Docker
3. Configure:
   - **Name**: parsaveables-n8n
   - **Environment**: Docker
   - **Image URL**: `n8nio/n8n:latest`
   - **Region**: Oregon (or closest)
   - **Instance Type**: Free

4. Environment Variables:
```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=[create-secure-password]
WEBHOOK_URL=https://parsaveables-n8n.onrender.com
N8N_PORT=10000
N8N_PROTOCOL=https
N8N_HOST=parsaveables-n8n.onrender.com
EXECUTIONS_DATA_PRUNE=true
EXECUTIONS_DATA_MAX_AGE=168
```

5. Deploy and wait for build

### Keep n8n Awake (Free Solution)

**Problem**: Render free tier sleeps after 15 minutes of inactivity.

**Solution**: Use external cron service to ping every 14 minutes.

#### Option A: UptimeRobot (Recommended)
1. Sign up at uptimerobot.com (free)
2. Add New Monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://parsaveables-n8n.onrender.com`
   - **Monitoring Interval**: 5 minutes
   - **Alert**: None needed

#### Option B: Cron-Job.org
1. Sign up at cron-job.org (free)
2. Create new cronjob:
   - **URL**: `https://parsaveables-n8n.onrender.com`
   - **Schedule**: Every 10 minutes
   - **Request Method**: GET

**Result**: n8n stays awake 24/7 for free.

### Update GroupMe Webhook

Update GroupMe bot callback URL to:
```
https://parsaveables-n8n.onrender.com/webhook/groupme-scorecard-incoming
```

## 3. Deploy Dashboard (Vercel)

**Free Tier Limits:**
- Unlimited bandwidth
- 100 deployments/day
- Custom domains
- No sleep mode

### Deployment

1. Sign up at vercel.com
2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Navigate to project:
```bash
cd "C:\Users\Swarnim Bagre\Downloads\My Files\Professional\Side Projects\Github Projects\ParSaveables"
```

4. Deploy:
```bash
vercel --prod
```

5. Select options:
   - Set up and deploy: Y
   - Link to existing project: N
   - Project name: parsaveables
   - Directory: `./ParSaveablesDashboard`
   - Override settings: N

### Alternative: GitHub Integration

1. Push code to GitHub
2. Import repository in Vercel dashboard
3. Configure:
   - **Root Directory**: `ParSaveablesDashboard`
   - **Framework**: Other
   - Auto-deploy on push

### Update Dashboard Config

After deployment, update n8n chatbot URL in `index.html`:
```javascript
const N8N_CHATBOT_URL = 'https://parsaveables-n8n.onrender.com/webhook/chatbot';
```

Redeploy.

## 4. Configure CORS (if needed)

If chatbot fails with CORS errors, add to n8n response node (already configured in workflow):

```javascript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## 5. Share Access with Group

**Public Dashboard Link**: `https://parsaveables.vercel.app` (or your custom domain)

Send to group members - no login required.

## Free Tier Summary

| Service | Cost | Limits | Notes |
|---------|------|--------|-------|
| Supabase | $0 | 500 MB DB | No sleep, unlimited requests |
| Render | $0 | 750 hrs/month | Kept awake with UptimeRobot |
| Vercel | $0 | Unlimited | No sleep mode |
| UptimeRobot | $0 | 50 monitors | Keeps n8n alive |
| Anthropic API | Pay-per-use | ~$0.01-0.05/scorecard | Claude Sonnet 4.5 |

**Total Monthly Cost**: ~$2-5 (Anthropic API usage only)

## Monitoring & Maintenance

### Check n8n Status
- Visit: `https://parsaveables-n8n.onrender.com`
- Login with credentials
- View executions

### Check Supabase
- Visit: supabase.com/dashboard
- View table data
- Monitor API usage

### Update Workflow
1. Export from n8n UI
2. Save to `n8n Workflows/` folder
3. Commit to git

### Backup Database
```bash
# Use Supabase dashboard or CLI
supabase db dump -f backup.sql
```

## Troubleshooting

**n8n keeps sleeping:**
- Verify UptimeRobot is active
- Check Render logs for errors

**Dashboard not updating:**
- Check Supabase credentials
- Verify CORS headers in n8n

**GroupMe bot not responding:**
- Verify webhook URL in GroupMe settings
- Check n8n workflow is active
- Review execution logs

**High API costs:**
- Review Anthropic usage in console
- Consider caching frequent queries
- Optimize prompt length
