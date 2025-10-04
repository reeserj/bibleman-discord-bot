const fs = require('fs').promises;
const path = require('path');
const logger = require('./utils/logger');

class GuildConfig {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'data', 'guild-config.json');
    this.config = {};
  }

  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(data);
      logger.info('Guild configuration loaded');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create empty config
        this.config = {};
        await this.save();
        logger.info('Created new guild configuration file');
      } else {
        logger.error('Error loading guild config:', error);
        throw error;
      }
    }
  }

  async save() {
    try {
      const dir = path.dirname(this.configPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
      logger.info('Guild configuration saved');
    } catch (error) {
      logger.error('Error saving guild config:', error);
      throw error;
    }
  }

  getChannelId(guildId) {
    return this.config[guildId]?.channelId || null;
  }

  async setChannelId(guildId, channelId) {
    if (!this.config[guildId]) {
      this.config[guildId] = {};
    }
    this.config[guildId].channelId = channelId;
    this.config[guildId].updatedAt = new Date().toISOString();
    await this.save();
    logger.info(`Set channel ${channelId} for guild ${guildId}`);
  }

  async removeGuild(guildId) {
    delete this.config[guildId];
    await this.save();
    logger.info(`Removed guild ${guildId} from configuration`);
  }

  getAllGuilds() {
    return Object.keys(this.config);
  }

  getGuildConfig(guildId) {
    return this.config[guildId] || null;
  }
}

module.exports = GuildConfig;


