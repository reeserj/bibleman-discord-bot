const logger = require('./utils/logger');
const AIService = require('./aiService');

class MessageFormatter {
  constructor() {
    this.colors = {
      primary: 0x0099ff,    // Blue
      success: 0x00ff00,    // Green
      warning: 0xffaa00,    // Orange
      error: 0xff0000,      // Red
      info: 0x00ffff        // Cyan
    };
    this.aiService = new AIService();
  }

  /**
   * Format a reading plan into a Discord embed
   * @param {Object} readingPlan - The reading plan data
   * @returns {Object} Discord embed object
   */
  async formatDailyReading(readingPlan) {
    try {
      const embed = {
        color: this.colors.primary,
        title: this.formatTitle(readingPlan),
        description: this.formatDescription(readingPlan),
        fields: await this.formatFields(readingPlan),
        timestamp: new Date(),
        footer: {
          text: 'React with ✅ when completed'
        }
      };

      // Add thumbnail if it's the start of a new book
      if (readingPlan.startOfBook) {
        embed.thumbnail = {
          url: 'https://cdn.discordapp.com/emojis/📖.png'
        };
      }

      return { embeds: [embed] };
    } catch (error) {
      logger.error('Error formatting daily reading:', error);
      return this.formatErrorEmbed('Failed to format reading plan');
    }
  }

  formatTitle(readingPlan) {
    const date = readingPlan.date || new Date().toISOString().split('T')[0];
    return `📖 Daily Bible Reading - ${date}`;
  }

  formatDescription(readingPlan) {
    // Get day number from Day column
    const dayNumber = readingPlan.day || 1;
    
    // Calculate progress percentage
    const percentage = this.calculateProgressPercentage(readingPlan);
    
    // Create a description with the reading assignment from Reading column
    let description = `**Day ${dayNumber}** (${percentage}% complete)\n`;
    
    // Get reading assignment from Reading column
    if (readingPlan.reading && readingPlan.reading.trim()) {
      description += `📖 **${readingPlan.reading}**`;
    } else {
      description += `📖 Daily Bible Reading Assignment`;
    }

    return description;
  }

  calculateProgressPercentage(readingPlan) {
    // Use the day number to calculate percentage (assuming 365-day plan)
    const dayNumber = readingPlan.day || 0;
    const percentage = Math.round((dayNumber / 365) * 100 * 100) / 100;
    return Math.min(percentage, 100).toFixed(1);
  }

  async formatFields(readingPlan) {
    const fields = [];

    // Collect links from the three columns
    let links = [];

    // Add 10 Minute Bible Hour link if available
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

    // Only add bonus content field if there are links
    if (links.length > 0) {
      fields.push({
        name: '🎁 Bonus Content & Resources',
        value: links.join('\n'),
        inline: false
      });
    }

    // Generate AI application question (positioned after bonus content)
    try {
      if (readingPlan.reading && readingPlan.reading.trim()) {
        logger.debug('Generating AI application question...');
        const question = await this.aiService.generateApplicationQuestion(readingPlan.reading);
        
        if (question) {
          fields.push({
            name: '❓ Question of the Day',
            value: question,
            inline: false
          });
          logger.info('AI application question added to message');
        } else {
          logger.debug('No AI question generated, skipping field');
        }
      }
    } catch (error) {
      // Gracefully handle AI failures - just skip the question field
      logger.warn('Failed to generate AI application question, skipping field:', error.message);
    }

    return fields;
  }

  formatLink(url, text) {
    return `[${text}](${url})`;
  }

  formatErrorEmbed(message) {
    return {
      embeds: [{
        color: this.colors.error,
        title: '❌ Error',
        description: message,
        timestamp: new Date()
      }]
    };
  }

  formatSuccessEmbed(message) {
    return {
      embeds: [{
        color: this.colors.success,
        title: '✅ Success',
        description: message,
        timestamp: new Date()
      }]
    };
  }

  formatProgressEmbed(userProgress) {
    const embed = {
      color: this.colors.info,
      title: '📊 Reading Progress',
      fields: [],
      timestamp: new Date()
    };

    if (userProgress.totalDays) {
      embed.fields.push({
        name: '📅 Total Days',
        value: userProgress.totalDays.toString(),
        inline: true
      });
    }

    if (userProgress.completedDays) {
      embed.fields.push({
        name: '✅ Completed',
        value: userProgress.completedDays.toString(),
        inline: true
      });
    }

    if (userProgress.streak) {
      embed.fields.push({
        name: '🔥 Current Streak',
        value: userProgress.streak.toString(),
        inline: true
      });
    }

    if (userProgress.completionRate) {
      embed.fields.push({
        name: '📈 Completion Rate',
        value: `${userProgress.completionRate}%`,
        inline: true
      });
    }

    return { embeds: [embed] };
  }

  formatLeaderboardEmbed(leaderboard) {
    const embed = {
      color: this.colors.primary,
      title: '🏆 Reading Leaderboard',
      description: 'Top readers this week',
      fields: [],
      timestamp: new Date()
    };

    leaderboard.forEach((entry, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
      embed.fields.push({
        name: `${medal} ${entry.username}`,
        value: `${entry.completedDays} days completed (${entry.completionRate}%)`,
        inline: false
      });
    });

    return { embeds: [embed] };
  }
}

module.exports = MessageFormatter;
