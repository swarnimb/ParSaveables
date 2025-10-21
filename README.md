# ParSaveables - Disc Golf Season Tracker

A disc golf amateur season score tracking system with an AI-powered chatbot and real-time dashboard.

## Features

- **Automated Scorecard Processing**: Upload UDisc scorecard screenshots to GroupMe, automatically extract and calculate scores
- **AI Chatbot**: Ask questions about player stats, leaderboards, and course performance
- **Real-time Dashboard**: View season standings, player statistics, and performance trends
- **Points System**: Course difficulty tiers (1.0x - 2.5x multipliers) and rank-based scoring

## Tech Stack

- **Frontend**: Static HTML/CSS/JavaScript (hosted on Vercel)
- **Database**: Supabase (PostgreSQL)
- **Automation**: n8n workflows (hosted on Render)
- **AI**: Anthropic Claude (vision + chat)
- **Integration**: GroupMe webhooks

## Project Structure

```
ParSaveables/
├── ParSaveablesDashboard/
│   └── index.html              # Main dashboard application
├── n8n Workflows/
│   └── ParSaveables Scorecard and Chat.json  # n8n workflow export
├── docs/
│   ├── SETUP.md               # Setup instructions
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── ARCHITECTURE.md        # System architecture
└── README.md
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

1. **Supabase**: Set up database tables (see `docs/SETUP.md`)
2. **n8n**: Import workflow from `n8n Workflows/` folder
3. **Dashboard**: Update Supabase credentials in `ParSaveablesDashboard/index.html` lines 371-373
4. **Deploy**: Follow `docs/DEPLOYMENT.md`

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
- `rounds`: Course information, date, weather conditions
- `player_rounds`: Individual player scores and statistics

See `docs/SETUP.md` for complete schema.

## Points System

**Rank Points** (with tie averaging):
- 1st: 10 points
- 2nd: 7 points
- 3rd: 5 points
- Participation: 2 points

**Performance Bonuses**:
- Ace: 5 points
- Eagle: 3 points
- Birdie: 1 point

**Course Difficulty Multipliers**:
- Tier 1 (1.0x): Wells Branch, Lil G
- Tier 2 (1.5x): Zilker Park, Live Oak
- Tier 3 (2.0x): Northtown, Searight
- Tier 4 (2.5x): East Metro, Bible Ridge

## Contributing

This is a private amateur group project. For modifications, update the workflow or dashboard and commit changes.

## License

MIT
