# Deployment Guide - Vercel Serverless Architecture

Complete guide for deploying the ParSaveables scorecard processor to Vercel.

## Architecture

```
Gmail → Vercel Serverless Function → Supabase
           (Cron: Every 30 min)        ↓
                                   Dashboard (Vercel) ← Users
```

**Key Changes from Previous Architecture:**
- ❌ ~~GroupMe webhook~~ → ✅ Gmail API trigger
- ❌ ~~n8n on Render~~ → ✅ Vercel serverless functions
- ✅ All code on GitHub (enterprise-quality, testable, reusable)
- ✅ Configuration-driven design (no hardcoding)

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. ✅ **GitHub Repository** - Code pushed to GitHub
3. ✅ **Supabase Project** - Database with proper schema
4. ✅ **Anthropic API Key** - Claude Vision API access
5. ✅ **Gmail API Credentials** - OAuth2 client ID, secret, and refresh token

---

## Step 1: Set Up Gmail API

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "ParSaveables Gmail API"
3. Enable Gmail API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

### 1.2 Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure consent screen if prompted
4. Application type: "Web application"
5. Authorized redirect URIs:
   ```
   https://developers.google.com/oauthplayground
   ```
6. Save **Client ID** and **Client Secret**

### 1.3 Get Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click settings gear icon (top right)
3. Check "Use your own OAuth credentials"
4. Enter your **Client ID** and **Client Secret**
5. In Step 1, select scopes:
   ```
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/gmail.send
   ```
6. Click "Authorize APIs"
7. Sign in with your Gmail account
8. In Step 2, click "Exchange authorization code for tokens"
9. Save the **Refresh Token**

---

## Step 2: Prepare Environment Variables

Create a list of environment variables you'll need to add to Vercel:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key

# Gmail API
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Optional: Testing
TEST_EMAIL_RECIPIENT=your-email@gmail.com
TEST_SCORECARD_IMAGE_URL=https://example.com/scorecard.png
```

**Security Note:** Never commit these values to Git. Keep them in Vercel's environment variable settings only.

---

## Step 3: Deploy to Vercel

### 3.1 Import GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `ParSaveables`
4. Vercel will auto-detect the configuration from `vercel.json`

### 3.2 Configure Project Settings

**Framework Preset:** Other (Vercel will auto-detect static files)

**Build Settings:**
- Build Command: (leave empty)
- Output Directory: `ParSaveablesDashboard`
- Install Command: `npm install`

**Root Directory:** `.` (root of repository)

### 3.3 Add Environment Variables

In Vercel project settings → Environment Variables, add all variables from Step 2:

1. Click "Add New"
2. Enter variable name (e.g., `SUPABASE_URL`)
3. Enter value
4. Select environment: **Production** (and optionally Preview/Development)
5. Click "Add"
6. Repeat for all variables

**Critical Variables:**
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ ANTHROPIC_API_KEY
- ✅ GMAIL_CLIENT_ID
- ✅ GMAIL_CLIENT_SECRET
- ✅ GMAIL_REFRESH_TOKEN

### 3.4 Deploy

1. Click "Deploy"
2. Vercel will build and deploy your project
3. Wait for deployment to complete (~1-2 minutes)
4. Note your deployment URL: `https://parsaveables.vercel.app`

---

## Step 4: Verify Deployment

### 4.1 Check Dashboard

1. Visit: `https://parsaveables.vercel.app`
2. Verify the dashboard loads correctly
3. Check that leaderboard data displays

### 4.2 Test Serverless Function

**Manual Test (POST request):**

```bash
curl -X POST https://parsaveables.vercel.app/api/processScorecard \
  -H "Content-Type: application/json" \
  -d '{"maxEmails": 1, "skipNotifications": true}'
```

**Expected Response:**
```json
{
  "success": true,
  "results": {
    "stats": {
      "emailsChecked": 0,
      "successful": 0,
      "failed": 0
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4.3 Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → "Logs"
2. View real-time function execution logs
3. Look for successful processing messages

---

## Step 5: Configure Cron Job

The cron job is automatically configured in `vercel.json` to run every 30 minutes.

### Verify Cron Setup

1. Go to Vercel Dashboard → Your Project → "Settings" → "Cron Jobs"
2. You should see:
   - **Path:** `/api/processScorecard`
   - **Schedule:** `*/30 * * * *` (every 30 minutes)
   - **Status:** Active

### Adjust Schedule (Optional)

Edit `vercel.json` to change the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/processScorecard",
      "schedule": "0 * * * *"  // Every hour on the hour
    }
  ]
}
```

**Cron Schedule Examples:**
- `*/15 * * * *` - Every 15 minutes
- `0 */2 * * *` - Every 2 hours
- `0 9 * * *` - Daily at 9:00 AM UTC

---

## Step 6: Test Email Processing

### 6.1 Send Test Scorecard

1. Take a UDisc scorecard screenshot
2. Email it to the Gmail account configured in Step 1
3. Ensure email is unread

### 6.2 Trigger Processing

**Option 1: API Call**
```bash
curl -X POST https://parsaveables.vercel.app/api/processScorecard
```

**Option 2: Wait for Cron** (runs every 30 minutes)

### 6.3 Verify Results

1. **Check Email:** Success notification received
2. **Check Dashboard:** New round appears
3. **Check Supabase:** Data in `rounds` and `player_rounds` tables
4. **Check Vercel Logs:** All 12 steps completed

---

## Cost Breakdown

**Vercel Hobby Plan (Free):**
- ✅ 100 GB bandwidth/month
- ✅ Serverless function executions: Unlimited
- ✅ Cron jobs: Included
- ✅ 60-second function timeout
- ✅ 6,000 execution hours/month

**Estimated Usage:**
- ~1,500 cron executions/month (every 30 min)
- ~5 seconds avg execution time
- Total: ~2 hours/month
- **Well within free tier**

**External Services:**
- Supabase: Free tier (500 MB database)
- Anthropic Claude API: ~$0.01 per scorecard
- Gmail API: Free (1 billion quota units/day)

**Total Monthly Cost: $0-5** (depending on scorecard volume)

---

## Troubleshooting

### Common Issues

**1. "Missing required environment variables"**
- **Solution:** Add missing variables in Vercel settings → Redeploy

**2. "Gmail API error: 403 Forbidden"**
- **Solution:** Regenerate refresh token (Step 1.3) → Update in Vercel

**3. "No active season or tournament found for date"**
- **Solution:** Add event to database via admin panel or SQL

**4. "Invalid scorecard" from Claude Vision**
- **Solution:** Ensure clear UDisc screenshot with 4+ players

**5. Function timeout (60s exceeded)**
- **Solution:** Reduce `maxEmails` or increase timeout in `vercel.json`

### Monitoring

**Vercel Logs:**
- Dashboard → Logs → Filter by `/api/processScorecard`
- Monitor INFO, WARN, ERROR levels

**Supabase:**
- Dashboard → Table Editor → Check `rounds` and `player_rounds`
- Monitor API usage and storage

**Email:**
- Check Gmail for success/error notifications
- Verify labels: ParSaveables/Processed, ParSaveables/Error

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Gmail API:** https://developers.google.com/gmail/api
- **Claude API:** https://docs.anthropic.com

---

*Last Updated: January 2025*
