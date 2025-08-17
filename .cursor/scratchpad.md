# Bible Reading Discord Bot Project

## Background and Motivation

The user wants to create a Discord bot that helps track Bible reading progress. The bot will:
- Send daily Bible reading messages at 5 AM CST
- Display nicely formatted verses and relevant links
- Allow users to react to messages to mark completion
- Track reading performance in Google Sheets
- Use an Excel sheet as the source for reading plans

## Key Challenges and Analysis

1. **Discord Bot Setup**: Need to create a Discord application and bot, handle authentication
2. **Scheduling**: Implement daily message sending at 5 AM CST using cron jobs or similar
4. **Google Sheets Integration**:Parse Excel files to extract daily reading plans,  Track user reactions and reading progress
5. **Message Formatting**: Create attractive, readable Discord messages with embeds
6. **Reaction Tracking**: Monitor user reactions and store data appropriately
7. **Error Handling**: Handle various edge cases and failures gracefully

## Detailed Implementation Plan

### Phase 1: Discord Bot Foundation (Priority: HIGH)
**Goal**: Create a working Discord bot with basic functionality

#### 1.1 Discord Application Setup
- [ ] Create Discord application at https://discord.com/developers/applications
- [ ] Add bot to application and get bot token
- [ ] Configure bot permissions (Send Messages, Read Message History, Add Reactions)
- [ ] Generate invite link with proper scopes and permissions
- [ ] Test bot connection to Discord server

#### 1.2 Core Bot Implementation
- [ ] Implement `src/scheduler.js` - Daily message scheduling logic
- [ ] Implement `src/messageFormatter.js` - Discord embed creation
- [ ] Implement `src/utils/helpers.js` - Utility functions
- [ ] Add environment variable validation
- [ ] Test basic bot startup and connection

**Success Criteria**: Bot connects to Discord, responds to basic commands, logs properly

### Phase 2: Google Sheets Integration (Priority: HIGH)
**Goal**: Connect to Google Sheets for reading plans and progress tracking

#### 2.1 Google Cloud Setup
- [ ] Create Google Cloud Project
- [ ] Enable Google Sheets API
- [ ] Create service account and download credentials
- [ ] Set up Google Sheets for reading plans (template structure)
- [ ] Set up Google Sheets for progress tracking

#### 2.2 Sheets Integration Implementation
- [ ] Implement `src/sheetsParser.js` - Read daily reading plans from "2026 Plan" sheet
- [ ] Implement `src/sheetsTracker.js` - Track user progress in sheets
- [ ] Create data models for reading plans (Date, Message, Due, Reading, Day, Bonus Text, Start of Book, 10 min Bible, Bible Project, Bonus)
- [ ] Parse progress percentage from message column (e.g., "Day 1: 0.3% complete")
- [ ] Extract and format resource links (Bible Project videos, 10 Minute Bible Hour)
- [ ] Add error handling for API rate limits and failures
- [ ] Test with actual sheet data

**Success Criteria**: Can read daily plans from Google Sheets, can write progress data

### Phase 3: Message Scheduling & Formatting (Priority: HIGH)
**Goal**: Send beautiful daily messages at 5 AM CST

#### 3.1 Scheduling System
- [ ] Implement cron job for daily 5 AM CST execution
- [ ] Add timezone handling with moment-timezone
- [ ] Create message queue system for reliability
- [ ] Add retry logic for failed message sends

#### 3.2 Message Formatting
- [ ] Design Discord embed structure for daily readings
- [ ] Format reading assignments (e.g., "Genesis 1-3") with proper line breaks
- [ ] Include progress percentage prominently (e.g., "Day 1: 0.3% complete")
- [ ] Add resource links (Bible Project videos, 10 Minute Bible Hour) as clickable buttons
- [ ] Include bonus content and book introductions when available
- [ ] Create progress indicators and completion status
- [ ] Add reaction buttons for completion tracking (✅ for completed, 📖 for in progress)

**Success Criteria**: Sends formatted daily messages at correct time, includes all required information

### Phase 4: Reaction Tracking System (Priority: MEDIUM)
**Goal**: Track user completion through Discord reactions

#### 4.1 Reaction Handling
- [ ] Implement reaction add/remove event handlers
- [ ] Validate reactions are on bot messages
- [ ] Create user progress tracking logic
- [ ] Add reaction emoji management
- [ ] Implement progress persistence to Google Sheets

#### 4.2 Progress Analytics
- [ ] Create progress calculation functions
- [ ] Implement streak tracking
- [ ] Add weekly/monthly progress summaries
- [ ] Create leaderboard functionality

**Success Criteria**: Tracks user reactions, updates Google Sheets, provides progress insights

### Phase 5: Advanced Features (Priority: LOW)
**Goal**: Enhanced functionality and user experience

#### 5.1 User Commands
- [ ] Add `/progress` command for personal stats
- [ ] Add `/leaderboard` command for group stats
- [ ] Add `/help` command with usage instructions
- [ ] Implement command permission system

#### 5.2 Error Handling & Monitoring
- [ ] Comprehensive error handling for all components
- [ ] Add health check endpoints
- [ ] Implement automatic recovery mechanisms
- [ ] Add performance monitoring

**Success Criteria**: Robust error handling, user-friendly commands, system monitoring

### Phase 6: Testing & Deployment (Priority: MEDIUM)
**Goal**: Production-ready deployment

#### 6.1 Testing
- [ ] Unit tests for all core functions
- [ ] Integration tests for Discord API
- [ ] Integration tests for Google Sheets API
- [ ] Load testing for message scheduling
- [ ] User acceptance testing

#### 6.2 Deployment
- [ ] Create deployment scripts
- [ ] Set up production environment variables
- [ ] Configure logging for production
- [ ] Create backup and recovery procedures
- [ ] Document deployment process

**Success Criteria**: All tests pass, deployment process documented, production-ready

## Project Status Board

### Current Status / Progress Tracking
- Project initialized and basic structure created
- Git repository set up locally
- ✅ GitHub repository created and code pushed successfully
- Ready to proceed with core bot implementation

### Completed Tasks
- [x] Initial project planning and task breakdown
- [x] Created Node.js project structure
- [x] Set up package.json with all dependencies
- [x] Created comprehensive README.md
- [x] Set up .gitignore and LICENSE
- [x] Created basic bot.js structure
- [x] Implemented logging utility
- [x] Initialized git repository
- [x] Created GitHub repository at https://github.com/reeserj/bibleman-discord-bot
- [x] Pushed initial code to GitHub

### In Progress
- Phase 1: Discord Bot Foundation - Core bot files implemented, dependencies installed

### Pending Tasks
**Phase 1 (HIGH Priority):**
- [x] Create Discord application and get bot token
- [x] Implement `src/scheduler.js` - Daily message scheduling
- [x] Implement `src/messageFormatter.js` - Discord embed creation
- [x] Implement `src/utils/helpers.js` - Utility functions
- [x] Add environment variable validation
- [x] Install project dependencies

**Phase 2 (HIGH Priority):**
- [ ] Set up Google Cloud Project and enable Sheets API
- [ ] Create service account and download credentials
- [ ] Implement `src/sheetsParser.js` - Read daily plans from sheets
- [ ] Implement `src/sheetsTracker.js` - Track user progress
- [ ] Create Google Sheets templates for reading plans and progress

**Phase 3 (HIGH Priority):**
- [ ] Implement cron job for 5 AM CST daily messages
- [ ] Design and implement Discord embed structure
- [ ] Add timezone handling and retry logic
- [ ] Test message scheduling and formatting

**Phase 4 (MEDIUM Priority):**
- [ ] Implement reaction event handlers
- [ ] Create progress tracking logic
- [ ] Add progress analytics and streak tracking
- [ ] Implement leaderboard functionality

**Phase 5 (LOW Priority):**
- [ ] Add user commands (/progress, /leaderboard, /help)
- [ ] Implement comprehensive error handling
- [ ] Add health check and monitoring

**Phase 6 (MEDIUM Priority):**
- [ ] Write unit and integration tests
- [ ] Create deployment scripts and documentation
- [ ] Set up production environment

## Executor's Feedback or Assistance Requests

**GitHub Repository Creation Instructions:**

To create the GitHub repository for this project:

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Repository name: `bibleman-discord-bot`
4. Description: `A Discord bot for tracking Bible reading progress with Google Sheets integration`
5. Make it Public or Private (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

After creating the repository, GitHub will show you commands to push an existing repository. Use these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bibleman-discord-bot.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Next Steps:**
- ✅ GitHub repository created and code pushed successfully
- ✅ Google Sheet identified: https://docs.google.com/spreadsheets/d/1fqg_0b8BiIF_AHS5VR7rT2Xi3FxR6_5u7wuWw_qtOls/edit?gid=9039543#gid=9039543
- ✅ Sheet structure analyzed: "2026 Plan" sheet with comprehensive reading data
- Ready to proceed with implementing the core bot functionality
- Next phase: Create Discord bot application and implement core features

**Important Notes:**
- The Google Sheet contains rich data including progress percentages, multiple resource links, and structured reading assignments
- Need to ensure the bot has read access to the "2026 Plan" sheet
- The sheet includes Bible Project videos and 10 Minute Bible Hour links that should be prominently featured

## Technical Specifications

### Discord Bot Requirements
- **Intents**: Guilds, GuildMessages, GuildMessageReactions, MessageContent
- **Permissions**: Send Messages, Read Message History, Add Reactions, Use Slash Commands
- **Rate Limits**: Handle Discord API rate limits (5 requests per 2 seconds)
- **Message Size**: Discord embeds limited to 6000 characters

### Google Sheets Structure
**Reading Plans Sheet (2026 Plan):**
- Column A: Date (YYYY-MM-DD)
- Column B: Message (Formatted daily message with progress %)
- Column C: Due (Reading assignment)
- Column D: Reading (Day number)
- Column E: Day (Additional day info)
- Column F: Bonus Text (Additional resources)
- Column G: Start of Book (Book introduction)
- Column H: 10 min Bible (10 Minute Bible Hour links)
- Column I: Bible Project (Bible Project video links)
- Column J: Bonus (Additional bonus content)

**Progress Tracking Sheet (To be created):**
- Column A: Date
- Column B: User ID
- Column C: Username
- Column D: Reading Plan ID
- Column E: Completion Status
- Column F: Reaction Time
- Column G: Streak Count

**Key Features from the Sheet:**
- Daily progress percentage tracking (e.g., "Day 1: 0.3% complete")
- Multiple resource links (Bible Project videos, 10 Minute Bible Hour)
- Book introductions and bonus content
- Structured reading assignments (e.g., "Genesis 1-3")

### Environment Variables
```env
DISCORD_TOKEN=bot_token_here
DISCORD_CLIENT_ID=client_id_here
DISCORD_GUILD_ID=server_id_here
DISCORD_CHANNEL_ID=channel_id_here
GOOGLE_SHEETS_CREDENTIALS=./data/credentials.json
READING_PLAN_SHEET_ID=1fqg_0b8BiIF_AHS5VR7rT2Xi3FxR6_5u7wuWw_qtOls
READING_PLAN_SHEET_NAME=2026 Plan
PROGRESS_TRACKING_SHEET_ID=sheet_id_here
TIMEZONE=America/Chicago
SCHEDULE_TIME=0 5 * * *
LOG_LEVEL=info
```

### Error Handling Strategy
- **API Failures**: Retry with exponential backoff
- **Rate Limits**: Implement queuing system
- **Invalid Data**: Graceful degradation with fallback messages
- **Network Issues**: Automatic reconnection with health checks

## Lessons

*This section will be updated with learnings and solutions during development*

## Technical Requirements

### Dependencies Needed
- discord.js (Discord bot framework)
- node-cron (for scheduling)
- xlsx (Excel file parsing)
- googleapis (Google Sheets API)
- dotenv (environment variables)

### API Requirements
- Discord Bot Token
- Google Sheets API credentials
- Discord Server/Channel IDs

### File Structure
```
bibleman/
├── src/
│   ├── bot.js
│   ├── scheduler.js
│   ├── excelParser.js
│   ├── sheetsTracker.js
│   └── messageFormatter.js
├── data/
│   └── reading-plans.xlsx
├── config/
│   └── .env
├── package.json
└── README.md
```
