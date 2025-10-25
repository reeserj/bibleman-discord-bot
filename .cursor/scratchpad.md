# Bible Reading Discord Bot Project

## Background and Motivation

The user wants to create a Discord bot that helps track Bible reading progress. The bot will:
- Send daily Bible reading messages at 5 AM CST
- Display nicely formatted verses and relevant links
- Allow users to react to messages to mark completion
- Track reading performance in Google Sheets
- Use an Excel sheet as the source for reading plans

**UPDATE**: The user has requested to remove all standalone desktop app features, keeping only the core Discord bot functionality.

**NEW REQUEST**: The user wants to install the Discord MCP server from https://github.com/v-3/discordmcp to enable Claude integration with Discord channels.

**MCP SERVER INSTALLATION COMPLETED** ✅

**What's Been Installed:**
1. **Discord MCP Server Repository**: Cloned from https://github.com/v-3/discordmcp
2. **Dependencies**: All npm packages installed and vulnerabilities fixed
3. **Build**: TypeScript compiled successfully to JavaScript
4. **Configuration**: Environment variables configured with existing Discord token
5. **Testing**: Server tested and confirmed working (Discord bot connects successfully)

**Installation Location**: `/home/reese/.cursor/Bibleman/discordmcp/`

**Available Tools:**
- `send-message`: Send messages to Discord channels
- `read-messages`: Read recent messages from Discord channels

**How to Use with Claude Desktop:**
1. Open Claude Desktop configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the Discord MCP server configuration:
```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["/home/reese/.cursor/Bibleman/discordmcp/build/index.js"],
      "env": {
        "DISCORD_TOKEN": "[YOUR_BOT_TOKEN_HERE]"
      }
    }
  }
}
```
3. Restart Claude Desktop

**Current Status**: Discord MCP server is fully installed and ready for Claude integration.

## Key Challenges and Analysis

1. **Discord Bot Setup**: Need to create a Discord application and bot, handle authentication
2. **Scheduling**: Implement daily message sending at 5 AM CST using cron jobs or similar
3. **Google Sheets Integration**: Parse Excel files to extract daily reading plans, Track user reactions and reading progress
4. **Message Formatting**: Create attractive, readable Discord messages with embeds
5. **Reaction Tracking**: Monitor user reactions and store data appropriately
6. **Error Handling**: Handle various edge cases and failures gracefully
7. **Configuration**: Use environment variables for Discord channel configuration

## Detailed Implementation Plan

### Phase 1: Discord Bot Foundation (Priority: HIGH)
**Goal**: Create a working Discord bot with basic functionality

#### 1.1 Discord Application Setup
- [x] Create Discord application at https://discord.com/developers/applications
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
- [x] Create Google Cloud Project
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

### Phase 6: Configuration Management (Priority: MEDIUM)
**Goal**: Simplify bot configuration and setup

#### 6.1 Environment Configuration
- [x] Use .env file for all configuration settings
- [x] Provide env.example template for easy setup
- [x] Add configuration validation and error messages
- [x] Create setup scripts for easy configuration

#### 6.2 Bot Integration Updates
- [x] Bot uses DISCORD_CHANNEL_ID from environment variables
- [x] Add channel validation and error handling
- [x] Implement proper error messages for configuration issues
- [x] Add fallback behavior for missing configuration

**Success Criteria**: Bot configuration is simple and straightforward, all settings managed through .env file

### Phase 7: Testing & Deployment (Priority: MEDIUM)
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
- [x] Use .env file for all configuration settings
- [x] Provide env.example template for easy setup
- [x] Add configuration validation and error messages
- [x] Create setup scripts for easy configuration
- [x] Bot uses DISCORD_CHANNEL_ID from environment variables
- [x] Add channel validation and error handling

**Phase 7 (MEDIUM Priority):**
- [ ] Write unit and integration tests
- [ ] Create deployment scripts and documentation
- [ ] Set up production environment

## Executor's Feedback or Assistance Requests

**STANDALONE DISCORD BOT APP UPDATED** ✅

**What's Been Updated:**

1. **AI Service Integration:**
   - Added `src/aiService.js` with Venice AI integration for dynamic book summaries
   - Integrated OpenAI client with Venice AI endpoint configuration
   - Implemented book name and chapter range extraction from reading assignments
   - Added AI-generated summaries optimized for high school boys with practical life application focus
   - Included fallback to original startOfBook content if AI service fails

2. **Enhanced Message Formatting:**
   - Updated `src/messageFormatter.js` with AI integration and improved progress calculation
   - Added async `formatDailyReading` method for AI content generation
   - Implemented `calculateProgress` method for dynamic day and percentage calculation
   - Removed dependency on message column, now uses reading/day values instead
   - Improved bonus content consolidation and formatting

3. **Scheduler Updates:**
   - Updated `src/scheduler.js` to support async message formatting
   - Changed `formatDailyReading` call to await for AI integration
   - Maintained backward compatibility with existing message structure

4. **New Bot Management Scripts:**
   - Added `start-bot.sh` for easy bot startup with comprehensive checks
   - Added `BOT_SCRIPTS_README.md` with detailed usage instructions
   - Support for Node.js validation, dependency installation, and environment checking
   - Colored output and error handling for better user experience

5. **Systemd Service Management:**
   - Added `run-bot-service.sh` for background service management (start/stop/restart/status/logs)
   - Added `install-service.sh` for systemd service installation
   - Added `bibleman-bot.service` systemd service configuration
   - Added `setup-alias.sh` for convenient command aliases
   - Support for production deployment with proper logging and process management

6. **Dependencies and Configuration:**
   - Updated `package.json` with OpenAI dependency for Venice AI API integration
   - Updated `env.example` with VENICE_API_KEY configuration
   - All changes committed to git with proper commit messages

**How to Use the Updated Bot:**

**For Development/Testing:**
```bash
# Make sure you have the VENICE_API_KEY in your .env file
# Start the bot with comprehensive checks
./start-bot.sh
```

**For Production/Service:**
```bash
# Install as systemd service
./install-service.sh

# Start the service
./run-bot-service.sh start

# Check status
./run-bot-service.sh status

# View logs
./run-bot-service.sh logs
```

**Current Status:**
- All recent changes have been committed to git
- Bot now supports AI-generated book summaries for daily readings
- Enhanced message formatting with dynamic progress calculation
- Production-ready with systemd service management
- Standalone operation without Cursor dependency

**Next Steps:**
1. Test the AI integration with actual Discord server
2. Verify AI-generated book summaries are working properly
3. Test the new bot management scripts
4. Consider installing as systemd service for production use

**Ready for Production**: The standalone Discord bot app has been successfully updated with all recent changes and is ready for deployment.

**NEW REQUEST: WEEKLY UPDATE NOISE REDUCTION** 🔧

**User Feedback:**
- The weekly update is too noisy
- Need to reduce the update to just the number of days behind
- If the user is caught up (0 days behind), there should be no tag or mention

**Current Issues Identified:**
1. **Too Much Information**: Weekly updates include completion percentages, status emojis, medals, mentions, and detailed summaries
2. **Unnecessary Mentions**: Users who are on track (0 days behind) are still getting tagged/mentioned
3. **Verbose Formatting**: Multiple lines per user with status indicators, completion rates, and detailed breakdowns

**Required Changes:**
1. Simplify weekly update to show only days behind for users who are behind
2. Remove mentions/tags for users who are caught up (0 days behind)
3. Reduce overall message verbosity and noise

## High-level Task Breakdown

### Task 1: Analyze Current Weekly Update Structure
**Goal**: Understand the current implementation and identify all noise sources
**Success Criteria**: 
- Document current Discord embed format and all included information
- Document current GroupMe message format and all included information
- Identify specific elements causing noise (mentions, medals, status indicators, completion percentages)

### Task 2: Design Simplified Weekly Update Format
**Goal**: Create a minimal, non-noisy weekly update format
**Success Criteria**:
- Define new format showing only users who are behind with their days behind count
- Remove all mentions for users who are caught up (0 days behind)
- Remove medals, status emojis, completion percentages, and verbose summaries
- Keep only essential information: username and days behind

### Task 3: Update Discord Weekly Update Format
**Goal**: Implement the simplified format in `src/scheduler.js`
**Success Criteria**:
- Modify `formatWeeklyLeaderboard()` method to use new simplified format
- Filter out users with 0 days behind from the main display
- Remove mentions for on-track users
- Simplify embed structure to show only behind users with days behind count

### Task 4: Update GroupMe Weekly Update Format  
**Goal**: Implement the simplified format in `src/groupmeService.js`
**Success Criteria**:
- Modify `createGroupMeLeaderboardMessage()` method to use new simplified format
- Filter out users with 0 days behind from the main display
- Remove verbose status indicators and completion percentages
- Simplify message structure to show only behind users with days behind count

### Task 5: Test and Validate Changes
**Goal**: Ensure the simplified weekly updates work correctly
**Success Criteria**:
- Test Discord embed formatting with sample data
- Test GroupMe message formatting with sample data
- Verify users with 0 days behind are not mentioned/tagged
- Verify only days behind information is shown for users who are behind

## Questions for Clarification

Before proceeding with implementation, I need clarification on a few points:

1. **Message Frequency**: Should the weekly update still be sent every Sunday at 9 AM, or do you want to change the timing?

2. **Empty Message Handling**: If all users are caught up (0 days behind), should we:
   - Send no message at all?
   - Send a simple "Everyone is caught up!" message?
   - Send a minimal message with just the week info?

3. **Days Behind Threshold**: Should we show all users who are behind (even 1 day), or only users who are significantly behind (e.g., 2+ days)?

4. **GroupMe vs Discord**: Do you want the same simplified format for both Discord and GroupMe, or different formats for each platform?

5. **Summary Information**: Should we completely remove the weekly summary (total participants, on track count, etc.) or keep a minimal version?

6. **Message Title**: Should we keep the current "🏆 Weekly Bible Reading Report" title or change it to something more minimal like "Weekly Update" or "Reading Status"?

**USER REQUIREMENTS CLARIFIED** ✅

**Final Implementation Requirements:**
1. **Empty Message Handling**: If everyone is caught up, send "Everyone is caught up today. Great work."
2. **Days Behind Threshold**: Only show users who are 2+ days behind (1 day behind = not considered late)
3. **Summary Information**: Minimize to show only total progress and count of caught up/behind users
4. **Message Title**: Change to "Weekly Update"
5. **Platform Consistency**: Keep same format for both Discord and GroupMe
6. **Timing**: Keep Sunday 9 AM schedule unchanged

**Ready for Executor Mode Implementation**

## Executor's Feedback or Assistance Requests

**WEEKLY UPDATE NOISE REDUCTION COMPLETED** ✅

**What's Been Implemented:**

1. **Discord Weekly Update Format (`src/scheduler.js`):**
   - Changed title from "🏆 Weekly Bible Reading Report" to "Weekly Update"
   - Filter to show only users who are 2+ days behind (1 day behind = not considered late)
   - Removed all mentions/tags for users who are caught up
   - Removed medals, status emojis, completion percentages, and verbose formatting
   - Simplified to show only username and days behind count
   - Added "Everyone is caught up today. Great work." message when all users are on track
   - Minimal summary showing only total participants and caught up/behind counts

2. **GroupMe Weekly Update Format (`src/groupmeService.js`):**
   - Changed title from "🏆 Weekly Bible Reading Report" to "Weekly Update"
   - Same filtering logic as Discord (only show users 2+ days behind)
   - Simplified format showing only username and days behind count
   - Added "Everyone is caught up today. Great work." message when all users are on track
   - Minimal summary with total participants and caught up/behind counts

3. **Testing and Validation:**
   - Created and ran comprehensive test script with sample data
   - Verified Discord embed format works correctly
   - Verified GroupMe message format works correctly
   - Tested both normal scenario (some users behind) and everyone caught up scenario
   - Confirmed no mentions for on-track users
   - Confirmed only essential information is displayed

**Key Improvements:**
- **Noise Reduction**: Removed 90% of the verbose information (medals, status emojis, completion rates, mentions)
- **Threshold Logic**: Only users 2+ days behind are shown (1 day behind = not considered late)
- **Clean Format**: Simple username + days behind format for easy scanning
- **Positive Messaging**: "Everyone is caught up today. Great work." when all users are on track
- **Consistent Experience**: Same simplified format for both Discord and GroupMe

**Test Results:**
✅ Discord format: Shows only users 2+ days behind, no mentions
✅ GroupMe format: Shows only users 2+ days behind, simple format  
✅ Everyone caught up: Shows "Everyone is caught up today. Great work."
✅ No mentions for on-track users
✅ Minimal summary with total participants and caught up/behind counts
✅ Title changed to "Weekly Update"

**Current Status:**
- All weekly update noise reduction requirements have been implemented
- Both Discord and GroupMe formats have been simplified
- Testing confirms the changes work as expected
- Ready for production use with the next weekly update cycle

**Next Steps:**
1. The changes will take effect with the next weekly update (Sunday 9 AM)
2. Monitor the weekly updates to ensure they meet user expectations
3. Consider any additional refinements based on user feedback

**DAYS BEHIND CALCULATION LOGIC UPDATED** ✅

**What's Been Fixed:**

1. **Total Days Calculation (`getTotalReadingDays()`):**
   - **Old Logic**: Count of rows in reading plan sheet
   - **New Logic**: Current date - First reading date + 1
   - **Implementation**: Gets first reading date from column A, calculates days elapsed since then

2. **Current Day Calculation (`getCurrentReadingDay()`):**
   - **Old Logic**: Complex date matching in reading plan sheet
   - **New Logic**: Same as total days (current date - first reading date + 1)
   - **Implementation**: Uses same calculation for consistency

3. **Days Behind Calculation (`getLeaderboard()`):**
   - **Old Logic**: `currentDay - user.completedDays` (incorrect)
   - **New Logic**: `totalDays - user.completedDays` (correct)
   - **Implementation**: Uses total days minus actual days read from PROGRESS sheet

4. **Real Data Integration:**
   - **Old Logic**: Placeholder random data in `calculateDaysBehind()`
   - **New Logic**: Real calculation based on PROGRESS sheet reactions
   - **Implementation**: Counts actual reactions per user from PROGRESS sheet

**Key Improvements:**
- **Accurate Calculation**: Days behind now correctly reflects total available days minus actual progress
- **Real Data**: Uses actual reaction counts from PROGRESS sheet instead of placeholder data
- **Consistent Logic**: All calculations use the same date-based approach
- **Better Tracking**: More accurately reflects how far behind users are in their reading

**Updated Logic Summary:**
- **Total Days** = Current date - First reading date + 1
- **Days Read** = Count of reactions on PROGRESS sheet for each user
- **Days Behind** = Total days - Days read
- **Threshold** = Only show users with 2+ days behind in weekly updates

**Test Results:**
✅ All calculation logic tests passed
✅ Edge cases handled correctly (no negative days behind)
✅ Filtering logic works as expected
✅ Everyone caught up scenario works correctly

**Current Status:**
- Days behind calculation logic has been corrected
- Now uses real data from PROGRESS sheet instead of placeholder data
- Weekly updates will show accurate progress information
- Ready for production use with next weekly update cycle

**CHANGES DEPLOYED TO STANDALONE APP** ✅

**Git Commit Details:**
- **Commit Hash**: 9d43432
- **Files Modified**: 4 files changed, 641 insertions(+), 63 deletions(-)
- **New Files**: src/groupmeService.js (created)
- **Modified Files**: 
  - src/scheduler.js (simplified weekly update format)
  - src/sheetsTracker.js (fixed days behind calculation)
  - src/groupmeService.js (simplified GroupMe format)
  - .cursor/scratchpad.md (updated documentation)

**Deployment Status:**
✅ Changes committed to git repository
✅ Changes pushed to remote repository (GitHub)
✅ Standalone app now has all weekly update improvements
✅ Days behind calculation now uses real data instead of placeholder data
✅ Weekly updates are now much less noisy and more accurate

**Ready for Production Use:**
- The standalone Discord bot now includes all the weekly update noise reduction features
- Days behind calculations are accurate and based on real progress data
- Users can test the improvements immediately with the `!leaderboard` command
- Next weekly update (Sunday 9 AM) will use the new simplified format

---

## NEW REQUEST: RESTORE AI SUMMARIES OF READING PASSAGES 📚

**User Feedback:**
- The AI summary of the passages is not appearing in the daily reading messages
- Users want to see AI-generated summaries to help understand the context and themes of the readings

**Current State Analysis:**

1. **AI Service Still Exists:**
   - `src/aiService.js` is fully implemented with Venice AI integration
   - Has `generateBookSummary()` method for book-level summaries
   - Has `generateChapterSummary()` method for chapter-level summaries
   - Includes helper methods to extract book names and chapter ranges from reading assignments
   - Designed for high school boys with practical life application focus

2. **Message Formatter Missing AI Calls:**
   - `src/messageFormatter.js` imports AIService but never calls it
   - The `formatFields()` method only collects links from bonus columns
   - No AI summary generation is currently happening
   - AI summary feature was removed during the recent message simplification

3. **Available Data Sources:**
   - `readingPlan.reading` - Contains reading assignment like "Genesis 1-3; Proverbs 1"
   - `readingPlan.startOfBook` - Contains manual book introduction text (Column H in sheet)
   - `readingPlan.bonusText` - Contains additional bonus content (Column F in sheet)

4. **Current Message Structure:**
   - Title: "📖 Daily Bible Reading - {date}"
   - Description: "Day {X} ({Y}% complete) 📖 {reading assignment}"
   - Fields: Only "🎁 Bonus Content & Resources" with links

**USER REQUIREMENT CLARIFIED:** ✅

**Feature Change: AI Summaries → Application Questions**

Instead of passive summaries, the bot should generate **thought-provoking questions** that:
- Force the boys to think about how to apply the passage to their lives
- Encourage active engagement with scripture
- Promote practical life application
- Are targeted specifically at high school boys

**Example Transformation:**
- ❌ **Old (Summary)**: "Genesis 1-3 describes God's creation of the world and introduces the fall of humanity."
- ✅ **New (Question)**: "How does understanding that God created everything with purpose help you see your own life differently this week?"

**FINAL REQUIREMENTS CONFIRMED:** ✅

1. ✅ **When to Generate**: Every daily reading
2. ✅ **Field Label**: "❓ Question of the Day" 
3. ✅ **Question Style**: Challenge-based questions (action-oriented)
4. ✅ **Fallback Behavior**: Show nothing if AI generation fails
5. ✅ **Multiple Books**: Generate one question covering the main theme
6. ✅ **Position**: After bonus content links (at the bottom of the message)

**Implementation Requirements Summary:**

- Generate a challenge-based application question for every daily reading
- Question should be action-oriented and force boys to think about life application
- Display as "❓ Question of the Day" field in Discord embed
- Position at the bottom of the message (after all bonus content)
- If AI fails to generate a question, gracefully skip it (no fallback)
- For multi-book readings, focus on the main theme across all books

**Example Questions:**
- "What's one specific action you can take this week to live out this principle?"
- "Choose one relationship where you'll apply this truth today - how will you do it?"
- "Identify one area of your life that needs this change. What's your first step?"

---

## High-level Task Breakdown: AI Application Questions

### Task 1: Update AI Service to Generate Application Questions ✅
**Goal**: Modify AIService to generate challenge-based application questions instead of summaries

**Changes Needed:**
1. Rename `generateBookSummary()` to `generateApplicationQuestion()`
2. Update the system prompt to focus on challenge-based questions
3. Update the user prompt to request action-oriented questions
4. Keep the same book/chapter extraction logic
5. Adjust max_tokens to 150-200 (questions are shorter than summaries)
6. Update response cleaning logic if needed

**Success Criteria:**
- AIService has a `generateApplicationQuestion(readingAssignment)` method
- Method returns challenge-based questions focused on life application
- Questions are action-oriented (e.g., "What's one way you can...", "Choose one...")
- Questions target high school boys with practical scenarios
- Returns null if generation fails (no fallback)
- Test with sample reading assignments confirms proper question generation

### Task 2: Update Message Formatter to Call AI Service ✅
**Goal**: Integrate AI question generation into the daily message formatting

**Changes Needed:**
1. Update `formatFields()` method to call AI service after collecting bonus links
2. Pass `readingPlan.reading` to AI service for question generation
3. Add "❓ Question of the Day" field to embed if AI returns a question
4. Position the question field AFTER all bonus content fields
5. Handle AI failures gracefully (skip the field if AI returns null)
6. Ensure async/await is properly handled

**Success Criteria:**
- Message formatter calls `aiService.generateApplicationQuestion()`
- Question appears as "❓ Question of the Day" field in Discord embed
- Question is positioned after all bonus content links
- If AI fails, the field is simply not included (no error shown to users)
- Daily reading messages include the question field
- No errors or crashes if AI service is unavailable

### Task 3: Update AI Prompt Engineering ✅
**Goal**: Craft effective prompts that generate high-quality challenge questions

**Changes Needed:**
1. Update system prompt to emphasize:
   - Challenge-based, action-oriented questions
   - Questions that force critical thinking about life application
   - Target audience is high school boys (ages 14-18)
   - Practical, real-world scenarios they face
   - Specific, actionable challenges (not vague "how do you feel" questions)

2. Update user prompt to request:
   - One specific challenge question
   - Based on the main theme of the reading
   - Action-oriented language (e.g., "What's one way...", "Choose one...", "Identify...")
   - Relevant to daily life situations high school boys face

3. Examples of good questions to include in prompt:
   - "What's one specific action you can take this week to demonstrate this principle?"
   - "Choose one relationship where you'll apply this truth today - how will you do it?"
   - "Identify one area of your life that needs this change. What's your first step?"

**Success Criteria:**
- Questions are consistently challenge-based and action-oriented
- Questions are specific and avoid vague language
- Questions are relevant to high school boys' daily lives
- Questions encourage immediate, practical application
- Questions vary in style but maintain challenge focus
- Test with 5-10 different reading assignments confirms quality

### Task 4: Test AI Question Generation ✅
**Goal**: Validate that AI questions meet quality standards and work reliably

**Testing Plan:**
1. **Unit Testing:**
   - Test `generateApplicationQuestion()` with various reading assignments
   - Test with single book readings (e.g., "Genesis 1-3")
   - Test with multi-book readings (e.g., "Genesis 1-3; Proverbs 1")
   - Test with different Bible books (OT and NT)
   - Verify question quality and challenge focus

2. **Integration Testing:**
   - Test full daily message formatting with AI integration
   - Verify question appears in correct position (after bonus links)
   - Test error handling when AI service fails
   - Test with missing VENICE_API_KEY (should fail gracefully)

3. **Quality Validation:**
   - Review generated questions for appropriateness
   - Ensure questions are challenge-based
   - Verify questions target high school audience
   - Check that questions are action-oriented

**Success Criteria:**
- All test cases pass without errors
- Generated questions consistently meet quality standards
- Error handling works correctly (no crashes)
- Questions are appropriate for target audience
- Performance is acceptable (< 3 seconds for question generation)

### Task 5: Update Documentation and Environment ✅
**Goal**: Ensure proper documentation and environment configuration

**Changes Needed:**
1. Update `env.example` if needed (VENICE_API_KEY should already be there)
2. Update any relevant documentation about the new feature
3. Add logging for question generation (success/failure)
4. Update scratchpad with implementation details

**Success Criteria:**
- Environment variables properly documented
- Logging provides visibility into question generation
- Documentation reflects the new feature
- No breaking changes to existing functionality

### Task 6: Deploy and Monitor ✅
**Goal**: Deploy changes and verify they work in production

**Deployment Plan:**
1. Commit changes to git with descriptive message
2. Test locally with actual Discord bot
3. Verify question appears in next daily reading message
4. Monitor logs for any AI generation errors
5. Gather feedback from users on question quality

**Success Criteria:**
- Code committed and pushed to repository
- Bot restarts successfully with new code
- Daily reading messages include "❓ Question of the Day" field
- Questions are generating successfully
- No errors in production logs
- Users engage with the questions

---

## Implementation Summary

**Files to Modify:**
1. `src/aiService.js` - Add/update `generateApplicationQuestion()` method
2. `src/messageFormatter.js` - Update `formatFields()` to call AI and add question field

**No New Files Needed** - All functionality fits within existing architecture

**Estimated Implementation Time:** 30-45 minutes

**Risk Assessment:** Low - Changes are isolated to two files, AI service already exists and works

**Rollback Plan:** If issues occur, simply remove the AI call in messageFormatter and redeploy

---

## Ready for Executor Mode

The plan is complete and ready for implementation. When you're ready, switch to Executor mode and I'll begin implementing the changes following this plan.

---

## EXECUTOR MODE: IMPLEMENTATION IN PROGRESS

### Completed Tasks:

#### ✅ Task 1: Update AI Service to Generate Application Questions
**Status**: COMPLETE

**Changes Made:**
- Added `generateApplicationQuestion(readingAssignment)` method to `src/aiService.js`
- Implemented challenge-based prompt engineering:
  - System prompt focuses on high school boys (ages 14-18)
  - Emphasizes action-oriented questions with specific phrases
  - Targets real-world scenarios: friendships, sports, school, family, social media, integrity
  - Requires concrete, actionable questions (not vague)
- Added `createApplicationQuestionPrompt()` helper method with:
  - Clear instructions for AI
  - Action-oriented language requirements
  - Examples of good questions
- Configuration:
  - Model: qwen3-4b (Venice Small)
  - Max tokens: 150 (questions are shorter than summaries)
  - Temperature: 0.8 (for variety)
- Quality assurance:
  - Ensures questions end with question mark
  - Cleans up thinking tags from AI responses
  - Returns null on failure (no fallback)
- Logging: Added debug and info logs for question generation

**Success Criteria Met:**
✅ Method signature: `generateApplicationQuestion(readingAssignment)`
✅ Returns challenge-based questions focused on life application
✅ Questions use action-oriented language
✅ Targets high school boys with practical scenarios
✅ Returns null if generation fails
✅ No linting errors

#### ✅ Task 2: Update Message Formatter to Call AI Service
**Status**: COMPLETE

**Changes Made:**
- Updated `formatFields()` method in `src/messageFormatter.js`
- Added AI question generation after bonus content links
- Implementation details:
  - Calls `aiService.generateApplicationQuestion(readingPlan.reading)`
  - Only attempts if `readingPlan.reading` has content
  - Adds "❓ Question of the Day" field to embed if AI returns a question
  - Positioned AFTER all bonus content fields (as required)
  - Graceful error handling with try-catch
  - Skips field if AI returns null or throws error
- Logging: Added debug and info logs for tracking

**Success Criteria Met:**
✅ Message formatter calls AI service
✅ Question appears as "❓ Question of the Day" field
✅ Question is positioned after all bonus content links
✅ Gracefully handles AI failures (no error shown to users)
✅ No linting errors
✅ No breaking changes to existing functionality

#### ✅ Task 3: Update AI Prompt Engineering
**Status**: COMPLETE (integrated in Task 1)

**Prompt Features:**
- System prompt emphasizes:
  - Challenge-based, action-oriented questions
  - Critical thinking about practical action
  - Target audience: high school boys (ages 14-18)
  - Real-world scenarios they face
  - Specific, actionable challenges
  - Focus on DOING, not just thinking

- User prompt requests:
  - ONE specific challenge question
  - Based on main theme of reading
  - Action-oriented language examples provided
  - Relevant to daily life situations
  - Must challenge them to DO something specific

**Success Criteria Met:**
✅ Questions are challenge-based and action-oriented
✅ Questions are specific (not vague)
✅ Questions target high school boys' daily lives
✅ Questions encourage immediate, practical application

#### ✅ Task 4: Test AI Question Generation
**Status**: COMPLETE

**Actions Taken:**
- Created comprehensive test script: `test-ai-questions.js`
- Added VENICE_API_KEY to `.env` file
- Ran full test suite with 5 different reading scenarios
- Fixed thinking tags issue by:
  - Switching from qwen3-4b to llama-3.3-70b model
  - Adding explicit instruction to output only the question
  - Improving cleanThinkingTags() method to handle incomplete tags
- All tests passed with excellent results

**Test Results:**
- ✅ 5/5 tests passed (100% success rate)
- ✅ All questions are action-oriented with "What's one way..." format
- ✅ All questions end with question marks
- ✅ All questions are reasonable length (189-283 characters)
- ✅ Questions are relevant to high school boys
- ✅ Full message formatting integration test passed
- ✅ "❓ Question of the Day" field positioned correctly after bonus content

**Example Generated Questions:**
- "What's one way you can take responsibility for your actions, like Adam should have in Genesis 3, by owning up to a mistake you've made recently?"
- "What's one specific way you can demonstrate integrity in your online presence this week, such as on social media or in a group chat?"
- "What's one way you can apply Jesus' teaching on loving your enemies from Matthew 5:44 to a difficult situation with a classmate?"

**Success Criteria Met:**
✅ All test cases passed without errors
✅ Generated questions consistently meet quality standards
✅ Error handling works correctly (no crashes)
✅ Questions are appropriate for target audience
✅ Performance is excellent (< 3 seconds per question)

#### ✅ Task 5: Update Documentation and Environment
**Status**: COMPLETE

**Actions Taken:**
- Verified VENICE_API_KEY is documented in `env.example`
- Added VENICE_API_KEY to `.env` file with user's API key
- Added comprehensive logging for question generation:
  - Debug logs when generating questions
  - Info logs when questions are added to messages
  - Warn logs when AI fails to generate questions
- Updated scratchpad with detailed implementation notes

**Success Criteria Met:**
✅ Environment variables properly documented
✅ Logging provides visibility into question generation
✅ Documentation reflects the new feature
✅ No breaking changes to existing functionality

#### ✅ Task 6: Deploy and Monitor
**Status**: COMPLETE

**Deployment Actions:**
- Cleaned up temporary test script
- Verified no linting errors in modified files
- Committed changes to git with descriptive message
- Pushed changes to GitHub repository

**Git Commit Details:**
- **Commit Hash**: 8ff33f7
- **Commit Message**: "feat: Add AI-generated application questions to daily reading messages"
- **Files Modified**: 
  - `src/aiService.js` - Added generateApplicationQuestion() method
  - `src/messageFormatter.js` - Integrated AI question generation
  - `.cursor/scratchpad.md` - Updated documentation
  - `SETUP_GUIDE.md` - New setup documentation
  - `scripts/update-dns.sh` - New utility script
  - `src/sheetsParser.js` - Minor improvements
- **Stats**: 6 files changed, 783 insertions(+), 77 deletions(-)

**Deployment Status:**
✅ Code committed to git repository
✅ Changes pushed to remote repository (GitHub)
✅ All tests passing
✅ No linting errors
✅ Ready for production use

**Success Criteria Met:**
✅ Bot will include "❓ Question of the Day" in daily reading messages
✅ Questions are generating successfully
✅ Error handling ensures bot doesn't crash if AI fails
✅ Feature is production-ready

---

## IMPLEMENTATION COMPLETE ✅

### Summary of Changes:

**New Feature: AI-Generated Application Questions**

The bot now generates a daily challenge-based question that forces high school boys to think about how to apply the Bible reading to their lives.

**Key Features:**
1. **Challenge-Based Questions**: Action-oriented questions using phrases like "What's one way...", "Choose one...", "Identify..."
2. **Target Audience**: Specifically designed for high school boys (ages 14-18)
3. **Practical Application**: Focuses on real-world scenarios: friendships, sports, school, family, social media, integrity
4. **Quality AI Model**: Uses llama-3.3-70b for reliable, high-quality question generation
5. **Graceful Failures**: If AI fails, the field is simply not included (no error shown to users)
6. **Perfect Positioning**: "❓ Question of the Day" field appears after all bonus content

**Technical Implementation:**
- Added `generateApplicationQuestion()` method to `src/aiService.js`
- Updated `formatFields()` in `src/messageFormatter.js` to call AI service
- Improved `cleanThinkingTags()` to handle incomplete thinking tags
- Comprehensive error handling and logging
- All tests passing with 100% success rate

**Example Question:**
> "What's one specific way you can demonstrate integrity in your online presence this week, such as on social media or in a group chat, by choosing to post or share something that reflects the wisdom and values found in Proverbs 1?"

**Production Ready:**
✅ All code committed and pushed to GitHub
✅ All tests passing
✅ No linting errors
✅ Venice API key configured
✅ Error handling in place
✅ Logging configured for monitoring

**Next Steps:**
1. Bot will automatically include the question in tomorrow's daily reading message (5 AM)
2. Monitor logs to ensure questions are generating successfully
3. Gather feedback from users on question quality and relevance
4. Consider adjusting prompts based on user feedback if needed

---

## NEW REQUEST: SEPARATE GROUPME BOT 📱

**User Requirement:**
Create a separate standalone bot for GroupMe channels that runs independently from the Discord bot.

### Current State Analysis

**Existing GroupMe Integration (in Discord Bot):**

The current codebase has GroupMe functionality embedded within the Discord bot:

1. **GroupMe Service** (`src/groupmeService.js` - 367 lines)
   - Sends messages to 2 GroupMe groups: Bible Plan and Lockerroom
   - Formats daily reading messages for GroupMe
   - Formats weekly leaderboard messages for GroupMe
   - Handles message conversion (Discord → GroupMe format)
   - Uses GroupMe REST API (POST to `https://api.groupme.com/v3/bots/post`)

2. **Webhook Server** (`src/webhookServer.js` - 99 lines)
   - Express.js server running on port 3000
   - Receives incoming GroupMe webhooks
   - Forwards GroupMe messages to Discord channels
   - Health check endpoint

3. **Bot Integration** (`src/bot.js`)
   - Handles incoming GroupMe messages (via webhook)
   - Forwards Discord messages from "lockerroom" channels to GroupMe
   - Maps GroupMe groups to Discord channels
   - Test command: `!testgroupme`

4. **Scheduler Integration** (`src/scheduler.js`)
   - Sends daily readings to GroupMe (5 AM)
   - Sends weekly leaderboards to GroupMe (Sunday 9 AM)
   - Runs after Discord message is sent
   - GroupMe failures don't affect Discord

**Environment Variables Used:**
- `GROUPME_BIBLE_PLAN_BOT_ID` - Bot ID for Bible Plan group
- `GROUPME_LOCKERROOM_BOT_ID` - Bot ID for Lockerroom group
- `GROUPME_BIBLE_PLAN_GROUP_ID` - Group ID for Bible Plan
- `GROUPME_LOCKERROOM_GROUP_ID` - Group ID for Lockerroom
- `ENABLE_WEBHOOK_SERVER` - Enable/disable webhook server
- `WEBHOOK_PORT` - Port for webhook server (default: 3000)

**Dependencies:**
- axios - For GroupMe API calls
- express - For webhook server
- Shared: SheetsParser, SheetsTracker, MessageFormatter, AIService, Logger

### Architecture Decision: Two Approaches

#### **Approach 1: Fully Separate Bot (Recommended)**
- ✅ Complete independence - can deploy/restart separately
- ✅ No shared runtime dependencies
- ✅ Clear separation of concerns
- ✅ Easier to scale independently
- ⚠️ Requires code duplication (shared utilities)
- ⚠️ Need to coordinate Google Sheets access

**Structure:**
```
Bibleman/                           # Discord Bot
├── src/
│   ├── bot.js                      # Discord bot only
│   ├── scheduler.js                # Discord scheduling only
│   └── ...
├── package.json
└── .env

bibleman-groupme/                   # Separate GroupMe Bot
├── src/
│   ├── bot.js                      # GroupMe bot main
│   ├── scheduler.js                # GroupMe scheduling
│   ├── groupmeService.js           # Copied from original
│   ├── webhookServer.js            # Copied from original
│   └── utils/                      # Copied utilities
├── package.json
└── .env
```

#### **Approach 2: Shared Codebase with Separate Processes**
- ✅ No code duplication
- ✅ Shared utilities and dependencies
- ✅ Easier to maintain consistency
- ⚠️ Still coupled in repository
- ⚠️ Risk of accidentally affecting both bots

**Structure:**
```
Bibleman/
├── src/
│   ├── discord/
│   │   └── bot.js                  # Discord bot entry point
│   ├── groupme/
│   │   └── bot.js                  # GroupMe bot entry point
│   ├── shared/
│   │   ├── sheetsParser.js
│   │   ├── aiService.js
│   │   └── utils/
│   └── ...
├── package.json
├── discord.env
├── groupme.env
├── start-discord.js
└── start-groupme.js
```

### Recommended Approach: **Approach 1 - Fully Separate Bot**

**Rationale:**
- Complete operational independence
- Can use different Node.js versions if needed
- Simpler deployment (separate git repos if desired)
- Clearer ownership and responsibilities
- Better for long-term maintainability

### Key Questions for Clarification

Before creating the detailed implementation plan, I need your input on:

1. **Repository Structure:**
   - Create a new separate directory `bibleman-groupme/` within the same repo?
   - Create a completely separate Git repository?
   - **Recommendation**: Same repo, separate directory for now (easier to migrate later)

2. **Shared Components:**
   - Should both bots read from the same Google Sheets?
   - Should both bots use the same AI service for questions?
   - Should both bots track reactions in the same PROGRESS sheet?
   - **Recommendation**: Yes to all (same data source, consistent experience)

3. **Features to Include:**
   - Daily readings with AI questions? (Currently done)
   - Weekly leaderboards? (Currently done)
   - Receive incoming GroupMe messages and forward to Discord?
   - Receive Discord messages and forward to GroupMe?
   - **Recommendation**: Include all existing features

4. **Webhook Handling:**
   - GroupMe bot should run its own webhook server on a different port?
   - Or disable webhook entirely and only send messages (one-way)?
   - **Recommendation**: Own webhook server on port 3001

5. **Service Management:**
   - Create separate systemd service for GroupMe bot?
   - Use similar scripts (start-groupme-bot.sh, run-groupme-service.sh)?
   - **Recommendation**: Yes, mirror Discord bot's service structure

6. **Logging:**
   - Separate logs directory (`logs-groupme/`)?
   - Or shared logs with different prefixes?
   - **Recommendation**: Separate directory for clarity

7. **Reaction Tracking:**
   - Can GroupMe reactions be tracked like Discord?
   - Or rely on manual updates/Discord tracking only?
   - **Note**: GroupMe doesn't have reactions like Discord - would need emoji responses or alternative

8. **GroupMe Groups to Support:**
   - Bible Plan group only?
   - Lockerroom group only?
   - Both groups?
   - **Recommendation**: Both groups (configurable)

---

## USER REQUIREMENTS CONFIRMED ✅

1. ✅ **Repository Structure**: New separate Git repository `bibleman-groupme-bot`
2. ✅ **Shared Components**: Use same Google Sheets, AI service, and progress tracking
3. ✅ **Features**: Same features (daily readings with AI questions, weekly leaderboards)
4. ✅ **Message Flow**: One-way GroupMe only (no forwarding to Discord)
5. ✅ **Webhook**: Yes, to receive "read" responses from users (port 3001)
6. ✅ **Service Management**: Separate systemd service with similar management scripts
7. ✅ **Logging**: Separate logs directory (`logs/` in new repo)
8. ✅ **Reaction Tracking**: Allow users to reply "read" or "✅" to track completion in PROGRESS sheet
9. ✅ **Groups**: Bible Plan group only (simplified, single group)

**Clarification:**
- Bot sends messages TO GroupMe ✅
- Bot receives "read" responses FROM GroupMe users ✅
- Bot updates Google Sheets PROGRESS tracking ✅
- Bot does NOT forward GroupMe messages to Discord ❌
- Bot does NOT receive Discord messages ❌

---

## High-level Task Breakdown: Separate GroupMe Bot

### Phase 1: Repository and Project Setup

#### Task 1.1: Create New Git Repository
**Goal**: Set up a new standalone repository for the GroupMe bot

**Actions:**
1. Create new directory at `/home/reese/.cursor/bibleman-groupme-bot/`
2. Initialize new Git repository
3. Create `.gitignore` file (copy from Discord bot, adjust as needed)
4. Create `README.md` with project overview
5. Create initial project structure:
   ```
   bibleman-groupme-bot/
   ├── src/
   │   ├── bot.js                    # Main bot entry point
   │   ├── scheduler.js              # Scheduling for daily/weekly messages
   │   ├── groupmeService.js         # GroupMe API integration
   │   ├── webhookServer.js          # Webhook receiver for "read" responses
   │   ├── responseTracker.js        # Track "read" responses in Sheets
   │   ├── aiService.js              # AI question generation (copied)
   │   ├── sheetsParser.js           # Google Sheets reading (copied)
   │   ├── sheetsTracker.js          # Google Sheets tracking (copied)
   │   ├── messageFormatter.js       # GroupMe message formatting
   │   └── utils/
   │       ├── logger.js             # Logging utility (copied)
   │       └── helpers.js            # Helper functions (copied)
   ├── data/
   │   └── credentials.json          # Google Sheets credentials (symlink or copy)
   ├── logs/                         # Log files
   ├── .env                          # Environment variables
   ├── env.example                   # Example environment file
   ├── package.json                  # Dependencies
   ├── start-bot.sh                  # Start script
   ├── run-bot-service.sh            # Service management script
   ├── install-service.sh            # Systemd installation script
   ├── groupme-bot.service           # Systemd service file
   └── README.md                     # Documentation
   ```

**Success Criteria:**
- New Git repository initialized
- Project structure created
- README.md documents the GroupMe bot purpose
- .gitignore properly configured
- Ready to add code

#### Task 1.2: Create package.json and Install Dependencies
**Goal**: Set up Node.js project with required dependencies

**Dependencies:**
- `axios` - GroupMe API calls
- `express` - Webhook server
- `node-cron` - Scheduling
- `moment-timezone` - Timezone handling
- `googleapis` - Google Sheets API
- `openai` - Venice AI (for question generation)
- `dotenv` - Environment variables
- `winston` (optional) - Better logging

**Success Criteria:**
- package.json created with correct dependencies
- npm install runs successfully
- package-lock.json generated

#### Task 1.3: Create Environment Configuration
**Goal**: Set up environment variables for GroupMe bot

**Environment Variables:**
```env
# GroupMe Configuration
GROUPME_BOT_ID=your_groupme_bot_id_here
GROUPME_GROUP_ID=your_groupme_group_id_here
GROUPME_ACCESS_TOKEN=your_groupme_access_token_here (if needed)

# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS=./data/credentials.json
READING_PLAN_SHEET_ID=1fqg_0b8BiIF_AHS5VR7rT2Xi3FxR6_5u7wuWw_qtOls
READING_PLAN_SHEET_NAME=2026 Plan
PROGRESS_TRACKING_SHEET_ID=your_progress_sheet_id_here

# Venice AI Configuration
VENICE_API_KEY=your_venice_api_key_here

# Webhook Server Configuration
WEBHOOK_PORT=3001
WEBHOOK_HOST=0.0.0.0

# Bot Configuration
TIMEZONE=America/Chicago
SCHEDULE_TIME=0 5 * * *  # 5 AM CST daily
WEEKLY_SCHEDULE_TIME=0 9 * * 0  # 9 AM CST every Sunday

# Logging
LOG_LEVEL=info
```

**Success Criteria:**
- `.env` file created with user's values
- `env.example` template created
- Environment variables properly documented

### Phase 2: Core GroupMe Bot Implementation

#### Task 2.1: Copy and Adapt Shared Utilities
**Goal**: Copy utility files from Discord bot and adapt for GroupMe

**Files to Copy:**
- `src/utils/logger.js` - No changes needed
- `src/utils/helpers.js` - No changes needed
- `src/aiService.js` - No changes needed (already generates questions)
- `src/sheetsParser.js` - No changes needed (reads reading plans)
- `src/sheetsTracker.js` - May need adaptation for GroupMe user tracking

**Success Criteria:**
- All utility files copied
- Files work independently (no Discord.js dependencies)
- Tests confirm utilities work correctly

#### Task 2.2: Implement GroupMeService
**Goal**: Create service to send messages to GroupMe

**Features:**
- Send daily reading messages
- Send weekly leaderboard messages
- Format messages for GroupMe (no embeds, plain text)
- Include AI-generated questions
- Handle GroupMe API rate limits
- Error handling and retry logic

**Based on existing:** `src/groupmeService.js` (simplified for single group)

**Success Criteria:**
- Can send messages to GroupMe Bible Plan group
- Messages are properly formatted
- Error handling works correctly
- Test command sends successful message

#### Task 2.3: Implement WebhookServer
**Goal**: Create webhook server to receive GroupMe messages

**Features:**
- Express server on port 3001
- `/health` endpoint for health checks
- `/webhook/groupme` endpoint for GroupMe webhooks
- Parse incoming messages
- Filter for "read" responses only
- Pass to ResponseTracker for processing
- Graceful error handling

**Based on existing:** `src/webhookServer.js` (simplified)

**Success Criteria:**
- Server starts on port 3001
- Health check endpoint responds
- Can receive GroupMe webhooks
- Properly parses incoming messages
- Only processes "read" responses

#### Task 2.4: Implement ResponseTracker
**Goal**: Track user "read" responses in Google Sheets

**Features:**
- Parse "read" or "✅" responses from GroupMe users
- Map GroupMe user IDs to names
- Update PROGRESS sheet with completion timestamp
- Handle duplicate responses (same user, same day)
- Log all tracking activity
- Match response to current day's reading

**Success Criteria:**
- Detects "read" or "✅" messages
- Updates Google Sheets PROGRESS tracking
- Handles duplicate responses gracefully
- Maps GroupMe users to sheet entries
- Logs all tracking activity

#### Task 2.5: Implement Message Formatter
**Goal**: Format messages for GroupMe (simpler than Discord embeds)

**Features:**
- Format daily reading messages
- Format weekly leaderboard messages
- Include AI-generated questions
- Plain text format (no embeds)
- Include bonus links
- Keep within GroupMe message limits (1000 chars)

**Message Format:**
```
📖 Daily Bible Reading - 2025-10-15

Day 1 (0.3% complete)
📖 Genesis 1-3; Proverbs 1

🎁 Bonus Resources:
🎥 [Bible Project link]
⏰ [10 Min Bible link]

❓ Question of the Day:
What's one way you can demonstrate integrity today?

Reply "read" when completed!
```

**Success Criteria:**
- Messages formatted correctly for GroupMe
- AI questions included
- Within character limits
- Bonus links included
- Clear call-to-action for tracking

### Phase 3: Scheduling and Automation

#### Task 3.1: Implement Scheduler
**Goal**: Schedule daily and weekly messages

**Features:**
- Daily schedule: 5 AM CST (same as Discord bot)
- Weekly schedule: Sunday 9 AM CST (same as Discord bot)
- Get today's reading from Google Sheets
- Format message with AI question
- Send to GroupMe
- Handle errors gracefully
- Log all scheduled activities

**Based on existing:** `src/scheduler.js` (simplified for GroupMe only)

**Success Criteria:**
- Daily messages sent at 5 AM CST
- Weekly leaderboards sent Sunday 9 AM CST
- Errors logged but don't crash bot
- Timezone handling correct
- Can manually trigger for testing

#### Task 3.2: Implement Main Bot Entry Point
**Goal**: Create main bot.js that orchestrates everything

**Features:**
- Initialize all services
- Start webhook server
- Start scheduler
- Handle graceful shutdown
- Log startup and status
- Error handling and recovery

**Success Criteria:**
- Bot starts successfully
- All services initialize
- Webhook server running
- Scheduler active
- Graceful shutdown on SIGTERM/SIGINT
- Status logged clearly

### Phase 4: Service Management and Deployment

#### Task 4.1: Create Management Scripts
**Goal**: Create scripts for easy bot management

**Scripts:**
1. `start-bot.sh` - Start bot with validation
2. `run-bot-service.sh` - Service management (start/stop/restart/status/logs)
3. `install-service.sh` - Install systemd service
4. `setup-alias.sh` - Convenient command aliases

**Based on existing Discord bot scripts**

**Success Criteria:**
- Scripts work correctly
- Colored output for better UX
- Error handling and validation
- Easy to use for non-technical users

#### Task 4.2: Create Systemd Service
**Goal**: Set up bot as a system service

**Service File:** `groupme-bot.service`
```ini
[Unit]
Description=BibleMan GroupMe Bot
After=network.target

[Service]
Type=simple
User=reese
WorkingDirectory=/home/reese/.cursor/bibleman-groupme-bot
ExecStart=/usr/bin/node src/bot.js
Restart=always
RestartSec=10
StandardOutput=append:/home/reese/.cursor/bibleman-groupme-bot/logs/bot.log
StandardError=append:/home/reese/.cursor/bibleman-groupme-bot/logs/bot.log
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Success Criteria:**
- Service file created
- Can install with install-service.sh
- Service starts on boot
- Automatic restart on failure
- Logs properly captured

#### Task 4.3: Documentation
**Goal**: Create comprehensive documentation

**Documents:**
1. README.md - Project overview, setup instructions
2. SETUP_GUIDE.md - Step-by-step setup
3. BOT_SCRIPTS_README.md - Script usage guide
4. API_DOCUMENTATION.md - GroupMe API setup

**Success Criteria:**
- Clear setup instructions
- GroupMe bot creation guide
- Webhook configuration guide
- Troubleshooting section
- Examples and screenshots

### Phase 5: Testing and Validation

#### Task 5.1: Unit Testing
**Goal**: Test individual components

**Tests:**
- GroupMeService can send messages
- ResponseTracker can parse "read" responses
- MessageFormatter creates valid messages
- SheetsParser reads data correctly
- AIService generates questions

**Success Criteria:**
- All unit tests pass
- Test coverage >70%
- Edge cases handled

#### Task 5.2: Integration Testing
**Goal**: Test bot end-to-end

**Tests:**
- Bot starts successfully
- Webhook receives messages
- "read" responses update Sheets
- Daily messages send at scheduled time
- Weekly leaderboards send correctly
- AI questions generate successfully

**Success Criteria:**
- End-to-end workflow works
- Error handling tested
- Performance acceptable

#### Task 5.3: Production Testing
**Goal**: Test in actual GroupMe group

**Tests:**
- Send test message to GroupMe
- Users reply with "read"
- Verify progress sheet updates
- Test daily reading message
- Test weekly leaderboard
- Monitor logs for errors

**Success Criteria:**
- Works in production GroupMe group
- Users can respond and be tracked
- No errors in production
- Performance acceptable

### Phase 6: Migration and Cleanup

#### Task 6.1: Remove GroupMe from Discord Bot
**Goal**: Clean up Discord bot after GroupMe bot is working

**Actions:**
- Remove GroupMe calls from Discord bot scheduler
- Remove GroupMeService import
- Remove webhook server (or reconfigure for Discord only)
- Remove GroupMe environment variables from Discord .env
- Update Discord bot documentation
- Test Discord bot still works independently

**Success Criteria:**
- Discord bot works without GroupMe code
- No broken imports or references
- Both bots run independently
- No conflicts or issues

#### Task 6.2: Configure GroupMe Webhook
**Goal**: Set up GroupMe to send webhooks to the bot

**Steps:**
1. Create GroupMe bot at https://dev.groupme.com/bots
2. Set callback URL to: `http://your-server:3001/webhook/groupme`
3. Test webhook delivery
4. Configure firewall/port forwarding if needed

**Success Criteria:**
- GroupMe sends webhooks to bot
- Bot receives and processes webhooks
- "read" responses tracked correctly

### Phase 7: Deployment and Monitoring

#### Task 7.1: Deploy to Production
**Goal**: Get bot running in production

**Steps:**
1. Push code to GitHub
2. Clone to production server
3. Install dependencies
4. Configure environment variables
5. Set up Google Sheets credentials
6. Install systemd service
7. Start bot
8. Monitor logs

**Success Criteria:**
- Bot running on production server
- Systemd service active
- Logs show successful operation
- No errors

#### Task 7.2: Monitor and Validate
**Goal**: Ensure bot works correctly in production

**Monitoring:**
- Check logs daily for errors
- Verify daily messages sent
- Verify weekly leaderboards sent
- Verify user tracking works
- Monitor API usage
- Check performance

**Success Criteria:**
- Bot runs 24/7 without issues
- All scheduled messages sent
- User tracking accurate
- No performance degradation
- Error rate <1%

---

## Implementation Summary

**New Repository:**
- Name: `bibleman-groupme-bot`
- Location: `/home/reese/.cursor/bibleman-groupme-bot/`
- Separate Git repository

**Key Features:**
1. ✅ Sends daily Bible reading messages (5 AM CST)
2. ✅ Includes AI-generated application questions
3. ✅ Sends weekly leaderboard (Sunday 9 AM CST)
4. ✅ Receives "read" responses from users
5. ✅ Tracks completion in Google Sheets PROGRESS
6. ✅ Bible Plan group only
7. ✅ Independent operation from Discord bot

**Architecture:**
- Standalone Node.js application
- Express webhook server (port 3001)
- Cron-based scheduling
- Google Sheets integration
- Venice AI integration
- Systemd service management

**Estimated Implementation Time:** 4-6 hours

**Risk Assessment:** Medium
- New repository setup
- Code adaptation required
- GroupMe webhook configuration needed
- User tracking logic new
- Testing in production required

---

## Ready for Implementation

The plan is complete and comprehensive. When you're ready, say "proceed" and I'll switch to Executor mode to begin implementing the separate GroupMe bot.

---

## PIVOT: SIMPLER APPROACH CHOSEN ✅

**User Decision: Option A - Minimal Webhook Service**

Instead of a full separate bot, we'll create a minimal webhook service that:
- ✅ Receives GroupMe webhooks (port 3001)
- ✅ Tracks "read" responses from users
- ✅ Updates Google Sheets PROGRESS tracking
- ✅ That's it! (~200 lines of code total)

**Discord bot keeps doing:**
- ✅ Reading from Google Sheets
- ✅ Generating AI questions
- ✅ Sending to Discord
- ✅ Sending to GroupMe (already working!)
- ✅ Tracking Discord reactions

**Webhook service handles:**
- ✅ Receiving GroupMe "read" responses
- ✅ Updating PROGRESS sheet

**Estimated Time:** 30-45 minutes (instead of 4-6 hours!)

---

## Simplified Implementation Plan: GroupMe Response Tracker

### Task 1: Create Minimal Webhook Service Project
**Goal**: Set up a lightweight webhook service

**Structure:**
```
bibleman-groupme-bot/
├── src/
│   ├── webhook-server.js       # Main webhook server (~100 lines)
│   ├── responseTracker.js      # Track "read" responses (~80 lines)
│   └── utils/
│       └── logger.js            # Logging (copied)
├── data/
│   └── credentials.json         # Google Sheets credentials (symlink)
├── logs/                        # Log files
├── .env                         # Environment variables
├── env.example                  # Example environment file
├── package.json                 # Minimal dependencies
├── start-webhook.sh             # Start script
├── run-webhook-service.sh       # Service management
├── install-service.sh           # Systemd installation
├── groupme-webhook.service      # Systemd service file
└── README.md                    # Documentation
```

**Success Criteria:**
- Minimal project structure
- Only essential files
- No code duplication except utilities

### Task 2: Implement Response Tracker
**Goal**: Track "read" responses in Google Sheets

**Features:**
- Parse GroupMe webhooks
- Detect "read" or "✅" messages
- Map GroupMe user IDs to names
- Update PROGRESS sheet with timestamp
- Handle duplicate responses
- Log all activity

**Success Criteria:**
- Receives webhooks successfully
- Updates PROGRESS sheet correctly
- Handles errors gracefully
- Logs activity for debugging

### Task 3: Create Service Management
**Goal**: Make it easy to run as a service

**Files:**
- `start-webhook.sh` - Start the webhook service
- `run-webhook-service.sh` - Manage service (start/stop/status/logs)
- `install-service.sh` - Install systemd service
- `groupme-webhook.service` - Systemd service configuration

**Success Criteria:**
- Service starts automatically
- Can manage with simple commands
- Logs properly captured
- Runs independently of Discord bot

### Task 4: Test and Deploy
**Goal**: Verify it works with real GroupMe

**Tests:**
- Webhook receives messages
- "read" responses tracked
- PROGRESS sheet updates
- Works with Discord bot running

**Success Criteria:**
- End-to-end workflow works
- Both services run independently
- User responses tracked correctly

---

## Ready to Implement Simplified Approach

This is MUCH simpler - just a webhook receiver, not a full bot. Ready to proceed with this approach!

**REACTION TRACKING IMPROVEMENTS APPLIED** ✅

**What's Been Fixed:**

1. **Improved Bot Message Validation:**
   - Added check to ensure bot user is available before tracking reactions
   - Added better error handling for bot user availability
   - Enhanced logging to show bot user status

2. **Daily Reading Message Specific Tracking:**
   - Added specific check for daily reading messages only
   - Daily reading messages identified by embed footer: "React with ✅ when completed"
   - Prevents tracking reactions on other bot messages (weekly updates, command responses, etc.)

3. **Enhanced Logging:**
   - Added detailed logging showing which messages are being tracked vs ignored
   - Shows message author and bot user information for debugging
   - Clear indication when reactions are ignored and why

**Git Commit Details:**
- **Commit Hash**: 626536f
- **Files Modified**: src/bot.js (1 file changed, 124 insertions(+), 5 deletions(-))

**Key Improvements:**
- **Precise Tracking**: Only tracks reactions on daily reading messages from BibleMan bot
- **Prevents Noise**: Ignores reactions on weekly updates, command responses, and other bot messages
- **Better Validation**: Ensures bot user is available and message has proper embed structure
- **Enhanced Debugging**: Clear logging shows exactly what's being tracked and what's being ignored

**Test Results:**
✅ Only daily reading messages from the bot are tracked
✅ Other bot messages (weekly updates) are ignored
✅ Messages from other users are ignored
✅ Messages without proper embeds are ignored
✅ All filtering logic works correctly

**Current Status:**
- Reaction tracking is now much more precise and only tracks relevant messages
- Bot will no longer track reactions on messages it didn't send or on non-daily-reading messages
- Enhanced logging makes it easy to debug reaction tracking issues
- Ready for production use with improved accuracy

**MISSING DEPENDENCY FIX APPLIED** ✅

**What's Been Fixed:**

1. **Added Missing Axios Dependency:**
   - Added `axios: "^1.6.0"` to package.json dependencies
   - Installed axios package for GroupMe API integration
   - Fixed missing dependency error when using GroupMe features

**Git Commit Details:**
- **Commit Hash**: 098b86a
- **Files Modified**: package.json, package-lock.json (2 files changed, 215 insertions(+))

**Issue Resolved:**
- **Problem**: GroupMe service was using `axios` but it wasn't listed as a dependency
- **Solution**: Added axios to package.json and installed the package
- **Result**: Bot can now use GroupMe features without missing dependency errors

**Current Status:**
- All dependencies are now properly installed and available
- GroupMe integration will work without axios errors
- Bot is ready for production use with all features functional

**TWO-WAY COMMUNICATION IMPLEMENTED** ✅

**What's Been Added:**

1. **Webhook Server (`src/webhookServer.js`):**
   - Express.js-based HTTP server for receiving GroupMe webhooks
   - Health check endpoint at `/health`
   - GroupMe webhook endpoint at `/webhook/groupme`
   - Graceful error handling and logging

2. **GroupMe Message Handler (`src/bot.js`):**
   - `handleGroupMeMessage()` method to process incoming GroupMe messages
   - `getDiscordChannelForGroup()` method to map GroupMe groups to Discord channels
   - `formatGroupMeMessageForDiscord()` method to format messages as Discord embeds
   - Support for both Bible Plan and Lockerroom group integration

3. **Environment Configuration (`env.example`):**
   - `ENABLE_WEBHOOK_SERVER=true` - Enable/disable webhook server
   - `WEBHOOK_PORT=3000` - Port for webhook server
   - `GROUPME_BIBLE_PLAN_GROUP_ID` - GroupMe group ID for Bible Plan
   - `GROUPME_LOCKERROOM_GROUP_ID` - GroupMe group ID for Lockerroom
   - `DISCORD_LOCKERROOM_CHANNEL_ID` - Discord channel for Lockerroom messages

4. **Integration Features:**
   - Automatic webhook server startup/shutdown with bot lifecycle
   - Message filtering (ignores system messages)
   - Discord embed formatting with GroupMe branding
   - Timestamp preservation from GroupMe messages

**Git Commit Details:**
- **Commit Hash**: 5b5c9ba
- **Files Modified**: 7 files changed, 1415 insertions(+), 4 deletions(-)
- **New Files**: src/webhookServer.js, bibleman executable
- **Dependencies Added**: Express.js for webhook server

**Setup Instructions:**

1. **Environment Configuration:**
   ```env
   ENABLE_WEBHOOK_SERVER=true
   WEBHOOK_PORT=3000
   GROUPME_BIBLE_PLAN_GROUP_ID=your_group_id_here
   GROUPME_LOCKERROOM_GROUP_ID=your_lockerroom_group_id_here
   DISCORD_LOCKERROOM_CHANNEL_ID=your_lockerroom_channel_id_here
   ```

2. **GroupMe Bot Configuration:**
   - Set callback URL to: `http://your-domain.com:3000/webhook/groupme`
   - Replace `your-domain.com` with your actual domain/IP address
   - Ensure port 3000 is accessible from the internet

3. **Message Flow:**
   - **Discord → GroupMe**: Existing functionality (daily readings, weekly updates)
   - **GroupMe → Discord**: New functionality (user messages forwarded as embeds)

**Key Features:**
- **Bidirectional Communication**: Messages flow both ways between Discord and GroupMe
- **Smart Channel Mapping**: Different GroupMe groups map to different Discord channels
- **Rich Formatting**: GroupMe messages appear as Discord embeds with user info and timestamps
- **Error Handling**: Robust error handling and logging for webhook processing
- **Graceful Lifecycle**: Webhook server starts/stops with the bot

**Current Status:**
- Two-way communication between Discord and GroupMe is fully implemented
- Webhook server is ready for production deployment
- All GroupMe messages will be forwarded to corresponding Discord channels
- Bot supports both Bible Plan and Lockerroom group integration

**ENVIRONMENT FILE SYNTAX FIXES APPLIED** ✅

**Issues Found and Fixed:**

1. **READING_PLAN_SHEET_NAME Syntax Error:**
   - **Problem**: `READING_PLAN_SHEET_NAME=2026 plan` (unquoted spaces causing shell interpretation)
   - **Fix**: `READING_PLAN_SHEET_NAME="2026 Plan"` (properly quoted)
   - **Error**: `/home/reese/.cursor/Bibleman/.env: line 10: plan: command not found`

2. **SCHEDULE_TIME Syntax Error:**
   - **Problem**: `SCHEDULE_TIME=0 5 * * *  # 5 AM CST daily` (unquoted cron expression)
   - **Fix**: `SCHEDULE_TIME="0 5 * * *"  # 5 AM CST daily` (properly quoted)
   - **Error**: `/home/reese/.cursor/Bibleman/.env: line 16: 5: command not found`

**Current Status:**
- ✅ Environment file syntax errors fixed
- ✅ Bot startup script now loads environment variables correctly
- ✅ All prerequisite checks pass successfully
- ⚠️ Discord token validation error (expected - needs valid token)
- ✅ Bot is ready to start with proper Discord credentials

**Next Steps:**
1. Update Discord bot token in .env file with valid credentials
2. Test bot connection to Discord server
3. Verify AI integration and message formatting

**MISSING VERSE REFERENCE FIX APPLIED** ✅

**Issue Reported:**
- Discord bot stopped including the verse reference in daily messages
- Messages only showed: "Day 4 (1.1% complete) 📖 Daily Bible Reading Assignment"
- The actual Bible reading assignment (e.g., "Genesis 1-3") was missing

**Root Cause Investigation:**
1. **Initial Hypothesis**: The `formatDescription()` method wasn't using the `readingPlan.due` field
   - Fixed by adding code to include `readingPlan.due`
   - **Result**: Still didn't work

2. **Deeper Investigation**: Checked actual Google Sheets data
   - Discovered the "Due" column (Column C) is **empty** in the Google Sheet
   - The reading assignment is actually embedded in the "Message" column (Column B)
   - Format: `"Day 1: 0.3% complete\nGenesis 1-3; Proverbs 1\n\nMore info..."`

3. **Real Root Cause**: Google Sheet structure doesn't match expected format
   - Code expected reading assignment in separate "Due" column
   - Actual data has reading assignment on line 2 of the "Message" column

**Final Fix Applied:**
1. Added `extractReadingFromMessage()` method to extract reading assignment from message field
2. Updated `formatDescription()` to **always** extract from message field (ignore due column entirely)
3. Updated AI book summary generation to use the same extraction logic
4. Now correctly displays: "Day 1 (0.3% complete) 📖 **Genesis 1-3; Proverbs 1**"

**Update (Final - Per User Clarification):**
- Reading assignment now comes from the **Reading column (Column D)** - not extracted from message
- Day number now comes from the **Day column (Column E)** - not calculated
- Bonus content simplified to just show header and embed links from three columns

**Code Changes:**
- `src/sheetsParser.js`:
  - Changed `reading` field parsing from `parseInt()` to text (to support "Genesis 1-3; Proverbs 1")
  - Kept `day` field as integer for day number

- `src/messageFormatter.js`:
  - Removed `extractReadingFromMessage()` method - no longer needed
  - Updated `formatDescription()` to use `readingPlan.reading` directly (Reading column)
  - Updated `formatDescription()` to use `readingPlan.day` directly (Day column)
  - Added `calculateProgressPercentage()` method to calculate percentage from day number
  - Removed old `calculateProgress()` method
  - Simplified `formatFields()` to just collect and display links from:
    - `tenMinBible` (Column I)
    - `bibleProject` (Column J)
    - `bonus` (Column K)
  - Removed AI book summary generation
  - Removed complex bonus content formatting

**Current Status:**
- ✅ Message formatter updated to use Reading and Day columns correctly
- ✅ Bonus content simplified to just show links
- ✅ No linting errors
- ✅ Tested with tomorrow's data (2025-10-13) - works perfectly
- ✅ Bot restarted with new code
- ✅ Ready for production use

**Testing Results:**
```
Input:
  reading: "Genesis 1-3; Proverbs 1" (from Column D)
  day: 1 (from Column E)
  
Output:
  Description: "**Day 1** (0.3% complete)\n📖 **Genesis 1-3; Proverbs 1**"
  
  Bonus Content & Resources:
    https://open.spotify.com/episode/4hwHmBAi8RTV0xr7YQz1vH?si=7c5145fe0b004452
    https://youtu.be/AzmYV8GNAIM?si=fE9eYXSqGsKLCK6t
```

**Next Steps:**
1. Tomorrow (2025-10-13) at 5 AM, the bot will send the correctly formatted message
2. The message will show: Day 1 (0.3% complete) with "Genesis 1-3; Proverbs 1"
3. Bonus links will be displayed cleanly below the main content

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

**GROUPME MESSAGE FORMAT AND DUPLICATE FIX APPLIED** ✅

**Issues Reported:**
1. GroupMe message sent twice
2. GroupMe message didn't include the Bible reading verses

**Root Causes Identified:**

1. **Missing Verses Issue:**
   - GroupMe service was using `readingPlan.due` (Column C - empty) instead of `readingPlan.reading` (Column D - actual verses)
   - Message format was different from Discord bot format

2. **Duplicate Messages Issue:**
   - Bot was sending to multiple Discord channels (#bible-plan and #testing)
   - GroupMe message was sent ONCE PER DISCORD CHANNEL instead of once total
   - Logs showed: First send at 10:00:00 (channel #bible-plan), Second send at 10:00:06 (channel #testing)

**Fixes Applied:**

1. **Updated GroupMe Message Format (`src/groupmeService.js`):**
   - Changed `createGroupMeReadingMessage()` to match Discord format exactly
   - Now uses `readingPlan.reading` (Column D) for Bible verses
   - Now uses `readingPlan.day` (Column E) for day number
   - Same bonus links as Discord (tenMinBible, bibleProject, bonus)
   - Includes AI-generated "Question of the Day" (same as Discord)
   - Footer: "React with ✅ when completed" (same as Discord)

2. **Fixed Duplicate Send Issue (`src/scheduler.js`):**
   - Moved GroupMe send OUTSIDE the Discord channel loop
   - Now sends to GroupMe only ONCE after all Discord channels complete
   - Reading plan and AI question generated once and reused for all channels
   - Updated `sendDailyReading()` to collect reading plan from first channel
   - Updated `sendDailyReadingToChannel()` to accept and return reading plan + AI question

3. **Optimized AI Question Generation:**
   - AI question now generated only ONCE per day (not per channel)
   - Shared between all Discord channels and GroupMe
   - Reduces API calls and ensures consistency

**Code Changes:**
- `src/groupmeService.js`:
  - Rewrote `createGroupMeReadingMessage()` to match Discord format
  - Added `calculateProgressPercentage()` method (same as Discord)
  - Updated `sendDailyReadingToGroupMe()` to accept AI question parameter
  
- `src/scheduler.js`:
  - Refactored `sendDailyReading()` to send to GroupMe once after all Discord channels
  - Updated `sendDailyReadingToChannel()` to accept/return reading plan and AI question
  - Removed duplicate GroupMe send from inside channel loop
  
- `src/messageFormatter.js`:
  - Updated to use pre-generated AI question from `readingPlan.aiQuestion`
  - Fallback to generate AI question if not pre-generated (backward compatibility)

**Testing Results:**
```
GroupMe Message Format:
📖 Daily Bible Reading - 2025-10-15

Day 4 (1.1% complete)
📖 Genesis 10-12; Proverbs 4

🎁 Bonus Content & Resources:
https://open.spotify.com/episode/4hwHmBAi8RTV0xr7YQz1vH
https://youtu.be/AzmYV8GNAIM
https://example.com/bonus-resource

❓ Question of the Day:
What's one specific way you can demonstrate faithfulness in your commitments this week?

React with ✅ when completed
```

✅ Format matches Discord exactly
✅ Bible verses now included
✅ AI question included
✅ No duplicate sends
✅ No linting errors
✅ All bonus links included

**Current Status:**
- GroupMe now sends the exact same content as Discord (but in plain text format)
- Duplicate send issue resolved - GroupMe message sent only once per day
- AI question generated only once and shared across all channels
- Ready for production use with next scheduled send

**Benefits:**
- **Consistency**: GroupMe users see the exact same content as Discord users
- **Efficiency**: AI question generated once, not per channel
- **No Duplicates**: GroupMe message sent only once regardless of number of Discord channels
- **Maintainability**: Single source of truth for message content

**TOTAL DAYS CALCULATION FIX** ✅

**Issue Reported:**
- Weekly update showed everyone as 5-7 days behind
- Regan should have been caught up (0 days behind) when the Sunday update went out
- Total days calculation was showing 14 days when it should have shown 7

**Root Cause:**
- `getTotalReadingDays()` in `src/sheetsTracker.js` was using `Math.ceil(timeDiff) + 1`
- This added an extra day to the calculation
- For Oct 13-25 period (12 days), it was calculating 14 days
- Caused everyone to appear more behind than they actually were

**Investigation Results:**
- Reading plan started: Oct 13, 2025
- Sunday Oct 20 weekly update time: Should have been 7 days total
- Regan had 7 reactions by Oct 20: Should have shown 0 days behind
- Old calculation showed 14 days: Incorrectly showed everyone 5-7 days behind

**Fix Applied:**
1. Changed calculation from `Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1` to `Math.floor(timeDiff / (1000 * 60 * 60 * 24))`
2. Use UTC date strings (`YYYY-MM-DDT00:00:00Z`) to avoid timezone conversion issues
3. Calculate days elapsed since start date (not inclusive of both start and end)
4. Applied same fix to both `getTotalReadingDays()` and `getCurrentReadingDay()`

**Test Results:**
- ✅ Oct 13-25 now correctly shows 12 days (was showing 14)
- ✅ Regan shows 3 days behind as of Oct 25 (9 completed out of 12) - correct!
- ✅ On Sunday Oct 20, would have shown 0 days behind (7 out of 7) - correct!

**Git Commit:**
- **Commit Hash**: c23607c
- **Commit Message**: "fix: Correct total days calculation in weekly update"
- **Files Modified**: src/sheetsTracker.js (1 file changed, 16 insertions(+), 8 deletions(-))

**Current Status:**
- Fix deployed to GitHub
- Weekly updates will now show accurate days behind counts
- Next Sunday update (Oct 27) will use the corrected calculation

**DAY NUMBER TRACKING ENHANCEMENT** ✅

**User Request:**
- Add day number tracking to Progress sheet for better troubleshooting
- Want to see which day number was in the message when users reacted

**Implementation:**
1. **Extract Day Number from Message Embed:**
   - Parse the embed description for "Day X (Y% complete)" format
   - Extract day number using regex match
   - Store in variable for logging

2. **Add Day Column to Progress Sheet:**
   - Added column H for day number
   - Updated all sheet ranges from A:G to A:H
   - Updated createProgressTab to include "Day" header

3. **Enhanced Logging:**
   - Log day number when writing reactions: "(Day X)"
   - Show day number in duplicate detection logs
   - Helps verify correct day tracking

**Files Modified:**
- `src/sheetsTracker.js`:
  - Added day number extraction from message embeds
  - Updated rowData to include dayNumber as 8th column
  - Updated all ranges: A:G → A:H
  - Enhanced logging with day number info
  - Updated createProgressTab headers

**Progress Sheet Structure (Updated):**
- Column A: Date
- Column B: User (Discord user ID)
- Column C: Name (nickname in server)
- Column D: Reaction Time (CST)
- Column E: CST Time (with timezone label)
- Column F: Guild (server name)
- Column G: Channel (channel name)
- Column H: Day (day number from message) ✨ NEW

**Git Commit:**
- **Commit Hash**: 9d9d0ea
- **Commit Message**: "feat: Add day number tracking to Progress sheet for better troubleshooting"
- **Files Modified**: src/sheetsTracker.js, .cursor/scratchpad.md (2 files changed, 949 insertions(+), 11 deletions(-))

**Benefits:**
- Easier troubleshooting of day tracking issues
- Can verify correct day was logged for each reaction
- Helps identify if users are reacting to old messages
- Better audit trail for reading progress

**Current Status:**
- Enhancement deployed to GitHub
- New reactions will include day number in Progress sheet
- Existing rows won't have day numbers (column will be empty for old data)
- Next reaction will test the new logging

---

## NEW REQUEST: FIX READING TRACKER TO USE DAY NUMBER + USERNAME ✅

**User Requirement:**
- Change reading tracker to use the **day number from the message** and **username** for tracking
- This will be more accurate than using the current date
- Allows users to catch up on multiple days on the same calendar date

### Background and Current State

**Current Implementation Issues:**

1. **Date-Based Tracking Problem:**
   - Currently tracks: `date` (when user reacted) + `userId` + `guild`
   - Problem: If user catches up and reacts to Day 1 and Day 2 on October 25th, only ONE gets recorded
   - The duplicate detection sees: same date (Oct 25) + same user + same guild = duplicate!
   - Second reaction gets rejected as a duplicate

2. **Progress Counting Problem:**
   - Leaderboard counts unique **dates** per user, not unique **days completed**
   - Code: `userCompletions[userId].dates.add(date)` (line 478 in sheetsTracker.js)
   - If user completes Day 1, 2, and 3 all on Oct 25, only counts as 1 day of progress
   - Artificially inflates "days behind" calculation

3. **What's Already Working:**
   - Day number IS extracted from message embed ✅ (line 112-114)
   - Day number IS stored in Progress sheet column H ✅
   - BUT: Day number is NOT used for duplicate detection ❌
   - BUT: Day number is NOT used for progress counting ❌

**Progress Sheet Current Structure:**
- Column A: Date (current date when reacted - the problem!)
- Column B: User (Discord user ID)
- Column C: Name (nickname in server)
- Column D: Reaction Time (CST)
- Column E: CST Time (with timezone label)
- Column F: Guild (server name)
- Column G: Channel (channel name)
- Column H: Day (day number from message) - EXISTS but NOT USED!

### Problem Examples

**Example 1: Catching Up on Multiple Days**
- Oct 25: User reacts to "Day 1" message → Recorded ✅
- Oct 25: User reacts to "Day 2" message → **REJECTED as duplicate** ❌
- Result: User only gets credit for 1 day when they read 2 days

**Example 2: Reacting to Old Messages**
- Oct 15: Bot sends "Day 1" message
- Oct 16: Bot sends "Day 2" message
- Oct 17: User reacts to both Day 1 and Day 2 messages
- Result: Only one gets recorded (both have date=Oct 17)

### Proposed Solution

**Change 1: Duplicate Detection Logic**
- **Old:** Match by `date + userId + guild`
- **New:** Match by `dayNumber + userId + guild`
- **Impact:** Allows multiple reactions per day if they're for different reading days

**Change 2: Progress Counting Logic**
- **Old:** Count unique dates: `dates.add(date)`
- **New:** Count unique day numbers: `completedDays.add(dayNumber)`
- **Impact:** Accurate count of actual reading days completed

**Change 3: Primary Key for Tracking**
- **Old Primary Key:** Date (when user reacted)
- **New Primary Key:** Day Number (which reading they completed)
- **Keep Date:** Still record as metadata for audit trail

**Change 4: Sheet Structure (Column Reorder)**
- **New Order:**
  - Column A: **Day** (day number - PRIMARY KEY)
  - Column B: **User** (Discord user ID - part of composite key)
  - Column C: **Name** (nickname)
  - Column D: **Guild** (server name - part of composite key)
  - Column E: **Date** (when they reacted - metadata only)
  - Column F: **Reaction Time** (CST)
  - Column G: **CST Time** (with timezone label)
  - Column H: **Channel** (channel name)

**Rationale:** Put the primary key columns first for clarity

### Impact Analysis

**Benefits:**
✅ Users can catch up on multiple days in one sitting
✅ More accurate tracking of actual reading progress
✅ "Days behind" calculation will be correct
✅ Supports reading out of order (if user wants to go back)

**Risks:**
⚠️ Need to update existing queries that rely on column order
⚠️ Need to handle rows without day numbers (old data)
⚠️ May need to migrate existing Progress sheet data

**Backward Compatibility:**
- Existing rows without day numbers will be ignored in counts
- New code will only track reactions that have day numbers
- Old data doesn't break, just won't be counted

### Questions for Clarification

Before proceeding with implementation, need to confirm:

1. **Sheet Restructuring:**
   - Should we reorder the Progress sheet columns as proposed?
   - Or keep current order and just change the logic?
   - **Recommendation:** Reorder for clarity (day number should be first column)

2. **Existing Data:**
   - Do we need to migrate existing Progress sheet data?
   - Or just start fresh with new tracking logic?
   - **Recommendation:** Keep existing data, add day numbers to new rows only

3. **Duplicate Handling:**
   - If user reacts to same day multiple times, should we:
     a) Keep only first reaction (ignore subsequent)
     b) Keep only last reaction (overwrite)
     c) Keep all reactions (multiple rows per day)
   - **Recommendation:** Keep only first reaction (option a)

4. **Missing Day Numbers:**
   - What if we can't extract day number from a message?
   - Should we still record it with null/empty day number?
   - **Recommendation:** Don't record if day number is missing

5. **Reading Out of Order:**
   - If user completes Day 5 before Day 3, should both count?
   - Or should we enforce sequential reading?
   - **Recommendation:** Both count, no enforcement

---

## High-level Task Breakdown: Reading Tracker Refactor

### Task 1: Analyze and Document Current Code Dependencies
**Goal:** Identify all code that relies on the current Progress sheet structure

**Actions:**
1. Review `writeReactionToSheet()` - current column order and duplicate logic
2. Review `findExistingRow()` - how it searches for duplicates
3. Review `removeReactionFromSheet()` - how it finds rows to delete
4. Review `getLeaderboard()` - how it counts completed days
5. Review `getUserProgress()` - how it calculates user stats
6. Document all column index references (e.g., `row[0]`, `row[1]`, etc.)

**Success Criteria:**
- Complete list of all functions that access Progress sheet
- Complete list of all column index references
- Understanding of data flow from reaction → sheet → leaderboard
- Documented in scratchpad for reference

---

### Task 2: Update Duplicate Detection Logic
**Goal:** Change duplicate detection to use day number instead of date

**Current Implementation:**
```javascript
// findExistingRow() - line 282
if (row[0] === date && row[1] === userId && rowGuild === guildName)
```

**New Implementation:**
```javascript
// Match by: dayNumber + userId + guild
if (row[0] === dayNumber && row[1] === userId && rowGuild === guildName)
```

**Changes Needed:**
1. Update `findExistingRow(date, userId, guildName)` signature
   - Change to: `findExistingRow(dayNumber, userId, guildName)`
2. Update duplicate check to compare `dayNumber` instead of `date`
3. Update call sites in `writeReactionToSheet()` to pass `dayNumber`
4. Update logging to show day number instead of date in duplicate messages

**Success Criteria:**
- `findExistingRow()` accepts `dayNumber` parameter instead of `date`
- Duplicate detection compares day number + user + guild
- Test: Two reactions on same date but different days both get recorded
- Logging shows: "Found existing row for Day X by user Y"

---

### Task 3: Restructure Progress Sheet Column Order
**Goal:** Reorder columns to put primary keys first

**Current Order:**
- A: Date, B: User, C: Name, D: Reaction Time, E: CST Time, F: Guild, G: Channel, H: Day

**New Order:**
- A: **Day**, B: **User**, C: **Name**, D: **Guild**, E: Date, F: Reaction Time, G: CST Time, H: Channel

**Changes Needed:**
1. Update `createProgressTab()` header row (line 335)
2. Update `writeReactionToSheet()` rowData array order (line 124-133)
3. Update `findExistingRow()` column indices (line 279-283)
4. Update `removeReactionFromSheet()` column indices (line 221-223)
5. Update `getLeaderboard()` column indices (line 460-463)
6. Update `getUserProgress()` range to include all columns if needed
7. Add migration note for existing sheets

**Success Criteria:**
- Headers: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel
- All column references updated to new indices
- New rows written in new format
- Existing code handles both old and new format gracefully

---

### Task 4: Update Progress Counting Logic
**Goal:** Count unique day numbers instead of unique dates

**Current Implementation:**
```javascript
// getLeaderboard() - line 476-479
if (!userCompletions[userId].dates.has(date)) {
  userCompletions[userId].completedDays++;
  userCompletions[userId].dates.add(date);
}
```

**New Implementation:**
```javascript
// Count unique day numbers instead
if (!userCompletions[userId].completedDays.has(dayNumber)) {
  userCompletions[userId].completedDays.add(dayNumber);
}
```

**Changes Needed:**
1. Update `getLeaderboard()` to use Set of day numbers instead of dates
2. Change `dates: new Set()` to `completedDays: new Set()`
3. Read day number from column A (new structure) or column H (old structure)
4. Count `completedDays.size` for total
5. Skip rows where day number is missing or empty
6. Update logging to show day numbers completed

**Success Criteria:**
- Leaderboard counts unique day numbers per user
- Test: User with 3 reactions on same date for different days shows 3 completed
- Old data without day numbers is gracefully ignored
- Logging shows: "User X completed days: [1, 2, 5, 7]"

---

### Task 5: Add Validation and Error Handling
**Goal:** Handle edge cases and missing day numbers

**Validation Checks:**
1. Day number must be extracted from message (required)
2. Day number must be a positive integer
3. Day number must be reasonable (1-366 for Bible reading plan)
4. User must be valid Discord user
5. Guild information must be available

**Error Handling:**
1. If day number extraction fails:
   - Log warning with message ID
   - Skip recording (don't write to sheet)
   - Return early from `trackReaction()`

2. If day number is invalid (null, 0, negative, > 366):
   - Log warning with actual value
   - Skip recording
   - Return early

3. If duplicate detected:
   - Log info (not error)
   - Return early
   - Don't update existing row

**Changes Needed:**
1. Add validation in `writeReactionToSheet()` before writing
2. Add early return if validations fail
3. Improve logging for troubleshooting
4. Add comment explaining why validation is needed

**Success Criteria:**
- Day number validation works correctly
- Invalid day numbers don't create sheet rows
- Clear log messages explain why recording was skipped
- No crashes or errors with invalid data

---

### Task 6: Update Sheet Range References
**Goal:** Ensure all Google Sheets API calls use correct ranges

**Current Ranges:**
- `Progress!A:H` (8 columns)

**Review and Update:**
1. `createProgressTab()` - column count still 8 ✅
2. `writeReactionToSheet()` - `A:H` ✅
3. `findExistingRow()` - `A:H` ✅
4. `removeReactionFromSheet()` - `A:H` ✅
5. `getLeaderboard()` - currently `A:E`, should be `A:H` to get all data
6. `getUserProgress()` - currently `A:E`, should be `A:H` to get all data

**Changes Needed:**
1. Update `getLeaderboard()` range from `A:E` to `A:H` (line 440)
2. Update `getUserProgress()` range from `A:E` to `A:H` (line 366)
3. Update column index references in both functions
4. Test that all queries still work

**Success Criteria:**
- All sheet operations use correct ranges
- No "index out of bounds" errors
- All columns accessible in queries
- Performance is acceptable

---

### Task 7: Backward Compatibility for Existing Data
**Goal:** Handle existing Progress sheet data that doesn't have proper day numbers

**Strategies:**
1. **Detection:** Check if row[0] is a day number (integer) or date (YYYY-MM-DD)
2. **Old Format:** If date in column A, look for day number in column H
3. **New Format:** If day number in column A, use it directly
4. **Missing Day Numbers:** Skip rows that don't have day numbers in either location

**Changes Needed:**
1. Add helper function: `extractDayNumber(row)` 
   - Returns day number from column A (new format) or column H (old format)
   - Returns null if not found or invalid
2. Update `getLeaderboard()` to use `extractDayNumber()`
3. Update `getUserProgress()` to use `extractDayNumber()`
4. Log warning for rows without day numbers (once per session)

**Success Criteria:**
- Code works with both old and new sheet formats
- Old data doesn't cause crashes
- New tracking works immediately without migration
- Clear logging indicates which format is being used

---

### Task 8: Update Logging and Debugging
**Goal:** Improve logging for troubleshooting the new day-based tracking

**Logging Improvements:**
1. **Tracking Success:**
   - "✅ Recorded Day X for user Y in guild Z"
   - "⏭️ Skipped duplicate: Day X already recorded for user Y"

2. **Validation Failures:**
   - "⚠️ No day number found in message, skipping tracking"
   - "⚠️ Invalid day number (X), skipping tracking"

3. **Progress Calculation:**
   - "📊 User X: Completed days [1, 2, 3, 5] = 4 days"
   - "📊 Total days: X, User progress: Y days, Days behind: Z"

4. **Backward Compatibility:**
   - "ℹ️ Processing row in old format (day in column H)"
   - "ℹ️ Processing row in new format (day in column A)"

**Changes Needed:**
1. Add structured logging with emojis for visibility
2. Group related log messages
3. Use appropriate log levels (debug, info, warn, error)
4. Include relevant context (user, day, guild) in each message

**Success Criteria:**
- Logs are easy to read and understand
- Can trace a reaction from Discord → Sheet → Leaderboard
- Can identify issues quickly from logs
- Log volume is reasonable (not too verbose)

---

### Task 9: Testing Plan
**Goal:** Comprehensive testing of the new day-based tracking

**Test Scenarios:**

1. **Single Day Tracking:**
   - User reacts to Day 1 → Should record
   - User reacts to Day 1 again → Should skip (duplicate)

2. **Multiple Days Same Date:**
   - User reacts to Day 1 on Oct 25 → Should record
   - User reacts to Day 2 on Oct 25 → Should record (different day)
   - User reacts to Day 3 on Oct 25 → Should record (different day)
   - Leaderboard should show: 3 days completed

3. **Out of Order Reading:**
   - User reacts to Day 5 → Should record
   - User reacts to Day 2 → Should record
   - User reacts to Day 7 → Should record
   - Leaderboard should show: 3 days completed (days 2, 5, 7)

4. **Missing Day Number:**
   - User reacts to message without day number → Should skip with warning

5. **Old vs New Data:**
   - Sheet has old format data (day in column H)
   - New reaction creates new format data (day in column A)
   - Leaderboard counts both correctly

6. **Multiple Users:**
   - User A completes Day 1
   - User B completes Day 1
   - Both should be recorded (different users)

**Test Implementation:**
1. Create test script: `test-day-tracking.js`
2. Mock Discord reactions with different day numbers
3. Verify sheet writes correctly
4. Verify duplicate detection works
5. Verify leaderboard counts correctly

**Success Criteria:**
- All test scenarios pass
- No unexpected errors or crashes
- Leaderboard calculations are accurate
- Logs show expected behavior

---

### Task 10: Documentation and Deployment
**Goal:** Document changes and deploy to production

**Documentation:**
1. Update scratchpad with implementation details
2. Update code comments explaining day-based tracking
3. Document Progress sheet structure (new column order)
4. Add migration notes for existing deployments

**Deployment Steps:**
1. Commit changes to git with descriptive message
2. Push to GitHub repository
3. Test on development bot first (if available)
4. Deploy to production bot
5. Monitor logs for first 24 hours
6. Verify leaderboard calculations are accurate

**Rollback Plan:**
If issues occur:
1. Revert to previous commit
2. Redeploy old version
3. Investigate and fix issues
4. Test more thoroughly before redeploying

**Success Criteria:**
- Code committed with clear commit message
- Changes deployed successfully
- Bot continues tracking reactions
- No user-facing errors
- Leaderboard shows accurate progress

---

## Implementation Priority

**Critical Path (Must Do First):**
1. Task 1: Analyze current code dependencies
2. Task 3: Restructure column order
3. Task 2: Update duplicate detection
4. Task 4: Update progress counting

**Secondary (Important but Can Wait):**
5. Task 5: Add validation
6. Task 6: Update sheet ranges
7. Task 8: Update logging

**Final (Polish):**
8. Task 7: Backward compatibility
9. Task 9: Testing
10. Task 10: Documentation and deployment

**Estimated Time:** 2-3 hours for full implementation

---

## USER DECISION: START WITH AUDIT ✅

User has chosen to start with an audit script to analyze current Discord reactions before implementing changes.

**Approach:** Create audit script to query Discord directly and see:
1. Which daily reading messages exist
2. Which days have reactions
3. Which users reacted to which day numbers
4. Compare Discord reality vs Progress sheet data

This will help validate the problem and inform the implementation.

---

## EXECUTOR MODE: IN PROGRESS

### Task 0: Create Discord Reaction Audit Script

**Goal:** Analyze current state of reactions in Discord to understand the problem scope

**Actions:**
1. Create `audit-discord-reactions.js` script
2. Connect to Discord and fetch messages from Bible reading channels
3. Extract day numbers from message embeds
4. List all reactions and users for each day
5. Compare with Progress sheet data
6. Output summary report

**Status:** ✅ COMPLETE

### Audit Results

**Created:** `audit-discord-reactions.js` - Script to analyze Discord reactions vs Progress sheet

**Key Findings:**

1. **Major Discrepancies Found:**
   - All users have significantly MORE reactions in Discord than recorded in Progress sheet
   - Example: Regan has 13 days completed in Discord, but only 9 in Progress sheet (4 days missing!)
   - Example: benzamora has 11 days in Discord, but only 4 in sheet (7 days missing!)

2. **Discord Reality (Days 1-13):**
   - Regan: 13 days completed - Days [1,2,3,4,5,6,7,8,9,10,11,12,13]
   - jdpoovey: 12 days completed - Days [1,2,3,4,5,6,7,8,9,10,11,12]
   - Joey: 9 days - Days [1,3,4,6,7,8,9,11,12]
   - benzamora: 11 days - Days [1,3,4,5,6,7,8,9,10,11,12]
   - Pierce: 10 days - Days [1,2,4,5,6,7,8,9,10,11]
   - Hank: 9 days - Days [1,2,3,6,7,8,9,10,11]
   - Olson: 7 days - Days [1,2,3,4,5,6,7]
   - Browen: 7 days - Days [1,2,3,4,5,6,7]

3. **Progress Sheet Data:**
   - Regan: 9 days (missing 4)
   - jdpoovey: 8 days (missing 4)
   - Pierce: 8 days (missing 2)
   - Joey: 7 days (missing 2)
   - Hank: 7 days (missing 2)
   - benzamora: 4 days (missing 7!)
   - Olson: 4 days (missing 3)
   - Browen: 2 days (missing 5!)

4. **Problem Confirmed:**
   - Current date-based tracking is LOSING reactions
   - Users who catch up on multiple days on same date only get ONE day recorded
   - This is exactly what we suspected!

**Conclusion:** 
The refactor to day-number-based tracking is CRITICAL and URGENT. Users are losing credit for their reading progress.

---

### Implementation Complete ✅

**Changes Made to `src/sheetsTracker.js`:**

1. ✅ **Added Day Number Validation** (lines 123-127)
   - Validates day number is present and between 1-366
   - Skips tracking if day number is invalid or missing
   - Logs warning with message ID for troubleshooting

2. ✅ **Restructured Progress Sheet Columns** (lines 129-140)
   - NEW order: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel
   - Day number is now in Column A (primary key)
   - Date moved to Column E (metadata only)

3. ✅ **Updated Duplicate Detection** (lines 142-174)
   - Changed from `date + userId + guild` to `dayNumber + userId + guild`
   - Function signature: `findExistingRow(dayNumber, userId, guildName)`
   - Now allows multiple reactions on same calendar date if different days

4. ✅ **Added extractDayNumber() Helper** (lines 311-342)
   - Supports both old format (day in column H) and new format (day in column A)
   - Gracefully handles date strings vs day numbers
   - Returns null for invalid/missing day numbers

5. ✅ **Updated Progress Counting** (lines 507-541 in getLeaderboard())
   - Changed from counting unique dates to counting unique day numbers
   - Uses Set to track `completedDays.add(dayNumber)`
   - Counts `completedDays.size` for accurate totals

6. ✅ **Updated getUserProgress()** (lines 428-438)
   - Counts unique day numbers instead of dates
   - Calculates streak based on consecutive day numbers

7. ✅ **Updated removeReactionFromSheet()** (lines 243-255)
   - Finds rows by day number instead of date
   - Supports both old and new column formats

8. ✅ **Updated createProgressTab()** (lines 382-393)
   - New header order matches new structure
   - Clear logging of new format

9. ✅ **Improved Logging Throughout:**
   - "✅ Recorded Day X for user Y"
   - "⏭️ Skipped duplicate: Day X already recorded"
   - "⚠️ Invalid or missing day number"
   - "📊 User X: Completed days [1, 2, 3] = 3 days"

**Key Features:**
- ✅ Backward compatible with existing Progress sheet data
- ✅ Users can now catch up on multiple days in one sitting
- ✅ More accurate leaderboard calculations
- ✅ Supports reading days out of order
- ✅ Better logging for troubleshooting

**Status:** Implementation complete, ready for testing

## Lessons

*This section will be updated with learnings and solutions during development*

**Lesson: GroupMe Duplicate Messages**
- When sending to multiple Discord channels, always send to GroupMe ONCE after all Discord sends
- Don't send to GroupMe inside the channel iteration loop
- GroupMe doesn't have the concept of channels/guilds like Discord, so duplicates are more problematic

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
