# BibleMan Discord Bot

A Discord bot designed to help users track their Bible reading progress. The bot sends daily reading assignments, tracks completion through reactions, and maintains progress records in Google Sheets.

## Features

- 📖 **Daily Reading Messages**: Automatically sends Bible reading assignments at 5 AM CST
- 📊 **Progress Tracking**: Monitors user completion through Discord reactions
- 📈 **Google Sheets Integration**: Stores reading progress data for easy analysis
- 🔗 **Resource Links**: Provides relevant links for each day's reading topic
- ⏰ **Scheduled Delivery**: Reliable daily message delivery using cron scheduling
- 🎨 **Beautiful Formatting**: Rich Discord embeds with organized verse presentation

## Prerequisites

- Node.js 16.0.0 or higher
- Discord Bot Token
- Google Sheets API credentials
- Discord Server with appropriate permissions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bibleman-discord-bot.git
cd bibleman-discord-bot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with the required credentials:
```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_CHANNEL_ID=your_channel_id
GOOGLE_SHEETS_CREDENTIALS=path_to_credentials.json
READING_PLAN_SHEET_ID=your_google_sheet_id
PROGRESS_TRACKING_SHEET_ID=your_progress_sheet_id
```

5. Set up Google Sheets API:
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create service account credentials
   - Share your Google Sheets with the service account email

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
npm test
```

## Configuration

### Discord Bot Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add a bot to your application
4. Copy the bot token and client ID
5. Invite the bot to your server with appropriate permissions

### Google Sheets Setup
1. Create a Google Sheet for reading plans
2. Create a Google Sheet for progress tracking
3. Set up Google Cloud Project and enable Sheets API
4. Create service account and download credentials
5. Share both sheets with the service account email

## Project Structure

```
bibleman/
├── src/
│   ├── bot.js              # Main bot file
│   ├── scheduler.js         # Message scheduling logic
│   ├── sheetsParser.js      # Google Sheets reading plan parser
│   ├── sheetsTracker.js     # Progress tracking in Google Sheets
│   ├── messageFormatter.js  # Discord message formatting
│   └── utils/
│       ├── logger.js        # Logging utilities
│       └── helpers.js       # Helper functions
├── config/
│   └── .env                # Environment variables
├── data/
│   └── credentials.json    # Google API credentials
├── tests/
│   └── bot.test.js         # Test files
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the maintainers.

## Roadmap

- [ ] Web dashboard for progress visualization
- [ ] Multiple reading plan support
- [ ] Reading streak tracking
- [ ] Weekly/monthly progress reports
- [ ] Integration with Bible API for verse lookup
- [ ] Mobile app companion
