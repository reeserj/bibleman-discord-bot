const express = require('express');
const logger = require('./utils/logger');

class WebhookServer {
  constructor(bot) {
    this.app = express();
    this.bot = bot;
    this.port = process.env.WEBHOOK_PORT || 3000;
    
    // Middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.setupRoutes();
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // GroupMe webhook endpoint
    this.app.post('/webhook/groupme', (req, res) => {
      this.handleGroupMeWebhook(req, res);
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({ 
        message: 'BibleMan Webhook Server', 
        status: 'running',
        endpoints: ['/health', '/webhook/groupme']
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  async handleGroupMeWebhook(req, res) {
    try {
      const groupMeMessage = req.body;
      
      logger.info('Received GroupMe webhook:', {
        groupId: groupMeMessage.group_id,
        userId: groupMeMessage.user_id,
        text: groupMeMessage.text?.substring(0, 100) + (groupMeMessage.text?.length > 100 ? '...' : ''),
        type: groupMeMessage.type
      });

      // Only process text messages, ignore system messages
      if (groupMeMessage.type === 'text') {
        await this.bot.handleGroupMeMessage(groupMeMessage);
      }

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ received: true });
      
    } catch (error) {
      logger.error('Error handling GroupMe webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (error) => {
        if (error) {
          logger.error('Failed to start webhook server:', error);
          reject(error);
        } else {
          logger.info(`Webhook server started on port ${this.port}`);
          logger.info(`Health check: http://localhost:${this.port}/health`);
          logger.info(`GroupMe webhook: http://localhost:${this.port}/webhook/groupme`);
          resolve();
        }
      });
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('Webhook server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = WebhookServer;
