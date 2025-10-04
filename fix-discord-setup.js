#!/usr/bin/env node

require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');

async function fixDiscordSetup() {
    console.log('🔧 Discord Bot Setup Fix Tool\n');
    
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

        const guildId = process.env.DISCORD_GUILD_ID;
        const channelId = process.env.DISCORD_CHANNEL_ID;
        const clientId = process.env.DISCORD_CLIENT_ID;

        // Check environment variables
        console.log('📋 Environment Variables:');
        console.log(`   DISCORD_TOKEN: ${process.env.DISCORD_TOKEN ? '✅ Set' : '❌ Missing'}`);
        console.log(`   DISCORD_CLIENT_ID: ${clientId || '❌ Missing'}`);
        console.log(`   DISCORD_GUILD_ID: ${guildId || '❌ Missing'}`);
        console.log(`   DISCORD_CHANNEL_ID: ${channelId || '❌ Missing'}\n`);

        if (!guildId) {
            console.log('❌ DISCORD_GUILD_ID is not set in your .env file');
            console.log('Please add it to your .env file');
            return;
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`❌ Bot is not in guild ${guildId}`);
            console.log('Make sure you have invited the bot to your Discord server!');
            return;
        }

        console.log(`✅ Bot is in guild: ${guild.name} (${guild.id})`);

        // Get bot member and permissions
        const botMember = guild.members.me;
        if (!botMember) {
            console.log('❌ Could not get bot member information');
            return;
        }

        console.log(`✅ Bot member: ${botMember.displayName} (${botMember.id})`);

        // List all channels the bot can see
        console.log('\n📺 Channels the bot can access:');
        console.log('=' .repeat(60));

        let foundTargetChannel = false;
        guild.channels.cache.forEach(channel => {
            const type = ChannelType[channel.type] || 'Unknown';
            const isText = channel.type === ChannelType.GuildText;
            const canSend = channel.permissionsFor(botMember)?.has('SendMessages');
            const canRead = channel.permissionsFor(botMember)?.has('ReadMessageHistory');
            
            console.log(`📝 ${channel.name}`);
            console.log(`   ID: ${channel.id}`);
            console.log(`   Type: ${type}`);
            console.log(`   Can Send Messages: ${canSend ? '✅' : '❌'}`);
            console.log(`   Can Read Messages: ${canRead ? '✅' : '❌'}`);
            
            if (channelId && channel.id === channelId) {
                foundTargetChannel = true;
                console.log(`   🎯 This is your target channel!`);
            }
            console.log('');
        });

        if (channelId && !foundTargetChannel) {
            console.log(`❌ Target channel ${channelId} not found or bot doesn't have access`);
            console.log('Choose a channel from the list above and update your .env file\n');
        }

        // Check bot permissions in target channel
        if (channelId && foundTargetChannel) {
            const channel = guild.channels.cache.get(channelId);
            const permissions = channel.permissionsFor(botMember);
            
            console.log(`\n🔍 Checking permissions in #${channel.name}:`);
            const requiredPermissions = [
                { name: 'Send Messages', bit: PermissionFlagsBits.SendMessages },
                { name: 'Read Message History', bit: PermissionFlagsBits.ReadMessageHistory },
                { name: 'Add Reactions', bit: PermissionFlagsBits.AddReactions },
                { name: 'Use Slash Commands', bit: PermissionFlagsBits.UseSlashCommands },
                { name: 'Embed Links', bit: PermissionFlagsBits.EmbedLinks }
            ];

            let allPermissionsGranted = true;
            requiredPermissions.forEach(perm => {
                const hasPermission = permissions.has(perm.bit);
                console.log(`   ${hasPermission ? '✅' : '❌'} ${perm.name}`);
                if (!hasPermission) allPermissionsGranted = false;
            });

            if (!allPermissionsGranted) {
                console.log('\n❌ MISSING PERMISSIONS!');
                console.log('\n🔧 To fix permissions:');
                console.log('1. Go to your Discord server');
                console.log('2. Right-click the bot user → "Edit Role"');
                console.log('3. Go to "Permissions" tab');
                console.log('4. Enable all the missing permissions listed above');
                console.log('5. Make sure the bot role is positioned above other roles');
                
                if (clientId) {
                    console.log('\n🔗 Or re-invite the bot with proper permissions:');
                    const permissions = '412317240384'; // Calculated permissions
                    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
                    console.log(inviteUrl);
                }
            } else {
                console.log('\n✅ All required permissions are granted!');
            }
        }

        // Bot role information
        console.log('\n👤 Bot Role Information:');
        const roles = botMember.roles.cache.sort((a, b) => b.position - a.position);
        roles.forEach(role => {
            console.log(`   - ${role.name} (${role.id}) - Position: ${role.position}`);
        });

        console.log('\n💡 Next Steps:');
        if (!foundTargetChannel) {
            console.log('1. Choose a channel ID from the list above');
            console.log('2. Update your .env file: DISCORD_CHANNEL_ID=your_channel_id');
            console.log('3. Make sure the bot has permissions in that channel');
        } else if (!allPermissionsGranted) {
            console.log('1. Fix the bot permissions as described above');
            console.log('2. Restart the bot: node src/bot.js');
        } else {
            console.log('1. Your bot setup looks good!');
            console.log('2. Try starting the bot: node src/bot.js');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'TokenInvalid') {
            console.log('\n🔧 Your Discord token is invalid. Please check your .env file.');
        } else if (error.code === 'DisallowedIntents') {
            console.log('\n🔧 Bot intents are not enabled. Please enable them in Discord Developer Portal.');
        }
    } finally {
        client.destroy();
    }
}

fixDiscordSetup();
