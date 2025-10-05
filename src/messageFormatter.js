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
    // Calculate progress and day number dynamically
    const progressInfo = this.calculateProgress(readingPlan);
    
    // Create a simple description without using due or message columns
    let description = `**Day ${progressInfo.dayNumber}** (${progressInfo.percentage}% complete)\n📖 Daily Bible Reading Assignment`;

    return description;
  }

  async formatFields(readingPlan) {
    const fields = [];

    // Consolidate all bonus content and links
    let bonusContent = [];

    // bonusText column is ignored

    // Add Bible Project link if available
    if (readingPlan.bibleProject && readingPlan.bibleProject.trim()) {
      bonusContent.push(`🎥 **Bible Project Video**: ${this.formatLink(readingPlan.bibleProject, 'Watch Video')}`);
    }

    // Add 10 Minute Bible Hour link if available
    if (readingPlan.tenMinBible && readingPlan.tenMinBible.trim()) {
      bonusContent.push(`⏰ **10 Minute Bible Hour**: ${this.formatLink(readingPlan.tenMinBible, 'Listen Now')}`);
    }

    // Generate AI book introduction if we have a reading assignment
    if (readingPlan.due && readingPlan.due.trim()) {
      try {
        const bookName = this.aiService.extractBookName(readingPlan.due);
        const chapterRange = this.aiService.extractChapterRange(readingPlan.due);
        
        if (bookName) {
          const aiSummary = await this.aiService.generateBookSummary(bookName, chapterRange);
          if (aiSummary) {
            bonusContent.push(`📖 **Book Introduction**: ${aiSummary}`);
          }
        }
      } catch (error) {
        logger.error('Error generating AI book introduction:', error);
        // Fallback to original startOfBook if AI fails
        if (readingPlan.startOfBook && readingPlan.startOfBook.trim()) {
          bonusContent.push(`📖 **Book Introduction**: ${readingPlan.startOfBook}`);
        }
      }
    }

    // Add additional bonus content if available
    if (readingPlan.bonus && readingPlan.bonus.trim()) {
      bonusContent.push(readingPlan.bonus);
    }

    // Only add bonus content field if there's content
    if (bonusContent.length > 0) {
      fields.push({
        name: '🎁 Bonus Content & Resources',
        value: bonusContent.join('\n'),
        inline: false
      });
    }

    return fields;
  }

  formatLink(url, text) {
    return `[${text}](${url})`;
  }

  calculateProgress(readingPlan) {
    // Use the reading column value to determine progress
    const readingValue = readingPlan.reading || 0;
    const dayValue = readingPlan.day || 0;
    
    // Calculate percentage based on reading value
    // Assuming reading values represent chapters or sections completed
    // You may need to adjust this calculation based on your specific data structure
    let percentage = 0;
    let dayNumber = 1;
    
    if (readingValue > 0) {
      // Calculate day number based on reading value
      // This assumes reading values increment by 1 for each day
      dayNumber = readingValue;
      
      // Calculate percentage - you may need to adjust this based on total expected readings
      // For now, using a simple calculation - adjust as needed
      percentage = Math.round((readingValue / 365) * 100 * 100) / 100; // Assuming 365-day plan
    } else if (dayValue > 0) {
      // Fallback to day value if reading value is not available
      dayNumber = dayValue;
      percentage = Math.round((dayValue / 365) * 100 * 100) / 100;
    }
    
    // Ensure percentage doesn't exceed 100%
    percentage = Math.min(percentage, 100);
    
    return {
      dayNumber,
      percentage: percentage.toFixed(1)
    };
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
