# ParSaveables Scorecard Processor

Serverless scorecard processing system built with Node.js.

## Structure

```
src/
├── api/              # API endpoints (main orchestrators)
├── services/         # Business logic (one service per step)
├── utils/            # Shared utilities (logger, helpers)
├── config/           # Configuration management
└── tests/            # Unit tests
```

## Services

Each service handles one specific responsibility:

- `emailService.js` - Gmail API integration
- `visionService.js` - Claude Vision API
- `scoringService.js` - Stats calculation & ranking
- `eventService.js` - Event assignment (season/tournament)
- `configService.js` - Load scoring configuration
- `playerService.js` - Player validation
- `pointsService.js` - Points calculation
- `databaseService.js` - Supabase operations

## Setup

1. Copy `.env.example` to `.env` and fill in credentials
2. Run `npm install`
3. Run `npm test` to verify setup

## Development

- `npm run dev` - Start with hot reload
- `npm test` - Run all tests
