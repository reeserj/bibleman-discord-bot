require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const SheetsTracker = require('./src/sheetsTracker.js');
const logger = require('./src/utils/logger.js');

/**
 * Audit Discord Reactions Script
 * 
 * This script analyzes the current state of reactions on daily reading messages
 * to understand which days have reactions and which users have reacted.
 * 
 * It compares Discord reality with Progress sheet data to identify discrepancies.
 */

class ReactionAuditor {
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
    console.log('🔧 Initializing Discord client...');
    await this.client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Connected to Discord\n');
    
    console.log('🔧 Initializing Sheets tracker...');
    await this.sheetsTracker.initialize();
    console.log('✅ Connected to Google Sheets\n');
  }

  async auditAllChannels() {
    console.log('📊 DISCORD REACTION AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`Auditing ${this.channels.length} channel(s)\n`);
    
    const allResults = [];
    
    for (const channelId of this.channels) {
      const results = await this.auditChannel(channelId);
      allResults.push(...results);
    }
    
    // Print summary
    this.printSummary(allResults);
    
    // Compare with Progress sheet
    await this.compareWithProgressSheet(allResults);
    
    return allResults;
  }

  async auditChannel(channelId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        console.log(`❌ Channel ${channelId} not found\n`);
        return [];
      }
      
      console.log(`\n📖 Channel: #${channel.name} (${channelId})`);
      console.log('-'.repeat(80));
      
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
      
      console.log(`Found ${dailyReadingMessages.size} daily reading message(s)\n`);
      
      const results = [];
      
      // Analyze each daily reading message
      for (const [messageId, message] of dailyReadingMessages) {
        const result = await this.analyzeMessage(message, channel);
        if (result) {
          results.push(result);
          this.printMessageReport(result);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error(`❌ Error auditing channel ${channelId}:`, error.message);
      return [];
    }
  }

  async analyzeMessage(message, channel) {
    try {
      const embed = message.embeds[0];
      
      // Extract day number from embed description
      const dayMatch = embed.description?.match(/\*\*Day (\d+)\*\*/i);
      const dayNumber = dayMatch ? parseInt(dayMatch[1]) : null;
      
      // Extract reading assignment
      const readingMatch = embed.description?.match(/📖 \*\*(.*?)\*\*/);
      const reading = readingMatch ? readingMatch[1] : 'Unknown';
      
      // Get message timestamp
      const messageDate = message.createdAt.toISOString().split('T')[0];
      
      // Get all reactions
      const checkmarkReaction = message.reactions.cache.find(r => r.emoji.name === '✅');
      
      const users = [];
      if (checkmarkReaction) {
        // Fetch all users who reacted
        const reactedUsers = await checkmarkReaction.users.fetch();
        for (const [userId, user] of reactedUsers) {
          if (user.id !== this.client.user.id) { // Skip bot's own reaction
            // Try to get nickname from guild
            let displayName = user.username;
            try {
              const member = await message.guild.members.fetch(userId);
              displayName = member.nickname || member.user.username;
            } catch (err) {
              // Fallback to username
            }
            
            users.push({
              id: userId,
              username: user.username,
              displayName: displayName
            });
          }
        }
      }
      
      return {
        messageId: message.id,
        channelName: channel.name,
        channelId: channel.id,
        guildName: message.guild?.name || 'Unknown',
        dayNumber,
        reading,
        messageDate,
        reactionCount: users.length,
        users
      };
      
    } catch (error) {
      console.error(`Error analyzing message ${message.id}:`, error.message);
      return null;
    }
  }

  printMessageReport(result) {
    console.log(`Day ${result.dayNumber || '?'} - ${result.reading}`);
    console.log(`  Message Date: ${result.messageDate}`);
    console.log(`  Message ID: ${result.messageId}`);
    console.log(`  Reactions: ${result.reactionCount} user(s)`);
    
    if (result.users.length > 0) {
      result.users.forEach(user => {
        console.log(`    ✅ ${user.displayName} (${user.username})`);
      });
    } else {
      console.log(`    (no reactions yet)`);
    }
    console.log('');
  }

  printSummary(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📈 SUMMARY');
    console.log('='.repeat(80));
    
    const totalMessages = results.length;
    const messagesWithReactions = results.filter(r => r.reactionCount > 0).length;
    const totalReactions = results.reduce((sum, r) => sum + r.reactionCount, 0);
    
    console.log(`\nTotal daily reading messages: ${totalMessages}`);
    console.log(`Messages with reactions: ${messagesWithReactions}`);
    console.log(`Total reactions: ${totalReactions}\n`);
    
    // Group by day number
    const byDay = {};
    results.forEach(r => {
      if (r.dayNumber) {
        if (!byDay[r.dayNumber]) {
          byDay[r.dayNumber] = [];
        }
        byDay[r.dayNumber].push(r);
      }
    });
    
    console.log('Reactions by Day:');
    const days = Object.keys(byDay).sort((a, b) => parseInt(a) - parseInt(b));
    days.forEach(day => {
      const dayResults = byDay[day];
      const totalForDay = dayResults.reduce((sum, r) => sum + r.reactionCount, 0);
      console.log(`  Day ${day}: ${totalForDay} reaction(s)`);
    });
    
    // Group by user
    const byUser = {};
    results.forEach(r => {
      r.users.forEach(user => {
        if (!byUser[user.displayName]) {
          byUser[user.displayName] = {
            userId: user.id,
            username: user.username,
            days: []
          };
        }
        byUser[user.displayName].days.push(r.dayNumber);
      });
    });
    
    console.log('\nReactions by User:');
    const userNames = Object.keys(byUser).sort();
    userNames.forEach(name => {
      const userData = byUser[name];
      const days = userData.days.sort((a, b) => a - b);
      console.log(`  ${name}: ${days.length} day(s) completed - Days [${days.join(', ')}]`);
    });
  }

  async compareWithProgressSheet(results) {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPARISON WITH PROGRESS SHEET');
    console.log('='.repeat(80));
    
    try {
      // Get leaderboard data from Progress sheet
      const leaderboard = await this.sheetsTracker.getLeaderboard();
      
      console.log('\nProgress Sheet Data:');
      leaderboard.forEach(user => {
        console.log(`  ${user.username}: ${user.completedDays} day(s) recorded`);
      });
      
      // Build Discord reaction map by user ID
      const discordByUser = {};
      results.forEach(r => {
        r.users.forEach(user => {
          if (!discordByUser[user.id]) {
            discordByUser[user.id] = {
              displayName: user.displayName,
              username: user.username,
              days: new Set()
            };
          }
          if (r.dayNumber) {
            discordByUser[user.id].days.add(r.dayNumber);
          }
        });
      });
      
      console.log('\n📊 Discrepancy Analysis:');
      
      // Check for users in Discord but not in sheet
      const discordUserIds = Object.keys(discordByUser);
      const sheetUserIds = leaderboard.map(u => u.userId);
      
      let hasDiscrepancies = false;
      
      for (const userId of discordUserIds) {
        const discordData = discordByUser[userId];
        const sheetData = leaderboard.find(u => u.userId === userId);
        
        const discordDays = discordData.days.size;
        const sheetDays = sheetData ? sheetData.completedDays : 0;
        
        if (discordDays !== sheetDays) {
          hasDiscrepancies = true;
          console.log(`\n  ⚠️ ${discordData.displayName}:`);
          console.log(`    Discord reactions: ${discordDays} days`);
          console.log(`    Progress sheet: ${sheetDays} days`);
          console.log(`    Difference: ${discordDays - sheetDays} days`);
          console.log(`    Discord days: [${Array.from(discordData.days).sort((a,b) => a-b).join(', ')}]`);
        }
      }
      
      if (!hasDiscrepancies) {
        console.log('\n  ✅ No discrepancies found! Discord and Progress sheet match.');
      }
      
    } catch (error) {
      console.error('\n❌ Error comparing with Progress sheet:', error.message);
    }
  }

  async shutdown() {
    console.log('\n🔌 Shutting down...');
    await this.client.destroy();
    console.log('✅ Done!\n');
  }
}

// Main execution
async function main() {
  const auditor = new ReactionAuditor();
  
  try {
    await auditor.initialize();
    await auditor.auditAllChannels();
  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    await auditor.shutdown();
  }
}

// Run the audit
main();

