const { Client, GatewayIntentBits, Partials } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const Scheduler = require('./scheduler');
const SheetsParser = require('./sheetsParser');
const SheetsTracker = require('./sheetsTracker');
const MessageFormatter = require('./messageFormatter');
const logger = require('./utils/logger');

class BibleManBot {
  constructor() {
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

    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
    });
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
