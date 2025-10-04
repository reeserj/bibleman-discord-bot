#!/usr/bin/env node

require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

async function checkBotPermissions() {
    console.log('🔍 Checking Discord Bot Permissions...\n');
    
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent
        ]
    });

    try {
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✅ Bot logged in successfully\n');

        // Get the guild (server)
        const guildId = process.env.DISCORD_GUILD_ID;
        const channelId = process.env.DISCORD_CHANNEL_ID;

        if (!guildId || !channelId) {
            console.log('❌ Missing environment variables:');
            console.log(`   DISCORD_GUILD_ID: ${guildId || 'NOT SET'}`);
            console.log(`   DISCORD_CHANNEL_ID: ${channelId || 'NOT SET'}`);
            console.log('\nPlease check your .env file!');
            return;
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`❌ Bot is not in guild ${guildId}`);
            console.log('Make sure the bot is invited to your Discord server!');
            return;
        }

        console.log(`✅ Bot is in guild: ${guild.name} (${guild.id})`);

        // Check channel permissions
        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            console.log(`❌ Channel ${channelId} not found in guild`);
            console.log('Available channels:');
            guild.channels.cache.forEach(ch => {
                console.log(`   - ${ch.name} (${ch.id}) - Type: ${ch.type}`);
            });
            return;
        }

        console.log(`✅ Channel found: #${channel.name} (${channel.id})`);

        // Get bot member in the guild
        const botMember = guild.members.me;
        if (!botMember) {
            console.log('❌ Could not get bot member information');
            return;
        }

        console.log(`✅ Bot member: ${botMember.displayName} (${botMember.id})`);

        // Check permissions
        const permissions = channel.permissionsFor(botMember);
        
        console.log('\n📋 Required Permissions:');
        const requiredPermissions = [
            { name: 'Send Messages', bit: PermissionFlagsBits.SendMessages },
            { name: 'Read Message History', bit: PermissionFlagsBits.ReadMessageHistory },
            { name: 'Add Reactions', bit: PermissionFlagsBits.AddReactions },
            { name: 'Use Slash Commands', bit: PermissionFlagsBits.UseSlashCommands },
            { name: 'Embed Links', bit: PermissionFlagsBits.EmbedLinks },
            { name: 'Attach Files', bit: PermissionFlagsBits.AttachFiles }
        ];

        let allPermissionsGranted = true;
        requiredPermissions.forEach(perm => {
            const hasPermission = permissions.has(perm.bit);
            console.log(`   ${hasPermission ? '✅' : '❌'} ${perm.name}`);
            if (!hasPermission) allPermissionsGranted = false;
        });

        console.log('\n🔧 Bot Role Information:');
        const roles = botMember.roles.cache.sort((a, b) => b.position - a.position);
        roles.forEach(role => {
            console.log(`   - ${role.name} (${role.id}) - Position: ${role.position}`);
        });

        if (!allPermissionsGranted) {
            console.log('\n❌ MISSING PERMISSIONS DETECTED!');
            console.log('\nTo fix this:');
            console.log('1. Go to your Discord server');
            console.log('2. Right-click the bot user → "Edit Role"');
            console.log('3. Go to "Permissions" tab');
            console.log('4. Enable the missing permissions listed above');
            console.log('5. Make sure the bot role is above other roles that might deny permissions');
            console.log('\nOr use this invite link with proper permissions:');
            console.log(`https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=412317240384&scope=bot%20applications.commands`);
        } else {
            console.log('\n✅ All required permissions are granted!');
        }

    } catch (error) {
        console.error('❌ Error checking permissions:', error.message);
        if (error.code === 'TokenInvalid') {
            console.log('\n🔧 Your Discord token is invalid. Please check your .env file.');
        }
    } finally {
        client.destroy();
    }
}

checkBotPermissions();


