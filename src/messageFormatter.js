const logger = require('./utils/logger');

class MessageFormatter {
  constructor() {
    this.colors = {
      primary: 0x0099ff,    // Blue
      success: 0x00ff00,    // Green
      warning: 0xffaa00,    // Orange
      error: 0xff0000,      // Red
      info: 0x00ffff        // Cyan
    };
  }

  /**
   * Format a reading plan into a Discord embed
   * @param {Object} readingPlan - The reading plan data
   * @returns {Object} Discord embed object
   */
  formatDailyReading(readingPlan) {
    try {
      const embed = {
        color: this.colors.primary,
        title: this.formatTitle(readingPlan),
        description: this.formatDescription(readingPlan),
        fields: this.formatFields(readingPlan),
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
    let description = readingPlan.message || 'Daily Bible reading assignment';
    
    // Extract progress percentage if available
    const progressMatch = description.match(/(\d+\.?\d*%)/);
    if (progressMatch) {
      const progress = progressMatch[1];
      description = description.replace(progress, `**${progress}**`);
    }

    return description;
  }

  formatFields(readingPlan) {
    const fields = [];

    // Main reading assignment
    if (readingPlan.due) {
      fields.push({
        name: '📚 Today\'s Reading',
        value: readingPlan.due,
        inline: false
      });
    }

    // Consolidate all bonus content and links
    let bonusContent = [];

    // Add bonus text if available
    if (readingPlan.bonusText && readingPlan.bonusText.trim()) {
      bonusContent.push(readingPlan.bonusText);
    }

    // Add Bible Project link if available
    if (readingPlan.bibleProject && readingPlan.bibleProject.trim()) {
      bonusContent.push(`🎥 **Bible Project Video**: ${this.formatLink(readingPlan.bibleProject, 'Watch Video')}`);
    }

    // Add 10 Minute Bible Hour link if available
    if (readingPlan.tenMinBible && readingPlan.tenMinBible.trim()) {
      bonusContent.push(`⏰ **10 Minute Bible Hour**: ${this.formatLink(readingPlan.tenMinBible, 'Listen Now')}`);
    }

    // Add start of book information if available
    if (readingPlan.startOfBook && readingPlan.startOfBook.trim()) {
      bonusContent.push(`📖 **Book Introduction**: ${readingPlan.startOfBook}`);
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
