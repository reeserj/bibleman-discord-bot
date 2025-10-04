require('dotenv').config();
const SheetsTracker = require('./src/sheetsTracker.js');
const logger = require('./src/utils/logger.js');
const moment = require('moment-timezone');

async function testReactionTracking() {
  console.log('Testing reaction tracking...');
  
  try {
    const tracker = new SheetsTracker();
    await tracker.initialize();
    console.log('✅ SheetsTracker initialized successfully');
    
    // Test writing to sheet with CST time
    const now = moment().tz('America/Chicago');
    const testData = {
      date: now.format('YYYY-MM-DD'),
      userId: '123456789',
      username: 'TestUser',
      messageId: 'test-message-id',
      reactionEmoji: '✅',
      action: 'add',
      timestamp: now.format('YYYY-MM-DD HH:mm:ss'),
      cstTime: now.format('YYYY-MM-DD HH:mm:ss CST'),
      reaction: {
        message: {
          guild: null // Mock reaction object
        }
      }
    };
    
    console.log('Writing test data to sheet...');
    console.log('Sheet ID from env:', process.env.READING_PLAN_SHEET_ID);
    console.log('Sheet ID from tracker:', tracker.readingPlanSheetId);
    await tracker.writeReactionToSheet(testData);
    console.log('✅ Test data written successfully');
    
  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testReactionTracking();
