# ParSaveables - Disc Golf Season Tracker

Enterprise-grade serverless disc golf scorecard processing system with automated scoring, AI-powered insights, and real-time leaderboards.

## Features

- **Automated Scorecard Processing**: Email UDisc scorecard screenshots → Automated extraction, stats calculation, and leaderboard updates
- **AI Vision**: Claude Vision API extracts hole-by-hole scores, player names, course details, and weather data
- **Configuration-Driven**: All scoring rules, course tiers, and point systems stored in database (zero hardcoding)
- **Multi-Event Support**: Separate tracking for seasons and tournaments with custom scoring systems
- **Player Validation**: Fuzzy name matching with Levenshtein distance for truncated/misspelled names
- **Real-time Dashboard**: Live leaderboards, player statistics, and performance trends
- **Admin Panel**: Full CRUD interface for managing points systems, courses, events, and data
- **Serverless Architecture**: Vercel functions with Gmail API trigger (no servers to maintain)

## Tech Stack

- **Runtime**: Node.js 18+ with ES modules
- **Frontend**: Static HTML/CSS/JavaScript (Vercel)
- **Backend**: Vercel serverless functions
- **Database**: Supabase PostgreSQL
- **AI**: Anthropic Claude (Vision + Chat APIs)
- **Trigger**: Gmail API with OAuth2
- **Deployment**: Vercel (free tier)

## Architecture

```
Gmail Inbox
    ↓ (OAuth2)
Vercel Serverless Function (Cron: every 30 min)
    ↓
8 Microservices → Supabase PostgreSQL
    ↓
Dashboard (Static Site)
```

## Project Structure

```
ParSaveables/
├── .claude/                    # Claude Code context files
│   └── claude.md               # Development session context
├── database/                   # Database scripts (organized by purpose)
│   ├── migrations/             # Versioned schema changes
│   │   ├── 001_add_config_tables.sql
│   │   └── 002_add_podcast_tables.sql
│   ├── seeds/                  # Repeatable initial configuration
│   │   └── seed_data.sql
│   ├── historical/             # One-time historical data imports
│   │   ├── import_2025_final.sql
│   │   ├── minneapolis_2024_data.sql
│   │   └── 2025_Season.csv
│   └── fixes/                  # Archived one-off corrections
│       ├── clean_courses.sql
│       └── fix_points_system_links.sql
├── docs/                       # Documentation
│   └── DEPLOYMENT.md           # Vercel deployment guide
├── podcast/                    # Automated podcast generator
│   └── README.md               # Podcast system documentation
├── public/                     # Frontend static assets
│   ├── index.html              # Main dashboard (leaderboard, chatbot)
│   └── admin.html              # Admin panel (CRUD operations)
├── src/                        # Backend serverless code
│   ├── api/                    # API endpoints (orchestrators)
│   │   ├── processScorecard.js # Main 12-step scorecard workflow
│   │   └── chatbot.js          # AI chatbot for dashboard queries
│   ├── services/               # Business logic (8 microservices)
│   │   ├── databaseService.js  # Supabase CRUD operations
│   │   ├── visionService.js    # Claude Vision API (scorecard extraction)
│   │   ├── scoringService.js   # Stats calculation & ranking
│   │   ├── eventService.js     # Event assignment (season/tournament)
│   │   ├── playerService.js    # Name validation (fuzzy matching)
│   │   ├── configService.js    # Configuration loader
│   │   ├── pointsService.js    # Points calculation with multipliers
│   │   └── emailService.js     # Gmail API integration
│   ├── config/                 # Environment configuration
│   │   └── index.js            # Load and validate env variables
│   ├── utils/                  # Shared utilities
│   │   └── logger.js           # Timestamped logging factory
│   └── tests/                  # Unit tests (Node.js test runner)
│       ├── chatbot.test.js
│       ├── processScorecard.test.js
│       └── [8 service test files]
├── .env.example                # Environment variables template
├── .gitignore                  # Git exclusions (secrets, node_modules)
├── package.json                # Dependencies & npm scripts
├── package-lock.json           # Locked dependency versions
├── vercel.json                 # Vercel deployment config
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Anthropic API key
- Gmail account with API access
- Vercel account (optional for deployment)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/swarnimb/ParSaveables.git
   cd ParSaveables
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment instructions.

## Workflow (12 Steps)

1. **Email Check**: Poll Gmail inbox for unread emails with image attachments
2. **Image Extract**: Download scorecard images as base64 data URLs
3. **Vision API**: Claude Vision extracts structured JSON from scorecard
4. **Validation**: Verify minimum 4 players and valid UDisc format
5. **Stats Calculation**: Recalculate birdies/eagles/aces from hole-by-hole data
6. **Ranking**: Sort players with 4-level tie-breaking algorithm
7. **Event Assignment**: Match date to season or tournament
8. **Player Validation**: Fuzzy match names against registry (95%/75% thresholds)
9. **Config Load**: Fetch points system and course multiplier
10. **Points Calculation**: Apply rank points, performance bonuses, course multipliers
11. **Database Insert**: Save round and player_rounds to Supabase
12. **Notification**: Send success/error email to submitter

## Key Services

### emailService.js (478 lines)
Gmail API integration with OAuth2 refresh token. Polls inbox, extracts attachments, marks processed, sends notifications.

### visionService.js (181 lines)
Claude Vision API integration. Extracts structured scorecard data with detailed prompt engineering for UDisc format.

### scoringService.js (212 lines)
Stats calculation and ranking engine. 4-level tie-breaking: score → birdies → pars → first birdie hole.

### playerService.js (242 lines)
Name validation with Levenshtein distance algorithm. Handles truncated names ("Intern..." → "Intern Line Cook").

### pointsService.js (168 lines)
Configuration-driven points calculator. Supports rank points, performance bonuses, tied rank averaging, and course multipliers.

### databaseService.js (167 lines)
Supabase CRUD operations. Service role key for RLS bypass. All functions async with error handling.

### configService.js (106 lines)
Loads complete scoring configuration from database. Fuzzy course name matching with graceful defaults.

### eventService.js (59 lines)
Assigns season or tournament based on scorecard date. Prioritizes tournaments over seasons.

## Development Principles

- **Single Responsibility**: Each service does ONE thing well
- **Pure Functions**: Testable, composable, no side effects
- **Config-Driven**: All rules in database, zero hardcoding
- **Fail-Fast**: Validate early with descriptive errors
- **Comprehensive Logging**: Every action logged with context
- **Enterprise-Grade**: Production-ready code from day one

## Testing

All 8 services have comprehensive test files using Node.js built-in test runner:

```bash
npm test                                    # Run all tests
npm test src/tests/emailService.test.js    # Test specific service
```

**Note**: Tests require valid .env credentials and active database connection.

## Deployment

Deploy to Vercel with automatic cron job execution:

```bash
vercel --prod
```

**Free Tier Limits:**
- ✅ Unlimited serverless executions
- ✅ 60-second function timeout
- ✅ 6,000 execution hours/month
- ✅ Cron jobs included

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete guide including Gmail API setup, environment variables, and troubleshooting.

## Database Schema

**Configuration Tables (Read):**
- `points_systems` - Scoring rules (JSONB config)
- `courses` - Course library with tiers/multipliers
- `events` - Seasons and tournaments
- `registered_players` - Player registry

**Data Tables (Write):**
- `rounds` - Round metadata (date, course, weather)
- `player_rounds` - Player performance (stats, points, hole-by-hole)

## API Endpoints

- `POST /api/processScorecard` - Process new scorecards from Gmail (manual trigger or cron)
  - Cron: Every 30 minutes
  - 12-step workflow: email → vision → scoring → database
- `POST /api/chatbot` - AI chatbot queries about stats, leaderboards, and courses
  - Returns conversational answers using Claude Chat API
  - Auto-detects query type (leaderboard, player stats, course info, recent rounds)

## Performance

- **Cold Start**: ~2-3 seconds
- **Warm Execution**: ~5-10 seconds per scorecard
- **Vision API**: ~3-5 seconds per image
- **Database Ops**: ~500ms total

## Cost Estimate

- **Vercel**: $0 (free tier)
- **Supabase**: $0 (free tier, 500 MB database)
- **Anthropic Claude**: ~$0.01 per scorecard
- **Gmail API**: $0 (free, 1B quota units/day)

**Total**: ~$0-5/month depending on scorecard volume

## Contributing

This is a private league tracking system. For questions or issues, contact the repository owner.

## License

Private - All Rights Reserved

---

**Built with enterprise-grade code quality standards** | **Zero hardcoding** | **Configuration-driven design** | **Fully testable** | **Production-ready**
