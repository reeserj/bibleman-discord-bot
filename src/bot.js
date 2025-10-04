const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const Scheduler = require('./scheduler');
const SheetsParser = require('./sheetsParser');
const SheetsTracker = require('./sheetsTracker');
const MessageFormatter = require('./messageFormatter');
const GuildConfig = require('./guildConfig');
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

    this.messageFormatter = new MessageFormatter();
    this.sheetsParser = new SheetsParser();
    this.sheetsTracker = new SheetsTracker();
    this.guildConfig = new GuildConfig();
    this.scheduler = new Scheduler(this.client, this.messageFormatter, this.sheetsParser, this.sheetsTracker, this.guildConfig);

    this.setupEventHandlers();
    this.registerSlashCommands();
  }

  async registerSlashCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set the channel for Bible reading messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      logger.info('Started refreshing application (/) commands.');
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commands.map(cmd => cmd.toJSON()) }
      );
      logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
      logger.error('Error registering slash commands:', error);
    }
  }

  setupEventHandlers() {
    this.client.once('ready', async () => {
      logger.info(`Logged in as ${this.client.user.tag}`);
      logger.info(`Bot is ready! Serving ${this.client.guilds.cache.size} guilds`);
      await this.guildConfig.load();
      this.scheduler.startDailySchedule();
    });

    this.client.on('messageReactionAdd', async (reaction, user) => {
      logger.info(`Reaction add detected: ${user.tag} reacted with ${reaction.emoji.name} on message ${reaction.message.id}`);
      if (user.bot) return;
      
      try {
        await this.handleReaction(reaction, user, 'add');
      } catch (error) {
        logger.error('Error handling reaction add:', error);
        logger.error('Error details:', error.message);
        logger.error('Error stack:', error.stack);
      }
    });

    this.client.on('messageReactionRemove', async (reaction, user) => {
      logger.info(`Reaction remove detected: ${user.tag} removed ${reaction.emoji.name} from message ${reaction.message.id}`);
      if (user.bot) return;
      
      try {
        await this.handleReaction(reaction, user, 'remove');
      } catch (error) {
        logger.error('Error handling reaction remove:', error);
        logger.error('Error details:', error.message);
        logger.error('Error stack:', error.stack);
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

    this.client.on('guildCreate', async (guild) => {
      await this.handleGuildJoin(guild);
    });

    this.client.on('guildDelete', async (guild) => {
      await this.guildConfig.removeGuild(guild.id);
      logger.info(`Bot removed from guild: ${guild.name} (${guild.id})`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isCommand()) {
        await this.handleSlashCommand(interaction);
      } else if (interaction.isStringSelectMenu()) {
        await this.handleSelectMenu(interaction);
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
        
      case 'leaderboard':
        await this.handleLeaderboardCommand(message);
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
    } else {
      await message.reply('Use `!reading today` to send today\'s reading message.');
    }
  }

  async handleLeaderboardCommand(message) {
    // Manually trigger weekly leaderboard
    await this.scheduler.triggerWeeklyLeaderboard();
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
          name: '!leaderboard',
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

  async handleGuildJoin(guild) {
    logger.info(`Bot joined guild: ${guild.name} (${guild.id})`);
    
    // Check if owner has DM permissions, otherwise find a channel to send message
    try {
      const owner = await guild.fetchOwner();
      const welcomeMessage = `👋 Thanks for adding me to **${guild.name}**!\n\n` +
        `To get started, please use the \`/setchannel\` command in your server to select which channel I should send daily Bible reading messages to.\n\n` +
        `Only administrators can use this command.`;
      
      await owner.send(welcomeMessage);
      logger.info(`Sent welcome DM to ${owner.user.tag}`);
    } catch (error) {
      logger.info('Could not send DM to owner, trying to send in a channel');
      
      // Try to find a suitable channel to send the message
      const channel = guild.channels.cache.find(ch => 
        ch.type === ChannelType.GuildText && 
        ch.permissionsFor(guild.members.me).has(PermissionFlagsBits.SendMessages)
      );
      
      if (channel) {
        const welcomeMessage = `👋 Thanks for adding me to **${guild.name}**!\n\n` +
          `To get started, please use the \`/setchannel\` command to select which channel I should send daily Bible reading messages to.\n\n` +
          `Only administrators can use this command.`;
        
        await channel.send(welcomeMessage);
        logger.info(`Sent welcome message in #${channel.name}`);
      }
    }
  }

  async handleSlashCommand(interaction) {
    if (interaction.commandName === 'setchannel') {
      await this.showChannelSelector(interaction);
    }
  }

  async showChannelSelector(interaction) {
    const guild = interaction.guild;
    const textChannels = guild.channels.cache
      .filter(ch => ch.type === ChannelType.GuildText)
      .sort((a, b) => a.position - b.position)
      .first(25); // Discord limit for select menu options

    if (textChannels.length === 0) {
      await interaction.reply({
        content: '❌ No text channels found in this server.',
        ephemeral: true
      });
      return;
    }

    const options = textChannels.map(channel => ({
      label: `#${channel.name}`,
      description: channel.topic ? channel.topic.substring(0, 100) : 'No description',
      value: channel.id
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('channel_select')
      .setPlaceholder('Select a channel for Bible readings')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const currentChannel = this.guildConfig.getChannelId(guild.id);
    const currentChannelText = currentChannel 
      ? `\n\nCurrently set to: <#${currentChannel}>` 
      : '';

    await interaction.reply({
      content: `📖 Select which channel should receive daily Bible reading messages:${currentChannelText}`,
      components: [row],
      ephemeral: true
    });
  }

  async handleSelectMenu(interaction) {
    if (interaction.customId === 'channel_select') {
      const channelId = interaction.values[0];
      const channel = interaction.guild.channels.cache.get(channelId);
      
      if (!channel) {
        await interaction.update({
          content: '❌ Channel not found.',
          components: []
        });
        return;
      }

      // Check if bot has permissions in the selected channel
      const permissions = channel.permissionsFor(interaction.guild.members.me);
      const requiredPerms = [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AddReactions
      ];

      const missingPerms = requiredPerms.filter(perm => !permissions.has(perm));
      
      if (missingPerms.length > 0) {
        const permNames = missingPerms.map(perm => {
          const entry = Object.entries(PermissionFlagsBits).find(([, value]) => value === perm);
          return entry ? entry[0] : 'Unknown';
        });
        
        await interaction.update({
          content: `⚠️ I don't have the required permissions in <#${channelId}>.\n\n` +
            `Missing permissions: ${permNames.join(', ')}\n\n` +
            `Please grant these permissions and try again.`,
          components: []
        });
        return;
      }

      // Save the channel configuration
      await this.guildConfig.setChannelId(interaction.guild.id, channelId);
      
      await interaction.update({
        content: `✅ Successfully set <#${channelId}> as the channel for daily Bible reading messages!\n\n` +
          `Daily readings will be sent at 5 AM CST.`,
        components: []
      });

      logger.info(`Channel set to ${channelId} for guild ${interaction.guild.id}`);
    }
  }

  async handleReaction(reaction, user, action) {
    try {
      logger.info(`Handling reaction: ${user.tag} ${action}ed ${reaction.emoji.name} on message ${reaction.message.id}`);
      
      // Fetch the full message if it's partial
      let message = reaction.message;
      if (message.partial) {
        try {
          message = await message.fetch();
          logger.info('Fetched partial message');
        } catch (fetchError) {
          logger.error('Error fetching partial message:', fetchError);
          return;
        }
      }
      
      // Check if this is a reading completion message from our bot
      if (message.author && message.author.id === this.client.user.id) {
        logger.info('Reaction is on a bot message, tracking it');
        await this.sheetsTracker.trackReaction(reaction, user, action);
        logger.info(`User ${user.tag} ${action}ed reaction to reading message`);
      } else {
        logger.info('Reaction is not on a bot message, ignoring');
      }
    } catch (error) {
      logger.error('Error in handleReaction:', error);
      logger.error('Error details:', error.message);
      logger.error('Error stack:', error.stack);
      throw error; // Re-throw to be caught by the outer handler
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
