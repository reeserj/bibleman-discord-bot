#!/bin/bash

echo "🔧 BibleMan Environment Updater"
echo "=============================="
echo ""

# Get Discord Bot Token
echo "📝 Enter your Discord bot token:"
read -p "DISCORD_TOKEN: " discord_token

# Get Discord Client ID
echo ""
echo "📝 Enter your Discord client ID:"
read -p "DISCORD_CLIENT_ID: " discord_client_id

# Get Discord Server ID
echo ""
echo "📝 Enter your Discord server ID:"
read -p "DISCORD_GUILD_ID: " discord_guild_id

# Update .env file
if [ ! -z "$discord_token" ]; then
    sed -i "s/DISCORD_TOKEN=.*/DISCORD_TOKEN=$discord_token/" .env
    echo "✅ Updated DISCORD_TOKEN"
fi

if [ ! -z "$discord_client_id" ]; then
    sed -i "s/DISCORD_CLIENT_ID=.*/DISCORD_CLIENT_ID=$discord_client_id/" .env
    echo "✅ Updated DISCORD_CLIENT_ID"
fi

if [ ! -z "$discord_guild_id" ]; then
    sed -i "s/DISCORD_GUILD_ID=.*/DISCORD_GUILD_ID=$discord_guild_id/" .env
    echo "✅ Updated DISCORD_GUILD_ID"
fi

echo ""
echo "✅ Environment updated successfully!"
echo ""
echo "Current configuration:"
echo "====================="
grep "DISCORD_" .env
echo ""
echo "You can now start the bot with: node src/bot.js"
