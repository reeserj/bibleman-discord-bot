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

## High-level Task Breakdown

### Phase 1: Project Setup and Basic Bot
- [ ] Initialize Node.js project with necessary dependencies
- [ ] Set up Discord bot application and get credentials
- [ ] Create basic bot structure with Discord.js
- [ ] Implement basic bot connection and message handling

### Phase 2: Google Sheets Reading Plan Integration
- [ ] Set up Google Sheets file parsing (using xlsx or similar library)
- [ ] Create data models for reading plans
- [ ] Implement reading plan loading and daily selection logic
- [ ] Test with sample Google Sheets data

### Phase 3: Message Scheduling and Formatting
- [ ] Implement cron job for daily 5 AM CST message sending
- [ ] Create message formatting with Discord embeds
- [ ] Add relevant links and verse formatting
- [ ] Test message scheduling and formatting

### Phase 4: Reaction Tracking
- [ ] Implement reaction event handlers
- [ ] Set up Google Sheets API integration
- [ ] Create data storage structure for tracking progress
- [ ] Implement reading completion tracking logic

### Phase 5: Google Sheets Integration
- [ ] Set up Google Sheets API authentication
- [ ] Create sheets for tracking user reading progress
- [ ] Implement data writing to sheets
- [ ] Add progress reporting functionality

### Phase 6: Testing and Deployment
- [ ] Comprehensive testing of all features
- [ ] Error handling and logging
- [ ] Deployment preparation
- [ ] Documentation and user instructions

## Project Status Board

### Current Status / Progress Tracking
- Project initialized
- Planning phase completed

### Completed Tasks
- [x] Initial project planning and task breakdown

### In Progress
- None currently

### Pending Tasks
- [ ] Set up Node.js project structure
- [ ] Create Discord bot application
- [ ] Implement basic bot functionality
- [ ] Excel file parsing implementation
- [ ] Message scheduling system
- [ ] Reaction tracking system
- [ ] Google Sheets integration
- [ ] Testing and deployment

## Executor's Feedback or Assistance Requests

*This section will be updated by the Executor during implementation*

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
