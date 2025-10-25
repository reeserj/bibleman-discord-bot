require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const SheetsTracker = require('./src/sheetsTracker.js');
const logger = require('./src/utils/logger.js');
const moment = require('moment-timezone');

/**
 * Sync Script: Sync Progress Sheet from Discord (Safe for Multiple Runs)
 * 
 * This script:
 * 1. Reads all daily reading messages from Discord
 * 2. Extracts all reactions with day numbers
 * 3. Checks if each reaction already exists in Progress sheet
 * 4. Only adds missing reactions (NO clearing of existing data)
 * 5. Safe to run on bot startup or anytime to catch missed reactions
 * 
 * Unlike migrate-from-discord.js, this DOES NOT clear existing data.
 */

class ProgressSheetSync {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
      ]
    });
    
    this.sheetsTracker = new SheetsTracker();
    this.channels = [];
    
    // Parse channels from environment
    const channelIds = process.env.DISCORD_CHANNEL_ID?.split(',').map(id => id.trim()) || [];
    this.channels = channelIds;
  }

  async initialize() {
    logger.info('🔧 Initializing sync process...');
    await this.client.login(process.env.DISCORD_TOKEN);
    logger.info('✅ Connected to Discord');
    
    await this.sheetsTracker.initialize();
    logger.info('✅ Connected to Google Sheets\n');
  }

  async collectAllReactions() {
    logger.info('📊 Collecting reactions from Discord...');
    
    const allReactions = [];
    
    for (const channelId of this.channels) {
      const reactions = await this.collectChannelReactions(channelId);
      allReactions.push(...reactions);
    }
    
    logger.info(`✅ Collected ${allReactions.length} reactions from Discord\n`);
    return allReactions;
  }

  async collectChannelReactions(channelId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        logger.warn(`Channel ${channelId} not found`);
        return [];
      }
      
      logger.info(`  Scanning #${channel.name}...`);
      
      // Fetch recent messages (limit to last 100)
      const messages = await channel.messages.fetch({ limit: 100 });
      
      // Filter for daily reading messages from our bot
      const botUser = this.client.user;
      const dailyReadingMessages = messages.filter(msg => {
        return msg.author.id === botUser.id &&
               msg.embeds.length > 0 &&
               msg.embeds[0].footer &&
               msg.embeds[0].footer.text &&
               msg.embeds[0].footer.text.includes('React with ✅ when completed');
      });
      
      const reactions = [];
      
      // Analyze each daily reading message
      for (const [messageId, message] of dailyReadingMessages) {
        const messageReactions = await this.extractMessageReactions(message, channel);
        reactions.push(...messageReactions);
      }
      
      return reactions;
      
    } catch (error) {
      logger.error(`Error collecting from channel ${channelId}:`, error.message);
      return [];
    }
  }

  async extractMessageReactions(message, channel) {
    try {
      const embed = message.embeds[0];
      
      // Extract day number from embed description
      const dayMatch = embed.description?.match(/\*\*Day (\d+)\*\*/i);
      const dayNumber = dayMatch ? parseInt(dayMatch[1]) : null;
      
      if (!dayNumber) {
        return []; // Skip messages without day numbers
      }
      
      // Get message creation date
      const messageDate = moment(message.createdAt).tz('America/Chicago');
      
      // Get all checkmark reactions
      const checkmarkReaction = message.reactions.cache.find(r => r.emoji.name === '✅');
      
      if (!checkmarkReaction || checkmarkReaction.count <= 1) {
        return []; // No user reactions
      }
      
      const reactions = [];
      
      // Fetch all users who reacted
      const reactedUsers = await checkmarkReaction.users.fetch();
      for (const [userId, user] of reactedUsers) {
        if (user.id === this.client.user.id) {
          continue; // Skip bot's own reaction
        }
        
        // Try to get nickname from guild
        let displayName = user.username;
        let guildName = 'Unknown Server';
        try {
          if (message.guild) {
            guildName = message.guild.name;
            const member = await message.guild.members.fetch(userId);
            displayName = member.nickname || member.user.username;
          }
        } catch (err) {
          // Fallback to username
        }
        
        reactions.push({
          dayNumber,
          userId,
          username: user.username,
          displayName,
          guildName,
          channelName: channel.name,
          messageDate: messageDate.format('YYYY-MM-DD'),
          reactionTime: messageDate.format('YYYY-MM-DD HH:mm:ss'),
          cstTime: messageDate.format('YYYY-MM-DD HH:mm:ss CST')
        });
      }
      
      return reactions;
      
    } catch (error) {
      logger.error(`Error extracting reactions from message ${message.id}:`, error.message);
      return [];
    }
  }

  async syncReactionsToSheet(reactions) {
    logger.info('🔄 Syncing reactions to Progress sheet...\n');
    
    if (reactions.length === 0) {
      logger.info('  No reactions to sync\n');
      return { added: 0, skipped: 0 };
    }
    
    // OPTIMIZATION: Read entire Progress sheet ONCE to avoid rate limits
    logger.info('  📖 Loading existing Progress sheet data...');
    const existingData = await this.loadExistingProgressData();
    logger.info(`  ✅ Loaded ${existingData.size} existing reactions\n`);
    
    let added = 0;
    let skipped = 0;
    const toAdd = [];
    
    // Check each reaction against in-memory data (no API calls!)
    for (const reaction of reactions) {
      const key = `${reaction.dayNumber}|${reaction.userId}|${reaction.guildName}`;
      
      if (existingData.has(key)) {
        // Already tracked, skip
        skipped++;
        logger.debug(`  ⏭️ Skipped: Day ${reaction.dayNumber} - ${reaction.displayName} (already exists)`);
      } else {
        // Need to add this one
        toAdd.push(reaction);
      }
    }
    
    // Now add all missing reactions in batch
    if (toAdd.length > 0) {
      logger.info(`  📝 Adding ${toAdd.length} missing reaction(s)...\n`);
      
      for (const reaction of toAdd) {
        try {
          await this.addReactionToSheet(reaction);
          added++;
          logger.info(`  ✅ Added: Day ${reaction.dayNumber} - ${reaction.displayName}`);
          
          // Small delay to avoid rate limiting on writes
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          logger.error(`  ❌ Error adding reaction for ${reaction.displayName} Day ${reaction.dayNumber}:`, error.message);
        }
      }
    }
    
    logger.info(`\n✅ Sync complete: ${added} added, ${skipped} skipped\n`);
    return { added, skipped };
  }
  
  async loadExistingProgressData() {
    // Read entire Progress sheet once and create a Set of keys for fast lookup
    const sheetId = process.env.READING_PLAN_SHEET_ID;
    
    const response = await this.sheetsTracker.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Progress!A:H'
    });
    
    const rows = response.data.values;
    const existingSet = new Set();
    
    if (!rows || rows.length <= 1) {
      return existingSet; // Empty or only headers
    }
    
    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const dayNumber = this.sheetsTracker.extractDayNumber(row);
      const userId = row[1]; // Column B
      const guildName = row[3] || row[5] || ''; // Column D (new) or F (old)
      
      if (dayNumber && userId) {
        const key = `${dayNumber}|${userId}|${guildName}`;
        existingSet.add(key);
      }
    }
    
    return existingSet;
  }

  async addReactionToSheet(reaction) {
    // Use the sheets API directly to add the row
    // Format: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel
    const sheetId = process.env.READING_PLAN_SHEET_ID;
    const row = [
      reaction.dayNumber,       // Column A: Day
      reaction.userId,          // Column B: User
      reaction.displayName,     // Column C: Name
      reaction.guildName,       // Column D: Guild
      reaction.messageDate,     // Column E: Date
      reaction.reactionTime,    // Column F: Reaction Time
      reaction.cstTime,         // Column G: CST Time
      reaction.channelName      // Column H: Channel
    ];
    
    await this.sheetsTracker.sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Progress!A:H',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [row]
      }
    });
  }

  async printSummary(reactions, stats) {
    logger.info('='.repeat(80));
    logger.info('📈 SYNC SUMMARY');
    logger.info('='.repeat(80));
    
    logger.info(`\nTotal reactions in Discord: ${reactions.length}`);
    logger.info(`Newly added to sheet: ${stats.added}`);
    logger.info(`Already tracked (skipped): ${stats.skipped}`);
    
    if (stats.added > 0) {
      logger.info('\n✅ Progress sheet is now in sync with Discord!');
    } else {
      logger.info('\n✅ Progress sheet was already in sync!');
    }
    
    logger.info('='.repeat(80));
  }

  async shutdown() {
    logger.info('\n🔌 Shutting down...');
    await this.client.destroy();
    logger.info('✅ Done!\n');
  }
}

// Main execution
async function main() {
  const sync = new ProgressSheetSync();
  
  try {
    logger.info('🚀 STARTING DISCORD → PROGRESS SHEET SYNC');
    logger.info('='.repeat(80));
    logger.info('');
    
    await sync.initialize();
    
    const reactions = await sync.collectAllReactions();
    const stats = await sync.syncReactionsToSheet(reactions);
    await sync.printSummary(reactions, stats);
    
    logger.info('\n✅ SYNC COMPLETE!');
    
  } catch (error) {
    logger.error('\n❌ Sync failed:', error);
    logger.error(error.stack);
  } finally {
    await sync.shutdown();
  }
}

// Run the sync
main();

