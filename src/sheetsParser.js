const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const logger = require('./utils/logger');

class SheetsParser {
  constructor() {
    this.initialized = false;
    this.sheets = null;
    this.auth = null;
  }

  async initialize() {
    try {
      // Load credentials
      const credentialsPath = path.join(__dirname, '..', 'data', 'credentials.json');
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Create auth client
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
      
      // Create sheets client
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      
      this.initialized = true;
      logger.info('SheetsParser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SheetsParser:', error);
      throw error;
    }
  }

  async getTodaysReadingPlan(date) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const sheetId = process.env.READING_PLAN_SHEET_ID;
      const sheetName = process.env.READING_PLAN_SHEET_NAME || '2026 plan';
      
      logger.debug(`Getting reading plan for ${date} from sheet ${sheetId}`);
      
      // Read the entire sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:K` // Read all columns
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        logger.warn('No data found in reading plan sheet');
        return null;
      }
      
      // Find the row for today's date
      const targetDate = date;
      let readingPlan = null;
      
      for (let i = 1; i < rows.length; i++) { // Skip header row
        const row = rows[i];
        if (row[0] === targetDate) { // Date is in column A
          readingPlan = this.parseReadingPlanRow(row);
          break;
        }
      }
      
      if (!readingPlan) {
        logger.warn(`No reading plan found for date: ${date}`);
        return null;
      }
      
      logger.info(`Found reading plan for ${date}: ${readingPlan.due}`);
      return readingPlan;
      
    } catch (error) {
      logger.error('Error getting today\'s reading plan:', error);
      throw error;
    }
  }

  parseReadingPlanRow(row) {
    // Map columns based on the sheet structure:
    // Date | Message | Due | Reading | Day | Bonus Text | | Start of Book | 10 min Bible | Bible Project | Bonus
    return {
      date: row[0] || '',
      message: row[1] || '',
      due: row[2] || '',
      reading: parseInt(row[3]) || 0,
      day: parseInt(row[4]) || 0,
      bonusText: row[5] || '',
      startOfBook: row[7] || '',
      tenMinBible: row[8] || '',
      bibleProject: row[9] || '',
      bonus: row[10] || ''
    };
  }

  async getAllReadingPlans() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const sheetId = process.env.READING_PLAN_SHEET_ID;
      const sheetName = process.env.READING_PLAN_SHEET_NAME || '2026 plan';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A:K`
      });
      
      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        return [];
      }
      
      // Parse all rows except header
      const readingPlans = [];
      for (let i = 1; i < rows.length; i++) {
        const readingPlan = this.parseReadingPlanRow(rows[i]);
        if (readingPlan.date) {
          readingPlans.push(readingPlan);
        }
      }
      
      logger.info(`Retrieved ${readingPlans.length} reading plans`);
      return readingPlans;
      
    } catch (error) {
      logger.error('Error getting all reading plans:', error);
      throw error;
    }
  }

  async validateSheetStructure() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const sheetId = process.env.READING_PLAN_SHEET_ID;
      const sheetName = process.env.READING_PLAN_SHEET_NAME || '2026 plan';
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1:K1` // Just the header row
      });
      
      const headers = response.data.values?.[0] || [];
      const expectedHeaders = ['Date', 'Message', 'Due', 'Reading', 'Day', 'Bonus Text', '', 'Start of Book', '10 min Bible', 'Bible Project', 'Bonus'];
      
      // Check if we have the minimum required headers
      const hasRequiredHeaders = headers.length >= 5 && 
        headers[0] === 'Date' && 
        headers[1] === 'Message' && 
        headers[2] === 'Due';
      
      if (!hasRequiredHeaders) {
        logger.error('Sheet structure validation failed: Missing required headers');
        return false;
      }
      
      logger.info('Sheet structure validation passed');
      return true;
      
    } catch (error) {
      logger.error('Error validating sheet structure:', error);
      return false;
    }
  }
}

module.exports = SheetsParser;
