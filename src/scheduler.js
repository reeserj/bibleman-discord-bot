const cron = require('node-cron');
const moment = require('moment-timezone');
const logger = require('./utils/logger');

class Scheduler {
  constructor(client, messageFormatter, sheetsParser, sheetsTracker, guildConfig) {
    this.client = client;
    this.messageFormatter = messageFormatter;
    this.sheetsParser = sheetsParser;
    this.sheetsTracker = sheetsTracker;
    this.guildConfig = guildConfig;
    this.scheduleTask = null;
    this.timezone = process.env.TIMEZONE || 'America/Chicago';
    this.scheduleTime = process.env.SCHEDULE_TIME || '0 5 * * *'; // 5 AM CST daily
    this.lastChannelId = null;
    this.channelValidationCache = new Map();
  }

  startDailySchedule() {
    logger.info(`Starting daily schedule for ${this.timezone} at ${this.scheduleTime}`);
    
    this.scheduleTask = cron.schedule(this.scheduleTime, async () => {
      try {
        await this.sendDailyReading();
      } catch (error) {
        logger.error('Error in daily reading schedule:', error);
      }
    }, {
      timezone: this.timezone
    });

    // Start weekly leaderboard schedule (Sundays at 9 AM)
    this.weeklyLeaderboardTask = cron.schedule('0 9 * * 0', async () => {
      try {
        await this.sendWeeklyLeaderboard();
      } catch (error) {
        logger.error('Error in weekly leaderboard schedule:', error);
      }
    }, {
      timezone: this.timezone
    });

    logger.info('Daily schedule and weekly leaderboard schedule started successfully');
  }

  async sendDailyReading() {
    try {
      // Send to all configured guilds
      for (const guild of this.client.guilds.cache.values()) {
        const channelId = this.guildConfig.getChannelId(guild.id);
        
        if (!channelId) {
          logger.info(`No channel configured for guild ${guild.name} (${guild.id}), skipping`);
          continue;
        }
        
        await this.sendDailyReadingToChannel(channelId, guild);
      }
    } catch (error) {
      logger.error('Failed to send daily reading:', error);
    }
  }

  async sendDailyReadingToChannel(channelId, guild) {
    try {

      // Check if channel has changed
      if (this.lastChannelId !== channelId) {
        logger.info(`Channel changed from ${this.lastChannelId} to ${channelId}`);
        this.lastChannelId = channelId;
        this.channelValidationCache.clear(); // Clear cache on channel change
      }

      // Validate channel access
      const channelValidation = await this.validateChannelAccess(channelId);
      if (!channelValidation.valid) {
        throw new Error(`Channel validation failed: ${channelValidation.error}`);
      }

      const channel = channelValidation.channel;

      // Get today's reading plan
      const today = moment().tz(this.timezone).format('YYYY-MM-DD');
      logger.info(`Sending daily reading for ${today}`);

      // TODO: Get reading plan from Google Sheets
      const readingPlan = await this.getTodaysReadingPlan(today);
      
      if (!readingPlan) {
        logger.warn(`No reading plan found for ${today}`);
        return;
      }

      // Format message with MessageFormatter
      const formattedMessage = await this.messageFormatter.formatDailyReading(readingPlan);
      
      // Send the message
      const message = await channel.send(formattedMessage);
      
      // Add reaction buttons
      await message.react('✅'); // Completed
      
      logger.info(`Daily reading message sent successfully for ${today}`);
      
    } catch (error) {
      logger.error('Failed to send daily reading:', error);
      throw error;
    }
  }

  async getTodaysReadingPlan(date) {
    try {
      // Use the real SheetsParser to get today's reading plan
      const readingPlan = await this.sheetsParser.getTodaysReadingPlan(date);
      
      if (!readingPlan) {
        logger.warn(`No reading plan found for ${date}, using fallback data`);
        // Fallback to placeholder data if no plan found
        return {
          date: date,
          message: `Day 1: 0.3% complete\nGenesis 1-3`,
          due: 'Genesis 1-3',
          reading: 1,
          day: 1,
          bonusText: 'More from the Bible Project',
          startOfBook: 'Genesis 1',
          tenMinBible: 'https://bibleproject.com/explore/video/genesis-1/',
          bibleProject: 'https://bibleproject.com/explore/video/genesis-1/',
          bonus: ''
        };
      }
      
      return readingPlan;
    } catch (error) {
      logger.error('Error getting today\'s reading plan:', error);
      // Return fallback data on error
      return {
        date: date,
        message: `Day 1: 0.3% complete\nGenesis 1-3`,
        due: 'Genesis 1-3',
        reading: 1,
        day: 1,
        bonusText: 'More from the Bible Project',
        startOfBook: 'Genesis 1',
        tenMinBible: 'https://bibleproject.com/explore/video/genesis-1/',
        bibleProject: 'https://bibleproject.com/explore/video/genesis-1/',
        bonus: ''
      };
    }
  }

  async formatDailyMessage(readingPlan) {
    // TODO: Implement with MessageFormatter
    // This will be implemented in messageFormatter.js
    
    const embed = {
      color: 0x0099ff,
      title: `📖 Daily Bible Reading - ${readingPlan.date}`,
      description: readingPlan.message,
      fields: [
        {
          name: '📚 Today\'s Reading',
          value: readingPlan.due,
          inline: true
        },
        {
          name: '📊 Progress',
          value: `Day ${readingPlan.reading}`,
          inline: true
        }
      ],
      timestamp: new Date(),
      footer: {
        text: 'React with ✅ when completed'
      }
    };

    // Add resource links if available
    if (readingPlan.bibleProject) {
      embed.fields.push({
        name: '🎥 Bible Project Video',
        value: readingPlan.bibleProject,
        inline: false
      });
    }

    if (readingPlan.tenMinBible) {
      embed.fields.push({
        name: '⏰ 10 Minute Bible Hour',
        value: readingPlan.tenMinBible,
        inline: false
      });
    }

    return { embeds: [embed] };
  }

  stop() {
    if (this.scheduleTask) {
      this.scheduleTask.stop();
      logger.info('Daily schedule stopped');
    }
    if (this.weeklyLeaderboardTask) {
      this.weeklyLeaderboardTask.stop();
      logger.info('Weekly leaderboard schedule stopped');
    }
  }

  // Method to manually trigger daily reading (for testing)
  async triggerDailyReading() {
    logger.info('Manually triggering daily reading');
    await this.sendDailyReading();
  }

  async sendWeeklyLeaderboard() {
    try {
      // Send to all configured guilds
      for (const guild of this.client.guilds.cache.values()) {
        const channelId = this.guildConfig.getChannelId(guild.id);
        
        if (!channelId) {
          logger.info(`No channel configured for guild ${guild.name} (${guild.id}), skipping leaderboard`);
          continue;
        }

        // Validate channel access
        const channelValidation = await this.validateChannelAccess(channelId);
        if (!channelValidation.valid) {
          logger.error(`Channel validation failed for guild ${guild.name}: ${channelValidation.error}`);
          continue;
        }

        const channel = channelValidation.channel;

        logger.info(`Sending weekly leaderboard to ${guild.name}`);

        // TODO: Get weekly progress data from Google Sheets
        const weeklyProgress = await this.getWeeklyProgress();
        
        if (!weeklyProgress || weeklyProgress.length === 0) {
          logger.warn('No weekly progress data found');
          continue;
        }

        // Format and send the leaderboard
        const formattedMessage = await this.formatWeeklyLeaderboard(weeklyProgress);
        await channel.send(formattedMessage);
        
        logger.info(`Weekly leaderboard sent successfully to ${guild.name}`);
      }
    } catch (error) {
      logger.error('Failed to send weekly leaderboard:', error);
    }
  }

  async getWeeklyProgress() {
    try {
      logger.debug('Getting weekly progress from SheetsTracker');
      
      // Get real data from SheetsTracker
      const weeklyProgress = await this.sheetsTracker.getWeeklyProgress();
      
      if (!weeklyProgress || !weeklyProgress.users || weeklyProgress.users.length === 0) {
        logger.warn('No weekly progress data found from SheetsTracker');
        return [];
      }
      
      logger.info(`Found ${weeklyProgress.users.length} users in weekly progress`);
      return weeklyProgress.users;
      
    } catch (error) {
      logger.error('Error getting weekly progress:', error);
      // Return fallback data on error
      return [
        {
          userId: '123456789',
          username: 'John',
          completionRate: 85.7,
          daysBehind: 0,
          completedDays: 6,
          totalDays: 7,
          currentDay: 7
        },
        {
          userId: '987654321',
          username: 'Sarah',
          completionRate: 71.4,
          daysBehind: 2,
          completedDays: 5,
          totalDays: 7,
          currentDay: 7
        },
        {
          userId: '456789123',
          username: 'Mike',
          completionRate: 57.1,
          daysBehind: 3,
          completedDays: 4,
          totalDays: 7,
          currentDay: 7
        }
      ];
    }
  }

  async formatWeeklyLeaderboard(weeklyProgress) {
    const embed = {
      color: 0x00ff00, // Green color for weekly reports
      title: '🏆 Weekly Bible Reading Report',
      description: `**Week ending ${moment().tz(this.timezone).format('MMMM Do, YYYY')}**`,
      fields: [],
      timestamp: new Date(),
      footer: {
        text: 'Keep up the great work! 📖'
      }
    };

    // Sort by completion rate (highest first)
    const sortedProgress = weeklyProgress.sort((a, b) => b.completionRate - a.completionRate);

    // Get the first user to determine total days and current day
    const firstUser = sortedProgress[0];
    const totalDays = firstUser ? firstUser.totalDays : 0;
    const currentDay = firstUser ? firstUser.currentDay : 0;
    const daysRunning = currentDay;

    sortedProgress.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
      
      // Try to get the user's display name from Discord
      let userDisplay = user.username || `User ${user.userId}`;
      
      // Create mention - this should work for Discord mentions
      const mention = `<@${user.userId}>`;
      
      let status = '';
      if (user.daysBehind === 0) {
        status = '✅ **On Track!**';
      } else if (user.daysBehind <= 2) {
        status = '⚠️ **Slightly Behind**';
      } else {
        status = '🚨 **Needs Attention**';
      }

      embed.fields.push({
        name: `${medal} ${userDisplay}`,
        value: `${mention}\n${status}\n📈 **${user.completionRate}%** complete (${user.completedDays}/${totalDays} days)\n📅 **${user.daysBehind}** days behind`,
        inline: false
      });
    });

    // Add summary field with days running information
    const totalUsers = weeklyProgress.length;
    const onTrackUsers = weeklyProgress.filter(u => u.daysBehind === 0).length;
    const behindUsers = weeklyProgress.filter(u => u.daysBehind > 0).length;

    embed.fields.push({
      name: '📊 Weekly Summary',
      value: `👥 **${totalUsers}** total participants\n✅ **${onTrackUsers}** on track\n⚠️ **${behindUsers}** need to catch up\n📅 **Day ${daysRunning}** of ${totalDays} total days`,
      inline: false
    });

    return { embeds: [embed] };
  }

  // Method to manually trigger weekly leaderboard (for testing)
  async triggerWeeklyLeaderboard() {
    logger.info('Manually triggering weekly leaderboard');
    await this.sendWeeklyLeaderboard();
  }

  // Validate channel access with caching
  async validateChannelAccess(channelId) {
    try {
      // Check cache first
      if (this.channelValidationCache.has(channelId)) {
        const cached = this.channelValidationCache.get(channelId);
        const cacheAge = Date.now() - cached.timestamp;
        
        // Cache valid for 5 minutes
        if (cacheAge < 5 * 60 * 1000) {
          logger.debug(`Using cached channel validation for ${channelId}`);
          return cached.result;
        }
      }

      logger.debug(`Validating channel access for ${channelId}`);
      
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        const result = { valid: false, error: `Channel ${channelId} not found` };
        this.channelValidationCache.set(channelId, { result, timestamp: Date.now() });
        return result;
      }

      // Check if it's a text channel
      if (channel.type !== 0) {
        const result = { valid: false, error: `Channel ${channelId} is not a text channel` };
        this.channelValidationCache.set(channelId, { result, timestamp: Date.now() });
        return result;
      }

      // Check bot permissions
      const permissions = channel.permissionsFor(this.client.user);
      const canSendMessages = permissions.has('SendMessages');
      const canReadMessages = permissions.has('ReadMessageHistory');
      const canAddReactions = permissions.has('AddReactions');

      if (!canSendMessages) {
        const result = { valid: false, error: `Bot does not have permission to send messages in channel ${channelId}` };
        this.channelValidationCache.set(channelId, { result, timestamp: Date.now() });
        return result;
      }

      if (!canReadMessages) {
        const result = { valid: false, error: `Bot does not have permission to read messages in channel ${channelId}` };
        this.channelValidationCache.set(channelId, { result, timestamp: Date.now() });
        return result;
      }

      if (!canAddReactions) {
        logger.warn(`Bot does not have permission to add reactions in channel ${channelId}, but continuing...`);
      }

      const result = {
        valid: true,
        channel: channel,
        permissions: {
          sendMessages: canSendMessages,
          readMessages: canReadMessages,
          addReactions: canAddReactions
        }
      };

      // Cache successful validation
      this.channelValidationCache.set(channelId, { result, timestamp: Date.now() });
      
      logger.info(`Channel ${channelId} (#${channel.name}) validated successfully`);
      return result;

    } catch (error) {
      logger.error(`Error validating channel ${channelId}:`, error);
      const result = { valid: false, error: `Channel validation error: ${error.message}` };
      this.channelValidationCache.set(channelId, { result, timestamp: Date.now() });
      return result;
    }
  }

  // Get current channel information
  async getCurrentChannelInfo() {
    const channelId = process.env.DISCORD_CHANNEL_ID;
    if (!channelId) {
      return null;
    }

    const validation = await this.validateChannelAccess(channelId);
    if (!validation.valid) {
      return null;
    }

    return {
      id: validation.channel.id,
      name: validation.channel.name,
      guild: validation.channel.guild.name,
      permissions: validation.permissions
    };
  }

  // Clear channel validation cache
  clearChannelCache() {
    this.channelValidationCache.clear();
    logger.info('Channel validation cache cleared');
  }
}

module.exports = Scheduler;
