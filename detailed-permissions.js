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
    const guildId = process.env.DISCORD_GUILD_ID;
    const channelId = process.env.DISCORD_CHANNEL_ID;
    
    const guild = await client.guilds.fetch(guildId);
    const channel = await client.channels.fetch(channelId);
    const botMember = await guild.members.fetch(client.user.id);
    
    console.log('=== DETAILED PERMISSION ANALYSIS ===\n');
    console.log(`Server: "${guild.name}"`);
    console.log(`Channel: "#${channel.name}"`);
    console.log(`Bot: ${client.user.tag}\n`);
    
    console.log('--- BOT ROLES ---');
    botMember.roles.cache.forEach(role => {
      console.log(`  ${role.name} (ID: ${role.id})`);
    });
    
    console.log('\n--- SERVER-LEVEL PERMISSIONS (from roles) ---');
    const serverPerms = botMember.permissions;
    console.log(`  Administrator: ${serverPerms.has(PermissionFlagsBits.Administrator) ? '✅' : '❌'}`);
    console.log(`  SendMessages: ${serverPerms.has(PermissionFlagsBits.SendMessages) ? '✅' : '❌'}`);
    
    console.log('\n--- CHANNEL-LEVEL PERMISSIONS (final result) ---');
    const channelPerms = channel.permissionsFor(botMember);
    console.log(`  ViewChannel: ${channelPerms.has(PermissionFlagsBits.ViewChannel) ? '✅' : '❌'}`);
    console.log(`  SendMessages: ${channelPerms.has(PermissionFlagsBits.SendMessages) ? '✅' : '❌'}`);
    console.log(`  EmbedLinks: ${channelPerms.has(PermissionFlagsBits.EmbedLinks) ? '✅' : '❌'}`);
    console.log(`  AttachFiles: ${channelPerms.has(PermissionFlagsBits.AttachFiles) ? '✅' : '❌'}`);
    console.log(`  AddReactions: ${channelPerms.has(PermissionFlagsBits.AddReactions) ? '✅' : '❌'}`);
    
    console.log('\n--- CHANNEL PERMISSION OVERWRITES ---');
    const overwrites = channel.permissionOverwrites.cache;
    if (overwrites.size === 0) {
      console.log('  No permission overwrites in this channel');
    } else {
      overwrites.forEach((overwrite, id) => {
        const target = overwrite.type === 0 ? `Role: ${guild.roles.cache.get(id)?.name || id}` : `Member: ${id}`;
        console.log(`\n  ${target}:`);
        console.log(`    Allowed: ${overwrite.allow.bitfield}`);
        console.log(`    Denied: ${overwrite.deny.bitfield}`);
        
        // Check if this is affecting the bot
        if (overwrite.type === 1 && id === botMember.id) {
          console.log('    ⚠️  This is a DIRECT override for the bot!');
        }
        botMember.roles.cache.forEach(role => {
          if (id === role.id) {
            console.log(`    ⚠️  This affects the bot's "${role.name}" role!`);
          }
        });
      });
    }
    
    console.log('\n=== RECOMMENDATION ===');
    if (!channelPerms.has(PermissionFlagsBits.SendMessages)) {
      console.log('The bot still cannot send messages. This could be because:');
      console.log('1. The @everyone role has "Send Messages" DENIED in this channel');
      console.log('2. One of the bot\'s roles has "Send Messages" DENIED');
      console.log('3. The bot user needs a direct permission override in the channel\n');
      console.log('Try this: Add a permission override specifically for the BOT USER (not role) in #bible-plan');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_TOKEN);

