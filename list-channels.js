#!/usr/bin/env node

require('dotenv').config();
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

async function listChannels() {
    console.log('📋 Listing Discord Server Channels...\n');
    
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
        const guild = client.guilds.cache.get(guildId);
        
        if (!guild) {
            console.log(`❌ Bot is not in guild ${guildId}`);
            return;
        }

        console.log(`🏠 Server: ${guild.name} (${guild.id})\n`);
        console.log('📺 Available Channels:');
        console.log('=' .repeat(60));

        guild.channels.cache
            .sort((a, b) => a.position - b.position)
            .forEach(channel => {
                const type = ChannelType[channel.type] || 'Unknown';
                const isText = channel.type === ChannelType.GuildText;
                const canSend = channel.permissionsFor(guild.members.me)?.has('SendMessages');
                
                console.log(`📝 ${channel.name}`);
                console.log(`   ID: ${channel.id}`);
                console.log(`   Type: ${type}`);
                console.log(`   Can Send Messages: ${canSend ? '✅' : '❌'}`);
                console.log('');
            });

        console.log('💡 Copy the channel ID you want to use and update your .env file:');
        console.log('DISCORD_CHANNEL_ID=your_channel_id_here');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        client.destroy();
    }
}

listChannels();


