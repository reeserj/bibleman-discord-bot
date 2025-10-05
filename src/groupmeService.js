const axios = require('axios');
const logger = require('./utils/logger');

class GroupMeService {
  constructor() {
    this.baseURL = 'https://api.groupme.com/v3';
    this.biblePlanBotId = process.env.GROUPME_BIBLE_PLAN_BOT_ID;
    this.lockerroomBotId = process.env.GROUPME_LOCKERROOM_BOT_ID;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!this.biblePlanBotId && !this.lockerroomBotId) {
        throw new Error('At least one GroupMe bot ID is required');
      }

      this.initialized = true;
      logger.info('GroupMe service initialized successfully');
      
      if (this.biblePlanBotId) {
        logger.info(`Bible Plan Bot ID configured: ${this.biblePlanBotId}`);
      }
      if (this.lockerroomBotId) {
        logger.info(`Lockerroom Bot ID configured: ${this.lockerroomBotId}`);
      }
    } catch (error) {
      logger.error('Failed to initialize GroupMe service:', error);
      throw error;
    }
  }

  /**
   * Send a message to the Bible Plan GroupMe group
   * @param {string} message - The message to send
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} - Success status
   */
  async sendBiblePlanMessage(message, options = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.biblePlanBotId) {
        logger.warn('Bible Plan Bot ID not configured, skipping GroupMe message');
        return false;
      }

      const formattedMessage = this.formatMessageForGroupMe(message, options);
      
      const response = await axios.post(`${this.baseURL}/bots/post`, {
        bot_id: this.biblePlanBotId,
        text: formattedMessage
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.status === 202) {
        logger.info('Bible Plan message sent to GroupMe successfully');
        return true;
      } else {
        logger.warn(`Unexpected response from GroupMe API: ${response.status}`);
        return false;
      }
    } catch (error) {
      logger.error('Error sending Bible Plan message to GroupMe:', error);
      if (error.response) {
        logger.error(`GroupMe API error: ${error.response.status} - ${error.response.data}`);
      }
      return false;
    }
  }

  /**
   * Send a message to the Lockerroom GroupMe group
   * @param {string} message - The message to send
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} - Success status
   */
  async sendLockerroomMessage(message, options = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.lockerroomBotId) {
        logger.warn('Lockerroom Bot ID not configured, skipping GroupMe message');
        return false;
      }

      const formattedMessage = this.formatMessageForGroupMe(message, options);
      
      const response = await axios.post(`${this.baseURL}/bots/post`, {
        bot_id: this.lockerroomBotId,
        text: formattedMessage
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (response.status === 202) {
        logger.info('Lockerroom message sent to GroupMe successfully');
        return true;
      } else {
        logger.warn(`Unexpected response from GroupMe API: ${response.status}`);
        return false;
      }
    } catch (error) {
      logger.error('Error sending Lockerroom message to GroupMe:', error);
      if (error.response) {
        logger.error(`GroupMe API error: ${error.response.status} - ${error.response.data}`);
      }
      return false;
    }
  }

  /**
   * Format a message for GroupMe (convert Discord formatting to GroupMe-friendly format)
   * @param {string} message - The original message
   * @param {Object} options - Formatting options
   * @returns {string} - Formatted message
   */
  formatMessageForGroupMe(message, options = {}) {
    let formatted = message;

    // Remove Discord-specific formatting that doesn't work in GroupMe
    // Convert Discord mentions to plain text
    formatted = formatted.replace(/<@!?(\d+)>/g, '@user');
    formatted = formatted.replace(/<@&(\d+)>/g, '@role');
    formatted = formatted.replace(/<#(\d+)>/g, '#channel');

    // Convert Discord embeds to plain text
    if (options.isEmbed) {
      // Extract title and description from embed-like content
      const titleMatch = formatted.match(/^\*\*(.*?)\*\*/);
      const descriptionMatch = formatted.match(/\*\*(.*?)\*\*\n(.*)/);
      
      if (titleMatch) {
        formatted = `📖 ${titleMatch[1]}\n\n${formatted.replace(/^\*\*(.*?)\*\*\s*/, '')}`;
      }
    }

    // Convert Discord markdown to GroupMe-friendly format
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, `*${'$1'}*`); // Bold to italic
    formatted = formatted.replace(/\*(.*?)\*/g, `_${'$1'}_`); // Italic to underline
    formatted = formatted.replace(/`(.*?)`/g, '`$1`'); // Keep code formatting
    formatted = formatted.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```/g, '').trim();
    }); // Remove code block markers

    // Clean up extra whitespace
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.trim();

    // Truncate if too long (GroupMe has message limits)
    const maxLength = 1000;
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + '...';
    }

    return formatted;
  }

  /**
   * Send a daily reading message to both Discord and GroupMe
   * @param {Object} readingPlan - The reading plan data
   * @param {string} discordMessage - The formatted Discord message
   * @returns {Promise<boolean>} - Success status
   */
  async sendDailyReadingToGroupMe(readingPlan, discordMessage) {
    try {
      // Create a simplified version for GroupMe
      const groupMeMessage = this.createGroupMeReadingMessage(readingPlan);
      
      const success = await this.sendBiblePlanMessage(groupMeMessage, {
        isEmbed: true,
        readingPlan: readingPlan
      });

      return success;
    } catch (error) {
      logger.error('Error sending daily reading to GroupMe:', error);
      return false;
    }
  }

  /**
   * Create a GroupMe-friendly daily reading message
   * @param {Object} readingPlan - The reading plan data
   * @returns {string} - Formatted message for GroupMe
   */
  createGroupMeReadingMessage(readingPlan) {
    const date = readingPlan.date || new Date().toISOString().split('T')[0];
    const progressInfo = this.calculateProgress(readingPlan);
    
    let message = `📖 *Daily Bible Reading - ${date}*\n\n`;
    message += `*Day ${progressInfo.dayNumber}* (${progressInfo.percentage}% complete)\n`;
    message += `📖 Daily Bible Reading Assignment\n\n`;

    // Add reading assignment if available
    if (readingPlan.due && readingPlan.due.trim()) {
      message += `📚 *Today's Reading:* ${readingPlan.due}\n\n`;
    }

    // Add bonus content and resources
    const bonusContent = [];

    // Add Bible Project link if available
    if (readingPlan.bibleProject && readingPlan.bibleProject.trim()) {
      bonusContent.push(`🎥 *Bible Project Video:* ${readingPlan.bibleProject}`);
    }

    // Add 10 Minute Bible Hour link if available
    if (readingPlan.tenMinBible && readingPlan.tenMinBible.trim()) {
      bonusContent.push(`⏰ *10 Minute Bible Hour:* ${readingPlan.tenMinBible}`);
    }

    // Add AI-generated book introduction if available
    if (readingPlan.aiSummary && readingPlan.aiSummary.trim()) {
      bonusContent.push(`📖 *Book Introduction:* ${readingPlan.aiSummary}`);
    } else if (readingPlan.startOfBook && readingPlan.startOfBook.trim()) {
      bonusContent.push(`📖 *Book Introduction:* ${readingPlan.startOfBook}`);
    }

    // Add additional bonus content if available
    if (readingPlan.bonus && readingPlan.bonus.trim()) {
      bonusContent.push(readingPlan.bonus);
    }

    // Add bonus content if any exists
    if (bonusContent.length > 0) {
      message += `🎁 *Bonus Content & Resources:*\n`;
      message += bonusContent.join('\n') + '\n\n';
    }

    message += `React with ✅ when completed!`;

    return message;
  }

  /**
   * Calculate progress information (copied from MessageFormatter)
   * @param {Object} readingPlan - The reading plan data
   * @returns {Object} - Progress information
   */
  calculateProgress(readingPlan) {
    const readingValue = readingPlan.reading || 0;
    const dayValue = readingPlan.day || 0;
    
    let percentage = 0;
    let dayNumber = 1;
    
    if (readingValue > 0) {
      dayNumber = readingValue;
      percentage = Math.round((readingValue / 365) * 100 * 100) / 100;
    } else if (dayValue > 0) {
      dayNumber = dayValue;
      percentage = Math.round((dayValue / 365) * 100 * 100) / 100;
    }
    
    percentage = Math.min(percentage, 100);
    
    return {
      dayNumber,
      percentage: percentage.toFixed(1)
    };
  }

  /**
   * Send a weekly leaderboard to GroupMe
   * @param {Array} weeklyProgress - The weekly progress data
   * @returns {Promise<boolean>} - Success status
   */
  async sendWeeklyLeaderboardToGroupMe(weeklyProgress) {
    try {
      const groupMeMessage = this.createGroupMeLeaderboardMessage(weeklyProgress);
      
      const success = await this.sendBiblePlanMessage(groupMeMessage, {
        isLeaderboard: true
      });

      return success;
    } catch (error) {
      logger.error('Error sending weekly leaderboard to GroupMe:', error);
      return false;
    }
  }

  /**
   * Create a GroupMe-friendly leaderboard message
   * @param {Array} weeklyProgress - The weekly progress data
   * @returns {string} - Formatted leaderboard message
   */
  createGroupMeLeaderboardMessage(weeklyProgress) {
    const moment = require('moment-timezone');
    const timezone = process.env.TIMEZONE || 'America/Chicago';
    
    // Filter users to only show those who are 2+ days behind
    const behindUsers = weeklyProgress.filter(u => u.daysBehind >= 2);
    const caughtUpUsers = weeklyProgress.filter(u => u.daysBehind < 2);
    
    let message = `*Weekly Update*\n\n`;
    message += `*Week ending ${moment().tz(timezone).format('MMMM Do, YYYY')}*\n\n`;

    // If everyone is caught up, send a simple message
    if (behindUsers.length === 0) {
      message += `Everyone is caught up today. Great work.`;
      return message;
    }

    // Sort behind users by days behind (most behind first)
    behindUsers.sort((a, b) => b.daysBehind - a.daysBehind);

    // Add users who are behind (2+ days) - just username and days behind
    behindUsers.forEach((user) => {
      message += `*${user.username}*: ${user.daysBehind} days behind\n`;
    });

    // Add minimal summary
    const totalUsers = weeklyProgress.length;
    const caughtUpCount = caughtUpUsers.length;
    const behindCount = behindUsers.length;

    message += `\n📊 *Summary:*\n`;
    message += `*${totalUsers}* total participants\n`;
    message += `✅ *${caughtUpCount}* caught up\n`;
    message += `⚠️ *${behindCount}* behind`;

    return message;
  }

  /**
   * Test the GroupMe connection
   * @returns {Promise<boolean>} - Connection success status
   */
  async testConnection() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const testMessage = `🤖 BibleMan Bot Test - ${new Date().toISOString()}`;
      
      let success = false;
      if (this.biblePlanBotId) {
        success = await this.sendBiblePlanMessage(testMessage);
      }
      if (this.lockerroomBotId) {
        success = success || await this.sendLockerroomMessage(testMessage);
      }

      return success;
    } catch (error) {
      logger.error('Error testing GroupMe connection:', error);
      return false;
    }
  }
}

module.exports = GroupMeService;
