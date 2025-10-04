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
      } catch (error) {
        logger.warn(`Could not fetch server/channel info for user ${progressData.userId}:`, error.message);
      }
      
      // Prepare the row data to match your sheet structure
      const rowData = [
        progressData.date,           // Date column
        progressData.userId,         // User column (Discord user ID)
        nickname,                    // Name column (nickname in server)
        progressData.timestamp,      // Reaction time column (CST)
        progressData.cstTime,        // CST time column with timezone label
        guildName,                   // Server/Guild name
        channelName                  // Channel name
      ];

      if (progressData.action === 'add') {
        // Multiple checks with increasing delays to prevent race conditions
        for (let attempt = 1; attempt <= 3; attempt++) {
          logger.info(`Duplicate check attempt ${attempt}: date=${progressData.date}, userId=${progressData.userId}, guild=${guildName}`);
          const existingRow = await this.findExistingRow(progressData.date, progressData.userId, guildName);
          
          if (existingRow) {
            logger.info(`Row already exists for ${nickname} (${progressData.userId}) on ${progressData.date} in ${guildName}, skipping duplicate`);
            return; // Exit early to prevent any further processing
          }
          
          if (attempt < 3) {
            const delay = attempt * 100; // 100ms, 200ms delays
            logger.info(`No existing row found on attempt ${attempt}, waiting ${delay}ms before next check...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        logger.info(`No duplicate found after 3 attempts, adding new row for ${nickname} (${progressData.userId}) on ${progressData.date} in ${guildName}`);
        
        // Append the row to the Progress tab (now includes guild and channel columns)
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: `${sheetName}!A:G`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [rowData]
          }
        });

        logger.info(`Reaction data written to ${sheetName} tab: ${nickname} (${progressData.userId}) on ${progressData.date}`);
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
      
      // Get guild name for matching
      let guildName = 'Unknown Server';
      try {
        const guild = progressData.reaction.message.guild;
        if (guild) {
          guildName = guild.name;
        }
      } catch (error) {
        logger.warn(`Could not fetch guild info:`, error.message);
      }
      
      // First, get all the data to find the row to delete
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:G`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        logger.warn('No data found in Progress tab to remove');
        return;
      }
      
      // Find the row that matches this user, date, and guild
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const row = rows[i];
        const rowGuild = row[5] || ''; // Column F is guild name
        
        if (row[0] === progressData.date && row[1] === progressData.userId && rowGuild === guildName) {
          rowIndex = i + 1; // Convert to 1-based index for sheets
          break;
        }
      }
      
      if (rowIndex === -1) {
        logger.warn(`No matching row found for user ${progressData.userId} on date ${progressData.date}`);
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
      
      logger.info(`Row ${rowIndex} deleted from ${sheetName} tab`);
      
    } catch (error) {
      logger.error('Error removing reaction from sheet:', error);
      logger.error('Error details:', error.message);
    }
  }

  async findExistingRow(date, userId, guildName) {
    try {
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:G`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return null; // No data or only headers
      }
      
      // Look for existing row with matching date, user ID, and guild name
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const row = rows[i];
        const rowGuild = row[5] || ''; // Column F is guild name
        
        if (row[0] === date && row[1] === userId && rowGuild === guildName) {
          logger.info(`Found existing row at index ${i + 1}: date=${row[0]}, userId=${row[1]}, name=${row[2]}, guild=${row[5]}, channel=${row[6]}`);
          return i + 1; // Return 1-based row index
        }
      }
      
      logger.info(`No existing row found for date=${date}, userId=${userId}, guild=${guildName}`);
      return null; // No matching row found
    } catch (error) {
      logger.error('Error finding existing row:', error);
      return null;
    }
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
                    columnCount: 5
                  }
                }
              }
            }
          ]
        }
      });

      // Add headers to the new sheet to match your structure
      const headers = ['Date', 'User', 'Name', 'Reaction Time (CST)', 'CST Time'];
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Progress!A1:E1',
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      logger.info('Progress tab created successfully with headers: Date, User, Name, Reaction Time (CST), CST Time');
      
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
      
      // Read from the Progress tab
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E`
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
      
      // Filter rows for this user (all reactions are completions)
      const userRows = rows.slice(1).filter(row => row[1] === userId);
      
      const totalDays = 7; // Assuming 7 days per week
      const completedDays = userRows.length;
      const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
      
      // Calculate streak (consecutive days)
      let streak = 0;
      const sortedDates = userRows.map(row => row[0]).sort();
      let currentStreak = 0;
      
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0 || this.isConsecutiveDay(sortedDates[i-1], sortedDates[i])) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
        streak = Math.max(streak, currentStreak);
      }
      
      return {
        totalDays,
        completedDays,
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
      
      // Read from the Progress tab
      const sheetId = this.readingPlanSheetId;
      const sheetName = 'Progress';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E`
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
      
      // Group by user and count completions
      const userCompletions = {};
      
      rows.slice(1).forEach(row => {
        const date = row[0];
        const userId = row[1];
        const nickname = row[2];
        const reactionTime = row[3];
        
        // Count all reactions as completions (since we're only tracking ✅ reactions)
        if (!userCompletions[userId]) {
          userCompletions[userId] = {
            userId,
            username: nickname,
            completedDays: 0,
            dates: new Set()
          };
        }
        
        // Only count each date once per user
        if (!userCompletions[userId].dates.has(date)) {
          userCompletions[userId].completedDays++;
          userCompletions[userId].dates.add(date);
        }
      });
      
      // Convert to leaderboard format
      const leaderboard = Object.values(userCompletions).map(user => {
        const completionRate = totalDays > 0 ? (user.completedDays / totalDays) * 100 : 0;
        const daysBehind = Math.max(0, currentDay - user.completedDays);
        
        return {
          userId: user.userId,
          username: user.username,
          completedDays: user.completedDays,
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
      
      // Read the reading plan sheet to get total days
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E` // Date, Message, Due, Reading, Day
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        logger.warn('No reading plan data found');
        return 7; // Fallback to 7 days
      }
      
      // Count non-empty rows (excluding header)
      const totalDays = rows.length - 1;
      logger.debug(`Total reading days calculated: ${totalDays}`);
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
      
      // Read the reading plan sheet to find current day
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:E` // Date, Message, Due, Reading, Day
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        logger.warn('No reading plan data found');
        return 1; // Fallback to day 1
      }
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Find today's row or the most recent past row
      let currentDay = 1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowDate = row[0];
        const dayNumber = parseInt(row[4]) || i; // Use Day column or row index
        
        if (rowDate <= today) {
          currentDay = dayNumber;
        } else {
          break; // Stop at first future date
        }
      }
      
      logger.debug(`Current reading day calculated: ${currentDay}`);
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
      
      // For now, return placeholder data
      // TODO: Implement real calculation based on user's last completion
      const randomDaysBehind = Math.floor(Math.random() * 5); // 0-4 days behind
      
      return randomDaysBehind;
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
