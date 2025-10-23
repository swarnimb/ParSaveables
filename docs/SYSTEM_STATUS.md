# ParSaveables - System Status

## Live System URLs

- **Dashboard**: https://par-saveables.vercel.app
- **n8n Workflow**: https://parsaveables-seasons.onrender.com
- **Supabase Project**: https://supabase.com/dashboard (login to access)
- **UptimeRobot**: https://uptimerobot.com/dashboard (login to access)
- **GitHub Repo**: https://github.com/swarnimb/ParSaveables

## Credentials & Access

### n8n (Render)
- URL: https://parsaveables-seasons.onrender.com
- Login: Your email/password (set during signup)
- Purpose: Workflow automation, webhook endpoints

### Supabase
- Project: ParSaveables
- Tables: `rounds`, `player_rounds`, `holes`
- RLS: Enabled with public read policies
- Keys saved in your secure location

### Vercel
- Project: par-saveables
- Root Directory: ParSaveablesDashboard
- Auto-deploy: On push to main branch

### UptimeRobot
- Monitor: ParSaveables n8n
- URL: https://parsaveables-seasons.onrender.com
- Interval: Every 5 minutes
- Purpose: Keeps n8n awake 24/7

## Webhook URLs

### Scorecard Processing
```
https://parsaveables-seasons.onrender.com/webhook/groupme-scorecard-incoming
```
- Used by: GroupMe bot
- Triggers: Scorecard screenshot processing

### Chatbot
```
https://parsaveables-seasons.onrender.com/webhook/chatbot
```
- Used by: Dashboard chatbot interface
- Accepts: POST with `{"question": "..."}`

## Current System Features

### Automated Scorecard Processing
- Upload UDisc screenshot to GroupMe
- Claude Vision extracts data
- Automatic ranking with tie-breakers
- Points calculation with course multipliers
- Saves to Supabase database

### Points System
**Rank Points** (with tie averaging):
- 1st place: 10 points
- 2nd place: 7 points
- 3rd place: 5 points
- Participation: 2 points

**Performance Bonuses**:
- Ace: 5 points
- Eagle: 3 points
- Birdie: 1 point

**Course Difficulty Tiers**:
- Tier 1 (1.0x): Wells Branch, Lil G, Armadillo Mini
- Tier 2 (1.5x): Zilker Park, Live Oak, Bartholomew Park
- Tier 3 (2.0x): Northtown, Searight, MetCenter, Old Settler's, Cat Hollow, Circle C
- Tier 4 (2.5x): East Metro, Bible Ridge, Flying Armadillo, Harvey Penick

### Tie-Breaker Rules
For players with same total score:
1. More birdies wins
2. More pars wins
3. Earlier first birdie wins
4. Still tied = share rank

### Dashboard Features
- Season leaderboard (points, wins, top 3 finishes)
- Aces/Eagles/Birdies visualization
- Average score by course tier
- Monthly points trend chart
- AI chatbot for stats queries
- Auto-refresh every 5 minutes

## Uptime Strategy

**Service**: Render free tier (sleeps after 15 min inactivity)
**Solution**: UptimeRobot pings every 5 minutes
**Result**: 24/7 uptime on free tier

## Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| Supabase | $0 |
| Render | $0 |
| Vercel | $0 |
| UptimeRobot | $0 |
| Anthropic API | $2-5 (usage) |
| **TOTAL** | **~$2-5** |

## Maintenance Tasks

### Weekly
- Check n8n execution logs for errors
- Monitor Supabase database size
- Review Anthropic API costs

### Monthly
- Export n8n workflow to git (backup)
- Review course tier assignments
- Check for duplicate player names

## Known Configuration

### Dashboard Config (index.html lines 499-501)
```javascript
const SUPABASE_URL = 'https://bcovevbtcdsgzbrieiin.supabase.co';
const SUPABASE_KEY = 'eyJ...' // anon/public key
const N8N_CHATBOT_URL = 'https://parsaveables-seasons.onrender.com/webhook/chatbot';
```

### n8n Workflow
- Name: ParSaveables Scorecard and Chat
- Status: Active
- Credentials: Supabase (service_role), Anthropic (x-api-key)
- Version: Exported in `n8n Workflows/ParSaveables Scorecard and Chat.json`

## Troubleshooting

### Dashboard not loading data
- Check Supabase RLS policies (should allow public SELECT)
- Verify Supabase anon key in index.html
- Check browser console for errors

### Scorecard not processing
- Verify n8n workflow is Active
- Check GroupMe webhook URL is correct
- Review n8n execution logs
- Confirm Anthropic API key is valid

### Chatbot not responding
- Check n8n chatbot webhook URL in dashboard
- Verify CORS headers in n8n response node
- Test webhook directly with curl

### n8n sleeping (after 20+ min)
- Check UptimeRobot monitor is active
- Verify monitor interval is 5 minutes
- Check UptimeRobot logs for failures

## Next Steps

1. ✅ System fully deployed and operational
2. ✅ 24/7 uptime configured
3. ✅ All integrations tested
4. 🔄 Ready for logic updates/improvements
5. ⏳ Gather user feedback from group

## Status: OPERATIONAL ✅

Last updated: 2025-10-20
System is live and accepting scorecards.
