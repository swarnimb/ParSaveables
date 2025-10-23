# ParSaveables - Disc Golf Season Tracker

A disc golf amateur season score tracking system with an AI-powered chatbot and real-time dashboard.

## Features

- **Automated Scorecard Processing**: Upload UDisc scorecard screenshots to GroupMe, automatically extract and calculate scores
- **AI Chatbot**: Ask questions about player stats, leaderboards, and course performance
- **Real-time Dashboard**: View season standings, player statistics, and performance trends
- **Configuration-Driven**: Course tiers and points systems stored in database (no code changes needed)
- **Multi-Event Support**: Separate scoring for seasons and tournaments

## Tech Stack

- **Frontend**: Static HTML/CSS/JavaScript (hosted on Vercel)
- **Database**: Supabase (PostgreSQL)
- **Automation**: n8n workflows (hosted on Render)
- **AI**: Anthropic Claude (vision + chat)
- **Integration**: GroupMe webhooks

## Project Structure

```
ParSaveables/
├── database/                   # Database scripts
│   ├── migrations/             # Schema migrations
│   ├── seed_data.sql          # Initial configuration
│   └── import_2025_final.sql  # Historical season data
├── docs/                       # Documentation
│   ├── refactoring/           # Refactoring guides
│   ├── ARCHITECTURE.md        # System architecture
│   ├── SETUP.md               # Setup instructions
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── WORKFLOW_DETAILS.md    # n8n workflow documentation
├── n8n-workflows/             # n8n workflow nodes
│   └── nodes/                 # Node code
│       ├── calculate-points.js       # Enterprise-grade points calculator
│       └── load-configuration.js     # Database config loader
├── ParSaveablesDashboard/     # Frontend application
│   └── index.html             # Main dashboard
└── README.md                  # This file
```

## Quick Start

### Prerequisites

- Supabase account (free tier)
- Vercel account (free tier)
- Render account (free tier)
- n8n instance
- Anthropic API key
- GroupMe bot

### Configuration

1. **Database Setup**:
   - Run `database/migrations/001_add_config_tables.sql` in Supabase
   - Run `database/seed_data.sql` to populate courses and points systems
2. **n8n Workflow**:
   - Add "Load Configuration" node code from `n8n-workflows/nodes/load-configuration.js`
   - Replace "Calculate Points" node code from `n8n-workflows/nodes/calculate-points.js`
3. **Dashboard**: Update Supabase credentials in `ParSaveablesDashboard/index.html`
4. **Deploy**: Follow `docs/DEPLOYMENT.md`

**New to this project?** See `docs/refactoring/README_REFACTORING.md` for complete setup guide.

## Usage

### Upload Scorecard
1. Post UDisc scorecard screenshot to GroupMe
2. Bot automatically processes and stores data in Supabase
3. Dashboard updates in real-time

### Access Dashboard
- Public URL: [Your Vercel URL]
- Auto-refreshes every 5 minutes

### Ask Questions
Use the chatbot to query stats:
- "Who is winning the season?"
- "What's David's average score?"
- "Best round at Zilker?"

## Database Schema

### Tables
- `events`: Seasons and tournaments with date ranges
- `points_systems`: Scoring configurations (rank points, performance bonuses)
- `courses`: Course difficulty tiers and multipliers
- `rounds`: Round metadata (course, date, weather)
- `player_rounds`: Individual player scores and statistics

See `docs/SETUP.md` for complete schema.

## Points System

**Configuration-Driven**: All scoring rules stored in database `points_systems` table.

### Season 2025 (Regular Season)
- **Rank Points**: 1st=10, 2nd=7, 3rd=5, Participation=2
- **Performance**: Birdie=1, Eagle=3, Ace=5
- **Course Multiplier**: Applied based on tier (1.0x - 2.5x)

### Tournament Example (Portlandia 2025)
- **Rank Points**: 1st=15, 2nd=12, 3rd=9, 4th=7, 5th=6, 6th=5, 7th=3
- **Performance**: Birdie=1, Eagle=5, Ace=10
- **Course Multiplier**: Disabled (1.0x)

**Adding new tournaments or modifying points?** Just update the database - no code changes needed!

## Contributing

This is a private amateur group project. For modifications, update the workflow or dashboard and commit changes.

## License

MIT
