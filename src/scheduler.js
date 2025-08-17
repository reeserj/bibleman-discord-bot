const cron = require('node-cron');
const moment = require('moment-timezone');
const logger = require('./utils/logger');

class Scheduler {
  constructor(client) {
    this.client = client;
    this.scheduleTask = null;
    this.timezone = process.env.TIMEZONE || 'America/Chicago';
    this.scheduleTime = process.env.SCHEDULE_TIME || '0 5 * * *'; // 5 AM CST daily
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
      const channelId = process.env.DISCORD_CHANNEL_ID;
      if (!channelId) {
        throw new Error('DISCORD_CHANNEL_ID not configured');
      }

      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      // Get today's reading plan
      const today = moment().tz(this.timezone).format('YYYY-MM-DD');
      logger.info(`Sending daily reading for ${today}`);

      // TODO: Get reading plan from Google Sheets
      const readingPlan = await this.getTodaysReadingPlan(today);
      
      if (!readingPlan) {
        logger.warn(`No reading plan found for ${today}`);
        return;
      }

      // TODO: Format message with MessageFormatter
      const formattedMessage = await this.formatDailyMessage(readingPlan);
      
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
    // TODO: Implement Google Sheets integration
    // This will be implemented in sheetsParser.js
    logger.debug(`Getting reading plan for ${date}`);
    
    // Placeholder for now
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
      const channelId = process.env.DISCORD_CHANNEL_ID;
      if (!channelId) {
        throw new Error('DISCORD_CHANNEL_ID not configured');
      }

      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }

      logger.info('Sending weekly leaderboard');

      // TODO: Get weekly progress data from Google Sheets
      const weeklyProgress = await this.getWeeklyProgress();
      
      if (!weeklyProgress || weeklyProgress.length === 0) {
        logger.warn('No weekly progress data found');
        return;
      }

      // Format and send the leaderboard
      const formattedMessage = await this.formatWeeklyLeaderboard(weeklyProgress);
      await channel.send(formattedMessage);
      
      logger.info('Weekly leaderboard sent successfully');
      
    } catch (error) {
      logger.error('Failed to send weekly leaderboard:', error);
      throw error;
    }
  }

  async getWeeklyProgress() {
    // TODO: Implement Google Sheets integration for weekly progress
    // This will be implemented in sheetsTracker.js
    
    // Placeholder data for testing
    return [
      {
        userId: '123456789',
        username: 'John',
        completionRate: 85.7,
        daysBehind: 0,
        completedDays: 6,
        totalDays: 7
      },
      {
        userId: '987654321',
        username: 'Sarah',
        completionRate: 71.4,
        daysBehind: 2,
        completedDays: 5,
        totalDays: 7
      },
      {
        userId: '456789123',
        username: 'Mike',
        completionRate: 57.1,
        daysBehind: 3,
        completedDays: 4,
        totalDays: 7
      }
    ];
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

    sortedProgress.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
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
        name: `${medal} ${mention}`,
        value: `${status}\n📈 **${user.completionRate}%** complete (${user.completedDays}/${user.totalDays} days)\n📅 **${user.daysBehind}** days behind`,
        inline: false
      });
    });

    // Add summary field
    const totalUsers = weeklyProgress.length;
    const onTrackUsers = weeklyProgress.filter(u => u.daysBehind === 0).length;
    const behindUsers = weeklyProgress.filter(u => u.daysBehind > 0).length;

    embed.fields.push({
      name: '📊 Weekly Summary',
      value: `👥 **${totalUsers}** total participants\n✅ **${onTrackUsers}** on track\n⚠️ **${behindUsers}** need to catch up`,
      inline: false
    });

    return { embeds: [embed] };
  }

  // Method to manually trigger weekly leaderboard (for testing)
  async triggerWeeklyLeaderboard() {
    logger.info('Manually triggering weekly leaderboard');
    await this.sendWeeklyLeaderboard();
  }
}

module.exports = Scheduler;
