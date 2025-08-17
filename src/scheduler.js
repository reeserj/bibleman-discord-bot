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

    logger.info('Daily schedule started successfully');
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
      await message.react('📖'); // In Progress
      
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
        text: 'React with ✅ when completed or 📖 if in progress'
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
  }

  // Method to manually trigger daily reading (for testing)
  async triggerDailyReading() {
    logger.info('Manually triggering daily reading');
    await this.sendDailyReading();
  }
}

module.exports = Scheduler;
