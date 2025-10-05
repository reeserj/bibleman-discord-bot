const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const Scheduler = require('./scheduler');
const SheetsParser = require('./sheetsParser');
const SheetsTracker = require('./sheetsTracker');
const MessageFormatter = require('./messageFormatter');
const GuildConfig = require('./guildConfig');
const GroupMeService = require('./groupmeService');
const WebhookServer = require('./webhookServer');
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
    this.groupMeService = new GroupMeService();
    this.scheduler = new Scheduler(this.client, this.messageFormatter, this.sheetsParser, this.sheetsTracker, this.guildConfig);
    this.webhookServer = new WebhookServer(this);

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
    // Check if this is a lockerroom channel that should forward to GroupMe
    if (this.isLockerroomChannel(message.channel)) {
      await this.handleLockerroomMessage(message);
    }

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
        
      case 'testgroupme':
        await this.handleTestGroupMeCommand(message);
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
          name: '!testgroupme',
          value: 'Test GroupMe integration',
          inline: true
        },
        {
          name: '!help',
          value: 'Show this help message',
          inline: true
        }
      ],
      footer: {
        text: 'Daily readings are automatically sent at 5 AM CST to Discord and GroupMe'
      }
    };

    await message.reply({ embeds: [helpEmbed] });
  }

  async handleTestGroupMeCommand(message) {
    try {
      const success = await this.groupMeService.testConnection();
      
      if (success) {
        await message.reply('✅ GroupMe integration test successful!');
      } else {
        await message.reply('❌ GroupMe integration test failed. Check logs for details.');
      }
    } catch (error) {
      logger.error('Error testing GroupMe connection:', error);
      await message.reply('❌ GroupMe integration test failed. Check logs for details.');
    }
  }

  isLockerroomChannel(channel) {
    // Check if this channel should forward messages to GroupMe lockerroom
    // You can customize this logic based on channel name, ID, or other criteria
    const lockerroomChannelNames = ['lockerroom', 'locker-room', 'team-chat', 'general'];
    const channelName = channel.name.toLowerCase();
    
    return lockerroomChannelNames.some(name => channelName.includes(name));
  }

  async handleLockerroomMessage(message) {
    try {
      // Skip bot messages and command messages
      if (message.author.bot || message.content.startsWith(process.env.BOT_PREFIX || '!')) {
        return;
      }

      // Create a formatted message for GroupMe
      const groupMeMessage = this.formatLockerroomMessageForGroupMe(message);
      
      // Send to GroupMe lockerroom
      const success = await this.groupMeService.sendLockerroomMessage(groupMeMessage);
      
      if (success) {
        logger.info(`Forwarded lockerroom message from ${message.author.tag} to GroupMe`);
      } else {
        logger.warn(`Failed to forward lockerroom message from ${message.author.tag} to GroupMe`);
      }
    } catch (error) {
      logger.error('Error handling lockerroom message:', error);
    }
  }

  formatLockerroomMessageForGroupMe(message) {
    const author = message.author;
    const content = message.content;
    const channel = message.channel;
    const guild = message.guild;
    
    // Format the message for GroupMe
    let groupMeMessage = `*${author.displayName || author.username}* (Discord - ${guild.name}):\n`;
    groupMeMessage += content;
    
    // Add channel context if not in general channel
    if (channel.name !== 'general' && channel.name !== 'lockerroom') {
      groupMeMessage += `\n_#${channel.name}_`;
    }
    
    // Handle attachments
    if (message.attachments.size > 0) {
      groupMeMessage += '\n\n📎 *Attachment(s):*';
      message.attachments.forEach(attachment => {
        groupMeMessage += `\n${attachment.url}`;
      });
    }
    
    // Handle embeds
    if (message.embeds.length > 0) {
      groupMeMessage += '\n\n🔗 *Embed(s):*';
      message.embeds.forEach(embed => {
        if (embed.title) groupMeMessage += `\n${embed.title}`;
        if (embed.description) groupMeMessage += `\n${embed.description}`;
        if (embed.url) groupMeMessage += `\n${embed.url}`;
      });
    }
    
    return groupMeMessage;
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
      
      // Ensure bot user is available
      if (!this.client.user) {
        logger.warn('Bot user not available yet, skipping reaction tracking');
        return;
      }
      
      // Check if this is a reading completion message from our bot
      if (message.author && message.author.id === this.client.user.id) {
        // Additional check: only track reactions on daily reading messages
        // Daily reading messages have embeds with "React with ✅ when completed" in footer
        const isDailyReadingMessage = message.embeds && 
          message.embeds.length > 0 && 
          message.embeds[0].footer && 
          message.embeds[0].footer.text && 
          message.embeds[0].footer.text.includes('React with ✅ when completed');
        
        if (isDailyReadingMessage) {
          logger.info(`Reaction is on a daily reading message (author: ${message.author.tag}, bot: ${this.client.user.tag}), tracking it`);
          await this.sheetsTracker.trackReaction(reaction, user, action);
          logger.info(`User ${user.tag} ${action}ed reaction to reading message`);
        } else {
          logger.info(`Reaction is on a bot message but not a daily reading message, ignoring`);
        }
      } else {
        const authorTag = message.author ? message.author.tag : 'Unknown';
        const botTag = this.client.user ? this.client.user.tag : 'Unknown';
        logger.info(`Reaction is not on a bot message (author: ${authorTag}, bot: ${botTag}), ignoring`);
      }
    } catch (error) {
      logger.error('Error in handleReaction:', error);
      logger.error('Error details:', error.message);
      logger.error('Error stack:', error.stack);
      throw error; // Re-throw to be caught by the outer handler
    }
  }

  async handleGroupMeMessage(groupMeMessage) {
    try {
      // Don't process messages from the bot itself
      if (groupMeMessage.user_id === 'system') {
        return;
      }

      // Get the group name for logging
      const groupName = groupMeMessage.name || 'Unknown Group';
      const userName = groupMeMessage.name || 'Unknown User';
      const messageText = groupMeMessage.text || '';

      logger.info(`Processing GroupMe message from ${userName} in ${groupName}: ${messageText.substring(0, 100)}`);

      // Find the corresponding Discord channel based on group
      const discordChannelId = this.getDiscordChannelForGroup(groupMeMessage.group_id);
      
      if (!discordChannelId) {
        logger.warn(`No Discord channel configured for GroupMe group ${groupMeMessage.group_id}`);
        return;
      }

      // Get the Discord channel
      const channel = this.client.channels.cache.get(discordChannelId);
      if (!channel) {
        logger.error(`Discord channel ${discordChannelId} not found`);
        return;
      }

      // Format the message for Discord
      const discordMessage = this.formatGroupMeMessageForDiscord(groupMeMessage);
      
      // Send to Discord
      await channel.send(discordMessage);
      logger.info(`Forwarded GroupMe message to Discord channel ${channel.name}`);

    } catch (error) {
      logger.error('Error handling GroupMe message:', error);
    }
  }

  getDiscordChannelForGroup(groupMeGroupId) {
    // Map GroupMe group IDs to Discord channel IDs
    // You can configure this mapping in your environment variables or config
    
    // Bible Plan group -> configured Discord channel
    if (groupMeGroupId === process.env.GROUPME_BIBLE_PLAN_GROUP_ID) {
      return process.env.DISCORD_CHANNEL_ID;
    }
    
    // Lockerroom group -> configured lockerroom channel (if you have one)
    if (groupMeGroupId === process.env.GROUPME_LOCKERROOM_GROUP_ID) {
      return process.env.DISCORD_LOCKERROOM_CHANNEL_ID;
    }

    // Default fallback
    return process.env.DISCORD_CHANNEL_ID;
  }

  formatGroupMeMessageForDiscord(groupMeMessage) {
    const userName = groupMeMessage.name || 'Unknown User';
    const messageText = groupMeMessage.text || '';
    
    // Format as Discord embed for better presentation
    return {
      embeds: [{
        color: 0x00BFFF, // GroupMe blue color
        author: {
          name: `${userName} (GroupMe)`,
          icon_url: groupMeMessage.avatar_url
        },
        description: messageText,
        timestamp: new Date(groupMeMessage.created_at * 1000).toISOString(),
        footer: {
          text: 'via GroupMe'
        }
      }]
    };
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_TOKEN);
      
      // Start webhook server if enabled
      if (process.env.ENABLE_WEBHOOK_SERVER === 'true') {
        await this.webhookServer.start();
      }
      
      logger.info('Bot started successfully');
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      this.scheduler.stop();
      
      // Stop webhook server if it's running
      if (this.webhookServer) {
        await this.webhookServer.stop();
      }
      
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
