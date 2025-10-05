# BibleMan Discord Bot - Startup Scripts

This directory contains scripts to run the BibleMan Discord bot independently without Cursor.

## Available Scripts

### 1. `start-bot.sh` - Simple Bot Startup
A straightforward script that starts the bot with all necessary checks.

**Usage:**
```bash
./start-bot.sh
```

**Features:**
- ✅ Checks for Node.js and npm installation
- ✅ Validates .env file exists
- ✅ Installs dependencies if needed
- ✅ Validates environment variables
- ✅ Starts the bot with proper error handling
- ✅ Colored output for better readability

### 2. `run-bot-service.sh` - Service Management
A more advanced script for running the bot as a background service.

**Usage:**
```bash
# Start the bot as a service
./run-bot-service.sh start

# Stop the bot
./run-bot-service.sh stop

# Restart the bot
./run-bot-service.sh restart

# Check bot status
./run-bot-service.sh status

# View live logs
./run-bot-service.sh logs

# Show help
./run-bot-service.sh help
```

**Features:**
- 🔄 Process management (start/stop/restart)
- 📝 Automatic logging to `logs/bot.log`
- 🆔 PID file management
- 📊 Status checking
- 📋 Live log viewing
- 🛡️ Graceful shutdown handling

## Prerequisites

Before running either script, make sure you have:

1. **Node.js installed** (version 14 or higher)
2. **npm installed** (usually comes with Node.js)
3. **Environment file** (`.env`) with proper configuration
4. **Dependencies installed** (scripts will install automatically if needed)

## Setup Instructions

1. **Configure your bot:**
   ```bash
   node setup.js
   ```
   This will create your `.env` file with the necessary configuration.

2. **Choose your startup method:**
   
   **For development/testing:**
   ```bash
   ./start-bot.sh
   ```
   
   **For production/service:**
   ```bash
   ./run-bot-service.sh start
   ```

## Environment Variables Required

Make sure your `.env` file contains:

```env
DISCORD_TOKEN=your_actual_bot_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_server_id
DISCORD_CHANNEL_ID=your_channel_id
# ... other configuration
```

## Troubleshooting

### Bot won't start
- Check if Node.js is installed: `node --version`
- Verify `.env` file exists and has correct values
- Check if dependencies are installed: `npm install`

### Service management issues
- Check bot status: `./run-bot-service.sh status`
- View logs: `./run-bot-service.sh logs`
- Force restart: `./run-bot-service.sh restart`

### Permission issues
- Make sure scripts are executable: `chmod +x *.sh`
- Check file permissions on `.env` file

## Log Files

- **Service logs:** `logs/bot.log`
- **Console output:** Available when using `start-bot.sh`

## Security Notes

- Never commit your `.env` file to version control
- Keep your Discord bot token secure
- Use the service script for production deployments
- Monitor logs regularly for any issues

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure your Discord bot has proper permissions in your server
4. Check that your bot token is valid and not expired

