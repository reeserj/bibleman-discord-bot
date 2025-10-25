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
   * Send a daily reading message to GroupMe
   * @param {Object} readingPlan - The reading plan data
   * @param {string} aiQuestion - AI-generated application question (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async sendDailyReadingToGroupMe(readingPlan, aiQuestion = null) {
    try {
      // Create a GroupMe message that matches Discord format exactly
      const groupMeMessage = this.createGroupMeReadingMessage(readingPlan, aiQuestion);
      
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
   * Matches the Discord bot format exactly
   * @param {Object} readingPlan - The reading plan data
   * @param {string} aiQuestion - AI-generated application question (optional)
   * @returns {string} - Formatted message for GroupMe
   */
  createGroupMeReadingMessage(readingPlan, aiQuestion = null) {
    const date = readingPlan.date || new Date().toISOString().split('T')[0];
    const dayNumber = readingPlan.day || 1;
    const percentage = this.calculateProgressPercentage(readingPlan);
    
    // Title
    let message = `📖 Daily Bible Reading - ${date}\n\n`;
    
    // Description (same as Discord)
    message += `Day ${dayNumber} (${percentage}% complete)\n`;
    
    // Reading assignment from Reading column (same as Discord)
    if (readingPlan.reading && readingPlan.reading.trim()) {
      message += `📖 ${readingPlan.reading}\n\n`;
    } else {
      message += `📖 Daily Bible Reading Assignment\n\n`;
    }

    // Collect links from the same three columns as Discord
    const links = [];

    // Add 10 Minute Bible Hour link if available (same order as Discord)
    if (readingPlan.tenMinBible && readingPlan.tenMinBible.trim()) {
      links.push(readingPlan.tenMinBible);
    }

    // Add Bible Project link if available
    if (readingPlan.bibleProject && readingPlan.bibleProject.trim()) {
      links.push(readingPlan.bibleProject);
    }

    // Add Bonus link if available
    if (readingPlan.bonus && readingPlan.bonus.trim()) {
      links.push(readingPlan.bonus);
    }

    // Add bonus content field if there are links (same as Discord)
    if (links.length > 0) {
      message += `🎁 Bonus Content & Resources:\n`;
      message += links.join('\n') + '\n\n';
    }

    // Add AI-generated question if available (same as Discord)
    if (aiQuestion && aiQuestion.trim()) {
      message += `❓ Question of the Day:\n`;
      message += `${aiQuestion}\n\n`;
    }

    // Footer (same as Discord)
    message += `React with ✅ when completed`;

    return message;
  }

  /**
   * Calculate progress percentage (same as Discord MessageFormatter)
   * @param {Object} readingPlan - The reading plan data
   * @returns {string} - Progress percentage
   */
  calculateProgressPercentage(readingPlan) {
    // Use the day number to calculate percentage (assuming 365-day plan)
    const dayNumber = readingPlan.day || 0;
    const percentage = Math.round((dayNumber / 365) * 100 * 100) / 100;
    return Math.min(percentage, 100).toFixed(1);
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
