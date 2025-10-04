const { PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

// Calculate the permissions the bot needs
const permissions = 
  PermissionFlagsBits.ViewChannel |
  PermissionFlagsBits.SendMessages |
  PermissionFlagsBits.ReadMessageHistory |
  PermissionFlagsBits.AddReactions |
  PermissionFlagsBits.EmbedLinks |
  PermissionFlagsBits.AttachFiles |
  PermissionFlagsBits.UseExternalEmojis |
  PermissionFlagsBits.UseApplicationCommands;

const clientId = process.env.DISCORD_CLIENT_ID;

console.log('=== BIBLEMAN BOT INVITE LINK ===\n');
console.log('Use this link to invite the bot with all required permissions:\n');
console.log(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`);
console.log('\n=== PERMISSIONS INCLUDED ===');
console.log('✅ View Channel');
console.log('✅ Send Messages');
console.log('✅ Read Message History');
console.log('✅ Add Reactions');
console.log('✅ Embed Links');
console.log('✅ Attach Files');
console.log('✅ Use External Emojis');
console.log('✅ Use Application Commands');
console.log(`\nPermissions value: ${permissions}`);


