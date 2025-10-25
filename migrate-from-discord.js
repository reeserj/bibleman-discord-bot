require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

/**
 * Migration Script: Rebuild Progress Sheet from Discord Reactions
 * 
 * This script:
 * 1. Clears the existing Progress sheet
 * 2. Reads all daily reading messages from Discord
 * 3. Extracts all reactions with day numbers
 * 4. Writes to Progress sheet in NEW format (Day | User | Name | Guild | ...)
 */

class ProgressSheetMigration {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
      ]
    });
    
    this.sheets = null;
    this.channels = [];
    
    // Parse channels from environment
    const channelIds = process.env.DISCORD_CHANNEL_ID?.split(',').map(id => id.trim()) || [];
    this.channels = channelIds;
  }

  async initialize() {
    console.log('🔧 Initializing Discord client...');
    await this.client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Connected to Discord\n');
    
    console.log('🔧 Initializing Google Sheets...');
    const credentialsPath = path.join(__dirname, 'data', 'credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    this.sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Connected to Google Sheets\n');
  }

  async clearProgressSheet() {
    console.log('🗑️  Clearing existing Progress sheet data...');
    
    const sheetId = process.env.READING_PLAN_SHEET_ID;
    
    try {
      // Get the sheet to find how many rows exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Progress!A:H'
      });
      
      const rows = response.data.values;
      const rowCount = rows ? rows.length : 0;
      
      if (rowCount <= 1) {
        console.log('   No data to clear (only headers or empty)\n');
        return;
      }
      
      // Clear all data except header (row 1)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: 'Progress!A2:H'
      });
      
      console.log(`   ✅ Cleared ${rowCount - 1} rows of old data\n`);
      
    } catch (error) {
      console.error('❌ Error clearing sheet:', error.message);
      throw error;
    }
  }

  async ensureCorrectHeaders() {
    console.log('📋 Ensuring correct header row...');
    
    const sheetId = process.env.READING_PLAN_SHEET_ID;
    
    // NEW STRUCTURE: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel
    const headers = ['Day', 'User', 'Name', 'Guild', 'Date', 'Reaction Time (CST)', 'CST Time', 'Channel'];
    
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: 'Progress!A1:H1',
      valueInputOption: 'RAW',
      resource: {
        values: [headers]
      }
    });
    
    console.log('   ✅ Headers set to: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel\n');
  }

  async collectAllReactions() {
    console.log('📊 Collecting all reactions from Discord...\n');
    
    const allReactions = [];
    
    for (const channelId of this.channels) {
      const reactions = await this.collectChannelReactions(channelId);
      allReactions.push(...reactions);
    }
    
    console.log(`\n✅ Collected ${allReactions.length} total reactions\n`);
    return allReactions;
  }

  async collectChannelReactions(channelId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        console.log(`❌ Channel ${channelId} not found`);
        return [];
      }
      
      console.log(`   📖 Channel: #${channel.name}`);
      
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
      
      console.log(`   Found ${dailyReadingMessages.size} daily reading message(s)`);
      
      const reactions = [];
      
      // Analyze each daily reading message
      for (const [messageId, message] of dailyReadingMessages) {
        const messageReactions = await this.extractMessageReactions(message, channel);
        reactions.push(...messageReactions);
      }
      
      console.log(`   Collected ${reactions.length} reactions from this channel`);
      
      return reactions;
      
    } catch (error) {
      console.error(`❌ Error collecting from channel ${channelId}:`, error.message);
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
        console.log(`      ⚠️ Message ${message.id} has no day number, skipping`);
        return [];
      }
      
      // Get message creation date
      const messageDate = moment(message.createdAt).tz('America/Chicago');
      
      // Get all checkmark reactions
      const checkmarkReaction = message.reactions.cache.find(r => r.emoji.name === '✅');
      
      if (!checkmarkReaction || checkmarkReaction.count <= 1) {
        // No user reactions (bot's reaction doesn't count)
        return [];
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
        try {
          const member = await message.guild.members.fetch(userId);
          displayName = member.nickname || member.user.username;
        } catch (err) {
          // Fallback to username
        }
        
        reactions.push({
          dayNumber,
          userId,
          username: user.username,
          displayName,
          guildName: message.guild?.name || 'Unknown Server',
          channelName: channel.name,
          messageDate: messageDate.format('YYYY-MM-DD'),
          reactionTime: messageDate.format('YYYY-MM-DD HH:mm:ss'),
          cstTime: messageDate.format('YYYY-MM-DD HH:mm:ss CST')
        });
      }
      
      if (reactions.length > 0) {
        console.log(`      Day ${dayNumber}: ${reactions.length} reaction(s)`);
      }
      
      return reactions;
      
    } catch (error) {
      console.error(`Error extracting reactions from message ${message.id}:`, error.message);
      return [];
    }
  }

  async writeReactionsToSheet(reactions) {
    console.log('📝 Writing reactions to Progress sheet...\n');
    
    if (reactions.length === 0) {
      console.log('   No reactions to write\n');
      return;
    }
    
    const sheetId = process.env.READING_PLAN_SHEET_ID;
    
    // Prepare rows in NEW format: Day | User | Name | Guild | Date | Reaction Time | CST Time | Channel
    const rows = reactions.map(r => [
      r.dayNumber,          // Column A: Day
      r.userId,             // Column B: User
      r.displayName,        // Column C: Name
      r.guildName,          // Column D: Guild
      r.messageDate,        // Column E: Date
      r.reactionTime,       // Column F: Reaction Time
      r.cstTime,            // Column G: CST Time
      r.channelName         // Column H: Channel
    ]);
    
    // Sort by day number, then by user ID for consistent ordering
    rows.sort((a, b) => {
      if (a[0] !== b[0]) return a[0] - b[0]; // Sort by day
      return a[1].localeCompare(b[1]); // Then by user ID
    });
    
    // Write in batches of 100 to avoid rate limits
    const batchSize = 100;
    let written = 0;
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Progress!A:H',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: batch
        }
      });
      
      written += batch.length;
      console.log(`   ✅ Wrote ${written}/${rows.length} reactions...`);
      
      // Small delay to avoid rate limiting
      if (i + batchSize < rows.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n✅ Successfully wrote ${written} reactions to Progress sheet\n`);
  }

  async printSummary(reactions) {
    console.log('='.repeat(80));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    
    // Group by day
    const byDay = {};
    reactions.forEach(r => {
      if (!byDay[r.dayNumber]) {
        byDay[r.dayNumber] = 0;
      }
      byDay[r.dayNumber]++;
    });
    
    console.log('\nReactions by Day:');
    const days = Object.keys(byDay).sort((a, b) => parseInt(a) - parseInt(b));
    days.forEach(day => {
      console.log(`  Day ${day}: ${byDay[day]} reaction(s)`);
    });
    
    // Group by user
    const byUser = {};
    reactions.forEach(r => {
      if (!byUser[r.displayName]) {
        byUser[r.displayName] = new Set();
      }
      byUser[r.displayName].add(r.dayNumber);
    });
    
    console.log('\nReactions by User:');
    const userNames = Object.keys(byUser).sort();
    userNames.forEach(name => {
      const days = Array.from(byUser[name]).sort((a, b) => a - b);
      console.log(`  ${name}: ${days.length} day(s) completed - Days [${days.join(', ')}]`);
    });
    
    console.log('\n' + '='.repeat(80));
  }

  async shutdown() {
    console.log('\n🔌 Shutting down...');
    await this.client.destroy();
    console.log('✅ Done!\n');
  }
}

// Main execution
async function main() {
  const migration = new ProgressSheetMigration();
  
  try {
    console.log('🚀 STARTING PROGRESS SHEET MIGRATION FROM DISCORD');
    console.log('='.repeat(80));
    console.log('');
    
    await migration.initialize();
    await migration.clearProgressSheet();
    await migration.ensureCorrectHeaders();
    
    const reactions = await migration.collectAllReactions();
    await migration.writeReactionsToSheet(reactions);
    await migration.printSummary(reactions);
    
    console.log('');
    console.log('✅ MIGRATION COMPLETE!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the audit script to verify: node audit-discord-reactions.js');
    console.log('2. Check the leaderboard: node test-new-tracking.js');
    console.log('3. Restart the bot to use the new data');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
  } finally {
    await migration.shutdown();
  }
}

// Run the migration
main();

