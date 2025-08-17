const { Client, GatewayIntentBits, Partials } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const Scheduler = require('./scheduler');
const SheetsParser = require('./sheetsParser');
const SheetsTracker = require('./sheetsTracker');
const MessageFormatter = require('./messageFormatter');
const logger = require('./utils/logger');
const Helpers = require('./utils/helpers');

class BibleManBot {
  constructor() {
    // Validate environment variables
    const envValidation = Helpers.validateEnvironment();
    if (!envValidation.isValid) {
      logger.error('Missing required environment variables:', envValidation.missing);
      throw new Error(`Missing required environment variables: ${envValidation.missing.join(', ')}`);
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
      ]
    });

    this.scheduler = new Scheduler(this.client);
    this.sheetsParser = new SheetsParser();
    this.sheetsTracker = new SheetsTracker();
    this.messageFormatter = new MessageFormatter();

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.client.once('ready', () => {
      logger.info(`Logged in as ${this.client.user.tag}`);
      logger.info(`Bot is ready! Serving ${this.client.guilds.cache.size} guilds`);
      this.scheduler.startDailySchedule();
    });

    this.client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) return;
      
      try {
        await this.handleReaction(reaction, user, 'add');
      } catch (error) {
        logger.error('Error handling reaction add:', error);
      }
    });

    this.client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) return;
      
      try {
        await this.handleReaction(reaction, user, 'remove');
      } catch (error) {
        logger.error('Error handling reaction remove:', error);
      }
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      
      try {
        await this.handleMessage(message);
      } catch (error) {
        logger.error('Error handling message:', error);
      }
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
    });
  }

  async handleMessage(message) {
    const prefix = process.env.BOT_PREFIX || '!';
    
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
      case 'ping':
        await message.reply('Pong! 🏓');
        break;
        
      case 'reading':
        await this.handleReadingCommand(message, args);
        break;
        
      case 'progress':
        await this.handleProgressCommand(message);
        break;
        
      case 'help':
        await this.handleHelpCommand(message);
        break;
        
      default:
        await message.reply(`Unknown command. Use \`${prefix}help\` for available commands.`);
    }
  }

  async handleReadingCommand(message, args) {
    if (args[0] === 'today') {
      // Manually trigger today's reading
      await this.scheduler.triggerDailyReading();
      await message.reply('Today\'s reading has been sent! 📖');
    } else if (args[0] === 'leaderboard') {
      // Manually trigger weekly leaderboard
      await this.scheduler.triggerWeeklyLeaderboard();
      await message.reply('Weekly leaderboard has been sent! 🏆');
    } else {
      await message.reply('Use `!reading today` to send today\'s reading message or `!reading leaderboard` to send the weekly leaderboard.');
    }
  }

  async handleProgressCommand(message) {
    // TODO: Implement progress tracking
    await message.reply('Progress tracking coming soon! 📊');
  }

  async handleHelpCommand(message) {
    const helpEmbed = {
      color: 0x0099ff,
      title: '📖 BibleMan Bot Commands',
      description: 'Here are the available commands:',
      fields: [
        {
          name: '!ping',
          value: 'Check if the bot is online',
          inline: true
        },
        {
          name: '!reading today',
          value: 'Send today\'s reading message',
          inline: true
        },
        {
          name: '!reading leaderboard',
          value: 'Send weekly leaderboard',
          inline: true
        },
        {
          name: '!progress',
          value: 'View your reading progress',
          inline: true
        },
        {
          name: '!help',
          value: 'Show this help message',
          inline: true
        }
      ],
      footer: {
        text: 'Daily readings are automatically sent at 5 AM CST'
      }
    };

    await message.reply({ embeds: [helpEmbed] });
  }

  async handleReaction(reaction, user, action) {
    // Check if this is a reading completion message
    if (reaction.message.author.id === this.client.user.id) {
      const messageContent = reaction.message.content.toLowerCase();
      if (messageContent.includes('bible reading') || messageContent.includes('daily reading')) {
        await this.sheetsTracker.trackReaction(reaction, user, action);
        logger.info(`User ${user.tag} ${action}ed reaction to reading message`);
      }
    }
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
      logger.info('Bot started successfully');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      this.scheduler.stop();
      await this.client.destroy();
      logger.info('Bot stopped successfully');
    } catch (error) {
      logger.error('Error stopping bot:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  if (global.bot) {
    await global.bot.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  if (global.bot) {
    await global.bot.stop();
  }
  process.exit(0);
});

// Start the bot
if (require.main === module) {
  global.bot = new BibleManBot();
  global.bot.start();
}

module.exports = BibleManBot;
