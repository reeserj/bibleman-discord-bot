#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupBot() {
  console.log('🤖 BibleMan Bot Setup Wizard');
  console.log('=' .repeat(50));
  console.log('');

  // Check if .env already exists
  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    console.log('📁 Found existing .env file');
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  console.log('🔧 Let\'s configure your Discord bot settings...');
  console.log('');

  // Discord Bot Configuration
  console.log('📋 Discord Bot Configuration:');
  console.log('✅ Bot Token: [YOUR_BOT_TOKEN_HERE]');
  console.log('✅ Client ID: 1406750559083565196');
  console.log('');

  // Get Server ID
  console.log('🏠 Discord Server Setup:');
  console.log('1. Enable Developer Mode in Discord:');
  console.log('   • Go to Discord Settings → Advanced → Developer Mode (toggle ON)');
  console.log('2. Get your Server ID:');
  console.log('   • Right-click your server name in the server list');
  console.log('   • Click "Copy Server ID"');
  console.log('');

  const serverId = await question('📋 Enter your Discord Server ID: ');

  // Get Channel ID
  console.log('');
  console.log('📺 Discord Channel Setup:');
  console.log('1. Get your Channel ID:');
  console.log('   • Right-click the channel where you want bot messages');
  console.log('   • Click "Copy Channel ID"');
  console.log('   • This is where daily readings and weekly leaderboards will be sent');
  console.log('');

  const channelId = await question('📋 Enter your Discord Channel ID: ');

  // Google Sheets Configuration
  console.log('');
  console.log('📊 Google Sheets Configuration:');
  console.log('✅ Reading Plan Sheet ID: 1fqg_0b8BiIF_AHS5VR7rT2Xi3FxR6_5u7wuWw_qtOls');
  console.log('✅ Reading Plan Sheet Name: 2026 plan');
  console.log('');

  const progressSheetId = await question('📋 Enter your Progress Tracking Sheet ID (or press Enter to create later): ');

  // Bot Configuration
  console.log('');
  console.log('⚙️ Bot Configuration:');
  const botPrefix = await question('📋 Bot command prefix (default: !): ') || '!';
  const timezone = await question('📋 Timezone (default: America/Chicago): ') || 'America/Chicago';
  const logLevel = await question('📋 Log level (default: info): ') || 'info';

  // Build .env content
  const newEnvContent = `# Discord Bot Configuration
DISCORD_TOKEN=[YOUR_BOT_TOKEN_HERE]
DISCORD_CLIENT_ID=1406750559083565196
DISCORD_GUILD_ID=${serverId}
DISCORD_CHANNEL_ID=${channelId}

# Google Sheets Configuration
GOOGLE_SHEETS_CREDENTIALS=./data/credentials.json
READING_PLAN_SHEET_ID=1fqg_0b8BiIF_AHS5VR7rT2Xi3FxR6_5u7wuWw_qtOls
READING_PLAN_SHEET_NAME=2026 plan
PROGRESS_TRACKING_SHEET_ID=${progressSheetId || 'your_progress_tracking_sheet_id_here'}

# Bot Configuration
BOT_PREFIX=${botPrefix}
TIMEZONE=${timezone}
SCHEDULE_TIME=0 5 * * *  # 5 AM CST daily

# Logging
LOG_LEVEL=${logLevel}
`;

  // Write .env file
  fs.writeFileSync(envPath, newEnvContent);

  console.log('');
  console.log('✅ Configuration Complete!');
  console.log('=' .repeat(50));
  console.log('');
  console.log('📁 .env file created with your settings:');
  console.log(`🏠 Server ID: ${serverId}`);
  console.log(`📺 Channel ID: ${channelId}`);
  console.log(`🤖 Bot Prefix: ${botPrefix}`);
  console.log(`🌍 Timezone: ${timezone}`);
  console.log('');

  // Next steps
  console.log('🚀 Next Steps:');
  console.log('1. Make sure your bot is invited to your Discord server');
  console.log('2. Run: npm start (to test the bot)');
  console.log('3. Set up Google Sheets API credentials (Phase 2)');
  console.log('');

  // Test connection option
  const testConnection = await question('🤔 Would you like to test the bot connection now? (y/n): ');
  
  if (testConnection.toLowerCase() === 'y' || testConnection.toLowerCase() === 'yes') {
    console.log('');
    console.log('🧪 Testing bot connection...');
    console.log('Starting bot in test mode...');
    
    // Import and test the bot
    try {
      const { Bot } = require('./src/bot.js');
      const bot = new Bot();
      
             bot.on('ready', () => {
         console.log('✅ Bot connected successfully!');
         console.log(`🤖 Logged in as: ${bot.client.user.tag}`);
         
         const server = bot.client.guilds.cache.get(serverId);
         const channel = bot.client.channels.cache.get(channelId);
         
         console.log(`🏠 Connected to server: ${server ? server.name : 'Unknown'}`);
         console.log(`📺 Target channel: ${channel ? channel.name : 'Unknown'}`);
         console.log('');
         console.log('🎉 Setup complete! Your bot is ready to use.');
         console.log('Press Ctrl+C to stop the test.');
         
         // Stop the bot after showing success
         setTimeout(() => {
           console.log('🛑 Stopping test...');
           bot.stop();
           process.exit(0);
         }, 5000);
       });

      bot.on('error', (error) => {
        console.error('❌ Bot connection failed:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check if your bot token is correct');
        console.log('2. Make sure the bot is invited to your server');
        console.log('3. Verify the server and channel IDs');
        process.exit(1);
      });

      bot.start();
      
    } catch (error) {
      console.error('❌ Error starting bot:', error.message);
      console.log('');
      console.log('🔧 Make sure you have:');
      console.log('1. Installed dependencies: npm install');
      console.log('2. Created the .env file correctly');
      process.exit(1);
    }
  } else {
    console.log('');
    console.log('📝 To test later, run: npm start');
    console.log('🎉 Setup complete!');
  }

  rl.close();
}

// Handle errors
process.on('SIGINT', () => {
  console.log('\n🛑 Setup cancelled.');
  rl.close();
  process.exit(0);
});

// Run setup
setupBot().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
