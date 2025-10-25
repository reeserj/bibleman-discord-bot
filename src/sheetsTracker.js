const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const logger = require('./utils/logger');

class SheetsTracker {
  constructor() {
    this.initialized = false;
    this.sheets = null;
    this.auth = null;
    this.progressSheetId = process.env.PROGRESS_TRACKING_SHEET_ID;
    this.readingPlanSheetId = process.env.READING_PLAN_SHEET_ID;
  }

  async initialize() {
    try {
      // Load credentials
      const credentialsPath = path.join(__dirname, '..', 'data', 'credentials.json');
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Create auth client with write permissions
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/spreadsheets.readonly'
        ]
      });
      
      // Create sheets client
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      this.initialized = true;
      logger.info('SheetsTracker initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SheetsTracker:', error);
      throw error;
    }
  }

  async trackReaction(reaction, user, action) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logger.info(`Tracking reaction: User ${user.tag} ${action}ed ${reaction.emoji.name} on message ${reaction.message.id}`);
      
      // Get current time in CST
      const now = moment().tz('America/Chicago');
      
      const progressData = {
        date: now.format('YYYY-MM-DD'),
        userId: user.id,
        username: user.tag,
        messageId: reaction.message.id,
        reactionEmoji: reaction.emoji.name,
        action: action,
        timestamp: now.format('YYYY-MM-DD HH:mm:ss'),
        cstTime: now.format('YYYY-MM-DD HH:mm:ss CST'),
        reaction: reaction // Pass the full reaction object for guild access
      };

      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));

      // Write to progress tracking sheet
      await this.writeReactionToSheet(progressData);
      logger.debug('Progress data written to sheet:', progressData);
      
    } catch (error) {
      logger.error('Error tracking reaction:', error);
    }
  }

  async writeReactionToSheet(progressData) {
    try {
      // Use the same sheet as the reading plan, but write to a "Progress" tab
      const sheetId = this.readingPlanSheetId; // Use the reading plan sheet ID
      const sheetName = 'Progress'; // Write to a "Progress" tab
      
      logger.debug('Sheet ID:', sheetId);
      logger.debug('Sheet Name:', sheetName);
      
      // Get the user's nickname and server/channel info from the Discord server
      let nickname = progressData.username;
      let guildName = 'Unknown Server';
      let channelName = 'Unknown Channel';
      let dayNumber = null;
      
      try {
        const guild = progressData.reaction.message.guild;
        const channel = progressData.reaction.message.channel;
        
        if (guild) {
          guildName = guild.name;
          const member = await guild.members.fetch(progressData.userId);
          nickname = member.nickname || member.user.username;
        }
        
        if (channel) {
          channelName = channel.name;
        }
        
        // Extract day number from the message embed
        const message = progressData.reaction.message;
        if (message.embeds && message.embeds.length > 0) {
          const embed = message.embeds[0];
          if (embed.description) {
            // Extract day number from "Day X (Y% complete)" format
            const dayMatch = embed.description.match(/Day (\d+)/i);
            if (dayMatch) {
              dayNumber = parseInt(dayMatch[1]);
              logger.debug(`Extracted day number ${dayNumber} from message embed`);
            }
          }
        }
      } catch (error) {
        logger.warn(`Could not fetch server/channel info for user ${progressData.userId}:`, error.message);
      }
      
      // VALIDATION: Day number is required for tracking
      if (!dayNumber || dayNumber < 1 || dayNumber > 366) {
        logger.warn(`⚠️ Invalid or missing day number (${dayNumber}) for message ${progressData.messageId}, skipping tracking`);
        return; // Exit early - don't record reactions without valid day numbers
      }
      
      // NEW STRUCTURE: Put day number first (primary key)
      // Column order: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel
      const rowData = [
        dayNumber,                   // Column A: Day number (PRIMARY KEY)
        progressData.userId,         // Column B: User (Discord user ID)
        nickname,                    // Column C: Name (nickname in server)
        guildName,                   // Column D: Guild (server name)
        progressData.date,           // Column E: Date (when they reacted - metadata)
        progressData.timestamp,      // Column F: Reaction Time (CST)
        progressData.cstTime,        // Column G: CST Time (with timezone label)
        channelName                  // Column H: Channel (channel name)
      ];

      if (progressData.action === 'add') {
        // NEW: Check for duplicate using dayNumber + userId + guild
        for (let attempt = 1; attempt <= 3; attempt++) {
          logger.info(`Duplicate check attempt ${attempt}: Day ${dayNumber}, userId=${progressData.userId}, guild=${guildName}`);
          const existingRow = await this.findExistingRow(dayNumber, progressData.userId, guildName);
          
          if (existingRow) {
            logger.info(`⏭️ Skipped duplicate: Day ${dayNumber} already recorded for ${nickname} in ${guildName}`);
            return; // Exit early to prevent any further processing
          }
          
          if (attempt < 3) {
            const delay = attempt * 100; // 100ms, 200ms delays
            logger.info(`No existing row found on attempt ${attempt}, waiting ${delay}ms before next check...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        logger.info(`No duplicate found after 3 attempts, recording Day ${dayNumber} for ${nickname} in ${guildName}`);
        
        // Append the row to the Progress tab
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${sheetName}!A:H`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [rowData]
          }
        });

        logger.info(`✅ Recorded Day ${dayNumber} for ${nickname} (${progressData.userId}) in ${guildName} on ${progressData.date}`);
      } else if (progressData.action === 'remove') {
        // Remove the row from the Progress tab
        await this.removeReactionFromSheet(progressData);
        logger.info(`Reaction data removed from ${sheetName} tab: ${nickname} (${progressData.userId}) on ${progressData.date}`);
      }
      
    } catch (error) {
      logger.error('Error writing reaction to sheet:', error);
      logger.error('Error details:', error.message);
      logger.error('Error code:', error.code);
      
      // If the Progress tab doesn't exist, create it
      if (error.message && error.message.includes('Unable to parse range')) {
        logger.info('Progress tab not found, creating it...');
        await this.createProgressTab();
        // Try writing again
        await this.writeReactionToSheet(progressData);
      }
    }
  }

  async removeReactionFromSheet(progressData) {
    try {
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      // Extract day number and guild name
      let guildName = 'Unknown Server';
      let dayNumber = null;
      
      try {
        const guild = progressData.reaction.message.guild;
        if (guild) {
          guildName = guild.name;
        }
        
        // Extract day number from message
        const message = progressData.reaction.message;
        if (message.embeds && message.embeds.length > 0) {
          const embed = message.embeds[0];
          if (embed.description) {
            const dayMatch = embed.description.match(/Day (\d+)/i);
            if (dayMatch) {
              dayNumber = parseInt(dayMatch[1]);
            }
          }
        }
      } catch (error) {
        logger.warn(`Could not fetch guild/day info:`, error.message);
      }
      
      // Need day number to find the row
      if (!dayNumber) {
        logger.warn(`Cannot remove reaction: no day number found for message ${progressData.messageId}`);
        return;
      }
      
      // First, get all the data to find the row to delete
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:H`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        logger.warn('No data found in Progress tab to remove');
        return;
      }
      
      // NEW: Find the row that matches this DAY NUMBER + user + guild
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const row = rows[i];
        const rowDay = this.extractDayNumber(row);
        const rowUserId = row[1]; // Column B is user ID
        const rowGuild = row[3] || row[5] || ''; // Column D (new) or F (old) is guild
        
        if (rowDay === dayNumber && rowUserId === progressData.userId && rowGuild === guildName) {
          rowIndex = i + 1; // Convert to 1-based index for sheets
          break;
        }
      }
      
      if (rowIndex === -1) {
        logger.warn(`No matching row found for user ${progressData.userId} on Day ${dayNumber}`);
        return;
      }
      
      // Delete the row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: await this.getSheetId(sheetName),
                  dimension: 'ROWS',
                  startIndex: rowIndex - 1, // Convert to 0-based index
                  endIndex: rowIndex // End index is exclusive
                }
              }
            }
          ]
        }
      });
      
      logger.info(`Row ${rowIndex} deleted from ${sheetName} tab (Day ${dayNumber}, user ${progressData.userId})`);
      
    } catch (error) {
      logger.error('Error removing reaction from sheet:', error);
      logger.error('Error details:', error.message);
    }
  }

  async findExistingRow(dayNumber, userId, guildName) {
    try {
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:H`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return null; // No data or only headers
      }
      
      // NEW: Look for existing row with matching DAY NUMBER + user ID + guild name
      // Column A: Day, Column B: User, Column D: Guild
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const row = rows[i];
        const rowDay = this.extractDayNumber(row); // Extract from either column A (new) or H (old)
        const rowUserId = row[1] || ''; // Column B is user ID
        const rowGuild = row[3] || row[5] || ''; // Column D is guild (new format), or Column F (old format)
        
        // Match on: Day number + User ID + Guild
        if (rowDay === dayNumber && rowUserId === userId && rowGuild === guildName) {
          logger.info(`Found existing row at index ${i + 1}: Day ${rowDay}, userId=${rowUserId}, name=${row[2]}, guild=${rowGuild}`);
          return i + 1; // Return 1-based row index
        }
      }
      
      logger.info(`No existing row found for Day ${dayNumber}, userId=${userId}, guild=${guildName}`);
      return null; // No matching row found
    } catch (error) {
      logger.error('Error finding existing row:', error);
      return null;
    }
  }
  
  /**
   * Helper function to extract day number from a row, supporting both old and new formats
   * New format: Day is in column A (index 0)
   * Old format: Day is in column H (index 7)
   * Returns null if day number not found or invalid
   */
  extractDayNumber(row) {
    if (!row || row.length === 0) {
      return null;
    }
    
    // Try column A first (new format)
    const colA = row[0];
    if (colA && typeof colA === 'number' && colA >= 1 && colA <= 366) {
      logger.debug(`extractDayNumber: Found day ${colA} in column A (new format)`);
      return colA;
    }
    
    // Try parsing column A as string number
    if (colA && typeof colA === 'string' && !colA.includes('-')) {
      const parsed = parseInt(colA);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 366) {
        logger.debug(`extractDayNumber: Parsed day ${parsed} from column A string (new format)`);
        return parsed;
      }
    }
    
    // Fall back to column H (old format) if column A looks like a date
    if (colA && typeof colA === 'string' && colA.includes('-')) {
      const colH = row[7];
      logger.debug(`extractDayNumber: Column A is date "${colA}", checking column H for day number`);
      if (colH) {
        logger.debug(`extractDayNumber: Column H value: "${colH}" (type: ${typeof colH})`);
        const parsed = parseInt(colH);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 366) {
          logger.debug(`extractDayNumber: Extracted day ${parsed} from column H (old format)`);
          return parsed;
        } else {
          logger.debug(`extractDayNumber: Column H parse failed or out of range: ${parsed}`);
        }
      } else {
        logger.debug(`extractDayNumber: Column H is empty`);
      }
    }
    
    logger.debug(`extractDayNumber: Could not extract day number from row`);
    return null;
  }

  async getSheetId(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.readingPlanSheetId
      });
      
      const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
      return sheet ? sheet.properties.sheetId : null;
    } catch (error) {
      logger.error('Error getting sheet ID:', error);
      return null;
    }
  }

  async createProgressTab() {
    try {
      const sheetId = this.readingPlanSheetId;
      
      // Create a new sheet called "Progress"
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Progress',
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 8
                  }
                }
              }
            }
          ]
        }
      });

      // NEW STRUCTURE: Day number first (primary key)
      const headers = ['Day', 'User', 'Name', 'Guild', 'Date', 'Reaction Time (CST)', 'CST Time', 'Channel'];
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Progress!A1:H1',
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      logger.info('Progress tab created successfully with NEW structure: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel');
      
    } catch (error) {
      logger.error('Error creating progress tab:', error);
    }
  }

  async getUserProgress(userId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logger.debug(`Getting progress for user ${userId}`);
      
      // Read from the Progress tab (all columns)
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:H`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        // No data or only headers
        return {
          totalDays: 0,
          completedDays: 0,
          streak: 0,
          completionRate: 0
        };
      }
      
      // NEW: Filter rows for this user and extract unique day numbers
      const completedDays = new Set();
      rows.slice(1).forEach(row => {
        const rowUserId = row[1]; // Column B is user ID
        if (rowUserId === userId) {
          const dayNumber = this.extractDayNumber(row);
          if (dayNumber) {
            completedDays.add(dayNumber);
          }
        }
      });
      
      const totalDays = await this.getTotalReadingDays();
      const completedCount = completedDays.size;
      const completionRate = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;
      
      // Calculate streak (consecutive day numbers)
      let streak = 0;
      const sortedDays = Array.from(completedDays).sort((a, b) => a - b);
      let currentStreak = 0;
      
      for (let i = 0; i < sortedDays.length; i++) {
        if (i === 0 || sortedDays[i] === sortedDays[i-1] + 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        streak = Math.max(streak, currentStreak);
      }
      
      return {
        totalDays,
        completedDays: completedCount,
        streak,
        completionRate: Math.round(completionRate * 10) / 10
      };
    } catch (error) {
      logger.error('Error getting user progress:', error);
      return {
        totalDays: 0,
        completedDays: 0,
        streak: 0,
        completionRate: 0
      };
    }
  }

  isConsecutiveDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }

  async getLeaderboard() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logger.debug('Getting leaderboard from Progress tab');
      
      // Read from the Progress tab (now read all columns A:H)
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:H`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        // No data or only headers, return empty array
        logger.warn('No progress data found in Progress tab');
        return [];
      }
      
      // Get the total days from the reading plan
      const totalDays = await this.getTotalReadingDays();
      const currentDay = await this.getCurrentReadingDay();
      
      logger.debug(`Total reading days: ${totalDays}, Current day: ${currentDay}`);
      
      // NEW: Group by user and count UNIQUE DAY NUMBERS (not dates!)
      const userCompletions = {};
      
      rows.slice(1).forEach(row => {
        // Extract day number from row (supports both old and new format)
        const dayNumber = this.extractDayNumber(row);
        
        // Skip rows without valid day numbers
        if (!dayNumber) {
          return;
        }
        
        // New format: Column B is user ID, Column C is name
        // Old format: Column B is user ID, Column C is name (same positions)
        const userId = row[1];
        const nickname = row[2];
        
        if (!userId) {
          return; // Skip rows without user ID
        }
        
        // Initialize user data if first time seeing this user
        if (!userCompletions[userId]) {
          userCompletions[userId] = {
            userId,
            username: nickname,
            completedDays: new Set() // Use Set to track unique day numbers
          };
        }
        
        // Add day number to the set (automatically handles duplicates)
        userCompletions[userId].completedDays.add(dayNumber);
        
        // Update username if it's more recent/better
        if (nickname && nickname !== userId) {
          userCompletions[userId].username = nickname;
        }
      });
      
      // Convert to leaderboard format
      const leaderboard = Object.values(userCompletions).map(user => {
        const completedCount = user.completedDays.size; // Count of unique days
        const completionRate = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;
        // Days behind = total days - days read
        const daysBehind = Math.max(0, totalDays - completedCount);
        
        // Convert Set to sorted array for logging
        const completedDaysArray = Array.from(user.completedDays).sort((a, b) => a - b);
        
        logger.debug(`📊 User ${user.username}: Completed days [${completedDaysArray.join(', ')}] = ${completedCount} days`);
        
        return {
          userId: user.userId,
          username: user.username,
          completedDays: completedCount,
          totalDays,
          currentDay,
          completionRate: Math.round(completionRate * 10) / 10,
          daysBehind
        };
      });
      
      // Sort by completion rate (highest first)
      leaderboard.sort((a, b) => b.completionRate - a.completionRate);
      
      logger.info(`Found ${leaderboard.length} users in leaderboard`);
      return leaderboard;
      
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getTotalReadingDays() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const sheetId = this.readingPlanSheetId;
      const sheetName = process.env.READING_PLAN_SHEET_NAME || '2026 Plan';
      
      // Read the reading plan sheet to get first reading date
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E` // Date, Message, Due, Reading, Day
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        logger.warn('No reading plan data found');
        return 7; // Fallback to 7 days
      }
      
      // Get first reading date (first row after header)
      const firstReadingDate = rows[1][0]; // First date in column A
      if (!firstReadingDate) {
        logger.warn('No first reading date found');
        return 7; // Fallback to 7 days
      }
      
      // Calculate total days as: days elapsed since start date
      // Convert dates to simple YYYY-MM-DD strings to avoid timezone issues
      const today = new Date().toISOString().split('T')[0];
      
      // Count days from first date to today (inclusive of start, exclusive of today)
      const firstDate = new Date(firstReadingDate + 'T00:00:00Z');
      const currentDate = new Date(today + 'T00:00:00Z');
      const timeDiff = currentDate.getTime() - firstDate.getTime();
      const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      logger.debug(`Total reading days calculated: ${totalDays} (from ${firstReadingDate} to ${currentDate.toISOString().split('T')[0]})`);
      return totalDays;
      
    } catch (error) {
      logger.error('Error getting total reading days:', error);
      return 7; // Fallback to 7 days
    }
  }

  async getCurrentReadingDay() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const sheetId = this.readingPlanSheetId;
      const sheetName = process.env.READING_PLAN_SHEET_NAME || '2026 Plan';
      
      // Read the reading plan sheet to get first reading date
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E` // Date, Message, Due, Reading, Day
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        logger.warn('No reading plan data found');
        return 1; // Fallback to day 1
      }
      
      // Get first reading date (first row after header)
      const firstReadingDate = rows[1][0]; // First date in column A
      if (!firstReadingDate) {
        logger.warn('No first reading date found');
        return 1; // Fallback to day 1
      }
      
      // Calculate current day as: days elapsed since start date
      // Convert dates to simple YYYY-MM-DD strings to avoid timezone issues
      const today = new Date().toISOString().split('T')[0];
      
      // Count days from first date to today (inclusive of start, exclusive of today)
      const firstDate = new Date(firstReadingDate + 'T00:00:00Z');
      const currentDate = new Date(today + 'T00:00:00Z');
      const timeDiff = currentDate.getTime() - firstDate.getTime();
      const currentDay = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      logger.debug(`Current reading day calculated: ${currentDay} (from ${firstReadingDate} to ${currentDate.toISOString().split('T')[0]})`);
      return currentDay;
      
    } catch (error) {
      logger.error('Error getting current reading day:', error);
      return 1; // Fallback to day 1
    }
  }

  async getWeeklyProgress() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logger.debug('Getting weekly progress');
      
      // Get the leaderboard data
      const leaderboardData = await this.getLeaderboard();
      
      // Calculate weekly summary
      const totalParticipants = leaderboardData.length;
      const onTrackCount = leaderboardData.filter(user => user.daysBehind === 0).length;
      const behindCount = leaderboardData.filter(user => user.daysBehind > 0).length;
      
      return {
        users: leaderboardData,
        summary: {
          totalParticipants,
          onTrackCount,
          behindCount
        }
      };
    } catch (error) {
      logger.error('Error getting weekly progress:', error);
      return {
        users: [],
        summary: {
          totalParticipants: 0,
          onTrackCount: 0,
          behindCount: 0
        }
      };
    }
  }

  async calculateDaysBehind(userId, currentDate) {
    try {
      logger.debug(`Calculating days behind for user ${userId} on ${currentDate}`);
      
      // Get the user's progress from the leaderboard
      const leaderboard = await this.getLeaderboard();
      const user = leaderboard.find(u => u.userId === userId);
      
      if (!user) {
        logger.warn(`User ${userId} not found in leaderboard`);
        return 0;
      }
      
      // Return the calculated days behind from the leaderboard
      return user.daysBehind;
    } catch (error) {
      logger.error('Error calculating days behind:', error);
      return 0;
    }
  }

  async getWeeklyCompletionRate(userId, weekStart, weekEnd) {
    try {
      logger.debug(`Getting weekly completion rate for user ${userId} from ${weekStart} to ${weekEnd}`);
      
      // For now, return placeholder data
      // TODO: Implement real calculation based on user's weekly completions
      const randomCompleted = Math.floor(Math.random() * 8); // 0-7 days
      const totalDays = 7;
      const completionRate = (randomCompleted / totalDays) * 100;
      
      return {
        completedDays: randomCompleted,
        totalDays: totalDays,
        completionRate: completionRate
      };
    } catch (error) {
      logger.error('Error getting weekly completion rate:', error);
      return {
        completedDays: 0,
        totalDays: 7,
        completionRate: 0.0
      };
    }
  }

  async createProgressSheet() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      logger.info('Creating progress tracking sheet...');
      
      // TODO: Implement creating a new Google Sheet for progress tracking
      // This would create a new sheet with columns for:
      // Date, User ID, Username, Message ID, Reaction, Action, Timestamp
      
      logger.info('Progress tracking sheet creation - TODO');
    } catch (error) {
      logger.error('Error creating progress sheet:', error);
    }
  }
}

module.exports = SheetsTracker;
