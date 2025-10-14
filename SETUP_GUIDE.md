# BibleMan Bot Dynamic DNS Setup Guide

## Your Configuration
- **Domain:** `biblemanbot.duckdns.org`
- **Public IP:** `216.147.127.241`
- **Local IP:** `192.168.1.43`
- **Port:** `3000`

## Step 1: Router Port Forwarding Setup

### Access Your Router
1. Open web browser and go to your router's admin panel:
   - Usually: `http://192.168.1.1` or `http://192.168.0.1`
   - Check router label for default IP/credentials

### Configure Port Forwarding
1. Look for "Port Forwarding", "Virtual Server", or "NAT" settings
2. Add new port forwarding rule:
   - **Service Name:** BibleMan Webhook
   - **External Port:** 3000
   - **Internal Port:** 3000
   - **Internal IP:** `192.168.1.43`
   - **Protocol:** TCP
   - **Enable:** Yes
   - **Save** the configuration

## Step 2: Test Your Setup

### Local Test (Should Work)
```bash
curl http://localhost:3000/health
```

### External Test (After Port Forwarding)
```bash
curl http://biblemanbot.duckdns.org:3000/health
```

### Test Webhook Endpoint
```bash
curl -X POST http://biblemanbot.duckdns.org:3000/webhook/groupme \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": "test",
    "name": "Test User", 
    "text": "Test message",
    "user_id": "123",
    "created_at": 1640995200,
    "type": "text"
  }'
```

## Step 3: GroupMe Bot Configuration

### Set Callback URL
In your GroupMe bot settings, set the callback URL to:
```
http://biblemanbot.duckdns.org:3000/webhook/groupme
```

### Required Environment Variables
Add these to your `.env` file:
```env
ENABLE_WEBHOOK_SERVER=true
WEBHOOK_PORT=3000
GROUPME_BIBLE_PLAN_GROUP_ID=your_group_id_here
GROUPME_LOCKERROOM_GROUP_ID=your_lockerroom_group_id_here
DISCORD_LOCKERROOM_CHANNEL_ID=your_lockerroom_channel_id_here
```

## Step 4: Start Your Bot

### Start with Webhook Server
```bash
cd /home/reese/.cursor/Bibleman
ENABLE_WEBHOOK_SERVER=true npm start
```

### Or use the background method
```bash
ENABLE_WEBHOOK_SERVER=true WEBHOOK_PORT=3000 node src/bot.js &
```

## Step 5: Automatic DNS Updates

Your DNS update script is already configured and running via cron job (every 5 minutes).

### Manual DNS Update
```bash
./scripts/update-dns.sh
```

### Check Cron Job
```bash
crontab -l
```

## Troubleshooting

### Port Forwarding Issues
1. **Check router settings:** Ensure port 3000 is forwarded to `192.168.1.43`
2. **Firewall:** Check if your laptop firewall is blocking port 3000
3. **ISP blocking:** Some ISPs block common ports

### DNS Issues
1. **Check DNS resolution:**
   ```bash
   nslookup biblemanbot.duckdns.org
   ```
2. **Manual DNS update:**
   ```bash
   ./scripts/update-dns.sh
   ```

### Bot Issues
1. **Check if bot is running:**
   ```bash
   ps aux | grep node
   ```
2. **Check webhook server:**
   ```bash
   ss -tlnp | grep 3000
   ```

## Security Notes

1. **Firewall:** Consider setting up a firewall to only allow necessary connections
2. **HTTPS:** For production, consider setting up HTTPS with Let's Encrypt
3. **Authentication:** Consider adding webhook authentication if needed

## Next Steps

1. Set up router port forwarding
2. Test external connectivity
3. Configure GroupMe bot callback URL
4. Test two-way communication between Discord and GroupMe

## Support

If you encounter issues:
1. Check the logs in your terminal
2. Verify all environment variables are set
3. Test each component individually
4. Check router and firewall settings


