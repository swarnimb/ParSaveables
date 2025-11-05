# Workflow Backup Reminder

## IMPORTANT: Backup Your n8n Workflows Monthly

Since you're using Render's free tier, your n8n workflows can disappear when the container restarts.

## How to Backup (Takes 2 minutes)

### Every Month:

1. **Open n8n** (your Render URL)
2. **For each workflow**:
   - Click **...** menu next to workflow name
   - Click **Download**
   - Save JSON file to `n8n-workflows/` folder
3. **Commit to Git**:
   ```bash
   git add n8n-workflows/
   git commit -m "Backup n8n workflows - [DATE]"
   git push
   ```

## Set a Calendar Reminder

**Add to your calendar: "Backup n8n workflows" - Monthly recurring**

## Files to Save

- `ParSaveables-Scorecard-and-Chat.json` - Main workflow

## Why This Matters

Without backups, if Render restarts your container:
- ❌ All workflows disappear
- ❌ Must recreate from scratch (1-2 hours)
- ❌ Risk of errors during recreation

With backups:
- ✅ Import JSON in 30 seconds
- ✅ No downtime
- ✅ Peace of mind

## Alternative: Use Persistent Storage

See `docs/N8N_WORKFLOW_RECREATION.md` section "Option 2: Use PostgreSQL Database" for how to set up permanent storage (requires paid database).
