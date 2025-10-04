const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

client.once('ready', async () => {
  try {
    console.log('Checking bot permissions...\n');
    
    const guildId = process.env.DISCORD_GUILD_ID;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    
    const guild = await client.guilds.fetch(guildId);
    const channel = await client.channels.fetch(channelId);
    
    console.log(`Server: "${guild.name}"`);
    console.log(`Channel: "#${channel.name}"\n`);
    
    // Get bot's permissions in this channel
    const botMember = await guild.members.fetch(client.user.id);
    const permissions = channel.permissionsFor(botMember);
    
    console.log('=== REQUIRED PERMISSIONS ===');
    const requiredPerms = {
      'ViewChannel': PermissionFlagsBits.ViewChannel,
      'SendMessages': PermissionFlagsBits.SendMessages,
      'ReadMessageHistory': PermissionFlagsBits.ReadMessageHistory,
      'AddReactions': PermissionFlagsBits.AddReactions,
      'EmbedLinks': PermissionFlagsBits.EmbedLinks,
      'AttachFiles': PermissionFlagsBits.AttachFiles,
      'UseExternalEmojis': PermissionFlagsBits.UseExternalEmojis
    };
    
    let missingPerms = [];
    
    for (const [name, flag] of Object.entries(requiredPerms)) {
      const hasPermission = permissions.has(flag);
      const status = hasPermission ? '✅' : '❌';
      console.log(`${status} ${name}`);
      
      if (!hasPermission) {
        missingPerms.push(name);
      }
    }
    
    if (missingPerms.length > 0) {
      console.log('\n⚠️  MISSING PERMISSIONS:', missingPerms.join(', '));
      console.log('\n🔧 To fix this:');
      console.log('1. Go to your Discord server');
      console.log(`2. Right-click on the "#${channel.name}" channel`);
      console.log('3. Select "Edit Channel" → "Permissions"');
      console.log('4. Add the "Bibleman" bot role or bot user');
      console.log('5. Grant the missing permissions listed above');
      console.log('\nOR use this invite link to re-add the bot with correct permissions:');
      console.log(`https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=274877958144&scope=bot`);
    } else {
      console.log('\n✅ All required permissions are granted!');
    }
    
  } catch (error) {
    console.error('Error checking permissions:', error.message);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);

