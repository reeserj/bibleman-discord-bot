const { OpenAI } = require('openai');
const logger = require('./utils/logger');

class AIService {
  constructor() {
    this.openai = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!process.env.VENICE_API_KEY) {
        throw new Error('VENICE_API_KEY environment variable is required');
      }

      this.openai = new OpenAI({
        apiKey: process.env.VENICE_API_KEY,
        baseURL: 'https://api.venice.ai/api/v1'
      });

      this.initialized = true;
      logger.info('AIService initialized successfully with Venice AI');
    } catch (error) {
      logger.error('Failed to initialize AIService:', error);
      throw error;
    }
  }

  async generateBookSummary(bookName, chapterRange = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!bookName || !bookName.trim()) {
        logger.warn('No book name provided for AI summary');
        return null;
      }

      // Create a prompt for the AI to generate a book summary
      const prompt = this.createBookSummaryPrompt(bookName, chapterRange);
      
      logger.debug(`Generating AI summary for: ${bookName}${chapterRange ? ` (${chapterRange})` : ''}`);

      const response = await this.openai.chat.completions.create({
        model: "qwen3-4b", // Venice Small - fast and cost-efficient for summaries
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise, engaging summaries of Bible books and chapters for high school boys. Focus on key themes, important stories, and spiritual insights. Emphasize practical life application and how the scripture applies to their daily lives. Use bullet points when possible to make content easy to scan. Keep summaries brief but informative, suitable for a daily Bible reading Discord bot."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      let summary = response.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        logger.warn('No summary generated from Venice AI');
        return null;
      }

      // Clean up thinking tags if present
      summary = this.cleanThinkingTags(summary);

      logger.info(`AI summary generated for ${bookName}`);
      return summary;

    } catch (error) {
      logger.error('Error generating AI book summary:', error);
      return null;
    }
  }

  createBookSummaryPrompt(bookName, chapterRange) {
    let prompt = `Provide a brief, engaging summary of the book of ${bookName}`;
    
    if (chapterRange) {
      prompt += `, specifically covering ${chapterRange}`;
    }
    
    prompt += `. Include key themes, important stories, and spiritual insights. Focus on practical life application for high school boys - how can they apply this scripture to their daily lives? Use bullet points when possible to make it easy to scan. Keep it concise (2-3 sentences) and suitable for a daily Bible reading context.`;
    
    return prompt;
  }

  async generateChapterSummary(bookName, chapterNumber) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!bookName || !chapterNumber) {
        logger.warn('Book name and chapter number required for chapter summary');
        return null;
      }

      const prompt = `Provide a brief summary of ${bookName} chapter ${chapterNumber}. Include the main events, key themes, and spiritual insights. Focus on practical life application for high school boys - how can they apply this scripture to their daily lives? Use bullet points when possible to make it easy to scan. Keep it concise (1-2 sentences) for a daily Bible reading context.`;

      const response = await this.openai.chat.completions.create({
        model: "qwen3-4b", // Venice Small - fast and cost-efficient for summaries
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides concise, engaging summaries of Bible chapters for high school boys. Focus on key events, themes, and spiritual insights. Emphasize practical life application and how the scripture applies to their daily lives. Use bullet points when possible to make content easy to scan. Keep summaries brief but informative."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      });

      let summary = response.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        logger.warn('No chapter summary generated from Venice AI');
        return null;
      }

      // Clean up thinking tags if present
      summary = this.cleanThinkingTags(summary);

      logger.info(`AI chapter summary generated for ${bookName} ${chapterNumber}`);
      return summary;

    } catch (error) {
      logger.error('Error generating AI chapter summary:', error);
      return null;
    }
  }

  // Extract book name from reading assignment (e.g., "Genesis 1-3" -> "Genesis")
  extractBookName(readingAssignment) {
    if (!readingAssignment || typeof readingAssignment !== 'string') {
      return null;
    }

    // Remove common prefixes and extract the first word (book name)
    const cleaned = readingAssignment.trim();
    const bookName = cleaned.split(' ')[0];
    
    // Validate it's a reasonable book name (at least 3 characters, no numbers)
    if (bookName && bookName.length >= 3 && !/\d/.test(bookName)) {
      return bookName;
    }

    return null;
  }

  // Extract chapter range (e.g., "Genesis 1-3" -> "1-3")
  extractChapterRange(readingAssignment) {
    if (!readingAssignment || typeof readingAssignment !== 'string') {
      return null;
    }

    const match = readingAssignment.match(/\d+(?:-\d+)?/);
    return match ? match[0] : null;
  }

  // Clean up thinking tags from Venice AI responses
  cleanThinkingTags(text) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Remove <think>...</think> tags and their content
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    
    // If the cleaned text is empty or very short, return the original
    if (cleaned.length < 10) {
      return text;
    }
    
    return cleaned;
  }
}

module.exports = AIService;
