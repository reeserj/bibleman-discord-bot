const moment = require('moment-timezone');
const logger = require('./logger');

class Helpers {
  /**
   * Validate environment variables
   * @returns {Object} Validation result
   */
  static validateEnvironment() {
    const required = [
      'DISCORD_TOKEN',
      'DISCORD_CLIENT_ID',
      'DISCORD_GUILD_ID',
      'DISCORD_CHANNEL_ID',
      'READING_PLAN_SHEET_ID'
    ];

    const missing = [];
    const config = {};

    for (const varName of required) {
      const value = process.env[varName];
      if (!value) {
        missing.push(varName);
      } else {
        config[varName] = value;
      }
    }

    return {
      isValid: missing.length === 0,
      missing,
      config
    };
  }

  /**
   * Get current date in specified timezone
   * @param {string} timezone - Timezone (default: America/Chicago)
   * @returns {string} Date in YYYY-MM-DD format
   */
  static getCurrentDate(timezone = 'America/Chicago') {
    return moment().tz(timezone).format('YYYY-MM-DD');
  }

  /**
   * Parse progress percentage from message
   * @param {string} message - Message containing progress
   * @returns {number|null} Progress percentage or null
   */
  static parseProgressPercentage(message) {
    if (!message) return null;
    
    const match = message.match(/(\d+\.?\d*)%/);
    return match ? parseFloat(match[1]) : null;
  }

  /**
   * Extract URLs from text
   * @param {string} text - Text to extract URLs from
   * @returns {Array} Array of URLs
   */
  static extractUrls(text) {
    if (!text) return [];
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format date for display
   * @param {string} date - Date string
   * @param {string} timezone - Timezone
   * @returns {string} Formatted date
   */
  static formatDate(date, timezone = 'America/Chicago') {
    return moment(date).tz(timezone).format('MMMM Do, YYYY');
  }

  /**
   * Calculate days between dates
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {number} Number of days
   */
  static daysBetween(startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  }

  /**
   * Retry function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Function result
   */
  static async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Generate a random string
   * @param {number} length - Length of string
   * @returns {string} Random string
   */
  static generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Check if string is empty or whitespace
   * @param {string} str - String to check
   * @returns {boolean} True if empty or whitespace
   */
  static isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  /**
   * Truncate string to specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated string
   */
  static truncate(str, length, suffix = '...') {
    if (!str || str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after sleep
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Helpers;
